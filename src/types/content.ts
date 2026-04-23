export type NewsItemSummary = {
  id: string;
  title: string;
  source: string;
  publishedAt: string;
};

export type SideLearningTopic = {
  id: string;
  title: string;
  progressPercent: number;
};

export type SavedItemSummary = {
  id: string;
  title: string;
  kind: "article" | "run" | "other";
  savedAt: string;
};
