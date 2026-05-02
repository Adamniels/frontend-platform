"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { animate, stagger } from "animejs";
import { prefersReducedMotion } from "@/lib/anime/motion";
import type { DashboardSummary } from "@/types/dashboard";
import { MOCK_INPUT_ITEMS, MOCK_PROGRESS_METRICS, MOCK_QUICK_ACTIONS, MOCK_SESSION_CARD } from "./dashboard-mock";
import { JarvisCard } from "@/components/jarvis/JarvisCard";
import { JarvisInlineError } from "@/components/jarvis/JarvisInlineError";
import { JarvisTag } from "@/components/jarvis/JarvisTag";
import { ProgressBar } from "@/components/jarvis/ProgressBar";
import styles from "./dashboard-jarvis.module.css";

type DashboardClientProps = { summary: DashboardSummary } | { loadError: string };

export function DashboardClient(props: DashboardClientProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [greeting] = useState(() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  });

  const summary = "summary" in props ? props.summary : null;

  // Page reveal + card stagger entrance
  useEffect(() => {
    const el = containerRef.current;
    if (!el || prefersReducedMotion()) return;

    // Scan reveal — content sweeps in from top
    animate(el, {
      clipPath: ["inset(0 0 100% 0)", "inset(0 0 0% 0)"],
      duration: 450,
      ease: "outExpo",
    });

    // Cards stagger in
    const cards = el.querySelectorAll<HTMLElement>("[data-card]");
    animate(cards, {
      opacity: [0, 1],
      translateY: [24, 0],
      duration: 520,
      ease: "outExpo",
      delay: stagger(75, { start: 120 }),
    });

    // Corner brackets lock on after cards appear
    const corners = el.querySelectorAll<HTMLElement>("[data-corner]");
    animate(corners, {
      opacity: [0, 0.65],
      scale: [1.5, 1],
      duration: 220,
      ease: "outExpo",
      delay: stagger(30, { start: 200 }),
    });
  }, []);

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
    <div ref={containerRef} className={styles.root}>
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
        {/* TODO: wire to active session from GET /api/v1/side-learning/topics */}
        <JarvisCard onClick={() => router.push("/side-learning")} className={styles.click}>
          <div className={styles.meta}>PAUSED · {MOCK_SESSION_CARD.progress}% COMPLETE</div>
          <h3 className={styles.cardTitleAmber}>{MOCK_SESSION_CARD.title}</h3>
          <p className={styles.cardBody}>You left off at the exercise section. Estimated {MOCK_SESSION_CARD.estimatedMinutes} min to complete.</p>
          <ProgressBar value={MOCK_SESSION_CARD.progress} color="#ff9500" />
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
            {MOCK_PROGRESS_METRICS.map((metric) => (
              <ProgressBar key={metric.label} label={metric.label} value={metric.value} />
            ))}
          </div>
        </JarvisCard>
        <JarvisCard>
          <div className={styles.meta}>QUICK ACTIONS</div>
          <div className={styles.quickGrid}>
            {MOCK_QUICK_ACTIONS.map((action) => (
              <button key={action.label} type="button" className={styles.quickBtn} onClick={() => router.push(action.href)}>
                {action.label}
              </button>
            ))}
          </div>
        </JarvisCard>
      </div>

      {/* TODO: replace with live items from GET /api/v1/human-input/items */}
      {MOCK_INPUT_ITEMS.map((item) =>
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
