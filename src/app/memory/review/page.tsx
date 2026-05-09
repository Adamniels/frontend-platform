import { ReviewQueuePanel } from "@/modules/memory-center/ReviewQueuePanel";
import { MemorySectionHeader } from "@/modules/memory-center/MemorySectionHeader";

export const metadata = {
  title: "Memory — Review",
};

export default function MemoryReviewPage() {
  return (
    <>
      <MemorySectionHeader
        title="Suggestions for you"
        description="Approve to add a suggestion to your memory, or skip if it does not feel right. You can revisit learned items later."
      />
      <ReviewQueuePanel />
    </>
  );
}
