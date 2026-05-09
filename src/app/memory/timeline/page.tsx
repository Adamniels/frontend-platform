import { TimelinePanel } from "@/modules/memory-center/TimelinePanel";
import { MemorySectionHeader } from "@/modules/memory-center/MemorySectionHeader";

export const metadata = {
  title: "Memory — Timeline",
};

export default function MemoryTimelinePage() {
  return (
    <>
      <MemorySectionHeader
        title="Activity timeline"
        description="Consolidations, sessions, insights, and profile updates on a horizontal time axis. Drag or scroll horizontally to pan along time; scroll or pinch vertically to zoom. Shift+scroll also pans horizontally. Hover for a quick summary; click an event for full details."
      />
      <TimelinePanel />
    </>
  );
}
