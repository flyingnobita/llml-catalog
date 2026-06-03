# Continuation note — model card scraping pipeline

> Superseded: This historical scraping-pipeline handoff was completed on 2026-05-11.
> Use [README.md](README.md) for the current repository entry point and
> [dev-docs/PROJECT-STATUS.md](dev-docs/PROJECT-STATUS.md) for the current roadmap.

## What was built

A `scripts/scrape_catalog.py` pipeline that crawls model card sites, extracts LLM parameter profiles via LLM, and writes portable TOML files into `profiles/`.

**Architecture:**
- `scripts/scrape_catalog.py` — main entry point (CLI: `[url]`, `--site`, `--single`, `--dry-run`)
- `scripts/profile_schema.py` — Pydantic models matching portable profile format v2 (`PortableProfile`, `ProfileDocument`, `ProfileEnv`, etc.)
- `scripts/post_filters.py` — strips model-location params (--model, -m, --hf-repo, etc.) per backend; drops profiles with empty args
- `scripts/toml_writer.py` — confidence-gated output (high → `profiles/`, medium → `profiles/` with `# REVIEW:`, low → `profiles/.review/`), dedup grouping by `(name, backend)`, atomic writes
- `sites.toml` — per-site crawl config with `extraction_hints` prepended as `CONTEXT:` to the LLM prompt
- `.github/workflows/scrape-catalog.yml` — weekly CI (Wednesday 8:37 AM UTC), opens PR via `peter-evans/create-pull-request@v7`

**LLM provider:** Uses Crawl4AI's `LLMConfig` / LiteLLM under the hood. Provider selected via `LLML_EXTRACT_PROVIDER` env var (defaults to `openai/gpt-4o`). Separate API key env vars per provider (`OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `DEEPSEEK_API_KEY`) with `LLML_EXTRACT_API_KEY` as fallback. Falls back to `ollama/llama3.1` if no keys found.

## Key design decisions

1. **Extraction instruction split:** Global `EXTRACTION_INSTRUCTION` in `scrape_catalog.py` is generic. Site-specific naming conventions and page structure hints live in `sites.toml`'s `extraction_hints` field. At runtime, hints are prepended: `CONTEXT: {hints}\n\n{instruction}`.

2. **Args as panel-row strings:** TOML output stores args as `["--flag value", ...]` strings (panel-row format), not tokenized arrays. The writer converts back from tokens via `_to_panel_rows()`.

3. **Post-filtering after extraction:** Model-location params are stripped in post-processing (`post_filters.py`), not in the extraction prompt. The extraction instruction tells the LLM to exclude them too (belt and suspenders). Empty-args profiles are dropped.

4. **Dedup grouping:** Multiple profiles sharing the same `(name, backend)` key are written into one TOML file as separate `[[profiles]]` entries rather than overwriting each other.

## Extraction quality iterations (Qwen3.6 page)

The extraction instruction went through several revisions to fix quality issues:

**Original problems:**
- Generic profile names ("4-bit GPU", "8-bit GPU") instead of model variant + mode
- Some profiles had zero args (useless)
- Code blocks were missed (thinking/non-thinking variants not all captured)

**Fixes applied:**
1. `EXTRACTION_INSTRUCTION` changed from "one profile per hardware tier" to "one profile per code block"
2. Naming rule changed from "include quantization in name" to "ModelVariant-mode[-quantization]"
3. `filter_profiles()` in `post_filters.py` now drops profiles where `not p.args`
4. `max_tokens` bumped from 2000 → 6000 → 16000 (DeepSeek was hitting `finish_reason: length`)

**Result on Qwen3.6:** 12 profiles extracted, all high confidence, names like `Qwen3.6-27B-thinking-UD-Q4_K_XL`, `Qwen3.6-35B-A3B-non-thinking-UD-Q4_K_XL`, all with substantive args.

## Unsloth-specific hints in sites.toml

The unsloth `extraction_hints` in `sites.toml` currently reads:

```
Unsloth model card pages. Extract one profile per code block — do not skip or merge.
Name profiles as: ModelVariant-mode[-quantization] using the section heading for the variant.
  - Variant: from page heading (e.g. "Qwen3.6-27B", "Qwen3.6-35B-A3B").
  - Mode: "thinking" or "non-thinking" based on the code block's section and presence of --chat-template-kwargs enable_thinking.
  - Quantization: append if named (e.g. "-Q4_K_XL", "-Q8_0").
  - NEVER use generic names like "4-bit GPU" or "8-bit GPU".
Sections alternate between Thinking mode (llama-cli) and Non-thinking mode (llama-server) with General tasks and Coding/Reasoning subsections.
Hardware requirements are in tables or prose near the code blocks.
```

