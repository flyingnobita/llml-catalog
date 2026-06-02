import { test, expect } from "@playwright/test";

const PROFILE_URL = "./profile/nemotron-3-nano-4b-q8_0/";

function installBlock(page: any) {
  return page.locator("[data-component='install-block']");
}

// ---------------------------------------------------------------------------
// Test 41: Tab switching — Run / Install+run / Download
// ---------------------------------------------------------------------------
test.describe("InstallBlock tab switching", () => {
  test("Run tab is active by default", async ({ page }) => {
    await page.goto(PROFILE_URL);
    const runTab = page.locator(".ib-tab[data-tab='run']");
    await expect(runTab).toHaveClass(/active/);
    await expect(runTab).toHaveAttribute("aria-selected", "true");

    const runPanel = page.locator(".ib-panel[data-panel='run']");
    await expect(runPanel).toHaveClass(/active/);
  });

  test("clicking Install+run tab shows install panel", async ({ page }) => {
    await page.goto(PROFILE_URL);
    const installTab = page.locator(".ib-tab[data-tab='install']");
    await installTab.click();

    await expect(installTab).toHaveClass(/active/);
    await expect(installTab).toHaveAttribute("aria-selected", "true");
    await expect(page.locator(".ib-panel[data-panel='install']")).toHaveClass(/active/);

    // Run tab should no longer be active
    await expect(page.locator(".ib-tab[data-tab='run']")).not.toHaveClass(/active/);
    await expect(page.locator(".ib-panel[data-panel='run']")).not.toHaveClass(/active/);
  });

  test("clicking Download tab shows download panel", async ({ page }) => {
    await page.goto(PROFILE_URL);
    const downloadTab = page.locator(".ib-tab[data-tab='download']");
    await downloadTab.click();

    await expect(downloadTab).toHaveClass(/active/);
    await expect(downloadTab).toHaveAttribute("aria-selected", "true");
    await expect(page.locator(".ib-panel[data-panel='download']")).toHaveClass(/active/);

    // Run tab should no longer be active
    await expect(page.locator(".ib-tab[data-tab='run']")).not.toHaveClass(/active/);
  });

  test("cycling through all three tabs works", async ({ page }) => {
    await page.goto(PROFILE_URL);

    // Run → Install
    await page.locator(".ib-tab[data-tab='install']").click();
    await expect(page.locator(".ib-tab[data-tab='install']")).toHaveClass(/active/);

    // Install → Download
    await page.locator(".ib-tab[data-tab='download']").click();
    await expect(page.locator(".ib-tab[data-tab='download']")).toHaveClass(/active/);

    // Download → Run
    await page.locator(".ib-tab[data-tab='run']").click();
    await expect(page.locator(".ib-tab[data-tab='run']")).toHaveClass(/active/);
  });
});

// ---------------------------------------------------------------------------
// Test 42: Run tab copy button
// ---------------------------------------------------------------------------
test.describe("Run tab copy", () => {
  test("copy button present on Run tab", async ({ page }) => {
    await page.goto(PROFILE_URL);
    const runPanel = page.locator(".ib-panel[data-panel='run']");
    const copyBtn = runPanel.locator(".ib-copy");
    await expect(copyBtn).toBeVisible();
    await expect(copyBtn).toHaveText("Copy");
  });

  test("copy button has correct data-copy attribute with URL import command", async ({ page }) => {
    await page.goto(PROFILE_URL);
    const copyBtn = page.locator(".ib-panel[data-panel='run'] .ib-copy");
    const copyText = await copyBtn.getAttribute("data-copy");
    expect(copyText).toContain("llml import");
    expect(copyText).toContain("--activate");
  });

  test("Run tab shows prompt dollar sign and command text", async ({ page }) => {
    await page.goto(PROFILE_URL);
    const cmdText = page.locator(".ib-panel[data-panel='run'] .ib-cmd-text");
    await expect(cmdText).toBeVisible();
    // Should show $ prompt
    await expect(cmdText.locator(".ib-prompt")).toHaveText("$");
  });
});

