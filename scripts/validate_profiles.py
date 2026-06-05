#!/usr/bin/env python3
"""Validate profile TOML files against the portable profile schema."""

import sys
import tomllib
from pathlib import Path

_SCRIPTS_DIR = Path(__file__).resolve().parent
_REPO_ROOT = _SCRIPTS_DIR.parent
sys.path.insert(0, str(_REPO_ROOT))
sys.path.insert(0, str(_SCRIPTS_DIR))
from profile_schema import ProfileDocument
from post_filters import SERVER_BINDING_PARAMS

CANONICAL_PRIMARY = {"general", "eval"}


def validate_file(path: str) -> list[str]:
    errors: list[str] = []

    try:
        with open(path, "rb") as f:
            raw = tomllib.load(f)
    except tomllib.TOMLDecodeError as e:
        return [f"{path}: invalid TOML — {e}"]
    except OSError as e:
        return [f"{path}: {e}"]

    try:
        doc = ProfileDocument.model_validate(raw)
    except Exception as e:
        errors.append(f"{path}: schema validation failed — {e}")
        return errors

    if raw.get("schema_version") != 3:
        errors.append(f"{path}: schema_version must be 3")

    for i, profile in enumerate(doc.profiles):
        prefix = f"{path}: [{i}]"
        raw_profile = (raw.get("profiles") or [{}])[i]
        raw_use_case = raw_profile.get("use_case") or {}
        raw_primary = raw_use_case.get("primary", [])
        if isinstance(raw_primary, str):
            errors.append(f"{prefix}: use_case.primary must be an array")
            raw_primary_values = [raw_primary]
        else:
            raw_primary_values = raw_primary or []
        for primary in raw_primary_values:
            if str(primary).strip().lower() not in CANONICAL_PRIMARY:
                errors.append(
                    f"{prefix}: use_case.primary '{primary}' is not canonical — "
                    "use general or eval"
                )
        if not profile.name.strip():
            errors.append(f"{prefix}: name is empty")
        if not profile.backend.strip():
            errors.append(f"{prefix}: backend is empty")
        if not profile.args:
            errors.append(f"{prefix}: args is empty — profile has no launch parameters")
        for arg in profile.args:
            flag = arg.split()[0] if arg.split() else ""
            if flag in SERVER_BINDING_PARAMS:
                errors.append(
                    f"{prefix}: arg '{arg}' is launcher-owned — "
                    f"remove {'/'.join(sorted(SERVER_BINDING_PARAMS))} from profiles"
                )
        if not profile.model_hint.strip():
            errors.append(f"{prefix}: model_hint is empty")

    return errors


def main() -> int:
    if len(sys.argv) < 2:
        print("Usage: validate_profiles.py <file.toml> [...]", file=sys.stderr)
        return 2

    exit_code = 0
    for path in sys.argv[1:]:
        if not Path(path).exists():
            print(f"{path}: file not found", file=sys.stderr)
            exit_code = 1
            continue
        for error in validate_file(path):
            print(error, file=sys.stderr)
            exit_code = 1

    if exit_code == 0:
        print(f"OK — {len(sys.argv) - 1} file(s) valid")

    return exit_code


if __name__ == "__main__":
    sys.exit(main())
