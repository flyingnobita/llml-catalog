import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import { readFileSync, readdirSync, mkdirSync, copyFileSync, existsSync } from "fs";
import { resolve, dirname, basename } from "path";
import { fileURLToPath } from "url";
import { parse } from "smol-toml";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SITE = "https://llml.dev";
const BASE = "";
const REPO_ROOT = resolve(__dirname, "..");
const PROFILES_SRC = resolve(REPO_ROOT, "profiles");
const PROFILES_DST = resolve(__dirname, "public", "profiles");

function copyTOMLProfiles() {
  if (!existsSync(PROFILES_SRC)) {
    console.warn("profiles directory not found at", PROFILES_SRC);
    return;
  }

  mkdirSync(PROFILES_DST, { recursive: true });

  const files = readdirSync(PROFILES_SRC).filter((f) => f.endsWith(".toml"));

  for (const filename of files) {
    const srcPath = resolve(PROFILES_SRC, filename);
    const dstPath = resolve(PROFILES_DST, filename);
    const raw = readFileSync(srcPath, "utf-8");

    // Validate TOML — fail hard on malformed files (ARCH 3A).
    try {
      parse(raw);
    } catch (e) {
      throw new Error(`Malformed TOML in profiles/${filename}: ${e.message}`);
    }

    copyFileSync(srcPath, dstPath);
  }

  console.log(`Copied ${files.length} profile TOMLs to public/profiles/`);
}

function profilesPlugin() {
  return {
    name: "llml-profiles-copy",
    buildStart() {
      copyTOMLProfiles();
    },
    configureServer() {
      // In dev mode, copy once at startup (warn-and-skip bad files).
      try {
        copyTOMLProfiles();
      } catch (e) {
        console.warn(`[llml-profiles-copy] ${e.message} — skipping`);
      }
    },
  };
}

export default defineConfig({
  site: SITE,
  base: BASE,
  output: "static",
  srcDir: "./src",
  publicDir: "./public",
  build: {
    assets: "assets",
  },
  integrations: [sitemap()],
  vite: {
    plugins: [profilesPlugin()],
  },
});