// ---------------------------------------------------------------------------
// Test 43: Install+run OS sub-tab switching
// ---------------------------------------------------------------------------
test.describe("Install+run OS sub-tabs", () => {
  test("Mac tab is active by default in install panel", async ({ page }) => {
    await page.goto(PROFILE_URL);
    await page.locator(".ib-tab[data-tab='install']").click();

    const macTab = page.locator(".ib-os-tab[data-os='mac']");
    await expect(macTab).toHaveClass(/active/);
    await expect(macTab).toHaveAttribute("aria-selected", "true");

    const macPanel = page.locator(".ib-os-panel[data-os-panel='mac']");
    await expect(macPanel).toHaveClass(/active/);
  });

  test("clicking Linux tab switches OS panel", async ({ page }) => {
    await page.goto(PROFILE_URL);
    await page.locator(".ib-tab[data-tab='install']").click();

    const linuxTab = page.locator(".ib-os-tab[data-os='linux']");
    await linuxTab.click();

    await expect(linuxTab).toHaveClass(/active/);
    await expect(linuxTab).toHaveAttribute("aria-selected", "true");
    await expect(page.locator(".ib-os-panel[data-os-panel='linux']")).toHaveClass(/active/);

    // Mac tab should no longer be active
    await expect(page.locator(".ib-os-tab[data-os='mac']")).not.toHaveClass(/active/);
  });

  test("clicking Windows tab switches OS panel", async ({ page }) => {
    await page.goto(PROFILE_URL);
    await page.locator(".ib-tab[data-tab='install']").click();

    const windowsTab = page.locator(".ib-os-tab[data-os='windows']");
    await windowsTab.click();

    await expect(windowsTab).toHaveClass(/active/);
    await expect(windowsTab).toHaveAttribute("aria-selected", "true");
    await expect(page.locator(".ib-os-panel[data-os-panel='windows']")).toHaveClass(/active/);
  });

  test("Mac install panel shows brew install command", async ({ page }) => {
    await page.goto(PROFILE_URL);
    await page.locator(".ib-tab[data-tab='install']").click();

    const macPanel = page.locator(".ib-os-panel[data-os-panel='mac']");
    await expect(macPanel).toBeVisible();
    await expect(macPanel.locator(".ib-cmd-text")).toContainText("brew install");
  });

  test("Windows install panel shows scoop command", async ({ page }) => {
    await page.goto(PROFILE_URL);
    await page.locator(".ib-tab[data-tab='install']").click();

    const windowsTab = page.locator(".ib-os-tab[data-os='windows']");
    await windowsTab.click();

    const winPanel = page.locator(".ib-os-panel[data-os-panel='windows']");
    await expect(winPanel.locator(".ib-cmd-text")).toContainText("scoop");
  });

  test("each OS panel has its own copy button", async ({ page }) => {
    await page.goto(PROFILE_URL);
    await page.locator(".ib-tab[data-tab='install']").click();

    // Each OS panel should have a visible copy button
    for (const os of ["mac", "linux", "windows"]) {
      if (os !== "mac") {
        await page.locator(`.ib-os-tab[data-os='${os}']`).click();
      }
      const panel = page.locator(`.ib-os-panel[data-os-panel='${os}']`);
      await expect(panel.locator(".ib-copy")).toBeVisible();
    }
  });
});

