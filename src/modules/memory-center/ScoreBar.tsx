"use client";

import styles from "./memory-center.module.css";

type ScoreBarProps = {
  label: string;
  value01: number;
  hint?: string;
};

export function ScoreBar({ label, value01, hint }: ScoreBarProps) {
  const v = Math.max(0, Math.min(1, value01));
  const pct = Math.round(v * 100);
  return (
    <div className={styles.scoreBlock}>
      <div className={styles.scoreLabel}>
        <span>{label}</span>
        <span>{pct}%</span>
      </div>
      <div className={styles.barTrack} role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
        <div className={styles.barFill} style={{ width: `${pct}%` }} />
      </div>
      {hint ? <span className={styles.muted}>{hint}</span> : null}
    </div>
  );
}
