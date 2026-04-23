"use client";

import { useMemo, useState } from "react";
import type { MemoryInsight } from "@/lib/api/adapters/insights";

const NO_INSIGHTS: MemoryInsight[] = [];
import { JarvisButton } from "@/components/jarvis/JarvisButton";
import { JarvisCard } from "@/components/jarvis/JarvisCard";
import { JarvisTag } from "@/components/jarvis/JarvisTag";
import { ProgressBar } from "@/components/jarvis/ProgressBar";
import styles from "./insights.module.css";

type InsightsViewProps = { items: MemoryInsight[] } | { error: unknown };

export function InsightsView(props: InsightsViewProps) {
  const items = "items" in props ? props.items : NO_INSIGHTS;
  const [corrected, setCorrected] = useState<number[]>([]);
  const [confirmed, setConfirmed] = useState<number[]>(() =>
    items.filter((m) => m.confirmed).map((m) => m.id),
  );

  const visible = useMemo(() => items.filter((m) => !corrected.includes(m.id)), [items, corrected]);

  if ("error" in props) {
    return (
      <div className={styles.page}>
        <p className={styles.err}>Could not load insights.</p>
      </div>
    );
  }

  return (
    <div className={`${styles.page} screenEnter`}>
      <div className={styles.intro}>
        <h2 className={styles.h2}>What we know</h2>
        <p className={styles.lead}>
          The platform builds a model of your interests and habits to personalize your experience. Review and
          correct below.
        </p>
      </div>

      {visible.map((mem) => {
        const isConfirmed = confirmed.includes(mem.id);
        return (
          <JarvisCard
            key={mem.id}
            className={styles.card}
            style={{
              borderColor: isConfirmed ? undefined : "rgba(255,149,0,0.2)",
              background: isConfirmed ? undefined : "rgba(255,149,0,0.03)",
            }}
            hover={false}
          >
            <div className={styles.row}>
              <div className={styles.body}>
                <div className={styles.meta}>
                  <span
                    className={styles.kicker}
                    style={{ color: isConfirmed ? "var(--accent)" : "#ff9500" }}
                  >
                    {mem.label}
                  </span>
                  {!isConfirmed ? <JarvisTag label="Unconfirmed" color="#ff9500" /> : null}
                </div>
                <p className={styles.text}>{mem.content}</p>
                <ProgressBar
                  value={mem.strength}
                  label="Confidence"
                  color={isConfirmed ? "var(--accent)" : "#ff9500"}
                />
              </div>
              <div className={styles.actions}>
                {!isConfirmed ? (
                  <JarvisButton
                    label="Confirm"
                    variant="primary"
                    onClick={() => setConfirmed((c) => [...c, mem.id])}
                    className={styles.btnSm}
                  />
                ) : null}
                <JarvisButton
                  label="Remove"
                  variant="ghost"
                  onClick={() => setCorrected((c) => [...c, mem.id])}
                  className={styles.btnSm}
                />
              </div>
            </div>
          </JarvisCard>
        );
      })}
    </div>
  );
}
