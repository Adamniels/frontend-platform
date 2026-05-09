"use client";

import { useMemo, useState } from "react";
import type { NewsItemSummary } from "@/types/content";
import { JarvisCard } from "@/components/jarvis/JarvisCard";
import { JarvisInlineError } from "@/components/jarvis/JarvisInlineError";
import { JarvisTag } from "@/components/jarvis/JarvisTag";
import { SegmentedControl } from "@/components/jarvis/SegmentedControl";
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
  const items = "items" in props ? props.items : NO_ITEMS;
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState("All");

  const sourceOptions = useMemo(() => {
    const sources = [...new Set(items.map((i) => i.source).filter(Boolean))].sort();
    return ["All", ...sources];
  }, [items]);

  const filtered = useMemo(() => {
    if (filter === "All") return items;
    return items.filter((i) => i.source === filter);
  }, [items, filter]);

  const selected = selectedId ? items.find((i) => i.id === selectedId) : null;

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
        <JarvisCard className={`${styles.block} ${styles.relevanceBlock}`} hover={false}>
          <div className={styles.relevanceLabel}>Article body</div>
          <p className={styles.body}>
            Full article text is not stored in the platform API yet. This screen shows headlines and metadata from{" "}
            <code className={styles.inlineCode}>GET /api/v1/news/feed</code>. When article content is available, it will
            appear here.
          </p>
        </JarvisCard>
      </div>
    );
  }

  return (
    <div className={`${styles.page} screenEnter`}>
      <div className={styles.toolbar}>
        <h2 className={styles.h2}>News feed</h2>
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
        <JarvisCard key={a.id} onClick={() => setSelectedId(a.id)} className={styles.listCard}>
          <div className={styles.cardRow}>
            <div className={styles.cardMain}>
              <div className={styles.tags}>
                <JarvisTag label={a.source} />
              </div>
              <h3 className={styles.cardTitle}>{a.title}</h3>
              <div className={styles.cardMeta}>{formatPublished(a.publishedAt)}</div>
            </div>
          </div>
        </JarvisCard>
      ))}
    </div>
  );
}
