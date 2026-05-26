#!/usr/bin/env bash
# Run from llml-catalog root. Bumps dev-docs in catalog + launcher via llml-internal script.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
INTERNAL_ROOT="${LLML_INTERNAL_ROOT:-$ROOT/dev-docs}"
SCRIPT="$INTERNAL_ROOT/scripts/bump_parent_dev_docs_submodules.sh"

if [[ ! -f "$SCRIPT" ]]; then
	echo "dev-docs-bump-parents: missing $SCRIPT" >&2
	echo "Update the dev-docs submodule (needs llml-internal scripts/), then retry." >&2
	exit 1
fi

exec "$SCRIPT" \
	--catalog "$ROOT" \
	--launcher "${LLML_LAUNCHER_ROOT:-$ROOT/../llm-launcher}" \
	"$@"
