import { expect, test, type Page } from "@playwright/test";

// The WebGL background mounts on the first interaction, and its listeners only
// exist once React has hydrated: keep moving the pointer until the canvas shows.
// It doubles as a "page is hydrated" signal.
async function interactUntilCanvas(page: Page) {
  let step = 0;
  await expect(async () => {
    step += 1;
    await page.mouse.move(100 + step * 7, 200 + step * 5);
    await expect(page.locator("canvas")).toHaveCount(1, { timeout: 500 });
  }).toPass({ timeout: 7000 });
}

test.use({ reducedMotion: "no-preference" });

test("the opening plays once per session and can be skipped", async ({ page }) => {
  await page.goto("/");
  const intro = page.getByRole("dialog", { name: /initializing portfolio/i });
  await expect(intro).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(intro).toHaveCount(0);

  await page.reload();
  await expect(page.getByRole("heading", { level: 1 }).first()).toContainText(/building/i);
  await expect(intro).toHaveCount(0);
});

test("the opening only runs on the home page", async ({ page }) => {
  await page.goto("/about");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("the WebGL background mounts on the first interaction, not during load", async ({ page }) => {
  await page.goto("/about");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.locator("canvas")).toHaveCount(0);

  await interactUntilCanvas(page);
});

test("internal navigation runs inside a view transition", async ({ page, isMobile }) => {
  // Count the transitions the browser starts so the test does not depend on
  // pixels. The scripts are strings because the e2e project has no DOM typings.
  await page.addInitScript(`
    window.__transitions = 0;
    const original = document.startViewTransition?.bind(document);
    if (original) {
      document.startViewTransition = (callback) => {
        window.__transitions += 1;
        return original(callback);
      };
    }
  `);

  // An aborted or skipped transition must not surface as an unhandled rejection.
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));

  await page.goto("/about");
  // Wait for hydration; clicking earlier would be a full page load.
  await interactUntilCanvas(page);
  if (isMobile) {
    await page.getByTestId("button-menu-toggle").click();
    await page
      .locator("#mobile-menu")
      .getByRole("link", { name: /projects/i })
      .click();
  } else {
    await page.getByTestId("nav-projects").click();
  }
  await expect(page).toHaveURL(/\/work$/);
  // The URL changes before the DOM does, and /about has an <h1> too: wait for the
  // heading that only exists on /work, which is rendered inside the transition.
  await expect(page.getByRole("heading", { level: 1, name: "Projects" })).toBeVisible();

  await expect.poll(() => page.evaluate("window.__transitions")).toBeGreaterThan(0);

  // Let the 0.75s animation finish, then bounce back to exercise a second transition.
  await page.waitForTimeout(1000);
  await page.goBack();
  await expect(page).toHaveURL(/\/about$/);
  await page.waitForTimeout(1000);
  expect(pageErrors).toEqual([]);
});
