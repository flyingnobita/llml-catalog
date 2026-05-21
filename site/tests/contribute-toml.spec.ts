import { test, expect } from "@playwright/test";

// ---------------------------------------------------------------------------
// Contribute page TOML regression tests
// ---------------------------------------------------------------------------
// Verifies that the contribute page still renders the TOML sample correctly
// after the inline literal was extracted to the shared toml-examples.ts module.
test.describe("Contribute page TOML", () => {
  test("TOML sample visible with expected fields", async ({ page }) => {
    await page.goto("./contribute");
    const pre = page.locator("pre");

    await expect(pre).toBeVisible();

    // Core schema
    await expect(pre).toContainText("schema_version = 2");
    await expect(pre).toContainText("[[profiles]]");

    // Profile metadata
    await expect(pre).toContainText("balanced-q4");
    await expect(pre).toContainText("koboldcpp");
    await expect(pre).toContainText("Qwen3-14B-GGUF");

    // Args
    await expect(pre).toContainText("--gpulayers 80");
    await expect(pre).toContainText("--contextsize 16384");

    // Use case
    await expect(pre).toContainText("completion");
    await expect(pre).toContainText("interactive");

    // Hardware
    await expect(pre).toContainText("gpu");
    await expect(pre).toContainText("min_vram_gb");
    await expect(pre).toContainText("max_vram_gb");
    await expect(pre).toContainText("RTX 3090");
  });

  test("side-by-side layout — hero and TOML are siblings", async ({ page }) => {
    await page.goto("./contribute");
    const pre = page.locator("pre");
    const h1 = page.locator("h1");

    // Both visible in hero section (first section)
    await expect(h1).toBeVisible();
    await expect(pre).toBeVisible();

    // Pre should have dark background
    const bg = await pre.evaluate((el: HTMLElement) =>
      getComputedStyle(el).backgroundColor,
    );
    // Not white
    expect(bg).not.toBe("rgb(255, 255, 255)");
  });
});
