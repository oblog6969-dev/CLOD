import test from "node:test";
import assert from "node:assert/strict";
import {
  decode,
  emptyDay,
  freshState,
  localDate,
  progress,
  toggleTask,
} from "../src/lib/domain.ts";
import { isAiAnalysis, isAiModel, isAiProvider } from "../src/lib/ai.ts";

function fixture() {
  const state = freshState();
  state.tasks = Array.from({ length: 4 }, (_, i) => ({
    id: `task-${i}`,
    title: `Step ${i}`,
    time: "",
    archived: false,
  }));
  state.steps = [{ id: "step", title: "Finish draft", done: false }];
  return state;
}
test("repeating a completion and undo never creates points or project progress", () => {
  let state = fixture();
  for (let i = 0; i < 30; i++) {
    state = toggleTask(state, "task-0", "2026-09-16");
    state = toggleTask(state, "task-0", "2026-09-16");
  }
  assert.equal(progress(state).total, 0);
  assert.equal(progress(state).project, 0);
  assert.deepEqual(state.days["2026-09-16"].completed, []);
});
test("undo across a level boundary reverses the level correctly", () => {
  let state = fixture();
  for (const task of state.tasks)
    state = toggleTask(state, task.id, "2026-09-16");
  assert.equal(progress(state).level, 2);
  state = toggleTask(state, "task-3", "2026-09-16");
  assert.equal(progress(state).level, 1);
  assert.equal(progress(state).xp, 75);
});
test("different dates have independent completion and consecutive streaks", () => {
  let state = toggleTask(fixture(), "task-0", "2026-09-15");
  state = toggleTask(state, "task-0", "2026-09-16");
  assert.equal(progress(state, "2026-09-16").streak, 2);
  assert.equal(progress(state, "2026-09-17").streak, 2);
  assert.equal(progress(state, "2026-09-18").streak, 0);
  assert.equal(state.days["2026-09-17"], undefined);
  assert.equal(progress(state).total, 50);
});
test("monthly progress only follows actual project steps and reverses", () => {
  const state = fixture();
  state.steps[0].done = true;
  assert.equal(progress(state).project, 100);
  assert.equal(progress(state).total, 50);
  state.steps[0].done = false;
  assert.equal(progress(state).total, 0);
  assert.equal(progress(state).project, 0);
});
test("archiving preserves history and prevents new completion", () => {
  let state = toggleTask(fixture(), "task-0", "2026-09-16");
  state.tasks[0].archived = true;
  state = toggleTask(state, "task-0", "2026-09-17");
  assert.equal(state.days["2026-09-17"], undefined);
  assert.equal(progress(state).total, 25);
});
test("valid backups round-trip without sharing references", () => {
  const original = fixture();
  const restored = decode(JSON.parse(JSON.stringify(original)));
  assert.deepEqual(restored, original);
  restored.tasks[0].title = "Changed";
  assert.equal(original.tasks[0].title, "Step 0");
});
test("rejects corrupt, incomplete and future-version backups", () => {
  for (const value of [
    null,
    {},
    { version: 3 },
    { ...fixture(), days: { bad: emptyDay() } },
    { ...fixture(), reminderTimes: ["99:00"] },
    { ...fixture(), plan: {} },
  ])
    assert.throws(() => decode(value));
  const duplicate = fixture();
  duplicate.tasks.push({ ...duplicate.tasks[0] });
  assert.throws(() => decode(duplicate));
});
test("rejects duplicate daily completion rewards", () => {
  const state = fixture();
  state.days["2026-09-16"] = { ...emptyDay(), completed: ["task-0", "task-0"] };
  assert.throws(() => decode(state));
});
test("legacy content migrates without invented levels or streaks", () => {
  const migrated = decode({
    version: "1.0.0",
    identity: {
      name: "Sam",
      statement: "I practice patience",
      vision: { summary: "More time outside" },
      antiVision: { summary: "Always rushing" },
    },
    mission: { title: "Finish a course" },
    bossFight: {
      name: "Module one",
      subTasks: [{ title: "Read chapter one", completed: true }],
    },
    quests: [{ title: "Walk", completed: true }],
    rules: [{ text: "Keep evenings free" }],
    lastActiveDate: "2026-09-15",
    level: 99,
    streakDays: 200,
  });
  assert.equal(migrated.plan.vision, "More time outside");
  assert.equal(migrated.plan.constraints, "Keep evenings free");
  assert.equal(migrated.days["2026-09-15"].completed.length, 1);
  assert.equal(progress(migrated, "2026-09-16").streak, 1);
  assert.equal(progress(migrated).total, 75);
});
test("local date uses local calendar fields, including month boundaries", () => {
  const date = new Date(2026, 0, 1, 0, 15);
  assert.equal(localDate(date), "2026-01-01");
});
test("AI configuration and structured responses are validated", () => {
  assert.equal(isAiModel("gpt-5-mini"), true);
  assert.equal(isAiModel("deepseek-v4-pro"), true);
  assert.equal(isAiModel("bad model with spaces"), false);
  assert.equal(isAiProvider("nvidia"), true);
  assert.equal(isAiProvider("groq"), true);
  assert.equal(isAiProvider("huggingface"), true);
  assert.equal(isAiProvider("openrouter"), true);
  assert.equal(isAiProvider("unknown"), false);
  assert.equal(
    isAiAnalysis({
      summary: "A useful summary",
      patterns: ["One"],
      recommendations: [
        {
          title: "Try one thing",
          reason: "It fits",
          nextStep: "Walk for ten minutes",
          area: "wellbeing",
        },
      ],
      question: "What feels realistic?",
    }),
    true,
  );
  assert.equal(isAiAnalysis({ summary: "Missing fields" }), false);
  assert.equal(
    isAiAnalysis({
      summary: "Wrong area",
      patterns: [],
      recommendations: [
        { title: "X", reason: "Y", nextStep: "Z", area: "medical" },
      ],
      question: "Q",
    }),
    false,
  );
});

