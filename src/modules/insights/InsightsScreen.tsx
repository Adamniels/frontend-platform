import { getInsights } from "./api/get-insights";
import { InsightsView } from "./InsightsView";

export async function InsightsScreen() {
  let items: Awaited<ReturnType<typeof getInsights>> | undefined;
  let error: unknown;

  try {
    items = await getInsights();
  } catch (caught) {
    error = caught;
  }

  if (error !== undefined) {
    return <InsightsView error={error} />;
  }
  if (items === undefined) {
    return <InsightsView error={new Error("Missing insights")} />;
  }
  return <InsightsView items={items} />;
}
