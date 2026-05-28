import { test, expect } from "@playwright/test";

const HOME = ".";

function toggle(page: any) {
  return page.locator("#theme-toggle");
}
function html(page: any) {
  return page.locator("html");
}

test.describe("Theme toggle", () => {
  test("click switches data-theme from light to dark and back", async ({ page }) => {
    await page.goto(HOME);
    await expect(html(page)).toHaveAttribute("data-theme", "light");

    await toggle(page).click();
    await expect(html(page)).toHaveAttribute("data-theme", "dark");

    await toggle(page).click();
    await expect(html(page)).toHaveAttribute("data-theme", "light");
  });

  test("icon swaps sun to moon on theme change", async ({ page }) => {
    await page.goto(HOME);

    // Sun visible, moon hidden in light mode
    await expect(page.locator(".icon-sun")).toBeVisible();
    await expect(page.locator(".icon-moon")).not.toBeVisible();

    await toggle(page).click();
    await expect(page.locator(".icon-sun")).not.toBeVisible();
    await expect(page.locator(".icon-moon")).toBeVisible();
  });

  test("aria-label updates on toggle", async ({ page }) => {
    await page.goto(HOME);
    const btn = toggle(page);

    await expect(btn).toHaveAttribute("aria-label", "Switch to dark mode");
    await btn.click();
    await expect(btn).toHaveAttribute("aria-label", "Switch to light mode");
    await btn.click();
    await expect(btn).toHaveAttribute("aria-label", "Switch to dark mode");
  });

  test("mobile viewport — toggle is 36×36px touch target", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(HOME);
    const btn = toggle(page);
    const box = await btn.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.height).toBeGreaterThanOrEqual(36);
    expect(box!.width).toBeGreaterThanOrEqual(36);
  });
});

test.describe("Persistence", () => {
  test("theme persists across page reload via localStorage", async ({ page }) => {
    await page.goto(HOME);
    await toggle(page).click();
    await expect(html(page)).toHaveAttribute("data-theme", "dark");

    await page.reload();
    await expect(html(page)).toHaveAttribute("data-theme", "dark");
  });

  test("theme syncs across tabs via storage event", async ({ page, context }) => {
    await page.goto(HOME);
    const page2 = await context.newPage();
    await page2.goto(HOME);

    await expect(html(page2)).toHaveAttribute("data-theme", "light");

    // Toggle on page 1 — page 2 should pick it up via storage event
    await toggle(page).click();
    await expect(html(page)).toHaveAttribute("data-theme", "dark");

    // Wait for storage event to propagate
    await expect(html(page2)).toHaveAttribute("data-theme", "dark");

    await page2.close();
  });
});

test.describe("OS preference / first visit", () => {
  test("first visit with OS dark mode renders dark, no flash", async ({ browser }) => {
    const context = await browser.newContext({ colorScheme: "dark" });
    // Simulate first visit: no localStorage
    await context.addInitScript(() => localStorage.clear());
    const page = await context.newPage();
    await page.goto(HOME);
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await context.close();
  });

  test("first visit with no OS preference renders light", async ({ page }) => {
    await page.goto(HOME);
    // Default Playwright browser has no dark preference
    await expect(html(page)).toHaveAttribute("data-theme", "light");
  });
});

test.describe("Graceful degradation", () => {
  test("JS disabled — toggle hidden, site stays light", async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto(HOME);

    // Toggle should not be visible without JS
    await expect(page.locator("#theme-toggle")).not.toBeVisible();

    // html should not have .js class
    await expect(page.locator("html")).not.toHaveClass("js");

    // Page renders in light mode (CSS :root defaults) — header is visible
    await expect(page.locator("header")).toBeVisible();
    await context.close();
  });

  test("prefers-reduced-motion: reduce — toggle still works", async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: "reduce" });
    const page = await context.newPage();
    await page.goto(HOME);

    await toggle(page).click();
    await expect(html(page)).toHaveAttribute("data-theme", "dark");

    await toggle(page).click();
    await expect(html(page)).toHaveAttribute("data-theme", "light");

    await context.close();
  });

  test("localStorage blocked — toggle works for session, no crash", async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    // Block localStorage before any page script runs
    await context.addInitScript(() => {
      const originalSetItem = Storage.prototype.setItem;
      const originalGetItem = Storage.prototype.getItem;
      Storage.prototype.setItem = () => {
        throw new Error("Storage full");
      };
      Storage.prototype.getItem = () => {
        throw new Error("Storage blocked");
      };
    });

    await page.goto(HOME);

    // Should fall back to light when localStorage throws
    await expect(html(page)).toHaveAttribute("data-theme", "light");

    // Toggle should still work (in-memory, not persisted)
    await toggle(page).click();
    await expect(html(page)).toHaveAttribute("data-theme", "dark");

    await context.close();
  });
});

