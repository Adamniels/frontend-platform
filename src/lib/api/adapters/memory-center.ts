import { apiRequest } from "@/lib/api/client";

// TODO(multi-user): replace with userId derived from the session response
export const CURRENT_USER_ID = 0;

const q = (userId: number) => (userId ? `?userId=${userId}` : "?userId=0");

// ── Explicit profile ─────────────────────────────────────────────────────────

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

export async function fetchExplicitProfile(userId = CURRENT_USER_ID): Promise<ProfileMemoryV1> {
  return apiRequest<ProfileMemoryV1>(`/api/v1/memory/explicit-profile${q(userId)}`);
}

export async function putExplicitProfile(userId: number, body: UpdateProfileMemoryV1): Promise<ProfileMemoryV1> {
  return apiRequest<ProfileMemoryV1>(`/api/v1/memory/explicit-profile${q(userId)}`, {
    method: "PUT",
    body,
  });
}

// ── Semantic memory ──────────────────────────────────────────────────────────

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
  evidenceCount?: number | null;
};

export async function fetchSemantics(userId = CURRENT_USER_ID, includePending = true): Promise<SemanticMemoryV1[]> {
  const u = userId || CURRENT_USER_ID;
  return apiRequest<SemanticMemoryV1[]>(`/api/v1/memory/semantics?userId=${u}&includePending=${includePending}`);
}

export async function fetchSemantic(id: number, userId = CURRENT_USER_ID): Promise<SemanticMemoryV1> {
  return apiRequest<SemanticMemoryV1>(`/api/v1/memory/semantics/${id}${q(userId)}`);
}

export type SemanticEvidenceV1 = {
  eventId: number;
  eventType: string;
  strength: number;
  note?: string | null;
  occurredAt: string;
  // Governance fields added in schema v2
  polarity?: string | null;
  sourceKind?: string | null;
  reliabilityWeight?: number | null;
  sourceId?: string | null;
  schemaVersion?: number | null;
  provenanceJson?: string | null;
};

export async function fetchSemanticEvidence(id: number, userId = CURRENT_USER_ID): Promise<SemanticEvidenceV1[]> {
  return apiRequest<SemanticEvidenceV1[]>(`/api/v1/memory/semantics/${id}/evidence${q(userId)}`);
}

export async function archiveSemantic(id: number, userId = CURRENT_USER_ID): Promise<void> {
  await apiRequest<unknown>(`/api/v1/memory/semantics/${id}/archive${q(userId)}`, { method: "POST" });
}

export async function rejectSemantic(id: number, userId = CURRENT_USER_ID): Promise<void> {
  await apiRequest<unknown>(`/api/v1/memory/semantics/${id}/reject${q(userId)}`, { method: "POST" });
}

// ── Review queue ─────────────────────────────────────────────────────────────

export type ReviewProposalType =
  | "NewSemantic"
  | "AdjustConfidence"
  | "MergeDuplicate"
  | "NewProceduralRule"
  | "ContradictionDetected"
  | "ArchiveStaleSemantic"
  | "MergeSemanticCandidates"
  | "SupersedeSemantic"
  | "ConflictWithExplicitProfile"
  | "ReviseSemanticClaim"
  | "ReviseProceduralRule"
  | string;

export type ReviewQueueItemV1 = {
  id: number;
  title: string;
  summary: string;
  status: string;
  proposalType: ReviewProposalType;
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

export type MemoryContextConflict = {
  kind?: string | null;
  summary?: string | null;
  relatedEntityIds?: string[] | null;
  severity?: string | null;
  againstExplicitProfile?: boolean | null;
  confidence?: number | null;
  authorityWeight?: number | null;
};

export async function fetchReviewQueue(userId = CURRENT_USER_ID): Promise<ReviewQueueItemV1[]> {
  return apiRequest<ReviewQueueItemV1[]>(`/api/v1/memory/review-queue${q(userId)}`);
}

export async function approveReviewItem(
  id: number,
  userId = CURRENT_USER_ID,
  reviewNotes?: string,
): Promise<{ semanticMemoryId?: number | null; proceduralRuleId?: number | null }> {
  return apiRequest<{ semanticMemoryId?: number | null; proceduralRuleId?: number | null }>(
    `/api/v1/memory/review-queue/${id}/approve${q(userId)}`,
    { method: "POST", body: { reviewNotes: reviewNotes ?? null } },
  );
}

export async function rejectReviewItem(id: number, userId = CURRENT_USER_ID, reason?: string): Promise<void> {
  await apiRequest<unknown>(`/api/v1/memory/review-queue/${id}/reject${q(userId)}`, {
    method: "POST",
    body: { reason: reason ?? null },
  });
}

// ── Memory events ────────────────────────────────────────────────────────────

export type MemoryEventV1 = {
  id: number;
  eventType: string;
  domain?: string | null;
  projectId?: string | null;
  workflowId?: string | null;
  payloadPreview?: string | null;
  occurredAt: string;
};

export async function fetchMemoryEvents(userId = CURRENT_USER_ID, take = 80): Promise<MemoryEventV1[]> {
  return apiRequest<MemoryEventV1[]>(`/api/v1/memory/events${q(userId)}&take=${take}`);
}

// ── Procedural rules ─────────────────────────────────────────────────────────

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
  createdAt?: string;
  ruleContent?: string | null;
};

export type ProceduralRuleDetailV1 = {
  id: number;
  workflowType: string;
  ruleName: string;
  ruleContent: string;
  version: number;
  priority: number;
  status: string;
  authorityWeight: number;
  source: string;
  createdAt: string;
  updatedAt: string;
};

export async function fetchProceduralRules(userId = CURRENT_USER_ID): Promise<ProceduralRuleSummaryV1[]> {
  return apiRequest<ProceduralRuleSummaryV1[]>(`/api/v1/memory/procedural-rules${q(userId)}`);
}

export async function fetchProceduralRuleDetail(id: number, userId = CURRENT_USER_ID): Promise<ProceduralRuleDetailV1> {
  return apiRequest<ProceduralRuleDetailV1>(`/api/v1/memory/procedural-rules/${id}${q(userId)}`);
}

export async function activateProceduralRule(id: number, userId = CURRENT_USER_ID): Promise<void> {
  await apiRequest<unknown>(`/api/v1/memory/procedural-rules/${id}/activate${q(userId)}`, { method: "POST" });
}

export async function deprecateProceduralRule(id: number, userId = CURRENT_USER_ID): Promise<void> {
  await apiRequest<unknown>(`/api/v1/memory/procedural-rules/${id}/deprecate${q(userId)}`, { method: "POST" });
}

export async function updateProceduralRulePriority(id: number, priority: number, userId = CURRENT_USER_ID): Promise<void> {
  await apiRequest<unknown>(`/api/v1/memory/procedural-rules/${id}/priority${q(userId)}`, {
    method: "PUT",
    body: { priority },
  });
}
