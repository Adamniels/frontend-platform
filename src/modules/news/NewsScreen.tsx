import { formatLoadError } from "@/lib/utils/error-message";
import { getNewsFeed } from "./api/get-news-feed";
import { NewsView } from "./NewsView";

export async function NewsScreen() {
  const result = await getNewsFeed()
    .then((items) => ({ ok: true as const, items }))
    .catch((error: unknown) => ({ ok: false as const, error }));
  if (!result.ok) {
    return <NewsView loadError={formatLoadError(result.error)} />;
  }
  return <NewsView items={result.items} />;
}
