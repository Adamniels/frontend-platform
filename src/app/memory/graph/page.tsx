import { MemoryGraphPanel } from "@/modules/memory-center/MemoryGraphPanel";
import { MemorySectionHeader } from "@/modules/memory-center/MemorySectionHeader";

export const metadata = {
  title: "Memory — Graph",
};

export default function MemoryGraphPage() {
  return (
    <>
      <MemorySectionHeader
        title="Memory graph"
        description="Spatial view of live semantics, rules, and profile facts. Relationship edges appear when the API supports them."
      />
      <MemoryGraphPanel />
    </>
  );
}
