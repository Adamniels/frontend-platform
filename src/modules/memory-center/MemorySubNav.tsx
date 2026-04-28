"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils/cn";
import {
  fetchMemoryEvents,
  fetchProceduralRules,
  fetchReviewQueue,
  fetchSemantics,
} from "@/lib/api/adapters/memory-center";
import styles from "./memory-center.module.css";

type MemoryTabCounts = {
  timeline: number;
  semantics: number;
  rules: number;
  review: number;
};

type TabDef =
  | { href: string; label: string; matchPrefix?: string; kind: "plain" }
  | { href: string; label: string; matchPrefix?: string; kind: "count"; countKey: keyof MemoryTabCounts; alert?: boolean };

/** Design reference: platform memory-2-design/Memory.html TabBar (GRAPH · TIMELINE · …). */
const TABS: TabDef[] = [
  { href: "/memory/graph", label: "Graph", kind: "plain" },
  { href: "/memory/timeline", label: "Timeline", kind: "count", countKey: "timeline" },
  { href: "/memory/learned", label: "Semantics", kind: "count", countKey: "semantics", matchPrefix: "/memory/learned" },
  { href: "/memory/procedural", label: "Rules", kind: "count", countKey: "rules" },
  { href: "/memory/review", label: "Review", kind: "count", countKey: "review", alert: true },
  { href: "/memory/profile", label: "Profile", kind: "plain" },
];

export function MemorySubNav() {
  const path = usePathname();
  const [counts, setCounts] = useState<MemoryTabCounts | null>(null);

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const [ev, sem, rules, review] = await Promise.all([
          fetchMemoryEvents(0, 120),
          fetchSemantics(0, true),
          fetchProceduralRules(0),
          fetchReviewQueue(0),
        ]);
        if (!live) return;
        const pending = review.filter(
          (r) => (r.status ?? "").toLowerCase() === "pending",
        ).length;
        setCounts({
          timeline: ev.length,
          semantics: sem.length,
          rules: rules.length,
          review: pending,
        });
      } catch {
        if (live) setCounts(null);
      }
    })();
    return () => { live = false; };
  }, []);

  return (
    <nav className={styles.memoryTabBar} aria-label="Memory sections">
      {TABS.map((l) => {
        const active =
          path === l.href ||
          (l.matchPrefix != null && path.startsWith(l.matchPrefix)) ||
          (l.href === "/memory/profile" && path.startsWith("/memory/profile"));
        const count = l.kind === "count" && counts ? counts[l.countKey] : null;
        return (
          <Link
            key={l.href}
            href={l.href}
            className={cn(styles.memoryTab, active && styles.memoryTabActive)}
          >
            {l.label}
            {l.kind === "count" && count != null && (
              <span
                className={cn(
                  styles.memoryTabCount,
                  l.alert && count > 0 && styles.memoryTabCountAlert,
                )}
              >
                {count}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
