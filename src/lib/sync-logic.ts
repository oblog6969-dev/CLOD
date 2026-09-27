import { decode, type Day, type Plan, type State } from "./domain.ts";

/** Key-order-insensitive equality: Postgres jsonb reorders object keys, so JSON.stringify is not enough. */
export function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (typeof a !== "object" || typeof b !== "object" || a === null || b === null)
    return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  if (Array.isArray(a) && Array.isArray(b))
    return a.length === b.length && a.every((v, i) => deepEqual(v, b[i]));
  const ak = Object.keys(a).filter((k) => (a as Record<string, unknown>)[k] !== undefined);
  const bk = Object.keys(b).filter((k) => (b as Record<string, unknown>)[k] !== undefined);
  return (
    ak.length === bk.length &&
    ak.every((k) =>
      deepEqual((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k]),
    )
  );
}

/** Classic 3-way pick: a side that didn't change from base yields to the side that did. */
function pick<T>(base: T | undefined, local: T | undefined, remote: T | undefined, preferLocal: boolean) {
  if (deepEqual(local, remote)) return local;
  if (deepEqual(base, local)) return remote;
  if (deepEqual(base, remote)) return local;
  return preferLocal ? local : remote;
}

function mergeSet(base: string[], local: string[], remote: string[]): string[] {
  const removed = new Set([
    ...base.filter((x) => !local.includes(x)),
    ...base.filter((x) => !remote.includes(x)),
  ]);
  return [...remote, ...local.filter((x) => !remote.includes(x))].filter(
    (x) => !removed.has(x),
  );
}

function mergeRecord<T>(
  base: Record<string, T>,
  local: Record<string, T>,
  remote: Record<string, T>,
  preferLocal: boolean,
  both?: (b: T | undefined, l: T, r: T) => T,
): Record<string, T> {
  const out: Record<string, T> = {};
  for (const key of new Set([...Object.keys(remote), ...Object.keys(local)])) {
    const b = base[key], l = local[key], r = remote[key];
    const value =
      both && l !== undefined && r !== undefined
        ? both(b, l, r)
        : pick(b, l, r, preferLocal);
    if (value !== undefined) out[key] = value;
  }
  return out;
}

function mergeById<T extends { id: string }>(
  base: T[],
  local: T[],
  remote: T[],
  preferLocal: boolean,
  sortKey?: (item: T) => string,
): T[] {
  const index = (items: T[]) => new Map(items.map((i) => [i.id, i]));
  const b = index(base), l = index(local), r = index(remote);
  const ids = [...r.keys(), ...[...l.keys()].filter((id) => !r.has(id))];
  const merged = ids
    .map((id) => pick(b.get(id), l.get(id), r.get(id), preferLocal))
    .filter((item): item is T => item !== undefined);
  return sortKey
    ? merged.sort((x, y) => Date.parse(sortKey(x)) - Date.parse(sortKey(y)))
    : merged;
}

const planKeys: (keyof Plan)[] = ["vision", "antiVision", "identity", "year", "month", "constraints"];

const EMPTY_BASE: State = {
  version: 2,
  name: "",
  tasks: [],
  days: {},
  answers: {},
  plan: { vision: "", antiVision: "", identity: "", year: "", month: "", constraints: "" },
  steps: [],
  reflections: [],
  resetDate: "",
  reminderTimes: [],
};

/**
 * 3-way merge of two edited copies of the workspace against their last common synced state.
 * `base` is null for a device linking to an account for the first time: both sides are then
 * treated as additions, so nothing on either device is discarded. When the same field or item
 * was changed on both sides, `preferLocal` (the more recently edited side) wins.
 */
export function mergeStates(
  base: State | null,
  local: State,
  remote: State,
  preferLocal: boolean,
): State {
  const b = base ?? EMPTY_BASE;
  const p = preferLocal;
  const mergeDay = (bd: Day | undefined, ld: Day, rd: Day): Day => ({
    completed: mergeSet(bd?.completed ?? [], ld.completed, rd.completed),
    rules: mergeSet(bd?.rules ?? [], ld.rules, rd.rules),
    note: pick(bd?.note ?? "", ld.note, rd.note, p) ?? "",
    mood: pick(bd?.mood ?? "", ld.mood, rd.mood, p) ?? "",
  });
  const merged: State = {
    version: 2,
    name: pick(b.name, local.name, remote.name, p) ?? "",
    resetDate: pick(b.resetDate, local.resetDate, remote.resetDate, p) ?? local.resetDate,
    reminderTimes:
      pick(b.reminderTimes, local.reminderTimes, remote.reminderTimes, p) ?? local.reminderTimes,
    plan: Object.fromEntries(
      planKeys.map((k) => [k, pick(b.plan[k], local.plan[k], remote.plan[k], p) ?? ""]),
    ) as Plan,
    tasks: mergeById(b.tasks, local.tasks, remote.tasks, p),
    steps: mergeById(b.steps, local.steps, remote.steps, p),
    reflections: mergeById(b.reflections, local.reflections, remote.reflections, p, (x) => x.timestamp),
    days: mergeRecord(b.days, local.days, remote.days, p, mergeDay),
    answers: mergeRecord(b.answers, local.answers, remote.answers, p),
  };
  if (local.selectedOptions || remote.selectedOptions)
    merged.selectedOptions = mergeRecord(
      b.selectedOptions ?? {},
      local.selectedOptions ?? {},
      remote.selectedOptions ?? {},
      p,
    );
  const profile = pick(
    b.assessmentProfile ?? null,
    local.assessmentProfile ?? null,
    remote.assessmentProfile ?? null,
    p,
  );
  if (profile) merged.assessmentProfile = profile;
  if (local.assessments || remote.assessments)
    merged.assessments = mergeById(b.assessments ?? [], local.assessments ?? [], remote.assessments ?? [], p, (x) => x.completedAt);
  if (local.planHistory || remote.planHistory)
    merged.planHistory = mergeById(b.planHistory ?? [], local.planHistory ?? [], remote.planHistory ?? [], p, (x) => x.savedAt);
  if (local.insights || remote.insights)
    merged.insights = mergeById(b.insights ?? [], local.insights ?? [], remote.insights ?? [], p, (x) => x.createdAt);
  // Fields without a dedicated rule above are merged as whole values rather than dropped,
  // so a new State field can never be silently lost in sync. Give it a proper rule when you add it.
  const handled = new Set(Object.keys(merged).concat("selectedOptions", "assessmentProfile", "assessments", "planHistory", "insights"));
  const loose = merged as Record<string, unknown>;
  const [bl, ll, rl] = [b, local, remote] as unknown as Record<string, unknown>[];
  for (const key of new Set([...Object.keys(ll), ...Object.keys(rl)])) {
    if (handled.has(key)) continue;
    const value = pick(bl[key], ll[key], rl[key], p);
    if (value !== undefined) loose[key] = value;
  }
  return decode(merged);
}
