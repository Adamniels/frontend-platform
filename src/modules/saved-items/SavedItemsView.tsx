import type { SavedItemSummary } from "@/types/content";
import { Card, CardBody } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { StatusBadge } from "@/components/ui/StatusBadge";
import styles from "./saved-items.module.css";

type SavedItemsViewProps = { items: SavedItemSummary[] } | { error: unknown };

function kindLabel(kind: SavedItemSummary["kind"]): string {
  if (kind === "article") return "Article";
  if (kind === "run") return "Run";
  return "Other";
}

export function SavedItemsView(props: SavedItemsViewProps) {
  if ("error" in props) {
    return (
      <>
        <SectionHeader title="Saved items" description="Saved items and history (placeholder)." />
        <ErrorState error={props.error} />
      </>
    );
  }

  if (props.items.length === 0) {
    return (
      <>
        <SectionHeader title="Saved items" description="Saved items and history (placeholder)." />
        <EmptyState title="Nothing saved" description="Saved artifacts will show up here." />
      </>
    );
  }

  return (
    <>
      <SectionHeader title="Saved items" description="Saved items and history (placeholder)." />
      <ul className={styles.list}>
        {props.items.map((item) => (
          <li key={item.id}>
            <Card>
              <CardBody>
                <div className={styles.row}>
                  <p className={styles.title}>{item.title}</p>
                  <StatusBadge label={kindLabel(item.kind)} tone="neutral" />
                </div>
                <p className={styles.meta}>Saved {new Date(item.savedAt).toLocaleString()}</p>
              </CardBody>
            </Card>
          </li>
        ))}
      </ul>
    </>
  );
}
