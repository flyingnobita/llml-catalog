import { test, expect } from "@playwright/test";

const MOBILE = { width: 375, height: 812 } as const;
const TABLET = { width: 768, height: 1024 } as const;

async function expectNoHorizontalOverflow(page: Parameters<typeof test>[1]) {
  const scrollW = await page.evaluate(() => document.body.scrollWidth);
  const vpW = await page.evaluate(() => window.innerWidth);
  expect(scrollW).toBeLessThanOrEqual(vpW + 2);
}

// Use the first profile (alphabetically) for profile detail tests
const PROFILE_ID = "gemma-4-26b-a4b-thinking-q4_k_xl";

/* ------------------------------------------------------------------ */
/*  index.astro                                                        */
/* ------------------------------------------------------------------ */
test.describe("Home page (/) — mobile responsive", () => {
  test("no horizontal overflow at 375px", async ({ page }) => {
    await page.setViewportSize(MOBILE);
    await page.goto("./");
    await expectNoHorizontalOverflow(page);
  });

  test("hero heading is visible and fits", async ({ page }) => {
    await page.setViewportSize(MOBILE);
    await page.goto("./");
    const h1 = page.locator(".home-hero h1");
    await expect(h1).toBeVisible();
    const fontSize = await h1.evaluate(
      (el) => window.getComputedStyle(el).fontSize,
    );
    expect(parseFloat(fontSize)).toBeLessThanOrEqual(40);
  });

  test("hero screenshot is visible with alt text", async ({ page }) => {
    await page.setViewportSize(MOBILE);
    await page.goto("./");
    const img = page.locator(".home-hero img");
    await expect(img).toBeVisible();
    await expect(img).toHaveAttribute("alt");
  });

  test("loop band three steps visible", async ({ page }) => {
    await page.setViewportSize(MOBILE);
    await page.goto("./");
    await expect(page.locator(".home-loop").getByRole("heading", { name: "Scan" })).toBeVisible();
    await expect(page.locator(".home-loop").getByRole("heading", { name: "Pick" })).toBeVisible();
    await expect(page.locator(".home-loop").getByRole("heading", { name: "Launch" })).toBeVisible();
  });

  test("catalog payoff section visible", async ({ page }) => {
    await page.setViewportSize(MOBILE);
    await page.goto("./");
    await expect(page.getByText("Don't start from scratch.")).toBeVisible();
  });

  test("BrowsePreview section visible", async ({ page }) => {
    await page.setViewportSize(MOBILE);
    await page.goto("./");
    await expect(page.getByText("Recently updated")).toBeVisible();
    // Profile cards should be present
    const cards = page.locator(".home-browse").locator('a[href*="/profile/"]');
    await expect(cards.first()).toBeVisible();
  });

  test("WhyDifferent section visible", async ({ page }) => {
    await page.setViewportSize(MOBILE);
    await page.goto("./");
    await expect(page.getByText("Importable recipes, not fit data")).toBeVisible();
  });

  test("ContributeCTA visible", async ({ page }) => {
    await page.setViewportSize(MOBILE);
    await page.goto("./");
    await expect(
      page.getByText("Got a profile that just works?"),
    ).toBeVisible();
  });

  test("hero CTAs visible", async ({ page }) => {
    await page.setViewportSize(MOBILE);
    await page.goto("./");
    const hero = page.locator(".home-hero");
    await expect(hero.locator('a[href="https://github.com/flyingnobita/llml"]')).toBeVisible();
    await expect(hero.locator('a[href*="browse"]')).toBeVisible();
  });

  test("no horizontal overflow at tablet (768px)", async ({ page }) => {
    await page.setViewportSize(TABLET);
    await page.goto("./");
    await expectNoHorizontalOverflow(page);
  });

  test("BrowsePreview is 2-col at tablet", async ({ page }) => {
    await page.setViewportSize(TABLET);
    await page.goto("./");
    const section = page.locator(".home-browse");
    const grid = section.locator('[style*="grid-template-columns"]');
    const cols = await grid.evaluate((el) =>
      window.getComputedStyle(el).gridTemplateColumns,
    );
    const colCount = cols.split(" ").length;
    expect(colCount).toBe(2);
  });
});

