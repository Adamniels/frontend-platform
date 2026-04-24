import { formatLoadError } from "@/lib/utils/error-message";
import { getDashboardSummary } from "./api/get-dashboard-summary";
import { DashboardView } from "./DashboardView";

export async function DashboardScreen() {
  const result = await getDashboardSummary()
    .then((data) => ({ ok: true as const, data }))
    .catch((error: unknown) => ({ ok: false as const, error }));
  if (!result.ok) {
    return <DashboardView loadError={formatLoadError(result.error)} />;
  }
  return <DashboardView data={result.data} />;
}
