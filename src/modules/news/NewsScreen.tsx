import type { NewsItemSummary } from "@/types/content";
import { getNewsFeed } from "./api/get-news-feed";
import { NewsView } from "./NewsView";

export async function NewsScreen() {
  let items: NewsItemSummary[] | undefined;
  let error: unknown;

  try {
    items = await getNewsFeed();
  } catch (caught) {
    error = caught;
  }

  if (error !== undefined) {
    return <NewsView error={error} />;
  }

  if (items === undefined) {
    return <NewsView error={new Error("Missing news data")} />;
  }

  return <NewsView items={items} />;
}
