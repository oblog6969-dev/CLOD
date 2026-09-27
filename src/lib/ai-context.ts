import type { AiContext, AiHistory, AiInsightMemory, AiProfile } from "./ai.ts";
import type { State } from "./domain.ts";

export type ContextLimits = { field: number; note: number };
export const ANALYZE_LIMITS: ContextLimits = { field: 5000, note: 5000 };
export const CHAT_LIMITS: ContextLimits = { field: 500, note: 1000 };
export const MAX_INSIGHTS_FOR_AI = 5;

const text = (value: unknown, max: number) =>
  typeof value === "string" ? value.trim().slice(0, max) : "";
const texts = (value: unknown, count: number, max: number) =>
  Array.isArray(value) ? value.slice(0, count).map((v) => text(v, max)).filter(Boolean) : [];
const count = (value: unknown) =>
  typeof value === "number" && Number.isFinite(value) ? Math.max(0, Math.round(value)) : 0;
const maybeCount = (value: unknown) => (value === null || value === undefined ? null : count(value));
const record = (value: unknown): Record<string, unknown> | null =>
  value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
const TRENDS = ["up", "down", "steady", "unknown"] as const;

function cleanHistory(value: unknown): AiHistory | undefined {
  const h = record(value);
  if (!h) return undefined;
  const moods = record(h.moodCounts) ?? {};
  return {
    windowDays: count(h.windowDays),
    trackedDays: count(h.trackedDays),
    activeDays: count(h.activeDays),
    currentStreak: count(h.currentStreak),
    longestStreak: count(h.longestStreak),
    moodCounts: Object.fromEntries(
      Object.entries(moods).slice(0, 8).map(([k, v]) => [text(k, 40), count(v)]),
    ),
    moodTrend: (TRENDS as readonly unknown[]).includes(h.moodTrend)
      ? (h.moodTrend as AiHistory["moodTrend"])
      : "unknown",
    boundariesKeptPercent: maybeCount(h.boundariesKeptPercent),
    reflectionsInWindow: count(h.reflectionsInWindow),
    daysSincePlanChange: maybeCount(h.daysSincePlanChange),
    planRevisions: count(h.planRevisions),
    assessmentRuns: count(h.assessmentRuns),
    assessmentChanges: texts(h.assessmentChanges, 5, 40),
    projectProgress: text(h.projectProgress, 20) || null,
    observations: texts(h.observations, 12, 400),
  };
}

function cleanProfile(value: unknown): AiProfile | undefined {
  const p = record(value);
  if (!p || !text(p.archetype, 120)) return undefined;
  return {
    archetype: text(p.archetype, 120),
    coreMotive: text(p.coreMotive, 20),
    discStyle: text(p.discStyle, 5),
    primaryNeed: text(p.primaryNeed, 20),
    stressTrigger: text(p.stressTrigger, 20),
    topValues: texts(p.topValues, 6, 40),
    maslowCenter: text(p.maslowCenter, 30) || null,
    assessedAt: text(p.assessedAt, 40),
    previousRuns: count(p.previousRuns),
    changedSinceLast: texts(p.changedSinceLast, 5, 40),
  };
}

function cleanInsights(value: unknown): AiInsightMemory[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const insights = value
    .slice(-MAX_INSIGHTS_FOR_AI)
    .map(record)
    .filter((i): i is Record<string, unknown> => !!i)
    .map((i) => ({
      date: text(i.date, 40),
      focus: text(i.focus, 300),
      summary: text(i.summary, 800),
      patterns: texts(i.patterns, 5, 300),
      recommendations: texts(i.recommendations, 4, 300),
      question: text(i.question, 300),
      editedByUser: i.editedByUser === true,
    }))
    .filter((i) => i.summary);
  return insights.length ? insights : undefined;
}

/** Server-side: bound and reshape whatever the browser sent. Nothing unrecognized passes through. */
export function cleanContext(input: unknown, limits: ContextLimits): AiContext | null {
  const raw = record(input);
  if (!raw) return null;
  const context: AiContext = {};
  const plan = record(raw.plan);
  if (plan) {
    const cleaned = Object.fromEntries(
      Object.entries(plan).slice(0, 8).map(([k, v]) => [k, text(v, limits.field)]).filter(([, v]) => v),
    );
    if (Object.keys(cleaned).length) context.plan = cleaned;
  }
  if (Array.isArray(raw.tasks)) {
    const tasks = raw.tasks
      .slice(0, 30)
      .map((task) => ({
        title: text(record(task)?.title, 300),
        completedToday: record(task)?.completedToday === true,
      }))
      .filter((task) => task.title);
    if (tasks.length) context.tasks = tasks;
  }
  const answers = record(raw.answers);
  if (answers) {
    const cleaned = Object.fromEntries(
      Object.entries(answers).slice(0, 30).map(([k, v]) => [k, text(v, limits.field)]).filter(([, v]) => v),
    );
    if (Object.keys(cleaned).length) context.answers = cleaned;
  }
  if (Array.isArray(raw.reflections)) {
    const reflections = raw.reflections
      .slice(-20)
      .map((r) => ({
        timestamp: text(record(r)?.timestamp, 50),
        note: text(record(r)?.note, limits.note),
        mood: text(record(r)?.mood, 100),
      }))
      .filter((r) => r.note);
    if (reflections.length) context.reflections = reflections;
  }
  const history = cleanHistory(raw.history);
  if (history) context.history = history;
  const profile = cleanProfile(raw.profile);
  if (profile) context.profile = profile;
  const insights = cleanInsights(raw.insights);
  if (insights) context.insights = insights;
  return Object.keys(context).length ? context : null;
}

/** Client-side: the current baseline plus how it moved since the previous run. */
export function profileForAi(state: State): AiProfile | undefined {
  const p = state.assessmentProfile;
  if (!p) return undefined;
  const runs = state.assessments ?? [];
  const [previous, latest] = runs.slice(-2);
  const keys = ["coreMotive", "discStyle", "primaryNeed", "stressTrigger", "maslowCenter"] as const;
  return {
    archetype: p.archetypeName,
    coreMotive: p.coreMotive,
    discStyle: p.discStyle,
    primaryNeed: p.primaryNeed,
    stressTrigger: p.stressTrigger,
    topValues: p.topValues.slice(0, 6),
    maslowCenter: p.maslowCenter ?? null,
    assessedAt: p.completedAt,
    previousRuns: Math.max(0, runs.length - 1),
    changedSinceLast:
      previous && latest ? keys.filter((k) => previous.profile[k] !== latest.profile[k]) : [],
  };
}

export function insightsForAi(state: State): AiInsightMemory[] {
  return (state.insights ?? []).slice(-MAX_INSIGHTS_FOR_AI).map((i) => ({
    date: i.updatedAt,
    focus: i.focus,
    summary: i.summary,
    patterns: i.patterns,
    recommendations: i.recommendations.map((r) => `${r.title}: ${r.nextStep}`),
    question: i.question,
    editedByUser: i.edited,
  }));
}

/** Appended to both the analysis and the chat system prompts. */
export const HISTORY_GUIDANCE =
  "When a history digest is supplied, relate the person's present situation to it: cite the specific numbers or observations you rely on, compare recent weeks with earlier ones, and distinguish a pattern from its cause (you only see correlations). When past saved insights are supplied, build on them rather than repeating them, say briefly whether earlier suggestions seem to have held, and treat any insight marked editedByUser as the person's own correction, which outranks your earlier reading. When a baseline profile is supplied, use it only as a lens for tone and framing, never as a label or verdict about the person.";
