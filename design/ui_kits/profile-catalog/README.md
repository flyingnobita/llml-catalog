# Profile Catalog UI kit

A click-thru recreation of the **llml profile catalog** site at hi-fidelity, used as
the source of truth for components and screen composition.

## Run

Open `index.html`. No build step.

## Screens

1. **Home** (`route = "home"`) — marketing page with hero artifact, proof strip, how-it-works, sample card row, why-different, contribute CTA.
2. **Browse** (`route = "browse"`) — filter rail + dense result list + sticky compare tray.
3. **Profile detail** (`route = "detail"`) — hero with import block above the fold, facts grid, rationale, launch config, provenance, related profiles.
4. **Contribute** (`route = "contribute"`) — sample TOML, validation rules, PR flow.

## Files

| File | Purpose |
|---|---|
| `index.html` | Entry; mounts `<App>` with route state |
| `data.js` | `PROFILES`, `FILTERS` — sample but realistic profile data |
| `UI.jsx` | `Badge`, `Button`, `MetaCell`, `ImportBlock` atoms |
| `Nav.jsx` | Sticky top nav |
| `Home.jsx` | Marketing screen + `Footer` |
| `Browse.jsx` | Catalog + `FilterGroup`, `ResultRow`, `CompareTray` |
| `ProfileDetail.jsx` | Detail page |
| `Contribute.jsx` | Docs page |

All components use the design tokens from `colors_and_type.css` at the project root.