// ---------------------------------------------------------------------------
// Test 44: Install+run copy includes both install and import commands
// ---------------------------------------------------------------------------
test.describe("Install+run copy content", () => {
  test("Mac copy data includes both install and import lines", async ({ page }) => {
    await page.goto(PROFILE_URL);
    await page.locator(".ib-tab[data-tab='install']").click();

    const copyBtn = page.locator(".ib-os-panel[data-os-panel='mac'] .ib-copy");
    const copyText = await copyBtn.getAttribute("data-copy");
    expect(copyText).toContain("brew install");
    expect(copyText).toContain("llml import");
    expect(copyText).toContain("--activate");
    // Should contain a newline separating install and import commands
    expect(copyText).toMatch(/\n/);
  });

  test("Windows copy data includes both scoop and import lines", async ({ page }) => {
    await page.goto(PROFILE_URL);
    await page.locator(".ib-tab[data-tab='install']").click();
    await page.locator(".ib-os-tab[data-os='windows']").click();

    const copyBtn = page.locator(".ib-os-panel[data-os-panel='windows'] .ib-copy");
    const copyText = await copyBtn.getAttribute("data-copy");
    expect(copyText).toContain("scoop");
    expect(copyText).toContain("llml import");
    expect(copyText).toMatch(/\n/);
  });
});

// ---------------------------------------------------------------------------
// Test 45: Download tab button
// ---------------------------------------------------------------------------
test.describe("Download tab", () => {
  test("download button has correct download attribute", async ({ page }) => {
    await page.goto(PROFILE_URL);
    await page.locator(".ib-tab[data-tab='download']").click();

    const downloadBtn = page.locator(".ib-download-btn");
    await expect(downloadBtn).toBeVisible();
    await expect(downloadBtn).toHaveAttribute("download", "");
  });

  test("download button href points to a profiles TOML", async ({ page }) => {
    await page.goto(PROFILE_URL);
    await page.locator(".ib-tab[data-tab='download']").click();

    const downloadBtn = page.locator(".ib-download-btn");
    const href = await downloadBtn.getAttribute("href");
    expect(href).toContain("profiles/");
    expect(href).toMatch(/\.toml$/);
  });

  test("download button text is Download .toml", async ({ page }) => {
    await page.goto(PROFILE_URL);
    await page.locator(".ib-tab[data-tab='download']").click();

    const downloadBtn = page.locator(".ib-download-btn");
    await expect(downloadBtn).toHaveText("Download .toml");
  });
});

// ---------------------------------------------------------------------------
// Test 46: TOML preview toggle
// ---------------------------------------------------------------------------

const MOCK_TOML = String.raw`schema_version = 2

[[profiles]]
name = "Test-Profile-Q4_K_M"
backend = "llama"
use_case = { primary = "chat" }
hardware = { class = "gpu" }
`;

function mockTomlRoute(page: any, content?: string) {
  return page.route(
    (url: URL) => url.pathname.includes("profiles/") && url.pathname.endsWith(".toml"),
    (route: any) => {
      route.fulfill({
        status: 200,
        contentType: "text/plain",
        body: content ?? MOCK_TOML,
      });
    }
  );
}

