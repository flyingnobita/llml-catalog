## What

Briefly describe the profile you're adding and why it works well on your machine.

## Hardware

<!-- Tell us what you tested on. -->
- **GPU / machine:** (e.g. RTX 3090 24GB, M3 Max 36GB, 2× A100)
- **OS:** (e.g. Ubuntu 24.04, macOS 15, Windows 11)
- **VRAM used:** (e.g. ~18GB)

## Profile

- **Model:** (e.g. Qwen3-14B-Q4_K_M)
- **Backend:** (e.g. llama.cpp, vLLM, Ollama, KoboldCpp)
- **TOML file:** `profiles/<filename>.toml`

## Checklist

- [ ] I've tested these args on the hardware listed above
- [ ] The profile follows `schema_version = 2`
- [ ] `use_case.primary` and `use_case.tags` are filled in
- [ ] `hardware.class`, `hardware.min_vram_gb`, and `hardware.notes` are filled in
- [ ] The filename is descriptive (model + quant, e.g. `qwen3-14b-q4.toml`)
