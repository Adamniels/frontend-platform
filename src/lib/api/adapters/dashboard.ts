import type { DashboardSummary } from "@/types/dashboard";
import { apiRequest } from "@/lib/api/client";

export async function fetchDashboardSummary(): Promise<DashboardSummary> {
  return apiRequest<DashboardSummary>("/api/v1/dashboard/summary");
}
