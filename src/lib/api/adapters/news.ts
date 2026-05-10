import type { NewsItemSummary } from "@/types/content";
import { apiRequest } from "@/lib/api/client";

const readCache = { next: { revalidate: 30 } as const };

export async function fetchNewsFeed(): Promise<NewsItemSummary[]> {
  return apiRequest<NewsItemSummary[]>("/api/v1/news/feed", readCache);
}

export type DeleteNewsItemsResponse = {
  deleted: number;
};

export async function deleteNewsItems(ids: string[]): Promise<DeleteNewsItemsResponse> {
  return apiRequest<DeleteNewsItemsResponse>("/api/v1/news/items/delete", {
    method: "POST",
    body: { ids },
    cache: "no-store",
  });
}
