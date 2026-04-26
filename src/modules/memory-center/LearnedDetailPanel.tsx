"use client";

import { useCallback } from "react";
import Link from "next/link";
import { JarvisCard } from "@/components/jarvis/JarvisCard";
import { JarvisInlineError } from "@/components/jarvis/JarvisInlineError";
import { formatLoadError } from "@/lib/utils/error-message";
import { useAsyncResource } from "@/lib/hooks/use-async-resource";
import { fetchSemantic, fetchSemanticEvidence, type SemanticMemoryV1 } from "@/lib/api/adapters/memory-center";
import { ScoreBar } from "./ScoreBar";
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
    return fetchSemantic(n, 0);
  }, [id]);
  const res = useAsyncResource(load, `semantic-${id}`);

  const evLoad = useCallback(() => {
    const n = Number(id);
    if (Number.isNaN(n) || n <= 0) {
      return Promise.resolve([]);
    }
    return fetchSemanticEvidence(n, 0);
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
    <div>
      <Link className={styles.link} href="/memory/learned">
        ← All learned
      </Link>
      <JarvisCard hover={false} className="screenEnter" style={{ marginTop: 12 }}>
        <h3 className={styles.h3}>You might notice</h3>
        <p className={styles.claim}>{m.claim}</p>
        {m.key ? <p className={styles.muted}>Label: {m.key}</p> : null}
        {m.domain ? <p className={styles.muted}>Topic: {m.domain}</p> : null}
        <p className={styles.muted} style={{ marginTop: 8 }}>
          This is currently <strong style={{ color: "var(--accent)" }}>{statusLabel(m.status)}</strong>.
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
      <JarvisCard hover={false} style={{ marginTop: 12 }}>
        <h3 className={styles.h3}>Supporting activity</h3>
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
              <li key={e.eventId}>
                <div>
                  <strong style={{ color: "var(--color-text)" }}>{e.eventType}</strong>
                </div>
                <div style={{ marginTop: 4 }}>{new Date(e.occurredAt).toLocaleString()}</div>
                {e.note ? <div style={{ marginTop: 4 }}>Note: {e.note}</div> : null}
                <div style={{ marginTop: 4, fontSize: 11 }}>Relevance: {Math.round(e.strength * 100)}%</div>
              </li>
            ))}
          </ul>
        ) : null}
      </JarvisCard>
    </div>
  );
}
