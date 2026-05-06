---
name: llml-design
description: Use this skill to generate well-branded interfaces and assets for the llml profile catalog (the site that catalogs portable parameter profiles for the local LLM launcher `llml`), either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping.
user-invocable: true
---

Read the README.md file within this skill, and explore the other available files.

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out
and create static HTML files for the user to view. If working on production code, you can
copy assets and read the rules here to become an expert in designing with this brand.

If the user invokes this skill without any other guidance, ask them what they want to
build or design, ask some questions, and act as an expert designer who outputs HTML
artifacts _or_ production code, depending on the need.

Key files:

- `README.md` — full system: voice, color, type, spacing, motion, iconography, caveats
- `colors_and_type.css` — drop-in CSS variable tokens (light + dark) and semantic element styles
- `preview/` — design-system review cards
- `ui_kits/profile-catalog/` — pixel-fidelity React click-thru of the site (Home / Browse / Detail / Contribute)
- `assets/llml-screenshot.png` — the real terminal TUI from `flyingnobita/llml`
- `fonts/README.md` — font loading note (Google Fonts CDN)

Do not introduce new colors, decorative gradients, or icon styles outside what
the README documents. The catalog's whole job is to feel like serious software
for builders — clarity beats flair.
