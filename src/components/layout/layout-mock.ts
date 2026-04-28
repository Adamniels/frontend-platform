// TODO: replace with GET /api/v1/notifications when endpoint is available
export type MockNotification = {
  id: number;
  type: string;
  text: string;
  time: string;
};

export const MOCK_NOTIFICATIONS: MockNotification[] = [
  { id: 1, type: "Brief",   text: "Your daily brief is ready — 3 new articles in AI Policy.", time: "now"    },
  { id: 2, type: "Session", text: "New session available: Agentic System Design.",             time: "1h ago" },
  { id: 3, type: "Input",   text: "Workflow needs your confirmation on latest run.",            time: "2h ago" },
];
