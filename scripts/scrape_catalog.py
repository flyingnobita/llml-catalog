#!/usr/bin/env python3
"""scrape-catalog — Discover and extract LLM parameter profiles from model card sites.

Usage:
    python scripts/scrape_catalog.py https://unsloth.ai/docs/models/
    python scripts/scrape_catalog.py --site unsloth
    python scripts/scrape_catalog.py --single https://unsloth.ai/docs/models/qwen3.6

The pipeline:
1. Looks up site config by hostname from sites.toml
2. Discovers model pages via BFSDeepCrawlStrategy
3. Extracts profiles via LLMExtractionStrategy with a Pydantic schema
4. Runs post-extraction filters (model-location param stripping)
5. Writes TOML to profiles/ (high/medium confidence) or profiles/.review/ (low)
"""

import argparse
import asyncio
import os
import sys
from pathlib import Path
from urllib.parse import urlparse

# Ensure the repo root is on sys.path for direct script invocation
_REPO_ROOT = Path(__file__).resolve().parent.parent
if str(_REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(_REPO_ROOT))

import tomllib

from crawl4ai import AsyncWebCrawler, CacheMode, CrawlerRunConfig, LLMConfig
from crawl4ai.deep_crawling import BFSDeepCrawlStrategy
from crawl4ai.deep_crawling.filters import FilterChain, URLPatternFilter
from crawl4ai.extraction_strategy import LLMExtractionStrategy

from scripts.post_filters import filter_profiles
from scripts.profile_schema import ProfileDocument
from scripts.toml_writer import write_profiles

SITES_CONFIG = _REPO_ROOT / "sites.toml"

EXTRACTION_INSTRUCTION = """Extract one profile per distinct code block or table row containing launch parameters.
RULES:
1. ONLY extract from code blocks that invoke an inference backend (llama-cli, llama-server, vllm serve, ollama run, koboldcpp). SKIP install commands (curl|sh, apt, pip, brew), build commands (cmake, make, git clone), chat-template/prompt-format examples (showing only system prompts, turn tokens, or multi-turn dialogue with no launch flags), and download commands (huggingface-cli, wget). No invented defaults.
2. Backend mapping: llama.cpp->llama, vLLM->vllm, Ollama->ollama, KoboldCpp->koboldcpp
3. model_hint: model name from page heading
4. EXCLUDE model-location params (--model, -m, --hf-repo, etc.) AND server-binding/identity params (--alias, -a, --port, --host, --served-model-name) — the launcher owns these at runtime.
5. use_case.primary: chat|completion|tool-calling|embedding|eval|batch
6. hardware.class: cpu|gpu|mixed
7. Name profiles as ModelFamily[-Variant][-mode][-quantization]:
   - ModelFamily: from H1 (e.g. "Qwen3.6", "gemma-4", "Kimi-K2.6", "GLM-5.1", "Nemotron-3-Nano-Omni").
   - Variant: SIZE/MoE designator (e.g. "27B", "26B-A4B", "E2B") OR named sub-model (e.g. "Reasoning"). OMIT if the page documents only one variant. Infer from GGUF filename or --model path if no heading carries it.
   - mode: include ONLY when the page distinguishes modes (thinking/non-thinking from headings or --chat-template-kwargs enable_thinking). Omit if only one mode exists or none.
   - quantization: append when named (e.g. "Q4_K_XL", "Q8_0", "UD-Q4_K_XL").
   - NEVER use backend tool names (llama-cli, llama-server, llama.cpp, vllm) anywhere in the name. NEVER use generic descriptors like "4-bit-gpu" or "cpu-only".
8. confidence: high (all from code/tables), medium (some inferred), low (key fields missing)
9. If a code block has no launch flags beyond --model/-m, it is not a profile — skip it."""


def load_site_config(identifier: str) -> dict | None:
    """Load site-specific crawl config from sites.toml.

    identifier can be a hostname (e.g. 'unsloth.ai') or a site ID (e.g. 'unsloth').
    """
    if not SITES_CONFIG.exists():
        return None
    with open(SITES_CONFIG, "rb") as f:
        data = tomllib.load(f)
    sites = data.get("site", {})
    # Exact site ID match first
    if identifier in sites:
        cfg = dict(sites[identifier])
        cfg["_id"] = identifier
        return cfg
    # Hostname match
    for site_id, cfg in sites.items():
        cfg_host = urlparse(cfg.get("base_url", "")).hostname
        if cfg_host == identifier:
            cfg = dict(cfg)
            cfg["_id"] = site_id
            return cfg
    return None


