import { ProfileMemoryPanel } from "@/modules/memory-center/ProfileMemoryPanel";
import { MemorySectionHeader } from "@/modules/memory-center/MemorySectionHeader";

export const metadata = {
  title: "Memory — Profile",
};

export default function MemoryProfilePage() {
  return (
    <>
      <MemorySectionHeader
        title="What you said directly"
        description="Goals and interests you enter here are high-trust. They apply across workflows until you change them."
      />
      <ProfileMemoryPanel />
    </>
  );
}
