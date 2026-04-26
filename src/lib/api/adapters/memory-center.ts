import { apiRequest } from "@/lib/api/client";

const q = (userId: number) => (userId ? `?userId=${userId}` : "?userId=0");

export type ProfileMemoryV1 = {
  id?: number;
  coreInterests: string[];
  secondaryInterests: string[];
  goals: string[];
  preferences: { key: string; value: string }[];
  activeProjects: { name: string; externalId?: string | null }[];
  skillLevels: { name: string; level: number }[];
  authorityWeight: number;
  createdAt?: string;
  updatedAt?: string;
};

export type UpdateProfileMemoryV1 = {
  coreInterests: string[];
  secondaryInterests: string[];
  goals: string[];
  preferences: { key: string; value: string }[];
  activeProjects: { name: string; externalId?: string | null }[];
  skillLevels: { name: string; level: number }[];
};

export async function fetchExplicitProfile(userId = 0): Promise<ProfileMemoryV1> {
  return apiRequest<ProfileMemoryV1>(`/api/v1/memory/explicit-profile${q(userId)}`);
}

export async function putExplicitProfile(userId: number, body: UpdateProfileMemoryV1): Promise<ProfileMemoryV1> {
  return apiRequest<ProfileMemoryV1>(`/api/v1/memory/explicit-profile${q(userId)}`, {
    method: "PUT",
    body,
  });
}

export type SemanticMemoryV1 = {
  id: number;
  key: string;
  claim: string;
  domain?: string | null;
  confidence: number;
  authorityWeight: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  lastSupportedAt?: string | null;
};

export async function fetchSemantics(userId = 0, includePending = true): Promise<SemanticMemoryV1[]> {
  const u = userId || 0;
  return apiRequest<SemanticMemoryV1[]>(`/api/v1/memory/semantics?userId=${u}&includePending=${includePending}`);
}

export async function fetchSemantic(id: number, userId = 0): Promise<SemanticMemoryV1> {
  return apiRequest<SemanticMemoryV1>(`/api/v1/memory/semantics/${id}${q(userId)}`);
}

export type SemanticEvidenceV1 = {
  eventId: number;
  eventType: string;
  strength: number;
  note?: string | null;
  occurredAt: string;
};

export async function fetchSemanticEvidence(id: number, userId = 0): Promise<SemanticEvidenceV1[]> {
  return apiRequest<SemanticEvidenceV1[]>(`/api/v1/memory/semantics/${id}/evidence${q(userId)}`);
}

export type ReviewQueueItemV1 = {
  id: number;
  title: string;
  summary: string;
  status: string;
  proposalType: string;
  priority: number;
  createdAtIso: string;
  updatedAtIso: string;
  approvedSemanticMemoryId?: number | null;
  rejectedReason?: string | null;
  resolvedAtIso?: string | null;
  reviewNotes?: string | null;
  proposedChangeJson?: string | null;
  evidenceJson?: string | null;
  approvedProceduralRuleId?: number | null;
};

export async function fetchReviewQueue(userId = 0): Promise<ReviewQueueItemV1[]> {
  return apiRequest<ReviewQueueItemV1[]>(`/api/v1/memory/review-queue${q(userId)}`);
}

export async function approveReviewItem(
  id: number,
  userId = 0,
  reviewNotes?: string,
): Promise<{ semanticMemoryId?: number | null; proceduralRuleId?: number | null }> {
  return apiRequest<{ semanticMemoryId?: number | null; proceduralRuleId?: number | null }>(
    `/api/v1/memory/review-queue/${id}/approve${q(userId)}`,
    { method: "POST", body: { reviewNotes: reviewNotes ?? null } },
  );
}

export async function rejectReviewItem(id: number, userId = 0, reason?: string): Promise<void> {
  await apiRequest<unknown>(`/api/v1/memory/review-queue/${id}/reject${q(userId)}`, {
    method: "POST",
    body: { reason: reason ?? null },
  });
}

export type MemoryEventV1 = {
  id: number;
  eventType: string;
  domain?: string | null;
  projectId?: string | null;
  workflowId?: string | null;
  payloadPreview?: string | null;
  occurredAt: string;
};

export async function fetchMemoryEvents(userId = 0, take = 80): Promise<MemoryEventV1[]> {
  return apiRequest<MemoryEventV1[]>(`/api/v1/memory/events${q(userId)}&take=${take}`);
}

export type ProceduralRuleSummaryV1 = {
  id: number;
  workflowType: string;
  ruleName: string;
  version: number;
  priority: number;
  status: string;
  authorityWeight: number;
  source: string;
  updatedAt: string;
};

export async function fetchProceduralRules(userId = 0): Promise<ProceduralRuleSummaryV1[]> {
  return apiRequest<ProceduralRuleSummaryV1[]>(`/api/v1/memory/procedural-rules${q(userId)}`);
}