/* ------------------------------------------------------------------ */
/*  browse.astro                                                       */
/* ------------------------------------------------------------------ */
test.describe("Browse page (/browse) — mobile responsive", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(MOBILE);
    await page.goto("./browse");
    await page.waitForSelector(".result-row");
  });

  test("no horizontal page scroll at 375px", async ({ page }) => {
    const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(scrollWidth).toBeLessThanOrEqual(375 + 2);
  });

  test("header section visible", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("Profiles");
  });

  test("filter toggle is visible, sidebar is hidden by default", async ({ page }) => {
    await expect(page.locator("#filter-toggle")).toBeVisible();
    const transform = await page.locator("#filters").evaluate(el =>
      getComputedStyle(el).transform,
    );
    // translateX(100%) produces a non-identity matrix
    expect(transform).not.toBe("none");
  });

  test("clicking filter toggle opens drawer", async ({ page }) => {
    await page.click("#filter-toggle");
    await expect(page.locator("#filters")).toHaveAttribute("data-open", "true");
  });

  test("backdrop click closes drawer", async ({ page }) => {
    await page.click("#filter-toggle");
    await page.click("#filter-backdrop");
    await expect(page.locator("#filters")).toHaveAttribute("data-open", "false");
  });

  test("result rows render as full-width cards", async ({ page }) => {
    const display = await page.locator(".result-row").first().evaluate(el =>
      getComputedStyle(el).display,
    );
    expect(display).toBe("flex");
  });

  test("Import button is reachable without horizontal scroll", async ({ page }) => {
    const btn = page.locator(".result-row a.import-btn").first();
    const box = await btn.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.x + box!.width).toBeLessThanOrEqual(375 + 2);
  });

  test("long profile names wrap and card fits viewport", async ({ page }) => {
    const card = page.locator(".result-row").filter({ hasText: "gemma" }).first();
    const box = await card.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeLessThanOrEqual(375 - 32);
  });

  test("filter count badge updates when filter is selected", async ({ page }) => {
    // Open drawer and click a filter
    await page.click("#filter-toggle");
    await page.locator(".filter-opt").first().click();
    await expect(page.locator("#filter-count-badge")).toHaveText("1");
  });

  test("sort control is hidden", async ({ page }) => {
    await expect(page.locator("#sort")).not.toBeVisible();
  });

  test("filter options toggle active state on click", async ({ page }) => {
    // Open drawer first
    await page.click("#filter-toggle");
    const filterBtn = page.locator(".filter-opt").first();
    const dot = filterBtn.locator(".filter-dot");

    // Initial state: inactive
    const initialBg = await dot.evaluate((el) =>
      window.getComputedStyle(el).backgroundColor,
    );
    expect(initialBg).toMatch(/rgba?\(0,\s*0,\s*0,\s*0\)|transparent/);

    // Click to activate
    await filterBtn.click();

    // Active state: should have a background color
    const activeBg = await dot.evaluate((el) =>
      window.getComputedStyle(el).backgroundColor,
    );
    expect(activeBg).not.toMatch(/rgba?\(0,\s*0,\s*0,\s*0\)|transparent/);
  });

  test("compare tray hidden with <2 checked", async ({ page }) => {
    await expect(page.locator("#compare-tray")).not.toBeVisible();
  });

  test("compare tray appears with 2+ checked", async ({ page }) => {
    const checks = page.locator(".compare-check");
    await checks.nth(0).check();
    await checks.nth(1).check();
    await expect(page.locator("#compare-tray")).toBeVisible();
  });

  test("compare overlay opens and closes on mobile", async ({ page }) => {
    await page.locator(".compare-check").nth(0).check();
    await page.locator(".compare-check").nth(1).check();
    await page.locator("#compare-open").click();
    await expect(page.locator("#compare-overlay")).toBeVisible();
    await page.locator("#compare-backdrop").click({ position: { x: 10, y: 10 } });
    await expect(page.locator("#compare-overlay")).not.toBeVisible();
  });

  test("no results message hidden with profiles present", async ({ page }) => {
    await expect(page.locator("#no-results")).not.toBeVisible();
  });

  test("search filters results on mobile", async ({ page }) => {
    await page.locator("#search").fill("nonexistentxyz123");
    await expect(page.locator("#no-results")).toBeVisible();
  });

  test("filter sidebar in side-by-side layout at tablet", async ({ page }) => {
    await page.setViewportSize(TABLET);
    await page.goto("./browse");
    const gridContainer = page.locator(
      '[style*="grid-template-columns"]',
    ).first();
    const cols = await gridContainer.evaluate((el) =>
      window.getComputedStyle(el).gridTemplateColumns,
    );
    const colCount = cols.split(" ").length;
    expect(colCount).toBeGreaterThanOrEqual(2);
  });
});

