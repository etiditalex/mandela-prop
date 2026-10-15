import { getSupabaseEnv } from "./env";

type StoredSession = {
  accessToken: string;
  userId: string | null;
  expiresAt: number | null;
};

function storageKey() {
  const { url } = getSupabaseEnv();
  if (!url) return null;
  const ref = new URL(url).hostname.split(".")[0];
  return `sb-${ref}-auth-token`;
}

function readCookie(name: string) {
  if (typeof document === "undefined") return null;
  const parts = document.cookie.split(";").map((part) => part.trim());
  for (const part of parts) {
    const eq = part.indexOf("=");
    if (eq === -1) continue;
    if (part.slice(0, eq) !== name) continue;
    const raw = part.slice(eq + 1);
    try {
      return decodeURIComponent(raw);
    } catch {
      return raw;
    }
  }
  return null;
}

function decodeBase64Url(value: string) {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const pad = padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4));
  const binary = atob(padded + pad);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function jwtPayload(token: string): { sub?: string; exp?: number } | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    return JSON.parse(decodeBase64Url(payload)) as { sub?: string; exp?: number };
  } catch {
    return null;
  }
}

function readStoredJson() {
  const key = storageKey();
  if (!key) return null;

  const single = readCookie(key);
  if (single) return single;

  const chunks: string[] = [];
  for (let index = 0; index < 10; index += 1) {
    const chunk = readCookie(`${key}.${index}`);
    if (!chunk) break;
    chunks.push(chunk);
  }
  return chunks.length > 0 ? chunks.join("") : null;
}

export function readBrowserSession(): StoredSession | null {
  const stored = readStoredJson();
  if (!stored) return null;

  try {
    const decoded = stored.startsWith("base64-") ? decodeBase64Url(stored.slice("base64-".length)) : stored;
    const session = JSON.parse(decoded) as {
      access_token?: string;
      expires_at?: number;
      user?: { id?: string };
    };
    if (!session.access_token) return null;
    const claims = jwtPayload(session.access_token);
    const expiresAt = session.expires_at ?? claims?.exp ?? null;
    if (expiresAt && expiresAt * 1000 <= Date.now() + 15_000) return null;
    return {
      accessToken: session.access_token,
      userId: session.user?.id ?? claims?.sub ?? null,
      expiresAt,
    };
  } catch {
    return null;
  }
}
