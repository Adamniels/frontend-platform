"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MOCK_ACTIVE_SESSION, MOCK_QUICK_ACTIONS } from "./jarvis-mock";
import { ProgressRing } from "@/components/jarvis/ProgressRing";
import { JarvisIcon } from "@/components/jarvis/JarvisIcon";
import styles from "./jarvis-screen.module.css";

export function JarvisScreen() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [ringValue, setRingValue] = useState(0);

  useEffect(() => {
    const timer = window.setTimeout(() => setRingValue(MOCK_ACTIVE_SESSION.progress), 500);
    return () => window.clearTimeout(timer);
  }, []);

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
      <div className={styles.inner}>
        <div className={styles.hero}>
          <div className={styles.heroText}>
            <h1 className={styles.headline}>
              <span className={styles.hl1}>Let&apos;s continue</span>
              <span className={styles.hl2Wrap}>
                <span className={styles.hl2}>building.</span>
                <span className={styles.hlCursor}>█</span>
              </span>
            </h1>
            <p className={styles.sub}>
              You&apos;re on a <strong>12 day streak.</strong>
              <br />
              Keep the momentum going.
            </p>
            <button type="button" className={styles.cta} onClick={() => router.push("/insights")}>
              View recent insights
              <JarvisIcon name="arrow" size={13} color="currentColor" />
            </button>
          </div>
          <div className={styles.sessionCol}>
            <div className={styles.sessionLabel}>Continue Session</div>
            <div className={styles.sessionCard}>
              <div className={styles.sessionBorder} />
              <div className={styles.sessionBorderMask} />
              <div className={styles.sessionContent}>
                <ProgressRing value={ringValue} size={110} stroke={8} />
                <div className={styles.sessionCenter}>
                  <div className={styles.sessionTitle}>{MOCK_ACTIVE_SESSION.title}</div>
                  <p className={styles.sessionMeta}>
                    You left off at the exercise section.
                    <br />
                    Estimated <strong>{MOCK_ACTIVE_SESSION.estimatedMinutes} min</strong> to complete.
                  </p>
                </div>
                <button type="button" className={styles.resumeBtn} onClick={() => router.push("/side-learning")}>
                  Resume session
                  <JarvisIcon name="chevron" size={12} color="currentColor" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.spacer} />

        <div className={styles.bottom}>
          <div className={styles.chat}>
            <div className={styles.chatSpark}>
              <JarvisIcon name="sparkle" size={16} color="var(--accent)" />
            </div>
            <input
              className={styles.chatInput}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="How can I help you today?"
              aria-label="Jarvis prompt"
            />
            <div className={styles.chatActions}>
              <button type="button" className={styles.chatAct}>
                <JarvisIcon name="attach" size={12} color="currentColor" />
                Attach
              </button>
              <button type="button" className={styles.chatAct}>
                <JarvisIcon name="mic" size={12} color="currentColor" />
                Voice
              </button>
              <button type="button" className={`${styles.chatSend} ${prompt.trim() ? styles.chatSendOn : ""}`}>
                <JarvisIcon name="send" size={12} color={prompt.trim() ? "#000" : "rgba(232,237,248,0.4)"} />
              </button>
            </div>
          </div>

          <div className={styles.quick}>
            {MOCK_QUICK_ACTIONS.map((action) => (
              <button key={action.label} type="button" className={styles.quickBtn} onClick={() => router.push(action.href)}>
                <span className={styles.quickLeft}>
                  <JarvisIcon name={action.icon} size={12} color="var(--accent)" />
                  {action.label}
                </span>
                <JarvisIcon name="chevron" size={10} color="var(--color-text-dim)" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