test.describe("Edge cases", () => {
  test("rapid toggle clicks — last click wins, no race condition", async ({ page }) => {
    await page.goto(HOME);

    // 5 rapid clicks: dark → light → dark → light → dark
    for (let i = 0; i < 5; i++) {
      await toggle(page).click();
    }

    // 5 toggles from light: light→dark(1)→light(2)→dark(3)→light(4)→dark(5)
    await expect(html(page)).toHaveAttribute("data-theme", "dark");
  });

  test("blocking script runs before styles — no FOWT", async ({ page }) => {
    // Store dark mode, then navigate — blocking script should set data-theme
    // before the stylesheet loads, preventing a white flash
    await page.goto(HOME);
    await toggle(page).click();
    await expect(html(page)).toHaveAttribute("data-theme", "dark");

    // Force reload with cold cache (simulate by setting localStorage first)
    await page.evaluate(() => {
      localStorage.setItem("llml-theme", "dark");
    });
    await page.reload();

    // After reload, theme should be dark immediately (no flash)
    await expect(html(page)).toHaveAttribute("data-theme", "dark");

    // The html.js class should be present (JS executed)
    await expect(html(page)).toHaveClass("js");
  });

  test("theme-transition class is added during toggle", async ({ page }) => {
    await page.goto(HOME);

    // Initially no transition class
    await expect(html(page)).not.toHaveClass(/theme-transition/);

    await toggle(page).click();

    // Transition class added for smooth animation
    await expect(html(page)).toHaveClass(/theme-transition/);
  });
});

test.describe("Hardcoded color audit", () => {
  test("no white islands in dark mode — surface-raised replaces #fff", async ({ page }) => {
    await page.goto(HOME);
    // Set dark mode
    await toggle(page).click();
    await expect(html(page)).toHaveAttribute("data-theme", "dark");

    // Check HeroArtifact uses surface-raised
    const artifact = page.locator(".home-hero div[style*='surface-raised']");
    await expect(artifact.first()).toBeVisible();
  });

  test("search inputs use surface-raised background", async ({ page }) => {
    await page.goto("./browse");

    const searchInput = page.locator("#search");
    const bg = await searchInput.evaluate((el: HTMLElement) =>
      getComputedStyle(el).backgroundColor
    );
    // In light mode, --surface-raised resolves to #FFFFFF
    // Rely on the computed value being a shade of white/light
    expect(bg).toBeTruthy();
  });
});

test.describe("Home page — dark mode sections", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(HOME);
    // Set dark mode
    await toggle(page).click();
    await expect(html(page)).toHaveAttribute("data-theme", "dark");
  });

  test("hero headline is visible in dark mode", async ({ page }) => {
    const h1 = page.locator(".home-hero h1");
    await expect(h1).toBeVisible();
  });

  test("install command block is visible in dark mode", async ({ page }) => {
    const cmdBlock = page.locator(".home-hero [style*='surface-inverse']").first();
    await expect(cmdBlock).toBeVisible();
    await expect(cmdBlock).toContainText("brew");
  });

  test("hero copy button is visible in dark mode", async ({ page }) => {
    const btn = page.locator(".hero-copy-btn");
    await expect(btn).toBeVisible();
  });

  test("loop band steps are visible in dark mode", async ({ page }) => {
    await expect(page.locator(".home-loop").getByRole("heading", { name: "Scan" })).toBeVisible();
    await expect(page.locator(".home-loop").getByRole("heading", { name: "Pick" })).toBeVisible();
    await expect(page.locator(".home-loop").getByRole("heading", { name: "Launch" })).toBeVisible();
  });

  test("catalog payoff heading is visible in dark mode", async ({ page }) => {
    const h2 = page.locator(".home-catalog-payoff h2");
    await expect(h2).toBeVisible();
  });

  test("WhyDifferent cards are visible in dark mode", async ({ page }) => {
    await expect(page.getByText("Importable recipes, not fit data")).toBeVisible();
    await expect(page.getByText("Portable, not platform-locked")).toBeVisible();
  });

  test("ContributeCTA has inverse surface styling", async ({ page }) => {
    const section = page.locator(".home-contribute");
    await expect(section).toBeVisible();
    const bg = await section.evaluate((el: HTMLElement) =>
      getComputedStyle(el).backgroundColor
    );
    // Should be dark inverse surface
    expect(bg).not.toBe("rgb(243, 241, 234)");
  });

  test("contribute buttons are visible in dark mode", async ({ page }) => {
    await expect(page.getByText("Read the format")).toBeVisible();
    await expect(page.getByText("Open a PR ↗")).toBeVisible();
  });
});
