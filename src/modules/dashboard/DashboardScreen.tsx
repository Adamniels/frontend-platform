import { fetchInputNeededItems } from "@/lib/api/adapters/input-needed";
import { fetchNewsFeed } from "@/lib/api/adapters/news";
import { getFirstOngoingSessionPreview } from "@/lib/side-learning/get-first-ongoing-session-preview";
import { formatLoadError } from "@/lib/utils/error-message";
import { getDashboardSummary } from "./api/get-dashboard-summary";
import { DashboardView } from "./DashboardView";

export async function DashboardScreen() {
  const summaryResult = await getDashboardSummary()
    .then((data) => ({ ok: true as const, data }))
    .catch((error: unknown) => ({ ok: false as const, error }));

  if (!summaryResult.ok) {
    return <DashboardView loadError={formatLoadError(summaryResult.error)} />;
  }

  const [inputNeededItems, ongoingSession, newsItems] = await Promise.all([
    fetchInputNeededItems().catch(() => []),
    getFirstOngoingSessionPreview({ next: { revalidate: 30 } }).catch(() => null),
    fetchNewsFeed().catch(() => null as unknown),
  ]);

  const newsFeedCount = Array.isArray(newsItems) ? newsItems.length : null;

  return (
    <DashboardView
      data={summaryResult.data}
      inputNeededItems={inputNeededItems}
      ongoingSession={ongoingSession}
      newsFeedCount={newsFeedCount}
    />
  );
}
