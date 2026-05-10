"""Pydantic schema for portable LLM parameter profiles (schema_version = 2)."""

from pydantic import BaseModel, Field


class ProfileUseCase(BaseModel):
    primary: str = Field(
        "",
        description="chat, completion, tool-calling, embedding, eval, or batch",
    )
    tags: list[str] = Field(default_factory=list)


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
    name: str = Field(..., description="Profile name, e.g. '4-bit-gpu', 'cpu-only'")
    backend: str = Field(..., description="llama, vllm, ollama, or koboldcpp")
    model_hint: str = ""
    args: list[str] = Field(default_factory=list)
    env: list[ProfileEnv] = Field(default_factory=list)
    use_case: ProfileUseCase = Field(default_factory=ProfileUseCase)
    hardware: ProfileHardware = Field(default_factory=ProfileHardware)
    confidence: str = Field("medium", description="high, medium, or low")


class ProfileDocument(BaseModel):
    schema_version: int = 2
    profiles: list[PortableProfile]