def get_llm_config() -> LLMConfig:
    """Build LLM config from environment or defaults to gpt-4o."""
    provider = os.getenv("LLML_EXTRACT_PROVIDER", "openai/gpt-4o")

    if provider.startswith("ollama"):
        return LLMConfig(
            provider=provider,
            api_token=os.getenv("OLLAMA_API_KEY", "no-token"),
        )

    api_token = None
    if provider.startswith("openai"):
        api_token = os.getenv("OPENAI_API_KEY")
    elif provider.startswith("anthropic") or "claude" in provider:
        api_token = os.getenv("ANTHROPIC_API_KEY")
    elif provider.startswith("deepseek"):
        api_token = os.getenv("DEEPSEEK_API_KEY")
    # Generic fallback for any provider
    if not api_token:
        api_token = os.getenv("LLML_EXTRACT_API_KEY")

    if not api_token:
        print(
            f"Warning: No API token found for provider '{provider}'. "
            f"Set OPENAI_API_KEY, ANTHROPIC_API_KEY, or LLML_EXTRACT_API_KEY. "
            f"Falling back to Ollama if available."
        )
        return LLMConfig(provider="ollama/llama3.1", api_token="no-token")

    return LLMConfig(provider=provider, api_token=api_token)


async def crawl_single(url: str, site_hints: str = "") -> list[ProfileDocument]:
    """Extract profiles from a single URL."""
    instruction = EXTRACTION_INSTRUCTION
    if site_hints:
        instruction = f"CONTEXT: {site_hints}\n\n{instruction}"

    config = CrawlerRunConfig(
        cache_mode=CacheMode.ENABLED,
        word_count_threshold=1,
        page_timeout=60000,
        extraction_strategy=LLMExtractionStrategy(
            llm_config=get_llm_config(),
            schema=ProfileDocument.model_json_schema(),
            extraction_type="schema",
            instruction=instruction,
            extra_args={"temperature": 0, "max_tokens": 16000},
        ),
    )

    async with AsyncWebCrawler() as crawler:
        result = await crawler.arun(url=url, config=config)

    if not result.extracted_content:
        print(f"  No profiles extracted from {url}")
        return []

    try:
        import json

        raw = json.loads(result.extracted_content)
        if isinstance(raw, list):
            # LLM may return a list of ProfileDocument-shaped objects.
            # Merge their .profiles arrays into one document.
            merged: list[dict] = []
            for item in raw:
                merged.extend(item.get("profiles", [item]))
            doc = ProfileDocument(profiles=merged)
        else:
            doc = ProfileDocument(**raw)
        return [doc]
    except Exception as e:
        print(f"  Failed to parse extraction result from {url}: {e}")
        print(f"  Raw result (first 500 chars): {str(result.extracted_content)[:500]}")
        return []


async def crawl_site(url: str, site_config: dict | None = None) -> list[ProfileDocument]:
    """Discover model pages and extract profiles from a site."""
    hostname = urlparse(url).hostname or ""

    if site_config is None:
        site_config = load_site_config(hostname) or {}

    url_pattern = site_config.get("url_pattern", "/docs/models/.+")
    max_depth = site_config.get("max_depth", 1)
    max_pages = site_config.get("max_pages", 50)
    hints = site_config.get("extraction_hints", "")

    instruction = EXTRACTION_INSTRUCTION
    if hints:
        instruction = f"CONTEXT: {hints}\n\n{instruction}"

    filter_chain = FilterChain([
        URLPatternFilter(patterns=[url_pattern]),
    ])

    config = CrawlerRunConfig(
        deep_crawl_strategy=BFSDeepCrawlStrategy(
            max_depth=max_depth,
            max_pages=max_pages,
            filter_chain=filter_chain,
            include_external=False,
        ),
        extraction_strategy=LLMExtractionStrategy(
            llm_config=get_llm_config(),
            schema=ProfileDocument.model_json_schema(),
            extraction_type="schema",
            instruction=instruction,
            extra_args={"temperature": 0, "max_tokens": 16000},
        ),
        cache_mode=CacheMode.ENABLED,
        word_count_threshold=1,
        page_timeout=60000,
        verbose=True,
    )

    async with AsyncWebCrawler() as crawler:
        results = await crawler.arun(url=url, config=config)

    print(f"\nCrawled {len(results)} pages from {url}")

    docs: list[ProfileDocument] = []
    for result in results:
        if not result.extracted_content:
            continue
        try:
            import json

            raw = json.loads(result.extracted_content)
            if isinstance(raw, list):
                doc = ProfileDocument(profiles=raw)
            else:
                doc = ProfileDocument(**raw)
            docs.append(doc)
            print(f"  {result.url}: {len(doc.profiles)} profiles extracted")
        except Exception as e:
            print(f"  {result.url}: parse error — {e}")
            print(f"  Raw result (first 500 chars): {str(result.extracted_content)[:500]}")

    return docs


