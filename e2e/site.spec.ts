import { expect, test } from "@playwright/test";

test.describe("home", () => {
  test("introduces Lucas and links to featured case studies", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Lucas Pazzim/);
    await expect(page.getByRole("heading", { level: 1 }).first()).toContainText(/building/i);

    await page.getByTestId("card-project-treeunfe").click();
    await expect(page).toHaveURL(/\/work\/treeunfe$/);
    await expect(page.getByRole("heading", { level: 1, name: "Treeunfe" })).toBeVisible();
  });
});

test.describe("case studies", () => {
  test("list every case and open one", async ({ page }) => {
    await page.goto("/work");
    await page.getByRole("link", { name: /webmotors/i }).click();
    await expect(page).toHaveURL(/\/work\/webmotors$/);
    await expect(page.getByRole("heading", { name: /what i did/i })).toBeVisible();
  });

  test("redirect unknown cases back to the archive", async ({ page }) => {
    await page.goto("/work/does-not-exist");
    await expect(page).toHaveURL(/\/work$/);
  });
});

test("about page shows the full career timeline", async ({ page }) => {
  await page.goto("/about");
  const timeline = page.getByRole("list").filter({ has: page.getByText("Treeunfe", { exact: true }) });
  await expect(timeline.locator(":scope > li")).toHaveCount(11);
});

test("switching to Portuguese translates the page and persists", async ({ page }) => {
  await page.goto("/");
  await page.getByTestId("button-lang-pt-br").filter({ visible: true }).click();

  await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR");
  await expect(page.getByRole("heading", { level: 1 }).first()).toContainText(/construindo/i);

  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR");
});

test("theme toggle switches to light mode and persists", async ({ page }) => {
  await page.goto("/");
  const html = page.locator("html");
  await expect(html).toHaveClass(/dark/);

  await page.getByRole("button", { name: /theme/i }).filter({ visible: true }).click();
  await expect(html).not.toHaveClass(/dark/);

  await page.reload();
  await expect(html).not.toHaveClass(/dark/);
});

test("unknown routes render the 404 page", async ({ page }) => {
  await page.goto("/this-page-does-not-exist");
  await expect(page.getByRole("heading", { name: "404" })).toBeVisible();
});
