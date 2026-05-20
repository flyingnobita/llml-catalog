# Changelog

- May-20, 2026 - 04:36 PM +08:00 - Remove obsolete untracked task 'Interactive profile configuration' from dashboard.html
- May-20, 2026 - 04:23 PM +08:00 - Fix leading indentation bug in task scope modal caused by template literal formatting and pre-wrap CSS
- May-20, 2026 - 04:19 PM +08:00 - Integrate interactive roadmap and architecture view into dashboard.html from dev-docs/PROJECT-STATUS.md
- May-20, 2026 - 04:16 PM +08:00 - Separate llml and llml-catalog tasks in project status dashboard using a split-column layout

## [0.0.2.0] - 2026-05-11

### Added
- Model card scraping pipeline (`scripts/scrape_catalog.py`) — crawls unsloth.ai, extracts LLM profiles via LLM, writes portable TOML
- 63 profiles across 20 model families (Qwen3.5, Qwen3.6, Gemma-4, Kimi-K2.6, GLM-5.1, Nemotron-3, Ministral-3, GPT-OSS, Granite-4, Qwen3-Coder-Next)
- Live TOML data loader — browse page reads `profiles/*.toml` at build time instead of hardcoded stubs
- `model_org` and `profile_org` metadata on all profiles with filter columns on browse
- `sites.toml` with unsloth.ai, ollama.com/library, and huggingface.co/models crawl configs
- CI workflow (`.github/workflows/scrape-catalog.yml`) — weekly scheduled scrape, opens PR with new profiles
- CI deploy workflow (`.github/workflows/deploy.yml`) — Astro build + GitHub Pages deploy on push to main
- GitHub Pages configured with Actions-based deployment at `https://flyingnobita.github.io/llml-catalog/`
- CI validation workflow (`.github/workflows/validate-profiles.yml`) — TOML syntax + schema validation on PRs touching `profiles/*.toml`
- Capabilities filter on browse page — filter by `use_case.tags` (thinking, reasoning, instruct, non-thinking, vision, coding, etc.)
- Browse filter state persistence via `sessionStorage` — filters, search, and sort survive back/forward navigation

### Changed
- Scraping pipeline now uses incremental crawl (`CacheMode.ENABLED`) instead of full re-fetch per run
- TOML writer handles `.review/` dedup and upgrades (low-confidence → main)

## [0.0.1.0] - 2026-05-08

### Added
- Dark mode with theme toggle in the navigation bar — switches between light and dark color schemes
- OS preference detection — first visit automatically matches your system light/dark setting
- Theme persistence via localStorage — your preference is remembered across visits
- Cross-tab theme sync — changing theme in one tab updates all open tabs
- Smooth color transitions when switching themes (respects `prefers-reduced-motion`)

### Changed
- All pages now use CSS design tokens instead of hardcoded colors for consistent theming
- Badge tones (success, warning, error, info) now use `color-mix()` for adaptive backgrounds
- ImportBlock and ContributeCTA sections use semantic surface tokens for dark mode compatibility
