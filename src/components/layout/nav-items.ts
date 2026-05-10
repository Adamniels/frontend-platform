import type { IconName } from "@/components/jarvis/icon-paths";

export type SidebarNavLink = {
  kind: "link";
  href: string;
  label: string;
  icon: IconName;
  indent?: boolean;
};

export type SidebarNavAction = {
  kind: "action";
  id: "search";
  label: string;
  icon: IconName;
};

export type SidebarNavBottomLink = {
  kind: "link";
  href: string;
  label: string;
  icon: IconName;
  showPendingBadge?: boolean;
};

export type SidebarNavSection = {
  heading: string;
  items: SidebarNavLink[];
};

export const sidebarPrimarySections: SidebarNavSection[] = [
  {
    heading: "Home",
    items: [
      { kind: "link", href: "/dashboard", label: "Dashboard", icon: "dashboard" },
      { kind: "link", href: "/jarvis", label: "Jarvis", icon: "jarvis" },
    ],
  },
  {
    heading: "Content",
    items: [
      { kind: "link", href: "/news", label: "News", icon: "news" },
      { kind: "link", href: "/side-learning", label: "Learn", icon: "learn" },
      { kind: "link", href: "/saved-items", label: "Saved", icon: "saved" },
      { kind: "link", href: "/insights", label: "Insights", icon: "insights" },
    ],
  },
  {
    heading: "Personal",
    items: [
      { kind: "link", href: "/profile", label: "Profile", icon: "profile" },
      { kind: "link", href: "/stats", label: "Stats", icon: "stats" },
      { kind: "link", href: "/memory", label: "Memory", icon: "brain" },
    ],
  },
  {
    heading: "Operations",
    items: [
      { kind: "link", href: "/workflow-runs", label: "Workflow runs", icon: "workflow" },
    ],
  },
];

/** Flat list of primary nav links (same order as sections). */
export const sidebarPrimaryNav: SidebarNavLink[] = sidebarPrimarySections.flatMap((s) => s.items);

export const sidebarBottomNav: (SidebarNavBottomLink | SidebarNavAction)[] = [
  {
    kind: "link",
    href: "/input-needed",
    label: "Input needed",
    icon: "bell",
    showPendingBadge: true,
  },
  { kind: "action", id: "search", label: "Search", icon: "search" },
  { kind: "link", href: "/settings", label: "Settings", icon: "settings" },
];
