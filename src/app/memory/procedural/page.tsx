import { ProceduralRulesPanel } from "@/modules/memory-center/ProceduralRulesPanel";
import { MemorySectionHeader } from "@/modules/memory-center/MemorySectionHeader";

export const metadata = {
  title: "Memory — Rules",
};

export default function MemoryProceduralPage() {
  return (
    <>
      <MemorySectionHeader
        title="How the platform should behave"
        description="Procedural rules shape recommendations, summaries, and side workflows. Deprecate rules you no longer want applied."
      />
      <ProceduralRulesPanel />
    </>
  );
}
