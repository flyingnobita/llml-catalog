import { defineConfig, devices } from "@playwright/test";

const PORT = 4199;
const BASE_URL = `http://localhost:${PORT}/`;

// On GitHub Actions runners, google-chrome-stable is pre-installed.
// Using channel:'chrome' skips the 170 MB Playwright Chromium download
// and its slow extraction, which exceeds any reasonable CI timeout.
const chromiumProject = process.env.CI
  ? { name: "chromium", use: { ...devices["Desktop Chrome"], channel: "chrome" } }
  : { name: "chromium", use: { ...devices["Desktop Chrome"] } };

export default defineConfig({
  testDir: "./tests",
  timeout: 10000,
  retries: 0,
  workers: 1,
  fullyParallel: false,

  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
  },

  projects: [chromiumProject],

  webServer: {
    command: `npx astro build && npx astro preview --port ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: false,
    timeout: 30000,
  },
});
