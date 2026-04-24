import type { WorkflowRunSummary } from "@/types/workflow";
import { apiRequest } from "@/lib/api/client";

export async function fetchWorkflowRuns(): Promise<WorkflowRunSummary[]> {
  return apiRequest<WorkflowRunSummary[]>("/api/v1/workflow-runs");
}
