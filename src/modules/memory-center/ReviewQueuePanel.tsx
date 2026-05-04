"use client";

import { useCallback, useState } from "react";
import { JarvisTag } from "@/components/jarvis/JarvisTag";
import { JarvisInlineError } from "@/components/jarvis/JarvisInlineError";
import { formatLoadError } from "@/lib/utils/error-message";
import { useAsyncResource } from "@/lib/hooks/use-async-resource";
import {
  CURRENT_USER_ID,
  fetchReviewQueue,
  approveReviewItem,
  rejectReviewItem,
  type ReviewQueueItemV1,
  type ReviewProposalType,
} from "@/lib/api/adapters/memory-center";
import styles from "./memory-center.module.css";

// ── Proposal metadata ─────────────────────────────────────────────────────────

type ProposalMeta = { label: string; color: string; border: string; bgRgb: string; icon: string };

const PROPOSAL_META: Record<string, ProposalMeta> = {
  NewSemantic:              { label: "New Semantic",       color: "#6b8fc3", border: "rgba(107,143,195,0.32)", bgRgb: "107,143,195", icon: "◈" },
  AdjustConfidence:         { label: "Adjust Confidence",  color: "#8f7aa8", border: "rgba(143,122,168,0.32)", bgRgb: "143,122,168", icon: "↕" },
  MergeDuplicate:           { label: "Merge Duplicate",    color: "#b58a49", border: "rgba(181,138,73,0.32)",  bgRgb: "181,138,73",  icon: "⊕" },
  MergeSemanticCandidates:  { label: "Merge Candidates",   color: "#b58a49", border: "rgba(181,138,73,0.32)",  bgRgb: "181,138,73",  icon: "⊕" },
  NewProceduralRule:        { label: "New Rule",           color: "#79a88b", border: "rgba(121,168,139,0.32)", bgRgb: "121,168,139", icon: "⟡" },
  ReviseProceduralRule:     { label: "Revise Rule",        color: "#79a88b", border: "rgba(121,168,139,0.32)", bgRgb: "121,168,139", icon: "⟡" },
  ContradictionDetected:    { label: "Contradiction",      color: "#b56f6f", border: "rgba(181,111,111,0.3)",  bgRgb: "181,111,111", icon: "⚠" },
  ConflictWithExplicitProfile: { label: "Profile Conflict", color: "#b56f6f", border: "rgba(181,111,111,0.3)", bgRgb: "181,111,111", icon: "⚠" },
  ArchiveStaleSemantic:     { label: "Archive Stale",      color: "#a09c8e", border: "rgba(160,156,142,0.24)", bgRgb: "160,156,142", icon: "◻" },
  SupersedeSemantic:        { label: "Supersede",          color: "#8f7aa8", border: "rgba(143,122,168,0.32)", bgRgb: "143,122,168", icon: "↑" },
  ReviseSemanticClaim:      { label: "Revise Claim",       color: "#8f7aa8", border: "rgba(143,122,168,0.32)", bgRgb: "143,122,168", icon: "✎" },
};

function metaFor(proposalType: ReviewProposalType): ProposalMeta {
  return PROPOSAL_META[proposalType] ?? PROPOSAL_META.NewSemantic;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-SE", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }).toUpperCase();
}

// ── Confidence diff ───────────────────────────────────────────────────────────

function ConfDiff({ current, proposed }: { current: number; proposed: number }) {
  const delta = proposed - current;
  const pos   = delta >= 0;
  return (
    <div className={styles.confDiff}>
      {([["Current", current, "rgba(160,156,142,0.45)"] as const, ["Proposed", proposed, pos ? "#79a88b" : "#b56f6f"] as const]).map(([lbl, val, col]) => (
        <div key={lbl} className={styles.confDiffRow}>
          <span className={styles.confDiffLabel}>{lbl}</span>
          <div className={styles.barTrackSlim}>
            <div style={{ height: "100%", width: `${val * 100}%`, background: col }} />
          </div>
          <span className={styles.confDiffValue} style={{ color: col }}>{Math.round(val * 100)}%</span>
        </div>
      ))}
      <div className={styles.confDiffDelta} style={{ color: pos ? "#79a88b" : "#b56f6f" }}>
        {pos ? "+" : ""}{Math.round(delta * 100)}% DELTA
      </div>
    </div>
  );
}

// ── Card body by proposal type ────────────────────────────────────────────────

