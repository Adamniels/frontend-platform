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
