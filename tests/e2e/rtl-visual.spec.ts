import { test, expect } from "@playwright/test";

test.describe("Arabic RTL visual baselines", () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await page.getByRole("button", { name: "Switch to Arabic" }).click();
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  });

  test("today view at 390px", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(page.locator("main")).toHaveScreenshot("ar-today-390.png", {
      animations: "disabled",
    });
  });

  test("today view at 1440px", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await expect(page.locator("main")).toHaveScreenshot("ar-today-1440.png", {
      animations: "disabled",
    });
  });
});
