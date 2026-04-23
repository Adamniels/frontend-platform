import type { WorkflowRunSummary } from "@/types/workflow";
import { getWorkflowRuns } from "./api/get-workflow-runs";
import { WorkflowRunsView } from "./WorkflowRunsView";

export async function WorkflowRunsScreen() {
  let runs: WorkflowRunSummary[] | undefined;
  let error: unknown;

  try {
    runs = await getWorkflowRuns();
  } catch (caught) {
    error = caught;
  }

  if (error !== undefined) {
    return <WorkflowRunsView error={error} />;
  }

  if (runs === undefined) {
    return <WorkflowRunsView error={new Error("Missing workflow runs data")} />;
  }

  return <WorkflowRunsView runs={runs} />;
}
