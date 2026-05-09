import styles from "./memory-center.module.css";

type MemorySectionHeaderProps = {
  title: string;
  description?: string;
};

/** Sub-route title + optional lead; matches Stats/Insights intro rhythm. */
export function MemorySectionHeader({ title, description }: MemorySectionHeaderProps) {
  return (
    <header className={styles.sectionIntro}>
      <h3 className={styles.sectionH3}>{title}</h3>
      {description ? <p className={styles.sectionLead}>{description}</p> : null}
    </header>
  );
}
