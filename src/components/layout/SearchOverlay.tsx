"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import styles from "./SearchOverlay.module.css";

type SearchOverlayProps = {
  open: boolean;
  onClose: () => void;
};

export function SearchOverlay({ open, onClose }: SearchOverlayProps) {
  const [q, setQ] = useState("");
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

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

  const typed = q.trim().length > 0;

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
          placeholder="Search…"
          aria-label="Search query"
        />
        <div className={styles.results}>
          {typed ? (
            <div className={styles.apiMissing} role="status">
              <p className={styles.apiMissingTitle}>Search is not wired yet</p>
              <p className={styles.apiMissingBody}>
                There is no global search endpoint on <code className={styles.inlineCode}>/api/v1</code>. Use the
                sidebar to open Dashboard, News, Side learning, and other areas.
              </p>
            </div>
          ) : (
            <p className={styles.idleHint}>
              Command palette (⌘K / Ctrl+K). Results will appear here when a search API exists.
            </p>
          )}
        </div>
        <div className={styles.hint}>Press Esc to close</div>
      </div>
    </div>
  );
}
