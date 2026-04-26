import { TimelinePanel } from "@/modules/memory-center/TimelinePanel";
import memStyles from "@/modules/memory-center/memory-center.module.css";

export const metadata = {
  title: "Memory — Timeline",
};

export default function MemoryTimelinePage() {
  return (
    <div>
      <h3 className={memStyles.h3}>Activity</h3>
      <TimelinePanel />
    </div>
  );
}
