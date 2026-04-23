import type { DashboardSummary } from "@/types/dashboard";
import { delay } from "./delay";

export async function fetchDashboardSummary(): Promise<DashboardSummary> {
  await delay(120);
  return {
    greeting: "Welcome back",
    activeRuns: 2,
    itemsNeedingAttention: 1,
  };
}
