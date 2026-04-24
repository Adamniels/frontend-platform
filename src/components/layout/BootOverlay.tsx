"use client";

import { useEffect, useState } from "react";
import styles from "./BootOverlay.module.css";

type BootOverlayProps = {
  onComplete?: () => void;
};

const BOOT_LINES = [
  "LOADING NEURAL INTERFACE...",
  "CALIBRATING USER MODEL...",
  "SYNCING KNOWLEDGE GRAPH...",
  "PERSONALIZING FEED...",
  "SYSTEM READY",
];

export function BootOverlay({ onComplete }: BootOverlayProps) {
  const [visible, setVisible] = useState(true);
  const [opacity, setOpacity] = useState(1);
  const [progress, setProgress] = useState(0);
  const [lineIndex, setLineIndex] = useState(0);

  useEffect(() => {
    let i = 0;
    const completeTimer = 0;
    let fadeTimer = 0;
    let doneTimer = 0;
    const iv = window.setInterval(() => {
      if (i < BOOT_LINES.length) {
        i += 1;
        setLineIndex(i);
        setProgress((i / BOOT_LINES.length) * 100);
      } else {
        window.clearInterval(iv);
        fadeTimer = window.setTimeout(() => {
          setOpacity(0);
          doneTimer = window.setTimeout(() => {
            setVisible(false);
            onComplete?.();
          }, 420);
        }, 350);
      }
    }, 350);
    return () => {
      window.clearInterval(iv);
      window.clearTimeout(completeTimer);
      window.clearTimeout(fadeTimer);
      window.clearTimeout(doneTimer);
    };
  }, [onComplete]);

  if (!visible) return null;

  return (
    <div className={styles.overlay} style={{ opacity }}>
      <svg className={styles.svg} width="80" height="80" viewBox="0 0 80 80" aria-hidden>
        <circle cx="40" cy="40" r="36" fill="none" stroke="#00d4ff" strokeWidth="1" opacity="0.3" />
        <circle
          className={styles.spin}
          cx="40"
          cy="40"
          r="26"
          fill="none"
          stroke="#00d4ff"
          strokeWidth="1"
          opacity="0.5"
          strokeDasharray="40 123"
          strokeDashoffset={0}
        />
        <circle
          className={styles.spinReverse}
          cx="40"
          cy="40"
          r="16"
          fill="none"
          stroke="#00d4ff"
          strokeWidth="0.5"
          opacity="0.4"
          strokeDasharray="20 81"
          strokeDashoffset={0}
        />
        <circle cx="40" cy="40" r="5" fill="#00d4ff" />
      </svg>
      <div className={styles.label}>INITIALIZING JARVIS</div>
      <div className={styles.bootSub}>
        {BOOT_LINES.slice(0, lineIndex).map((line) => (
          <div key={line}>
            {line}
          </div>
        ))}
      </div>
      <div className={styles.barWrap}>
        <div className={styles.bar} style={{ width: `${progress}%` }}>
          <span className={styles.barHead} />
        </div>
      </div>
    </div>
  );
}
