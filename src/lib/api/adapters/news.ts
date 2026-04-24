import type { NewsItemSummary } from "@/types/content";
import { apiRequest } from "@/lib/api/client";

export async function fetchNewsFeed(): Promise<NewsItemSummary[]> {
  return apiRequest<NewsItemSummary[]>("/api/v1/news/feed");
}
