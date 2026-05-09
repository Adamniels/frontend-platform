"use client";

import styles from "./BrandLogo.module.css";

export function BrandLogo() {
  return (
    <div className={styles.brand}>
      <div className={styles.title}>Platform</div>
      <div className={styles.subtitle}>Admin</div>
    </div>
  );
}