## Problems encountered with gemma-4

Tested `--single https://unsloth.ai/docs/models/gemma-4` and got 11 profiles (6 high, 5 medium). Issues:

1. **Inconsistent naming pattern:** Some profiles start with `llama.cpp-` prefix (`llama.cpp-26B-A4B-chat`), others with `gemma-4-` prefix (`gemma-4-26B-A4B-it llama-cli HF`). The hints say `ModelVariant-mode-quant` but the LLM is mixing backend-first vs model-first patterns.

2. **Missing thinking/non-thinking pairs:** Only 2 of 11 profiles have thinking mode indicated (`llama-server-31B-thinking-disabled`, `gemma-4-26B-A4B-it server thinking enabled`), and they're singles, not pairs. The hint "Sections alternate between Thinking mode (llama-cli) and Non-thinking mode (llama-server)" is Qwen3.6-specific and may be misleading for gemma-4.

3. **Lower confidence:** 5 of 11 profiles are medium confidence (vs 12/12 high for Qwen3.6), suggesting the LLM is inferring more from prose when the page structure doesn't match the hints.

**Root cause:** The `extraction_hints` describe Qwen3.6's page structure (llama-cli/llama-server alternation, General/Coding subsections) as if it's universal across all unsloth model pages. Gemma-4 likely has a different structure.

## Uncommitted files

| File | Status |
|------|--------|
| `scripts/scrape_catalog.py` | new — main entry point |
| `scripts/profile_schema.py` | new — Pydantic models |
| `scripts/post_filters.py` | new — model-location stripping, empty-args filter |
| `scripts/toml_writer.py` | new — confidence-gated TOML output |
| `scripts/__init__.py` | new — package init |
| `sites.toml` | new — site config with unsloth hints |
| `.github/workflows/scrape-catalog.yml` | new — CI weekly scrape |
| `profiles/Qwen3.6-*.toml` | new — 12 extracted profiles (last run) |
| `.gitignore` | modified — added Python/scraping exclusions |
| `README.md` | modified — added scraping pipeline docs |
| `mise.toml` | modified — added `uv = "latest"` tool |
| `dev-docs` | modified — submodule dirty (from earlier spec/plan work) |

---

## Session 2 — Cross-page generalization and bulk profile extraction

### Problem

