import type { SideLearningTopic } from "@/types/content";
import { delay } from "./delay";

export async function fetchSideLearningTopics(): Promise<SideLearningTopic[]> {
  await delay(100);
  return [
    { id: "s1", title: "Foundations", progressPercent: 40 },
    { id: "s2", title: "Applied practice", progressPercent: 10 },
  ];
}
