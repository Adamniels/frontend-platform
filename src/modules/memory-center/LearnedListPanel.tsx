"use client";

import { useCallback } from "react";
import Link from "next/link";
import { JarvisCard } from "@/components/jarvis/JarvisCard";
import { JarvisInlineError } from "@/components/jarvis/JarvisInlineError";
import { formatLoadError } from "@/lib/utils/error-message";
import { useAsyncResource } from "@/lib/hooks/use-async-resource";
import { CURRENT_USER_ID, fetchSemantics, type SemanticMemoryV1 } from "@/lib/api/adapters/memory-center";
import { ScoreBar } from "./ScoreBar";
import styles from "./memory-center.module.css";

function norm(s: string) {
  return s.toLowerCase().replace(/_/g, "");
}

function statusLabel(s: string): string {
  const x = norm(s);
  if (x === "pendingreview") return "Suggested";
  if (x === "active") return "Active";
  if (x === "archived") return "Archived";
  if (x === "superseded") return "Replaced";
  if (x === "rejected") return "Declined";
  return s;
}

function LearnedCard({ m }: { m: SemanticMemoryV1 }) {
  return (
    <div className={styles.listItem}>
      <p className={styles.claim}>{m.claim}</p>
      <div className={styles.meta}>
        <span className={norm(m.status) === "pendingreview" ? styles.pillEmph : styles.pill}>
          {statusLabel(m.status)}
        </span>
        {m.domain ? <span>Topic: {m.domain}</span> : null}
      </div>
      <ScoreBar label="How sure we are" value01={m.confidence} hint="Based on patterns in your activity." />
      <ScoreBar
        label="Source reliability"
        value01={m.authorityWeight}
        hint="Higher when you or an approved process confirmed this."
      />
      <Link className={styles.link} href={`/memory/learned/${m.id}`}>
        Why this is here
      </Link>
    </div>
  );
}

export function LearnedListPanel() {
  const load = useCallback(() => fetchSemantics(CURRENT_USER_ID, true), []);
  const res = useAsyncResource(load, "semantics");
  if (res.status === "loading") {
    return <p className={styles.muted}>Loading learned memory…</p>;
  }
  if (res.status === "error") {
    return <JarvisInlineError title="Learned about you" message={formatLoadError(res.error)} />;
  }
  if (res.data.length === 0) {
    return <p className={styles.muted}>Nothing here yet. As you use the platform, we’ll surface what we learn.</p>;
  }
  return (
    <div className={styles.list}>
      {res.data.map((m) => (
        <JarvisCard key={m.id} hover={false}>
          <LearnedCard m={m} />
        </JarvisCard>
      ))}
    </div>
  );
}