function ProposalBody({ item, meta }: { item: ReviewCard; meta: ProposalMeta }) {
  switch (item.proposalType) {
    case "NewSemantic":
    case "ReviseSemanticClaim":
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            {item.key && <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, color: meta.color }}>{item.key}</span>}
            {item.domain && <JarvisTag label={item.domain} color={meta.color} />}
            {item.confidence != null && <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: meta.color }}>conf:{Math.round(item.confidence * 100)}%</span>}
          </div>
          {item.claim && (
            <div className={styles.claimBlock}>
              <div className={styles.claimBlockCorner} style={{ borderTopColor: meta.color, borderLeftColor: meta.color }} />
              &ldquo;{item.claim}&rdquo;
            </div>
          )}
        </div>
      );

    case "AdjustConfidence":
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {item.targetKey && <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, color: meta.color }}>{item.targetKey}</span>}
          {item.currentConfidence != null && item.proposedConfidence != null && (
            <ConfDiff current={item.currentConfidence} proposed={item.proposedConfidence} />
          )}
        </div>
      );

    case "MergeDuplicate":
    case "MergeSemanticCandidates":
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--color-text-dim)", letterSpacing: "1px" }}>MERGE INTO</span>
            {item.key && <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, color: meta.color }}>→ {item.key}</span>}
          </div>
          {item.mergeTargets && item.mergeTargets.length > 0 && (
            <div className={styles.mergeFrom}>
              <span className={styles.mergeFromLabel}>FROM</span>
              {item.mergeTargets.map((t) => <JarvisTag key={t} label={t} color={meta.color} />)}
            </div>
          )}
        </div>
      );

    case "NewProceduralRule":
    case "ReviseProceduralRule":
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            {item.ruleName && <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, color: meta.color }}>{item.ruleName}</span>}
            {item.workflowType && <JarvisTag label={item.workflowType} color={meta.color} />}
            {item.authorityWeight != null && <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: meta.color }}>auth:{Math.round(item.authorityWeight * 100)}%</span>}
          </div>
          {item.ruleContent && (
            <div style={{ padding: "8px 10px", background: `rgba(${meta.bgRgb},0.04)`, border: `1px solid rgba(${meta.bgRgb},0.15)`, fontFamily: "var(--font-sans)", fontSize: 14, color: "var(--color-text)", lineHeight: 1.7, position: "relative", fontWeight: 500 }}>
              {item.ruleContent}
            </div>
          )}
        </div>
      );

    default:
      return item.summary ? <p className={styles.semanticCardClaim}>{item.summary}</p> : null;
  }
}

// ── ReviewCard type (union of backend + mock shapes) ─────────────────────────

type ReviewCard = {
  id: number;
  proposalType: ReviewProposalType;
  status: string;
  createdAt: string;
  summary?: string;
  priority?: number;
  domain?: string;
  reason?: string;
  // NewSemantic / ReviseSemanticClaim
  key?: string;
  claim?: string;
  confidence?: number;
  authorityWeight?: number;
  // AdjustConfidence
  targetId?: number;
  targetKey?: string;
  currentConfidence?: number;
  proposedConfidence?: number;
  // Merge
  mergeTargets?: string[];
  // NewProceduralRule / ReviseProceduralRule
  ruleName?: string;
  workflowType?: string;
  ruleContent?: string;
};

function toReviewCard(item: ReviewQueueItemV1): ReviewCard {
  // Try to parse proposedChangeJson for richer display
  let parsed: Record<string, unknown> = {};
  try {
    if (item.proposedChangeJson) parsed = JSON.parse(item.proposedChangeJson) as Record<string, unknown>;
  } catch { /* ignore */ }

  return {
    id:               item.id,
    proposalType:     item.proposalType,
    status:           item.status,
    createdAt:        item.createdAtIso,
    summary:          item.summary,
    priority:         item.priority,
    key:              parsed.key as string | undefined,
    claim:            parsed.claim as string | undefined,
    confidence:       parsed.confidence as number | undefined,
    authorityWeight:  parsed.authorityWeight as number | undefined,
    targetKey:        parsed.targetKey as string | undefined,
    currentConfidence: parsed.currentConfidence as number | undefined,
    proposedConfidence: parsed.proposedConfidence as number | undefined,
    mergeTargets:     parsed.mergeTargets as string[] | undefined,
    ruleName:         parsed.ruleName as string | undefined,
    workflowType:     parsed.workflowType as string | undefined,
    ruleContent:      parsed.ruleContent as string | undefined,
    reason:           item.reviewNotes ?? undefined,
  };
}

// ── Single review card component ──────────────────────────────────────────────

type ReviewCardProps = {
  item: ReviewCard;
  onChanged: (id: number, nextStatus: string) => void;
};

