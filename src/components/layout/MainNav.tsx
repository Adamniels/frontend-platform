"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { animate, stagger } from "animejs";
import { prefersReducedMotion } from "@/lib/anime/motion";
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
  const primaryRef = useRef<HTMLElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  // Staggered entrance on first mount
  useEffect(() => {
    if (hasAnimated.current || prefersReducedMotion()) return;
    hasAnimated.current = true;

    const targets = [
      ...(primaryRef.current ? Array.from(primaryRef.current.querySelectorAll("a, button")) : []),
      ...(bottomRef.current ? Array.from(bottomRef.current.querySelectorAll("a, button")) : []),
    ];

    if (targets.length === 0) return;

    animate(targets, {
      opacity: [0, 1],
      translateX: [-12, 0],
      duration: 340,
      ease: "outExpo",
      delay: stagger(50, { start: 120 }),
    });
  }, []);

  // Active indicator scale-in when route changes
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const indicator = document.querySelector<HTMLElement>(`.${styles.activeBorder}`);
    if (!indicator) return;
    animate(indicator, {
      scaleY: [0, 1],
      duration: 300,
      ease: "outElastic(1, 0.6)",
    });
  }, [pathname]);

  return (
    <>
      <nav ref={primaryRef} className={styles.primary} aria-label="Main navigation">
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
              {active ? <span className={styles.activeBorder} aria-hidden /> : null}
              <JarvisIcon
                name={item.icon}
                size={17}
                color={active ? "var(--accent)" : "currentColor"}
              />
              {item.label}
              {active ? <span className={styles.activeDot} aria-hidden /> : null}
            </Link>
          );
        })}
      </nav>

      <div className={styles.spacer} />

      <div ref={bottomRef} className={styles.bottom}>
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
              {active ? <span className={styles.activeBorder} aria-hidden /> : null}
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
