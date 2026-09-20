import { NextRequest, NextResponse } from "next/server";
import { AI_COOKIE, sameOrigin, unseal } from "@/lib/ai-server";
import { MSQ_CATALOG } from "@/lib/questionnaire";

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

function parseOptions(raw: string) {
  const cleaned = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  try {
    const parsed = JSON.parse(cleaned);
    if (Array.isArray(parsed.options) && parsed.options.length > 0) {
      return parsed.options;
    }
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start >= 0 && end > start) {
      try {
        const sliced = JSON.parse(cleaned.slice(start, end + 1));
        if (Array.isArray(sliced.options) && sliced.options.length > 0) {
          return sliced.options;
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
    profile?: Record<string, unknown>;
    plan?: Record<string, string>;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request payload." }, { status: 400 });
  }

  const promptId = typeof body.promptId === "string" ? body.promptId : "m1";
  const def = MSQ_CATALOG[promptId];
  if (!def) {
    return NextResponse.json({ error: "Unknown prompt identifier." }, { status: 400 });
  }

  const profile = body.profile || {};
  const plan = body.plan || {};

  const systemPrompt = `You are a high-performance personal development mentor combining Dan Koe's philosophy (Identity, Anti-Vision, Vision, Levers, Constraints) with clinical behavioral frameworks (Hartman Color Code, Hawkins Map of Consciousness, Birkman Method, DISC).
Generate 3 or 4 tailored, insightful multiple-choice options for the following reflection question:
Title: "${def.title}"
Subtitle: "${def.subtitle}"

User Context:
- Core Motive: ${profile.coreMotive || "Autonomous"}
- DISC Pace: ${profile.discStyle || "Decisive"}
- Primary Need: ${profile.primaryNeed || "Freedom"}
- Stress Trigger: ${profile.stressTrigger || "Chaos"}
- Consciousness Target: ${profile.consciousnessLevel || 280}+
- Active Anti-Vision: ${plan.antiVision || "None yet"}
- Active Vision: ${plan.vision || "None yet"}

Output valid JSON ONLY in this format:
{
  "options": [
    {
      "id": "ai_opt_1",
      "label": "Concise, punchy action/reflection statement",
      "subtext": "Brief nuance or underlying insight"
    }
  ]
}`;

  try {
    const isResponses = session.provider === "openai" && !session.baseUrl.includes("/chat/completions");
    let generatedOptions: unknown = null;

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
            { role: "user", content: "Generate 4 options now." },
          ],
          store: false,
        }),
        signal: AbortSignal.timeout(20000),
      });

      if (!response.ok) {
        throw new Error(`OpenAI responded with status ${response.status}`);
      }
      const data = (await response.json()) as Record<string, unknown>;
      generatedOptions = parseOptions(outputText(data));
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
            { role: "user", content: "Generate 4 options now." },
          ],
          temperature: 0.7,
        }),
        signal: AbortSignal.timeout(20000),
      });

      if (!response.ok) {
        throw new Error(`AI provider responded with status ${response.status}`);
      }
      const data = (await response.json()) as Record<string, unknown>;
      generatedOptions = parseOptions(chatText(data));
    }

    if (Array.isArray(generatedOptions) && generatedOptions.length > 0) {
      return NextResponse.json({ options: generatedOptions });
    }

    return NextResponse.json({ options: def.options });
  } catch (err) {
    console.error("AI questions generation error:", err);
    // Fall back smoothly to default curated options
    return NextResponse.json({ options: def.options, fallback: true });
  }
}
