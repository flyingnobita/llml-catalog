# LLM Launcher — Catalog

Importable launch recipes for [llml](https://github.com/flyingnobita/llml). Stop reconstructing `llama-server` flags from shell history — grab a profile someone already tuned for your model and hardware, import it, and run.

**[Browse the catalog →](https://llml.dev/)**

> [!NOTE]
> **The catalog is growing.** Alongside community PRs, the maintainers regularly find
> and add new profiles. [Watch this repo](https://github.com/flyingnobita/llml-catalog)
> (Watch → Custom → Releases) to get notified when new profiles land — or check back any time.

A **profile** is a TOML file that captures the exact args and env vars someone converged on for a specific model, backend, and hardware configuration. Export yours from llml, share it here, and others with the same setup can import it instead of starting from scratch.

## Profile format

Profiles use `schema_version = 3`. A minimal profile looks like:

```toml
schema_version = 3

[[profiles]]
name = "llama-3-8b-q4-rtx4090"
backend = "llama"
model_hint = "Meta-Llama-3-8B-Instruct.Q4_K_M.gguf"
args = [ "--n-gpu-layers 99", "--ctx-size 8192" ]

[profiles.use_case]
primary = [ "general" ]
tags = [ "interactive" ]

[profiles.hardware]
class = "gpu"
min_vram_gb = 24
notes = "Tested on RTX 4090, CUDA 12.4, Ubuntu 24.04"
```

The full schema is defined in [`llml/docs/profile-format.md`](https://github.com/flyingnobita/llml/blob/main/docs/profile-format.md).

## Adding a profile

1. Write a `.toml` file following the format above. Use an [existing profile](profiles/) as a reference.
2. Place it in `profiles/`. Name it after the model and quant (e.g. `llama-3-8b-q4-rtx4090.toml`).
3. Open a PR. CI validates the schema before merge.

That's it. No accounts, no signup — just a TOML file and a pull request.

Before opening a PR, check that:
- `backend`, `model_hint`, and `hardware.class` are set
- `use_case.primary`, when set, uses `general` or `eval`
- `hardware.min_vram_gb` matches what your config actually uses
- `hardware.notes` names the real machine you tested on
- The filename is descriptive

## Importing a profile

```bash
# Import from the catalog URL
llml import https://llml.dev/profiles/Qwen3.6-enable-thinking.toml --activate
```

The profile appears under `p` in the llml TUI on next launch.

## Repository layout

```
profiles/           one .toml file per profile — PRs add new profiles here
site/               static catalog site (Astro), deployed to GitHub Pages
design/             design system: colors, type, components
scripts/            scraping pipeline and dev-docs utilities
.github/workflows/  CI: validate incoming profiles, build + deploy site
```

## Scraping pipeline

An automated pipeline extracts profiles from model card sites and writes portable TOML files. See [`scripts/README.md`](scripts/README.md) for setup, CLI flags, and provider configuration.

## License

Profiles are released under [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) — public domain, no attribution required.
Site source and design assets are MIT.
