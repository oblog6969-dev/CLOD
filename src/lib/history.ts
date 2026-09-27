import { localDate, progress, type AssessmentProfile, type State } from "./domain.ts";

export const MOOD_SCORES: Record<string, number> = {
  "Low energy": 1,
  "A little scattered": 2,
  Steady: 3,
  "Feeling good": 4,
};
const MIN_TRACKED_DAYS = 7;
const MIN_MOODS_PER_HALF = 3;

export type Trend = "up" | "down" | "steady" | "unknown";
export type HistorySummary = {
  windowDays: number;
  trackedDays: number;
  activeDays: number;
  totalCompletions: number;
  currentStreak: number;
  longestStreak: number;
  moodCounts: Record<string, number>;
  moodTrend: { recent: number | null; previous: number | null; direction: Trend };
  /** Average completed steps per weekday in the window, index 0 = Sunday. */
  weekdayAverages: number[];
  strongestWeekday: number | null;
  weakestWeekday: number | null;
  boundaryCount: number;
  boundariesKeptRate: number | null;
  reflectionsInWindow: number;
  reflectionsTotal: number;
  planFilledFields: number;
  planRevisions: number;
  daysSincePlanChange: number | null;
  assessmentRuns: number;
  assessmentChanges: (keyof AssessmentProfile)[];
  projectSteps: number;
  projectDone: number;
};

const dayMs = 86_400_000;
const shift = (date: string, days: number) => {
  const d = new Date(`${date}T12:00:00`);
  d.setDate(d.getDate() + days);
  return localDate(d);
};
const daysBetween = (from: string, to: string) =>
  Math.round((Date.parse(`${to}T12:00:00`) - Date.parse(`${from}T12:00:00`)) / dayMs);
const mean = (values: number[]) =>
  values.length ? values.reduce((a, b) => a + b, 0) / values.length : null;

