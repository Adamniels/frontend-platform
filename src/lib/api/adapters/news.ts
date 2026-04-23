import type { NewsItemSummary } from "@/types/content";
import { delay } from "./delay";

export async function fetchNewsFeed(): Promise<NewsItemSummary[]> {
  await delay(100);
  return [
    {
      id: "n1",
      title: "Sample headline (placeholder)",
      source: "Wire",
      publishedAt: new Date().toISOString(),
    },
    {
      id: "n2",
      title: "Another story placeholder",
      source: "Digest",
      publishedAt: new Date().toISOString(),
    },
  ];
}