test("assessment calculation derives correct human development archetype", async () => {
  const { calculateAssessment } = await import("../src/lib/assessment.ts");
  const profile = calculateAssessment({
    aq1: "aq1_d",
    aq2: "aq2_red",
    aq3: "aq3_freedom",
    aq4: "aq4_demanding",
    aq5: "aq5_courage",
    aq6: "aq6_selfdir",
    aq7: "aq7_high",
    aq8: "aq8_d",
  });
  assert.equal(profile.coreMotive, "red");
  assert.equal(profile.discStyle, "D");
  assert.equal(profile.primaryNeed, "freedom");
  assert.equal(profile.archetypeName, "The Sovereign Commander");
  assert.equal(profile.consciousnessLevel >= 250, true);
  assert.equal(profile.maslowCenter, "actualization");
  assert.ok(profile.maslowTiers);
});

test("baseline assessment localizes to Arabic for LifeOS copy", async () => {
  const { getAssessmentQuestions } = await import("../src/lib/assessment.ts");
  const ar = getAssessmentQuestions("ar");
  assert.equal(ar.length, 8);
  assert.match(ar[0].title, /بعد يوم/);
  assert.match(ar[0].options[0].text, /./);
});

test("MSQ source metadata covers all reset prompts", async () => {
  const { MSQ_META } = await import("../src/lib/msq-meta.ts");
  for (let i = 1; i <= 14; i++) assert.ok(MSQ_META[`m${i}`]);
  for (let i = 1; i <= 7; i++) assert.ok(MSQ_META[`e${i}`]);
});

test("plan draft status distinguishes saved vs updated fields", async () => {
  const { planFieldStatus, summarizePlanDraft } = await import(
    "../src/lib/plan-draft.ts"
  );
  assert.equal(planFieldStatus("old", "old"), "unchanged");
  assert.equal(planFieldStatus("", "new"), "new");
  assert.equal(planFieldStatus("a", "b"), "updated");
  const summary = summarizePlanDraft(
    { vision: "stay", antiVision: "", identity: "", year: "", month: "", constraints: "" },
    { vision: "stay", antiVision: "go", identity: "", year: "", month: "", constraints: "" },
  );
  assert.equal(summary.antiVision, "new");
  assert.equal(summary.vision, "unchanged");
});

