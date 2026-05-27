# llml Design System

> Visual + interaction system for the **llml profile catalog** — a hybrid marketing /
> catalog browser / profile detail site for the `llml` local-LLM launcher ecosystem.

## What is llml?

`llml` ("LLM Launcher") is an open-source terminal UI that scans a developer's
machine for local model files (GGUF, Hugging Face safetensors), detects installed
runtimes (**llama.cpp**, **vLLM**, **Ollama**, **KoboldCpp**), and launches them
with named, saved parameter profiles. Users press one key and the right command
runs against the right model on the right backend.

The **profile catalog** site documented in this design system is the portable,
shareable layer on top of that: a browsable registry of TOML-based parameter
profiles (`schema_version = 2`) that users can import into their local `llml`
install. Every profile encodes a backend, a model hint, runtime args/env, and
structured `use_case` + `hardware` metadata so the catalog can answer one
question fast: **"will this profile run well on my machine?"**

## Sources

- **Product repo:** `flyingnobita/llml` (GitHub, default branch `main`)
  - `README.md` — product overview, key bindings, runtime detection rules
  - `docs/profile-format.md` — portable profile TOML schema (the catalog's data unit)
  - `assets/llml-screenshot.png` — terminal TUI reference (imported here)
- **Brief:** `Design System - llml Profile Catalog` (in-chat brief, 2026-05-06)
  defines pages, color/type tokens, spacing, motion, and component inventory.

## Strategic frame

- **Lead with fit, not popularity.** The first question is "will this work on my
  machine?" — not "what's trending?"
- **Treat metadata as product.** Backend, quant, hardware target, OS, use case,
  and import path are core visual content, not chrome.
- **Catalog pages stay strict.** Marketing breathes; browse/compare/detail
  optimize for speed and confidence.
- **GitHub provenance is always visible.** Source path, last update, contribution
  link belong above the fold on detail pages.

---

## Content fundamentals

### Voice
Direct, precise, builder-facing. Reads like serious software for people who
already know what `--n-gpu-layers` does. No hype, no AI-slop adjectives, no
"unleash your potential."

### Tone examples (good → bad)
- ✅ "Optimized for 24GB NVIDIA cards with KoboldCpp and longer context."
- ❌ "High performance, blazing fast inference."
- ✅ "Built for Apple Silicon laptop use with tighter memory constraints."
- ❌ "Unleash the power of your Mac."
- ✅ "Press `R` to launch. The generated command is shown before execution."
- ❌ "One-click magic — we handle the rest!"

### Casing
- **Headlines:** sentence case. `Find the profile that fits your model and machine.`
- **Section labels / nav:** Title Case (`Browse Profiles`, `How It Works`).
- **Buttons:** sentence case, verb-first (`Import profile`, `Copy command`).
- **Technical names:** preserve original casing — `llama.cpp`, `vLLM`, `KoboldCpp`,
  `Ollama`, `GGUF`, `safetensors`. Wrap in mono when shown as identifiers.

### Pronouns
- **You** for the reader. Never "we" in product copy unless attributing to
  maintainers ("we test against the Hugging Face cache layout").
- No "I" voice anywhere.

### Emoji
The product README uses ✨🚀⌨️⚙️💻❤️📄 as section markers. The **catalog site**
itself does not — emoji is too informal for a registry. Use the existing
typographic system (serif section openers, mono labels) instead.

### Unicode
Acceptable inline as low-key separators or status glyphs: `·` (middle dot)
between metadata, `→` for flow, `↑↓` for sort. Avoid decorative arrows in body copy.

### Vibe in one line
"It feels like reading a runtime spec from someone who's actually run the model."

---

## Visual foundations

### Color
- **Restrained palette.** Warm paper neutrals (`#F3F1EA → #D8D2C4`) carry most
  surface area; ink (`#111318`) and slate (`#1A1F27`) carry text and dense
  panels. Operative blue `#3D6DA8` is reserved for active state, key CTAs, and
  import — never decoration, never wallpaper.
- **Semantic colors are functional only:** success `#1EBC73`, warning `#C98512`,
  error `#D84B45`, info = primary blue. Compatibility badges are tinted, not
  saturated; color groups facts but never dominates.
- **Dark mode preserves hierarchy, not inversion.** Background `#111318`,
  elevated `#1A1F27`, border `#2C323D`. Accent saturation drops ~10% so the
  blue still reads as signal, not glow.
- **No purple gradients. No rainbow badge soup.** Ever.

### Type
- **Display / hero / page openers:** `Instrument Serif` — italic optional, used
  sparingly to punctuate, never inside dense UI.
- **Body / UI / labels:** `Instrument Sans` for everything navigational and
  conversational.
- **Data / facts / commands:** `IBM Plex Mono` for backend names, hardware
  specs, version strings, import commands, file paths, and stable-width numbers.
- Line lengths: ~68ch for long-form, tighter (40–52ch) inside cards and docs.
- Serif **never** appears in result rows, filter chips, or table cells.

### Spacing
8px base. Scale: `2xs(4) xs(8) sm(12) md(16) lg(24) xl(32) 2xl(48) 3xl(64) 4xl(96)`.
Marketing pages breathe at `2xl`/`3xl`; catalog pages tighten to `sm`/`md` between
rows. Filters and facts are *neatly packed*, not cramped — vertical rhythm in
result rows is `sm`, not `lg`.

### Backgrounds
- Default surface: warm paper `#F3F1EA`.
- Section fills alternate with `#E7E1D4` to mark transitions on marketing pages.
- Catalog pages stay on a single surface and let borders + spacing carry the
  hierarchy.
- **No** gradient blobs, mesh gradients, or noise textures. **No** full-bleed
  decorative photography. Hero artifact = a real product surface (search +
  filter + result + import block), not an illustration.

### Borders & dividers
1px solid `#D8D2C4` (light) / `#2C323D` (dark). Used between result rows, around
cards, between metadata cells in the facts grid. No double borders, no glow.

### Cards
Square or `md` (8px) radius. 1px border. **No drop shadow** as the default — paper
neutrals + a hairline border do the lifting. Reserve a single soft elevation
(`0 1px 0 rgba(17,19,24,0.04), 0 8px 24px -12px rgba(17,19,24,0.12)`) for the
sticky compare tray and the import-confirmation toast only.

### Corner radii
- `sm` 4px — chips, badges, inputs
- `md` 8px — cards, panels, buttons
- `lg` 12px — modals, sheets
- `xl` 18px — hero callouts only
- `full` 9999px — pill toggles only (rare)

### Hover / press
- Buttons: hover = `color-mix(in oklch, currentColor 8%, transparent)` overlay,
  border darkens one step.
- Press: 1px translate-y, no shrink, no bouncy spring.
- Rows: hover background = `#E7E1D4`, no border movement, no elevation change.
- Links: underline appears on hover; color stays the same until the link is
  active/visited.

### Focus
2px solid `#3D6DA8` outline with 2px offset. Always visible on keyboard focus.
Never `outline: none` without a replacement.

### Motion
Minimal-functional only.
- Easing: enter `cubic-bezier(0.22, 1, 0.36, 1)`, exit `ease-in`, move `ease-in-out`.
- Duration: 80 / 180 / 280 / 420 ms.
- Used for: filter application (180), compare tray reveal (280), card
  expansion (280), copy confirmation (80 in, 280 hold).
- Banned: scroll theatrics, parallax, floating blob loops, springy toy motion.

### Transparency / blur
Used in exactly two places: (1) compare tray surface uses `backdrop-filter:
blur(12px)` over a 92% paper fill on marketing pages where it floats over
content; (2) sticky table headers use a 96% paper fill so rows can scroll under.
Never on cards, never on modals.

### Imagery
Realistic product surfaces — actual TUI screenshots, terminal output, code
blocks, search-result mockups. No stock photography, no abstract 3D, no
illustrated robots. When imagery is present, it is **warm-toned and slightly
grainy** to match the paper background; never glossy.

### Layout
- Catalog pages: 12-col grid, 1280px max width, locked rhythm.
- Marketing pages: 12-col with editorial asymmetry, 1180px max width.
- Mobile: 4 col, tablet: 8 col.
- Result cards align by **fact column** (backend, hardware, OS, updated) — never
  by visual weight.

---

## Iconography

### Approach
**Lucide** (https://lucide.dev) — outlined, 1.5px stroke, geometrically calm.
Loaded via the Lucide CDN ESM build (`https://unpkg.com/lucide@latest`) on every
page. Match the system's editorial-industrial mood — they're slightly more
mechanical than Heroicons, less playful than Tabler, and pair well with
Instrument Sans.

### Substitution flag
The `flyingnobita/llml` repo is a Go terminal app and ships **no icon assets** —
the only visual asset is `assets/llml-screenshot.png` (TUI screenshot, imported
into `assets/`). There is no existing icon system to copy from, so Lucide is a
**substitution chosen for visual fit**. If the catalog site already has an icon
direction (e.g. Phosphor, custom SVGs), tell me and I'll swap.

### Usage rules
- Sized at the surrounding text's cap height: 16px next to body, 14px next to
  `sm`, 20px in CTAs.
- Stroke color = current text color. Never colored except inside a semantic
  badge (success/warning/error).
- One icon per action; never icon + emoji; never two icons stacked decoratively.
- Never use icons as section dividers or as the only label on a control —
  always pair with text on desktop. Mobile compare-tray and filter triggers may
  go icon-only with `aria-label`.

### Emoji
Not used in the catalog UI. (The product README uses them as section markers,
but that's docs voice, not site voice.)

### Unicode glyphs
`·` `→` `↑` `↓` `✓` `–` are acceptable inline. `✓` indicates verified provenance
in green; `–` separates ranges (`24–48GB`).

### Logo / wordmark
There is **no published logo** in the source repo. The wordmark in this system is
typographic: `llml` set in `Instrument Serif` italic, all-lowercase, with the
literal backtick wrapping (`\`llml\``) preserved in copy where it refers to the
binary. See `preview/logo.html`.

---

## Index

### Root files
- `README.md` — this file
- `colors_and_type.css` — CSS custom properties for the full token system (light + dark)
- `SKILL.md` — agent-skill manifest (Claude Code-compatible)

### Folders
- `assets/` — `llml-screenshot.png` (real TUI capture from the source repo)
- `fonts/` — note on font loading (Google Fonts CDN; no self-hosted files copied)
- `preview/` — design-system review cards (typography, color, spacing,
  components, brand). Each is registered in the Design System tab.
- `ui_kits/profile-catalog/` — the catalog site UI kit
  - `index.html` — interactive click-thru: marketing → browse → detail → contribute
  - `Nav.jsx`, `Hero.jsx`, `ResultRow.jsx`, `FilterRail.jsx`,
    `ProfileDetail.jsx`, `ImportBlock.jsx`, `ProvenancePanel.jsx`,
    `CompareTray.jsx`, `Badge.jsx`, `Button.jsx`, `data.js`

---

## Caveats

1. **No logo or icon assets exist in the source repo.** Wordmark is typographic;
   icons are Lucide via CDN. Flag if you want a custom mark.
2. **Fonts loaded from Google Fonts**, not self-hosted. `Instrument Serif`,
   `Instrument Sans`, and `IBM Plex Mono` are all available there. Swap to
   self-hosted if your bundle/caching strategy demands it.
3. **The brief defines the site; the source repo defines the product.** The site
   itself is not yet built in any repo — this design system is the spec for it.