export function summarizeHistory(state: State, today = localDate(), windowDays = 28): HistorySummary {
  const window = Array.from({ length: windowDays }, (_, i) => shift(today, i - windowDays + 1));
  const records = window.map((date) => ({ date, day: state.days[date] }));
  const tracked = records.filter(
    ({ day }) => day && (day.completed.length || day.rules.length || day.mood || day.note.trim()),
  );
  const moodCounts: Record<string, number> = {};
  for (const { day } of records) if (day?.mood) moodCounts[day.mood] = (moodCounts[day.mood] ?? 0) + 1;

  const half = Math.floor(windowDays / 2);
  const moodScores = (slice: typeof records) =>
    slice.map(({ day }) => MOOD_SCORES[day?.mood ?? ""]).filter((s): s is number => s !== undefined);
  const recentMoods = moodScores(records.slice(windowDays - half));
  const previousMoods = moodScores(records.slice(0, windowDays - half));
  const recent = mean(recentMoods), previous = mean(previousMoods);
  let direction: Trend = "unknown";
  if (recentMoods.length >= MIN_MOODS_PER_HALF && previousMoods.length >= MIN_MOODS_PER_HALF && recent !== null && previous !== null)
    direction = recent - previous >= 0.5 ? "up" : previous - recent >= 0.5 ? "down" : "steady";

  const weekdayTotals = Array(7).fill(0), weekdayCounts = Array(7).fill(0);
  for (const { date, day } of records) {
    const weekday = new Date(`${date}T12:00:00`).getDay();
    weekdayCounts[weekday]++;
    weekdayTotals[weekday] += day?.completed.length ?? 0;
  }
  const weekdayAverages = weekdayTotals.map((t, i) => (weekdayCounts[i] ? t / weekdayCounts[i] : 0));
  const activeDays = records.filter(({ day }) => day?.completed.length).length;
  const hasWeekdayPattern =
    activeDays >= MIN_TRACKED_DAYS && Math.max(...weekdayAverages) > Math.min(...weekdayAverages);
  const strongestWeekday = hasWeekdayPattern ? weekdayAverages.indexOf(Math.max(...weekdayAverages)) : null;
  const weakestWeekday = hasWeekdayPattern ? weekdayAverages.indexOf(Math.min(...weekdayAverages)) : null;

  const completedDates = Object.keys(state.days).filter((d) => state.days[d].completed.length).sort();
  let longestStreak = 0, run = 0;
  completedDates.forEach((date, i) => {
    run = i > 0 && daysBetween(completedDates[i - 1], date) === 1 ? run + 1 : 1;
    longestStreak = Math.max(longestStreak, run);
  });

  const boundaries = Array.from(
    new Set(state.plan.constraints.split("\n").map((s) => s.trim()).filter(Boolean)),
  );
  const boundariesKeptRate =
    boundaries.length && tracked.length
      ? tracked.reduce((n, { day }) => n + day!.rules.filter((r) => boundaries.includes(r)).length, 0) /
        (boundaries.length * tracked.length)
      : null;

  const windowStart = Date.parse(`${window[0]}T00:00:00`);
  const lastPlan = state.planHistory?.at(-1);
  const assessments = state.assessments ?? [];
  const [previousRun, latestRun] = assessments.slice(-2);
  const compared: (keyof AssessmentProfile)[] = ["coreMotive", "discStyle", "primaryNeed", "stressTrigger", "maslowCenter"];

  return {
    windowDays,
    trackedDays: tracked.length,
    activeDays,
    totalCompletions: records.reduce((n, { day }) => n + (day?.completed.length ?? 0), 0),
    currentStreak: progress(state, today).streak,
    longestStreak,
    moodCounts,
    moodTrend: { recent, previous, direction },
    weekdayAverages,
    strongestWeekday,
    weakestWeekday,
    boundaryCount: boundaries.length,
    boundariesKeptRate,
    reflectionsInWindow: state.reflections.filter((r) => Date.parse(r.timestamp) >= windowStart).length,
    reflectionsTotal: state.reflections.length,
    planFilledFields: Object.values(state.plan).filter((v) => v.trim()).length,
    planRevisions: state.planHistory?.length ?? 0,
    daysSincePlanChange: lastPlan ? daysBetween(localDate(new Date(lastPlan.savedAt)), today) : null,
    assessmentRuns: assessments.length,
    assessmentChanges:
      previousRun && latestRun
        ? compared.filter((k) => latestRun.profile[k] !== previousRun.profile[k])
        : [],
    projectSteps: state.steps.length,
    projectDone: state.steps.filter((s) => s.done).length,
  };
}

type Locale = "en" | "ar";
const copy = {
  en: {
    early: "Patterns show up after about a week of check-ins. Keep going at your own pace.",
    presence: (a: number, w: number) => `You completed at least one step on ${a} of the last ${w} days.`,
    streak: (longest: number, current: number) =>
      `Your longest run so far is ${longest} days${current ? `; you're on ${current} now` : ""}.`,
    moodUp: "Your check-in moods have been lighter over the last two weeks than the two before.",
    moodDown: "Your check-in moods have been heavier over the last two weeks than the two before. That may call for a gentler plan, not a harder one.",
    moodSteady: "Your check-in moods have been fairly steady across the last four weeks.",
    weekday: (strong: string, weak: string) => `Your steps happen most on ${strong} and least on ${weak}.`,
    boundaries: (pct: number) => `You marked your boundaries as kept on about ${pct}% of tracked days.`,
    planStale: (days: number) => `Your direction hasn't changed in ${days} days. A quick review can confirm it still fits.`,
    assessmentShift: (n: number) => `Since your previous baseline, ${n} part${n === 1 ? "" : "s"} of your profile shifted.`,
    noReflections: "No reflections in the last four weeks. A short note after a hard day can show you more than a good one.",
  },
  ar: {
    early: "تظهر الأنماط بعد نحو أسبوع من التسجيل. واصل وفق إيقاعك.",
    presence: (a: number, w: number) => `أنجزت خطوة واحدة على الأقل في ${a} من آخر ${w} يوماً.`,
    streak: (longest: number, current: number) =>
      `أطول سلسلة لديك حتى الآن ${longest} أيام${current ? `، وأنت الآن في يومك ${current}` : ""}.`,
    moodUp: "كانت حالتك المزاجية في الأسبوعين الأخيرين أخفّ مما كانت عليه في الأسبوعين السابقين.",
    moodDown: "كانت حالتك المزاجية في الأسبوعين الأخيرين أثقل من الأسبوعين السابقين. قد يعني ذلك حاجتك إلى خطة ألطف، لا أصعب.",
    moodSteady: "بقيت حالتك المزاجية متقاربة خلال الأسابيع الأربعة الأخيرة.",
    weekday: (strong: string, weak: string) => `تنجز خطواتك غالباً يوم ${strong}، وأقلّها يوم ${weak}.`,
    boundaries: (pct: number) => `حافظت على حدودك في نحو ${pct}% من الأيام المسجّلة.`,
    planStale: (days: number) => `لم يتغير اتجاهك منذ ${days} يوماً. مراجعة سريعة تؤكد أنه ما زال مناسباً.`,
    assessmentShift: (n: number) => `منذ خط الأساس السابق، تغيّر ${n} من جوانب ملفك.`,
    noReflections: "لا توجد تأملات في الأسابيع الأربعة الأخيرة. ملاحظة قصيرة بعد يوم صعب قد تكشف أكثر من يوم جيد.",
  },
};

