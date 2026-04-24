import type { ReactNode } from "react";
import { formatLoadError } from "@/lib/utils/error-message";
import styles from "./JarvisInlineError.module.css";

type JarvisInlineErrorProps = {
  /** When set, shown as body text (overrides `error`). */
  message?: string;
  error?: unknown;
  title?: string;
  action?: ReactNode;
};

export function JarvisInlineError({
  message,
  error,
  title = "Could not load",
  action,
}: JarvisInlineErrorProps) {
  const body = message ?? (error !== undefined ? formatLoadError(error) : "Something went wrong.");
  return (
    <div className={styles.wrap} role="alert">
      <p className={styles.title}>{title}</p>
      <p className={styles.message}>{body}</p>
      {action ? <div className={styles.action}>{action}</div> : null}
    </div>
  );
}
