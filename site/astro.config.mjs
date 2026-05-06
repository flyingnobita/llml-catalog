import { defineConfig } from "astro/config";

const SITE = "https://flyingnobita.github.io";
const BASE = "/llml-catalog";

export default defineConfig({
  site: SITE,
  base: BASE,
  output: "static",
  srcDir: "./src",
  publicDir: "./public",
  build: {
    assets: "assets",
  },
});
