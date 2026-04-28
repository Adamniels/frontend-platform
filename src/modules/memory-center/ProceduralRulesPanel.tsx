"use client";

import { useCallback, useState } from "react";
import { JarvisTag } from "@/components/jarvis/JarvisTag";
import { JarvisInlineError } from "@/components/jarvis/JarvisInlineError";
import { formatLoadError } from "@/lib/utils/error-message";
import { useAsyncResource } from "@/lib/hooks/use-async-resource";
import {
  fetchProceduralRules,
  fetchProceduralRuleDetail,
  activateProceduralRule,
  deprecateProceduralRule,
  type ProceduralRuleSummaryV1,
  type ProceduralRuleDetailV1,
} from "@/lib/api/adapters/memory-center";
import { MOCK_RULES } from "./memory-mock";
import styles from "./memory-center.module.css";

// ── Colour maps ───────────────────────────────────────────────────────────────

const WF_COL: Record<string, { color: string; border: string }> = {
  "news":           { color: "#00d4ff", border: "rgba(0,212,255,0.45)"   },
  "side-learning":  { color: "#a78bfa", border: "rgba(167,139,250,0.45)" },
  "workflow":       { color: "#ff9500", border: "rgba(255,149,0,0.45)"   },
  "recommendation": { color: "#e879f9", border: "rgba(232,121,249,0.45)" },
  "insights":       { color: "#34d399", border: "rgba(52,211,153,0.45)"  },
};

const ST_COL: Record<string, { color: string; border: string }> = {
  Active:     { color: "#34d399", border: "rgba(52,211,153,0.45)"   },
  Inactive:   { color: "#ff9500", border: "rgba(255,149,0,0.45)"    },
  Deprecated: { color: "rgba(232,237,248,0.25)", border: "rgba(255,255,255,0.1)" },
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
        const d = await fetchProceduralRuleDetail(rule.id, 0);
        setDetail(d);
      } catch {
        // Fall back to mock data matching this rule
        const mock = MOCK_RULES.find((r) => r.id === rule.id);
        if (mock) {
          setDetail({
            id: mock.id, workflowType: mock.workflowType, ruleName: mock.ruleName,
            ruleContent: mock.ruleContent, version: mock.version, priority: mock.priority,
            status: mock.status, authorityWeight: mock.authorityWeight, source: mock.source,
            createdAt: mock.createdAt, updatedAt: mock.updatedAt,
          });
        }
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
    <div className={`${styles.ruleCard} ${deprecated ? styles.ruleCardDeprecated : ""}`}>
      <div style={{ cursor: "pointer", userSelect: "none" }} onClick={() => void expand()}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
          <div className={styles.priorityBox}>
            <span className={styles.priorityBoxNum}>{rule.priority}</span>
            <span className={styles.priorityBoxLabel}>PRI</span>
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div className={styles.semanticCardMeta} style={{ marginBottom: 5 }}>
              <span className={styles.semanticCardKey}>{rule.ruleName}</span>
              <JarvisTag label={rule.workflowType} color={wc.color} />
              <JarvisTag label={status} color={sc.color} />
              <JarvisTag label={`v${rule.version}`} />
            </div>
            <p className={styles.semanticCardClaim} style={{ margin: 0 }}>
              {ruleContent
                ? (ruleContent.length > 110 ? ruleContent.slice(0, 108) + "…" : ruleContent)
                : <span style={{ color: "var(--color-text-dim)", fontStyle: "italic" }}>Content loading…</span>
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
          <div style={{ flex: 1 }}>
            <div className={styles.ruleStatLabel}>
              Authority <span style={{ color: "#00d4ff" }}>{Math.round(rule.authorityWeight * 100)}%</span>
            </div>
            <div className={styles.barTrackSlim}>
              <div style={{ height: "100%", width: `${rule.authorityWeight * 100}%`, background: "#00d4ff", boxShadow: "0 0 6px rgba(0,212,255,0.5)" }} />
            </div>
          </div>
          <div className={styles.ruleStatSource}>{(rule.source ?? "—").replace(/_/g, " ")}</div>
        </div>
      </div>

      {expanded && (
        <div className={styles.semanticCardExpanded}>
          {err && <p style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "#ef4444", margin: 0 }}>{err}</p>}

          {loadingDetail ? (
            <p className={styles.muted} style={{ fontSize: 11 }}>Loading rule detail…</p>
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
              <button className={styles.btnSuccess} disabled={busy} onClick={() => void doAction(() => activateProceduralRule(rule.id, 0), "Active")}>
                {busy ? "…" : "Activate"}
              </button>
            )}
            {status === "Active" && (
              <button className={styles.btnWarn} disabled={busy} onClick={() => void doAction(() => deprecateProceduralRule(rule.id, 0), "Inactive")}>
                {busy ? "…" : "Deactivate"}
              </button>
            )}
            {!deprecated && (
              <button className={styles.btnDanger} disabled={busy} onClick={() => void doAction(() => deprecateProceduralRule(rule.id, 0), "Deprecated")}>
                {busy ? "…" : "Deprecate"}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
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
  const load = useCallback(() => fetchProceduralRules(0), [refresh]);
  const res  = useAsyncResource(load, `procedural-${refresh}`);

  if (res.status === "loading") {
    return <p className={styles.loadingText}>Loading procedural rules…</p>;
  }
  if (res.status === "error") {
    return <div className={styles.errorWrap}><JarvisInlineError title="Procedural rules" message={formatLoadError(res.error)} /></div>;
  }

  // Fall back to mock if backend returns empty
  const all: ProceduralRuleSummaryV1[] = res.data.length > 0
    ? res.data
    : MOCK_RULES.map((r) => ({
        id: r.id, workflowType: r.workflowType, ruleName: r.ruleName,
        version: r.version, priority: r.priority, status: r.status,
        authorityWeight: r.authorityWeight, source: r.source,
        updatedAt: r.updatedAt, createdAt: r.createdAt, ruleContent: r.ruleContent,
      }));

  const workflows = ["All", ...Array.from(new Set(all.map((r) => r.workflowType)))];

  const filtered = all
    .filter((r) => filterStatus === "All" || r.status === filterStatus)
    .filter((r) => filterWF === "All" || r.workflowType === filterWF)
    .sort((a, b) => b.priority - a.priority);

  const activeCount = all.filter((r) => r.status === "Active").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", overflow: "hidden", height: "100%" }}>
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
