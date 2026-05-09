"use client";

import { useMemo, useState } from "react";
import type { SavedItemSummary } from "@/types/content";
import { JarvisCard } from "@/components/jarvis/JarvisCard";
import { JarvisInlineError } from "@/components/jarvis/JarvisInlineError";
import { JarvisTag } from "@/components/jarvis/JarvisTag";
import { SegmentedControl } from "@/components/jarvis/SegmentedControl";
import styles from "./saved-experience.module.css";

const NO_ITEMS: SavedItemSummary[] = [];

function kindLabel(kind: SavedItemSummary["kind"]): string {
  if (kind === "article") return "Article";
  if (kind === "run") return "Run";
  return "Other";
}

function formatSavedAt(iso: string): string {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
  } catch {
    return iso;
  }
}

type SavedItemsViewProps = { items: SavedItemSummary[] } | { loadError: string };

export function SavedItemsView(props: SavedItemsViewProps) {
  const items = "items" in props ? props.items : NO_ITEMS;
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  const typeTabs = useMemo(() => {
    const kinds = [...new Set(items.map((i) => i.kind))];
    const labels = kinds.map((k) => kindLabel(k));
    return ["All", ...labels.sort((a, b) => a.localeCompare(b))];
  }, [items]);

  const visible = useMemo(() => {
    return items.filter((i) => {
      const label = kindLabel(i.kind);
      const matchesFilter = filter === "All" || label === filter;
      const q = search.trim().toLowerCase();
      const matchesSearch = !q || i.title.toLowerCase().includes(q);
      return matchesFilter && matchesSearch;
    });
  }, [items, filter, search]);

  if ("loadError" in props) {
    return (
      <div className={styles.page}>
        <JarvisInlineError title="Saved library" message={props.loadError} />
      </div>
    );
  }

  return (
    <div className={`${styles.page} screenEnter`}>
      <div className={styles.toolbar}>
        <h2 className={styles.h2}>Saved library</h2>
        <input
          className={styles.search}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title…"
          aria-label="Search saved"
        />
        {typeTabs.length > 1 ? (
          <SegmentedControl
            aria-label="Filter by type"
            compact
            items={typeTabs.map((t) => ({ id: t, label: t }))}
            value={filter}
            onChange={setFilter}
          />
        ) : null}
      </div>
      {visible.length === 0 ? (
        <div className={styles.empty}>
          {items.length === 0
            ? "Nothing saved yet. Items will appear here when the backend returns saved entries from GET /api/v1/saved-items."
            : "No items match your search or filter."}
        </div>
      ) : null}
      {visible.map((item) => (
        <JarvisCard key={item.id} className={styles.card} hover={false}>
          <div className={styles.row}>
            <div className={styles.main}>
              <div className={styles.tags}>
                <JarvisTag label={kindLabel(item.kind)} />
                <span className={styles.date}>{formatSavedAt(item.savedAt)}</span>
              </div>
              <div className={styles.title}>{item.title}</div>
            </div>
          </div>
        </JarvisCard>
      ))}
      {items.length > 0 ? (
        <p className={styles.hint}>
          Removing items from the library requires a delete action on the API; that is not wired in this UI yet.
        </p>
      ) : null}
    </div>
  );
}
