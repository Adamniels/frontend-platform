import styles from "./ProgressBar.module.css";

type ProgressBarProps = {
  value: number;
  color?: string;
  label?: string;
  showVal?: boolean;
};

export function ProgressBar({
  value,
  color = "var(--accent)",
  label,
  showVal = true,
}: ProgressBarProps) {
  return (
    <div className={styles.root}>
      {(label || showVal) && (
        <div className={styles.row}>
          {label ? <span className={styles.label}>{label}</span> : <span />}
          {showVal ? (
            <span className={styles.val} style={{ color }}>
              {value}%
            </span>
          ) : null}
        </div>
      )}
      <div className={styles.track}>
        <div
          className={styles.fill}
          style={{
            width: `${Math.min(100, Math.max(0, value))}%`,
            background: `linear-gradient(90deg, color-mix(in srgb, ${color} 60%, #7c5cbf), ${color})`,
            boxShadow: `0 0 8px color-mix(in srgb, ${color} 50%, transparent)`,
          }}
        />
      </div>
    </div>
  );
}
