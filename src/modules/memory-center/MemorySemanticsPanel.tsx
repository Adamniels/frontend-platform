"use client";

import { useCallback, useState } from "react";
import { JarvisTag } from "@/components/jarvis/JarvisTag";
import { JarvisInlineError } from "@/components/jarvis/JarvisInlineError";
import { formatLoadError } from "@/lib/utils/error-message";
import { useAsyncResource } from "@/lib/hooks/use-async-resource";
import {
  fetchSemantics,
  archiveSemantic,
  rejectSemantic,
  fetchSemanticEvidence,
  type SemanticMemoryV1,
  type SemanticEvidenceV1,
} from "@/lib/api/adapters/memory-center";
import styles from "./memory-center.module.css";

// ── Colour maps ───────────────────────────────────────────────────────────────

const DOM_COL: Record<string, { color: string; border: string }> = {
  learning:       { color: "#00d4ff", border: "rgba(0,212,255,0.45)"   },
  workflow:       { color: "#ff9500", border: "rgba(255,149,0,0.45)"   },
  recommendation: { color: "#e879f9", border: "rgba(232,121,249,0.45)" },
  profile:        { color: "#34d399", border: "rgba(52,211,153,0.45)"  },
};

const STAT_COL: Record<string, { color: string; border: string }> = {
  Active:        { color: "#34d399", border: "rgba(52,211,153,0.45)"   },
  PendingReview: { color: "#ff9500", border: "rgba(255,149,0,0.45)"    },
  Archived:      { color: "rgba(232,237,248,0.3)", border: "rgba(255,255,255,0.15)" },
  Superseded:    { color: "rgba(232,237,248,0.3)", border: "rgba(255,255,255,0.15)" },
  Rejected:      { color: "#ef4444", border: "rgba(239,68,68,0.45)"    },
};

function domainColor(domain: string | null | undefined) {
  return DOM_COL[domain ?? ""] ?? DOM_COL.workflow;
}

function statusColor(status: string) {
  const n = status.toLowerCase().replace(/_/g, "");
  if (n === "pendingreview") return STAT_COL.PendingReview;
  return STAT_COL[status] ?? STAT_COL.Active;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-SE", { year: "numeric", month: "short", day: "numeric" }).toUpperCase();
}

// ── Confidence bar ────────────────────────────────────────────────────────────

function ConfBar({ value, color }: { value: number; color: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div className={styles.barTrackSlim}>
        <div style={{ height: "100%", width: `${value * 100}%`, background: color, boxShadow: `0 0 6px ${color}`, transition: "width 0.4s" }} />
      </div>
      <span className={styles.semanticCardBarValue} style={{ color }}>
        {Math.round(value * 100)}%
      </span>
    </div>
  );
}

// ── Evidence sub-panel ────────────────────────────────────────────────────────

function EvidencePanel({ semanticId }: { semanticId: number }) {
  const load = useCallback(() => fetchSemanticEvidence(semanticId, 0), [semanticId]);
  const res  = useAsyncResource(load, `evidence-${semanticId}`);

  if (res.status === "loading") {
    return <p className={styles.muted} style={{ fontSize: 11 }}>Loading evidence…</p>;
  }
  if (res.status === "error") {
    return <p className={styles.muted} style={{ fontSize: 11 }}>Evidence unavailable.</p>;
  }
  if (res.data.length === 0) {
    return <p className={styles.muted} style={{ fontSize: 11 }}>No evidence recorded yet.</p>;
  }

  return (
    <ul className={styles.evidence}>
      {res.data.map((ev: SemanticEvidenceV1) => (
        <li key={ev.eventId}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--color-text)", letterSpacing: "0.5px" }}>
              {ev.eventType}
            </span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--color-text-dim)" }}>
              str {Math.round(ev.strength * 100)}%
            </span>
          </div>
          <div style={{ fontSize: 11, color: "var(--color-text-dim)" }}>
            {formatDate(ev.occurredAt)}
            {ev.sourceKind ? ` · ${ev.sourceKind}` : ""}
            {ev.polarity ? ` · ${ev.polarity}` : ""}
          </div>
          {ev.note && <div style={{ marginTop: 4, fontSize: 11, fontStyle: "italic", color: "rgba(232,237,248,0.4)" }}>{ev.note}</div>}
        </li>
      ))}
    </ul>
  );
}

