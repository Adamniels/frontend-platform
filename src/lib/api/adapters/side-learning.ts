import type { SideLearningTopic } from "@/types/content";
import { apiRequest } from "@/lib/api/client";

const readCache = { next: { revalidate: 30 } as const };

export async function fetchSideLearningTopics(): Promise<SideLearningTopic[]> {
  return apiRequest<SideLearningTopic[]>("/api/v1/side-learning/topics", readCache);
}
