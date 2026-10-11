import { expect, test } from "@playwright/test";

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

test("the WebGL background mounts after hydration", async ({ page }) => {
  await page.goto("/about");
  await expect(page.locator("canvas")).toHaveCount(1);
});
