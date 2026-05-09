"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { JarvisIcon } from "@/components/jarvis/JarvisIcon";
import { sidebarBottomNav, sidebarPrimarySections } from "./nav-items";
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
    <div className={styles.navRoot}>
      <div className={styles.primary}>
        {sidebarPrimarySections.map((section) => (
          <div key={section.heading} className={styles.section}>
            <div className={styles.sectionHeading}>{section.heading}</div>
            <nav className={styles.sectionNav} aria-label={`${section.heading} navigation`}>
              {section.items.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={active ? styles.navLinkActive : styles.navLink}
                    style={{ paddingLeft: item.indent ? 32 : 14 }}
                    aria-current={active ? "page" : undefined}
                  >
                    {active ? <span className={styles.activeBorder} aria-hidden /> : null}
                    <JarvisIcon
                      name={item.icon}
                      size={18}
                      color={active ? "var(--accent)" : "var(--color-sidebar-text-muted)"}
                    />
                    <span className={styles.navLabel}>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      <div className={styles.bottom}>
        <div className={styles.sectionHeading}>Shortcuts</div>
        {sidebarBottomNav.map((item) => {
          if (item.kind === "action") {
            return (
              <button
                key={item.id}
                type="button"
                className={styles.navLink}
                onClick={onSearchClick}
                aria-label="Open search"
              >
                <JarvisIcon name={item.icon} size={18} color="var(--color-sidebar-text-muted)" />
                <span className={styles.navLabel}>{item.label}</span>
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
              {active ? <span className={styles.activeBorder} aria-hidden /> : null}
              <JarvisIcon
                name={item.icon}
                size={18}
                color={active ? "var(--accent)" : "var(--color-sidebar-text-muted)"}
              />
              <span className={styles.navLabel}>{item.label}</span>
              {badge > 0 ? <span className={styles.badge}>{badge}</span> : null}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