test.describe("TOML preview", () => {
  test("preview is hidden by default", async ({ page }) => {
    await page.goto(PROFILE_URL);
    await page.locator(".ib-tab[data-tab='download']").click();

    const preview = page.locator("[data-toml-preview]");
    await expect(preview).toHaveAttribute("hidden", "");
  });

  test("toggle button shows 'Show TOML' initially", async ({ page }) => {
    await page.goto(PROFILE_URL);
    await page.locator(".ib-tab[data-tab='download']").click();

    const toggle = page.locator("[data-action='toggle-preview']");
    await expect(toggle).toHaveText("Show TOML");
  });

  test("clicking toggle fetches and displays TOML content", async ({ page }) => {
    await mockTomlRoute(page);
    await page.goto(PROFILE_URL);
    await page.locator(".ib-tab[data-tab='download']").click();

    const toggle = page.locator("[data-action='toggle-preview']");
    await toggle.click();

    const preview = page.locator("[data-toml-preview]");
    await expect(preview).not.toHaveAttribute("hidden", "");
    await expect(preview).toContainText("schema_version");
    await expect(preview).toContainText("[[profiles]]");
    await expect(toggle).toHaveText("Hide TOML");
  });

  test("clicking toggle again hides preview", async ({ page }) => {
    await mockTomlRoute(page);
    await page.goto(PROFILE_URL);
    await page.locator(".ib-tab[data-tab='download']").click();

    const toggle = page.locator("[data-action='toggle-preview']");

    // Show
    await toggle.click();
    await expect(page.locator("[data-toml-preview]")).not.toHaveAttribute("hidden", "");

    // Hide
    await toggle.click();
    await expect(page.locator("[data-toml-preview]")).toHaveAttribute("hidden", "");
    await expect(toggle).toHaveText("Show TOML");
  });

  test("preview is in monospace font", async ({ page }) => {
    await mockTomlRoute(page);
    await page.goto(PROFILE_URL);
    await page.locator(".ib-tab[data-tab='download']").click();

    const toggle = page.locator("[data-action='toggle-preview']");
    await toggle.click();
    await expect(page.locator("[data-toml-preview]")).not.toHaveAttribute("hidden", "");

    const preview = page.locator("[data-toml-preview]");
    const fontFamily = await preview.evaluate((el: HTMLElement) =>
      getComputedStyle(el).fontFamily
    );
    expect(fontFamily).toMatch(/mono/i);
  });
});

// ---------------------------------------------------------------------------
// Test 46b: GitHub provenance link
// ---------------------------------------------------------------------------
test.describe("GitHub provenance link", () => {
  test("View on GitHub link is visible and not href='#'", async ({ page }) => {
    await page.goto(PROFILE_URL);
    const link = page.locator("a").filter({ hasText: /View on GitHub/ });
    await expect(link).toBeVisible();
    const href = await link.getAttribute("href");
    expect(href).not.toBe("#");
    expect(href).not.toBeNull();
  });

  test("View on GitHub link includes /blob/<40-char-sha>/profiles/", async ({ page }) => {
    await page.goto(PROFILE_URL);
    const link = page.locator("a").filter({ hasText: /View on GitHub/ });
    const href = await link.getAttribute("href");
    expect(href).toMatch(/\/blob\/[0-9a-f]{40}\/profiles\//);
  });

  test("View on GitHub link points to github.com", async ({ page }) => {
    await page.goto(PROFILE_URL);
    const link = page.locator("a").filter({ hasText: /View on GitHub/ });
    const href = await link.getAttribute("href");
    expect(href).toContain("github.com/flyingnobita/llml-catalog");
  });

  test("linked source URL is reachable (not 4xx client error except rate-limit)", async ({ page }) => {
    await page.goto(PROFILE_URL);
    const link = page.locator("a").filter({ hasText: /View on GitHub/ });
    const href = await link.getAttribute("href");
    expect(href).toBeTruthy();
    const response = await page.request.get(href!);
    // Accept 200 (success) or 429 (GitHub rate-limit in CI) — not a broken URL
    expect([200, 429]).toContain(response.status());
  });
});

// ---------------------------------------------------------------------------
// Test 47: Version badge
// ---------------------------------------------------------------------------
test.describe("Version badge", () => {
  test("version badge visible on profile detail page", async ({ page }) => {
    await page.goto(PROFILE_URL);
    const badge = installBlock(page).locator(".ib-badge");
    await expect(badge).toBeVisible();
  });

  test("version badge shows correct minimum version", async ({ page }) => {
    await page.goto(PROFILE_URL);
    const badge = installBlock(page).locator(".ib-badge");
    await expect(badge).toContainText("0.5.0");
    await expect(badge).toContainText("llml");
    await expect(badge).toContainText("Requires");
  });

  test("version badge is monospace", async ({ page }) => {
    await page.goto(PROFILE_URL);
    const badge = installBlock(page).locator(".ib-badge");
    const fontFamily = await badge.evaluate((el: HTMLElement) =>
      getComputedStyle(el).fontFamily
    );
    expect(fontFamily).toMatch(/mono/i);
  });
});
