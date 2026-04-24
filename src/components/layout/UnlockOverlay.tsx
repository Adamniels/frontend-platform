"use client";

import { FormEvent, useState } from "react";
import styles from "./UnlockOverlay.module.css";

type UnlockOverlayProps = {
  checking: boolean;
  unlocking: boolean;
  error: string | null;
  onUnlock: (accessKey: string) => Promise<void>;
};

export function UnlockOverlay({
  checking,
  unlocking,
  error,
  onUnlock,
}: UnlockOverlayProps) {
  const [accessKey, setAccessKey] = useState("");

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = accessKey.trim();
    if (!trimmed) return;
    await onUnlock(trimmed);
    setAccessKey("");
  };

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="Unlock platform">
      <div className={styles.panel}>
        <h2 className={styles.title}>{checking ? "Checking session…" : "Unlock Platform"}</h2>
        <p className={styles.subtitle}>
          {checking
            ? "Verifying secure access."
            : "Enter your access key to continue."}
        </p>
        <form className={styles.form} onSubmit={onSubmit}>
          <label className={styles.label} htmlFor="unlock-key">
            Access key
          </label>
          <input
            id="unlock-key"
            type="password"
            autoComplete="off"
            value={accessKey}
            onChange={(event) => setAccessKey(event.target.value)}
            disabled={checking || unlocking}
            className={styles.input}
            placeholder="Enter access key"
          />
          {error ? <p className={styles.error}>{error}</p> : null}
          <button
            type="submit"
            disabled={checking || unlocking || accessKey.trim().length === 0}
            className={styles.button}
          >
            {unlocking ? "Unlocking…" : "Unlock"}
          </button>
        </form>
      </div>
    </div>
  );
}

