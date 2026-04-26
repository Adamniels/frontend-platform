"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import styles from "./memory-center.module.css";

const links = [
  { href: "/memory/profile", label: "Profile" },
  { href: "/memory/learned", label: "Learned" },
  { href: "/memory/review", label: "Review" },
  { href: "/memory/timeline", label: "Timeline" },
  { href: "/memory/procedural", label: "Rules" },
] as const;

export function MemorySubNav() {
  const path = usePathname();
  return (
    <nav className={styles.subNav} aria-label="Memory sections">
      {links.map((l) => {
        const active =
          path === l.href ||
          (l.href === "/memory/learned" && path.startsWith("/memory/learned"));
        return (
          <Link
            key={l.href}
            href={l.href}
            className={cn(styles.subNavLink, active && styles.subNavLinkActive)}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
