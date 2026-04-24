export type RouteMeta = {
  title: string;
  subtitle: string;
};

const metaByPrefix: { prefix: string; meta: RouteMeta }[] = [
  { prefix: "/", meta: { title: "Start", subtitle: "mission control" } },
  { prefix: "/dashboard", meta: { title: "Dashboard", subtitle: "personalized overview" } },
  { prefix: "/jarvis", meta: { title: "Jarvis", subtitle: "classic dashboard" } },
  { prefix: "/stats", meta: { title: "Stats", subtitle: "your activity" } },
  { prefix: "/news", meta: { title: "News", subtitle: "recommended articles" } },
  { prefix: "/side-learning", meta: { title: "Learning", subtitle: "side learning module" } },
  { prefix: "/saved-items", meta: { title: "Saved", subtitle: "your library" } },
  { prefix: "/insights", meta: { title: "Insights", subtitle: "memory and patterns" } },
  { prefix: "/profile", meta: { title: "Profile", subtitle: "preferences and focus" } },
  { prefix: "/settings", meta: { title: "Settings", subtitle: "customization" } },
  { prefix: "/input-needed", meta: { title: "Input needed", subtitle: "pending actions" } },
  { prefix: "/workflow-runs", meta: { title: "Workflow runs", subtitle: "status and lifecycle" } },
];

export function getRouteMeta(pathname: string): RouteMeta {
  const path = pathname || "/";
  if (path === "/") {
    return metaByPrefix[0]!.meta;
  }
  const hit = metaByPrefix
    .filter((e) => e.prefix !== "/")
    .sort((a, b) => b.prefix.length - a.prefix.length)
    .find((e) => path === e.prefix || path.startsWith(`${e.prefix}/`));
  return hit?.meta ?? { title: "Platform", subtitle: "" };
}
