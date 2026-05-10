export type NewsItemSummary = {
  id: string;
  title: string;
  source: string;
  publishedAt: string;
  url?: string | null;
  body?: string | null;
};

export type SideLearningSessionSummary = {
  id: string;
  phase: string;
  /** Chosen topic title after selection; absent/null before the user picks a topic. */
  selectedTopicTitle?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type SideLearningListLifecycle = "ongoing" | "archive";

export type SideLearningSessionListPage = {
  items: SideLearningSessionSummary[];
};

export type CreateSideLearningSessionResponse = {
  sessionId: string;
  phase: string;
  workflowRunId: string;
};

export type SideLearningSessionDetail = {
  id: string;
  phase: string;
  initialPrompt: string | null;
  selectedTopicTitle: string | null;
  selectedTopicReason: string | null;
  topicProposalsJson: string;
  sessionContentJson: string;
  sectionsProgressJson: string;
  reflectionText: string | null;
  workflowRunId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type SideLearningTopicProposal = {
  title: string;
  rationale: string;
  estimatedMinutes: number;
  difficulty: string;
  targetSkillGap: string;
};

export type SideLearningSessionSectionParsed = {
  id: string;
  label: string;
  estimatedMinutes: number;
  type: string;
  content: string;
  example: string | null;
  youtubeQuery: string | null;
  outputType: string | null;
  prompts: string[] | null;
};

export type SavedItemSummary = {
  id: string;
  title: string;
  kind: "article" | "run" | "other";
  savedAt: string;
};
