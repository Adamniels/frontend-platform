"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { animate, stagger } from "animejs";
import { prefersReducedMotion } from "@/lib/anime/motion";
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
  const titleRef = useRef<HTMLSpanElement>(null);
  const telemetryRef = useRef<HTMLDivElement>(null);
  const isFirstMount = useRef(true);

  useEffect(() => {
    const bootstrap = window.setTimeout(() => setTime(new Date()), 0);
    const t = window.setInterval(() => setTime(new Date()), 1000);
    return () => {
      window.clearTimeout(bootstrap);
      window.clearInterval(t);
    };
  }, []);

  // Telemetry bars animate in on mount
  useEffect(() => {
    if (prefersReducedMotion() || !telemetryRef.current) return;
    const bars = telemetryRef.current.querySelectorAll<HTMLElement>("[data-bar]");
    animate(bars, {
      scaleY: [0, 1],
      opacity: [0, 1],
      duration: 450,
      ease: "outExpo",
      delay: stagger(65, { start: 300 }),
    });
  }, []);

  // Title scan-in on route change
  useEffect(() => {
    if (prefersReducedMotion() || !titleRef.current) return;
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    animate(titleRef.current, {
      opacity: [0, 1],
      letterSpacing: ["10px", "3px"],
      duration: 300,
      ease: "outExpo",
    });
  }, [pathname]);

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
        <span ref={titleRef} className={styles.title}>{title}</span>
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
        <div ref={telemetryRef} className={styles.telemetry} aria-hidden>
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              data-bar
              className={styles.telemetryBar}
              style={{ animationDuration: `${0.8 + i * 0.15}s` }}
            />
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
