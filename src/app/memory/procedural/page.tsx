import { ProceduralRulesPanel } from "@/modules/memory-center/ProceduralRulesPanel";
import memStyles from "@/modules/memory-center/memory-center.module.css";

export const metadata = {
  title: "Memory — Rules",
};

export default function MemoryProceduralPage() {
  return (
    <div>
      <h3 className={memStyles.h3}>How the platform should behave</h3>
      <ProceduralRulesPanel />
    </div>
  );
}
