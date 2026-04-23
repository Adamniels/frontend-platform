import type { SideLearningTopic } from "@/types/content";
import { Card, CardBody } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import styles from "./side-learning.module.css";

type SideLearningViewProps = { topics: SideLearningTopic[] } | { error: unknown };

export function SideLearningView(props: SideLearningViewProps) {
  if ("error" in props) {
    return (
      <>
        <SectionHeader title="Side learning" description="Tracks and surfaces learning paths." />
        <ErrorState error={props.error} />
      </>
    );
  }

  if (props.topics.length === 0) {
    return (
      <>
        <SectionHeader title="Side learning" description="Tracks and surfaces learning paths." />
        <EmptyState title="No topics yet" description="Placeholder until workflows populate progress." />
      </>
    );
  }

  return (
    <>
      <SectionHeader title="Side learning" description="Tracks and surfaces learning paths." />
      <ul className={styles.list}>
        {props.topics.map((topic) => (
          <li key={topic.id}>
            <Card>
              <CardBody>
                <div className={styles.row}>
                  <span className={styles.title}>{topic.title}</span>
                  <span className={styles.pct}>{topic.progressPercent}%</span>
                </div>
                <div className={styles.bar} role="progressbar" aria-valuenow={topic.progressPercent} aria-valuemin={0} aria-valuemax={100}>
                  <div
                    className={styles.fill}
                    style={{ width: `${topic.progressPercent}%` }}
                  />
                </div>
              </CardBody>
            </Card>
          </li>
        ))}
      </ul>
    </>
  );
}
