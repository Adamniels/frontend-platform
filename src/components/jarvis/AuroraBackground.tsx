import styles from "./AuroraBackground.module.css";

/** Fixed particle layout for stable SSR hydration. */
const PARTICLES = [
  { left: 28, top: 12, w: 2, h: 2, hue: 0, delay: 0, dur: 4 },
  { left: 35, top: 45, w: 1.5, h: 2.5, hue: 1, delay: 0.5, dur: 5 },
  { left: 42, top: 22, w: 2, h: 1.5, hue: 2, delay: 1, dur: 3.5 },
  { left: 48, top: 68, w: 1, h: 2, hue: 0, delay: 1.2, dur: 6 },
  { left: 55, top: 35, w: 2.5, h: 2, hue: 1, delay: 0.3, dur: 4.5 },
  { left: 62, top: 8, w: 1.5, h: 1.5, hue: 2, delay: 2, dur: 5.5 },
  { left: 30, top: 55, w: 2, h: 2, hue: 1, delay: 0.8, dur: 4 },
  { left: 38, top: 78, w: 1, h: 1, hue: 0, delay: 1.5, dur: 7 },
  { left: 52, top: 48, w: 2, h: 2.5, hue: 2, delay: 0.2, dur: 3.8 },
  { left: 58, top: 15, w: 1.5, h: 2, hue: 0, delay: 2.5, dur: 5 },
  { left: 44, top: 62, w: 2, h: 1, hue: 1, delay: 1.1, dur: 4.2 },
  { left: 33, top: 30, w: 1, h: 2, hue: 2, delay: 0.6, dur: 6.5 },
  { left: 60, top: 72, w: 2, h: 2, hue: 0, delay: 1.8, dur: 4.8 },
  { left: 40, top: 5, w: 1.5, h: 1.5, hue: 1, delay: 0.4, dur: 5.2 },
  { left: 50, top: 88, w: 2, h: 1.5, hue: 2, delay: 2.2, dur: 3.2 },
  { left: 36, top: 40, w: 1, h: 1.5, hue: 0, delay: 1.4, dur: 5.8 },
  { left: 54, top: 58, w: 2.5, h: 1, hue: 1, delay: 0.9, dur: 4.4 },
  { left: 47, top: 25, w: 1.5, h: 2, hue: 2, delay: 2.1, dur: 6.2 },
];

export function AuroraBackground() {
  return (
    <div className={styles.root} aria-hidden>
      <div className={styles.base} />
      <div className={styles.blob1} />
      <div className={styles.blob2} />
      <div className={styles.streak1} />
      <div className={styles.streak2} />
      {PARTICLES.map((p, i) => (
        <div
          key={i}
          className={styles.particle}
          style={{
            width: p.w,
            height: p.h,
            left: `${p.left}%`,
            top: `${p.top}%`,
            animationDuration: `${p.dur}s`,
            animationDelay: `${p.delay}s`,
            background:
              p.hue % 3 === 0
                ? "rgba(120,180,255,0.8)"
                : p.hue % 3 === 1
                  ? "rgba(180,120,255,0.6)"
                  : "rgba(0,220,255,0.7)",
            boxShadow: "0 0 4px rgba(120,180,255,0.6)",
          }}
        />
      ))}
    </div>
  );
}
