import { test, expect } from "@playwright/test";
test("page opts in to browser translation and identifies its source language", async ({
  page,
}) => {
  const response = await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator("html")).toHaveAttribute("translate", "yes");
  expect(response?.headers()["content-language"]).toBe("en");
});
test("daily step, undo, persistence, archive, and keyboard dialog", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Add a small step" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByLabel("What will you do?")).toBeFocused();
  await page.getByLabel("What will you do?").fill("Walk for fifteen minutes");
  await page.getByRole("button", { name: "Save step", exact: true }).click();
  await page
    .getByRole("button", { name: "Complete Walk for fifteen minutes" })
    .click();
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Undo Walk for fifteen minutes" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Undo Walk for fifteen minutes" })
    .click();
  await page
    .getByRole("button", { name: "Edit Walk for fifteen minutes" })
    .click();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Edit Walk for fifteen minutes" }),
  ).toBeFocused();
  await page
    .getByRole("button", { name: "Edit Walk for fifteen minutes" })
    .click();
  await page.getByRole("button", { name: "Archive step" }).click();
  await expect(
    page.getByRole("button", { name: "Complete Walk for fifteen minutes" }),
  ).toHaveCount(0);
});
test("guided reflection saves, resumes, and proposes an editable plan", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Begin your one-day reset" }).click();
  await page.getByLabel("Your answer").fill("I want time for my family.");
  await page.getByRole("button", { name: "Save & continue" }).click();
  await page.reload();
  await page.getByRole("button", { name: "Your reset" }).click();
  await expect(page.getByLabel("Your answer")).toHaveValue(
    "I want time for my family.",
  );
  await page.getByRole("tab", { name: /Evening/ }).click();
  await page.getByRole("button", { name: "Question 4", exact: true }).click();
  await page
    .getByLabel("Your answer")
    .fill("A calmer home and meaningful work.");
  await page.getByRole("button", { name: "Save & continue" }).click();
  await page.getByRole("button", { name: "Question 7", exact: true }).click();
  await page.getByRole("button", { name: "Save & continue" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByLabel("The life I’m moving toward")).toHaveValue(
    "A calmer home and meaningful work.",
  );
  await page.getByRole("button", { name: "Save my direction" }).click();
  await page.getByRole("button", { name: "My direction" }).click();
  await expect(
    page.getByText("A calmer home and meaningful work.", { exact: true }),
  ).toBeVisible();
});
test("bad import is rejected and reset can recover existing data", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Settings & data" }).click();
  await page.getByLabel("What should we call you?").fill("Sam");
  await page.getByRole("button", { name: "Save name" }).click();
  await page.getByLabel("Import backup", { exact: true }).setInputFiles({
    name: "bad.json",
    mimeType: "application/json",
    buffer: Buffer.from('{"version":2}'),
  });
  await expect(page.getByRole("status")).toContainText("incomplete");
  await expect(page.getByLabel("What should we call you?")).toHaveValue("Sam");
  await page
    .getByRole("button", { name: "Reset workspace", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Save recovery copy & reset" })
    .click();
  page.on("dialog", (dialog) => dialog.accept());
  await page
    .getByRole("button", { name: "Recover previous workspace" })
    .click();
  await page.reload();
  await expect(page.getByText("Sam", { exact: true })).toBeVisible();
});
test("Google Translate translates chosen writing without changing the source", async ({
  page,
}) => {
  let requestBody: { text?: string; target?: string } = {};
  await page.route("**/api/translate", async (route) => {
    requestBody = route.request().postDataJSON();
    await route.fulfill({
      json: {
        translation: "مرحبا بالعالم",
        detectedSourceLanguage: "en",
      },
    });
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Settings & data" }).click();
  const source = page.getByLabel("Text to translate");
  await source.fill("Hello world");
  await page.getByLabel("Translate to").selectOption("ar");
  await page.getByRole("button", { name: "Translate with Google" }).click();
  await expect(page.getByText("مرحبا بالعالم")).toBeVisible();
  await expect(source).toHaveValue("Hello world");
  expect(requestBody).toEqual({ text: "Hello world", target: "ar" });
});
test("phone layout fits the viewport and dialog remains usable", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(
    page.getByRole("button", { name: "Add a small step" }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "Add a small step" }).click();
  await expect(page.getByLabel("What will you do?")).toBeFocused();
  await page.getByLabel("What will you do?").fill("Read a page");
  await page.getByRole("button", { name: "Save step", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Complete Read a page" }),
  ).toBeVisible();
  await page.screenshot({ path: "test-results/mobile.png", fullPage: true });
});
test("desktop layout and calendar export", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.goto("/");
  await expect(
    page.getByRole("button", { name: "Begin your one-day reset" }),
  ).toBeVisible();
  await page.screenshot({ path: "test-results/desktop.png", fullPage: true });
  await page.getByRole("button", { name: "Begin your one-day reset" }).click();
  await page.getByRole("tab", { name: /Throughout the day/ }).click();
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export reminders" }).click();
  const file = await download;
  expect(file.suggestedFilename()).toBe("lifeos-reflection-day.ics");
  await expect(page.getByRole("status")).toContainText(
    "Import it in your calendar",
  );
});
test("corrupt stored data is protected until recovery is chosen", async ({
  page,
}) => {
  await page.addInitScript(() => localStorage.setItem("lifeos_v2", "{broken"));
  await page.goto("/");
  await expect(
    page.getByRole("alert").filter({ hasText: "Your saved data" }),
  ).toContainText("could not be opened");
  await expect(
    page.getByRole("region", { name: "Your journey guide" }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Add a small step" }).click();
  await page
    .getByLabel("What will you do?")
    .fill("Do not overwrite my old data");
  await page.getByRole("button", { name: "Save step", exact: true }).click();
  expect(await page.evaluate(() => localStorage.getItem("lifeos_v2"))).toBe(
    "{broken",
  );
});
test("new day clears daily checks while keeping history", async ({ page }) => {
  await page.clock.install({ time: new Date("2026-09-16T23:59:50") });
  await page.goto("/");
  await page.getByRole("button", { name: "Add a small step" }).click();
  await page.getByLabel("What will you do?").fill("Daily walk");
  await page.getByRole("button", { name: "Save step", exact: true }).click();
  await page.getByRole("button", { name: "Complete Daily walk" }).click();
  await page.clock.fastForward(60000);
  await expect(
    page.getByRole("button", { name: "Complete Daily walk" }),
  ).toBeVisible();
  const days = await page.evaluate(
    () => JSON.parse(localStorage.getItem("lifeos_v2")!).days,
  );
  expect(days["2026-09-16"].completed).toHaveLength(1);
});

test("AI guide shares selected context and lets the user accept one suggestion", async ({
  page,
}) => {
  let requestBody: { context?: Record<string, unknown> } = {};
  await page.route("**/api/ai/settings", async (route) => {
    await route.fulfill({
      json: { connected: true, model: "gpt-5-mini", provider: "openai" },
    });
  });
  await page.route("**/api/ai/analyze", async (route) => {
    requestBody = route.request().postDataJSON();
    await route.fulfill({
      json: {
        model: "gpt-5-mini",
        analysis: {
          summary:
            "Your direction is clear, while today could use one smaller action.",
          patterns: ["Your plan values calm and consistency."],
          recommendations: [
            {
              title: "Shrink the first move",
              reason: "A smaller action may be easier to repeat.",
              nextStep: "Write for ten focused minutes",
              area: "focus",
            },
          ],
          question: "What would make this feel easy to begin?",
        },
      },
    });
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Add a small step" }).click();
  await page.getByLabel("What will you do?").fill("Draft a short outline");
  await page.getByRole("button", { name: "Save step", exact: true }).click();
  await page.getByRole("button", { name: "AI guide" }).click();
  await expect(page.getByText("Connected · OpenAI · gpt-5-mini")).toBeVisible();
  await expect(page.getByRole("status", { name: "AI connection: Working" })).toBeVisible();
  await expect(
    page.getByRole("checkbox", { name: /Reset answers/ }),
  ).not.toBeChecked();
  await expect(
    page.getByRole("checkbox", { name: /Journal reflections/ }),
  ).not.toBeChecked();
  await page.getByRole("button", { name: "Analyze selected context" }).click();
  await expect(page.getByText("Shrink the first move")).toBeVisible();
  await page.screenshot({ path: "test-results/ai-guide.png", fullPage: true });
  expect(requestBody.context).toHaveProperty("tasks");
  expect(requestBody.context).not.toHaveProperty("answers");
  expect(requestBody.context).not.toHaveProperty("reflections");
  await page.getByRole("button", { name: "Add to Today" }).click();
  await page.getByRole("button", { name: "Today", exact: true }).click();
  await expect(
    page.getByText("Write for ten focused minutes", { exact: true }),
  ).toBeVisible();
});

test("AI key form stays masked and reports connection errors", async ({
  page,
}) => {
  await page.route("**/api/ai/settings", async (route) => {
    if (route.request().method() === "GET")
      return route.fulfill({
        json: { connected: false, model: null, provider: null },
      });
    await route.fulfill({
      status: 401,
      json: {
        error: "OpenAI rejected this API key. Check the key and try again.",
      },
    });
  });
  await page.goto("/");
  await page.getByRole("button", { name: "AI guide" }).click();
  const key = page.getByLabel("API key", { exact: true });
  await expect(key).toHaveAttribute("type", "password");
  await key.fill("sk-invalid-test-key");
  await page.getByRole("button", { name: "Connect securely" }).click();
  await expect(
    page.getByRole("alert").filter({ hasText: "OpenAI rejected" }),
  ).toContainText("OpenAI rejected this API key");
  await expect(
    page.getByRole("button", { name: "Connect securely" }),
  ).toBeVisible();
  await expect(
    page.getByRole("status", { name: "AI connection: Connection down" }),
  ).toBeVisible();
});

test("AI guide shows a yellow indicator for a sluggish provider", async ({
  page,
}) => {
  await page.route("**/api/ai/settings", async (route) => {
    if (route.request().method() === "GET")
      return route.fulfill({
        json: { connected: false, model: null, provider: null },
      });
    await route.fulfill({
      json: {
        connected: true,
        model: "gpt-5-mini",
        provider: "openai",
        health: "slow",
        latencyMs: 4200,
      },
    });
  });
  await page.goto("/");
  await page.getByRole("button", { name: "AI guide" }).click();
  await page.getByLabel("API key", { exact: true }).fill("sk-slow-test-key");
  await page.getByRole("button", { name: "Connect securely" }).click();
  await expect(
    page.getByRole("status", { name: "AI connection: Slow response" }),
  ).toContainText("4.2s");
});

test("AI guide can continue a private follow-up conversation", async ({ page }) => {
  let chatBody: { messages?: { role: string; content: string }[] } = {};
  await page.route("**/api/ai/settings", (route) =>
    route.fulfill({
      json: { connected: true, model: "gpt-5-mini", provider: "openai" },
    }),
  );
  await page.route("**/api/ai/analyze", (route) =>
    route.fulfill({
      json: {
        analysis: {
          summary: "A small step could help.",
          patterns: [],
          recommendations: [
            {
              title: "Start gently",
              reason: "It lowers friction.",
              nextStep: "Walk for five minutes",
              area: "wellbeing",
            },
          ],
          question: "What feels easy?",
        },
      },
    }),
  );
  await page.route("**/api/ai/chat", async (route) => {
    chatBody = route.request().postDataJSON();
    await route.fulfill({ json: { reply: "Try putting your shoes by the door." } });
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Add a small step" }).click();
  await page.getByLabel("What will you do?").fill("Take a walk");
  await page.getByRole("button", { name: "Save step", exact: true }).click();
  await page.getByRole("button", { name: "AI guide" }).click();
  await page.getByRole("button", { name: "Analyze selected context" }).click();
  await page.getByLabel("Your follow-up").fill("How can I start?");
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.getByText("Try putting your shoes by the door.")).toBeVisible();
  expect(chatBody.messages?.at(-1)).toEqual({ role: "user", content: "How can I start?" });
});

test("AI settings endpoint rejects malformed keys before any upstream request", async ({
  request,
}) => {
  const response = await request.post("/api/ai/settings", {
    data: { apiKey: "short", model: "gpt-5-mini", provider: "openai" },
  });
  expect(response.status()).toBe(400);
  expect((await response.json()).error).toContain("valid API key");
});

test("AI guide exposes DeepSeek, NVIDIA, and compatible providers", async ({
  page,
}) => {
  await page.route("**/api/ai/settings", (route) =>
    route.fulfill({ json: { connected: false, model: null, provider: null } }),
  );
  await page.goto("/");
  await page.getByRole("button", { name: "AI guide" }).click();
  const provider = page.getByLabel("Provider");
  await provider.selectOption("deepseek");
  await expect(page.getByLabel("Model")).toHaveValue("deepseek-flash");
  await provider.selectOption("nvidia");
  await expect(page.getByLabel("Model")).toHaveValue("openai/gpt-oss-120b");
  await provider.selectOption("groq");
  await expect(page.getByLabel("Model")).toHaveValue("openai/gpt-oss-20b");
  await provider.selectOption("huggingface");
  await expect(page.getByLabel("Model")).toHaveValue("openai/gpt-oss-120b:fastest");
  await provider.selectOption("openrouter");
  await expect(page.getByLabel("Model")).toHaveValue("openrouter/free");
  await provider.selectOption("custom");
  await expect(page.getByLabel("API base URL")).toBeVisible();
});
