# llml-catalog — session handoff

This document brings a fresh LLM up to speed on the catalog website project.
Read this file, then read `design/README.md` in this repo before writing any code.

---

## What this project is

`llml` (`flyingnobita/llml`) is an open-source terminal UI (TUI) for discovering
local LLM model files (GGUF, safetensors, Ollama) and launching them with named
parameter profiles via llama.cpp, vLLM, KoboldCpp, or Ollama.

The **profile catalog** is llml's main differentiator — a community-contributed
registry of portable TOML parameter profiles that users can browse and import into
their local llml install. Each profile encodes a backend, a model hint, launch
args/env, and structured `use_case` + `hardware` metadata so the catalog can answer:
**"will this profile work on my machine?"**

---

## Repo layout

```
flyingnobita/llml                    — Go TUI binary (do not touch for catalog work)
  docs/profile-format.md             — portable profile TOML schema (the data contract)

flyingnobita/llml-catalog            — THIS REPO — catalog data + site
  profiles/                          — one .toml per community profile (currently empty)
  site/                              — static site source (framework not yet chosen)
  design/                            — full design system (read this first)
    README.md                        — voice, casing, color/type tokens, component list
    colors_and_type.css              — color palette + type tokens
    preview/*.html                   — component previews (cards, badges, buttons, etc.)
    prototype/*.jsx                  — full React prototype of all pages
    ui_kits/profile-catalog/*.jsx    — cleaned component kit
  docs/                              — contributing guide (placeholder)
  .github/workflows/                 — CI: validate profiles, build + deploy site
```

---

## What was done this session

1. **Repo layout decided**: catalog lives in its own repo (`flyingnobita/llml-catalog`),
   not inside the main `llml` Go repo. Reasons: Go CI stays Go-only; profile
   contributors clone a small repo without the Go toolchain; release cadences are
   independent; `docs/profile-format.md` in llml is the stable one-way schema contract.

2. **`flyingnobita/llml-catalog` created** on GitHub and pushed with:
   - `profiles/`, `site/`, `docs/`, `.github/workflows/` directory skeleton
   - `design/` — full design system migrated from a previous worktree
   - `README.md` and `.gitignore`

3. **`llm-launcher` product repo updated** (`AGENTS.md`, `README.md`,
   `dev-docs/PROJECT-STATUS.md`) to point at `llml-catalog` as the canonical home
   for catalog + site work.

4. **Old `website-worktree` branch** in the llml repo was torn down (design assets
   are now in `llml-catalog/design/`).

---

## What is NOT done yet (next session's work)

### Open decisions (pick these first)

1. **Static-site framework** — Astro, 11ty, Hugo, or Next.js static export.
   The design uses JSX components (`design/prototype/`, `design/ui_kits/`), which
   points toward Astro (MDX + JSX islands) or Next static export. Recommend Astro
   for a catalog with mostly-static pages + a client-side filter island.

2. **Hosting target** — GitHub Pages (free, simple) or Cloudflare Pages (faster CDN,
   better preview deployments). Either works with a static build.

3. **Custom domain** — or start with `flyingnobita.github.io/llml-catalog`?

4. **Search/filter** — client-side index (Pagefind, Fuse.js) vs. build-time facets
   vs. defer until enough profiles exist to matter.

5. **Profile validation CI** — a linter that validates `.toml` files in `profiles/`
   against the portable profile schema on every PR.

6. **Seed profiles** — which 3–5 profiles ship with the catalog at launch so it
   doesn't open empty?

### Pages to build

From the design prototype (`design/prototype/` and `design/ui_kits/`):

| Page | File | Notes |
|------|------|-------|
| Home / landing | `Home.jsx` | Hero, feature pitch, CTA to browse |
| Browse / search | `Browse.jsx` | Card grid, filter sidebar |
| Profile detail | `ProfileDetail.jsx` | Full TOML view, import instructions, hardware badge |
| Compare tray | `Compare.jsx` | Side-by-side two profiles |
| Contribute | `Contribute.jsx` | How-to guide for submitting a profile |

The `design/preview/*.html` files show the individual component tokens (color, type,
spacing, badges, cards, buttons) — open these in a browser to see what you're
implementing.

---

## Hard constraints (do not deviate without user approval)

- **No server, no auth, no accounts in the MVP.** The catalog is a static site backed
  by a GitHub-based TOML store.
- **Profiles are the product** — metadata (backend, quant, hardware, use case) is
  primary content, not decoration.
- **GitHub provenance always visible** — source path, last-updated date, "edit on
  GitHub" link on every profile detail page.
- **Voice:** direct, precise, builder-facing. No hype adjectives. See `design/README.md`
  for exact tone examples and casing rules.

---

## Profile format (the data unit)

A minimal profile (from `llml/docs/profile-format.md`):

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

The full schema is at `https://github.com/flyingnobita/llml/blob/main/docs/profile-format.md`.
The site's browse/filter/detail pages are all built around these fields.

---

## Where to start in a new session

1. Read `design/README.md` (voice, casing, color tokens, component list).
2. Open `design/preview/` HTML files in a browser to see the visual system.
3. Scan `design/prototype/Browse.jsx` and `design/ui_kits/profile-catalog/Browse.jsx`
   to understand the card/filter layout you will be implementing.
4. Decide on static-site framework (Astro recommended — ask user).
5. Scaffold the `site/` directory with the chosen framework.
6. Build pages in order: Home → Browse → Profile detail → Contribute.
