"use client";

import { useCallback, useState } from "react";
import { JarvisCard } from "@/components/jarvis/JarvisCard";
import { JarvisTag } from "@/components/jarvis/JarvisTag";
import { JarvisInlineError } from "@/components/jarvis/JarvisInlineError";
import { ProgressBar } from "@/components/jarvis/ProgressBar";
import { formatLoadError } from "@/lib/utils/error-message";
import { useAsyncResource } from "@/lib/hooks/use-async-resource";
import {
  CURRENT_USER_ID,
  fetchProceduralRules,
  fetchProceduralRuleDetail,
  activateProceduralRule,
  deprecateProceduralRule,
  type ProceduralRuleSummaryV1,
  type ProceduralRuleDetailV1,
} from "@/lib/api/adapters/memory-center";
import styles from "./memory-center.module.css";

// ── Colour maps ───────────────────────────────────────────────────────────────

const WF_COL: Record<string, { color: string; border: string }> = {
  "news":           { color: "#6b8fc3", border: "rgba(107,143,195,0.32)" },
  "side-learning":  { color: "#8f7aa8", border: "rgba(143,122,168,0.32)" },
  "workflow":       { color: "#b58a49", border: "rgba(181,138,73,0.32)"  },
  "recommendation": { color: "#b68bbd", border: "rgba(182,139,189,0.32)" },
  "insights":       { color: "#79a88b", border: "rgba(121,168,139,0.32)" },
};

const ST_COL: Record<string, { color: string; border: string }> = {
  Active:     { color: "#79a88b", border: "rgba(121,168,139,0.32)" },
  Inactive:   { color: "#b58a49", border: "rgba(181,138,73,0.32)"  },
  Deprecated: { color: "#a09c8e", border: "rgba(160,156,142,0.24)" },
};

function wfColor(wfType: string) { return WF_COL[wfType] ?? WF_COL.workflow; }
function stColor(status: string) { return ST_COL[status] ?? ST_COL.Inactive; }

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-SE", { year: "numeric", month: "short", day: "numeric" }).toUpperCase();
}

// ── Priority dots ─────────────────────────────────────────────────────────────

function PriorityDots({ value }: { value: number }) {
  return (
    <div className={styles.priorityDots}>
      {Array.from({ length: 10 }, (_, i) => (
        <div key={i} className={`${styles.priorityDot} ${i < value ? styles.priorityDotFilled : styles.priorityDotEmpty}`} />
      ))}
    </div>
  );
}

// ── Rule card ─────────────────────────────────────────────────────────────────

type RuleCardProps = {
  rule: ProceduralRuleSummaryV1;
  onMutated: () => void;
};

function RuleCard({ rule, onMutated }: RuleCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [detail,   setDetail]   = useState<ProceduralRuleDetailV1 | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [status,   setLocalStatus] = useState(rule.status);
  const [busy,     setBusy]    = useState(false);
  const [err,      setErr]     = useState<string | null>(null);

  const wc = wfColor(rule.workflowType);
  const sc = stColor(status);
  const deprecated = status === "Deprecated";

  async function expand() {
    const next = !expanded;
    setExpanded(next);
    if (next && !detail) {
      setLoadingDetail(true);
      try {
        const d = await fetchProceduralRuleDetail(rule.id, CURRENT_USER_ID);
        setDetail(d);
      } catch (e) {
        setErr(formatLoadError(e));
      } finally {
        setLoadingDetail(false);
      }
    }
  }

  async function doAction(action: () => Promise<void>, nextStatus: string) {
    setBusy(true); setErr(null);
    try {
      await action();
      setLocalStatus(nextStatus);
      onMutated();
    } catch (e) {
      setErr(formatLoadError(e));
    } finally {
      setBusy(false);
    }
  }

  const ruleContent = detail?.ruleContent ?? rule.ruleContent ?? null;

  return (
    <JarvisCard hover={false} className={deprecated ? styles.memoryCardDimmed : undefined}>
      <div className={styles.ruleCardHeaderClick} onClick={() => void expand()}>
        <div className={styles.ruleCardTopRow}>
          <div className={styles.priorityBox}>
            <span className={styles.priorityBoxNum}>{rule.priority}</span>
            <span className={styles.priorityBoxLabel}>PRI</span>
          </div>

          <div className={styles.ruleCardBodyGrow}>
            <div className={`${styles.semanticCardMeta} ${styles.ruleMetaTight}`}>
              <span className={styles.semanticCardKey}>{rule.ruleName}</span>
              <JarvisTag label={rule.workflowType} color={wc.color} />
              <JarvisTag label={status} color={sc.color} />
              <JarvisTag label={`v${rule.version}`} />
            </div>
            <p className={styles.ruleCardPreview}>
              {ruleContent
                ? (ruleContent.length > 110 ? ruleContent.slice(0, 108) + "…" : ruleContent)
                : <span className={styles.ruleCardPreviewMuted}>Content loading…</span>
              }
            </p>
          </div>

          <span className={`${styles.chevron} ${expanded ? styles.chevronOpen : ""}`}>▼</span>
        </div>

        <div className={styles.ruleStats}>
          <div>
            <div className={styles.ruleStatLabel}>Priority</div>
            <PriorityDots value={rule.priority} />
          </div>
          <div className={styles.semanticBarGrow}>
            <div className={styles.ruleStatLabel}>
              Authority <span className={styles.ruleStatAccent}>{Math.round(rule.authorityWeight * 100)}%</span>
            </div>
            <ProgressBar value={Math.round(rule.authorityWeight * 100)} label="" />
          </div>
          <div className={styles.ruleStatSource}>{(rule.source ?? "—").replace(/_/g, " ")}</div>
        </div>
      </div>

      {expanded && (
        <div className={styles.semanticCardExpanded}>
          {err ? <p className={styles.panelErrorText}>{err}</p> : null}

          {loadingDetail ? (
            <p className={`${styles.muted} ${styles.ruleDetailLoading}`}>Loading rule detail…</p>
          ) : ruleContent ? (
            <div className={styles.ruleContent}>
              <div className={styles.ruleContentCorner} />
              <div className={styles.ruleContentLabel}>Rule content</div>
              <p className={styles.ruleContentText}>{ruleContent}</p>
            </div>
          ) : null}

          <div className={styles.dateMeta}>
            {detail?.createdAt && (
              <div className={styles.dateMetaItem}>
                <span className={styles.dateMetaLabel}>Created</span>
                <span className={styles.dateMetaValue}>{formatDate(detail.createdAt)}</span>
              </div>
            )}
            <div className={styles.dateMetaItem}>
              <span className={styles.dateMetaLabel}>Updated</span>
              <span className={styles.dateMetaValue}>{formatDate(rule.updatedAt)}</span>
            </div>
            {detail?.source && (
              <div className={styles.dateMetaItem}>
                <span className={styles.dateMetaLabel}>Source</span>
                <span className={styles.dateMetaValue}>{detail.source.replace(/_/g, " ").toUpperCase()}</span>
              </div>
            )}
          </div>

          <div className={styles.rowActions}>
            {status !== "Active" && !deprecated && (
              <button className={styles.btnSuccess} disabled={busy} onClick={() => void doAction(() => activateProceduralRule(rule.id, CURRENT_USER_ID), "Active")}>
                {busy ? "…" : "Activate"}
              </button>
            )}
            {status === "Active" && (
              <button className={styles.btnWarn} disabled={busy} onClick={() => void doAction(() => deprecateProceduralRule(rule.id, CURRENT_USER_ID), "Inactive")}>
                {busy ? "…" : "Deactivate"}
              </button>
            )}
            {!deprecated && (
              <button className={styles.btnDanger} disabled={busy} onClick={() => void doAction(() => deprecateProceduralRule(rule.id, CURRENT_USER_ID), "Deprecated")}>
                {busy ? "…" : "Deprecate"}
              </button>
            )}
          </div>
        </div>
      )}
    </JarvisCard>
  );
}

