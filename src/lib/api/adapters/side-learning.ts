import type { SideLearningSessionSummary } from "@/types/content";
import { apiRequest } from "@/lib/api/client";

const readCache = { next: { revalidate: 30 } as const };

export async function fetchSideLearningSessions(): Promise<SideLearningSessionSummary[]> {
  return apiRequest<SideLearningSessionSummary[]>("/api/v1/side-learning/sessions", readCache);
}
