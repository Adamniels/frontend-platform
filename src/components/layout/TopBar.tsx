"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { JarvisIcon } from "@/components/jarvis/JarvisIcon";
import { getRouteMeta } from "@/lib/shell/route-meta";
import styles from "./TopBar.module.css";

type TopBarProps = {
  onNotificationsClick: () => void;
  onLockClick: () => void;
  lockDisabled?: boolean;
};

export function TopBar({ onNotificationsClick, onLockClick, lockDisabled = false }: TopBarProps) {
  const pathname = usePathname();
  const { title, subtitle } = getRouteMeta(pathname);
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    const bootstrap = window.setTimeout(() => setTime(new Date()), 0);
    const t = window.setInterval(() => setTime(new Date()), 1000);
    return () => {
      window.clearTimeout(bootstrap);
      window.clearInterval(t);
    };
  }, []);

  const fmtDate = time
    ? time.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "…";
  const fmtTime = time
    ? time.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      })
    : "—";

  const crumb = title.toUpperCase();
  const headline = subtitle.trim() ? subtitle : title;

  return (
    <header className={styles.bar}>
      <div className={styles.left}>
        <span className={styles.crumb}>{crumb}</span>
        <h1 className={styles.headline}>{headline}</h1>
      </div>
      <div className={styles.right}>
        <span className={styles.date}>{fmtDate}</span>
        <span className={styles.clock} suppressHydrationWarning>
          {fmtTime}
        </span>
        <span className={styles.statusPill} title="Operator session">
          <span className={styles.statusDot} aria-hidden />
          Online
        </span>
        <button type="button" className={styles.iconBtn} aria-label="Notifications" onClick={onNotificationsClick}>
          <JarvisIcon name="bell" size={18} color="var(--color-text-muted)" />
        </button>
        <button
          type="button"
          className={styles.lockBtn}
          onClick={onLockClick}
          disabled={lockDisabled}
          aria-label="Lock application"
        >
          Lock
        </button>
      </div>
    </header>
  );
}
