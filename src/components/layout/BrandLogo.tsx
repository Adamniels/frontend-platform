"use client";

import styles from "./BrandLogo.module.css";

export function BrandLogo() {
  const chars = "HELM".split("");
  return (
    <div className={styles.logoWrap}>
      <div className={styles.logoScaler}>
        <div className={styles.logoCanvas}>
        <div className={`${styles.bracket} ${styles.bracketTl}`} />
        <div className={`${styles.bracket} ${styles.bracketTr}`} />
        <div className={`${styles.bracket} ${styles.bracketBl}`} />
        <div className={`${styles.bracket} ${styles.bracketBr}`} />

        <div className={`${styles.pip} ${styles.pipTl}`} />
        <div className={`${styles.pip} ${styles.pipTr}`} />
        <div className={`${styles.pip} ${styles.pipBl}`} />
        <div className={`${styles.pip} ${styles.pipBr}`} />

        <div className={styles.iconWrap} aria-hidden>
          <svg className={styles.iconSvg} viewBox="0 0 80 80">
            <polygon className={styles.pulseOct} points="40,6 58,12 72,27 72,53 58,68 40,74 22,68 8,53 8,27 22,12" />
            <polygon className={styles.octOuter} points="40,7 57,13 71,27 71,53 57,67 40,73 23,67 9,53 9,27 23,13" />

            <line className={styles.tick} style={{ animationDelay: "0.9s" }} x1="40" y1="2" x2="40" y2="7" />
            <line className={styles.tick} style={{ animationDelay: "0.95s" }} x1="40" y1="73" x2="40" y2="78" />
            <line className={styles.tick} style={{ animationDelay: "1s" }} x1="2" y1="40" x2="7" y2="40" />
            <line className={styles.tick} style={{ animationDelay: "1.05s" }} x1="73" y1="40" x2="78" y2="40" />
            <line className={styles.tick} style={{ animationDelay: "1.1s" }} x1="11" y1="11" x2="15" y2="15" />
            <line className={styles.tick} style={{ animationDelay: "1.15s" }} x1="65" y1="11" x2="69" y2="15" />
            <line className={styles.tick} style={{ animationDelay: "1.2s" }} x1="11" y1="69" x2="15" y2="65" />
            <line className={styles.tick} style={{ animationDelay: "1.25s" }} x1="65" y1="69" x2="69" y2="65" />

            <circle className={styles.arcRing} cx="40" cy="40" r="24" />
            <circle className={styles.arcRing2} cx="40" cy="40" r="30" />
            <circle className={styles.arcRing3} cx="40" cy="40" r="20" />
            <line className={styles.crosshair} x1="40" y1="18" x2="40" y2="62" />
            <line className={styles.crosshair} x1="18" y1="40" x2="62" y2="40" />
            <polygon className={styles.innerDiamond} points="40,20 56,40 40,56 24,40" />
            <circle className={styles.orbitDot} cx="40" cy="40" r="2.5" />
            <circle className={styles.orbitDot2} cx="40" cy="40" r="1.9" />
            <circle className={styles.orbitDot3} cx="40" cy="40" r="1.5" />
            <circle className={styles.sparkDot1} cx="20" cy="26" r="1.2" />
            <circle className={styles.sparkDot2} cx="60" cy="54" r="1.1" />
            <circle className={styles.centerDot} cx="40" cy="40" r="3.5" />
          </svg>
        </div>

        <div className={styles.textBlock}>
          <div className={styles.logoName}>
            <span className={styles.glitchWrap} data-text="HELM">
              {chars.map((char, idx) => (
                <span
                  key={`${char}-${idx}`}
                  className={styles.char}
                  style={{ animationDelay: `${0.9 + idx * 0.1}s` }}
                >
                  {char}
                </span>
              ))}
            </span>
          </div>
          <div className={styles.logoSub}>
            <div className={styles.subLine} />
            <span className={styles.subText}>Personal OS</span>
            <div className={styles.subDot} />
          </div>
        </div>

        <div className={styles.dataLine} aria-hidden>
          <div className={styles.dataDot} />
        </div>
      </div>
      </div>
    </div>
  );
}
