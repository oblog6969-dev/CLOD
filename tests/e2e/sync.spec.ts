import { test, expect } from "@playwright/test";

test("Settings explains local-only sync when Supabase is not configured", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Settings & data", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Sync across devices" }),
  ).toBeVisible();
  const emailField = page.locator("#sync-email");
  const localOnly = page.getByText(/isn't set up on this deployment/i);
  await expect(emailField.or(localOnly)).toBeVisible();
});

test("Arabic settings shows local-only sync copy", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Switch to Arabic" }).click();
  await page.getByRole("button", { name: "الإعدادات والبيانات", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "المزامنة بين الأجهزة" }),
  ).toBeVisible();
  const emailField = page.locator("#sync-email");
  const localOnly = page.getByText(/المزامنة غير مُفعّلة/);
  await expect(emailField.or(localOnly)).toBeVisible();
});
