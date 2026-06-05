import { test, expect } from "@playwright/test";

// ---------------------------------------------------------------------------
// Contribute page TOC and content tests
// ---------------------------------------------------------------------------
test.describe("Contribute page TOC anchors", () => {
  const sections = [
    { label: "What belongs in the catalog", id: "what-belongs-in-the-catalog" },
    { label: "What a strong profile includes", id: "what-a-strong-profile-includes" },
    { label: "Validation", id: "validation" },
    { label: "PR flow", id: "pr-flow" },
  ];

  for (const { label, id } of sections) {
    test(`TOC link '${label}' targets real section #${id}`, async ({ page }) => {
      await page.goto("./contribute");
      const link = page.locator(`a[href="#${id}"]`);
      await expect(link).toBeVisible();
      const section = page.locator(`#${id}`);
      await expect(section).toBeAttached();
    });

    test(`clicking TOC link '${label}' updates URL hash`, async ({ page }) => {
      await page.goto("./contribute");
      const link = page.locator(`a[href="#${id}"]`);
      await link.click();
      expect(page.url()).toContain(`#${id}`);
    });
  }

  test("clicking Validation makes its TOC link and section active", async ({ page }) => {
    await page.goto("./contribute");
    const link = page.locator('a[href="#validation"]');
    await link.click();

    await expect(link).toHaveAttribute("aria-current", "location");
    await expect(page.locator("#validation")).toHaveClass(/is-active/);
    await expect(page.locator('a[href="#what-belongs-in-the-catalog"]')).not.toHaveAttribute("aria-current", "location");
  });

  test("direct hash URL highlights the matching section", async ({ page }) => {
    await page.goto("./contribute/#validation");

    await expect(page.locator('a[href="#validation"]')).toHaveAttribute("aria-current", "location");
    await expect(page.locator("#validation")).toHaveClass(/is-active/);
  });
});

test.describe("Contribute page PR flow content", () => {
  test("PR flow names flyingnobita/llml-catalog (not llml-profiles)", async ({ page }) => {
    await page.goto("./contribute");
    const prSection = page.locator("#pr-flow");
    await expect(prSection).toContainText("flyingnobita/llml-catalog");
    await expect(prSection).not.toContainText("flyingnobita/llml-profiles");
  });

  test("PR flow shows python validate command (not npm run validate)", async ({ page }) => {
    await page.goto("./contribute");
    const prSection = page.locator("#pr-flow");
    await expect(prSection).toContainText("python scripts/validate_profiles.py");
    await expect(prSection).not.toContainText("npm run validate");
  });
});

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
    await expect(pre).toContainText("schema_version = 3");
    await expect(pre).toContainText("[[profiles]]");

    // Profile metadata
    await expect(pre).toContainText("balanced-q4");
    await expect(pre).toContainText("koboldcpp");
    await expect(pre).toContainText("Qwen3-14B-GGUF");

    // Args
    await expect(pre).toContainText("--gpulayers 80");
    await expect(pre).toContainText("--contextsize 16384");

    // Use case
    await expect(pre).toContainText('use_case.primary = ["general"]');
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
