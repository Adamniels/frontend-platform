"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { JarvisTag } from "@/components/jarvis/JarvisTag";
import styles from "./SearchOverlay.module.css";

type Hit = { type: string; title: string };

const ALL: Hit[] = [
  { type: "Article", title: "EU AI Act Implementation" },
  { type: "Session", title: "AI Ethics in Practice" },
  { type: "Note", title: "Consequentialism vs Deontology" },
  { type: "Topic", title: "Quantum Computing Fundamentals" },
  { type: "Article", title: "Memory-Augmented LLMs" },
];

type SearchOverlayProps = {
  open: boolean;
  onClose: () => void;
};

export function SearchOverlay({ open, onClose }: SearchOverlayProps) {
  const [q, setQ] = useState("");

  const results = useMemo(
    () => (q.length > 1 ? ALL.filter((r) => r.title.toLowerCase().includes(q.toLowerCase())) : []),
    [q],
  );

  const close = useCallback(() => {
    setQ("");
    onClose();
  }, [onClose]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    if (open) window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, close]);

  if (!open) return null;

  return (
    <div className={styles.backdrop} onClick={close} role="presentation">
      <div className={styles.panel} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal>
        <input
          autoFocus
          className={styles.input}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search..."
          aria-label="Search"
        />
        <div className={styles.results}>
          {results.map((r, i) => (
            <div key={`${r.title}-${i}`} className={styles.row}>
              <JarvisTag label={r.type} />
              <span className={styles.title}>{r.title}</span>
            </div>
          ))}
        </div>
        {q.length > 1 && results.length === 0 ? (
          <div className={styles.empty}>No results for &quot;{q}&quot;</div>
        ) : null}
        <div className={styles.hint}>Press Esc to close · Enter to search</div>
      </div>
    </div>
  );
}
