import { test, expect } from "@playwright/test";

// ---------------------------------------------------------------------------
// How It Works page tests
// ---------------------------------------------------------------------------
test.describe("How It Works page", () => {
  test("route loads — not 404", async ({ page }) => {
    await page.goto("./how");
    await expect(page.locator("h1")).toBeVisible();
  });

  test("H1 contains expected text", async ({ page }) => {
    await page.goto("./how");
    await expect(page.locator("h1")).toContainText("You've run the model");
  });

  test("all four sections present", async ({ page }) => {
    await page.goto("./how");
    await expect(page.locator("h2")).toContainText([
      "Every run is a rediscovery",
      "What the profile encodes",
      "How you know it matches your machine",
      "Find, import, run",
    ]);
  });

  test("TOML snippet visible", async ({ page }) => {
    await page.goto("./how");
    await expect(page.locator("pre")).toContainText("schema_version");
  });

  test("nav 'How It Works' active state", async ({ page }) => {
    await page.goto("./how");
    const navLink = page.locator("nav a[href$='/how']");
    // Active link has solid border-bottom; inactive has transparent
    const borderColor = await navLink.evaluate((el: HTMLElement) => getComputedStyle(el).borderBottomColor);
    expect(borderColor).not.toBe("rgba(0, 0, 0, 0)"); // transparent
  });

  test("home CTA 'Learn how profiles work' links to /how", async ({ page }) => {
    await page.goto(".");
    const cta = page.locator("a[href$='/how']").filter({ hasText: "Learn how profiles work" });
    await expect(cta).toBeVisible();
  });

  test("home 'How it works' section has Read more link", async ({ page }) => {
    await page.goto(".");
    const readMore = page.locator("a[href$='/how']").filter({ hasText: /Read more/ });
    await expect(readMore).toBeVisible();
  });

  test("ImportBlock visible with command text", async ({ page }) => {
    await page.goto("./how");
    const cmdBlock = page.locator(".import-block-cmd");
    await expect(cmdBlock).toBeVisible();
    await expect(cmdBlock).toContainText("llml import");
  });

  test("ImportBlock Copy button works with JS", async ({ page }) => {
    await page.goto("./how");
    const copyBtn = page.locator(".import-block-btn");
    await expect(copyBtn).toBeVisible();
    await expect(copyBtn).toHaveText("Copy");

    await copyBtn.click();
    await expect(copyBtn).toHaveText("✓ Copied");
    await expect(copyBtn).toHaveClass(/copied/);

    // Wait for reset
    await expect(copyBtn).toHaveText("Copy", { timeout: 3000 });
  });

  test("footer CTA Browse links to /browse", async ({ page }) => {
    await page.goto("./how");
    const footerLinks = page.locator("a[href$='/browse']").filter({ hasText: /Browse the catalog/ });
    // The footer CTA is the last one on the page
    await expect(footerLinks.last()).toBeVisible();
  });

  test("footer Contribute link points to /contribute", async ({ page }) => {
    await page.goto("./how");
    const contributeLink = page.locator("a[href$='/contribute']").filter({ hasText: /Contribute a profile/ });
    await expect(contributeLink).toBeVisible();
  });

  test("hero has thesis sub", async ({ page }) => {
    await page.goto("./how");
    await expect(page.locator("p").filter({ hasText: "A profile is a solved instance, not a description." })).toBeVisible();
  });

  test("facts grid has four rows", async ({ page }) => {
    await page.goto("./how");
    const section = page.locator("#how-you-know-it-matches-your-machine");
    // The grid is a bordered div with four grid-template-columns:200px 1fr rows
    const grid = section.locator("div[style*='border:1px solid']");
    const rows = grid.locator("> div");
    await expect(rows).toHaveCount(4);
  });

  test("TOML pre has dark background styling", async ({ page }) => {
    await page.goto("./how");
    const pre = page.locator("pre").filter({ hasText: "schema_version" });
    const bg = await pre.evaluate((el: HTMLElement) => getComputedStyle(el).backgroundColor);
    // Should not be white/light (dark inverse surface)
    expect(bg).not.toBe("rgb(255, 255, 255)");
  });
});
