import type { SideLearningTopic } from "@/types/content";
import { apiRequest } from "@/lib/api/client";

export async function fetchSideLearningTopics(): Promise<SideLearningTopic[]> {
  return apiRequest<SideLearningTopic[]>("/api/v1/side-learning/topics");
}