def main():
    parser = argparse.ArgumentParser(
        description="scrape-catalog — Extract LLM profiles from model card sites"
    )
    parser.add_argument(
        "url",
        nargs="?",
        help="Base URL of the model card site (e.g. https://unsloth.ai/docs/models/)",
    )
    parser.add_argument(
        "--site",
        help="Site ID from sites.toml (e.g. 'unsloth') — uses the configured base_url",
    )
    parser.add_argument(
        "--single",
        help="Single model page URL (skips discovery, extracts directly)",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Crawl and extract but do not write TOML files",
    )
    parser.add_argument(
        "--max-pages",
        type=int,
        default=50,
        help="Maximum pages to crawl (default: 50)",
    )
    args = parser.parse_args()

    # Resolve target URL
    target_url: str | None = None
    site_config: dict | None = None

    if args.single:
        target_url = args.single
    elif args.site:
        site_config = load_site_config(args.site)
        if site_config:
            target_url = site_config.get("base_url", "")
        else:
            print(f"Unknown site: {args.site}")
            sys.exit(1)
    elif args.url:
        target_url = args.url
        hostname = urlparse(target_url).hostname or ""
        site_config = load_site_config(hostname)
    else:
        parser.print_help()
        sys.exit(1)

    if not target_url:
        print("Error: No target URL resolved.")
        sys.exit(1)

    print(f"Target: {target_url}")
    if site_config:
        print(f"Site config: {site_config.get('_id', 'auto-detected')}")

    # Crawl and extract
    if args.single:
        hints = site_config.get("extraction_hints", "") if site_config else ""
        docs = asyncio.run(crawl_single(target_url, hints))
    else:
        if site_config:
            site_config["max_pages"] = args.max_pages
        docs = asyncio.run(crawl_site(target_url, site_config))

    if not docs:
        print("\nNo profiles extracted.")
        return

    # Collect all profiles, apply post-filters
    all_profiles = []
    for doc in docs:
        all_profiles.extend(doc.profiles)

    # Stamp profiles with org metadata from site config
    if site_config:
        model_org = site_config.get("model_org", "")
        profile_org = site_config.get("profile_org", "")
        for p in all_profiles:
            if model_org and not p.model_org:
                p.model_org = model_org
            if profile_org and not p.profile_org:
                p.profile_org = profile_org

    all_profiles = filter_profiles(all_profiles)

    print(f"\nTotal profiles extracted: {len(all_profiles)}")
    by_conf: dict[str, int] = {}
    for p in all_profiles:
        by_conf[p.confidence] = by_conf.get(p.confidence, 0) + 1
    for conf, count in sorted(by_conf.items()):
        print(f"  {conf}: {count}")

    if args.dry_run:
        print("\n[Dry run — no files written]")
        for p in all_profiles:
            print(f"  [{p.confidence}] {p.name} ({p.backend})")
        return

    # Write TOML
    result = write_profiles(all_profiles, source_url=target_url)
    print(f"\nWritten: {len(result['written'])}")
    print(f"Skipped (duplicates): {len(result['skipped'])}")
    print(f"Review queue: {len(result['review'])}")


if __name__ == "__main__":
    main()
