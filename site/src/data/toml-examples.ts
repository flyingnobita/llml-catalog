export const tomlSample = `schema_version = 2

[[profiles]]
name = "balanced-q4"
backend = "koboldcpp"
model_hint = "Qwen3-14B-GGUF"
args = [
  "--gpulayers 80",
  "--contextsize 16384",
  "--threads 8",
  "--flashattention",
]

use_case.primary = "completion"
use_case.tags    = ["interactive", "coding"]

hardware.class       = "gpu"
hardware.gpu_count   = 1
hardware.min_vram_gb = 24
hardware.max_vram_gb = 24
hardware.notes       = "Tested on RTX 3090, CUDA 12.4, Ubuntu 24.04."`;
