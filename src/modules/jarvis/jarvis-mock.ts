// TODO: replace with active session from GET /api/v1/side-learning/topics
export type MockActiveSession = {
  title: string;
  progress: number;
  estimatedMinutes: number;
};

export const MOCK_ACTIVE_SESSION: MockActiveSession = {
  title: "AI Ethics in Practice",
  progress: 82,
  estimatedMinutes: 12,
};

export type MockQuickAction = {
  label: string;
  href: string;
  icon: "news" | "brain" | "dashboard" | "saved";
};

export const MOCK_QUICK_ACTIONS: MockQuickAction[] = [
  { label: "Summarize latest AI news", href: "/news", icon: "news" },
  { label: "Explain quantum computing", href: "/side-learning", icon: "brain" },
  { label: "Plan my learning path", href: "/side-learning", icon: "dashboard" },
  { label: "Analyze a document", href: "/saved-items", icon: "saved" },
];
