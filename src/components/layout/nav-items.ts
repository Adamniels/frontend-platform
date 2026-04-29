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

export const sidebarPrimaryNav: SidebarNavLink[] = [
  { kind: "link", href: "/dashboard", label: "Dashboard", icon: "dashboard" },
  { kind: "link", href: "/jarvis", label: "Jarvis", icon: "jarvis", indent: true },
  { kind: "link", href: "/news", label: "News", icon: "news" },
  { kind: "link", href: "/side-learning", label: "Learn", icon: "learn" },
  { kind: "link", href: "/saved-items", label: "Saved", icon: "saved" },
  { kind: "link", href: "/insights", label: "Insights", icon: "insights" },
  { kind: "link", href: "/memory", label: "Memory", icon: "brain" },
  { kind: "link", href: "/profile", label: "Profile", icon: "profile" },
  { kind: "link", href: "/stats", label: "Stats", icon: "stats", indent: true },
  { kind: "link", href: "/workflow-runs", label: "Workflow runs", icon: "workflow" },
];

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
