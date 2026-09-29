import { NextRequest, NextResponse } from "next/server";
import { AI_COOKIE, sameOrigin, unseal } from "@/lib/ai-server";
import { MSQ_CATALOG } from "@/lib/questionnaire";
import {
  buildFrameworkSystemPrompt,
  generateOfflineFallbackQuestion,
  type CycleType,
  type QuestionPhase,
} from "@/lib/ai-question-engine";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

function parsePayload(raw: string) {
  const cleaned = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  try {
    const parsed = JSON.parse(cleaned);
    if (parsed && typeof parsed === "object") {
      return parsed;
    }
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start >= 0 && end > start) {
      try {
        const sliced = JSON.parse(cleaned.slice(start, end + 1));
        if (sliced && typeof sliced === "object") {
          return sliced;
        }
      } catch {
        // Fallback
      }
    }
  }
  return null;
}

export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  const session = unseal(request.cookies.get(AI_COOKIE)?.value);
  if (!session) {
    return NextResponse.json(
      { error: "Connect an AI provider before requesting generated options." },
      { status: 401 },
    );
  }

  let body: {
    promptId?: string;
    cycle?: CycleType;
    phase?: QuestionPhase;
    profile?: Record<string, unknown>;
    plan?: Record<string, string>;
    locale?: "en" | "ar";
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request payload." }, { status: 400 });
  }

  const promptId = typeof body.promptId === "string" ? body.promptId : "m1";
  const def = MSQ_CATALOG[promptId];
  const cycle: CycleType = body.cycle || "daily";
  const phase: QuestionPhase = body.phase || "multi_cycle_review";
  const profile = (body.profile || {}) as Record<string, unknown>;
  const plan = (body.plan || {}) as Record<string, string>;
  const locale = body.locale === "ar" ? "ar" : "en";

  const fallbackResult = generateOfflineFallbackQuestion({
    cycle,
    phase,
    promptId,
    promptTitle: def?.title,
    promptSubtitle: def?.subtitle,
    profile,
    plan,
    locale,
  });

  const promptTitle = def ? def.title : fallbackResult.title;
  const promptSubtitle = def ? def.subtitle : fallbackResult.subtitle;

  const systemPrompt = buildFrameworkSystemPrompt({
    cycle,
    phase,
    promptId,
    promptTitle,
    promptSubtitle,
    profile,
    plan,
    locale,
  });

  const userInstruction = `Generate sharp, authentic options for this question now:\nTitle: "${promptTitle}"\nSubtitle: "${promptSubtitle}"`;

  try {
    const isResponses = session.provider === "openai" && !session.baseUrl.includes("/chat/completions");
    let parsedData: Record<string, unknown> | null = null;

    if (isResponses) {
      const response = await fetch(`${session.baseUrl}/responses`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: session.model,
          input: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userInstruction },
          ],
          store: false,
        }),
        signal: AbortSignal.timeout(20000),
      });

      if (!response.ok) {
        throw new Error(`OpenAI responded with status ${response.status}`);
      }
      const data = (await response.json()) as Record<string, unknown>;
      parsedData = parsePayload(outputText(data));
    } else {
      const base = session.baseUrl.replace(/\/+$/, "");
      const chatUrl = base.endsWith("/chat/completions") ? base : `${base}/chat/completions`;
      const response = await fetch(chatUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: session.model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userInstruction },
          ],
          temperature: 0.7,
        }),
        signal: AbortSignal.timeout(20000),
      });

      if (!response.ok) {
        throw new Error(`AI provider responded with status ${response.status}`);
      }
      const data = (await response.json()) as Record<string, unknown>;
      parsedData = parsePayload(chatText(data));
    }

    if (parsedData && Array.isArray(parsedData.options) && parsedData.options.length > 0) {
      return NextResponse.json({
        title: typeof parsedData.title === "string" ? parsedData.title : promptTitle,
        subtitle: typeof parsedData.subtitle === "string" ? parsedData.subtitle : promptSubtitle,
        frameworks: Array.isArray(parsedData.frameworks) ? parsedData.frameworks : fallbackResult.frameworks,
        options: parsedData.options,
        cycle,
        phase,
      });
    }

    // Curated MSQ or offline fallback
    return NextResponse.json({
      title: promptTitle,
      subtitle: promptSubtitle,
      options: def?.options || fallbackResult.options,
      frameworks: fallbackResult.frameworks,
      cycle,
      phase,
    });
  } catch (err) {
    console.error("AI questions generation error:", err);
    return NextResponse.json({
      title: promptTitle,
      subtitle: promptSubtitle,
      options: def?.options || fallbackResult.options,
      frameworks: fallbackResult.frameworks,
      cycle,
      phase,
      fallback: true,
    });
  }
}
