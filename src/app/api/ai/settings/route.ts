import { NextRequest, NextResponse } from "next/server";
import { AI_PROVIDER_INFO, isAiModel, isAiProvider } from "@/lib/ai";
import {
  AI_COOKIE,
  sameOrigin,
  safeBaseUrl,
  seal,
  sessionCookie,
  unseal,
} from "@/lib/ai-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isSecure(request: NextRequest) {
  return (
    request.nextUrl.protocol === "https:" ||
    request.headers.get("x-forwarded-proto") === "https"
  );
}

export async function GET(request: NextRequest) {
  const session = unseal(request.cookies.get(AI_COOKIE)?.value);
  return NextResponse.json({
    connected: !!session,
    model: session?.model ?? null,
    provider: session?.provider ?? null,
  });
}
export async function POST(request: NextRequest) {
  if (!sameOrigin(request))
    return NextResponse.json(
      { error: "Invalid request origin." },
      { status: 403 },
    );
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const value = body as { apiKey?: unknown; model?: unknown; provider?: unknown; baseUrl?: unknown };
  if (
    typeof value.apiKey !== "string" ||
    value.apiKey.trim().length < 8 ||
    value.apiKey.length > 300 ||
    !isAiProvider(value.provider) ||
    !isAiModel(value.model)
  )
    return NextResponse.json(
      { error: "Enter a valid API key, provider, and model ID." },
      { status: 400 },
    );
  const provider = value.provider;
  const model = value.model.trim();
  const label = AI_PROVIDER_INFO[provider].label;
  try {
    const baseUrl = await safeBaseUrl(provider, value.baseUrl);
    const check = await fetch(`${baseUrl}/models`, {
      headers: { Authorization: `Bearer ${value.apiKey.trim()}` },
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(15000),
    });
    if (!check.ok) {
      const status = check.status === 401 ? 401 : 400;
      return NextResponse.json(
        {
          error:
            check.status === 401
              ? `${label} rejected this API key. Check the key and try again.`
              : `${label} could not validate this connection (HTTP ${check.status}). Check the base URL and account access.`,
        },
        { status },
      );
    }
    const response = NextResponse.json({ connected: true, model, provider });
    response.cookies.set(
      sessionCookie(
        seal({ key: value.apiKey.trim(), model, provider, baseUrl }),
        isSecure(request),
      ),
    );
    return response;
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : `Could not reach ${label}. Check your connection and try again.` },
      { status: 502 },
    );
  }
}
export async function DELETE(request: NextRequest) {
  if (!sameOrigin(request))
    return NextResponse.json(
      { error: "Invalid request origin." },
      { status: 403 },
    );
  const response = NextResponse.json({ connected: false });
  response.cookies.set({ ...sessionCookie("", isSecure(request)), maxAge: 0 });
  return response;
}
