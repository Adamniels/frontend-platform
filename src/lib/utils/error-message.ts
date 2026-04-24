import { isApiError } from "@/lib/api/errors";

/** Human-readable message for unknown errors (client or server). */
export function formatLoadError(error: unknown): string {
  if (isApiError(error)) return error.message;
  if (error instanceof Error) return error.message;
  return "Something went wrong.";
}
