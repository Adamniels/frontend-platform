export type NavItem = {
  href: string;
  label: string;
};

export const mainNavItems: NavItem[] = [
  { href: "/", label: "Dashboard" },
  { href: "/news", label: "News" },
  { href: "/side-learning", label: "Side learning" },
  { href: "/workflow-runs", label: "Workflow runs" },
  { href: "/saved-items", label: "Saved items" },
  { href: "/settings", label: "Settings" },
  { href: "/profile", label: "Profile" },
];
