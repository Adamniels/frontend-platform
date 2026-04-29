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
    : "LOADING DATE";
  const fmtTime = time
    ? time.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      })
    : "--:--:--";

  return (
    <header className={styles.bar}>
      <div className={styles.left}>
        <span className={styles.title}>{title}</span>
        {subtitle ? (
          <span className={styles.sub}>
            <span className={styles.sep} aria-hidden>
              {"// "}
            </span>
            {subtitle}
          </span>
        ) : null}
      </div>
      <div className={styles.right}>
        <span className={styles.date}>{fmtDate.toUpperCase()}</span>
        <span className={styles.clock} suppressHydrationWarning>
          {fmtTime}
        </span>
        <div className={styles.telemetry} aria-hidden>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className={styles.telemetryBar} style={{ animationDuration: `${0.8 + i * 0.15}s` }} />
          ))}
        </div>
        <button type="button" className={styles.operatorBtn} aria-label="Operator status">
          <span className={styles.operatorDot} />
          OPERATOR
        </button>
        <button type="button" className={styles.bellBtn} aria-label="Notifications" onClick={onNotificationsClick}>
          <JarvisIcon name="bell" size={15} color="var(--color-text-muted)" />
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
