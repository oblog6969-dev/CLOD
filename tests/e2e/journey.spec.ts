import { test, expect } from "@playwright/test";

test("a newcomer can follow the journey, understand each phase, and act on a plan", async ({
  page,
}) => {
  await page.goto("/");
  const guide = page.getByRole("region", { name: "Your journey guide" });
  await expect(guide).toContainText("No background reading needed");
  await expect(
    page.getByRole("navigation", { name: "Journey steps" }),
  ).toBeVisible();
  await guide.getByRole("button", { name: "Begin your one-day reset" }).click();
  await expect(page.locator("#main")).toBeFocused();
  await expect(
    page.getByRole("region", { name: "Guidance for this phase" }),
  ).toContainText("Explore what you want to change");
  await page
    .getByLabel("Your answer", { exact: true })
    .fill("I want room to draw.");
  await page.getByRole("button", { name: "Save & continue" }).click();
  await page.getByRole("tab", { name: /Throughout the day/ }).click();
  await expect(
    page.getByRole("region", { name: "Guidance for this phase" }),
  ).toContainText("Notice your day as it happens");
  await guide
    .getByRole("button", { name: "Go to reflection questions" })
    .click();
  await expect(page.locator("#reset-work")).toBeFocused();
  await page.getByRole("tab", { name: /Evening/ }).click();
  await expect(
    page.getByRole("region", { name: "Guidance for this phase" }),
  ).toContainText("Turn what you noticed into a direction");
  await page
    .getByRole("button", { name: "Continue to your plan", exact: true })
    .click();
  await expect(guide).toContainText("Give your next steps a purpose");
  await page
    .getByRole("button", { name: "Shape my plan", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toContainText(
    "Vision means the ordinary life",
  );
  await page
    .getByLabel("The life I’m moving toward", { exact: true })
    .fill("Make time for creative work.");
  await page
    .getByLabel("My project for this month", { exact: true })
    .fill("Finish a sketchbook page.");
  await page.getByRole("button", { name: "Save my direction" }).click();
  await guide.getByRole("button", { name: "Break down my project" }).click();
  await expect(page.getByLabel("New project step")).toBeFocused();
  await page.getByLabel("New project step").fill("Choose a subject");
  await page.getByRole("button", { name: "Add step", exact: true }).click();
  await guide.getByRole("button", { name: "Choose a daily action" }).click();
  await page.getByLabel("What will you do?").fill("Draw for five minutes");
  await page.getByRole("button", { name: "Save step", exact: true }).click();
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("button", { name: "Today", exact: true })
    .click();
  await guide.getByRole("button", { name: "See today’s actions" }).click();
  await expect(page.locator("#daily-actions")).toBeFocused();
  await page
    .getByRole("button", { name: "Complete Draw for five minutes" })
    .click();
  await guide.getByRole("button", { name: "Reflect on today" }).click();
  await page
    .getByLabel("Your reflection", { exact: true })
    .fill("A small start helped.");
  await page.getByRole("button", { name: "Save reflection" }).click();
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("button", { name: "Reflections" })
    .click();
  await expect(guide).toContainText("Use experience to adjust your plan");
  await expect(
    page.getByText("A small start helped.", { exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(guide).not.toContainText("No background reading needed");
  await expect(
    page.getByRole("navigation", { name: "Journey steps" }),
  ).toBeHidden();
  await guide.getByRole("button", { name: "Show the walkthrough" }).click();
  await expect(guide).toContainText("1 note saved");
});

test("guidance works by keyboard on a narrow screen in both themes, including optional sections", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.route("**/api/ai/settings", (route) =>
    route.fulfill({ json: { connected: false, model: null, provider: null } }),
  );
  await page.goto("/");
  const guide = page.getByRole("region", { name: "Your journey guide" });
  await page.screenshot({
    path: "test-results/journey-light-mobile.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Toggle color theme" }).click();
  const nav = page.getByRole("navigation", { name: "Main navigation" });
  for (const label of [
    "Today",
    "Your reset",
    "My direction",
    "Reflections",
    "AI guide",
  ]) {
    await nav.getByRole("button", { name: label }).click();
    await expect(guide).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  }
  await guide
    .getByRole("button", { name: "Explore the optional AI guide" })
    .click();
  await expect(page.locator("#ai-workspace")).toBeFocused();
  await page.getByRole("button", { name: "Settings & data" }).click();
  const downloaded = page.waitForEvent("download");
  await guide.getByRole("button", { name: "Download my backup" }).click();
  expect((await downloaded).suggestedFilename()).toMatch(/^lifeos-.*\.json$/);
  const toggle = guide.getByRole("button", { name: "Hide the walkthrough" });
  await toggle.focus();
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("navigation", { name: "Journey steps" }),
  ).toBeHidden();
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("navigation", { name: "Journey steps" }),
  ).toBeVisible();
  await guide.getByRole("button", { name: "Go to Today", exact: true }).click();
  await page.screenshot({
    path: "test-results/journey-dark-mobile.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.screenshot({
    path: "test-results/journey-dark-desktop.png",
    fullPage: true,
  });
});
