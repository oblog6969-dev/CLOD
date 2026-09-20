import { emptyDay, prompts, type Plan, type State } from "./domain";

export type View =
  "today" | "reset" | "direction" | "journal" | "assistant" | "settings";
export type GuideAction =
  | "reset"
  | "draft"
  | "plan"
  | "task"
  | "checkin"
  | "tasks"
  | "questions"
  | "project"
  | "assistant"
  | "backup";

// Product guidance maps to the existing source adaptation; it is not a score.
export const journeySteps = [
  {
    view: "reset",
    title: "Notice",
    destination: "Your reset",
    description: "Explore what you want to change.",
  },
  {
    view: "direction",
    title: "Choose",
    destination: "My direction",
    description: "Turn your answers into a plan.",
  },
  {
    view: "today",
    title: "Practice",
    destination: "Today",
    description: "Take one manageable action.",
  },
  {
    view: "journal",
    title: "Learn",
    destination: "Reflections",
    description: "Notice what to adjust next.",
  },
] as const;

export const planGuidance: Record<keyof Plan, string> = {
  vision:
    "Vision means the ordinary life you want to move toward. Describe what a good day would include.",
  antiVision:
    "Anti-vision means the future you want to avoid. Name a pattern you would like to change, without judging yourself.",
  identity:
    "Choose a quality you want to practice through your actions. You can try it out and change your mind.",
  year: "Choose one result you could recognize a year from now. It can be provisional.",
  month:
    "Choose a finishable project that supports that result. Add its concrete steps below your plan.",
  constraints:
    "Constraints are your boundaries: what you will protect while making progress, such as rest or time with others.",
};

const explanations: Record<View, { title: string; why: string; tip: string }> =
  {
    today: {
      title: "Put your direction into practice",
      why: "This is your daily home. Use it to choose and check off a few actions that support your plan.",
      tip: "Start with one action you can name clearly. Choose a time if that helps you begin; you can adjust it later.",
    },
    reset: {
      title: "Get to know your starting point",
      why: "Your reset gives you space to explore your patterns before making a plan. Move through reflection, noticing during the day, and a review of what matters to you.",
      tip: "Begin with one question. A short, honest answer is enough. Skip anything you are not ready to explore and return when it helps.",
    },
    direction: {
      title: "Give your next steps a purpose",
      why: "Keep your desired future, a yearly outcome, a monthly project, and personal boundaries together. Your plan can change as you learn.",
      tip: "Start with the life you want to move toward, then choose one project you could finish this month. Each field below explains what it means.",
    },
    journal: {
      title: "Use experience to adjust your plan",
      why: "Reflections connect what you intended with what actually happened. Your notes and recent actions can help you decide what to keep or change.",
      tip: "Try one sentence: what helped today, what got in the way, or what you want to try differently tomorrow. An empty day needs no catch-up.",
    },
    assistant: {
      title: "Get an optional second perspective",
      why: "The AI guide can help organize answers you choose to share and suggest a next step. You decide what fits and what becomes an action.",
      tip: "Save an answer or action first, then choose only the context you want to discuss. Check suggestions against your own experience. You can use the whole journey without AI.",
    },
    settings: {
      title: "Make this space yours and keep a copy",
      why: "Your workspace is saved in this browser. Here you can set your name, download a backup, and restore your saved work.",
      tip: "Download a backup after a useful session and before changing devices. Importing replaces this workspace; a recovery copy is saved first.",
    },
  };

export function getJourneyGuide(view: View, state: State, date: string) {
  const answered = prompts.filter(([id]) => state.answers[id]?.trim()).length;
  const planFields = Object.values(state.plan).filter((value) =>
    value.trim(),
  ).length;
  const tasks = state.tasks.filter((task) => !task.archived);
  const day = state.days[date] ?? emptyDay();
  const remaining = tasks.filter(
    (task) => !day.completed.includes(task.id),
  ).length;
  const isNew =
    !answered &&
    !planFields &&
    !state.tasks.length &&
    !state.steps.length &&
    !state.reflections.length;
  let next: { label: string; reason: string; action: GuideAction };
  switch (view) {
    case "today":
      next = isNew
        ? {
            label: "Begin your one-day reset",
            reason:
              "Start by exploring what you would like to change. You do not need a finished goal.",
            action: "reset",
          }
        : !planFields
          ? {
              label: "Shape my direction",
              reason:
                "You have started exploring. Bring what matters to you into an editable plan.",
              action: "draft",
            }
          : !tasks.length
            ? {
                label: "Choose a daily action",
                reason:
                  "Your plan is taking shape. Pick one small action that supports it.",
                action: "task",
              }
            : remaining
              ? {
                  label: "See today’s actions",
                  reason: `${remaining} ${remaining === 1 ? "action is" : "actions are"} still open today. Choose the one you want to begin with.`,
                  action: "tasks",
                }
              : {
                  label: "Reflect on today",
                  reason:
                    "You have checked off your current actions. Notice what helped before deciding what comes next.",
                  action: "checkin",
                };
      break;
    case "reset":
      next =
        answered === prompts.length
          ? {
              label: "Review my direction",
              reason:
                "Your answers are saved. Review a plan draft using your own words.",
              action: "draft",
            }
          : {
              label: "Go to reflection questions",
              reason: answered
                ? `${answered} of ${prompts.length} answers saved. Continue where you wish; every question is optional.`
                : "Start with the morning questions below. The phase names suggest an order, not a deadline.",
              action: "questions",
            };
      break;
    case "direction":
      next =
        !state.plan.vision.trim() || !state.plan.month.trim()
          ? {
              label: "Shape my plan",
              reason:
                "Give your direction a simple starting point: a desired future and one monthly project.",
              action: "plan",
            }
          : !state.steps.length
            ? {
                label: "Break down my project",
                reason:
                  "Add one concrete project step below. Project steps are separate from recurring daily actions.",
                action: "project",
              }
            : {
                label: "Choose a daily action",
                reason:
                  "Choose a small action you can repeat in support of your direction.",
                action: "task",
              };
      break;
    case "journal":
      next = {
        label: "Capture one thing I noticed",
        reason: state.reflections.length
          ? "Look back at an earlier note, then record what you would keep or adjust."
          : "Your first note can be one sentence. You do not need to summarize your whole day.",
        action: "checkin",
      };
      break;
    case "assistant":
      next = {
        label: "Explore the optional AI guide",
        reason:
          "Connect your provider below if you want assistance, then review what you are sharing before requesting analysis.",
        action: "assistant",
      };
      break;
    case "settings":
      next = {
        label: "Download my backup",
        reason: "Keep a portable copy of the work you have saved so far.",
        action: "backup",
      };
  }
  return {
    ...explanations[view],
    next,
    isNew,
    statuses: [
      `${answered} ${answered === 1 ? "answer" : "answers"} saved`,
      `${planFields} of 6 fields filled`,
      `${tasks.length} daily ${tasks.length === 1 ? "action" : "actions"}`,
      `${state.reflections.length} ${state.reflections.length === 1 ? "note" : "notes"} saved`,
    ],
  };
}
