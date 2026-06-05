// Build-time data loader: reads profiles/*.toml and transforms into the JS shape
// expected by browse, compare, index, and profile/[id] pages.
import { readFileSync, readdirSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { execSync } from "child_process";
import { parse } from "smol-toml";
import { resolve } from "path";

// Astro 6 prerenders bundled chunks from dist/.prerender, so import.meta.url is
// no longer a stable anchor for repo-relative data files.
const SITE_ROOT = process.cwd();
const REPO_ROOT = resolve(SITE_ROOT, "..");
const PROFILES_DIR = resolve(REPO_ROOT, "profiles");

const CATALOG_BASE = "https://llml.dev";

export const INSTALL_COMMANDS = {
  mac: "brew install --cask flyingnobita/tap/llml",
  linux: "go install github.com/flyingnobita/llml/cmd/llml@latest",
  windows: "scoop bucket add flyingnobita https://github.com/flyingnobita/scoop-bucket && scoop install flyingnobita/llml",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function titleCase(s) {
  if (!s) return "Chat";
  return s
    .split(/[-\s]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

const BACKEND_ALIASES = {
  llama: "llama.cpp",
  vllm: "vllm",
  ollama: "ollama",
  koboldcpp: "koboldcpp",
};

function normalizeBackend(raw) {
  return BACKEND_ALIASES[raw] || raw;
}

function detectOS(args) {
  const str = (args || []).join(" ");
  if (/windows/i.test(str)) return "Windows";
  if (/cuda|nvidia|CUDA_VISIBLE_DEVICES/i.test(str)) return "Linux";
  if (/vulkan/i.test(str)) return "Linux · Windows";
  if (/metal/i.test(str)) return "macOS";
  return "Cross-platform";
}

function hardwareClass(hw) {
  if (!hw || !hw.class) return "Unspecified";
  if (hw.gpu_count && hw.gpu_count > 1) return "Multi-GPU";
  const map = { gpu: "GPU", cpu: "CPU", mixed: "Mixed" };
  return map[hw.class] || "Unspecified";
}

function generateFit(useCase, hwDisplay, notes) {
  if (notes) {
    const firstSentence = notes.split(/[.;]/)[0].trim();
    if (firstSentence.length <= 110) return firstSentence + ".";
    return firstSentence.slice(0, 107) + "…";
  }
  return `${useCase} on ${hwDisplay}.`;
}

// ---------------------------------------------------------------------------
// Git info — build a map of filename → { commit, updated, maintainer }
// ---------------------------------------------------------------------------

function buildGitInfo() {
  const map = {};
  try {
    const out = execSync(
      `for f in profiles/*.toml; do echo "$(basename "$f")|$(git log -1 --format='%H|%cs|%an' -- "$f" 2>/dev/null || echo '?|unknown|unknown')"; done`,
      { cwd: REPO_ROOT, encoding: "utf-8", timeout: 5000 }
    );
    for (const line of out.trim().split("\n")) {
      const [filename, commit, ...rest] = line.split("|");
      if (!filename) continue;
      // The updated field may contain "|" if not quoted, so rejoin
      const restStr = rest.join("|");
      const parts = restStr.split("|");
      const updated = parts[0] || "unknown";
      const author = parts[1] || "unknown";
      map[filename] = {
        commit: commit || "?",
        updated,
        maintainer: author === "unknown" ? "@unknown" : `@${author}`,
      };
    }
  } catch {
    // Git not available — return empty map; callers fall back to placeholders
  }
  return map;
}

// ---------------------------------------------------------------------------
// Parse all TOML profiles
// ---------------------------------------------------------------------------

function loadProfiles() {
  const gitInfo = buildGitInfo();
  const rawProfiles = [];

  let files;
  try {
    files = readdirSync(PROFILES_DIR).filter(
      (f) => f.endsWith(".toml") && !f.includes("deepseekapi")
    );
  } catch {
    console.warn("profiles directory not found at", PROFILES_DIR);
    return { profiles: [], filters: {} };
  }

  for (const filename of files) {
    const filePath = resolve(PROFILES_DIR, filename);
    let doc;
    try {
      doc = parse(readFileSync(filePath, "utf-8"));
    } catch (e) {
      console.warn(`Skipping unparseable TOML: ${filename}`, e.message);
      continue;
    }

    if (!doc.profiles || doc.profiles.length === 0) continue;

    for (const p of doc.profiles) {
      if (!p.name) continue;

      const gi = gitInfo[filename] || {
        commit: "?",
        updated: "unknown",
        maintainer: "@unknown",
      };
      const hw = p.hardware || {};
      const uc = p.use_case || {};
      const hwClass = hardwareClass(hw);
      const useCase = titleCase(uc.primary || "chat");
      const notes = hw.notes || "";
      const tags = (uc.tags || []).map((t) => t.toLowerCase());

      const repoPath = `profiles/${filename}`;
      const fullCommit = gi.commit && gi.commit !== "?" ? gi.commit : null;
      const githubUrl = fullCommit
        ? `https://github.com/flyingnobita/llml-catalog/blob/${fullCommit}/${repoPath}`
        : null;

      rawProfiles.push({
        id: slugify(p.name),
        name: p.name,
        fit: generateFit(useCase, hwClass, notes),
        backend: normalizeBackend(p.backend || "llama"),
        hardware: hwClass,
        os: detectOS(p.args),
        useCase,
        tags,
        verified: false,
        updated: gi.updated,
        maintainer: gi.maintainer,
        repoPath,
        commit: gi.commit,
        githubUrl,
        downloadUrl: `${CATALOG_BASE}/profiles/${filename}`,
        importCmd: `llml import ${CATALOG_BASE}/profiles/${filename} --activate`,
        rationale: notes,
        args: p.args || [],
        env: (p.env || []).map((e) => ({
          key: e.key || e.name || "",
          value: e.value || "",
        })),
        modelHint: p.model_hint || "",
        modelOrg: p.model_org || "",
        profileOrg: p.profile_org || "",
      });
    }
  }

  // Compute related profiles (same model_hint, different quant/name)
  for (const p of rawProfiles) {
    if (!p.modelHint) {
      p.related = [];
      continue;
    }
    p.related = rawProfiles
      .filter(
        (other) =>
          other.modelHint === p.modelHint &&
          other.id !== p.id
      )
      .slice(0, 4)
      .map((o) => o.id);
  }

  // Derive filter options from actual data
  const filters = {
    backend: [...new Set(rawProfiles.map((p) => p.backend))].sort(),
    hardware: [...new Set(rawProfiles.map((p) => p.hardware))].sort(),
    os: [...new Set(rawProfiles.map((p) => p.os))].sort(),
    useCase: [...new Set(rawProfiles.map((p) => p.useCase))].sort(),
    modelOrg: [...new Set(rawProfiles.map((p) => p.modelOrg).filter(Boolean))].sort(),
    profileOrg: [...new Set(rawProfiles.map((p) => p.profileOrg).filter(Boolean))].sort(),
    tags: [...new Set(rawProfiles.flatMap((p) => p.tags || []))].sort(),
    source: ["Verified", "Community"],
  };

  // Sort: verified first, then by name
  rawProfiles.sort((a, b) => {
    if (a.verified !== b.verified) return b.verified - a.verified;
    return a.name.localeCompare(b.name);
  });

  return { profiles: rawProfiles, filters };
}

const { profiles, filters } = loadProfiles();

export const PROFILES = profiles;
export const FILTERS = filters;

// Write profiles JSON for client-side fetch (loading/error states on browse page).
// Write to both public/ (dev mode) and dist/ (production build) since Astro copies
// public/ to dist/ before page modules are evaluated.
const profilesJSON = JSON.stringify(profiles.map(p => ({
  id: p.id, name: p.name, fit: p.fit, backend: p.backend,
  hardware: p.hardware, os: p.os, useCase: p.useCase,
  tags: p.tags || [], modelOrg: p.modelOrg, profileOrg: p.profileOrg,
  verified: p.verified, updated: p.updated, args: p.args || [],
  env: p.env || [], maintainer: p.maintainer, importCmd: p.importCmd,
})));

const profilesPublic = resolve(SITE_ROOT, "public", "profiles");
mkdirSync(profilesPublic, { recursive: true });
writeFileSync(resolve(profilesPublic, "index.json"), profilesJSON);

const distDir = resolve(SITE_ROOT, "dist", "profiles");
if (existsSync(distDir)) {
  writeFileSync(resolve(distDir, "index.json"), profilesJSON);
}
