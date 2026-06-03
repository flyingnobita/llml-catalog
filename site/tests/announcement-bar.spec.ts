import { test, expect } from "@playwright/test";

const HOME = ".";
const BROWSE = "./browse";
const ANNOUNCE_KEY = "llml-announce-dismissed";
const ANNOUNCE_VERSION = "growing-2026-06";

// ---------------------------------------------------------------------------
// Visibility — bar renders on every page by default
// ---------------------------------------------------------------------------
test.describe("Announcement bar — default visibility", () => {
  test("bar is visible on the home page", async ({ page }) => {
    await page.goto(HOME);
    const bar = page.locator("#announce-bar");
    await expect(bar).toBeVisible();
  });

  test("bar is visible on the browse page", async ({ page }) => {
    await page.goto(BROWSE);
    const bar = page.locator("#announce-bar");
    await expect(bar).toBeVisible();
  });

  test("bar contains the growing-catalog message", async ({ page }) => {
    await page.goto(HOME);
    const bar = page.locator("#announce-bar");
    await expect(bar).toContainText("regularly");
    await expect(bar).toContainText("watch the repo");
  });

  test("'Watch the repo' link points to the llml-catalog GitHub repo", async ({ page }) => {
    await page.goto(HOME);
    const link = page.locator('#announce-bar a[href*="llml-catalog"]');
    await expect(link).toBeVisible();
    const href = await link.getAttribute("href");
    expect(href).toBe("https://github.com/flyingnobita/llml-catalog");
  });

  test("link opens in a new tab (target=_blank with noopener)", async ({ page }) => {
    await page.goto(HOME);
    const link = page.locator('#announce-bar a[href*="llml-catalog"]');
    await expect(link).toHaveAttribute("target", "_blank");
    const rel = await link.getAttribute("rel");
    expect(rel).toContain("noopener");
  });
});

// ---------------------------------------------------------------------------
// Dismiss — clicking × hides the bar
// ---------------------------------------------------------------------------
test.describe("Announcement bar — dismissal", () => {
  test("clicking × hides the bar", async ({ page }) => {
    await page.goto(HOME);
    const bar = page.locator("#announce-bar");
    const btn = page.locator("#announce-dismiss");

    await expect(bar).toBeVisible();
    await btn.click();
    await expect(bar).not.toBeVisible();
  });

  test("dismiss writes the versioned key to localStorage", async ({ page }) => {
    await page.goto(HOME);
    await page.locator("#announce-dismiss").click();

    const value = await page.evaluate(
      (key) => localStorage.getItem(key),
      ANNOUNCE_KEY
    );
    expect(value).toBe(ANNOUNCE_VERSION);
  });

  test("bar stays hidden after page reload once dismissed", async ({ page }) => {
    await page.goto(HOME);
    await page.locator("#announce-dismiss").click();
    await expect(page.locator("#announce-bar")).not.toBeVisible();

    await page.reload();
    await expect(page.locator("#announce-bar")).not.toBeVisible();
  });

  test("bar is hidden on /browse after dismissal on home", async ({ page }) => {
    await page.goto(HOME);
    await page.locator("#announce-dismiss").click();

    await page.goto(BROWSE);
    await expect(page.locator("#announce-bar")).not.toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// No-flash — bar is hidden before paint when localStorage is set
// ---------------------------------------------------------------------------
test.describe("Announcement bar — no-flash (pre-paint hide)", () => {
  test("bar hidden on load when localStorage already set (no flash)", async ({ browser }) => {
    const context = await browser.newContext();
    // Pre-seed localStorage before the page loads
    await context.addInitScript(
      ({ key, version }: { key: string; version: string }) => {
        localStorage.setItem(key, version);
      },
      { key: ANNOUNCE_KEY, version: ANNOUNCE_VERSION }
    );
    const page = await context.newPage();
    await page.goto(HOME);
    // data-announce="off" should be on <html> (set by blocking head script)
    await expect(page.locator("html")).toHaveAttribute("data-announce", "off");
    await expect(page.locator("#announce-bar")).not.toBeVisible();
    await context.close();
  });

  test("bar visible on first visit (no localStorage entry)", async ({ browser }) => {
    const context = await browser.newContext();
    await context.addInitScript(() => localStorage.clear());
    const page = await context.newPage();
    await page.goto(HOME);
    await expect(page.locator("#announce-bar")).toBeVisible();
    await context.close();
  });
});

// ---------------------------------------------------------------------------
// localStorage blocked — graceful degradation
// ---------------------------------------------------------------------------
test.describe("Announcement bar — localStorage failures", () => {
  test("dismiss works for session even when localStorage is blocked", async ({ browser }) => {
    const context = await browser.newContext();
    await context.addInitScript(() => {
      Storage.prototype.setItem = () => { throw new Error("Storage full"); };
      Storage.prototype.getItem = () => { throw new Error("Storage blocked"); };
    });
    const page = await context.newPage();
    await page.goto(HOME);

    // Bar visible (getItem throws → treated as not dismissed)
    const bar = page.locator("#announce-bar");
    await expect(bar).toBeVisible();

    // Dismiss still hides for this session without crashing
    await page.locator("#announce-dismiss").click();
    await expect(bar).not.toBeVisible();

    await context.close();
  });
});

// ---------------------------------------------------------------------------
// Accessibility
// ---------------------------------------------------------------------------
test.describe("Announcement bar — accessibility", () => {
  test("bar has role=region and aria-label", async ({ page }) => {
    await page.goto(HOME);
    const bar = page.locator("#announce-bar");
    await expect(bar).toHaveAttribute("role", "region");
    await expect(bar).toHaveAttribute("aria-label", "Site announcement");
  });

  test("dismiss button has descriptive aria-label", async ({ page }) => {
    await page.goto(HOME);
    const btn = page.locator("#announce-dismiss");
    await expect(btn).toHaveAttribute("aria-label", "Dismiss announcement");
  });
});

// ---------------------------------------------------------------------------
// Mobile — bar wraps cleanly and dismiss button stays reachable
// ---------------------------------------------------------------------------
test.describe("Announcement bar — mobile", () => {
  test("bar visible and dismiss button reachable at 375px", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(HOME);

    const bar = page.locator("#announce-bar");
    await expect(bar).toBeVisible();

    const btn = page.locator("#announce-dismiss");
    await expect(btn).toBeVisible();
    const box = await btn.boundingBox();
    expect(box).not.toBeNull();
    // Touch target: at least 28px (set as 18px padding + text — minimum viable)
    expect(box!.width).toBeGreaterThanOrEqual(24);
    expect(box!.height).toBeGreaterThanOrEqual(24);
  });

  test("no horizontal overflow from the bar at 375px", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(HOME);
    const scrollW = await page.evaluate(() => document.body.scrollWidth);
    expect(scrollW).toBeLessThanOrEqual(375 + 2);
  });
});
