"use client";

import type { StatsPayload } from "@/lib/api/adapters/stats";
import { JarvisCard } from "@/components/jarvis/JarvisCard";
import { JarvisInlineError } from "@/components/jarvis/JarvisInlineError";
import { ProgressBar } from "@/components/jarvis/ProgressBar";
import styles from "./stats.module.css";

type StatsViewProps = { data: StatsPayload } | { loadError: string };

export function StatsView(props: StatsViewProps) {
  if ("loadError" in props) {
    return (
      <div className={styles.page}>
        <JarvisInlineError title="Stats" message={props.loadError} />
      </div>
    );
  }

  const { tiles, progress, activity } = props.data;
  const maxSessions = Math.max(...activity.map((a) => a.sessions), 1);

  return (
    <div className={`${styles.page} screenEnter`}>
      <div className={styles.intro}>
        <h2 className={styles.h2}>Stats</h2>
        <p className={styles.lead}>Your learning activity and progress at a glance.</p>
      </div>

      <div className={styles.grid4}>
        {tiles.map((s) => (
          <JarvisCard key={s.label} className={styles.tile}>
            <div className={styles.tileLabel}>{s.label}</div>
            <div className={styles.tileValue} style={{ color: s.color }}>
              {s.value}
              <span className={styles.tileUnit}>{s.unit}</span>
            </div>
            <div className={styles.tileSub}>{s.sub}</div>
          </JarvisCard>
        ))}
      </div>

      <div className={styles.grid2}>
        <JarvisCard>
          <div className={styles.sectionTitle}>Progress tracking</div>
          <div className={styles.progressStack}>
            {progress.map((p) => (
              <ProgressBar key={p.label} label={p.label} value={p.value} color={p.color} />
            ))}
          </div>
        </JarvisCard>
        <JarvisCard>
          <div className={styles.sectionTitle}>Weekly activity</div>
          <div className={styles.chart}>
            {activity.map((a) => (
              <div key={a.day} className={styles.barCol}>
                <div
                  className={styles.barFill}
                  style={{
                    height: a.sessions === 0 ? 4 : `${(a.sessions / maxSessions) * 90}%`,
                    opacity: a.sessions === 0 ? 0.35 : 1,
                  }}
                />
                <div className={styles.barDay}>{a.day}</div>
              </div>
            ))}
          </div>
        </JarvisCard>
      </div>
    </div>
  );
}
