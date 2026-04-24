import type { NewsItemSummary } from "@/types/content";
import { apiRequest } from "@/lib/api/client";

const readCache = { next: { revalidate: 30 } as const };

export async function fetchNewsFeed(): Promise<NewsItemSummary[]> {
  return apiRequest<NewsItemSummary[]>("/api/v1/news/feed", readCache);
}
