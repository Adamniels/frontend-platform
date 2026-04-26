"use client";

import { useCallback, useState } from "react";
import { JarvisButton } from "@/components/jarvis/JarvisButton";
import { JarvisCard } from "@/components/jarvis/JarvisCard";
import { JarvisInlineError } from "@/components/jarvis/JarvisInlineError";
import { formatLoadError } from "@/lib/utils/error-message";
import { useAsyncResource } from "@/lib/hooks/use-async-resource";
import { approveReviewItem, fetchReviewQueue, type ReviewQueueItemV1, rejectReviewItem } from "@/lib/api/adapters/memory-center";
import styles from "./memory-center.module.css";

function proposalLabel(t: string): string {
  const u = t.toLowerCase();
  if (u.includes("semantic")) return "New memory";
  if (u.includes("procedural")) return "Platform behavior";
  if (u.includes("merge")) return "Merge";
  if (u.includes("adjust")) return "Update confidence";
  return t;
}

function ReviewCard({
  item,
  onChange,
}: {
  item: ReviewQueueItemV1;
  onChange: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const onApprove = async () => {
    setErr(null);
    setBusy(true);
    try {
      await approveReviewItem(item.id, 0);
      onChange();
    } catch (e: unknown) {
      setErr(formatLoadError(e));
    } finally {
      setBusy(false);
    }
  };

  const onReject = async () => {
    setErr(null);
    setBusy(true);
    try {
      await rejectReviewItem(item.id, 0, "User declined in Memory Center");
      onChange();
    } catch (e: unknown) {
      setErr(formatLoadError(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <JarvisCard hover={false}>
      {err ? <JarvisInlineError title="Action failed" message={err} /> : null}
      <div className={styles.meta} style={{ marginBottom: 8 }}>
        <span className={styles.pillEmph}>{proposalLabel(item.proposalType)}</span>
        {item.priority ? <span>Priority {item.priority}</span> : null}
      </div>
      <p className={styles.claim}>{item.title}</p>
      <p className={styles.muted}>{item.summary}</p>
      {item.proposedChangeJson ? (
        <p className={styles.muted} style={{ fontSize: 11 }}>
          Details are available in the system; we only show a summary here to keep this screen simple.
        </p>
      ) : null}
      <div className={styles.rowActions}>
        <JarvisButton
          type="button"
          variant="primary"
          label={busy ? "Working…" : "Add to memory"}
          onClick={() => void onApprove()}
        />
        <JarvisButton
          type="button"
          variant="outline"
          label={busy ? "Working…" : "Not now"}
          onClick={() => void onReject()}
        />
      </div>
    </JarvisCard>
  );
}

export function ReviewQueuePanel() {
  const [refresh, setRefresh] = useState(0);
  const load = useCallback(() => fetchReviewQueue(0), [refresh]);
  const res = useAsyncResource(load, `review-${refresh}`);

  if (res.status === "loading") {
    return <p className={styles.muted}>Loading review queue…</p>;
  }
  if (res.status === "error") {
    return <JarvisInlineError title="Review queue" message={formatLoadError(res.error)} />;
  }
  const pending = res.data.filter(
    (x) => x.status.toLowerCase().replace(/_/g, "") === "pending",
  );
  if (pending.length === 0) {
    return <p className={styles.muted}>You’re all caught up. No suggestions to review right now.</p>;
  }
  return (
    <div className={styles.list}>
      {pending.map((item) => (
        <ReviewCard
          key={item.id}
          item={item}
          onChange={() => setRefresh((k) => k + 1)}
        />
      ))}
    </div>
  );
}
