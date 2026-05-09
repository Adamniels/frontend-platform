"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AccessGateProvider, useAccessGate } from "./AccessGateProvider";
import { BootOverlay } from "./BootOverlay";
import { MainNav } from "./MainNav";
import { PendingInputProvider } from "./PendingInputContext";
import { SearchOverlay } from "./SearchOverlay";
import { TopBar } from "./TopBar";
import { UnlockOverlay } from "./UnlockOverlay";
import { BrandLogo } from "./BrandLogo";
import { JarvisTag } from "@/components/jarvis/JarvisTag";
import { MOCK_NOTIFICATIONS } from "./layout-mock";
import { applyAccentToDocument, readStoredAccent } from "@/lib/theme/accent";
import { applyBrightnessToDocument, readStoredBrightness } from "@/lib/theme/brightness";
import {
  applyHexGridToDocument,
  applyScanlinesToDocument,
  readStoredHexGrid,
  readStoredScanlines,
} from "@/lib/theme/display";
import styles from "./AppShell.module.css";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <AccessGateProvider>
      <AppShellFrame>{children}</AppShellFrame>
    </AccessGateProvider>
  );
}

function AppShellFrame({ children }: AppShellProps) {
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const { status, unlockError, unlock, lock, bootRunId, completeBoot } = useAccessGate();
  useEffect(() => {
    const stored = readStoredAccent();
    if (stored) applyAccentToDocument(stored);
    const b = readStoredBrightness();
    if (b !== null) applyBrightnessToDocument(b);
    applyScanlinesToDocument(readStoredScanlines());
    applyHexGridToDocument(readStoredHexGrid());
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((v) => !v);
        setNotificationsOpen(false);
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
        setNotificationsOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <PendingInputProvider>
      {status === "booting" ? (
        <BootOverlay key={bootRunId} onComplete={completeBoot} />
      ) : null}
      <div className={styles.shell}>
        <div className={styles.hexGrid} aria-hidden />
        <div className={styles.scanlines} aria-hidden />
        <aside className={styles.sidebar} aria-label="Primary">
          <div className={styles.logoRow}>
            <BrandLogo />
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
          <TopBar
            onNotificationsClick={() => setNotificationsOpen((v) => !v)}
            onLockClick={() => {
              setNotificationsOpen(false);
              setSearchOpen(false);
              void lock();
            }}
            lockDisabled={status === "checking" || status === "unlocking"}
          />
          <div className={styles.content}>{children}</div>
        </div>
        {notificationsOpen ? (
          <aside className={styles.notifications}>
            <div className={styles.notificationsHead}>
              <span>Notifications</span>
              <button type="button" onClick={() => setNotificationsOpen(false)} aria-label="Close notifications">
                ×
              </button>
            </div>
            <div className={styles.notificationsBody}>
              {/* TODO: replace with GET /api/v1/notifications — using mock data until endpoint exists */}
              {MOCK_NOTIFICATIONS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={styles.notificationCard}
                  onClick={() => {
                    setNotificationsOpen(false);
                    router.push("/input-needed");
                  }}
                >
                  <div className={styles.notificationMeta}>
                    <JarvisTag label={item.type} />
                    <span>{item.time}</span>
                  </div>
                  <p>{item.text}</p>
                </button>
              ))}
            </div>
          </aside>
        ) : null}
      </div>
      {status === "checking" || status === "locked" || status === "unlocking" ? (
        <UnlockOverlay
          checking={status === "checking"}
          unlocking={status === "unlocking"}
          error={unlockError}
          onUnlock={unlock}
        />
      ) : null}
      <SearchOverlay
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelect={(type) => {
          setSearchOpen(false);
          if (type === "Session") router.push("/side-learning");
          else if (type === "Article") router.push("/news");
          else if (type === "Topic") router.push("/insights");
          else if (type === "Memory") router.push("/memory");
          else router.push("/saved-items");
        }}
      />
    </PendingInputProvider>
  );
}

function JarvisChevron() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M9 18l6-6-6-6"
        stroke="var(--color-sidebar-text-dim)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
