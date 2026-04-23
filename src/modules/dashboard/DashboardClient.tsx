"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { DashboardSummary } from "@/types/dashboard";
import { AuroraBackground } from "@/components/jarvis/AuroraBackground";
import { ChatBar } from "@/components/jarvis/ChatBar";
import { JarvisButton } from "@/components/jarvis/JarvisButton";
import { ProgressRing } from "@/components/jarvis/ProgressRing";
import { QuickActions } from "@/components/jarvis/QuickActions";
import { JarvisIcon } from "@/components/jarvis/JarvisIcon";
import styles from "./dashboard-jarvis.module.css";

type DashboardClientProps = { summary: DashboardSummary } | { error: unknown };

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

  if ("error" in props) {
    return (
      <div className={styles.errorPage}>
        <p>Could not load dashboard.</p>
      </div>
    );
  }

  return (
    <div className={`${styles.root} screenEnter`}>
      <AuroraBackground />
      <div className={styles.top}>
        <div className={styles.heroRow}>
          <div className={styles.heroText}>
            <div className={styles.greet}>
              {greeting}, Operator
            </div>
            <h1 className={styles.headline}>
              Let&apos;s continue
              <br />
              <span className={styles.accent}>building.</span>
            </h1>
            <p className={styles.sub}>{streakNote}</p>
            <JarvisButton
              label="View recent insights"
              variant="ghost"
              onClick={() => router.push("/insights")}
              icon={<JarvisIcon name="arrow" size={15} color="rgba(232,237,248,0.45)" />}
              className={styles.cta}
              style={{ flexDirection: "row-reverse" }}
            />
          </div>
          <div className={styles.sessionCol}>
            <div className={styles.sessionLabel}>Continue session</div>
            <div className={styles.sessionCard}>
              <ProgressRing value={82} size={110} stroke={8} />
              <div className={styles.sessionCenter}>
                <div className={styles.sessionTitle}>AI Ethics in Practice</div>
                <p className={styles.sessionMeta}>
                  You left off at the exercise section.
                  <br />
                  Estimated <strong className={styles.strong}>12 min</strong> to complete.
                </p>
              </div>
              <JarvisButton
                label="Resume session"
                variant="ghost"
                onClick={() => router.push("/side-learning")}
                icon={<JarvisIcon name="chevron" size={14} color="rgba(232,237,248,0.45)" />}
                className={styles.resume}
                style={{ width: "100%", justifyContent: "center", flexDirection: "row-reverse" }}
              />
            </div>
          </div>
        </div>
      </div>
      <div className={styles.spacer} />
      <div className={styles.bottom}>
        <ChatBar onSubmit={() => router.push("/news")} />
        <QuickActions />
      </div>
    </div>
  );
}
