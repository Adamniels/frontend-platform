import { ApiError, normalizeFetchError } from "./errors";
import { getIncomingRequestCookieHeader } from "@/lib/api/forward-request-cookies";
import { getPublicApiBaseUrl } from "@/lib/utils/env";
import { emitUnauthorizedAccess } from "@/lib/auth/access-events";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type RequestOptions = {
  method?: HttpMethod;
  headers?: Record<string, string>;
  body?: unknown;
  signal?: AbortSignal;
  /** If set, prepended to path (no trailing slash on base). */
  baseUrl?: string;
  /** Optional bearer token for backend calls. */
  accessToken?: string | null;
  /** Defaults to include so session cookies are sent for backend calls. */
  credentials?: RequestCredentials;
  /**
   * Fetch cache mode. Defaults to `no-store` unless `next` is set (server revalidation).
   * Adapters used from Next.js Server Components may pass `next` for ISR-style caching.
   */
  cache?: RequestCache;
  /** Next.js extended fetch options (server Components / Route Handlers). */
  next?: { revalidate?: number; tags?: string[] };
};

async function parseJsonSafe(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

/**
 * Typed JSON fetch against the platform API base URL.
 * All product HTTP calls should go through this helper or thin wrappers.
 */
export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const base = options.baseUrl ?? getPublicApiBaseUrl();
  const url = `${base}${path.startsWith("/") ? path : `/${path}`}`;
  const headerMap: Record<string, string> = {
    Accept: "application/json",
    ...options.headers,
  };

  if (options.accessToken) {
    headerMap.Authorization = `Bearer ${options.accessToken}`;
  }

  const forwardedCookie = await getIncomingRequestCookieHeader();
  if (forwardedCookie && !headerMap.Cookie) {
    headerMap.Cookie = forwardedCookie;
  }

  /** Session-bound requests must not share one URL-keyed ISR entry across users. */
  const hasSessionCookie = Boolean(forwardedCookie || headerMap.Cookie);
  const nextOptions = hasSessionCookie ? undefined : options.next;
  const cacheMode = hasSessionCookie ? "no-store" : options.cache ?? "no-store";

  let body: string | undefined;
  if (options.body !== undefined) {
    headerMap["Content-Type"] = "application/json";
    body = JSON.stringify(options.body);
  }

  const fetchInit: RequestInit & { next?: { revalidate?: number; tags?: string[] } } = {
    method: options.method ?? "GET",
    headers: headerMap,
    body,
    signal: options.signal,
    credentials: options.credentials ?? "include",
  };

  if (nextOptions) {
    fetchInit.next = nextOptions;
  } else {
    fetchInit.cache = cacheMode;
  }

  const response = await fetch(url, fetchInit);

  const payload = await parseJsonSafe(response);

  if (!response.ok) {
    if (response.status === 401) {
      emitUnauthorizedAccess();
    }
    throw normalizeFetchError(
      response.status,
      payload,
      `Request failed with status ${response.status}`,
    );
  }

  return payload as T;
}

export function assertOk<T>(data: T | null | undefined, message: string): T {
  if (data === null || data === undefined) {
    throw new ApiError(message, { status: 500 });
  }
  return data;
}