// ── Semantic card ─────────────────────────────────────────────────────────────

type SemanticCardProps = {
  sem: SemanticMemoryV1;
  onMutated: () => void;
};

function SemanticCard({ sem, onMutated }: SemanticCardProps) {
  const [expanded,     setExpanded]     = useState(false);
  const [showEvidence, setShowEvidence] = useState(false);
  const [busy,         setBusy]         = useState(false);
  const [err,          setErr]          = useState<string | null>(null);

  const normalStatus = sem.status.toLowerCase().replace(/_/g, "");
  const inactive = normalStatus === "archived" || normalStatus === "rejected" || normalStatus === "superseded";

  const dc = domainColor(sem.domain);
  const sc = normalStatus === "pendingreview" ? STAT_COL.PendingReview : statusColor(sem.status);

  const doArchive = async () => {
    setBusy(true); setErr(null);
    try { await archiveSemantic(sem.id, 0); onMutated(); }
    catch (e) { setErr(formatLoadError(e)); }
    finally { setBusy(false); }
  };

  const doReject = async () => {
    setBusy(true); setErr(null);
    try { await rejectSemantic(sem.id, 0); onMutated(); }
    catch (e) { setErr(formatLoadError(e)); }
    finally { setBusy(false); }
  };

  return (
    <div className={`${styles.semanticCard} ${inactive ? styles.semanticCardInactive : ""}`}>
      <div className={styles.semanticCardHeader} onClick={() => setExpanded((x) => !x)}>
        <div className={styles.semanticCardTitleRow}>
          <div className={styles.semanticCardInfo}>
            <div className={styles.semanticCardMeta}>
              <span className={styles.semanticCardKey}>{sem.key}</span>
              <JarvisTag label={sem.domain ?? "—"} color={dc.color} />
              <JarvisTag
                label={normalStatus === "pendingreview" ? "Pending" : sem.status}
                color={sc.color}
              />
              {sem.evidenceCount != null && (
                <span className={styles.semanticCardEvCount}>{sem.evidenceCount} ev</span>
              )}
            </div>
            <p className={styles.semanticCardClaim}>{sem.claim}</p>
          </div>
          <span className={`${styles.chevron} ${expanded ? styles.chevronOpen : ""}`}>▼</span>
        </div>

        <div className={styles.semanticCardBars}>
          <div className={styles.semanticCardBarRow}>
            <span className={styles.semanticCardBarLabel}>Confidence</span>
            <div style={{ flex: 1 }}>
              <ConfBar value={sem.confidence} color="#00d4ff" />
            </div>
          </div>
          <div className={styles.semanticCardBarRow}>
            <span className={styles.semanticCardBarLabel}>Authority</span>
            <div style={{ flex: 1 }}>
              <ConfBar value={sem.authorityWeight} color="rgba(232,237,248,0.3)" />
            </div>
          </div>
        </div>
      </div>

      {expanded && (
        <div className={styles.semanticCardExpanded}>
          {err && (
            <p style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "#ef4444", margin: 0 }}>{err}</p>
          )}

          <div className={styles.dateMeta}>
            {sem.createdAt && (
              <div className={styles.dateMetaItem}>
                <span className={styles.dateMetaLabel}>Created</span>
                <span className={styles.dateMetaValue}>{formatDate(sem.createdAt)}</span>
              </div>
            )}
            {sem.lastSupportedAt && (
              <div className={styles.dateMetaItem}>
                <span className={styles.dateMetaLabel}>Last supported</span>
                <span className={styles.dateMetaValue}>{formatDate(sem.lastSupportedAt)}</span>
              </div>
            )}
          </div>

          {!inactive && (
            <div className={styles.rowActions}>
              <button className={styles.btnDanger} disabled={busy} onClick={() => void doArchive()}>
                {busy ? "…" : "Archive"}
              </button>
              <button className={styles.btnWarn} disabled={busy} onClick={() => void doReject()}>
                {busy ? "…" : "Reject"}
              </button>
              <button
                className={styles.btnOutline}
                onClick={() => setShowEvidence((x) => !x)}
              >
                {showEvidence ? "Hide evidence" : "Evidence"}
              </button>
            </div>
          )}

          {showEvidence && <EvidencePanel semanticId={sem.id} />}
        </div>
      )}
    </div>
  );
}

