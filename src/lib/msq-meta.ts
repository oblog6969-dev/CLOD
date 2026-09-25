import type { Plan } from "./domain";

/** Dan Koe newsletter working reference — reflection prompt traceability. */
export const MSQ_SOURCE_REF =
  "https://letters.thedankoe.com/p/how-to-fix-your-entire-life-in-1";

export type MsqMeta = {
  /** Stable LifeOS prompt id (m1–m14, e1–e7). */
  id: string;
  /** Morning / evening / daytime check-in bucket. */
  phase: "morning" | "evening" | "daytime";
  /** Newsletter-aligned prompt ordinal label for audits. */
  sourceLabel: string;
  /** Plan fields this prompt may inform when synthesized. */
  planFields?: (keyof Plan)[];
};

export const MSQ_META: Record<string, MsqMeta> = {
  m1: { id: "m1", phase: "morning", sourceLabel: "Morning — quiet imbalance" },
  m2: { id: "m2", phase: "morning", sourceLabel: "Morning — recurring frustrations" },
  m3: { id: "m3", phase: "morning", sourceLabel: "Morning — choices reveal priorities" },
  m4: { id: "m4", phase: "morning", sourceLabel: "Morning — difficult acknowledgment" },
  m5: { id: "m5", phase: "morning", sourceLabel: "Morning — current path projection", planFields: ["antiVision"] },
  m6: { id: "m6", phase: "morning", sourceLabel: "Morning — decade cost", planFields: ["antiVision"] },
  m7: { id: "m7", phase: "morning", sourceLabel: "Morning — wished attempts", planFields: ["vision"] },
  m8: { id: "m8", phase: "morning", sourceLabel: "Morning — illustrative future", planFields: ["antiVision"] },
  m9: { id: "m9", phase: "morning", sourceLabel: "Morning — loosen old role", planFields: ["identity"] },
  m10: { id: "m10", phase: "morning", sourceLabel: "Morning — avoided reason" },
  m11: { id: "m11", phase: "morning", sourceLabel: "Morning — pattern protection" },
  m12: { id: "m12", phase: "morning", sourceLabel: "Morning — fulfilling ordinary day", planFields: ["vision"] },
  m13: { id: "m13", phase: "morning", sourceLabel: "Morning — practice becoming", planFields: ["identity"] },
  m14: { id: "m14", phase: "morning", sourceLabel: "Morning — small experiment", planFields: ["month"] },
  e1: { id: "e1", phase: "evening", sourceLabel: "Evening — today’s understanding" },
  e2: { id: "e2", phase: "evening", sourceLabel: "Evening — pattern attention" },
  e3: { id: "e3", phase: "evening", sourceLabel: "Evening — leave behind", planFields: ["antiVision"] },
  e4: { id: "e4", phase: "evening", sourceLabel: "Evening — explore direction", planFields: ["vision"] },
  e5: { id: "e5", phase: "evening", sourceLabel: "Evening — year progress", planFields: ["year"] },
  e6: { id: "e6", phase: "evening", sourceLabel: "Evening — month project", planFields: ["month"] },
  e7: { id: "e7", phase: "evening", sourceLabel: "Evening — tomorrow actions", planFields: ["constraints"] },
};

export function msqMetaFor(promptId: string): MsqMeta | null {
  return MSQ_META[promptId] ?? null;
}
