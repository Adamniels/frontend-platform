"use client";

import { useState, type KeyboardEvent } from "react";
import { JarvisIcon } from "./JarvisIcon";
import styles from "./ChatBar.module.css";

type ChatBarProps = {
  onSubmit?: (value: string) => void;
};

export function ChatBar({ onSubmit }: ChatBarProps) {
  const [val, setVal] = useState("");

  const submit = () => {
    const t = val.trim();
    if (t && onSubmit) onSubmit(t);
    setVal("");
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") submit();
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.sparkle}>
        <JarvisIcon name="sparkle" size={18} color="var(--accent)" className={styles.sparkleGlow} />
      </div>
      <input
        className={styles.input}
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="How can I help you today?"
        aria-label="Chat input"
      />
      <div className={styles.actions}>
        <button type="button" className={styles.linkBtn}>
          <JarvisIcon name="attach" size={15} color="rgba(232,237,248,0.45)" />
          Attach
        </button>
        <button type="button" className={styles.linkBtn}>
          <JarvisIcon name="mic" size={15} color="rgba(232,237,248,0.45)" />
          Voice
        </button>
        <button
          type="button"
          className={val.trim() ? styles.sendActive : styles.sendIdle}
          onClick={submit}
          aria-label="Send"
        >
          <JarvisIcon name="send" size={15} color={val.trim() ? "#000" : "rgba(232,237,248,0.45)"} />
        </button>
      </div>
    </div>
  );
}
