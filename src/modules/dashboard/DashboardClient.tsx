"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { animate, stagger } from "animejs";
import { prefersReducedMotion } from "@/lib/anime/motion";
import type { InputNeededItem } from "@/lib/api/adapters/input-needed";
import type { OngoingSessionPreview } from "@/lib/side-learning/get-first-ongoing-session-preview";
import type { DashboardSummary } from "@/types/dashboard";
import { JarvisButton } from "@/components/jarvis/JarvisButton";
import { JarvisCard } from "@/components/jarvis/JarvisCard";
import { JarvisInlineError } from "@/components/jarvis/JarvisInlineError";
import { JarvisTag } from "@/components/jarvis/JarvisTag";
import { ProgressBar } from "@/components/jarvis/ProgressBar";
import styles from "./dashboard-jarvis.module.css";

const QUICK_ACTIONS = [
  { label: "News feed", href: "/news" },
  { label: "Side learning", href: "/side-learning" },
  { label: "Saved items", href: "/saved-items" },
  { label: "Insights", href: "/insights" },
] as const;

type DashboardClientProps =
  | { loadError: string }
  | {
      summary: DashboardSummary;
      inputNeededItems: InputNeededItem[];
      ongoingSession: OngoingSessionPreview | null;
      newsFeedCount: number | null;
    };

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
  const inputNeededItems = "inputNeededItems" in props ? props.inputNeededItems : [];
  const ongoingSession = "ongoingSession" in props ? props.ongoingSession : null;
  const newsFeedCount = "newsFeedCount" in props ? props.newsFeedCount : null;

  useEffect(() => {
    const el = containerRef.current;
    if (!el || prefersReducedMotion()) return;

    animate(el, {
      clipPath: ["inset(0 0 100% 0)", "inset(0 0 0% 0)"],
      duration: 450,
      ease: "outExpo",
    });

    const cards = el.querySelectorAll<HTMLElement>("[data-card]");
    animate(cards, {
      opacity: [0, 1],
      translateY: [24, 0],
      duration: 520,
      ease: "outExpo",
      delay: stagger(75, { start: 120 }),
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

  const articlesStat = newsFeedCount !== null ? String(newsFeedCount) : "—";
  const savedStat = summary?.savedItems !== undefined ? String(summary.savedItems) : "—";

  const sessionBody = ongoingSession ? (
    <>
      You have an active side-learning session. Estimated{" "}
      <strong>{Math.max(ongoingSession.estimatedMinutesRemaining, 1)} min</strong> remaining in open sections.
    </>
  ) : (
    <>Start a session from Side learning to track progress here.</>
  );

  const briefLead =
    newsFeedCount !== null
      ? `${newsFeedCount} article${newsFeedCount === 1 ? "" : "s"} in your feed from the API.`
      : "Open the news feed to load items from GET /api/v1/news/feed.";

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
          <div className={styles.scoreLabel}>PERSONALIZATION</div>
          <div className={styles.score}>N/A</div>
          <div className={styles.scoreHint}>Not exposed by the API yet.</div>
        </div>
      </div>

      <div className={styles.gridTwo}>
        <JarvisCard onClick={() => router.push("/news")} className={styles.click}>
          <div className={styles.meta}>NEWS · FROM API</div>
          <h3 className={styles.cardTitle}>News feed</h3>
          <p className={styles.cardBody}>{briefLead}</p>
          <div className={styles.tags}>
            <JarvisTag label="Open feed" />
          </div>
        </JarvisCard>
        <JarvisCard onClick={() => router.push("/side-learning")} className={styles.click}>
          <div className={styles.meta}>SIDE LEARNING · {ongoingSession ? "ONGOING" : "IDLE"}</div>
          <h3 className={styles.cardTitleAmber}>
            {ongoingSession ? ongoingSession.title : "No active session"}
          </h3>
          <p className={styles.cardBody}>{sessionBody}</p>
          {ongoingSession ? <ProgressBar value={ongoingSession.progressPct} color="#ff9500" /> : null}
        </JarvisCard>
      </div>

      <div className={styles.gridFour}>
        {[
          ["Sessions", String(summary?.activeRuns ?? 0), "var(--accent)", ""],
          ["Articles", articlesStat, "var(--accent)", ""],
          ["Saved", savedStat, "#ff9500", ""],
          ["Streak", "—", "#00ff88", ""],
        ].map(([label, value, color, unit]) => (
          <JarvisCard key={label}>
            <div className={styles.statLabel}>{label}</div>
            <div className={styles.statValue} style={{ color: color as string }}>
              {value}
              <span>{unit}</span>
            </div>
            {label === "Streak" ? (
              <div className={styles.statFootnote}>Not tracked by the API.</div>
            ) : null}
          </JarvisCard>
        ))}
      </div>

      <div className={styles.gridTwo}>
        <JarvisCard>
          <div className={styles.meta}>PROGRESS</div>
          <div className={styles.stack}>
            <p className={styles.placeholderCopy}>
              Section-level progress lives on each side-learning session. Open Side learning for the full breakdown.
            </p>
          </div>
        </JarvisCard>
        <JarvisCard>
          <div className={styles.meta}>QUICK ACTIONS</div>
          <div className={styles.quickGrid}>
            {QUICK_ACTIONS.map((action) => (
              <JarvisButton
                key={action.label}
                label={action.label}
                variant="outline"
                size="sm"
                className={styles.quickBtn}
                onClick={() => router.push(action.href)}
              />
            ))}
          </div>
        </JarvisCard>
      </div>

      {inputNeededItems.map((item) =>
        dismissed.includes(item.id) ? null : (
          <JarvisCard key={item.id}>
            <div className={styles.inputRow}>
              <div className={styles.inputLeft}>
                <JarvisTag label={item.type} color={item.urgent ? "#ff9500" : "var(--accent)"} />
                <span>{item.text}</span>
              </div>
              <div className={styles.actions}>
                <JarvisButton
                  label="Act"
                  variant="primary"
                  size="sm"
                  className={styles.actPrimary}
                  onClick={() => router.push("/input-needed")}
                />
                <JarvisButton
                  label="Skip"
                  variant="ghost"
                  size="sm"
                  className={styles.actGhost}
                  onClick={() => setDismissed((d) => [...d, item.id])}
                />
              </div>
            </div>
          </JarvisCard>
        ),
      )}
    </div>
  );
}
