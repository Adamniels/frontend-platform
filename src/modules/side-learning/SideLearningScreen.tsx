import type { SideLearningTopic } from "@/types/content";
import { getSideLearningTopics } from "./api/get-topics";
import { SideLearningView } from "./SideLearningView";

export async function SideLearningScreen() {
  let topics: SideLearningTopic[] | undefined;
  let error: unknown;

  try {
    topics = await getSideLearningTopics();
  } catch (caught) {
    error = caught;
  }

  if (error !== undefined) {
    return <SideLearningView error={error} />;
  }

  if (topics === undefined) {
    return <SideLearningView error={new Error("Missing side learning data")} />;
  }

  return <SideLearningView topics={topics} />;
}