function ReviewCardRow({ item, onChanged }: ReviewCardProps) {
  const [busy, setBusy] = useState(false);
  const [err,  setErr]  = useState<string | null>(null);
  const meta    = metaFor(item.proposalType);
  const pending = item.status === "Pending";

  const statusColor = item.status === "Approved" ? "#79a88b" : item.status === "Rejected" ? "#b56f6f" : "#b58a49";

  async function doApprove() {
    setBusy(true); setErr(null);
    try {
      await approveReviewItem(item.id, CURRENT_USER_ID);
      onChanged(item.id, "Approved");
    } catch (e) { setErr(formatLoadError(e)); }
    finally { setBusy(false); }
  }

  async function doReject() {
    setBusy(true); setErr(null);
    try {
      await rejectReviewItem(item.id, CURRENT_USER_ID, "User declined in Memory Center");
      onChanged(item.id, "Rejected");
    } catch (e) { setErr(formatLoadError(e)); }
    finally { setBusy(false); }
  }

  return (
    <div className={`${styles.reviewCard} ${!pending ? styles.reviewCardResolved : ""}`}>
      {/* Left accent stripe */}
      <div className={styles.reviewCardStripe} style={{ background: pending ? meta.color : "rgba(160,156,142,0.16)" }} />

      {/* Header */}
      <div className={styles.reviewCardHeader}>
        <div
          className={styles.reviewCardTypeIcon}
          style={{
            color: meta.color,
            borderColor: meta.border,
            background: `rgba(${meta.bgRgb},0.08)`,
          }}
        >
          {meta.icon}
        </div>
        <span className={styles.reviewCardTypeName} style={{ color: meta.color }}>{meta.label}</span>
        <JarvisTag
          label={item.status}
          color={statusColor}
        />
        {item.priority != null && item.priority > 0 && (
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--color-text-dim)" }}>P{item.priority}</span>
        )}
        <span className={styles.reviewCardDate}>{formatDate(item.createdAt)}</span>
      </div>

      {/* Body */}
      <div className={styles.reviewCardBody}>
        <ProposalBody item={item} meta={meta} />
      </div>

      {/* Reason */}
      {item.reason && (
        <div className={styles.reasonBlock}>
          <div className={styles.reasonBlockLabel}>Reason</div>
          <p className={styles.reasonBlockText}>{item.reason}</p>
        </div>
      )}

      {/* Error */}
      {err && <p style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--color-danger)", margin: "0 0 8px" }}>{err}</p>}

      {/* Actions */}
      {pending && (
        <div className={styles.rowActions}>
          <button className={styles.btnSuccess} disabled={busy} onClick={() => void doApprove()}>
            {busy ? "…" : "Approve"}
          </button>
          <button className={styles.btnDanger} disabled={busy} onClick={() => void doReject()}>
            {busy ? "…" : "Reject"}
          </button>
        </div>
      )}
      {!pending && (
        <div className={styles.reviewResolved} style={{ color: item.status === "Approved" ? "#79a88b" : "#b56f6f" }}>
          {item.status === "Approved" ? "✓ APPROVED" : "✕ REJECTED"}
        </div>
      )}
    </div>
  );
}

// ── Panel ─────────────────────────────────────────────────────────────────────

export function ReviewQueuePanel() {
  const [filter,   setFilter]   = useState<"Pending" | "All">("Pending");
  const [statuses, setStatuses] = useState<Record<number, string>>({});

  const load = useCallback(() => fetchReviewQueue(CURRENT_USER_ID), []);
  const res  = useAsyncResource(load, "review-queue");

  function handleChanged(id: number, nextStatus: string) {
    setStatuses((s) => ({ ...s, [id]: nextStatus }));
  }

  if (res.status === "loading") {
    return <p className={styles.loadingText}>Loading review queue…</p>;
  }
  if (res.status === "error") {
    return <div className={styles.errorWrap}><JarvisInlineError title="Review queue" message={formatLoadError(res.error)} /></div>;
  }

  const cards: ReviewCard[] = res.data.map(toReviewCard);

  // Merge local status overrides (for optimistic UI)
  const withOverrides = cards.map((c) => statuses[c.id] ? { ...c, status: statuses[c.id] } : c);
  const pendingCount  = withOverrides.filter((c) => c.status === "Pending").length;
  const filtered      = filter === "All" ? withOverrides : withOverrides.filter((c) => c.status === "Pending");

  return (
    <div style={{ display: "flex", flexDirection: "column", overflow: "hidden", height: "100%" }}>
      <div className={styles.toolbar}>
        {pendingCount > 0 && (
          <div className={styles.pendingBadge}>
            <div className={styles.pendingDot} />
            <span className={styles.pendingLabel}>{pendingCount} Pending</span>
          </div>
        )}
        {(["Pending", "All"] as const).map((f) => (
          <button
            key={f}
            className={`${styles.filterBtn} ${filter === f ? styles.filterBtnActive : ""}`}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
        <div className={styles.toolbarSpacer}>
          <span className={styles.toolbarCount}>{filtered.length} proposals</span>
        </div>
      </div>

      <div className={styles.panelContent}>
        {filtered.length === 0 ? (
          <div className={styles.emptyAllClear}>
            <div className={styles.emptyAllClearIcon}>✓</div>
            <div className={styles.emptyAllClearTitle}>All clear</div>
            <div className={styles.emptyAllClearSub}>No pending proposals</div>
          </div>
        ) : (
          filtered.map((item) => (
            <ReviewCardRow key={item.id} item={item} onChanged={handleChanged} />
          ))
        )}
      </div>
    </div>
  );
}
