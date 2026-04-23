import type { WorkflowRunSummary } from "@/types/workflow";
import { delay } from "./delay";

export async function fetchWorkflowRuns(): Promise<WorkflowRunSummary[]> {
  await delay(100);
  return [
    {
      id: "wr1",
      name: "News intelligence",
      status: "running",
      updatedAt: new Date().toISOString(),
    },
    {
      id: "wr2",
      name: "Side learning enrichment",
      status: "needs_input",
      updatedAt: new Date().toISOString(),
    },
  ];
}
