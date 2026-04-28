"use client";

import { useRouter } from "next/navigation";
import { AuroraBackground } from "@/components/jarvis/AuroraBackground";
import { ChatBar } from "@/components/jarvis/ChatBar";
import { JarvisButton } from "@/components/jarvis/JarvisButton";
import { JarvisIcon } from "@/components/jarvis/JarvisIcon";
import { ProgressRing } from "@/components/jarvis/ProgressRing";
import { QuickActions } from "@/components/jarvis/QuickActions";
import { MOCK_ACTIVE_SESSION } from "./start-mock";
import styles from "./start-screen.module.css";

export function StartScreen() {
  const router = useRouter();
  const greeting = new Date().getHours() < 12 ? "Good morning" : new Date().getHours() < 17 ? "Good afternoon" : "Good evening";

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
              You&apos;re on a <strong>12 day streak.</strong>
              <br />
              Keep the momentum going.
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
            <div className={styles.sessionLabel}>Continue Session</div>
            {/* TODO: wire to active session from GET /api/v1/side-learning/topics */}
            <div className={styles.sessionCard}>
              <ProgressRing value={MOCK_ACTIVE_SESSION.progress} size={110} stroke={8} />
              <div className={styles.sessionCenter}>
                <div className={styles.sessionTitle}>{MOCK_ACTIVE_SESSION.title}</div>
                <p className={styles.sessionMeta}>
                  You left off at the exercise section.
                  <br />
                  Estimated <strong>{MOCK_ACTIVE_SESSION.estimatedMinutes} min</strong> to complete.
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
