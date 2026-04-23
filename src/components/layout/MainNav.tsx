"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { JarvisIcon } from "@/components/jarvis/JarvisIcon";
import { sidebarBottomNav, sidebarPrimaryNav } from "./nav-items";
import { usePendingInputCount } from "./PendingInputContext";
import styles from "./MainNav.module.css";

type MainNavProps = {
  onSearchClick: () => void;
};

export function MainNav({ onSearchClick }: MainNavProps) {
  const pathname = usePathname();
  const { count: pendingCount } = usePendingInputCount();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      <nav className={styles.primary} aria-label="Main navigation">
        {sidebarPrimaryNav.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={active ? styles.navLinkActive : styles.navLink}
              style={{ paddingLeft: item.indent ? 28 : 12 }}
              aria-current={active ? "page" : undefined}
            >
              <JarvisIcon
                name={item.icon}
                size={17}
                color={active ? "var(--accent)" : "currentColor"}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className={styles.spacer} />

      <div className={styles.bottom}>
        {sidebarBottomNav.map((item) => {
          if (item.kind === "action") {
            return (
              <button
                key={item.id}
                type="button"
                className={styles.navLink}
                onClick={onSearchClick}
              >
                <JarvisIcon name={item.icon} size={17} color="currentColor" />
                {item.label}
              </button>
            );
          }

          const active = isActive(item.href);
          const badge = item.showPendingBadge ? pendingCount : 0;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={active ? styles.navLinkActive : styles.navLink}
              aria-current={active ? "page" : undefined}
            >
              <JarvisIcon
                name={item.icon}
                size={17}
                color={active ? "var(--accent)" : "currentColor"}
              />
              {item.label}
              {badge > 0 ? <span className={styles.badge}>{badge}</span> : null}
            </Link>
          );
        })}
      </div>
    </>
  );
}
