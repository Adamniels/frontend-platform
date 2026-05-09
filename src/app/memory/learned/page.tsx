import { MemorySemanticsPanel } from "@/modules/memory-center/MemorySemanticsPanel";
import { MemorySectionHeader } from "@/modules/memory-center/MemorySectionHeader";

export const metadata = {
  title: "Memory — Semantics",
};

export default function MemoryLearnedPage() {
  return (
    <>
      <MemorySectionHeader
        title="Semantic memory"
        description="Beliefs the platform holds about you—patterns from how you work. Archive or reject anything that does not feel right."
      />
      <MemorySemanticsPanel />
    </>
  );
}
