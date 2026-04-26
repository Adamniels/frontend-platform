import { ReviewQueuePanel } from "@/modules/memory-center/ReviewQueuePanel";
import memStyles from "@/modules/memory-center/memory-center.module.css";

export const metadata = {
  title: "Memory — Review",
};

export default function MemoryReviewPage() {
  return (
    <div>
      <h3 className={memStyles.h3}>Suggestions for you</h3>
      <p className={memStyles.muted} style={{ marginBottom: 16, maxWidth: "56ch" }}>
        Approve to add a suggestion to your memory, or skip if it doesn’t feel right. You can always revisit
        learned items later.
      </p>
      <ReviewQueuePanel />
    </div>
  );
}
