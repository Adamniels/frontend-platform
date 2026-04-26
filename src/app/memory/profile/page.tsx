import { ProfileMemoryPanel } from "@/modules/memory-center/ProfileMemoryPanel";
import memStyles from "@/modules/memory-center/memory-center.module.css";

export const metadata = {
  title: "Memory — Profile",
};

export default function MemoryProfilePage() {
  return (
    <div>
      <h3 className={memStyles.h3}>What you said directly</h3>
      <p className={memStyles.muted} style={{ marginBottom: 16, maxWidth: "56ch" }}>
        Goals and interests you enter here are treated as high-trust. They apply across workflows until you
        change them.
      </p>
      <ProfileMemoryPanel />
    </div>
  );
}
