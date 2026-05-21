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

// ---------------------------------------------------------------------------
// Edge cases
// ---------------------------------------------------------------------------
test.describe("Mobile / responsive", () => {
  test("all sections visible at 375px viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("./how");

    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator("h2")).toContainText([
      "Every run is a rediscovery",
      "What the profile encodes",
      "How you know it matches your machine",
      "Find, import, run",
    ]);
    await expect(page.locator("pre")).toContainText("schema_version");
    await expect(page.locator(".import-block-cmd")).toBeVisible();
  });

  test("no horizontal overflow on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("./how");

    const scrollW = await page.evaluate(() => document.body.scrollWidth);
    const vpW = await page.evaluate(() => window.innerWidth);
    expect(scrollW).toBeLessThanOrEqual(vpW + 2);
  });
});

test.describe("Section anchors", () => {
  test("each section has an id navigable via URL hash", async ({ page }) => {
    await page.goto("./how");

    const ids = [
      "every-run-is-a-rediscovery",
      "what-the-profile-encodes",
      "how-you-know-it-matches-your-machine",
      "find-import-run",
    ];

    for (const id of ids) {
      await expect(page.locator(`#${id}`)).toBeVisible();
    }
  });

  test("navigating to section hash scrolls into view", async ({ page }) => {
    await page.goto("./how#how-you-know-it-matches-your-machine");

    const section = page.locator("#how-you-know-it-matches-your-machine");
    await expect(section).toBeVisible();

    const inView = await section.evaluate((el: HTMLElement) => {
      const r = el.getBoundingClientRect();
      return r.top >= 0 && r.top < window.innerHeight;
    });
    expect(inView).toBe(true);
  });
});

test.describe("ImportBlock edge cases on /how", () => {
  test("rapid clicks — last click wins, timeout resets correctly", async ({ page }) => {
    await page.goto("./how");
    const btn = page.locator(".import-block-btn");

    for (let i = 0; i < 5; i++) {
      await btn.click();
    }

    await expect(btn).toHaveText("✓ Copied");
    await expect(btn).toHaveClass(/copied/);

    // Should reset to "Copy"
    await expect(btn).toHaveText("Copy", { timeout: 3000 });
    await expect(btn).not.toHaveClass(/copied/);
  });

  test("JS disabled — Copy button hidden, command text still visible", async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto("./how");

    // Button is hidden via no-js-hidden CSS
    await expect(page.locator(".import-block-btn")).not.toBeVisible();

    // Command text still visible
    await expect(page.locator(".import-block-cmd")).toBeVisible();
    await expect(page.locator(".import-block-cmd")).toContainText("llml import");

    await context.close();
  });

  test("clipboard API not available — no crash, UI still updates", async ({ page }) => {
    // Override clipboard API to simulate unavailability
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "clipboard", {
        value: undefined,
        configurable: true,
      });
    });

    await page.goto("./how");
    const btn = page.locator(".import-block-btn");

    await expect(btn).toBeVisible();
    await btn.click();

    // Should still show feedback even though clipboard was unavailable
    await expect(btn).toHaveText("✓ Copied");
    await expect(btn).toHaveClass(/copied/);

    // Should reset
    await expect(btn).toHaveText("Copy", { timeout: 3000 });
  });
});
