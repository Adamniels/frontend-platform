"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { JarvisIcon } from "@/components/jarvis/JarvisIcon";
import { getRouteMeta } from "@/lib/shell/route-meta";
import styles from "./TopBar.module.css";
import { useAccessGate } from "./AccessGateProvider";

export function TopBar() {
  const pathname = usePathname();
  const { title, subtitle } = getRouteMeta(pathname);
  const [time, setTime] = useState(() => new Date());
  const { lock, status } = useAccessGate();

  useEffect(() => {
    const t = window.setInterval(() => setTime(new Date()), 1000);
    return () => window.clearInterval(t);
  }, []);

  const fmtDate = time.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const fmtTime = time.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

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
        <span className={styles.date}>{fmtDate}</span>
        <span className={styles.clock}>{fmtTime}</span>
        <button type="button" className={styles.bellBtn} aria-label="Notifications">
          <JarvisIcon name="bell" size={15} color="rgba(232,237,248,0.45)" />
        </button>
        <button
          type="button"
          className={styles.lockBtn}
          onClick={() => void lock()}
          disabled={status === "checking" || status === "unlocking"}
          aria-label="Lock application"
        >
          Lock
        </button>
      </div>
    </header>
  );
}
