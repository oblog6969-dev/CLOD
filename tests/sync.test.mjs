import test from "node:test";
import assert from "node:assert/strict";
import { freshState } from "../src/lib/domain.ts";
import { deepEqual, mergeStates } from "../src/lib/sync-logic.ts";
import { createSyncEngine, META_KEY } from "../src/lib/sync-engine.ts";

const withDay = (state, date, day) => ({
  ...state,
  days: { ...state.days, [date]: { completed: [], rules: [], note: "", mood: "", ...day } },
});
const task = (id) => ({ id, title: `Task ${id}`, time: "", archived: false });
const reflection = (id, timestamp, note = id) => ({ id, timestamp, note, mood: "Steady" });

// ---------- mergeStates ----------

test("deepEqual ignores object key order (jsonb reorders keys)", () => {
  assert.ok(deepEqual({ a: 1, b: { c: [1, 2], d: "x" } }, { b: { d: "x", c: [1, 2] }, a: 1 }));
  assert.ok(!deepEqual({ a: [1, 2] }, { a: [2, 1] }));
});

test("completions made on the same day on two devices are combined", () => {
  const base = withDay(freshState(), "2026-09-28", {});
  const local = withDay(base, "2026-09-28", { completed: ["a"] });
  const remote = withDay(base, "2026-09-28", { completed: ["b"] });
  assert.deepEqual(mergeStates(base, local, remote, true).days["2026-09-28"].completed, ["b", "a"]);
});

test("a removal on one side is kept while the other side adds", () => {
  const base = withDay(freshState(), "2026-09-28", { completed: ["a", "b"] });
  const local = withDay(base, "2026-09-28", { completed: ["a"] });
  const remote = withDay(base, "2026-09-28", { completed: ["a", "b", "c"] });
  assert.deepEqual(mergeStates(base, local, remote, false).days["2026-09-28"].completed, ["a", "c"]);
});

test("different plan fields edited on each device both survive", () => {
  const base = freshState();
  const local = { ...base, plan: { ...base.plan, vision: "Calm mornings" } };
  const remote = { ...base, plan: { ...base.plan, identity: "Someone who finishes" } };
  const merged = mergeStates(base, local, remote, false);
  assert.equal(merged.plan.vision, "Calm mornings");
  assert.equal(merged.plan.identity, "Someone who finishes");
});

test("the same field edited on both devices goes to the more recent edit", () => {
  const base = freshState();
  const local = { ...base, name: "Local" };
  const remote = { ...base, name: "Remote" };
  assert.equal(mergeStates(base, local, remote, true).name, "Local");
  assert.equal(mergeStates(base, local, remote, false).name, "Remote");
});

test("first link (no base) combines both devices instead of replacing one", () => {
  const local = { ...freshState(), tasks: [task("l")], reflections: [reflection("r1", "2026-09-01T10:00:00Z")] };
  const remote = { ...freshState(), tasks: [task("r")], reflections: [reflection("r2", "2026-09-02T10:00:00Z")] };
  const merged = mergeStates(null, local, remote, false);
  assert.deepEqual(merged.tasks.map((t) => t.id), ["r", "l"]);
  assert.deepEqual(merged.reflections.map((r) => r.id), ["r1", "r2"]);
});

test("a deleted item stays deleted when the other side didn't touch it", () => {
  const base = { ...freshState(), steps: [{ id: "s1", title: "One", done: false }, { id: "s2", title: "Two", done: false }] };
  const local = { ...base, steps: [base.steps[1]] };
  const remote = { ...base, name: "unrelated change" };
  const merged = mergeStates(base, local, remote, false);
  assert.deepEqual(merged.steps.map((s) => s.id), ["s2"]);
  assert.equal(merged.name, "unrelated change");
});

test("single-choice selections never union into two answers", () => {
  const base = { ...freshState(), selectedOptions: { m1: ["a"] } };
  const local = { ...base, selectedOptions: { m1: ["b"] } };
  const remote = { ...base, selectedOptions: { m1: ["c"] } };
  assert.deepEqual(mergeStates(base, local, remote, true).selectedOptions.m1, ["b"]);
});

test("saved insights and assessment runs from both devices are kept, in time order", () => {
  const insight = (id, createdAt) => ({
    id, createdAt, updatedAt: createdAt, focus: "", summary: id, patterns: [],
    recommendations: [], question: "", sharedCategories: [], edited: false,
  });
  const base = { ...freshState(), insights: [] };
  const local = { ...base, insights: [insight("later", "2026-09-28T12:00:00Z")] };
  const remote = { ...base, insights: [insight("earlier", "2026-09-28T09:00:00Z")] };
  assert.deepEqual(mergeStates(base, local, remote, false).insights.map((i) => i.id), ["earlier", "later"]);
});

