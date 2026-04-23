/**
 * Public env vars only (NEXT_PUBLIC_*). Server and client safe for inlined values.
 */
export function getPublicApiBaseUrl(): string {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
  return base.replace(/\/$/, "");
}