The `extraction_hints` in `sites.toml` described Qwen3.6's page structure as if universal. On other unsloth pages (Kimi-K2.6, GLM-5.1, Nemotron, Qwen3.5, etc.) this caused:
- Wrong names (backend-first like `llama-cli-...`, generic like `4-bit-gpu`)
- Missed variants (page uses numbered tutorial steps, not flat H3 sections)
- Low confidence (LLM inferring from prose because hints didn't match actual structure)

### Pipeline changes (committed in `319713d`)

**`sites.toml`** — Rewrote `extraction_hints` to be page-agnostic. Dropped Qwen3.6-specific assumptions ("sections alternate between Thinking mode (llama-cli) and Non-thinking mode (llama-server)"). New hints anchor on universals: H1 → ModelFamily, "Llama.cpp Guide" section → launch invocations, presence of sampling flags to distinguish launch blocks from install/build/chat-template blocks.

**`scripts/scrape_catalog.py`** — Three changes to `EXTRACTION_INSTRUCTION`:
- Rule 1: explicit skip list for non-launch code blocks (install, build, chat-template, download)
- Rule 7: rewritten as `ModelFamily[-Variant][-mode][-quantization]` with each segment optional; variant can be inferred from GGUF filename or `--model` path when no heading carries it
- Rule 9 (new): skip code blocks with no launch flags beyond `--model`/`-m`

**`scripts/profile_schema.py`** — Fixed `name` field description that leaked bad naming examples (`'4-bit-gpu'`, `'cpu-only'`) into the LLM's JSON schema. Also tightened `model_hint` description.

**`scripts/post_filters.py`** — Added args-based content deduplication. After stripping model-location params, profiles with identical `(backend, sorted(args))` collapse to one, keeping the richer metadata via `_metadata_score()`.

### DeepSeek API reliability

The DeepSeek API (`deepseek/deepseek-v4-pro` via `LLML_EXTRACT_PROVIDER`) worked for the first two pages (Qwen3.6: 82s, Gemma-4: 89s) then began returning empty responses. Background jobs hung indefinitely (45+ min, 1.24s CPU time). All subsequent extractions were done manually by Claude applying the extraction rules directly from fetched page content.

**Convention:** Profiles extracted via the DeepSeek API carry a `-deepseekapi` suffix in their filename (e.g. `Qwen3.6-27B-thinking-UD-Q4_K_XL-deepseekapi.toml`) to distinguish them from manually-verified ones. The internal `name` field is unchanged.

### Profile naming conventions established

- `ModelFamily[-Variant][-mode][-quantization]`
- Variant: size/MoE designator (`27B`, `35B-A3B`, `26B-A4B`) or named sub-model (`Reasoning`). Omit when page documents only one variant.
- mode: `thinking`/`non-thinking` only when the page explicitly distinguishes them (via headings or `--chat-template-kwargs enable_thinking`). Omit otherwise.
- Server variants (with `--port 8001` / `--alias`) live as additional `[[profiles]]` blocks in the **same TOML file** as the corresponding non-server profile; they get `"server"` in `use_case.tags` and share the same `name`.
- `non-thinking-reasoning` = non-thinking mode (no budget tokens) with reasoning-style sampling (temp 1.0) — distinct from `non-thinking` (temp 0.7/0.8). Used by Qwen3.5 pages that show both.

### New profiles added (committed in `76d7947`)

| Model | Files | Notes |
|---|---|---|
| Qwen3.5 (5 variants) | 19 files | 9B / 27B / 35B-A3B / 122B-A10B / 397B-A17B; thinking, non-thinking, coding, server |
| Kimi-K2.6 | 2 files | thinking (vision) + non-thinking; 350GB+ RAM |
| GLM-5.1 | 2 files | chat + terminal-bench; server in same file |
| Nemotron-3-Nano-Omni-30B-A3B-Reasoning | 1 file | vision/multimodal; server in same file |
| Nemotron-3-Nano (4B, 30B-A3B) | 2 files | chat + tool-calling + server variants |
| Ministral-3 (14B-instruct, 14B-reasoning) | 2 files | separate files for instruct vs reasoning sub-models |
| IBM-Granite-4-H-Small | 1 file | MoE + Mamba architecture; `--jinja` required |
| Qwen3-Coder-Next | 2 files | llama (3 profiles) + vllm FP8-Dynamic |
| GPT-OSS (20B, 120B) | 2 files | reasoning/agentic; 120B uses `-ot` MoE expert offload to CPU |
| Qwen3.6 (re-extracted) | 11 files | improved model_hint, removed duplicate local block |
| Gemma-4 (re-extracted) | 5 files | improved model_hint (`"gemma-4"` not GGUF path), server consolidated into vision file |

### Current state

All profiles committed. `dev-docs` submodule and `CONTINUATION.md` remain unstaged.

---

## Session 3 — 2026-05-11: Site data loader, org metadata, docs sync

### What shipped

- **Live TOML data loader** — `site/src/data/profiles.js` now reads `profiles/*.toml` at
  build time via `import.meta.glob`. All 6 hardcoded sample stubs removed.
- **Org metadata** — `model_org` and `profile_org` fields added to all 63 profiles.
  Browse page gained two new filter columns (Model org, Profile org).
- **Pipeline improvements:**
  - `CacheMode.BYPASS` → `CacheMode.ENABLED` for incremental crawls
  - `scrape_catalog.py` stamps `model_org`/`profile_org` from site config onto extracted profiles
  - `toml_writer.py` writes `provenance`, scans `.review/` for dedup, handles review-to-main upgrades
  - `sites.toml` — added ollama.com/library and huggingface.co/models site configs
- **Docs synced** — CHANGELOG bumped to 0.0.2.0, BACKLOG.md and site plan checked off,
  README cache_mode fixed, stale continuation state resolved
- **dev-docs submodule** — plan items marked done, open design questions resolved

### Commits

- `ad0c1bc` feat: add live profile data loader, org metadata, and new site configs
- `bd2eb06` chore: update dev-docs submodule (mark scrape-catalog plan items done)
