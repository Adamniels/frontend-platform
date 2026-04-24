"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { DashboardSummary } from "@/types/dashboard";
import { JarvisCard } from "@/components/jarvis/JarvisCard";
import { JarvisInlineError } from "@/components/jarvis/JarvisInlineError";
import { JarvisTag } from "@/components/jarvis/JarvisTag";
import { ProgressBar } from "@/components/jarvis/ProgressBar";
import styles from "./dashboard-jarvis.module.css";

type DashboardClientProps = { summary: DashboardSummary } | { loadError: string };

export function DashboardClient(props: DashboardClientProps) {
  const router = useRouter();
  const [greeting] = useState(() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  });

  const summary = "summary" in props ? props.summary : null;

  const streakNote = useMemo(() => {
    if (!summary) return null;
    return (
      <>
        You&apos;re on a <strong className={styles.strong}>{summary.activeRuns} active runs.</strong>
        <br />
        {summary.itemsNeedingAttention > 0 ? (
          <>
            <strong className={styles.strong}>{summary.itemsNeedingAttention}</strong> item(s) need attention.
          </>
        ) : (
          <>Nothing urgent right now.</>
        )}
      </>
    );
  }, [summary]);

  const [dismissed, setDismissed] = useState<number[]>([]);

  if ("loadError" in props) {
    return (
      <div className={styles.errorPage}>
        <JarvisInlineError title="Dashboard" message={props.loadError} />
      </div>
    );
  }

  return (
    <div className={`${styles.root} screenEnter`}>
      <div className={styles.headerRow}>
        <div>
          <div className={styles.greet}>{greeting.toUpperCase()}, OPERATOR</div>
          <h1 className={styles.headline}>
            OVERVIEW<span className={styles.cursor}>_</span>
          </h1>
          <p className={styles.sub}>{streakNote}</p>
        </div>
        <div className={styles.scoreBlock}>
          <div className={styles.scoreLabel}>PERSONALIZATION SCORE</div>
          <div className={styles.score}>94%</div>
        </div>
      </div>

      <div className={styles.gridTwo}>
        <JarvisCard onClick={() => router.push("/news")} className={styles.click}>
          <div className={styles.meta}>TODAY · 3 NEW ARTICLES</div>
          <h3 className={styles.cardTitle}>Daily brief ready</h3>
          <p className={styles.cardBody}>
            AI regulation frameworks advance in the EU, quantum breakthroughs at MIT, and agentic systems reshape
            enterprise workflows.
          </p>
          <div className={styles.tags}>
            <JarvisTag label="AI Policy" />
            <JarvisTag label="Quantum" />
            <JarvisTag label="Agents" color="#ff9500" />
          </div>
        </JarvisCard>
        <JarvisCard onClick={() => router.push("/side-learning")} className={styles.click}>
          <div className={styles.meta}>PAUSED · 62% COMPLETE</div>
          <h3 className={styles.cardTitleAmber}>AI Ethics in Practice</h3>
          <p className={styles.cardBody}>You left off at the exercise section. Estimated 12 min to complete.</p>
          <ProgressBar value={62} color="#ff9500" />
        </JarvisCard>
      </div>

      <div className={styles.gridFour}>
        {[
          ["Sessions", summary?.activeRuns ?? 24, "var(--accent)", ""],
          ["Articles", 187, "var(--accent)", ""],
          ["Saved", summary?.savedItems ?? 43, "#ff9500", ""],
          ["Streak", 12, "#00ff88", "d"],
        ].map(([label, value, color, unit]) => (
          <JarvisCard key={label}>
            <div className={styles.statLabel}>{label}</div>
            <div className={styles.statValue} style={{ color: color as string }}>
              {value}
              <span>{unit}</span>
            </div>
          </JarvisCard>
        ))}
      </div>

      <div className={styles.gridTwo}>
        <JarvisCard>
          <div className={styles.meta}>PROGRESS</div>
          <div className={styles.stack}>
            <ProgressBar label="Weekly Learning" value={68} />
            <ProgressBar label="Topic Mastery: AI Ethics" value={82} />
            <ProgressBar label="Reading Streak" value={45} />
          </div>
        </JarvisCard>
        <JarvisCard>
          <div className={styles.meta}>QUICK ACTIONS</div>
          <div className={styles.quickGrid}>
            {[
              ["Daily Brief", "/news"],
              ["Start Session", "/side-learning"],
              ["View Saved", "/saved-items"],
              ["My Insights", "/insights"],
            ].map(([label, href]) => (
              <button key={label} type="button" className={styles.quickBtn} onClick={() => router.push(href)}>
                {label}
              </button>
            ))}
          </div>
        </JarvisCard>
      </div>

      {[{ id: 1, text: "Rate your last AI Ethics session", type: "RATING", urgent: true }].map((item) =>
        dismissed.includes(item.id) ? null : (
          <JarvisCard key={item.id}>
            <div className={styles.inputRow}>
              <div className={styles.inputLeft}>
                <JarvisTag label={item.type} color={item.urgent ? "#ff9500" : "var(--accent)"} />
                <span>{item.text}</span>
              </div>
              <div className={styles.actions}>
                <button type="button" onClick={() => router.push("/input-needed")}>
                  Act
                </button>
                <button type="button" onClick={() => setDismissed((d) => [...d, item.id])}>
                  Skip
                </button>
              </div>
            </div>
          </JarvisCard>
        ),
      )}
    </div>
  );
}
