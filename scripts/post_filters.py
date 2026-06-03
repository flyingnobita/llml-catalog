"""Post-extraction filters for the model card scraping pipeline.

Ports the MODEL_LOCATION_PARAMS stripping logic from /llml-import (v1.5.0).
llml supplies the model path at launch, so model-location parameters must be
stripped from extracted profiles.

Server-binding and identity parameters (--port, --host, --alias, etc.) are also
stripped because the launcher owns those values at runtime.
"""

from scripts.profile_schema import PortableProfile

# Per-backend model-location parameters. Stripped because llml supplies the
# model path at launch. Ollama is omitted — it uses API discovery.
MODEL_LOCATION_PARAMS: dict[str, dict[str, set[str]]] = {
    "llama": {
        "env": {
            "LLAMA_CACHE",
            "LLAMA_ARG_MODEL", "LLAMA_ARG_MODEL_URL", "LLAMA_ARG_MODEL_DRAFT",
            "LLAMA_ARG_HF_REPO", "LLAMA_ARG_HF_FILE",
            "LLAMA_ARG_HFD_REPO",
            "LLAMA_ARG_HF_REPO_V", "LLAMA_ARG_HF_FILE_V",
            "LLAMA_ARG_DOCKER_REPO",
            "LLAMA_ARG_MMPROJ", "LLAMA_ARG_MMPROJ_URL",
            "LLAMA_ARG_MODELS_DIR", "LLAMA_ARG_MODELS_PRESET",
            "HF_TOKEN",
        },
        "args": {
            "-m", "--model",
            "-mu", "--model-url",
            "-md", "--model-draft",
            "-mv", "--model-vocoder",
            "-hf", "-hfr", "--hf-repo",
            "-hff", "--hf-file",
            "-hfd", "-hfrd", "--hf-repo-draft",
            "-hfv", "-hfrv", "--hf-repo-v",
            "-hffv", "--hf-file-v",
            "-hft", "--hf-token",
            "-dr", "--docker-repo",
            "-mm", "--mmproj",
            "-mmu", "--mmproj-url",
            "--lora", "--lora-scaled", "--lora-init-without-apply",
            "--control-vector", "--control-vector-scaled",
            "--models-dir", "--models-preset",
            "-lcs", "--lookup-cache-static",
            "-lcd", "--lookup-cache-dynamic",
        },
    },
    "koboldcpp": {
        "env": {
            "LLAMA_CACHE",
            "LLAMA_ARG_MODEL", "LLAMA_ARG_MODEL_URL", "LLAMA_ARG_MODEL_DRAFT",
            "LLAMA_ARG_HF_REPO", "LLAMA_ARG_HF_FILE",
            "LLAMA_ARG_HFD_REPO",
            "LLAMA_ARG_HF_REPO_V", "LLAMA_ARG_HF_FILE_V",
            "LLAMA_ARG_DOCKER_REPO",
            "LLAMA_ARG_MMPROJ", "LLAMA_ARG_MMPROJ_URL",
            "LLAMA_ARG_MODELS_DIR", "LLAMA_ARG_MODELS_PRESET",
            "HF_TOKEN",
        },
        "args": {
            "-m", "--model",
            "-mu", "--model-url",
            "-md", "--model-draft",
            "-mv", "--model-vocoder",
            "-hf", "-hfr", "--hf-repo",
            "-hff", "--hf-file",
            "-hfd", "-hfrd", "--hf-repo-draft",
            "-hfv", "-hfrv", "--hf-repo-v",
            "-hffv", "--hf-file-v",
            "-hft", "--hf-token",
            "-dr", "--docker-repo",
            "-mm", "--mmproj",
            "-mmu", "--mmproj-url",
            "--lora", "--lora-scaled", "--lora-init-without-apply",
            "--control-vector", "--control-vector-scaled",
            "--models-dir", "--models-preset",
            "-lcs", "--lookup-cache-static",
            "-lcd", "--lookup-cache-dynamic",
        },
    },
    "vllm": {
        "env": {
            "HF_HOME", "HF_TOKEN", "HF_HUB_TOKEN",
            "HUGGINGFACE_HUB_CACHE", "HUGGING_FACE_HUB_TOKEN",
            "TRANSFORMERS_CACHE",
            "VLLM_CACHE_ROOT", "VLLM_ASSETS_CACHE",
            "VLLM_MODEL_REDIRECT_PATH", "VLLM_XLA_CACHE_PATH",
            "VLLM_USE_MODELSCOPE", "MODELSCOPE_CACHE",
        },
        "args": {
            "--model", "--tokenizer",
            "--revision", "--code-revision", "--tokenizer-revision",
            "--hf-config-path", "--hf-token", "--hf-overrides",
            "--download-dir", "--load-format",
            "--model-loader-extra-config", "--config",
            "--qlora-adapter-name-or-path",
            "--lora-modules", "--prompt-adapters",
            "--speculative-config", "--speculative-model",
            "--tokenizer-pool-extra-config",
        },
    },
}


