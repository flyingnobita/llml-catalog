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

## License

Profiles are released under [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) — public domain, no attribution required.
Site source and design assets are MIT.
