import { NextRequest, NextResponse } from "next/server";
import { type AiChatMessage, type AiContext } from "@/lib/ai";
import { AI_COOKIE, safeBaseUrl, sameOrigin, unseal } from "@/lib/ai-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const limits = new Map<string, number[]>();

function limited(id: string) {
  const now = Date.now();
  const recent = (limits.get(id) ?? []).filter((time) => now - time < 60_000);
  if (recent.length >= 10) return true;
  recent.push(now);
  limits.set(id, recent);
  return false;
}

function text(value: unknown, max = 2000) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function cleanMessages(value: unknown): AiChatMessage[] | null {
  if (!Array.isArray(value) || !value.length || value.length > 12) return null;
  const messages = value
    .map((message) => {
      if (!message || typeof message !== "object") return null;
      const raw = message as Record<string, unknown>;
      const content = text(raw.content);
      return (raw.role === "user" || raw.role === "assistant") && content
        ? { role: raw.role, content }
        : null;
    })
    .filter((message): message is AiChatMessage => !!message);
  return messages.length && messages.at(-1)?.role === "user" ? messages : null;
}

function cleanContext(value: unknown): AiContext | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as AiContext;
  const context: AiContext = {};
  if (raw.plan && typeof raw.plan === "object") {
    const plan = Object.fromEntries(
      Object.entries(raw.plan)
        .slice(0, 8)
        .map(([key, item]) => [key, text(item, 500)])
        .filter(([, item]) => item),
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
        .map(([key, item]) => [key, text(item, 500)])
        .filter(([, item]) => item),
    );
    if (Object.keys(answers).length) context.answers = answers;
  }
  if (Array.isArray(raw.reflections)) {
    const reflections = raw.reflections
      .slice(-20)
      .map((reflection) => ({
        timestamp: text(reflection?.timestamp, 50),
        note: text(reflection?.note, 1000),
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
  const first = Array.isArray(response.choices) ? response.choices[0] : null;
  const message = first && typeof first === "object"
    ? (first as Record<string, unknown>).message
    : null;
  return message && typeof message === "object" && typeof (message as Record<string, unknown>).content === "string"
    ? (message as Record<string, unknown>).content as string
    : "";
}

export async function POST(request: NextRequest) {
  if (!sameOrigin(request))
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  const session = unseal(request.cookies.get(AI_COOKIE)?.value);
  if (!session)
    return NextResponse.json(
      { error: "Connect an AI provider before starting a conversation." },
      { status: 401 },
    );
  const id = request.cookies.get(AI_COOKIE)?.value.slice(-24) ?? "unknown";
  if (limited(id))
    return NextResponse.json(
      { error: "Please wait a minute before sending more messages." },
      { status: 429 },
    );
  let body: { messages?: unknown; context?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const messages = cleanMessages(body.messages);
  if (!messages)
    return NextResponse.json(
      { error: "Enter a message to continue the conversation." },
      { status: 400 },
    );
  const context = cleanContext(body.context);
  const system = `You are an optional reflection companion inside LifeOS. Be warm, specific, concise, and non-judgmental. Help the user reflect on only the context they explicitly shared. Never diagnose, shame, promise outcomes, or make decisions for the user. Suggest small actions within the user's control. Do not claim knowledge beyond the conversation or supplied context.${context ? `\n\nThe user explicitly shared this LifeOS context for this conversation:\n${JSON.stringify(context)}` : ""}`;
  try {
    const baseUrl = await safeBaseUrl(session.provider, session.baseUrl);
    const isOpenAi = session.provider === "openai";
    const upstream = await fetch(
      `${baseUrl}/${isOpenAi ? "responses" : "chat/completions"}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          isOpenAi
            ? {
                model: session.model,
                store: false,
                instructions: system,
                input: messages,
              }
            : {
                model: session.model,
                messages: [{ role: "system", content: system }, ...messages],
                stream: false,
                temperature: 0.5,
                max_tokens: 900,
              },
        ),
        cache: "no-store",
        redirect: "error",
        signal: AbortSignal.timeout(60_000),
      },
    );
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
                "The selected AI provider could not continue this conversation.",
        },
        { status: upstream.status >= 500 ? 502 : 400 },
      );
    }
    const raw = (await upstream.json()) as Record<string, unknown>;
    const reply = (isOpenAi ? outputText(raw) : chatText(raw)).trim();
    if (!reply) throw new Error("Empty response");
    return NextResponse.json({ reply: reply.slice(0, 6000), model: session.model });
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
