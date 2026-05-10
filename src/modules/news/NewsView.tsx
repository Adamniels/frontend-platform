"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { NewsItemSummary } from "@/types/content";
import { JarvisButton } from "@/components/jarvis/JarvisButton";
import { JarvisCard } from "@/components/jarvis/JarvisCard";
import { JarvisInlineError } from "@/components/jarvis/JarvisInlineError";
import { JarvisTag } from "@/components/jarvis/JarvisTag";
import { SegmentedControl } from "@/components/jarvis/SegmentedControl";
import { deleteNewsItems } from "@/lib/api/adapters/news";
import { formatLoadError } from "@/lib/utils/error-message";
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

type NewsViewProps = { items: NewsItemSummary[] } | { loadError: string };

export function NewsView(props: NewsViewProps) {
  const router = useRouter();
  const items = "items" in props ? props.items : NO_ITEMS;
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState("All");
  const [markedIds, setMarkedIds] = useState<Set<string>>(() => new Set());
  const [deleteErr, setDeleteErr] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const sourceOptions = useMemo(() => {
    const sources = [...new Set(items.map((i) => i.source).filter(Boolean))].sort();
    return ["All", ...sources];
  }, [items]);

  const filtered = useMemo(() => {
    if (filter === "All") return items;
    return items.filter((i) => i.source === filter);
  }, [items, filter]);

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
    return (
      <div className={`${styles.page} screenEnter`}>
        <button type="button" className={styles.back} onClick={() => setSelectedId(null)}>
          ← Back to feed
        </button>
        <JarvisCard className={styles.block} hover={false}>
          <div className={styles.tags}>
            <JarvisTag label={selected.source} />
          </div>
          <h2 className={styles.title}>{selected.title}</h2>
          <div className={styles.meta}>{formatPublished(selected.publishedAt)}</div>
        </JarvisCard>
        {selected.body ? (
          <JarvisCard className={`${styles.block} ${styles.relevanceBlock}`} hover={false}>
            <div className={styles.relevanceLabel}>Summary</div>
            <p className={styles.body}>{selected.body}</p>
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
                aria-label={`Select “${a.title.slice(0, 80)}”`}
              />
            </label>
            <button
              type="button"
              className={styles.cardOpenBtn}
              onClick={() => setSelectedId(a.id)}
            >
              <div className={styles.cardMain}>
                <div className={styles.tags}>
                  <JarvisTag label={a.source} />
                </div>
                <h3 className={styles.cardTitle}>{a.title}</h3>
                <div className={styles.cardMeta}>{formatPublished(a.publishedAt)}</div>
              </div>
            </button>
          </div>
        </JarvisCard>
      ))}
    </div>
  );
}
