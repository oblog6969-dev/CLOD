export type Task = {
  id: string;
  title: string;
  time: string;
  archived: boolean;
};
export type Day = {
  completed: string[];
  rules: string[];
  note: string;
  mood: string;
};
export type Plan = {
  vision: string;
  antiVision: string;
  identity: string;
  year: string;
  month: string;
  constraints: string;
};
export type State = {
  version: 2;
  name: string;
  tasks: Task[];
  days: Record<string, Day>;
  answers: Record<string, string>;
  plan: Plan;
  steps: { id: string; title: string; done: boolean }[];
  reflections: { id: string; timestamp: string; note: string; mood: string }[];
  resetDate: string;
  reminderTimes: string[];
};
export const prompts = [
  [
    "m1",
    "What feels quietly out of balance?",
    "Notice the small dissatisfaction you have become used to.",
  ],
  [
    "m2",
    "Which frustrations keep returning?",
    "List three recurring complaints, without judging yourself.",
  ],
  [
    "m3",
    "What do your choices reveal?",
    "Consider what your recent actions seem to prioritize.",
  ],
  [
    "m4",
    "What is difficult to acknowledge?",
    "Write something honest you rarely share. You can skip any question.",
  ],
  [
    "m5",
    "Where does your current path lead?",
    "Picture an ordinary day five years from now if your routines stay the same.",
  ],
  [
    "m6",
    "What could a decade of this cost?",
    "Consider opportunities, relationships, and experiences.",
  ],
  [
    "m7",
    "What would you wish you had tried?",
    "Look back from later life with kindness toward yourself today.",
  ],
  [
    "m8",
    "Who illustrates this possible future?",
    "Reflect on someone whose trajectory helps you see your own.",
  ],
  [
    "m9",
    "Which old role are you ready to loosen?",
    "What might change in how other people see you?",
  ],
  [
    "m10",
    "What reason have you been avoiding?",
    "Give yourself permission to name it without self-criticism.",
  ],
  [
    "m11",
    "What is this pattern protecting?",
    "Notice both the benefit and the cost of staying where you are.",
  ],
  [
    "m12",
    "What would a fulfilling ordinary day look like?",
    "Imagine life three years ahead, including work, rest, and people.",
  ],
  [
    "m13",
    "Who would you practice becoming?",
    "Describe a way of being that would support that day.",
  ],
  [
    "m14",
    "What is one small experiment for this week?",
    "Choose something within your control that would express that identity.",
  ],
  [
    "e1",
    "What did today help you understand?",
    "Connect your morning answers with the moments you noticed today.",
  ],
  [
    "e2",
    "Which pattern deserves your attention?",
    "Name a changeable habit or belief, without turning it into a label for yourself.",
  ],
  [
    "e3",
    "What direction do you want to leave behind?",
    "Condense your anti-vision into one clear sentence.",
  ],
  [
    "e4",
    "What direction would you like to explore?",
    "A provisional vision is enough. You can revise it as you learn.",
  ],
  [
    "e5",
    "What would meaningful progress look like in a year?",
    "Choose one observable outcome.",
  ],
  [
    "e6",
    "What could you finish in the next month?",
    "Define a project small enough to begin now.",
  ],
  [
    "e7",
    "Which two or three actions belong on tomorrow’s calendar?",
    "Make them specific and realistic for the time and energy you have.",
  ],
] as const;
export const checkInPrompts = [
  "What is taking your attention, and is it what you intended?",
  "What did your last two hours make room for?",
  "Is your next choice supporting your direction?",
  "What needs a little more of your attention?",
  "Did you choose from habit or from intention today?",
  "What gave you energy today? What drained it?",
];
export function localDate(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
export function emptyDay(): Day {
  return { completed: [], rules: [], note: "", mood: "" };
}
export function freshState(): State {
  return {
    version: 2,
    name: "",
    tasks: [],
    days: {},
    answers: {},
    plan: {
      vision: "",
      antiVision: "",
      identity: "",
      year: "",
      month: "",
      constraints: "",
    },
    steps: [],
    reflections: [],
    resetDate: localDate(),
    reminderTimes: ["11:00", "13:30", "15:15", "17:00", "19:30", "21:00"],
  };
}
export function toggleTask(
  state: State,
  id: string,
  date = localDate(),
): State {
  if (!state.tasks.some((t) => t.id === id && !t.archived)) return state;
  const day = state.days[date] ?? emptyDay();
  return {
    ...state,
    days: {
      ...state.days,
      [date]: {
        ...day,
        completed: day.completed.includes(id)
          ? day.completed.filter((x) => x !== id)
          : [...day.completed, id],
      },
    },
  };
}
export function progress(state: State, date = localDate()) {
  const total =
    Object.values(state.days).reduce((n, d) => n + d.completed.length * 25, 0) +
    state.steps.filter((s) => s.done).length * 50;
  let level = 1,
    xp = total;
  while (xp >= level * 100) {
    xp -= level * 100;
    level++;
  }
  let streak = 0;
  const cursor = new Date(`${date}T12:00:00`);
  if (!state.days[date]?.completed.length) cursor.setDate(cursor.getDate() - 1);
  while (state.days[localDate(cursor)]?.completed.length) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return {
    total,
    level,
    xp,
    next: level * 100,
    streak,
    project: state.steps.length
      ? Math.round(
          (state.steps.filter((s) => s.done).length / state.steps.length) * 100,
        )
      : 0,
  };
}
const object = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === "object" && !Array.isArray(v);
const string = (v: unknown): v is string =>
  typeof v === "string" && v.length <= 50000;
const strings = (v: unknown): v is string[] =>
  Array.isArray(v) && v.every(string) && new Set(v).size === v.length;
const dateKey = (v: string) =>
  /^\d{4}-\d{2}-\d{2}$/.test(v) && localDate(new Date(`${v}T12:00:00`)) === v;
export function decode(input: unknown): State {
  if (!object(input))
    throw new Error("This file does not contain a LifeOS backup.");
  if (input.version === 2) {
    const s = input;
    if (
      !string(s.name) ||
      !object(s.plan) ||
      ![
        "vision",
        "antiVision",
        "identity",
        "year",
        "month",
        "constraints",
      ].every((k) => string((s.plan as Record<string, unknown>)[k])) ||
      !Array.isArray(s.tasks) ||
      !s.tasks.every(
        (t) =>
          object(t) &&
          string(t.id) &&
          string(t.title) &&
          string(t.time) &&
          (t.time === "" || /^([01]\d|2[0-3]):[0-5]\d$/.test(t.time)) &&
          typeof t.archived === "boolean",
      ) ||
      !object(s.days) ||
      !Object.entries(s.days).every(
        ([k, d]) =>
          dateKey(k) &&
          object(d) &&
          strings(d.completed) &&
          strings(d.rules) &&
          string(d.note) &&
          string(d.mood),
      ) ||
      !object(s.answers) ||
      !Object.values(s.answers).every(string) ||
      !Array.isArray(s.steps) ||
      !s.steps.every(
        (t) =>
          object(t) &&
          string(t.id) &&
          string(t.title) &&
          typeof t.done === "boolean",
      ) ||
      !Array.isArray(s.reflections) ||
      !s.reflections.every(
        (r) =>
          object(r) &&
          string(r.id) &&
          string(r.timestamp) &&
          Number.isFinite(Date.parse(r.timestamp)) &&
          string(r.note) &&
          string(r.mood),
      ) ||
      !string(s.resetDate) ||
      !dateKey(s.resetDate) ||
      !Array.isArray(s.reminderTimes) ||
      s.reminderTimes.length !== 6 ||
      !s.reminderTimes.every(
        (t) => string(t) && /^([01]\d|2[0-3]):[0-5]\d$/.test(t),
      )
    )
      throw new Error(
        "The backup is incomplete or contains invalid data. Your current data has been kept.",
      );
    const state = s as unknown as State;
    if (
      new Set(state.tasks.map((t) => t.id)).size !== state.tasks.length ||
      new Set(state.steps.map((t) => t.id)).size !== state.steps.length
    )
      throw new Error("The backup contains duplicate task IDs.");
    return structuredClone(state);
  }
  if (
    input.version === "1.0.0" &&
    object(input.identity) &&
    object(input.mission) &&
    object(input.bossFight) &&
    Array.isArray(input.quests)
  ) {
    const state = freshState();
    const identity = input.identity;
    const read = (v: unknown) => (typeof v === "string" ? v : "");
    state.name = read(identity.name);
    state.plan = {
      identity: read(identity.statement),
      vision: object(identity.vision) ? read(identity.vision.summary) : "",
      antiVision: object(identity.antiVision)
        ? read(identity.antiVision.summary)
        : "",
      year: read(input.mission.title),
      month: read(input.bossFight.name),
      constraints: Array.isArray(input.rules)
        ? input.rules
            .filter(object)
            .map((r) => read(r.text))
            .join("\n")
        : "",
    };
    state.tasks = input.quests.filter(object).map((q, i) => ({
      id: `legacy-${i}`,
      title: read(q.title),
      time: "",
      archived: false,
    }));
    const legacyDate =
      typeof input.lastActiveDate === "string" && dateKey(input.lastActiveDate)
        ? input.lastActiveDate
        : localDate();
    state.days[legacyDate] = {
      ...emptyDay(),
      completed: input.quests
        .filter(object)
        .flatMap((q, i) => (q.completed === true ? [`legacy-${i}`] : [])),
    };
    state.steps = Array.isArray(input.bossFight.subTasks)
      ? input.bossFight.subTasks.filter(object).map((t, i) => ({
          id: `step-${i}`,
          title: read(t.title),
          done: t.completed === true,
        }))
      : [];
    state.reflections = Array.isArray(input.interruptLogs)
      ? input.interruptLogs.filter(object).map((r, i) => ({
          id: `reflection-${i}`,
          timestamp: Number.isFinite(Date.parse(read(r.timestamp)))
            ? new Date(read(r.timestamp)).toISOString()
            : new Date().toISOString(),
          note: read(r.note),
          mood: read(r.rating),
        }))
      : [];
    return decode(state);
  }
  throw new Error(
    "Unsupported backup version. Your current data has been kept.",
  );
}
