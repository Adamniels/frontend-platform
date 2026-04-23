export type WorkflowRunStatus =
  | "pending"
  | "running"
  | "needs_input"
  | "completed"
  | "failed";

export type WorkflowRunSummary = {
  id: string;
  name: string;
  status: WorkflowRunStatus;
  updatedAt: string;
};
