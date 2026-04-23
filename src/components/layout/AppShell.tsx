"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { BootOverlay } from "./BootOverlay";
import { MainNav } from "./MainNav";
import { PendingInputProvider } from "./PendingInputContext";
import { SearchOverlay } from "./SearchOverlay";
import { TopBar } from "./TopBar";
import { applyAccentToDocument, readStoredAccent } from "@/lib/theme/accent";
import { applyBrightnessToDocument, readStoredBrightness } from "@/lib/theme/brightness";
import styles from "./AppShell.module.css";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const stored = readStoredAccent();
    if (stored) applyAccentToDocument(stored);
    const b = readStoredBrightness();
    if (b !== null) applyBrightnessToDocument(b);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
      if (e.key === "Escape") setSearchOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <PendingInputProvider>
      <BootOverlay />
      <div className={styles.shell}>
        <aside className={styles.sidebar} aria-label="Primary">
          <div className={styles.logoRow}>
            <div className={styles.logoOrb} aria-hidden>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12" />
              </svg>
            </div>
            <div>
              <div className={styles.logoTitle}>Platform</div>
              <div className={styles.logoSub}>AI shell</div>
            </div>
          </div>
          <MainNav onSearchClick={() => setSearchOpen(true)} />
          <div className={styles.userRow}>
            <div className={styles.avatar} aria-hidden>
              OP
            </div>
            <div className={styles.userMeta}>
              <div className={styles.userName}>Operator</div>
              <div className={styles.userPlan}>Pro Plan</div>
            </div>
            <JarvisChevron />
          </div>
        </aside>
        <div className={styles.mainColumn}>
          <TopBar />
          <div className={styles.content}>{children}</div>
        </div>
      </div>
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </PendingInputProvider>
  );
}

function JarvisChevron() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M9 18l6-6-6-6"
        stroke="rgba(232,237,248,0.25)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
