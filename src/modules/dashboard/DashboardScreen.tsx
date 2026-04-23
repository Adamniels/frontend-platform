import type { DashboardSummary } from "@/types/dashboard";
import { getDashboardSummary } from "./api/get-dashboard-summary";
import { DashboardView } from "./DashboardView";

export async function DashboardScreen() {
  let data: DashboardSummary | undefined;
  let error: unknown;

  try {
    data = await getDashboardSummary();
  } catch (caught) {
    error = caught;
  }

  if (error !== undefined) {
    return <DashboardView error={error} />;
  }

  if (data === undefined) {
    return <DashboardView error={new Error("Missing dashboard data")} />;
  }

  return <DashboardView data={data} />;
}
