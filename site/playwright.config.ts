import { defineConfig, devices } from "@playwright/test";

const PORT = 4199;
const BASE_URL = `http://localhost:${PORT}/llml-catalog/`;

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

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  webServer: {
    command: `npx astro build && npx astro preview --port ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: false,
    timeout: 30000,
  },
});
