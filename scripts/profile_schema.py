"""Pydantic schema for portable LLM parameter profiles (schema_version = 3)."""

from pydantic import BaseModel, Field, field_validator

CANONICAL_PRIMARY = {"general", "eval"}
PRIMARY_ALIASES = {
    "chat": "general",
    "assistant": "general",
    "evaluation": "eval",
}


class ProfileUseCase(BaseModel):
    primary: list[str] = Field(
        default_factory=list,
        description="Canonical primary use cases: general or eval",
    )
    tags: list[str] = Field(default_factory=list)

    @field_validator("primary", mode="before")
    @classmethod
    def normalize_primary(cls, value):
        if value in (None, ""):
            return []
        raw_values = value if isinstance(value, list) else [value]
        normalized: list[str] = []
        for raw in raw_values:
            key = str(raw).strip().lower()
            primary = PRIMARY_ALIASES.get(key, key)
            if primary in CANONICAL_PRIMARY and primary not in normalized:
                normalized.append(primary)
        return normalized


class ProfileHardware(BaseModel):
    class_: str = Field(
        "",
        alias="class",
        description="cpu, gpu, or mixed",
    )
    gpu_count: int | None = None
    min_vram_gb: int | None = None
    max_vram_gb: int | None = None
    notes: str = ""

    class Config:
        populate_by_name = True


class ProfileEnv(BaseModel):
    key: str
    value: str


class PortableProfile(BaseModel):
    name: str = Field(..., description="Profile identifier built from model family/variant/mode/quantization. See instruction rules — never generic descriptors like '4-bit-gpu'.")
    backend: str = Field(..., description="llama, vllm, ollama, or koboldcpp")
    model_hint: str = Field("", description="Original model name as printed on the page heading, e.g. 'Qwen3.6-27B-Instruct'.")
    model_org: str = Field("", description="Organization that published the model, e.g. 'unsloth' for unsloth/* GGUF repos.")
    profile_org: str = Field("", description="Organization that authored the profile, e.g. 'unsloth' for profiles scraped from unsloth.ai.")
    args: list[str] = Field(default_factory=list)
    env: list[ProfileEnv] = Field(default_factory=list)
    use_case: ProfileUseCase = Field(default_factory=ProfileUseCase)
    hardware: ProfileHardware = Field(default_factory=ProfileHardware)
    confidence: str = Field("medium", description="high, medium, or low")
    provenance: str = Field("", description="Brief explanation of where the parameters were found on the page (e.g. 'Code block under How to Run' or 'Inferred from text').")


class ProfileDocument(BaseModel):
    schema_version: int = 3
    profiles: list[PortableProfile]
