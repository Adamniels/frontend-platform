import { MemoryGraphPanel } from "@/modules/memory-center/MemoryGraphPanel";
import memStyles from "@/modules/memory-center/memory-center.module.css";

export const metadata = {
  title: "Memory — Graph",
};

export default function MemoryGraphPage() {
  return (
    <div>
      <h3 className={memStyles.h3}>Memory graph</h3>
      <MemoryGraphPanel />
    </div>
  );
}
