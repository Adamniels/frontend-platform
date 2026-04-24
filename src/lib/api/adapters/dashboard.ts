import type { DashboardSummary } from "@/types/dashboard";
import { apiRequest } from "@/lib/api/client";

const readCache = { next: { revalidate: 30 } as const };

export async function fetchDashboardSummary(): Promise<DashboardSummary> {
  return apiRequest<DashboardSummary>("/api/v1/dashboard/summary", readCache);
}
