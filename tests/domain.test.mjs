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