// ── Panel ─────────────────────────────────────────────────────────────────────

type SortKey = "confidence" | "authority" | "evidence" | "date";

const DOMAINS  = ["All", "learning", "workflow", "recommendation", "profile"] as const;
const STATUSES = ["All", "Active", "PendingReview"] as const;

export function MemorySemanticsPanel() {
  const [refresh,      setRefresh]      = useState(0);
  const [filterDomain, setFilterDomain] = useState<string>("All");
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [sortBy,       setSortBy]       = useState<SortKey>("confidence");

  // refresh is intentionally in deps to trigger re-fetch on mutation
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const load = useCallback(() => fetchSemantics(0, true), [refresh]);
  const res  = useAsyncResource(load, `semantics-${refresh}`);

  if (res.status === "loading") {
    return <p className={styles.loadingText}>Loading semantic memory…</p>;
  }
  if (res.status === "error") {
    return (
      <div className={styles.errorWrap}>
        <JarvisInlineError title="Semantic memory" message={formatLoadError(res.error)} />
      </div>
    );
  }

  const all = res.data;

  const filtered = all
    .filter((s) => filterDomain === "All" || s.domain === filterDomain)
    .filter((s) => {
      if (filterStatus === "All") return true;
      const n = s.status.toLowerCase().replace(/_/g, "");
      return n === filterStatus.toLowerCase().replace(/_/g, "");
    })
    .sort((a, b) => {
      if (sortBy === "confidence") return b.confidence - a.confidence;
      if (sortBy === "authority")  return b.authorityWeight - a.authorityWeight;
      if (sortBy === "evidence")   return (b.evidenceCount ?? 0) - (a.evidenceCount ?? 0);
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  return (
    <div style={{ display: "flex", flexDirection: "column", overflow: "hidden", height: "100%" }}>
      <div className={styles.toolbar}>
        <span className={styles.toolbarLabel}>Domain</span>
        {DOMAINS.map((d) => {
          const dc  = d !== "All" ? DOM_COL[d] : null;
          const active = filterDomain === d;
          return (
            <button
              key={d}
              className={`${styles.filterBtn} ${active ? styles.filterBtnActive : ""}`}
              style={active && dc ? { color: dc.color, borderColor: dc.border } : undefined}
              onClick={() => setFilterDomain(d)}
            >
              {d}
            </button>
          );
        })}

        <div className={styles.toolbarDivider} />

        {STATUSES.map((s) => {
          const sc  = s !== "All" ? STAT_COL[s] : null;
          const active = filterStatus === s;
          return (
            <button
              key={s}
              className={`${styles.filterBtn} ${active ? styles.filterBtnActive : ""}`}
              style={active && sc ? { color: sc.color, borderColor: sc.border } : undefined}
              onClick={() => setFilterStatus(s)}
            >
              {s === "PendingReview" ? "Pending" : s}
            </button>
          );
        })}

        <div className={styles.toolbarSpacer}>
          <span className={styles.toolbarLabel}>Sort</span>
          <select
            className={styles.sortSelect}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortKey)}
          >
            <option value="confidence">Confidence</option>
            <option value="authority">Authority</option>
            <option value="evidence">Evidence</option>
            <option value="date">Date</option>
          </select>
          <span className={styles.toolbarCount}>{filtered.length}/{all.length}</span>
        </div>
      </div>

      <div className={styles.panelContent}>
        {filtered.length === 0 ? (
          <p className={styles.emptyState}>No results</p>
        ) : (
          filtered.map((s) => (
            <SemanticCard
              key={s.id}
              sem={s}
              onMutated={() => setRefresh((k) => k + 1)}
            />
          ))
        )}
      </div>
    </div>
  );
}
