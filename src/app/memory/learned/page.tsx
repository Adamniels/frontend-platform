import { MemorySemanticsPanel } from "@/modules/memory-center/MemorySemanticsPanel";
import memStyles from "@/modules/memory-center/memory-center.module.css";

export const metadata = {
  title: "Memory — Semantics",
};

export default function MemoryLearnedPage() {
  return (
    <div>
      <h3 className={memStyles.h3}>Semantic memory</h3>
      <p className={memStyles.muted} style={{ marginBottom: 16, maxWidth: "58ch" }}>
        Beliefs the platform holds about you — patterns extracted from how you work. Archive or reject anything
        that doesn&apos;t feel right.
      </p>
      <MemorySemanticsPanel />
    </div>
  );
}
