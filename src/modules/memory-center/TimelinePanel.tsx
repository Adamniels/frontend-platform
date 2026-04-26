"use client";

import { useCallback } from "react";
import { JarvisCard } from "@/components/jarvis/JarvisCard";
import { JarvisInlineError } from "@/components/jarvis/JarvisInlineError";
import { formatLoadError } from "@/lib/utils/error-message";
import { useAsyncResource } from "@/lib/hooks/use-async-resource";
import { fetchMemoryEvents, type MemoryEventV1 } from "@/lib/api/adapters/memory-center";
import styles from "./memory-center.module.css";

function formatWhen(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

function EventRow({ e }: { e: MemoryEventV1 }) {
  return (
    <li>
      <strong style={{ color: "var(--color-text)" }}>{e.eventType}</strong>
      <div style={{ marginTop: 4 }}>{formatWhen(e.occurredAt)}</div>
      {e.domain ? <div>Topic: {e.domain}</div> : null}
      {e.projectId ? <div>Project: {e.projectId}</div> : null}
      {e.payloadPreview ? <div style={{ marginTop: 6, opacity: 0.9 }}>{e.payloadPreview}</div> : null}
    </li>
  );
}

export function TimelinePanel() {
  const load = useCallback(() => fetchMemoryEvents(0, 100), []);
  const res = useAsyncResource(load, "timeline");
  if (res.status === "loading") {
    return <p className={styles.muted}>Loading activity…</p>;
  }
  if (res.status === "error") {
    return <JarvisInlineError title="Timeline" message={formatLoadError(res.error)} />;
  }
  if (res.data.length === 0) {
    return <p className={styles.muted}>No recent activity has been recorded yet.</p>;
  }
  return (
    <JarvisCard hover={false}>
      <p className={styles.lead} style={{ marginBottom: 16 }}>
        A concise log of what happened—helpful context for how memory is updated over time.
      </p>
      <ul className={styles.evidence}>
        {res.data.map((e) => (
          <EventRow key={e.id} e={e} />
        ))}
      </ul>
    </JarvisCard>
  );
}
