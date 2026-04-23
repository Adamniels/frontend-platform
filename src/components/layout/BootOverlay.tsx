"use client";

import { useEffect, useState } from "react";
import styles from "./BootOverlay.module.css";

export function BootOverlay() {
  const [visible, setVisible] = useState(true);
  const [opacity, setOpacity] = useState(1);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let p = 0;
    const iv = window.setInterval(() => {
      p += Math.random() * 22 + 8;
      const next = Math.min(p, 95);
      setProgress(next);
      if (p >= 95) {
        window.clearInterval(iv);
        window.setTimeout(() => {
          setProgress(100);
          window.setTimeout(() => {
            setOpacity(0);
            window.setTimeout(() => setVisible(false), 400);
          }, 300);
        }, 200);
      }
    }, 300);
    return () => window.clearInterval(iv);
  }, []);

  if (!visible) return null;

  return (
    <div className={styles.overlay} style={{ opacity }}>
      <svg className={styles.svg} width="64" height="64" viewBox="0 0 64 64" aria-hidden>
        <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(0,212,255,0.15)" strokeWidth="2" />
        <circle
          className={styles.spin}
          cx="32"
          cy="32"
          r="28"
          fill="none"
          stroke="#00d4ff"
          strokeWidth="2"
          strokeDasharray="40 136"
        />
        <circle cx="32" cy="32" r="6" fill="#00d4ff" opacity="0.9" />
      </svg>
      <div className={styles.label}>INITIALIZING</div>
      <div className={styles.barWrap}>
        <div className={styles.bar} style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}
