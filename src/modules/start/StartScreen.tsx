import { getFirstOngoingSessionPreview } from "@/lib/side-learning/get-first-ongoing-session-preview";
import { StartView } from "./StartView";

export async function StartScreen() {
  const ongoingSession = await getFirstOngoingSessionPreview({ next: { revalidate: 30 } }).catch(() => null);
  return <StartView ongoingSession={ongoingSession} />;
}
