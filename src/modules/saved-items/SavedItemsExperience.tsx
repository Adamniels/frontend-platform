"use client";

import { useMemo, useState } from "react";
import { JarvisButton } from "@/components/jarvis/JarvisButton";
import { JarvisCard } from "@/components/jarvis/JarvisCard";
import { JarvisTag } from "@/components/jarvis/JarvisTag";
import { MOCK_SAVED_ITEMS, MOCK_SAVED_ITEM_TYPES } from "./saved-items-mock";
import styles from "./saved-experience.module.css";

export function SavedItemsExperience() {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [removed, setRemoved] = useState<number[]>([]);

  const visible = useMemo(
    () =>
      MOCK_SAVED_ITEMS.filter(
        (i) =>
          !removed.includes(i.id) &&
          (filter === "All" || i.type === filter) &&
          (!search || i.title.toLowerCase().includes(search.toLowerCase())),
      ),
    [filter, search, removed],
  );

  return (
    <div className={`${styles.page} screenEnter`}>
      <div className={styles.toolbar}>
        <h2 className={styles.h2}>Saved library</h2>
        <input
          className={styles.search}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search…"
          aria-label="Search saved"
        />
        {MOCK_SAVED_ITEM_TYPES.map((t) => (
          <button
            key={t}
            type="button"
            className={filter === t ? styles.chipOn : styles.chip}
            onClick={() => setFilter(t)}
          >
            {t}
          </button>
        ))}
      </div>
      {visible.map((item) => (
        <JarvisCard key={item.id} className={styles.card} hover={false}>
          <div className={styles.row}>
            <div className={styles.main}>
              <div className={styles.tags}>
                <JarvisTag label={item.type} />
                {item.tags.map((t) => (
                  <JarvisTag key={t} label={t} color="var(--accent)" />
                ))}
                <span className={styles.date}>{item.date}</span>
              </div>
              <div className={styles.title}>{item.title}</div>
            </div>
            <JarvisButton
              label="Remove"
              variant="ghost"
              className={styles.remove}
              onClick={() => setRemoved((r) => [...r, item.id])}
            />
          </div>
        </JarvisCard>
      ))}
      {visible.length === 0 ? <div className={styles.empty}>No items found</div> : null}
    </div>
  );
}
