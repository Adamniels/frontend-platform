import { LearnedListPanel } from "@/modules/memory-center/LearnedListPanel";
import memStyles from "@/modules/memory-center/memory-center.module.css";

export const metadata = {
  title: "Memory — Learned",
};

export default function MemoryLearnedPage() {
  return (
    <div>
      <h3 className={memStyles.h3}>What we think we learned</h3>
      <p className={memStyles.muted} style={{ marginBottom: 16, maxWidth: "58ch" }}>
        Shorter summaries of patterns in your use of the product. Suggested items wait for you in Review before
        they fully land.
      </p>
      <LearnedListPanel />
    </div>
  );
}
