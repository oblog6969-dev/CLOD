import { NextRequest, NextResponse } from "next/server";
import { sameOrigin } from "@/lib/ai-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const supportedLanguages = new Set([
  "ar",
  "de",
  "en",
  "es",
  "fr",
  "hi",
  "id",
  "it",
  "ja",
  "ko",
  "pt",
  "tr",
  "ur",
  "zh-CN",
]);
const requests = new Map<string, number[]>();

function limited(id: string) {
  const now = Date.now();
  if (requests.size > 1000) {
    for (const [key, times] of requests)
      if (!times.some((time) => now - time < 60_000)) requests.delete(key);
    if (requests.size > 1000) requests.delete(requests.keys().next().value ?? "");
  }
  const recent = (requests.get(id) ?? []).filter((time) => now - time < 60_000);
  if (recent.length >= 10) return true;
  recent.push(now);
  requests.set(id, recent);
  return false;
}

function decodeHtml(value: string) {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

export async function POST(request: NextRequest) {
  if (!sameOrigin(request))
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
  if (!apiKey)
    return NextResponse.json(
      {
        error:
          "Google Translate is not configured. Add GOOGLE_TRANSLATE_API_KEY on the LifeOS server.",
      },
      { status: 503 },
    );
  const id = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (limited(id))
    return NextResponse.json(
      { error: "Please wait a minute before translating more text." },
      { status: 429 },
    );
  let body: { text?: unknown; target?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const text = typeof body.text === "string" ? body.text.trim() : "";
  if (!text || text.length > 5_000 || typeof body.target !== "string" || !supportedLanguages.has(body.target))
    return NextResponse.json(
      { error: "Enter up to 5,000 characters and choose a supported language." },
      { status: 400 },
    );
  try {
    const endpoint = new URL("https://translation.googleapis.com/language/translate/v2");
    endpoint.searchParams.set("key", apiKey);
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ q: text, target: body.target, format: "text" }),
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(30_000),
    });
    const result = (await response.json().catch(() => null)) as {
      data?: { translations?: { translatedText?: string; detectedSourceLanguage?: string }[] };
      error?: { message?: string };
    } | null;
    if (!response.ok)
      return NextResponse.json(
        {
          error:
            result?.error?.message?.slice(0, 300) ||
            "Google Translate could not complete this request.",
        },
        { status: response.status >= 500 ? 502 : 400 },
      );
    const translation = result?.data?.translations?.[0];
    if (!translation?.translatedText)
      throw new Error("Missing translation");
    return NextResponse.json({
      translation: decodeHtml(translation.translatedText),
      detectedSourceLanguage: translation.detectedSourceLanguage ?? null,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "TimeoutError")
      return NextResponse.json(
        { error: "Google Translate took too long to respond. Please try again." },
        { status: 504 },
      );
    return NextResponse.json(
      { error: "Google Translate could not be reached. Please try again." },
      { status: 502 },
    );
  }
}
