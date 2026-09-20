export const AI_PROVIDERS = [
  "openai",
  "deepseek",
  "nvidia",
  "groq",
  "huggingface",
  "openrouter",
  "custom",
] as const;
export type AiProvider = (typeof AI_PROVIDERS)[number];
export const AI_PROVIDER_INFO: Record<
  AiProvider,
  {
    label: string;
    defaultModel: string;
    models: readonly string[];
    baseUrl: string;
    note?: string;
  }
> = {
  openai: {
    label: "OpenAI",
    defaultModel: "gpt-5-mini",
    models: ["gpt-5-mini", "gpt-5", "gpt-4.1-mini"],
    baseUrl: "https://api.openai.com/v1",
  },
  deepseek: {
    label: "DeepSeek",
    defaultModel: "deepseek-flash",
    models: ["deepseek-flash", "deepseek-v4-pro"],
    baseUrl: "https://api.deepseek.com",
  },
  nvidia: {
    label: "NVIDIA NIM",
    defaultModel: "openai/gpt-oss-120b",
    models: ["openai/gpt-oss-120b", "meta/llama-3.3-70b-instruct"],
    baseUrl: "https://integrate.api.nvidia.com/v1",
    note: "Developer credits and experimental models may be available.",
  },
  groq: {
    label: "Groq",
    defaultModel: "openai/gpt-oss-20b",
    models: ["openai/gpt-oss-20b", "openai/gpt-oss-120b", "qwen/qwen3.6-27b"],
    baseUrl: "https://api.groq.com/openai/v1",
    note: "Fast open-model inference; developer access and limits apply.",
  },
  huggingface: {
    label: "Hugging Face",
    defaultModel: "openai/gpt-oss-120b:fastest",
    models: [
      "openai/gpt-oss-120b:fastest",
      "openai/gpt-oss-120b:groq",
      "Qwen/Qwen3-235B-A22B:fastest",
    ],
    baseUrl: "https://router.huggingface.co/v1",
    note: "Inference Providers includes free-tier credits and many open models.",
  },
  openrouter: {
    label: "OpenRouter",
    defaultModel: "openrouter/free",
    models: ["openrouter/free", "nvidia/nemotron-3-ultra:free"],
    baseUrl: "https://openrouter.ai/api/v1",
    note: "Routes to free models when available; availability and limits can change.",
  },
  custom: {
    label: "OpenAI-compatible",
    defaultModel: "",
    models: [],
    baseUrl: "",
  },
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
export type AiChatMessage = {
  role: "user" | "assistant";
  content: string;
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