// ── Panel ─────────────────────────────────────────────────────────────────────

const STATUSES   = ["All", "Active", "Inactive", "Deprecated"] as const;

export function ProceduralRulesPanel() {
  const [refresh,       setRefresh]       = useState(0);
  const [filterStatus,  setFilterStatus]  = useState<string>("All");
  const [filterWF,      setFilterWF]      = useState<string>("All");

  // refresh is intentionally in deps to trigger re-fetch on mutation
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const load = useCallback(() => fetchProceduralRules(CURRENT_USER_ID), [refresh]);
  const res  = useAsyncResource(load, `procedural-${refresh}`);

  if (res.status === "loading") {
    return <p className={styles.loadingText}>Loading procedural rules…</p>;
  }
  if (res.status === "error") {
    return <div className={styles.errorWrap}><JarvisInlineError title="Procedural rules" message={formatLoadError(res.error)} /></div>;
  }

  const all: ProceduralRuleSummaryV1[] = res.data;

  const workflows = ["All", ...Array.from(new Set(all.map((r) => r.workflowType)))];

  const filtered = all
    .filter((r) => filterStatus === "All" || r.status === filterStatus)
    .filter((r) => filterWF === "All" || r.workflowType === filterWF)
    .sort((a, b) => b.priority - a.priority);

  const activeCount = all.filter((r) => r.status === "Active").length;

  return (
    <div className={styles.panelStack}>
      <div className={styles.toolbar}>
        {STATUSES.map((s) => {
          const sc     = s !== "All" ? ST_COL[s] : null;
          const active = filterStatus === s;
          return (
            <button
              key={s}
              className={`${styles.filterBtn} ${active ? styles.filterBtnActive : ""}`}
              style={active && sc ? { color: sc.color, borderColor: sc.border } : undefined}
              onClick={() => setFilterStatus(s)}
            >
              {s}
            </button>
          );
        })}

        <div className={styles.toolbarDivider} />

        {workflows.map((w) => {
          const wc     = w !== "All" ? WF_COL[w] : null;
          const active = filterWF === w;
          return (
            <button
              key={w}
              className={`${styles.filterBtn} ${active ? styles.filterBtnActive : ""}`}
              style={active && wc ? { color: wc.color, borderColor: wc.border } : undefined}
              onClick={() => setFilterWF(w)}
            >
              {w}
            </button>
          );
        })}

        <div className={styles.toolbarSpacer}>
          <span className={styles.toolbarCountAccent}>{activeCount} Active</span>
          <span className={styles.toolbarCount}>{filtered.length}/{all.length}</span>
        </div>
      </div>

      <div className={styles.panelContent}>
        {filtered.length === 0 ? (
          <p className={styles.emptyState}>No results</p>
        ) : (
          filtered.map((r) => (
            <RuleCard
              key={`${r.id}-${r.version}`}
              rule={r}
              onMutated={() => setRefresh((k) => k + 1)}
            />
          ))
        )}
      </div>
    </div>
  );
}
