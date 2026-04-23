import type { DashboardSummary } from "@/types/dashboard";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ErrorState } from "@/components/ui/ErrorState";
import styles from "./dashboard.module.css";

type DashboardViewProps = { data: DashboardSummary } | { error: unknown };

export function DashboardView(props: DashboardViewProps) {
  if ("error" in props) {
    return (
      <>
        <SectionHeader title="Dashboard" description="Overview of activity and attention." />
        <ErrorState error={props.error} />
      </>
    );
  }

  const { data } = props;

  return (
    <>
      <SectionHeader
        title="Dashboard"
        description="Overview of activity and attention."
      />
      <div className={styles.grid}>
        <Card>
          <CardHeader>Status</CardHeader>
          <CardBody>
            <p className={styles.lead}>{data.greeting}</p>
            <p className={styles.muted}>
              Placeholder data from <code>getDashboardSummary</code> until the API is wired.
            </p>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>Workflows</CardHeader>
          <CardBody>
            <p className={styles.stat}>
              <span className={styles.statValue}>{data.activeRuns}</span> active runs
            </p>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>Attention</CardHeader>
          <CardBody>
            <p className={styles.stat}>
              <span className={styles.statValue}>{data.itemsNeedingAttention}</span> items need
              input
            </p>
          </CardBody>
        </Card>
      </div>
    </>
  );
}
