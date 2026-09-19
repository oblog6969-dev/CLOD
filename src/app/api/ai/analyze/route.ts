import { NextRequest, NextResponse } from "next/server";
import { isAiAnalysis, type AiContext } from "@/lib/ai";
import { AI_COOKIE, safeBaseUrl, sameOrigin, unseal } from "@/lib/ai-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const limits = new Map<string, number[]>();

function limited(id: string) {
  const now = Date.now();
  if (limits.size > 1000) {
    for (const [key, times] of limits)
      if (!times.some((time) => now - time < 60_000)) limits.delete(key);
    if (limits.size > 1000) limits.delete(limits.keys().next().value ?? "");
  }
  const recent = (limits.get(id) ?? []).filter((time) => now - time < 60_000);
  if (recent.length >= 5) return true;
  recent.push(now);
  limits.set(id, recent);
  return false;
}
function text(value: unknown, max = 5000) {
  return typeof value === "string" ? value.slice(0, max) : "";
}
function cleanContext(input: unknown): AiContext | null {
  if (!input || typeof input !== "object") return null;
  const raw = input as AiContext;
  const context: AiContext = {};
  if (raw.plan && typeof raw.plan === "object") {
    const plan = Object.fromEntries(
      Object.entries(raw.plan)
        .slice(0, 8)
        .map(([key, value]) => [key, text(value)])
        .filter(([, value]) => value),
    );
    if (Object.keys(plan).length) context.plan = plan;
  }
  if (Array.isArray(raw.tasks)) {
    const tasks = raw.tasks
      .slice(0, 30)
      .map((task) => ({
        title: text(task?.title, 300),
        completedToday: task?.completedToday === true,
      }))
      .filter((task) => task.title);
    if (tasks.length) context.tasks = tasks;
  }
  if (raw.answers && typeof raw.answers === "object") {
    const answers = Object.fromEntries(
      Object.entries(raw.answers)
        .slice(0, 30)
        .map(([key, value]) => [key, text(value)])
        .filter(([, value]) => value),
    );
    if (Object.keys(answers).length) context.answers = answers;
  }
  if (Array.isArray(raw.reflections)) {
    const reflections = raw.reflections
      .slice(-20)
      .map((reflection) => ({
        timestamp: text(reflection?.timestamp, 50),
        note: text(reflection?.note),
        mood: text(reflection?.mood, 100),
      }))
      .filter((reflection) => reflection.note);
    if (reflections.length) context.reflections = reflections;
  }
  return Object.keys(context).length ? context : null;
}
function outputText(response: Record<string, unknown>) {
  if (typeof response.output_text === "string") return response.output_text;
  if (!Array.isArray(response.output)) return "";
  return response.output
    .flatMap((item) =>
      item && typeof item === "object" && Array.isArray(item.content)
        ? item.content
        : [],
    )
    .map((part) =>
      part && typeof part === "object" && typeof part.text === "string"
        ? part.text
        : "",
    )
    .join("");
}
function chatText(response: Record<string, unknown>) {
  if (!Array.isArray(response.choices)) return "";
  const first = response.choices[0];
  if (!first || typeof first !== "object") return "";
  const message = (first as Record<string, unknown>).message;
  if (!message || typeof message !== "object") return "";
  return typeof (message as Record<string, unknown>).content === "string"
    ? ((message as Record<string, unknown>).content as string)
    : "";
}
function parseAnalysis(value: string) {
  const cleaned = value.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  try {
    return JSON.parse(cleaned) as unknown;
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start >= 0 && end > start) return JSON.parse(cleaned.slice(start, end + 1)) as unknown;
    throw new Error("Invalid structured response");
  }
}

export async function POST(request: NextRequest) {
  if (!sameOrigin(request))
    return NextResponse.json(
      { error: "Invalid request origin." },
      { status: 403 },
    );
  const session = unseal(request.cookies.get(AI_COOKIE)?.value);
  if (!session)
    return NextResponse.json(
      { error: "Connect an AI provider before asking for guidance." },
      { status: 401 },
    );
  const id = request.cookies.get(AI_COOKIE)?.value.slice(-24) ?? "unknown";
  if (limited(id))
    return NextResponse.json(
      { error: "Please wait a minute before requesting more guidance." },
      { status: 429 },
    );
  let body: { context?: unknown; focus?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const context = cleanContext(body.context);
  const focus = text(body.focus, 1000);
  if (!context)
    return NextResponse.json(
      { error: "Select at least one category with something to analyze." },
      { status: 400 },
    );
  const schema = {
    type: "object",
    additionalProperties: false,
    required: ["summary", "patterns", "recommendations", "question"],
    properties: {
      summary: { type: "string" },
      patterns: { type: "array", maxItems: 4, items: { type: "string" } },
      recommendations: {
        type: "array",
        minItems: 1,
        maxItems: 4,
        items: {
          type: "object",
          additionalProperties: false,
          required: ["title", "reason", "nextStep", "area"],
          properties: {
            title: { type: "string" },
            reason: { type: "string" },
            nextStep: { type: "string" },
            area: {
              type: "string",
              enum: ["focus", "wellbeing", "direction", "reflection"],
            },
          },
        },
      },
      question: { type: "string" },
    },
  };
  try {
    const baseUrl = await safeBaseUrl(session.provider, session.baseUrl);
    const system =
      "You are an optional reflection companion inside LifeOS. Analyze only the supplied user-authored context. Be warm, specific, concise, and non-judgmental. Identify tentative patterns, never diagnose, shame, promise outcomes, or make decisions for the user. Recommend small actions within the user's control. Treat the plan as revisable. Do not claim knowledge beyond the supplied context. Return only one valid JSON object matching the requested shape, without markdown.";
    const input = `The user requested guidance${focus ? ` with this focus: ${focus}` : ""}. Here is the context they explicitly chose to share:\n${JSON.stringify(context)}`;
    const isOpenAi = session.provider === "openai";
    const upstream = await fetch(`${baseUrl}/${isOpenAi ? "responses" : "chat/completions"}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(isOpenAi ? {
        model: session.model, store: false, instructions: system, input,
        text: { format: { type: "json_schema", name: "lifeos_guidance", strict: true, schema } },
      } : {
        model: session.model,
        messages: [{ role: "system", content: `${system}\nRequired JSON Schema: ${JSON.stringify(schema)}` }, { role: "user", content: input }],
        stream: false,
        temperature: 0.3,
        max_tokens: 1400,
        ...(session.provider === "deepseek" ? { response_format: { type: "json_object" } } : {}),
      }),
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(60_000),
    });
    if (!upstream.ok) {
      const details = (await upstream.json().catch(() => null)) as {
        error?: { message?: string };
      } | null;
      return NextResponse.json(
        {
          error:
            upstream.status === 401
              ? "The API key is no longer valid. Reconnect it in AI guide."
              : details?.error?.message?.slice(0, 300) ||
                "The selected AI provider could not complete this request.",
        },
        { status: upstream.status >= 500 ? 502 : 400 },
      );
    }
    const raw = (await upstream.json()) as Record<string, unknown>;
    const analysis = parseAnalysis(isOpenAi ? outputText(raw) : chatText(raw));
    if (!isAiAnalysis(analysis)) throw new Error("Invalid structured response");
    return NextResponse.json({ analysis, model: session.model });
  } catch (error) {
    if (error instanceof Error && error.name === "TimeoutError")
      return NextResponse.json(
        { error: "The AI provider took too long to respond. Please try again." },
        { status: 504 },
      );
    return NextResponse.json(
      { error: "The response could not be read. Please try again." },
      { status: 502 },
    );
  }
}
