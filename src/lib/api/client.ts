import { ApiError, normalizeFetchError } from "./errors";
import { getPublicApiBaseUrl } from "@/lib/utils/env";

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
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...options.headers,
  };

  if (options.accessToken) {
    headers.Authorization = `Bearer ${options.accessToken}`;
  }

  let body: string | undefined;
  if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(options.body);
  }

  const response = await fetch(url, {
    method: options.method ?? "GET",
    headers,
    body,
    signal: options.signal,
    cache: "no-store",
  });

  const payload = await parseJsonSafe(response);

  if (!response.ok) {
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
