# llml profile catalog

Community-contributed parameter profiles for [llml](https://github.com/flyingnobita/llm-launcher) — the terminal UI for discovering and launching local LLMs.

A **profile** is a named set of launch arguments and environment variables for a specific model, backend, and hardware configuration. You create one in `llml` once, export it here so others with the same setup can import it instead of reconstructing the command from scratch.

## Repository layout

```
profiles/           one .toml file per profile; PRs add new profiles here
site/               static catalog site source (Astro/11ty/Hugo — TBD)
design/             design system: colors, type, components, prototypes
docs/               contributing guide, profile validation rules
.github/workflows/  CI: validate incoming profiles, build + deploy site
```

## Profile format

Profiles use the portable TOML format defined in
[`llml/docs/profile-format.md`](https://github.com/flyingnobita/llm-launcher/blob/main/docs/profile-format.md).

A minimal profile looks like:

```toml
schema_version = 2
name           = "llama-3-8b-q4-rtx4090"
backend        = "llama_cpp"
model_hint     = "Meta-Llama-3-8B-Instruct.Q4_K_M.gguf"

[use_case]
task     = "chat"
context  = "8192"

[hardware]
gpu_vram_gb = 24
os          = "linux"

[args]
"--n-gpu-layers" = "99"
"--ctx-size"     = "8192"
```

## Adding a profile

1. Export your working profile from `llml` (portable export — see `llml` README).
2. Place the `.toml` file in `profiles/`.
3. Open a PR. CI validates the schema before merge.

## Importing a profile

```bash
# Using the built-in import flow (llml v0.x+)
llml import profiles/llama-3-8b-q4-rtx4090.toml

# Or via the agent skill
# see .agents/skills/llml-import in the llml repo
```

## Scraping pipeline

An automated pipeline extracts profiles from model card sites (unsloth.ai, etc.) and writes portable TOML files into `profiles/`.

### Quick start

```bash
# Install dependencies
pip install crawl4ai pydantic tomli tomli-w
playwright install chromium

# Extract all model pages from unsloth.ai
export OPENAI_API_KEY="sk-..."
python scripts/scrape_catalog.py --site unsloth

# Single model page
python scripts/scrape_catalog.py --single https://unsloth.ai/docs/models/qwen3.6

# Dry run — extract but don't write files
python scripts/scrape_catalog.py --dry-run --site unsloth
```

### CLI flags

| Flag | Default | Description |
|---|---|---|
| `[url]` | — | Base URL (e.g. `https://unsloth.ai/docs/models/`). Looks up site config by hostname |
| `--site ID` | — | Site ID from `sites.toml` (e.g. `unsloth`) |
| `--single URL` | — | Single model page URL. Skips discovery, extracts directly |
| `--max-pages N` | `50` | Maximum pages to crawl in discovery mode |
| `--dry-run` | off | Crawl and extract but don't write TOML files |

Exactly one of `[url]`, `--site`, or `--single` is required.

### LLM provider

Set `LLML_EXTRACT_PROVIDER` to choose the model. Defaults to `openai/gpt-4o`. Any [LiteLLM](https://docs.litellm.ai) provider string works.

| Env var | Default | Description |
|---|---|---|
| `LLML_EXTRACT_PROVIDER` | `openai/gpt-4o` | Provider and model for extraction |
| `OPENAI_API_KEY` | — | API key when using OpenAI |
| `ANTHROPIC_API_KEY` | — | API key when using Anthropic (`LLML_EXTRACT_PROVIDER=anthropic/claude-sonnet-4-6`) |
| `DEEPSEEK_API_KEY` | — | API key when using DeepSeek (`LLML_EXTRACT_PROVIDER=deepseek/deepseek-v4-pro`) |
| `LLML_EXTRACT_API_KEY` | — | Fallback API key for any provider not listed above |
| `OLLAMA_API_BASE` | `http://localhost:11434` | Ollama endpoint (handled by LiteLLM; `LLML_EXTRACT_PROVIDER=ollama/llama3.1:70b`) |

No key set? Falls back to `ollama/llama3.1` — requires Ollama running locally.

### Extraction knobs

Hardcoded in `scrape_catalog.py`. Adjust in-code if needed:

| Knob | Value | Description |
|---|---|---|
| `temperature` | `0` | Deterministic extraction |
| `max_tokens` | `6000` | Max tokens in LLM response |
| `page_timeout` | `60000` ms | Page load timeout |
| `word_count_threshold` | `1` | Skip pages with ≤1 word |
| `cache_mode` | `BYPASS` | No caching between runs |

### sites.toml

Site-specific crawl config. Add a `[site.<id>]` block for each target:

| Field | Required | Description |
|---|---|---|
| `base_url` | yes | Starting URL for crawl |
| `url_pattern` | yes | Glob pattern matching model page URLs (e.g. `/docs/models/.+`) |
| `max_depth` | no (default: `1`) | BFS crawl depth |
| `max_pages` | no (default: `50`) | Max pages to crawl |
| `extraction_hints` | no | Site-specific context prepended to the LLM extraction instruction |

### Output

Profile confidence gates the destination:

| Confidence | Destination | Review needed? |
|---|---|---|
| High | `profiles/*.toml` | No |
| Medium | `profiles/*.toml` with `# REVIEW:` comments | Yes |
| Low | `profiles/.review/*.toml` | Yes — full manual review |

Other output paths:

| Path | Purpose |
|---|---|
| `profiles/.review/.failed/` | URLs that produced zero extractable profiles |
| `profiles/.review/.pipeline-log.jsonl` | Structured run log (timestamp, action, profile, URL, detail) |

A CI workflow (`.github/workflows/scrape-catalog.yml`) runs weekly and opens a PR with new profiles.

## License

Profiles are released under [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) — public domain, no attribution required.
Site source and design assets are MIT.
