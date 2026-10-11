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

  test("show the not-found page for unknown cases", async ({ page }) => {
    await page.goto("/work/does-not-exist");
    await expect(page.getByRole("heading", { name: "404" })).toBeVisible();
  });
});

test("about page shows the full career timeline", async ({ page }) => {
  await page.goto("/about");
  const timeline = page.getByRole("list").filter({ has: page.getByText("Treeunfe", { exact: true }) });
  await expect(timeline.locator(":scope > li")).toHaveCount(11);
});

test("language switcher links to the same page in Portuguese", async ({ page }) => {
  await page.goto("/about");
  await page.getByTestId("button-lang-pt-br").filter({ visible: true }).click();

  await expect(page).toHaveURL(/\/pt\/about$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(/lucas pazzim/i);
  await expect(page.getByText("Engenheiro de Software Frontend Sênior").first()).toBeVisible();

  // Internal links keep the visitor in Portuguese.
  await expect(page.getByTestId("link-home")).toHaveAttribute("href", "/pt");
  await expect(page.getByTestId("nav-projects")).toHaveAttribute("href", "/pt/work");
});

test("Portuguese pages are reachable directly", async ({ page }) => {
  await page.goto("/pt/work/upx");
  await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR");
  await expect(page.getByRole("heading", { name: /o que eu fiz/i })).toBeVisible();
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

test("pages hydrate without console errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));

  for (const path of [
    "/",
    "/work",
    "/work/upx",
    "/about",
    "/contact",
    "/blog",
    "/pt",
    "/pt/about",
    "/pt/work/jestor",
  ]) {
    await page.goto(path);
    await page.waitForLoadState("networkidle");
  }

  // /api is not served by the static preview server; those failures are expected.
  expect(errors.filter((text) => !text.includes("/api/") && !text.includes("404"))).toEqual([]);
});

test("the mobile menu covers the page below the header", async ({ page, isMobile }) => {
  test.skip(!isMobile, "The menu only exists on small screens");
  await page.goto("/");
  await page.getByTestId("button-menu-toggle").click();

  const menu = page.locator("#mobile-menu");
  await expect(menu.getByRole("link", { name: /projects/i })).toBeVisible();
  // Regression: a transform on the header used to collapse this fixed panel to zero height.
  expect((await menu.boundingBox())?.height).toBeGreaterThan(300);
});

test("keyboard users can skip the navigation and land on the main content", async ({ page, isMobile }) => {
  test.skip(isMobile, "Keyboard navigation is a desktop flow");
  await page.goto("/about");

  await page.keyboard.press("Tab");
  const skipLink = page.getByRole("link", { name: /skip to content/i });
  await expect(skipLink).toBeFocused();
  await expect(skipLink).toBeVisible();

  await page.keyboard.press("Enter");
  await expect(page.locator("main#main")).toBeFocused();
});
