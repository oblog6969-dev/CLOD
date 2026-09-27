import { expect, test, type Page } from "@playwright/test";

const TODAY = new Date("2026-09-28T10:00:00");

function seededState(days: number) {
  const dayEntries: Record<string, unknown> = {};
  for (let i = 0; i < days; i++) {
    const d = new Date(TODAY);
    d.setDate(d.getDate() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    dayEntries[key] = { completed: ["t1"], rules: [], note: "private note", mood: "Steady" };
  }
  return {
    version: 2,
    name: "",
    tasks: [{ id: "t1", title: "Morning walk", time: "", archived: false }],
    days: dayEntries,
    answers: {},
    plan: { vision: "A calmer week", antiVision: "", identity: "", year: "", month: "", constraints: "" },
    steps: [],
    reflections: [],
    resetDate: "2026-09-01",
    reminderTimes: ["11:00", "13:30", "15:15", "17:00", "19:30", "21:00"],
  };
}

async function seed(page: Page, days: number) {
  await page.clock.install({ time: TODAY });
  await page.addInitScript((state) => {
    if (!localStorage.getItem("lifeos_v2")) localStorage.setItem("lifeos_v2", JSON.stringify(state));
  }, seededState(days));
}

test("Reflections shows history conclusions computed from dated records", async ({ page }) => {
  await seed(page, 10);
  await page.goto("/");
  await page.getByRole("button", { name: "Reflections" }).click();
  await expect(page.getByRole("heading", { name: "What your history shows" })).toBeVisible();
  await expect(page.getByText("You completed at least one step on 10 of the last 28 days.")).toBeVisible();
});

test("AI analyses are saved with history context, and the person can edit and remove them", async ({ page }) => {
  await seed(page, 10);
  const bodies: { context?: Record<string, unknown> }[] = [];
  await page.route("**/api/ai/settings", (route) =>
    route.fulfill({ json: { connected: true, model: "gpt-5-mini", provider: "openai" } }),
  );
  await page.route("**/api/ai/analyze", async (route) => {
    bodies.push(route.request().postDataJSON());
    await route.fulfill({
      json: {
        model: "gpt-5-mini",
        analysis: {
          summary: "You show up most days; mornings seem to carry the habit.",
          patterns: ["Ten active days in a row."],
          recommendations: [
            { title: "Protect the morning", reason: "It is when you act.", nextStep: "Lay out shoes tonight", area: "focus" },
          ],
          question: "What makes mornings work for you?",
        },
      },
    });
  });

  await page.goto("/");
  await page.getByRole("button", { name: "AI guide" }).click();
  await expect(page.getByRole("checkbox", { name: /History trends/ })).toBeChecked();
  await page.getByRole("button", { name: "Analyze selected context" }).click();
  await expect(page.getByText("Saved to your insights.", { exact: false })).toBeVisible();

  const first = bodies[0].context as Record<string, { observations?: string[] }>;
  expect(first).toHaveProperty("history");
  expect(first.history.observations?.join(" ")).toContain("10 of the last 28 days");
  expect(JSON.stringify(first)).not.toContain("private note");
  expect(first).not.toHaveProperty("reflections");

  const saved = page.locator(".saved-insight");
  await expect(saved).toHaveCount(1);
  await saved.getByRole("button", { name: /^Edit/ }).click();
  await saved.getByLabel("Summary").fill("It's really about sleeping early, not mornings.");
  await saved.getByRole("button", { name: "Save changes" }).click();
  await expect(saved.getByText("Edited by you")).toBeVisible();
  await expect(saved.getByRole("heading", { name: "It's really about sleeping early, not mornings." })).toBeVisible();
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem("lifeos_v2")!).insights);
  expect(stored[0].edited).toBe(true);

  await page.getByRole("button", { name: "Analyze selected context" }).click();
  await expect(page.locator(".saved-insight")).toHaveCount(2);
  const second = bodies[1].context as { insights?: { summary: string; editedByUser: boolean }[] };
  expect(second.insights?.[0]).toMatchObject({
    summary: "It's really about sleeping early, not mornings.",
    editedByUser: true,
  });

  page.once("dialog", (dialog) => dialog.accept());
  await page.locator(".saved-insight").first().getByRole("button", { name: /^Remove/ }).click();
  await expect(page.locator(".saved-insight")).toHaveCount(1);
});
