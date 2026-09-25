import type { Plan } from "./domain";

export type PlanFieldStatus = "empty" | "unchanged" | "updated" | "new";

export function planFieldStatus(
  saved: string,
  draft: string,
): PlanFieldStatus {
  const s = saved.trim();
  const d = draft.trim();
  if (!d) return "empty";
  if (!s) return "new";
  if (s === d) return "unchanged";
  return "updated";
}

export function summarizePlanDraft(
  saved: Plan,
  draft: Plan,
): Record<keyof Plan, PlanFieldStatus> {
  const keys = Object.keys(saved) as (keyof Plan)[];
  return Object.fromEntries(
    keys.map((key) => [key, planFieldStatus(saved[key], draft[key])]),
  ) as Record<keyof Plan, PlanFieldStatus>;
}
