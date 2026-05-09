"use client";

import { useRouter } from "next/navigation";
import { AuroraBackground } from "@/components/jarvis/AuroraBackground";
import { ChatBar } from "@/components/jarvis/ChatBar";
import { JarvisButton } from "@/components/jarvis/JarvisButton";
import { JarvisIcon } from "@/components/jarvis/JarvisIcon";
import { ProgressRing } from "@/components/jarvis/ProgressRing";
import { QuickActions } from "@/components/jarvis/QuickActions";
import type { OngoingSessionPreview } from "@/lib/side-learning/get-first-ongoing-session-preview";
import styles from "./start-screen.module.css";

export type StartViewProps = {
  ongoingSession: OngoingSessionPreview | null;
};

export function StartView({ ongoingSession }: StartViewProps) {
  const router = useRouter();
  const greeting =
    new Date().getHours() < 12
      ? "Good morning"
      : new Date().getHours() < 17
        ? "Good afternoon"
        : "Good evening";

  return (
    <div className={`${styles.root} screenEnter`}>
      <AuroraBackground />
      <div className={styles.top}>
        <div className={styles.heroRow}>
          <div className={styles.heroText}>
            <div className={styles.greet}>{greeting}, Operator</div>
            <h1 className={styles.headline}>
              Let&apos;s continue
              <br />
              <span className={styles.accent}>building.</span>
            </h1>
            <p className={styles.sub}>
              Learning streaks are <strong>not available</strong> from the API yet.
              <br />
              Use Side learning for session progress.
            </p>
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
              {ongoingSession ? (
                <>
                  <ProgressRing value={ongoingSession.progressPct} size={110} stroke={8} />
                  <div className={styles.sessionCenter}>
                    <div className={styles.sessionTitle}>{ongoingSession.title}</div>
                    <p className={styles.sessionMeta}>
                      Phase: {ongoingSession.phase}.
                      <br />
                      Estimated{" "}
                      <strong>{Math.max(ongoingSession.estimatedMinutesRemaining, 1)} min</strong> left in open
                      sections.
                    </p>
                  </div>
                  <JarvisButton
                    label="Open side learning"
                    variant="ghost"
                    onClick={() => router.push("/side-learning")}
                    icon={<JarvisIcon name="chevron" size={14} color="rgba(232,237,248,0.45)" />}
                    className={styles.resume}
                    style={{ width: "100%", justifyContent: "center", flexDirection: "row-reverse" }}
                  />
                </>
              ) : (
                <>
                  <ProgressRing value={0} size={110} stroke={8} />
                  <div className={styles.sessionCenter}>
                    <div className={styles.sessionTitle}>No ongoing session</div>
                    <p className={styles.sessionMeta}>
                      Start or resume learning from the Side learning workspace.
                    </p>
                  </div>
                  <JarvisButton
                    label="Go to side learning"
                    variant="ghost"
                    onClick={() => router.push("/side-learning")}
                    icon={<JarvisIcon name="chevron" size={14} color="rgba(232,237,248,0.45)" />}
                    className={styles.resume}
                    style={{ width: "100%", justifyContent: "center", flexDirection: "row-reverse" }}
                  />
                </>
              )}
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
