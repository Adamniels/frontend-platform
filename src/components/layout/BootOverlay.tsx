"use client";

import { useEffect, useRef } from "react";
import { animate, createTimeline, stagger } from "animejs";
import { prefersReducedMotion } from "@/lib/anime/motion";
import styles from "./BootOverlay.module.css";

type BootOverlayProps = {
  onComplete?: () => void;
};

const BOOT_LINES = [
  "LOADING NEURAL INTERFACE...",
  "CALIBRATING USER MODEL...",
  "SYNCING KNOWLEDGE GRAPH...",
  "PERSONALIZING FEED...",
  "SYSTEM READY",
];

export function BootOverlay({ onComplete }: BootOverlayProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLDivElement>(null);
  const scanRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const lineRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const overlay = overlayRef.current;
    const counter = counterRef.current;
    const scan = scanRef.current;
    const bar = barRef.current;
    const lineEls = lineRefs.current.filter((el): el is HTMLDivElement => el !== null);

    if (!overlay || !counter || !scan || !bar || lineEls.length === 0) return;

    if (prefersReducedMotion()) {
      counter.textContent = "100%";
      bar.style.width = "100%";
      onComplete?.();
      return;
    }

    const counterState = { value: 0 };
    const totalDuration = BOOT_LINES.length * 300 + 400;

    const tl = createTimeline({
      onComplete: () => {
        animate(overlay, {
          opacity: [1, 0],
          scale: [1, 1.04],
          duration: 400,
          ease: "outExpo",
          onComplete: () => {
            onComplete?.();
          },
        });
      },
    });

    // Counter ticks 0 → 100
    tl.add(counterState, {
      value: 100,
      duration: totalDuration,
      ease: "steps(20)",
      onUpdate: () => {
        counter.textContent = `${String(Math.round(counterState.value)).padStart(3, "0")}%`;
      },
    }, 0);

    // Progress bar fills
    tl.add(bar, {
      width: ["0%", "100%"],
      duration: totalDuration,
      ease: "outCubic",
    }, 0);

    // Scan line sweeps down
    tl.add(scan, {
      translateY: ["-100%", "100vh"],
      opacity: [0, 0.8, 0.8, 0],
      duration: totalDuration,
      ease: "linear",
    }, 0);

    // Boot lines stagger in
    tl.add(lineEls, {
      opacity: [0, 1],
      translateX: [-10, 0],
      duration: 220,
      ease: "outExpo",
      delay: stagger(300, { start: 0 }),
    }, 50);

    return () => { tl.pause(); };
  }, [onComplete]);

  return (
    <div ref={overlayRef} className={styles.overlay}>
      <div ref={scanRef} className={styles.scanLine} aria-hidden />
      <svg className={styles.svg} width="80" height="80" viewBox="0 0 80 80" aria-hidden>
        <circle cx="40" cy="40" r="36" fill="none" stroke="var(--accent)" strokeWidth="1" opacity="0.2" />
        <circle
          className={styles.spin}
          cx="40"
          cy="40"
          r="26"
          fill="none"
          stroke="var(--accent)"
          strokeWidth="1"
          opacity="0.6"
          strokeDasharray="40 123"
          strokeDashoffset={0}
        />
        <circle
          className={styles.spinReverse}
          cx="40"
          cy="40"
          r="16"
          fill="none"
          stroke="var(--accent)"
          strokeWidth="0.5"
          opacity="0.4"
          strokeDasharray="20 81"
          strokeDashoffset={0}
        />
        <circle cx="40" cy="40" r="4" fill="var(--accent)" />
      </svg>
      <div className={styles.label}>INITIALIZING JARVIS</div>
      <div ref={counterRef} className={styles.counter}>000%</div>
      <div className={styles.bootSub}>
        {BOOT_LINES.map((line, i) => (
          <div
            key={line}
            ref={(el) => { lineRefs.current[i] = el; }}
          >
            {line}
          </div>
        ))}
      </div>
      <div className={styles.barWrap}>
        <div ref={barRef} className={styles.bar}>
          <span className={styles.barHead} />
        </div>
      </div>
    </div>
  );
}
