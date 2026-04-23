import type { NewsItemSummary } from "@/types/content";
import { Card, CardBody } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import styles from "./news.module.css";

type NewsViewProps = { items: NewsItemSummary[] } | { error: unknown };

export function NewsView(props: NewsViewProps) {
  if ("error" in props) {
    return (
      <>
        <SectionHeader title="News" description="Module view for news intelligence." />
        <ErrorState error={props.error} />
      </>
    );
  }

  if (props.items.length === 0) {
    return (
      <>
        <SectionHeader title="News" description="Module view for news intelligence." />
        <EmptyState title="No items yet" description="Wire the backend feed to populate this list." />
      </>
    );
  }

  return (
    <>
      <SectionHeader title="News" description="Module view for news intelligence." />
      <ul className={styles.list}>
        {props.items.map((item) => (
          <li key={item.id}>
            <Card>
              <CardBody>
                <p className={styles.title}>{item.title}</p>
                <p className={styles.meta}>
                  {item.source} · {new Date(item.publishedAt).toLocaleString()}
                </p>
              </CardBody>
            </Card>
          </li>
        ))}
      </ul>
    </>
  );
}
