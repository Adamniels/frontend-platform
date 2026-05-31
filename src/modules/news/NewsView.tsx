"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import type { NewsItemSummary } from "@/types/content";
import { JarvisButton } from "@/components/jarvis/JarvisButton";
import { JarvisCard } from "@/components/jarvis/JarvisCard";
import { JarvisInlineError } from "@/components/jarvis/JarvisInlineError";
import { JarvisTag } from "@/components/jarvis/JarvisTag";
import { SegmentedControl } from "@/components/jarvis/SegmentedControl";
import { deleteNewsItems } from "@/lib/api/adapters/news";
import { formatLoadError } from "@/lib/utils/error-message";
import { postNewsInteraction } from "./api/post-news-interaction";
import styles from "./news-experience.module.css";

const NO_ITEMS: NewsItemSummary[] = [];

function formatPublished(iso: string): string {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

function RelevancePill({ score }: { score: number | null | undefined }) {
  if (score == null) return null;
  const pct = Math.round(score * 100);
  // Colour ramp: below 40 = muted, 40-70 = moderate, above 70 = strong signal
  const color =
    pct >= 70 ? "#0f6e56" : pct >= 40 ? "#8a4e0a" : "#6b6b6b";
  return (
    <span
      style={{
        fontSize: "0.72rem",
        fontFamily: "monospace",
        color,
        opacity: 0.85,
        marginLeft: "0.5rem",
      }}
      title={`Relevance: ${pct}%`}
    >
      {pct}% match
    </span>
  );
}

type NewsViewProps = { items: NewsItemSummary[] } | { loadError: string };

export function NewsView(props: NewsViewProps) {
  const router = useRouter();
  const items = "items" in props ? props.items : NO_ITEMS;
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState("All");
  const [markedIds, setMarkedIds] = useState<Set<string>>(() => new Set());
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(() => new Set());
  const [savedIds, setSavedIds] = useState<Set<string>>(() => new Set());
  const [deleteErr, setDeleteErr] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Tracks the timestamp when the current article detail was opened, for dwell measurement.
  const dwellStartRef = useRef<number | null>(null);

  const sourceOptions = useMemo(() => {
    const sources = [...new Set(items.map((i) => i.source).filter(Boolean))].sort();
    return ["All", ...sources];
  }, [items]);

  const filtered = useMemo(() => {
    const base = filter === "All" ? items : items.filter((i) => i.source === filter);
    return base.filter((i) => !dismissedIds.has(i.id));
  }, [items, filter, dismissedIds]);

  const selected = selectedId ? items.find((i) => i.id === selectedId) : null;

  const markedCount = markedIds.size;
  const allVisibleMarked =
    filtered.length > 0 && filtered.every((i) => markedIds.has(i.id));

  const markAllVisible = () => {
    setMarkedIds((prev) => {
      const next = new Set(prev);
      for (const i of filtered) next.add(i.id);
      return next;
    });
    setDeleteErr(null);
  };

  const toggleMarked = (id: string) => {
    setMarkedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
    setDeleteErr(null);
  };

  const openArticle = (id: string) => {
    dwellStartRef.current = Date.now();
    setSelectedId(id);
  };

  const goBack = () => {
    if (selectedId && dwellStartRef.current != null) {
      const dwellSeconds = Math.max(1, Math.round((Date.now() - dwellStartRef.current) / 1000));
      dwellStartRef.current = null;
      void postNewsInteraction({
        newsItemId: selectedId,
        type: "read",
        dwellSeconds,
      }).catch(() => {
        // Fire-and-forget — interaction loss is acceptable
      });
    }
    setSelectedId(null);
  };

  const handleSave = (id: string) => {
    setSavedIds((prev) => new Set(prev).add(id));
    void postNewsInteraction({ newsItemId: id, type: "save" }).catch(() => {});
  };

  const handleDismiss = (id: string) => {
    setDismissedIds((prev) => new Set(prev).add(id));
    void postNewsInteraction({ newsItemId: id, type: "dismiss" }).catch(() => {});
  };

  const handleDismissDetail = () => {
    if (!selectedId) return;
    dwellStartRef.current = null;
    handleDismiss(selectedId);
    setSelectedId(null);
  };

  const deleteSelected = async () => {
    if (deleting) return;
    if (markedIds.size === 0) return;
    if (
      !window.confirm(
        `Delete ${markedIds.size} article${markedIds.size === 1 ? "" : "s"} from the feed?`,
      )
    ) {
      return;
    }
    setDeleteErr(null);
    setDeleting(true);
    try {
      await deleteNewsItems([...markedIds]);
      setMarkedIds(new Set());
      setSelectedId(null);
      router.refresh();
    } catch (e: unknown) {
      setDeleteErr(formatLoadError(e));
    } finally {
      setDeleting(false);
    }
  };

  if ("loadError" in props) {
    return (
      <div className={styles.page}>
        <JarvisInlineError title="News feed" message={props.loadError} />
      </div>
    );
  }

  if (selected) {
    const isSaved = savedIds.has(selected.id);
    return (
      <div className={`${styles.page} screenEnter`}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
          <button type="button" className={styles.back} style={{ margin: 0 }} onClick={goBack}>
            ← Back to feed
          </button>
          <div style={{ display: "flex", gap: "8px" }}>
            <JarvisButton
              type="button"
              variant="outline"
              label={isSaved ? "Saved ✓" : "Save"}
              onClick={() => handleSave(selected.id)}
            />
            <JarvisButton
              type="button"
              variant="outline"
              label="Dismiss"
              onClick={handleDismissDetail}
            />
          </div>
        </div>
        <JarvisCard className={styles.block} hover={false}>
          <div className={styles.tags}>
            <JarvisTag label={selected.source} />
          </div>
          <h2 className={styles.title}>{selected.title}</h2>
          <div className={styles.meta}>
            {formatPublished(selected.publishedAt)}
            <RelevancePill score={selected.relevanceScore} />
          </div>
          {selected.relevanceExplanation ? (
            <p style={{ marginTop: "10px", fontSize: "13px", color: "var(--color-text-muted)", lineHeight: 1.6 }}>
              {selected.relevanceExplanation}
            </p>
          ) : null}
        </JarvisCard>
        {selected.body ? (
          <JarvisCard className={`${styles.block} ${styles.relevanceBlock}`} hover={false}>
            <div className={styles.relevanceLabel}>Summary</div>
            <div className={styles.markdown}>
              <ReactMarkdown>{selected.body}</ReactMarkdown>
            </div>
            {selected.url ? (
              <a
                href={selected.url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.readLink}
              >
                Read full article →
              </a>
            ) : null}
          </JarvisCard>
        ) : (
          <JarvisCard className={`${styles.block} ${styles.relevanceBlock}`} hover={false}>
            <div className={styles.relevanceLabel}>Article body</div>
            <p className={styles.body}>
              No summary stored for this item yet. Headlines come from{" "}
              <code className={styles.inlineCode}>GET /api/v1/news/feed</code>.
            </p>
          </JarvisCard>
        )}
      </div>
    );
  }

  return (
    <div className={`${styles.page} screenEnter`}>
      <div className={styles.toolbar}>
        <h2 className={styles.h2}>News feed</h2>
        <div className={styles.toolbarRight}>
          {filtered.length > 0 && !allVisibleMarked ? (
            <JarvisButton
              type="button"
              variant="outline"
              label="Mark all"
              onClick={markAllVisible}
            />
          ) : null}
          {markedCount > 0 ? (
            <JarvisButton
              type="button"
              variant="primary"
              label={deleting ? "Deleting…" : `Delete selected (${markedCount})`}
              onClick={() => void deleteSelected()}
            />
          ) : null}
          {sourceOptions.length > 1 ? (
            <SegmentedControl
              aria-label="Filter by source"
              compact
              items={sourceOptions.map((c) => ({ id: c, label: c }))}
              value={filter}
              onChange={setFilter}
            />
          ) : null}
        </div>
      </div>
      {deleteErr ? <JarvisInlineError title="Delete failed" message={deleteErr} /> : null}
      {filtered.length === 0 ? (
        <JarvisCard className={styles.block} hover={false}>
          <p className={styles.body}>
            {items.length === 0
              ? "No articles returned from the feed yet. When the backend seeds or ingests news items, they will list here."
              : "No items match this filter."}
          </p>
        </JarvisCard>
      ) : null}
      {filtered.map((a) => (
        <JarvisCard key={a.id} hover={false} className={styles.listCard}>
          <div className={styles.cardRow}>
            <label className={styles.markWrap}>
              <input
                type="checkbox"
                checked={markedIds.has(a.id)}
                onChange={() => toggleMarked(a.id)}
                aria-label={`Select "${a.title.slice(0, 80)}"`}
              />
            </label>
            <button
              type="button"
              className={styles.cardOpenBtn}
              onClick={() => openArticle(a.id)}
            >
              <div className={styles.cardMain}>
                <div className={styles.tags}>
                  <JarvisTag label={a.source} />
                </div>
                <h3 className={styles.cardTitle}>{a.title}</h3>
                <div className={styles.cardMeta} suppressHydrationWarning>
                  {formatPublished(a.publishedAt)}
                  <RelevancePill score={a.relevanceScore} />
                </div>
                {a.relevanceExplanation ? (
                  <p className={styles.cardSummary}>{a.relevanceExplanation}</p>
                ) : null}
              </div>
            </button>
            <div className={styles.cardActions}>
              <button
                type="button"
                className={styles.saveBtn}
                title={savedIds.has(a.id) ? "Saved" : "Save article"}
                onClick={(e) => { e.stopPropagation(); handleSave(a.id); }}
                style={{
                  background: "none",
                  border: `1px solid ${savedIds.has(a.id) ? "var(--accent)" : "var(--color-border)"}`,
                  borderRadius: "var(--radius-sm)",
                  color: savedIds.has(a.id) ? "var(--accent)" : "var(--color-text-muted)",
                  cursor: "pointer",
                  fontFamily: "var(--font-sans)",
                }}
              >
                {savedIds.has(a.id) ? "✓ Saved" : "Save"}
              </button>
              <button
                type="button"
                className={styles.saveBtn}
                title="Dismiss article"
                onClick={(e) => { e.stopPropagation(); handleDismiss(a.id); }}
                style={{
                  background: "none",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-sm)",
                  color: "var(--color-text-muted)",
                  cursor: "pointer",
                  fontFamily: "var(--font-sans)",
                }}
              >
                Dismiss
              </button>
            </div>
          </div>
        </JarvisCard>
      ))}
    </div>
  );
}
