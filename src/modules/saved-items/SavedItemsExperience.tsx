"use client";

import { useMemo, useState } from "react";
import { JarvisButton } from "@/components/jarvis/JarvisButton";
import { JarvisCard } from "@/components/jarvis/JarvisCard";
import { JarvisTag } from "@/components/jarvis/JarvisTag";
import styles from "./saved-experience.module.css";

type Item = {
  id: number;
  type: string;
  title: string;
  date: string;
  tags: string[];
};

const ITEMS: Item[] = [
  { id: 1, type: "Article", title: "EU AI Act Implementation: What Changes in Q3 2026", date: "Apr 23", tags: ["Policy"] },
  { id: 2, type: "Session", title: "The Alignment Problem — Learning Session", date: "Apr 15", tags: ["AI", "Ethics"] },
  { id: 3, type: "Note", title: "Key frameworks: Consequentialism vs Deontology", date: "Apr 18", tags: ["Philosophy"] },
  { id: 4, type: "Topic", title: "Quantum Computing Fundamentals", date: "Apr 20", tags: ["Quantum"] },
  { id: 5, type: "Resource", title: "Russell: Human Compatible (Annotations)", date: "Apr 12", tags: ["Books"] },
];

const TYPES = ["All", "Article", "Session", "Note", "Topic", "Resource"];

export function SavedItemsExperience() {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [removed, setRemoved] = useState<number[]>([]);

  const visible = useMemo(
    () =>
      ITEMS.filter(
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
        {TYPES.map((t) => (
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
