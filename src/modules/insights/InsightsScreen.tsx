import { formatLoadError } from "@/lib/utils/error-message";
import { getInsights } from "./api/get-insights";
import { InsightsView } from "./InsightsView";

export async function InsightsScreen() {
  const result = await getInsights()
    .then((items) => ({ ok: true as const, items }))
    .catch((error: unknown) => ({ ok: false as const, error }));
  if (!result.ok) {
    return <InsightsView loadError={formatLoadError(result.error)} />;
  }
  return <InsightsView items={result.items} />;
}
