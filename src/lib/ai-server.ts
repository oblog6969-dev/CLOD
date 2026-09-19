import "server-only";
import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "node:crypto";
import { lookup } from "node:dns/promises";
import { BlockList, isIP } from "node:net";
import { AI_PROVIDER_INFO, isAiModel, isAiProvider, type AiProvider } from "./ai";

export const AI_COOKIE = "lifeos_ai_session";
export type AiSession = {
  key: string;
  provider: AiProvider;
  model: string;
  baseUrl: string;
};

const blocked = new BlockList();
blocked.addSubnet("0.0.0.0", 8, "ipv4");
blocked.addSubnet("10.0.0.0", 8, "ipv4");
blocked.addSubnet("100.64.0.0", 10, "ipv4");
blocked.addSubnet("127.0.0.0", 8, "ipv4");
blocked.addSubnet("169.254.0.0", 16, "ipv4");
blocked.addSubnet("172.16.0.0", 12, "ipv4");
blocked.addSubnet("192.168.0.0", 16, "ipv4");
blocked.addSubnet("224.0.0.0", 4, "ipv4");
blocked.addSubnet("::", 128, "ipv6");
blocked.addSubnet("::1", 128, "ipv6");
blocked.addSubnet("fc00::", 7, "ipv6");
blocked.addSubnet("fe80::", 10, "ipv6");

const globalKey = globalThis as typeof globalThis & { lifeosSecret?: Buffer };
function encryptionKey() {
  const configured = process.env.LIFEOS_SESSION_SECRET;
  if (configured) return createHash("sha256").update(configured).digest();
  globalKey.lifeosSecret ??= randomBytes(32);
  return globalKey.lifeosSecret;
}
export function seal(session: AiSession) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify(session), "utf8"),
    cipher.final(),
  ]);
  return Buffer.concat([iv, cipher.getAuthTag(), encrypted]).toString(
    "base64url",
  );
}
export function unseal(value?: string): AiSession | null {
  if (!value) return null;
  try {
    const bytes = Buffer.from(value, "base64url");
    const decipher = createDecipheriv(
      "aes-256-gcm",
      encryptionKey(),
      bytes.subarray(0, 12),
    );
    decipher.setAuthTag(bytes.subarray(12, 28));
    const decoded = Buffer.concat([
      decipher.update(bytes.subarray(28)),
      decipher.final(),
    ]).toString("utf8");
    const raw = JSON.parse(decoded) as Partial<AiSession>;
    const provider = raw.provider ?? "openai";
    if (
      typeof raw.key !== "string" ||
      raw.key.length < 8 ||
      raw.key.length > 300 ||
      !isAiProvider(provider) ||
      !isAiModel(raw.model)
    )
      return null;
    return {
      key: raw.key,
      provider,
      model: raw.model.trim(),
      baseUrl: raw.baseUrl || AI_PROVIDER_INFO[provider].baseUrl,
    };
  } catch {
    return null;
  }
}

export async function safeBaseUrl(provider: AiProvider, value?: unknown) {
  if (provider !== "custom") return AI_PROVIDER_INFO[provider].baseUrl;
  if (typeof value !== "string") throw new Error("Enter an API base URL.");
  let url: URL;
  try {
    url = new URL(value.trim());
  } catch {
    throw new Error("Enter a valid API base URL.");
  }
  if (url.protocol !== "https:" || url.username || url.password || url.search || url.hash)
    throw new Error("Custom endpoints must be public HTTPS base URLs.");
  if (url.pathname === "/") url.pathname = "";
  const allowPrivate = process.env.LIFEOS_ALLOW_PRIVATE_AI_ENDPOINTS === "true";
  if (!allowPrivate) {
    const host = url.hostname.toLowerCase();
    if (host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local"))
      throw new Error("Private AI endpoints are disabled on this server.");
    const addresses = isIP(host)
      ? [{ address: host, family: isIP(host) }]
      : await lookup(host, { all: true, verbatim: true });
    if (!addresses.length || addresses.some(({ address, family }) => blocked.check(address, family === 6 ? "ipv6" : "ipv4")))
      throw new Error("Private AI endpoints are disabled on this server.");
  }
  return url.toString().replace(/\/$/, "");
}
export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).host === new URL(request.url).host;
  } catch {
    return false;
  }
}
export function sessionCookie(value: string, secure = false) {
  return {
    name: AI_COOKIE,
    value,
    httpOnly: true,
    sameSite: "strict" as const,
    secure,
    path: "/api/ai",
  };
}
