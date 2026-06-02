import { test, expect } from "@playwright/test";

const HOME = ".";

// ---------------------------------------------------------------------------
// Title & meta
// ---------------------------------------------------------------------------
test.describe("Page title and meta", () => {
  test("title suffix is 'LLM Launcher'", async ({ page }) => {
    await page.goto(HOME);
    await expect(page).toHaveTitle(/LLM Launcher/);
  });

  test("meta description includes launcher framing", async ({ page }) => {
    await page.goto(HOME);
    const meta = page.locator('meta[name="description"]');
    const content = await meta.getAttribute("content");
    expect(content).toContain("llml");
    expect(content).not.toContain("registry of TOML profiles");
  });

  test("nav wordmark reads 'LLM Launcher'", async ({ page }) => {
    await page.goto(HOME);
    await expect(page.locator("header")).toContainText("LLM Launcher");
  });

  test("footer reads 'LLM Launcher'", async ({ page }) => {
    await page.goto(HOME);
    await expect(page.locator("footer")).toContainText("LLM Launcher");
  });
});

// ---------------------------------------------------------------------------
// Hero section
// ---------------------------------------------------------------------------
test.describe("Hero section", () => {
  test("hero headline addresses pain of re-deriving flags", async ({ page }) => {
    await page.goto(HOME);
    const h1 = page.locator(".home-hero h1");
    await expect(h1).toBeVisible();
    await expect(h1).toContainText("shell history");
  });

  test("hero subhead mentions the loop", async ({ page }) => {
    await page.goto(HOME);
    await expect(page.getByText("Pick a model, pick a profile")).toBeVisible();
  });

  test("screenshot is visible with alt and eager loading", async ({ page }) => {
    await page.goto(HOME);
    const img = page.locator(".home-hero img");
    await expect(img).toBeVisible();
    await expect(img).toHaveAttribute("alt");
    const alt = await img.getAttribute("alt");
    expect(alt).toBeTruthy();
    expect(alt!.length).toBeGreaterThan(10);
    await expect(img).toHaveAttribute("loading", "eager");
    await expect(img).toHaveAttribute("width");
    await expect(img).toHaveAttribute("height");
  });

  test("install command is visible and shows curl installer", async ({ page }) => {
    await page.goto(HOME);
    const cmdBlock = page.locator(".home-hero [style*='surface-inverse']").first();
    await expect(cmdBlock).toBeVisible();
    await expect(cmdBlock).toContainText("curl");
    await expect(cmdBlock).toContainText("install.sh");
  });

  test("install copy button works", async ({ page }) => {
    await page.goto(HOME);
    const btn = page.locator(".hero-copy-btn");
    await expect(btn).toBeVisible();
    await expect(btn).toHaveText("Copy");

    await btn.click();
    await expect(btn).toHaveText("✓ Copied");

    await expect(btn).toHaveText("Copy", { timeout: 3000 });
  });

  test("Install CTA links to GitHub", async ({ page }) => {
    await page.goto(HOME);
    const cta = page.locator('.home-hero a[href="https://github.com/flyingnobita/llml"]');
    await expect(cta).toBeVisible();
  });

  test("Browse CTA links to /browse", async ({ page }) => {
    await page.goto(HOME);
    const cta = page.locator('.home-hero a[href$="/browse"]');
    await expect(cta).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// Loop band
// ---------------------------------------------------------------------------
test.describe("Loop band", () => {
  test("section heading is 'What llml does'", async ({ page }) => {
    await page.goto(HOME);
    await expect(page.getByText("What llml does")).toBeVisible();
  });

  test("three beats present — Scan, Pick, Launch", async ({ page }) => {
    await page.goto(HOME);
    await expect(page.locator(".home-loop").getByRole("heading", { name: "Scan" })).toBeVisible();
    await expect(page.locator(".home-loop").getByRole("heading", { name: "Pick" })).toBeVisible();
    await expect(page.locator(".home-loop").getByRole("heading", { name: "Launch" })).toBeVisible();
  });

  test("Read more link points to /how", async ({ page }) => {
    await page.goto(HOME);
    const link = page.locator('.home-loop a[href$="/how"]');
    await expect(link).toBeVisible();
    await expect(link).toContainText(/Read more/);
  });
});

// ---------------------------------------------------------------------------
// Catalog payoff
// ---------------------------------------------------------------------------
test.describe("Catalog payoff", () => {
  test("section heading is 'Don't start from scratch.'", async ({ page }) => {
    await page.goto(HOME);
    await expect(page.getByText("Don't start from scratch.")).toBeVisible();
  });

  test("honest caveat about hardware differences", async ({ page }) => {
    await page.goto(HOME);
    await expect(page.getByText("starting points, not guarantees")).toBeVisible();
  });

  test("ImportBlock visible with llml import command", async ({ page }) => {
    await page.goto(HOME);
    const cmdBlock = page.locator(".home-catalog-payoff .import-block-cmd");
    await expect(cmdBlock).toBeVisible();
    await expect(cmdBlock).toContainText("llml import");
  });

  test("sample import command uses Qwen3.6-enable-thinking.toml", async ({ page }) => {
    await page.goto(HOME);
    const cmdBlock = page.locator(".home-catalog-payoff .import-block-cmd");
    await expect(cmdBlock).toContainText("Qwen3.6-enable-thinking.toml");
  });

  test("sample profile URL returns 200", async ({ page }) => {
    const response = await page.request.get(
      "https://llml.dev/profiles/Qwen3.6-enable-thinking.toml"
    );
    expect(response.status()).toBe(200);
  });

  test("profile link points to /browse", async ({ page }) => {
    await page.goto(HOME);
    const link = page.locator('.home-catalog-payoff a[href$="/browse"]');
    await expect(link).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// BrowsePreview
// ---------------------------------------------------------------------------
test.describe("BrowsePreview", () => {
  test("section heading is 'Recently updated' when profiles exist", async ({ page }) => {
    await page.goto(HOME);
    await expect(page.getByText("Recently updated")).toBeVisible();
  });

  test("profile cards link to detail pages", async ({ page }) => {
    await page.goto(HOME);
    const cards = page.locator('.home-browse a[href*="/profile/"]');
    const count = await cards.count();
    expect(count).toBeGreaterThanOrEqual(1);
    await expect(cards.first()).toBeVisible();
  });

  test("Browse all link present with profile count", async ({ page }) => {
    await page.goto(HOME);
    const link = page.locator('.home-browse a[href$="/browse"]');
    await expect(link).toBeVisible();
    await expect(link).toContainText(/Browse all/);
  });
});

// ---------------------------------------------------------------------------
// WhyDifferent
// ---------------------------------------------------------------------------
test.describe("WhyDifferent", () => {
  test("first card is about importable recipes", async ({ page }) => {
    await page.goto(HOME);
    await expect(page.getByText("Importable recipes, not fit data")).toBeVisible();
  });

  test("portability card still present", async ({ page }) => {
    await page.goto(HOME);
    await expect(page.getByText("Portable, not platform-locked")).toBeVisible();
  });

  test("reproducible imports card still present", async ({ page }) => {
    await page.goto(HOME);
    await expect(page.getByText("Reproducible imports")).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// ContributeCTA
// ---------------------------------------------------------------------------
test.describe("ContributeCTA", () => {
  test("CTA heading is 'Got a profile that just works?'", async ({ page }) => {
    await page.goto(HOME);
    await expect(page.getByText("Got a profile that just works?")).toBeVisible();
  });

  test("Open a PR button visible", async ({ page }) => {
    await page.goto(HOME);
    await expect(page.getByText("Open a PR ↗")).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// Edge cases
// ---------------------------------------------------------------------------
test.describe("Edge cases", () => {
  test("hero heading fits at 375px without overflow", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(HOME);
    const h1 = page.locator(".home-hero h1");
    await expect(h1).toBeVisible();
    const fontSize = await h1.evaluate((el) =>
      window.getComputedStyle(el).fontSize,
    );
    expect(parseFloat(fontSize)).toBeLessThanOrEqual(40);
  });

  test("no horizontal overflow at 375px", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(HOME);
    const scrollW = await page.evaluate(() => document.body.scrollWidth);
    expect(scrollW).toBeLessThanOrEqual(375 + 2);
  });

  test("hero copy button degrades gracefully without clipboard", async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "clipboard", {
        value: undefined,
        configurable: true,
      });
    });

    await page.goto(HOME);
    const btn = page.locator(".hero-copy-btn");
    await expect(btn).toBeVisible();
    await btn.click();
    // Should still show feedback even without clipboard
    await expect(btn).toHaveText("✓ Copied");
    await expect(btn).toHaveText("Copy", { timeout: 3000 });
  });

  test("screenshot 404 — alt text still visible", async ({ page }) => {
    // Intercept the screenshot request and return 404
    await page.route("**/llml-screenshot.png", (route) => route.abort());
    await page.goto(HOME);

    // The img element should still be present
    const img = page.locator(".home-hero img");
    await expect(img).toBeVisible();

    // Alt text should be non-empty (browsers show alt on broken images)
    const alt = await img.getAttribute("alt");
    expect(alt).toBeTruthy();
    expect(alt!.length).toBeGreaterThan(5);
  });
});
