import { cn } from "@/lib/utils/cn";
import type { WorkflowRunStatus } from "@/types/workflow";
import styles from "./StatusBadge.module.css";

export type BadgeTone = "neutral" | "info" | "success" | "warning" | "danger";

const toneClass: Record<BadgeTone, string> = {
  neutral: styles.tone_neutral,
  info: styles.tone_info,
  success: styles.tone_success,
  warning: styles.tone_warning,
  danger: styles.tone_danger,
};

type StatusBadgeProps = {
  label: string;
  tone?: BadgeTone;
  className?: string;
};

export function StatusBadge({ label, tone = "neutral", className }: StatusBadgeProps) {
  return <span className={cn(styles.badge, toneClass[tone], className)}>{label}</span>;
}

const workflowTone: Record<WorkflowRunStatus, BadgeTone> = {
  pending: "neutral",
  running: "info",
  needs_input: "warning",
  completed: "success",
  failed: "danger",
};

const workflowLabel: Record<WorkflowRunStatus, string> = {
  pending: "Pending",
  running: "Running",
  needs_input: "Needs input",
  completed: "Completed",
  failed: "Failed",
};

export function WorkflowStatusBadge({ status }: { status: WorkflowRunStatus }) {
  return (
    <StatusBadge label={workflowLabel[status]} tone={workflowTone[status]} />
  );
}
