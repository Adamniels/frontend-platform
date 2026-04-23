import type { WorkflowRunSummary } from "@/types/workflow";
import { Card, CardBody } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { WorkflowStatusBadge } from "@/components/ui/StatusBadge";
import styles from "./workflow-runs.module.css";

type WorkflowRunsViewProps = { runs: WorkflowRunSummary[] } | { error: unknown };

export function WorkflowRunsView(props: WorkflowRunsViewProps) {
  if ("error" in props) {
    return (
      <>
        <SectionHeader
          title="Workflow runs"
          description="Status, lifecycle, and needs-input surfaces for runs."
        />
        <ErrorState error={props.error} />
      </>
    );
  }

  if (props.runs.length === 0) {
    return (
      <>
        <SectionHeader
          title="Workflow runs"
          description="Status, lifecycle, and needs-input surfaces for runs."
        />
        <EmptyState title="No runs" description="Runs will appear here once the backend tracks them." />
      </>
    );
  }

  return (
    <>
      <SectionHeader
        title="Workflow runs"
        description="Status, lifecycle, and needs-input surfaces for runs."
      />
      <ul className={styles.list}>
        {props.runs.map((run) => (
          <li key={run.id}>
            <Card>
              <CardBody>
                <div className={styles.row}>
                  <div>
                    <p className={styles.name}>{run.name}</p>
                    <p className={styles.meta}>Updated {new Date(run.updatedAt).toLocaleString()}</p>
                  </div>
                  <WorkflowStatusBadge status={run.status} />
                </div>
              </CardBody>
            </Card>
          </li>
        ))}
      </ul>
    </>
  );
}