test("a fully populated workspace survives a merge unchanged", () => {
  const full = {
    ...withDay(freshState(), "2026-09-28", { completed: ["t1"], rules: ["Sleep"], note: "n", mood: "Steady" }),
    name: "Omar",
    tasks: [task("t1")],
    answers: { m1: "a" },
    selectedOptions: { m1: ["x"] },
    assessmentProfile: {
      completedAt: "2026-09-01T10:00:00Z", coreMotive: "blue", discStyle: "S", primaryNeed: "empathy",
      stressTrigger: "conflict", consciousnessLevel: 250, topValues: ["care"], archetypeName: "A", motiveDescription: "",
    },
    steps: [{ id: "s1", title: "Step", done: true }],
    reflections: [reflection("r1", "2026-09-01T10:00:00Z")],
    planHistory: [{ id: "p1", savedAt: "2026-09-01T10:00:00Z", plan: freshState().plan }],
    insights: [],
    assessments: [],
  };
  assert.ok(deepEqual(mergeStates(full, full, full, false), full));
  assert.ok(deepEqual(mergeStates(null, full, full, true), full));
});

test("a State field the merge doesn't know yet is carried over, never dropped", () => {
  const base = { ...freshState(), futureField: { a: 1 } };
  const local = { ...base, futureField: { a: 2 } };
  const remote = { ...base, name: "other change" };
  const merged = mergeStates(base, local, remote, false);
  assert.deepEqual(merged.futureField, { a: 2 });
  assert.equal(merged.name, "other change");
});

// ---------- sync engine against an in-memory server ----------

let clock = Date.parse("2026-09-28T08:00:00Z");
const now = () => new Date((clock += 1000));

function fakeServer() {
  const server = { row: null, pushes: 0, online: true };
  const guard = () => {
    if (!server.online) throw new Error("offline");
  };
  server.api = {
    async fetchRevision() {
      guard();
      return server.row ? server.row.revision : null;
    },
    async fetchWorkspace() {
      guard();
      return server.row ? structuredClone(server.row) : null;
    },
    async push(state, base, clientEditedAt) {
      guard();
      server.pushes++;
      if (!server.row) {
        if (base !== 0) return { status: "conflict", revision: 0, state: null };
        server.row = { revision: 1, state: structuredClone(state), clientEditedAt };
        return { status: "ok", revision: 1 };
      }
      if (server.row.revision !== base)
        return { status: "conflict", revision: server.row.revision, state: structuredClone(server.row.state), clientEditedAt: server.row.clientEditedAt };
      server.row = { revision: server.row.revision + 1, state: structuredClone(state), clientEditedAt };
      return { status: "ok", revision: server.row.revision };
    },
  };
  return server;
}

function device(server, { userId = "u1", api = server.api, storage = new Map() } = {}) {
  const d = { local: freshState(), storage };
  d.engine = createSyncEngine({
    userId,
    api,
    storage: { get: (k) => storage.get(k) ?? null, set: (k, v) => storage.set(k, v), remove: (k) => storage.delete(k) },
    getLocal: () => (d.blocked ? null : d.local),
    applyLocal: (state) => {
      d.local = structuredClone(state);
      return true;
    },
    now,
  });
  d.edit = (fn) => {
    d.local = fn(d.local);
    d.engine.noteLocalEdit();
  };
  return d;
}

test("first device seeds the account and a second device picks it up without an extra push", async () => {
  const server = fakeServer();
  const a = device(server);
  a.edit((s) => ({ ...s, name: "Omar", tasks: [task("t1")] }));
  assert.equal(await a.engine.reconcile(), "pushed");
  const b = device(server);
  await b.engine.reconcile();
  assert.equal(b.local.name, "Omar");
  assert.deepEqual(b.local.tasks.map((t) => t.id), ["t1"]);
  assert.equal(server.row.revision, 1, "an empty device joining must not create a new revision");
  assert.equal(b.engine.isDirty(), false);
});

test("repeated polling between two synced devices never ping-pongs", async () => {
  const server = fakeServer();
  const a = device(server), b = device(server);
  a.edit((s) => ({ ...s, name: "Omar" }));
  await a.engine.reconcile();
  await b.engine.reconcile();
  const pushesBefore = server.pushes;
  for (let i = 0; i < 5; i++) {
    assert.equal(await a.engine.reconcile(), "idle");
    assert.equal(await b.engine.reconcile(), "idle");
  }
  assert.equal(server.pushes, pushesBefore);
  assert.equal(server.row.revision, 1);
});

