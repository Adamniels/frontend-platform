import type { SavedItemSummary } from "@/types/content";
import { apiRequest } from "@/lib/api/client";

const readCache = { next: { revalidate: 30 } as const };

export async function fetchSavedItems(): Promise<SavedItemSummary[]> {
  return apiRequest<SavedItemSummary[]>("/api/v1/saved-items", readCache);
}
