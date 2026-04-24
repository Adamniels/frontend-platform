import { formatLoadError } from "@/lib/utils/error-message";
import { getStats } from "./api/get-stats";
import { StatsView } from "./StatsView";

export async function StatsScreen() {
  const result = await getStats()
    .then((data) => ({ ok: true as const, data }))
    .catch((error: unknown) => ({ ok: false as const, error }));
  if (!result.ok) {
    return <StatsView loadError={formatLoadError(result.error)} />;
  }
  return <StatsView data={result.data} />;
}
