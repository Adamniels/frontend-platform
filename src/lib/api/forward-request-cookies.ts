/**
 * When `apiRequest` runs on the Next.js server (RSC, route handlers, server actions),
 * `credentials: "include"` does not attach the **browser's** cookies to a cross-origin API
 * call. Forward the incoming request's `Cookie` header so the backend sees the same
 * session as the client would.
 */
export async function getIncomingRequestCookieHeader(): Promise<string | undefined> {
  if (typeof window !== "undefined") return undefined;
  try {
    const { headers } = await import("next/headers");
    const h = await headers();
    return h.get("cookie") ?? undefined;
  } catch {
    return undefined;
  }
}
