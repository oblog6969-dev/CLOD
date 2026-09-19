export const AI_PROVIDERS = ["openai", "deepseek", "nvidia", "custom"] as const;
export type AiProvider = (typeof AI_PROVIDERS)[number];
export const AI_PROVIDER_INFO: Record<
  AiProvider,
  { label: string; defaultModel: string; models: readonly string[]; baseUrl: string }
> = {
  openai: { label: "OpenAI", defaultModel: "gpt-5-mini", models: ["gpt-5-mini", "gpt-5", "gpt-4.1-mini"], baseUrl: "https://api.openai.com/v1" },
  deepseek: { label: "DeepSeek", defaultModel: "deepseek-flash", models: ["deepseek-flash", "deepseek-v4-pro"], baseUrl: "https://api.deepseek.com" },
  nvidia: { label: "NVIDIA NIM", defaultModel: "openai/gpt-oss-120b", models: ["openai/gpt-oss-120b", "meta/llama-3.3-70b-instruct"], baseUrl: "https://integrate.api.nvidia.com/v1" },
  custom: { label: "OpenAI-compatible", defaultModel: "", models: [], baseUrl: "" },
};
export type AiContext = {
  plan?: Record<string, string>;
  tasks?: { title: string; completedToday: boolean }[];
  answers?: Record<string, string>;
  reflections?: { timestamp: string; note: string; mood: string }[];
};
export type AiRecommendation = {
  title: string;
  reason: string;
  nextStep: string;
  area: "focus" | "wellbeing" | "direction" | "reflection";
};
export type AiAnalysis = {
  summary: string;
  patterns: string[];
  recommendations: AiRecommendation[];
  question: string;
};
export function isAiProvider(value: unknown): value is AiProvider {
  return typeof value === "string" && AI_PROVIDERS.includes(value as AiProvider);
}
export function isAiModel(value: unknown): value is string {
  return typeof value === "string" && value.trim().length >= 2 && value.trim().length <= 150 && /^[a-zA-Z0-9._:/-]+$/.test(value.trim());
}
export function isAiAnalysis(value: unknown): value is AiAnalysis {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.summary === "string" &&
    typeof v.question === "string" &&
    Array.isArray(v.patterns) &&
    v.patterns.every((item) => typeof item === "string") &&
    Array.isArray(v.recommendations) &&
    v.recommendations.every((item) => {
      if (!item || typeof item !== "object") return false;
      const r = item as Record<string, unknown>;
      return (
        typeof r.title === "string" &&
        typeof r.reason === "string" &&
        typeof r.nextStep === "string" &&
        ["focus", "wellbeing", "direction", "reflection"].includes(
          String(r.area),
        )
      );
    })
  );
}