test("MSQ catalog covers all 14 morning and 7 evening prompts", async () => {
  const { MSQ_CATALOG, getPromptMsq, formatMsqAnswer, synthesizePlanFromAnswers } = await import(
    "../src/lib/questionnaire.ts"
  );
  for (let i = 1; i <= 14; i++) {
    const prompt = getPromptMsq(`m${i}`);
    assert.ok(prompt, `Morning prompt m${i} must exist`);
    assert.equal(prompt.options.length >= 3, true);
  }
  for (let i = 1; i <= 7; i++) {
    const prompt = getPromptMsq(`e${i}`);
    assert.ok(prompt, `Evening prompt e${i} must exist`);
    assert.equal(prompt.options.length >= 3, true);
  }

  const m1 = MSQ_CATALOG.m1;
  const formatted = formatMsqAnswer(m1, ["m1_red"], "A little tired");
  assert.ok(formatted.includes("Low leverage & scattered focus"));
  assert.ok(formatted.includes("A little tired"));

  const plan = synthesizePlanFromAnswers(
    {
      m13: "A sovereign creator",
      e3: "Refuse mediocrity",
      e4: "Sovereign freedom",
      e5: "10k monthly",
      e6: "Launch MVP",
    },
    { vision: "", antiVision: "", identity: "", year: "", month: "", constraints: "" },
  );
  assert.equal(plan.identity, "A sovereign creator");
  assert.equal(plan.antiVision, "Refuse mediocrity");
  assert.equal(plan.vision, "Sovereign freedom");
  assert.equal(plan.year, "10k monthly");
  assert.equal(plan.month, "Launch MVP");
});

test("state decode validates and preserves assessment profile and selected options", () => {
  const state = fixture();
  state.assessmentProfile = {
    completedAt: "2026-09-20T12:00:00.000Z",
    coreMotive: "white",
    discStyle: "S",
    primaryNeed: "freedom",
    stressTrigger: "chaos",
    consciousnessLevel: 310,
    topValues: ["self_direction", "peace"],
    archetypeName: "The Grounded Harmonizer",
    motiveDescription: "Calm composure",
  };
  state.selectedOptions = {
    m1: ["m1_white"],
    e1: ["e1_power"],
  };

  const decoded = decode(JSON.parse(JSON.stringify(state)));
  assert.deepEqual(decoded.assessmentProfile, state.assessmentProfile);
  assert.deepEqual(decoded.selectedOptions, state.selectedOptions);
});

test("workspaceCopy and MSQ localization support Arabic parity", async () => {
  const { workspaceCopy } = await import("../src/lib/locale/workspace.ts");
  const { getPromptMsq } = await import("../src/lib/questionnaire.ts");

  const enCopy = workspaceCopy("en");
  const arCopy = workspaceCopy("ar");

  // Parity check for all string keys
  for (const key of Object.keys(enCopy)) {
    assert.ok(arCopy[key], `Missing Arabic translation for workspaceCopy key: ${key}`);
  }

  // ArchetypeTag localization check in Arabic
  const m1Ar = getPromptMsq("m1", null, "ar");
  const redOpt = m1Ar.options.find((o) => o.id === "m1_red");
  assert.equal(redOpt?.archetypeTag, "أحمر: إنجاز وقوة");
  const blueOpt = m1Ar.options.find((o) => o.id === "m1_blue");
  assert.equal(blueOpt?.archetypeTag, "أزرق: معنى وترابط");
});

test("calendar export localizes summary and prodid", async () => {
  const { workspaceCopy } = await import("../src/lib/locale/workspace.ts");
  const { buildIcsCalendar } = await import("../src/lib/calendar-export.mjs");
  const copy = workspaceCopy("ar");
  const ics = buildIcsCalendar({
    summary: copy.icsSummary,
    prodId: copy.icsProdId,
    resetDate: "2026-09-26",
    reminderTimes: ["09:00"],
    descriptions: ["وقفة الصباح"],
    now: new Date("2026-09-26T06:00:00.000Z"),
  });
  assert.match(ics, /SUMMARY:لايف أو إس — وقفة واعية/);
  assert.match(ics, /PRODID:-\/\/LifeOS\/\/يوم التأمل\/\/AR/);
  assert.match(ics, /DESCRIPTION:وقفة الصباح/);
  assert.doesNotMatch(ics, /A mindful pause/);
  assert.equal(workspaceCopy("en").icsProdId, "-//LifeOS//Reflection day//EN");
});
