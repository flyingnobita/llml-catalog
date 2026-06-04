# Changelog

- Jun-04, 2026 - 07:49 AM UTC - Add Umami Cloud analytics: page-view tracking script in BaseLayout and ~30 custom click events across all pages (install/copy CTAs, profile interactions, filter usage, compare flow, contribution links)
- Jun-03, 2026 - 05:20 AM UTC - Add dismissible "catalog is growing" announcement bar (paper-2 strip under nav, localStorage persistence, no-flash pre-paint hide) linking to GitHub Watch, plus a README note about ongoing profile curation
- Jun-03, 2026 - 12:33 PM +0800 - [Browse Import CTA now jumps directly to the profile import block while keeping profile names linked to the full profile page]
- Jun-03, 2026 - 12:20 PM +0800 - [Smoke test fixes: keep Browse profile and Import links same-origin, add regression coverage, and make Contribute Contents links highlight the active hash section]
- Jun-03, 2026 - 02:12 AM +0800 - [Launch hardening: replace the broken sample import URL, add immutable GitHub provenance links, repair contribution instructions, and publish root-domain browser-test coverage]
- Jun-03, 2026 - 02:12 AM +0800 - [CI: run 178 Playwright tests against the root-domain preview before Pages deployment, use pre-installed Chrome on GitHub-hosted runners, and tolerate rate-limited live URL assertions]
- Jun-02, 2026 - 09:40 PM +08:00 - Add one-line curl | sh installer script at llml.dev/install.sh and promote it in the homepage hero
- Jun-02, 2026 - 01:35 PM +0800 - Configure custom domain llml.dev: update Astro site config, remove base sub-path, and update all catalog and profile import URLs
- May-28, 2026 - Fix navigation icon order and "Open a PR" button links; add profile contribution PR template
- May-28, 2026 - You can now browse the catalog on your phone. All 5 pages adapt to mobile (≤700px) and tablet (701–1024px) viewports with an off-canvas filter drawer and card layout on browse. Navigate with keyboard shortcuts — press `?` to see them all, `gb`/`gh` to jump between pages. Warmer slate-blue primary (#3D6DA8) and 123 Playwright tests
- May-26, 2026 - Replace standalone /compare page with slide-up overlay tray on browse (2+ profiles checked), with comparison grid, diff highlighting, and 14 Playwright tests; remove /compare nav entry
- May-26, 2026 - [Add cross-repo dev-docs pin check (CI + mise) and bump-parents script via llml-internal]
- May-22, 2026 - 12:15 AM +08:00 - Add /how page with problem-first story arc, shared TOML data module, ImportBlock progressive enhancement, mobile overflow fixes, and full Playwright coverage (66 tests)
- May-21, 2026 - 10:18 PM +08:00 - Update GitHub Actions to Node 24-native action versions and remove the FORCE_JAVASCRIPT_ACTIONS_TO_NODE24 workaround
- May-21, 2026 - 10:10 PM +08:00 - Upgrade the site toolchain to pnpm 11 and Astro 6, preserving allowed native builds and fixing profile loading during static prerender
- May-20, 2026 - 04:38 PM +08:00 - Add a copy title button (14px icon + padding) with a "Copied!" tooltip confirmation (including file:// protocol fallback) to task cards on the active board in dashboard.html
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
