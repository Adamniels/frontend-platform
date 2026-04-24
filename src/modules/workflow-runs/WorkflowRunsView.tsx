import type { WorkflowRunSummary } from "@/types/workflow";
import { JarvisCard } from "@/components/jarvis/JarvisCard";
import { JarvisInlineError } from "@/components/jarvis/JarvisInlineError";
import { JarvisTag } from "@/components/jarvis/JarvisTag";
import styles from "./workflow-runs.module.css";

function statusTag(run: WorkflowRunSummary) {
  const map: Record<WorkflowRunSummary["status"], { label: string; color?: string }> = {
    pending: { label: "Pending" },
    running: { label: "Running", color: "var(--accent)" },
    needs_input: { label: "Needs input", color: "#ff9500" },
    completed: { label: "Completed", color: "#34d399" },
    failed: { label: "Failed", color: "#ef4444" },
  };
  return map[run.status];
}

type WorkflowRunsViewProps = { runs: WorkflowRunSummary[] } | { loadError: string };

export function WorkflowRunsView(props: WorkflowRunsViewProps) {
  if ("loadError" in props) {
    return (
      <div className={`${styles.page} screenEnter`}>
        <JarvisInlineError title="Workflow runs" message={props.loadError} />
      </div>
    );
  }

  if (props.runs.length === 0) {
    return (
      <div className={`${styles.page} screenEnter`}>
        <p className={styles.empty}>No runs yet. Runs will appear here once the backend tracks them.</p>
      </div>
    );
  }

  return (
    <div className={`${styles.page} screenEnter`}>
      <ul className={styles.list}>
        {props.runs.map((run) => {
          const st = statusTag(run);
          return (
            <li key={run.id}>
              <JarvisCard hover={false} className={styles.card}>
                <div className={styles.row}>
                  <div>
                    <p className={styles.name}>{run.name}</p>
                    <p className={styles.meta}>Updated {new Date(run.updatedAt).toLocaleString()}</p>
                  </div>
                  <JarvisTag label={st.label} color={st.color} />
                </div>
              </JarvisCard>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
