import type { ReactNode } from "react";
import { MemorySubNav } from "@/modules/memory-center/MemorySubNav";
import memStyles from "@/modules/memory-center/memory-center.module.css";

export default function MemoryLayout({ children }: { children: ReactNode }) {
  return (
    <div className={memStyles.page}>
      <h2 className={memStyles.h2}>Memory center</h2>
      <p className={memStyles.lead}>
        See what the platform knows, what it&apos;s suggesting, and what you&apos;ve said directly. You stay in
        control of long-term memory.
      </p>
      <MemorySubNav />
      {children}
    </div>
  );
}
