import styles from "./TopBar.module.css";

export function TopBar() {
  return (
    <header className={styles.bar}>
      <div className={styles.inner}>
        <span className={styles.title}>frontend-platform</span>
      </div>
    </header>
  );
}
