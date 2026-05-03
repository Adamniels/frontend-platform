import type {
  CreateSideLearningSessionResponse,
  SideLearningListLifecycle,
  SideLearningSessionDetail,
  SideLearningSessionListPage,
  SideLearningSessionSummary,
} from "@/types/content";
import { apiRequest } from "@/lib/api/client";

/** @deprecated Prefer fetchSideLearningSessionsByLifecycle — list API requires `lifecycle`. */
export async function fetchSideLearningSessions(): Promise<SideLearningSessionSummary[]> {
  const page = await fetchSideLearningSessionsByLifecycle("ongoing", { next: { revalidate: 30 } });
  return page.items;
}

export async function fetchSideLearningSessionsByLifecycle(
  lifecycle: SideLearningListLifecycle,
  cacheOptions: { cache?: RequestCache; next?: { revalidate?: number } } = {},
): Promise<SideLearningSessionListPage> {
  const params = new URLSearchParams({ lifecycle });
  return apiRequest<SideLearningSessionListPage>(`/api/v1/side-learning/sessions?${params}`, {
    cache: cacheOptions.cache ?? "no-store",
    next: cacheOptions.next,
  });
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

export async function deleteSideLearningSession(sessionId: string): Promise<void> {
  const id = encodeURIComponent(sessionId);
  await apiRequest<unknown>(`/api/v1/side-learning/sessions/${id}`, { method: "DELETE", cache: "no-store" });
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
