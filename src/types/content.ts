export type NewsItemSummary = {
  id: string;
  title: string;
  source: string;
  publishedAt: string;
};

export type SideLearningSessionSummary = {
  id: string;
  phase: string;
  createdAt: string;
  updatedAt: string;
};

export type SavedItemSummary = {
  id: string;
  title: string;
  kind: "article" | "run" | "other";
  savedAt: string;
};
