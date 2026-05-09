"use client";

import { useCallback } from "react";
import Link from "next/link";
import { JarvisCard } from "@/components/jarvis/JarvisCard";
import { JarvisInlineError } from "@/components/jarvis/JarvisInlineError";
import { formatLoadError } from "@/lib/utils/error-message";
import { useAsyncResource } from "@/lib/hooks/use-async-resource";
import { CURRENT_USER_ID, fetchSemantic, fetchSemanticEvidence, type SemanticMemoryV1 } from "@/lib/api/adapters/memory-center";
import { ScoreBar } from "./ScoreBar";
import { MemorySectionHeader } from "./MemorySectionHeader";
import styles from "./memory-center.module.css";

function n(s: string) {
  return s.toLowerCase().replace(/_/g, "");
}

function statusLabel(s: string): string {
  const x = n(s);
  if (x === "pendingreview") return "suggested for you to confirm";
  if (x === "active") return "in use";
  if (x === "archived") return "archived";
  if (x === "superseded") return "replaced by a newer memory";
  if (x === "rejected") return "declined";
  return s;
}

function whyText(m: SemanticMemoryV1) {
  const s = n(m.status);
  if (s === "active") {
    return "This is part of your learned memory and can influence how the platform responds to you.";
  }
  if (s === "pendingreview") {
    return "This is a suggestion from your recent activity. You can review it in the queue before it’s fully used.";
  }
  return "This entry reflects a past decision or a pattern we observed, subject to the status above.";
}

type Props = { id: string };

export function LearnedDetailPanel({ id }: Props) {
  const load = useCallback(() => {
    const n = Number(id);
    if (Number.isNaN(n) || n <= 0) {
      return Promise.reject(new Error("Invalid memory id"));
    }
    return fetchSemantic(n, CURRENT_USER_ID);
  }, [id]);
  const res = useAsyncResource(load, `semantic-${id}`);

  const evLoad = useCallback(() => {
    const n = Number(id);
    if (Number.isNaN(n) || n <= 0) {
      return Promise.resolve([]);
    }
    return fetchSemanticEvidence(n, CURRENT_USER_ID);
  }, [id]);
  const ev = useAsyncResource(evLoad, `evidence-${id}`);

  if (res.status === "loading") {
    return <p className={styles.muted}>Opening memory…</p>;
  }
  if (res.status === "error") {
    return <JarvisInlineError title="Memory" message={formatLoadError(res.error)} />;
  }
  const m = res.data;

  return (
    <div className={styles.detailStack}>
      <MemorySectionHeader
        title="Semantic detail"
        description="Why this entry exists, how confident we are, and supporting activity when available."
      />
      <Link className={styles.link} href="/memory/learned">
        ← All semantics
      </Link>
      <JarvisCard hover={false} className={styles.detailCard}>
        <div className={styles.sectionTitleJarvis}>You might notice</div>
        <p className={styles.claim}>{m.claim}</p>
        {m.key ? <p className={styles.muted}>Label: {m.key}</p> : null}
        {m.domain ? <p className={styles.muted}>Topic: {m.domain}</p> : null}
        <p className={styles.detailStatusLine}>
          This is currently <strong className={styles.detailStatusEm}>{statusLabel(m.status)}</strong>.
        </p>
        <p className={styles.aside}>{whyText(m)}</p>
        <ScoreBar
          label="How sure we are"
          value01={m.confidence}
          hint="Higher when the pattern is consistent over time."
        />
        <ScoreBar
          label="Source reliability"
          value01={m.authorityWeight}
          hint="Raised by direct input or a review you approved."
        />
      </JarvisCard>
      <JarvisCard hover={false} className={styles.detailCard}>
        <div className={styles.sectionTitleJarvis}>Supporting activity</div>
        {ev.status === "loading" ? <p className={styles.muted}>Loading…</p> : null}
        {ev.status === "error" ? <JarvisInlineError title="Evidence" message={formatLoadError(ev.error)} /> : null}
        {ev.status === "success" && ev.data.length === 0 ? (
          <p className={styles.muted}>
            We don&apos;t list raw technical logs here. When a specific moment supported this entry, you&apos;ll
            see a short description.
          </p>
        ) : null}
        {ev.status === "success" && ev.data.length > 0 ? (
          <ul className={styles.evidence}>
            {ev.data.map((e) => (
              <li key={e.eventId} className={styles.evidenceItem}>
                <div className={styles.evidenceType}>{e.eventType}</div>
                <div className={styles.evidenceMeta}>{new Date(e.occurredAt).toLocaleString()}</div>
                {e.note ? <div className={styles.evidenceNote}>Note: {e.note}</div> : null}
                <div className={styles.evidenceStrength}>Relevance: {Math.round(e.strength * 100)}%</div>
              </li>
            ))}
          </ul>
        ) : null}
      </JarvisCard>
    </div>
  );
}
