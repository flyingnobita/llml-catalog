import { expect, test } from "@playwright/test";

function expectSameOriginProfileUrl(href: string | null, pageUrl: string, expectedHash = "") {
  expect(href).toBeTruthy();
  expect(href).not.toMatch(/^\/\//);

  const resolved = new URL(href!, pageUrl);
  const current = new URL(pageUrl);
  expect(resolved.origin).toBe(current.origin);
  expect(resolved.pathname).toMatch(/\/profile\/[^/]+\/?$/);
  expect(resolved.hash).toBe(expectedHash);
}

test.describe("Browse profile links", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("./browse");
    await page.waitForSelector(".result-row");
  });

  test("row profile names link to same-origin profile pages", async ({ page }) => {
    const href = await page.locator(".result-row > a").first().getAttribute("href");
    expectSameOriginProfileUrl(href, page.url());
  });

  test("row Import buttons link to the profile import block", async ({ page }) => {
    const rowHref = await page.locator(".result-row > a").first().getAttribute("href");
    const importHref = await page.locator(".result-row a.import-btn").first().getAttribute("href");

    expectSameOriginProfileUrl(importHref, page.url(), "#import");
    expect(importHref).not.toBe(rowHref);
    await expect(page.locator(".result-row a.import-btn").first()).toHaveText("Import");
  });

  test("compare overlay profile links stay same-origin", async ({ page }) => {
    await page.locator(".compare-check").nth(0).check();
    await page.locator(".compare-check").nth(1).check();
    await page.locator("#compare-open").click();

    const gridHref = await page.locator("#compare-grid a").first().getAttribute("href");
    const actionHref = await page.locator("#compare-actions a").first().getAttribute("href");

    expectSameOriginProfileUrl(gridHref, page.url());
    expectSameOriginProfileUrl(actionHref, page.url());
  });
});
