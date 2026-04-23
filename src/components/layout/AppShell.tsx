import type { ReactNode } from "react";
import { MainNav } from "./MainNav";
import { TopBar } from "./TopBar";
import styles from "./AppShell.module.css";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar} aria-label="Primary">
        <div className={styles.brand}>Platform</div>
        <MainNav />
      </aside>
      <div className={styles.mainColumn}>
        <TopBar />
        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
}
