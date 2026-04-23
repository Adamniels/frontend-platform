import type { ReactNode } from "react";
import { isApiError } from "@/lib/api/errors";
import styles from "./ErrorState.module.css";

type ErrorStateProps = {
  error: unknown;
  title?: string;
  action?: ReactNode;
};

function messageFromUnknown(error: unknown): string {
  if (isApiError(error)) return error.message;
  if (error instanceof Error) return error.message;
  return "Something went wrong.";
}

export function ErrorState({ error, title = "Could not load", action }: ErrorStateProps) {
  return (
    <div className={styles.wrap} role="alert">
      <p className={styles.title}>{title}</p>
      <p className={styles.message}>{messageFromUnknown(error)}</p>
      {action ? <div className={styles.action}>{action}</div> : null}
    </div>
  );
}