/** Plain-language observations. Deliberately descriptive: patterns, never diagnoses or verdicts. */
export function historyConclusions(summary: HistorySummary, locale: Locale = "en"): string[] {
  const t = copy[locale];
  if (summary.trackedDays < MIN_TRACKED_DAYS) return [t.early];
  const weekdayName = (day: number) =>
    new Date(2026, 0, 4 + day).toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US", { weekday: "long" });
  const out = [t.presence(summary.activeDays, summary.windowDays)];
  if (summary.longestStreak >= 3) out.push(t.streak(summary.longestStreak, summary.currentStreak));
  if (summary.moodTrend.direction === "up") out.push(t.moodUp);
  if (summary.moodTrend.direction === "down") out.push(t.moodDown);
  if (summary.moodTrend.direction === "steady") out.push(t.moodSteady);
  if (summary.strongestWeekday !== null && summary.weakestWeekday !== null)
    out.push(t.weekday(weekdayName(summary.strongestWeekday), weekdayName(summary.weakestWeekday)));
  if (summary.boundariesKeptRate !== null)
    out.push(t.boundaries(Math.round(summary.boundariesKeptRate * 100)));
  if (summary.daysSincePlanChange !== null && summary.daysSincePlanChange >= 30)
    out.push(t.planStale(summary.daysSincePlanChange));
  if (summary.assessmentChanges.length) out.push(t.assessmentShift(summary.assessmentChanges.length));
  if (summary.reflectionsInWindow === 0) out.push(t.noReflections);
  return out;
}

/** Compact, text-free digest for the AI guide: numbers and observations, no journal content. */
export function historyDigest(summary: HistorySummary) {
  return {
    windowDays: summary.windowDays,
    trackedDays: summary.trackedDays,
    activeDays: summary.activeDays,
    currentStreak: summary.currentStreak,
    longestStreak: summary.longestStreak,
    moodCounts: summary.moodCounts,
    moodTrend: summary.moodTrend.direction,
    boundariesKeptPercent:
      summary.boundariesKeptRate === null ? null : Math.round(summary.boundariesKeptRate * 100),
    reflectionsInWindow: summary.reflectionsInWindow,
    daysSincePlanChange: summary.daysSincePlanChange,
    planRevisions: summary.planRevisions,
    assessmentRuns: summary.assessmentRuns,
    assessmentChanges: summary.assessmentChanges,
    projectProgress: summary.projectSteps ? `${summary.projectDone}/${summary.projectSteps}` : null,
    observations: historyConclusions(summary, "en"),
  };
}
export type HistoryDigest = ReturnType<typeof historyDigest>;
