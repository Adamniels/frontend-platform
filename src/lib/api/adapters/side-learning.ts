import type {
  CreateSideLearningSessionResponse,
  SideLearningSessionDetail,
  SideLearningSessionSummary,
} from "@/types/content";
import { apiRequest } from "@/lib/api/client";

const readCache = { next: { revalidate: 30 } as const };

export async function fetchSideLearningSessions(): Promise<SideLearningSessionSummary[]> {
  return apiRequest<SideLearningSessionSummary[]>("/api/v1/side-learning/sessions", readCache);
}

/** Client-friendly list fetch without ISR `next` hints (avoids keyed cache surprises in the browser). */
export async function fetchSideLearningSessionsForUser(): Promise<SideLearningSessionSummary[]> {
  return apiRequest<SideLearningSessionSummary[]>("/api/v1/side-learning/sessions", { cache: "no-store" });
}

export async function createSideLearningSession(body: {
  initialPrompt?: string | null;
}): Promise<CreateSideLearningSessionResponse> {
  return apiRequest<CreateSideLearningSessionResponse>("/api/v1/side-learning/sessions", {
    method: "POST",
    body: { initialPrompt: body.initialPrompt ?? undefined },
    cache: "no-store",
  });
}

export async function getSideLearningSession(sessionId: string): Promise<SideLearningSessionDetail> {
  const id = encodeURIComponent(sessionId);
  return apiRequest<SideLearningSessionDetail>(`/api/v1/side-learning/sessions/${id}`, { cache: "no-store" });
}

export async function selectSideLearningTopic(
  sessionId: string,
  body: { topicTitle: string; feedback?: string | null },
): Promise<void> {
  const id = encodeURIComponent(sessionId);
  await apiRequest<unknown>(`/api/v1/side-learning/sessions/${id}/select-topic`, {
    method: "POST",
    body: { topicTitle: body.topicTitle, feedback: body.feedback ?? undefined },
    cache: "no-store",
  });
}

export async function refreshSideLearningTopicProposals(
  sessionId: string,
  body: { feedback?: string | null },
): Promise<void> {
  const id = encodeURIComponent(sessionId);
  await apiRequest<unknown>(`/api/v1/side-learning/sessions/${id}/refresh-topic-proposals`, {
    method: "POST",
    body: { feedback: body.feedback ?? undefined },
    cache: "no-store",
  });
}

export async function updateSideLearningProgress(
  sessionId: string,
  body: { sectionId: string; completed: boolean },
): Promise<void> {
  const id = encodeURIComponent(sessionId);
  await apiRequest<unknown>(`/api/v1/side-learning/sessions/${id}/progress`, {
    method: "POST",
    body: { sectionId: body.sectionId, completed: body.completed },
    cache: "no-store",
  });
}

export async function submitSideLearningReflection(
  sessionId: string,
  body: { reflection: string },
): Promise<void> {
  const id = encodeURIComponent(sessionId);
  await apiRequest<unknown>(`/api/v1/side-learning/sessions/${id}/reflect`, {
    method: "POST",
    body: { reflection: body.reflection },
    cache: "no-store",
  });
}