test("concurrent edits on two devices both reach every device", async () => {
  const server = fakeServer();
  const a = device(server), b = device(server);
  await a.engine.reconcile();
  await b.engine.reconcile();
  a.edit((s) => ({ ...s, tasks: [...s.tasks, task("from-a")] }));
  b.edit((s) => ({ ...s, tasks: [...s.tasks, task("from-b")] }));
  assert.equal(await a.engine.reconcile(), "pushed");
  assert.equal(await b.engine.reconcile(), "merged");
  assert.equal(await a.engine.reconcile(), "pulled");
  const ids = (d) => d.local.tasks.map((t) => t.id).sort();
  assert.deepEqual(ids(a), ["from-a", "from-b"]);
  assert.deepEqual(ids(b), ["from-a", "from-b"]);
  assert.deepEqual(server.row.state.tasks.map((t) => t.id).sort(), ["from-a", "from-b"]);
});

test("an offline edit survives a change another device pushed meanwhile", async () => {
  const server = fakeServer();
  const onlineB = { value: true };
  const bApi = {
    fetchRevision: () => (onlineB.value ? server.api.fetchRevision() : Promise.reject(new Error("offline"))),
    fetchWorkspace: () => server.api.fetchWorkspace(),
    push: (...args) => server.api.push(...args),
  };
  const a = device(server), b = device(server, { api: bApi });
  await a.engine.reconcile();
  await b.engine.reconcile();
  onlineB.value = false;
  b.edit((s) => withDay(s, "2026-09-28", { note: "written on the train" }));
  await assert.rejects(b.engine.reconcile());
  a.edit((s) => ({ ...s, name: "Changed on laptop" }));
  await a.engine.reconcile();
  onlineB.value = true;
  await b.engine.reconcile();
  assert.equal(b.local.name, "Changed on laptop");
  assert.equal(b.local.days["2026-09-28"].note, "written on the train");
  assert.equal(server.row.state.days["2026-09-28"].note, "written on the train");
  assert.equal(b.engine.isDirty(), false);
});

test("an edit made while a push is in flight stays pending", async () => {
  const server = fakeServer();
  let release;
  const gate = new Promise((resolve) => (release = resolve));
  const slowApi = { ...server.api, push: async (...args) => { await gate; return server.api.push(...args); } };
  const a = device(server, { api: slowApi });
  a.edit((s) => ({ ...s, name: "first" }));
  const pending = a.engine.reconcile();
  await new Promise((r) => setTimeout(r, 0));
  a.edit((s) => ({ ...s, name: "second" }));
  release();
  await pending;
  assert.equal(server.row.state.name, "first");
  assert.equal(a.engine.isDirty(), true, "the second edit must not be marked synced");
  await a.engine.reconcile();
  assert.equal(server.row.state.name, "second");
  assert.equal(a.engine.isDirty(), false);
});

test("a deletion on one device reaches the other", async () => {
  const server = fakeServer();
  const a = device(server), b = device(server);
  a.edit((s) => ({ ...s, steps: [{ id: "s1", title: "Draft", done: false }] }));
  await a.engine.reconcile();
  await b.engine.reconcile();
  assert.equal(b.local.steps.length, 1);
  b.edit((s) => ({ ...s, steps: [] }));
  await b.engine.reconcile();
  await a.engine.reconcile();
  assert.equal(a.local.steps.length, 0);
});

test("unreadable local data is never pushed over the cloud copy", async () => {
  const server = fakeServer();
  const a = device(server);
  a.edit((s) => ({ ...s, name: "Keep me" }));
  await a.engine.reconcile();
  const b = device(server);
  b.blocked = true;
  assert.equal(await b.engine.reconcile(), "blocked");
  assert.equal(server.row.state.name, "Keep me");
  assert.equal(server.pushes, 1);
});

test("signing into a different account on the same device starts a fresh link", async () => {
  const server = fakeServer();
  const storage = new Map();
  const first = device(server, { storage, userId: "u1" });
  await first.engine.reconcile();
  assert.equal(JSON.parse(storage.get(META_KEY)).userId, "u1");
  device(fakeServer(), { storage, userId: "u2" });
  const meta = JSON.parse(storage.get(META_KEY));
  assert.equal(meta.userId, "u2");
  assert.equal(meta.baseRevision, 0);
});
