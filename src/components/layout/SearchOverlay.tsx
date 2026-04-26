"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { JarvisTag } from "@/components/jarvis/JarvisTag";
import styles from "./SearchOverlay.module.css";

type Hit = { type: string; title: string };

const ALL: Hit[] = [
  { type: "Memory", title: "Open Memory center" },
  { type: "Article", title: "EU AI Act Implementation" },
  { type: "Session", title: "AI Ethics in Practice" },
  { type: "Note", title: "Consequentialism vs Deontology" },
  { type: "Topic", title: "Quantum Computing Fundamentals" },
  { type: "Article", title: "Memory-Augmented LLMs" },
];

type SearchOverlayProps = {
  open: boolean;
  onClose: () => void;
  onSelect?: (type: string, title: string) => void;
};

export function SearchOverlay({ open, onClose, onSelect }: SearchOverlayProps) {
  const [q, setQ] = useState("");
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  const results = useMemo(
    () => (q.length > 1 ? ALL.filter((r) => r.title.toLowerCase().includes(q.toLowerCase())) : []),
    [q],
  );

  const close = useCallback(() => {
    setQ("");
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    if (!panel) return;

    const prevActive = document.activeElement as HTMLElement | null;

    const focusables = () =>
      Array.from(
        panel.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((el) => !el.hasAttribute("disabled"));

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        return;
      }
      if (e.key !== "Tab") return;
      const nodes = focusables();
      if (nodes.length === 0) return;
      const first = nodes[0]!;
      const last = nodes[nodes.length - 1]!;
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    const t = window.setTimeout(() => {
      panel.querySelector<HTMLInputElement>("input")?.focus();
    }, 0);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.clearTimeout(t);
      prevActive?.focus?.();
    };
  }, [open, close]);

  if (!open) return null;

  return (
    <div className={styles.backdrop} onClick={close} role="presentation">
      <div
        ref={panelRef}
        className={styles.panel}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <h2 id={titleId} className={styles.srOnly}>
          Search platform
        </h2>
        <input
          className={styles.input}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search..."
          aria-label="Search query"
        />
        <div className={styles.results}>
          {results.map((r, i) => (
            <button
              type="button"
              key={`${r.title}-${i}`}
              className={styles.row}
              onClick={() => {
                onSelect?.(r.type, r.title);
                close();
              }}
            >
              <JarvisTag label={r.type} />
              <span className={styles.title}>{r.title}</span>
            </button>
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
