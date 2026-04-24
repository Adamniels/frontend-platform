export type DashboardSummary = {
  greeting: string;
  activeRuns: number;
  itemsNeedingAttention: number;
  /** Optional count for dashboard tiles; omit if API does not return it yet. */
  savedItems?: number;
};
