"use client";

import styles from "./settings-experience.module.css";

type SettingsToggleProps = {
  on: boolean;
  onChange: (v: boolean) => void;
};

export function SettingsToggle({ on, onChange }: SettingsToggleProps) {
  return (
    <button
      type="button"
      className={on ? styles.toggleOn : styles.toggleOff}
      onClick={() => onChange(!on)}
      aria-pressed={on}
    >
      <span className={styles.toggleKnob} />
    </button>
  );
}
