"""TOML writer for portable profile documents.

Confidence-gated output:
- high   → profiles/{name}.toml
- medium → profiles/{name}.toml with # REVIEW: comments
- low    → profiles/.review/{name}.toml

Writes atomically via temp file + os.rename().
"""

import hashlib
import json
import os
import tempfile
from pathlib import Path

import tomli_w

from scripts.profile_schema import PortableProfile, ProfileDocument

PROFILES_DIR = Path("profiles")
REVIEW_DIR = PROFILES_DIR / ".review"
FAILED_DIR = REVIEW_DIR / ".failed"
PIPELINE_LOG = REVIEW_DIR / ".pipeline-log.jsonl"


def _profile_to_dict(profile: PortableProfile, include_confidence: bool = False) -> dict:
    """Convert a PortableProfile to a dict suitable for TOML serialization."""
    d: dict = {
        "name": profile.name,
        "backend": profile.backend,
    }
    if profile.model_hint:
        d["model_hint"] = profile.model_hint
    if profile.args:
        # Store as panel-row strings (flag+value in one string) per format spec
        d["args"] = _to_panel_rows(profile.args)
    if profile.env:
        d["env"] = [{"key": e.key, "value": e.value} for e in profile.env]

    # use_case
    uc: dict = {}
    if profile.use_case.primary:
        uc["primary"] = profile.use_case.primary
    if profile.use_case.tags:
        uc["tags"] = profile.use_case.tags
    if uc:
        d["use_case"] = uc

    # hardware
    hw: dict = {}
    if profile.hardware.class_:
        hw["class"] = profile.hardware.class_
    if profile.hardware.gpu_count is not None:
        hw["gpu_count"] = profile.hardware.gpu_count
    if profile.hardware.min_vram_gb is not None:
        hw["min_vram_gb"] = profile.hardware.min_vram_gb
    if profile.hardware.max_vram_gb is not None:
        hw["max_vram_gb"] = profile.hardware.max_vram_gb
    if profile.hardware.notes:
        hw["notes"] = profile.hardware.notes
    if hw:
        d["hardware"] = hw

    if include_confidence:
        d["confidence"] = profile.confidence

    return d


def _to_panel_rows(args: list[str]) -> list[str]:
    """Convert tokenized args back to panel-row strings.

    The portable TOML format stores args as panel-row strings like
    '--n-gpu-layers 80', not as individual tokens. This converts
    token lists back to panel rows.
    """
    rows: list[str] = []
    i = 0
    while i < len(args):
        arg = args[i]
        if arg.startswith("-") and i + 1 < len(args) and not args[i + 1].startswith("-"):
            rows.append(f"{arg} {args[i + 1]}")
            i += 2
        else:
            rows.append(arg)
            i += 1
    return rows


def _profile_hash(profile: PortableProfile) -> str:
    """Stable hash of a profile's content for dedup."""
    d = _profile_to_dict(profile, include_confidence=False)
    raw = json.dumps(d, sort_keys=True)
    return hashlib.sha256(raw.encode()).hexdigest()[:12]


def _dedup_key(profile: PortableProfile) -> str:
    """Dedup key: (name, backend)."""
    return f"{profile.name}::{profile.backend}"


def _load_existing_keys() -> dict[str, str]:
    """Scan profiles/*.toml and return {dedup_key: filepath}."""
    existing: dict[str, str] = {}
    if not PROFILES_DIR.exists():
        return existing
    for f in PROFILES_DIR.glob("*.toml"):
        try:
            import tomllib
        except ImportError:
            import tomli as tomllib
        try:
            with open(f, "rb") as fh:
                data = tomllib.load(fh)
            for p in data.get("profiles", []):
                key = f"{p.get('name', '')}::{p.get('backend', '')}"
                existing[key] = str(f)
        except Exception:
            continue
    return existing


def _write_toml(path: Path, content: str) -> None:
    """Atomic write via temp file + rename."""
    path.parent.mkdir(parents=True, exist_ok=True)
    fd, tmp = tempfile.mkstemp(dir=str(path.parent), prefix=f".{path.name}.")
    try:
        os.write(fd, content.encode())
        os.fsync(fd)
    finally:
        os.close(fd)
    os.rename(tmp, str(path))


def _log(action: str, profile_name: str, url: str, detail: str = "") -> None:
    """Append a structured log entry."""
    PIPELINE_LOG.parent.mkdir(parents=True, exist_ok=True)
    import time
    entry = {
        "ts": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "action": action,
        "profile": profile_name,
        "url": url,
        "detail": detail,
    }
    with open(PIPELINE_LOG, "a") as f:
        f.write(json.dumps(entry) + "\n")


def write_profiles(
    profiles: list[PortableProfile],
    source_url: str = "",
    existing_keys: dict[str, str] | None = None,
) -> dict[str, list[str]]:
    """Write profiles to TOML files with confidence gating and dedup.

    Profiles are grouped by (name, backend) so that multiple profiles
    sharing the same name are written into one TOML file as separate
    [[profiles]] entries.

    Returns {"written": [...], "skipped": [...], "review": [...]}.
    """
    if existing_keys is None:
        existing_keys = _load_existing_keys()

    result: dict[str, list[str]] = {"written": [], "skipped": [], "review": []}

    # Group profiles by (name, backend) so same-name profiles co-exist in one file
    from collections import defaultdict

    groups: dict[str, list[PortableProfile]] = defaultdict(list)
    for profile in profiles:
        key = _dedup_key(profile)
        groups[key].append(profile)

    for key, group in groups.items():
        fname = f"{group[0].name}.toml"
        confidence = max(
            (p.confidence for p in group),
            key=lambda c: {"high": 3, "medium": 2, "low": 1}.get(c, 0),
        )

        # Dedup against existing files
        if key in existing_keys:
            existing_path = Path(existing_keys[key])
            if existing_path.exists():
                # Name collision with different content — suffix all profiles in group
                new_name = f"{group[0].name}-alt"
                for p in group:
                    p.name = new_name
                fname = f"{new_name}.toml"
                _log("write_collision", group[0].name, source_url, f"suffixed to {new_name}")

        # Confidence gating
        if confidence == "low":
            out_dir = REVIEW_DIR
            result["review"].append(fname)
            action = "write_review"
        elif confidence == "medium":
            out_dir = PROFILES_DIR
            result["written"].append(fname)
            action = "write_medium"
        else:
            out_dir = PROFILES_DIR
            result["written"].append(fname)
            action = "write_high"

        # Build TOML with all profiles in the group
        doc = ProfileDocument(profiles=list(group))
        toml_str = _build_toml(doc, confidence)
        _write_toml(out_dir / fname, toml_str)
        _log(action, group[0].name, source_url, f"{len(group)} profiles")

    return result


def _build_toml(doc: ProfileDocument, confidence: str) -> str:
    """Build TOML string with optional REVIEW comments for medium confidence."""
    data: dict = {"schema_version": doc.schema_version, "profiles": []}
    for p in doc.profiles:
        pd = _profile_to_dict(p, include_confidence=False)
        data["profiles"].append(pd)

    toml_str = tomli_w.dumps(data)

    if confidence == "medium":
        lines = toml_str.split("\n")
        out: list[str] = []
        for line in lines:
            out.append(line)
            if line.startswith("[[profiles]]"):
                out.append(
                    "# REVIEW: fields inferred from prose — verify before importing"
                )
        toml_str = "\n".join(out)

    return toml_str