/* ------------------------------------------------------------------ */
/*  contribute.astro                                                   */
/* ------------------------------------------------------------------ */
test.describe("Contribute page (/contribute) — mobile responsive", () => {
  test("no horizontal overflow at 375px", async ({ page }) => {
    await page.setViewportSize(MOBILE);
    await page.goto("./contribute");
    await expectNoHorizontalOverflow(page);
  });

  test("hero heading is visible and fits", async ({ page }) => {
    await page.setViewportSize(MOBILE);
    await page.goto("./contribute");
    const h1 = page.locator("h1");
    await expect(h1).toBeVisible();
    const fontSize = await h1.evaluate(
      (el) => window.getComputedStyle(el).fontSize,
    );
    expect(parseFloat(fontSize)).toBeLessThanOrEqual(34);
  });

  test("TOML snippet visible", async ({ page }) => {
    await page.setViewportSize(MOBILE);
    await page.goto("./contribute");
    await expect(page.locator("pre")).toBeVisible();
  });

  test("CTA buttons visible", async ({ page }) => {
    await page.setViewportSize(MOBILE);
    await page.goto("./contribute");
    // "Open a PR ↗" — the ↗ makes it unique
    await expect(page.getByText("Open a PR ↗")).toBeVisible();
    await expect(page.getByText("Read the schema")).toBeVisible();
  });

  test("content sections visible", async ({ page }) => {
    await page.setViewportSize(MOBILE);
    await page.goto("./contribute");
    // Each heading appears twice (sidebar link + article heading), use .first()
    await expect(page.getByText("What belongs in the catalog").first()).toBeVisible();
    await expect(page.getByText("What a strong profile includes").first()).toBeVisible();
    await expect(page.getByText("PR flow", { exact: true })).toBeVisible();
  });

  test("validation table visible with rules", async ({ page }) => {
    await page.setViewportSize(MOBILE);
    await page.goto("./contribute");
    // schema_version appears in both TOML snippet and validation table
    await expect(page.getByText("schema_version").first()).toBeVisible();
    await expect(page.locator("text=required").first()).toBeVisible();
  });

  test("no horizontal overflow at tablet (768px)", async ({ page }) => {
    await page.setViewportSize(TABLET);
    await page.goto("./contribute");
    await expectNoHorizontalOverflow(page);
  });
});

/* ------------------------------------------------------------------ */
/*  profile/[id].astro                                                 */
/* ------------------------------------------------------------------ */
test.describe("Profile detail page — mobile responsive", () => {
  test("no horizontal overflow at 375px", async ({ page }) => {
    await page.setViewportSize(MOBILE);
    await page.goto(`./profile/${PROFILE_ID}`);
    await expectNoHorizontalOverflow(page);
  });

  test("profile name and fit visible", async ({ page }) => {
    await page.setViewportSize(MOBILE);
    await page.goto(`./profile/${PROFILE_ID}`);
    await expect(page.locator("h1")).toBeVisible();
    await expect(
      page.locator("section").first().locator("p").first(),
    ).toBeVisible();
  });

  test("facts grid visible on mobile", async ({ page }) => {
    await page.setViewportSize(MOBILE);
    await page.goto(`./profile/${PROFILE_ID}`);
    // Facts grid should have at least one MetaCell visible
    const grid = page.locator("section").nth(1);
    await expect(grid).toBeVisible();
  });

  test("install block visible", async ({ page }) => {
    await page.setViewportSize(MOBILE);
    await page.goto(`./profile/${PROFILE_ID}`);
    // InstallBlock has tabs with "Copy" button
    await expect(page.getByText("Copy").first()).toBeVisible();
  });

  test("browse back link visible", async ({ page }) => {
    await page.setViewportSize(MOBILE);
    await page.goto(`./profile/${PROFILE_ID}`);
    // "← browse" — use the unique arrow prefix
    await expect(page.getByText("← browse")).toBeVisible();
  });

  test("badges visible", async ({ page }) => {
    await page.setViewportSize(MOBILE);
    await page.goto(`./profile/${PROFILE_ID}`);
    // "llama.cpp" appears many times on the page — check the first badge
    await expect(page.getByText("llama.cpp").first()).toBeVisible();
  });

  test("content sections visible", async ({ page }) => {
    await page.setViewportSize(MOBILE);
    await page.goto(`./profile/${PROFILE_ID}`);
    await expect(page.getByText("Why this profile exists")).toBeVisible();
    await expect(page.getByText("Launch configuration")).toBeVisible();
    await expect(page.getByText("Hardware assumptions")).toBeVisible();
  });

  test("provenance panel visible", async ({ page }) => {
    await page.setViewportSize(MOBILE);
    await page.goto(`./profile/${PROFILE_ID}`);
    await expect(page.getByText("Source provenance")).toBeVisible();
  });

  test("no horizontal overflow at tablet (768px)", async ({ page }) => {
    await page.setViewportSize(TABLET);
    await page.goto(`./profile/${PROFILE_ID}`);
    await expectNoHorizontalOverflow(page);
  });
});
