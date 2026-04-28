// TODO: replace MOCK_INPUT_ITEMS with live items from GET /api/v1/human-input/items
export type MockInputItem = {
  id: number;
  text: string;
  type: string;
  urgent: boolean;
};

export const MOCK_INPUT_ITEMS: MockInputItem[] = [
  { id: 1, text: "Rate your last AI Ethics session", type: "RATING", urgent: true },
];

// TODO: replace with active session from GET /api/v1/side-learning/topics
export type MockSessionCard = {
  title: string;
  progress: number;
  estimatedMinutes: number;
};

export const MOCK_SESSION_CARD: MockSessionCard = {
  title: "AI Ethics in Practice",
  progress: 62,
  estimatedMinutes: 12,
};

export type MockProgressMetric = {
  label: string;
  value: number;
};

// TODO: replace with progress metrics from dashboard stats endpoint
export const MOCK_PROGRESS_METRICS: MockProgressMetric[] = [
  { label: "Weekly Learning", value: 68 },
  { label: "Topic Mastery: AI Ethics", value: 82 },
  { label: "Reading Streak", value: 45 },
];

export type MockQuickAction = {
  label: string;
  href: string;
};

export const MOCK_QUICK_ACTIONS: MockQuickAction[] = [
  { label: "Daily Brief", href: "/news" },
  { label: "Start Session", href: "/side-learning" },
  { label: "View Saved", href: "/saved-items" },
  { label: "My Insights", href: "/insights" },
];
