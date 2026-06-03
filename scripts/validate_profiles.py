#!/usr/bin/env python3
"""Validate profile TOML files against the portable profile schema."""

import sys
import tomllib
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from profile_schema import ProfileDocument
from post_filters import SERVER_BINDING_PARAMS


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

    for i, profile in enumerate(doc.profiles):
        prefix = f"{path}: [{i}]"
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
