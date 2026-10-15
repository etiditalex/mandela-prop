import { readBrowserSession } from "./browserSession";
import { getSupabaseEnv } from "./env";

type RestError = { message: string };

const SIGN_IN_MESSAGE = "Your sign-in expired. Sign in again, then save the video.";

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, timeoutMessage: string) {
  let timeoutHandle: ReturnType<typeof setTimeout> | null = null;
  const timeoutPromise = new Promise<T>((_, reject) => {
    timeoutHandle = setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]).finally(() => {
    if (timeoutHandle) clearTimeout(timeoutHandle);
  });
}

export function browserUserId() {
  return readBrowserSession()?.userId ?? null;
}

export async function podcastRequest<T>(
  method: "GET" | "POST" | "PATCH" | "DELETE",
  search: string,
  body?: unknown,
  timeoutMessage = "Saving is taking too long. Refresh the page — the video may already be saved.",
) {
  const { url, anonKey, configured } = getSupabaseEnv();
  const session = readBrowserSession();
  if (!configured || !url || !anonKey) {
    return { data: null as T | null, error: { message: "Supabase env vars are missing" } satisfies RestError };
  }
  if (!session) {
    return { data: null as T | null, error: { message: SIGN_IN_MESSAGE } satisfies RestError };
  }

  try {
    const response = await withTimeout(
      fetch(`${url}/rest/v1/podcast_videos?${search}`, {
        method,
        headers: {
          apikey: anonKey,
          Authorization: `Bearer ${session.accessToken}`,
          Accept: "application/json",
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
        body: body === undefined ? undefined : JSON.stringify(body),
      }),
      15000,
      timeoutMessage,
    );

    const text = await response.text();
    const parsed = text ? (JSON.parse(text) as T | { message?: string }) : null;
    if (!response.ok) {
      const message =
        response.status === 401
          ? SIGN_IN_MESSAGE
          : parsed && typeof parsed === "object" && "message" in parsed && parsed.message
            ? parsed.message
            : "Unable to save the video.";
      return { data: null as T | null, error: { message } satisfies RestError };
    }

    return { data: parsed as T | null, error: null };
  } catch (error) {
    return {
      data: null as T | null,
      error: { message: error instanceof Error ? error.message : "Unable to save the video." } satisfies RestError,
    };
  }
}
