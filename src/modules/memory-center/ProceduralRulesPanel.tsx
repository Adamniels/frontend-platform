"use client";

import { useCallback } from "react";
import { JarvisCard } from "@/components/jarvis/JarvisCard";
import { JarvisInlineError } from "@/components/jarvis/JarvisInlineError";
import { formatLoadError } from "@/lib/utils/error-message";
import { useAsyncResource } from "@/lib/hooks/use-async-resource";
import { fetchProceduralRules, type ProceduralRuleSummaryV1 } from "@/lib/api/adapters/memory-center";
import { ScoreBar } from "./ScoreBar";
import styles from "./memory-center.module.css";

function Rule({ r }: { r: ProceduralRuleSummaryV1 }) {
  return (
    <div className={styles.listItem} style={{ marginBottom: 16 }}>
      <p className={styles.claim}>
        {r.ruleName} · {r.workflowType}
      </p>
      <div className={styles.meta}>
        <span className={styles.pill}>{r.status}</span>
        <span>v{r.version}</span>
        <span>Priority {r.priority}</span>
        <span>Source: {r.source || "—"}</span>
      </div>
      <ScoreBar label="Reliability" value01={r.authorityWeight} hint="Rules you approve are weighted higher." />
    </div>
  );
}

export function ProceduralRulesPanel() {
  const load = useCallback(() => fetchProceduralRules(0), []);
  const res = useAsyncResource(load, "procedural");
  if (res.status === "loading") {
    return <p className={styles.muted}>Loading behavior rules…</p>;
  }
  if (res.status === "error") {
    return <JarvisInlineError title="Procedural rules" message={formatLoadError(res.error)} />;
  }
  if (res.data.length === 0) {
    return <p className={styles.muted}>No custom behavior rules yet. Defaults still apply in workflows.</p>;
  }
  return (
    <div>
      <p className={styles.lead} style={{ marginBottom: 16 }}>
        How the platform should act for you in different workflows. Changes usually go through review when they
        matter.
      </p>
      <div className={styles.list}>
        {res.data.map((r) => (
          <JarvisCard key={`${r.id}-${r.version}`} hover={false}>
            <Rule r={r} />
          </JarvisCard>
        ))}
      </div>
    </div>
  );
}
