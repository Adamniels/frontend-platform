"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { mainNavItems } from "./nav-items";
import styles from "./MainNav.module.css";

export function MainNav() {
  const pathname = usePathname();

  return (
    <nav className={styles.nav} aria-label="Main navigation">
      <ul className={styles.list}>
        {mainNavItems.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={active ? styles.linkActive : styles.link}
                aria-current={active ? "page" : undefined}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
