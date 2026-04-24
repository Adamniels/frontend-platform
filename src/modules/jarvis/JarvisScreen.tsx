"use client";

import { useRouter } from "next/navigation";
import { ChatBar } from "@/components/jarvis/ChatBar";
import { JarvisButton } from "@/components/jarvis/JarvisButton";
import { JarvisCard } from "@/components/jarvis/JarvisCard";
import { JarvisIcon } from "@/components/jarvis/JarvisIcon";
import { ProgressRing } from "@/components/jarvis/ProgressRing";
import { QuickActions } from "@/components/jarvis/QuickActions";
import styles from "./jarvis-screen.module.css";

export function JarvisScreen() {
  const router = useRouter();
  const greeting = new Date().getHours() < 12 ? "Good morning" : new Date().getHours() < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className={`${styles.root} screenEnter`}>
      <div className={styles.bgLayer} aria-hidden>
        <div className={styles.bgGlowA} />
        <div className={styles.bgGlowB} />
        <div className={styles.bgBeamA} />
        <div className={styles.bgBeamB} />
        <div className={styles.bgNoise} />
        <div className={styles.bgScanBar} />
      </div>
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
            <JarvisCard hover={false} className={styles.sessionCard}>
              <ProgressRing value={82} size={110} stroke={8} />
              <div className={styles.sessionCenter}>
                <div className={styles.sessionTitle}>AI Ethics in Practice</div>
                <p className={styles.sessionMeta}>
                  You left off at the exercise section.
                  <br />
                  Estimated <strong>12 min</strong> to complete.
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
            </JarvisCard>
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