# Server-binding and identity parameters the launcher owns at runtime.
# Applied to all backends (no per-backend variation needed).
# Short forms: -a is llama-server's short alias flag.
# vLLM equivalent: --served-model-name.
SERVER_BINDING_PARAMS: set[str] = {
    "--alias", "-a",
    "--port",
    "--host",
    "--served-model-name",
}


def strip_server_binding_params(profile: PortableProfile) -> PortableProfile:
    """Remove server-binding and identity args from a profile in-place.

    Args are stored as combined strings (e.g. "--port 8001", "--alias foo").
    We match on the first whitespace-split token so this works for both
    combined-string format (LLM output) and tokenised format.
    """
    profile.args = [
        a for a in profile.args
        if a.split()[0] not in SERVER_BINDING_PARAMS
    ]
    return profile


def strip_model_location_params(profile: PortableProfile) -> PortableProfile:
    """Remove model-location env vars and args from a profile in-place.

    Args are individual tokens ('-ngl', '99', '-m', 'model.gguf'). When a
    model-location flag is found, the flag AND its following value token are
    both removed (unless the value is itself a flag).
    """
    backend = profile.backend
    if backend not in MODEL_LOCATION_PARAMS:
        return profile

    strip = MODEL_LOCATION_PARAMS[backend]

    profile.env = [e for e in profile.env if e.key not in strip["env"]]

    skip_args = strip["args"]
    cleaned: list[str] = []
    skip_next = False
    for a in profile.args:
        if skip_next:
            skip_next = False
            continue
        if a in skip_args:
            # If the next token is a value (not a flag), skip it too
            skip_next = True
            continue
        cleaned.append(a)
    profile.args = cleaned

    return profile


def _args_key(profile: PortableProfile) -> tuple:
    """Stable dedup key: (backend, sorted normalized args)."""
    return (profile.backend, tuple(sorted(profile.args)))


def _metadata_score(profile: PortableProfile) -> int:
    """Higher score = richer metadata; used to pick the best duplicate."""
    score = 0
    if profile.hardware.min_vram_gb is not None:
        score += 2
    if profile.hardware.notes:
        score += 1
    if profile.use_case.tags:
        score += len(profile.use_case.tags)
    if profile.model_hint:
        score += 1
    return score


def filter_profiles(profiles: list[PortableProfile]) -> list[PortableProfile]:
    """Apply all post-extraction filters to a list of profiles."""
    cleaned = []
    for p in profiles:
        p = strip_model_location_params(p)
        p = strip_server_binding_params(p)
        # Drop profiles with no args — they add no value
        if not p.args:
            continue
        cleaned.append(p)

    # Deduplicate profiles with identical (backend, args) — keep the one with
    # the richest metadata, falling back to the first seen.
    seen: dict[tuple, int] = {}  # key -> index in deduped
    deduped: list[PortableProfile] = []
    for p in cleaned:
        key = _args_key(p)
        if key in seen:
            existing_idx = seen[key]
            if _metadata_score(p) > _metadata_score(deduped[existing_idx]):
                deduped[existing_idx] = p
        else:
            seen[key] = len(deduped)
            deduped.append(p)
    return deduped
