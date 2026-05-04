"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { JarvisButton } from "@/components/jarvis/JarvisButton";
import { JarvisCard } from "@/components/jarvis/JarvisCard";
import { SegmentedControl } from "@/components/jarvis/SegmentedControl";
import { JarvisTag } from "@/components/jarvis/JarvisTag";
import { ProgressBar } from "@/components/jarvis/ProgressBar";
import {
  createSideLearningSession,
  deleteSideLearningSession,
  fetchSideLearningSessionsByLifecycle,
  getSideLearningSession,
  refreshSideLearningTopicProposals,
  selectSideLearningTopic,
  submitSideLearningReflection,
  updateSideLearningProgress,
} from "@/lib/api/adapters/side-learning";
import { isApiError } from "@/lib/api/errors";
import type { SideLearningSessionDetail, SideLearningSessionSummary } from "@/types/content";
import { parseSectionsProgress, parseSessionSections, parseTopicProposals } from "./side-learning-parse";
import styles from "./side-learning-experience.module.css";

const POLL_PHASES = new Set(["proposingTopics", "generatingSession", "analyzingReflection"]);

function diffColor(d: string) {
  const x = d.toLowerCase();
  if (x.includes("begin")) return "#34d399";
  if (x.includes("inter")) return "#ff9500";
  return "#ff4466";
}

function extractApiMessage(err: unknown): string {
  if (isApiError(err)) {
    const d = err.details;
    if (d && typeof d === "object" && "error" in d) {
      const msg = (d as { error?: unknown }).error;
      if (typeof msg === "string") return msg;
    }
    return err.message;
  }
  return err instanceof Error ? err.message : "Something went wrong";
}

function sessionMinutes(detail: SideLearningSessionDetail): number | null {
  const a = Date.parse(detail.createdAt);
  const b = Date.parse(detail.updatedAt);
  if (Number.isNaN(a) || Number.isNaN(b)) return null;
  return Math.max(0, Math.round((b - a) / 60000));
}

function sessionSummaryHeadline(s: SideLearningSessionSummary): string {
  const t = s.selectedTopicTitle?.trim();
  if (t) return t;
  return "Learning session";
}

const LEARN_HISTORY_SEGMENTS = [
  { id: "learn", label: "Learn" },
  { id: "history", label: "History" },
] as const;

function LearnHistoryTabs({
  value,
  onChange,
}: {
  value: "learn" | "history";
  onChange: (v: "learn" | "history") => void;
}) {
  return (
    <SegmentedControl
      aria-label="Learn or history"
      compact
      items={[...LEARN_HISTORY_SEGMENTS]}
      value={value}
      onChange={(id) => onChange(id as "learn" | "history")}
    />
  );
}

export function SideLearningExperience() {
  const [mainTab, setMainTab] = useState<"learn" | "history">("learn");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [detail, setDetail] = useState<SideLearningSessionDetail | null>(null);
  const [history, setHistory] = useState<SideLearningSessionSummary[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [ongoingSessions, setOngoingSessions] = useState<SideLearningSessionSummary[]>([]);
  const [landingLoading, setLandingLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [hint, setHint] = useState("");
  const [sectionIdx, setSectionIdx] = useState(0);
  const [chooseExtraFeedback, setChooseExtraFeedback] = useState("");
  const [rerollFeedback, setRerollFeedback] = useState("");
  const [reflectionDraft, setReflectionDraft] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadSession = useCallback(async () => {
    if (!sessionId) return;
    const d = await getSideLearningSession(sessionId);
    setDetail(d);
  }, [sessionId]);

  useEffect(() => {
    if (!sessionId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- clear detail when session cleared
      setDetail(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        await loadSession();
        if (!cancelled) setError(null);
      } catch (e) {
        if (!cancelled) setError(extractApiMessage(e));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sessionId, loadSession]);

  useEffect(() => {
    if (!sessionId || !detail) return;
    if (!POLL_PHASES.has(detail.phase)) return;
    const t = setInterval(() => {
      void (async () => {
        try {
          await loadSession();
        } catch {
          /* keep last good snapshot */
        }
      })();
    }, 2500);
    return () => clearInterval(t);
  }, [sessionId, detail?.phase, loadSession]);

  useEffect(() => {
    if (mainTab !== "history") return;
    let cancelled = false;
    (async () => {
      setHistoryLoading(true);
      try {
        const page = await fetchSideLearningSessionsByLifecycle("archive");
        if (!cancelled) setHistory(page.items);
      } catch {
        if (!cancelled) setHistory([]);
      } finally {
        if (!cancelled) setHistoryLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [mainTab]);

  useEffect(() => {
    if (mainTab !== "learn" || sessionId) return;
    let cancelled = false;
    (async () => {
      setLandingLoading(true);
      try {
        const page = await fetchSideLearningSessionsByLifecycle("ongoing");
        if (!cancelled) setOngoingSessions(page.items);
      } catch {
        if (!cancelled) setOngoingSessions([]);
      } finally {
        if (!cancelled) setLandingLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [mainTab, sessionId]);

  const proposals = useMemo(() => (detail ? parseTopicProposals(detail.topicProposalsJson) : []), [detail]);
  const sections = useMemo(() => (detail ? parseSessionSections(detail.sessionContentJson) : []), [detail]);
  const progress = useMemo(
    () => (detail ? parseSectionsProgress(detail.sectionsProgressJson) : {}),
    [detail],
  );

  useEffect(() => {
    if (sections.length === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- keep index in range when sections change
      setSectionIdx(0);
      return;
    }
    setSectionIdx((i) => Math.min(i, sections.length - 1));
  }, [sections.length]);

  const resetFlow = () => {
    setSessionId(null);
    setDetail(null);
    setError(null);
    setHint("");
    setSectionIdx(0);
    setChooseExtraFeedback("");
    setRerollFeedback("");
    setReflectionDraft("");
  };

  const confirmDeleteSession = async (id: string) => {
    if (deletingId) return;
    if (!window.confirm("Delete this session? This cannot be undone.")) return;
    setDeletingId(id);
    setError(null);
    try {
      await deleteSideLearningSession(id);
      setHistory((h) => h.filter((x) => x.id !== id));
      setOngoingSessions((o) => o.filter((x) => x.id !== id));
      if (sessionId === id) {
        resetFlow();
      }
    } catch (e) {
      setError(extractApiMessage(e));
    } finally {
      setDeletingId(null);
    }
  };

  const startSession = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await createSideLearningSession({
        initialPrompt: hint.trim() || undefined,
      });
      setSessionId(res.sessionId);
      setMainTab("learn");
    } catch (e) {
      setError(extractApiMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const onChooseTopic = async (title: string) => {
    if (!sessionId) return;
    setBusy(true);
    setError(null);
    try {
      await selectSideLearningTopic(sessionId, {
        topicTitle: title,
        feedback: chooseExtraFeedback.trim() || undefined,
      });
      setChooseExtraFeedback("");
      await loadSession();
    } catch (e) {
      setError(extractApiMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const onRefreshProposals = async () => {
    if (!sessionId) return;
    setBusy(true);
    setError(null);
    try {
      await refreshSideLearningTopicProposals(sessionId, {
        feedback: rerollFeedback.trim() || undefined,
      });
      setRerollFeedback("");
      await loadSession();
    } catch (e) {
      setError(extractApiMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const onMarkSection = async (sectionId: string) => {
    if (!sessionId) return;
    setBusy(true);
    setError(null);
    try {
      await updateSideLearningProgress(sessionId, { sectionId, completed: true });
      await loadSession();
    } catch (e) {
      setError(extractApiMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const onSubmitReflection = async () => {
    if (!sessionId) return;
    setBusy(true);
    setError(null);
    try {
      await submitSideLearningReflection(sessionId, { reflection: reflectionDraft.trim() });
      await loadSession();
    } catch (e) {
      setError(extractApiMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const openHistorySession = (id: string) => {
    setSessionId(id);
    setMainTab("learn");
  };

  const completedCount = sections.filter((s) => progress[s.id]).length;
  const pct = sections.length ? Math.round((completedCount / sections.length) * 100) : 0;
  const sec = sections[sectionIdx];

  if (mainTab === "history") {
    return (
      <div className={`${styles.page} screenEnter`}>
        <div className={styles.toolbar}>
          <h2 className={styles.h2}>Learning topics</h2>
          <LearnHistoryTabs value={mainTab} onChange={setMainTab} />
        </div>
        {error ? <div className={styles.errorBanner}>{error}</div> : null}
        <JarvisCard hover={false}>
          {historyLoading ? (
            <p className={styles.muted}>Loading…</p>
          ) : history.length === 0 ? (
            <p className={styles.muted}>No completed sessions yet.</p>
          ) : (
            history.map((s) => (
              <div key={s.id} className={styles.sessionListRow}>
                <button type="button" className={styles.sessionListOpen} onClick={() => openHistorySession(s.id)}>
                  <div className={styles.historyRowInner}>
                    <div className={styles.sessionListTextBlock}>
                      <div className={styles.sessionListHeadline}>{sessionSummaryHeadline(s)}</div>
                      <div className={styles.sessionListId}>{s.id}</div>
                      <div className={styles.historyDate}>
                        {s.phase} · {new Date(s.updatedAt).toLocaleString()}
                      </div>
                    </div>
                    <span className={styles.historyChev}>→</span>
                  </div>
                </button>
                <JarvisButton
                  label={deletingId === s.id ? "…" : "Delete"}
                  variant="outline"
                  className={styles.sessionListDelete}
                  onClick={() => void confirmDeleteSession(s.id)}
                />
              </div>
            ))
          )}
        </JarvisCard>
      </div>
    );
  }

  if (!sessionId) {
    return (
      <div className={`${styles.page} screenEnter`}>
        <div className={styles.toolbar}>
          <h2 className={styles.h2}>Learning topics</h2>
          <LearnHistoryTabs value={mainTab} onChange={setMainTab} />
        </div>
        {error ? <div className={styles.errorBanner}>{error}</div> : null}
        <JarvisCard hover={false} className={styles.topicCard}>
          <div className={styles.topicTitle}>Start a learning session</div>
          <p className={styles.muted}>
            Optional: tell Jarvis what you want to explore. Jarvis will suggest a few focused topics.
          </p>
          <label className={styles.label} htmlFor="sl-hint">
            Topic hint
          </label>
          <textarea
            id="sl-hint"
            className={styles.textarea}
            rows={3}
            value={hint}
            onChange={(e) => setHint(e.target.value)}
            placeholder='e.g. "I want to learn something about Temporal"'
          />
          <div className={styles.rowActions}>
            <JarvisButton label={busy ? "Starting…" : "Start"} variant="primary" onClick={() => void startSession()} />
          </div>
        </JarvisCard>
        {landingLoading ? (
          <p className={styles.muted}>Loading your sessions…</p>
        ) : ongoingSessions.length > 0 ? (
          <>
            <h3 className={styles.sectionHeading}>Continue a session</h3>
            <JarvisCard hover={false}>
              {ongoingSessions.map((s) => (
                <div key={s.id} className={styles.sessionListRow}>
                  <button type="button" className={styles.sessionListOpen} onClick={() => setSessionId(s.id)}>
                    <div className={styles.historyRowInner}>
                      <div className={styles.sessionListTextBlock}>
                        <div className={styles.sessionListHeadline}>{sessionSummaryHeadline(s)}</div>
                        <div className={styles.sessionListId}>{s.id}</div>
                        <div className={styles.historyDate}>
                          {s.phase} · {new Date(s.updatedAt).toLocaleString()}
                        </div>
                      </div>
                      <span className={styles.historyChev}>→</span>
                    </div>
                  </button>
                  <JarvisButton
                    label={deletingId === s.id ? "…" : "Delete"}
                    variant="outline"
                    className={styles.sessionListDelete}
                    onClick={() => void confirmDeleteSession(s.id)}
                  />
                </div>
              ))}
            </JarvisCard>
          </>
        ) : null}
      </div>
    );
  }

  if (!detail) {
    return (
      <div className={`${styles.page} screenEnter`}>
        <div className={styles.toolbar}>
          <h2 className={styles.h2}>Learning topics</h2>
          <LearnHistoryTabs value={mainTab} onChange={setMainTab} />
        </div>
        <p className={styles.muted}>Loading session…</p>
      </div>
    );
  }

  if (detail.phase === "failed") {
    return (
      <div className={`${styles.page} screenEnter`}>
        <div className={styles.toolbar}>
          <h2 className={styles.h2}>Learning topics</h2>
          <LearnHistoryTabs value={mainTab} onChange={setMainTab} />
        </div>
        <JarvisCard hover={false}>
          <p className={styles.body}>This session failed. You can start again.</p>
          {error ? <p className={styles.errorText}>{error}</p> : null}
          <JarvisButton label="Back to start" variant="primary" onClick={resetFlow} />
        </JarvisCard>
      </div>
    );
  }

  if (detail.phase === "proposingTopics") {
    return (
      <div className={`${styles.page} screenEnter`}>
        <div className={styles.toolbar}>
          <h2 className={styles.h2}>Learning topics</h2>
          <LearnHistoryTabs value={mainTab} onChange={setMainTab} />
        </div>
        {error ? <div className={styles.errorBanner}>{error}</div> : null}
        <JarvisCard hover={false}>
          <p className={styles.body}>
            {proposals.length === 0
              ? "Finding topic ideas…"
              : "Updating topic ideas…"}
          </p>
        </JarvisCard>
      </div>
    );
  }

  if (detail.phase === "awaitingTopicSelection") {
    return (
      <div className={`${styles.page} screenEnter`}>
        <div className={styles.toolbar}>
          <h2 className={styles.h2}>Learning topics</h2>
          <LearnHistoryTabs value={mainTab} onChange={setMainTab} />
        </div>
        {error ? <div className={styles.errorBanner}>{error}</div> : null}
        <div className={styles.proposalGrid}>
          {proposals.map((p) => (
            <JarvisCard key={p.title} hover={false} className={styles.proposalCard}>
              <div className={styles.tags}>
                {p.targetSkillGap ? <JarvisTag label={p.targetSkillGap} /> : null}
                {p.difficulty ? <JarvisTag label={p.difficulty} color={diffColor(p.difficulty)} /> : null}
              </div>
              <div className={styles.topicTitle}>{p.title}</div>
              {p.rationale ? <p className={styles.body}>{p.rationale}</p> : null}
              <div className={styles.topicMeta}>
                {p.estimatedMinutes > 0 ? `${p.estimatedMinutes} min estimated` : null}
              </div>
              <JarvisButton
                label={busy ? "…" : "Choose"}
                variant="primary"
                onClick={() => void onChooseTopic(p.title)}
              />
            </JarvisCard>
          ))}
        </div>
        <JarvisCard hover={false}>
          <div className={styles.topicTitle}>Optional notes when you choose</div>
          <textarea
            className={styles.textarea}
            rows={2}
            value={chooseExtraFeedback}
            onChange={(e) => setChooseExtraFeedback(e.target.value)}
            placeholder='e.g. "Make it more advanced"'
          />
        </JarvisCard>
        <JarvisCard hover={false}>
          <div className={styles.topicTitle}>Not quite what you wanted?</div>
          <p className={styles.muted}>Describe what you want instead. Jarvis will suggest new topics.</p>
          <textarea
            className={styles.textarea}
            rows={3}
            value={rerollFeedback}
            onChange={(e) => setRerollFeedback(e.target.value)}
            placeholder="Tell Jarvis how to adjust the suggestions…"
          />
          <JarvisButton
            label={busy ? "…" : "Get new suggestions"}
            variant="outline"
            onClick={() => void onRefreshProposals()}
          />
        </JarvisCard>
        <JarvisButton label="← Back to start" variant="ghost" onClick={resetFlow} />
      </div>
    );
  }

  if (detail.phase === "generatingSession") {
    return (
      <div className={`${styles.page} screenEnter`}>
        <div className={styles.toolbar}>
          <h2 className={styles.h2}>Learning topics</h2>
          <LearnHistoryTabs value={mainTab} onChange={setMainTab} />
        </div>
        {error ? <div className={styles.errorBanner}>{error}</div> : null}
        <JarvisCard hover={false}>
          <p className={styles.body}>Building your session for “{detail.selectedTopicTitle ?? "your topic"}”…</p>
        </JarvisCard>
      </div>
    );
  }

  if (detail.phase === "analyzingReflection") {
    return (
      <div className={`${styles.page} screenEnter`}>
        <div className={styles.toolbar}>
          <h2 className={styles.h2}>Learning topics</h2>
          <LearnHistoryTabs value={mainTab} onChange={setMainTab} />
        </div>
        {error ? <div className={styles.errorBanner}>{error}</div> : null}
        <JarvisCard hover={false}>
          <p className={styles.body}>Analyzing your session…</p>
        </JarvisCard>
      </div>
    );
  }

  if (detail.phase === "awaitingReflection") {
    return (
      <div className={`${styles.page} screenEnter`}>
        <div className={styles.toolbar}>
          <h2 className={styles.h2}>Learning topics</h2>
          <LearnHistoryTabs value={mainTab} onChange={setMainTab} />
        </div>
        {error ? <div className={styles.errorBanner}>{error}</div> : null}
        <div className={styles.memoryBanner}>
          Jarvis may propose memories for your review queue after you submit.{" "}
          <Link href="/memory/review">Open memory inbox</Link>
        </div>
        <JarvisCard hover={false}>
          <div className={styles.topicTitle}>Reflection</div>
          <p className={styles.muted}>What landed? What didn&apos;t? Any questions or new interests?</p>
          <textarea
            className={styles.textarea}
            rows={8}
            value={reflectionDraft}
            onChange={(e) => setReflectionDraft(e.target.value)}
          />
          <div className={styles.rowActions}>
            <JarvisButton
              label={busy ? "Submitting…" : "Submit reflection"}
              variant="primary"
              onClick={() => void onSubmitReflection()}
            />
          </div>
        </JarvisCard>
      </div>
    );
  }

  if (detail.phase === "completed") {
    const mins = sessionMinutes(detail);
    return (
      <div className={`${styles.page} screenEnter`}>
        <div className={styles.toolbar}>
          <h2 className={styles.h2}>Learning topics</h2>
          <LearnHistoryTabs value={mainTab} onChange={setMainTab} />
        </div>
        {error ? <div className={styles.errorBanner}>{error}</div> : null}
        <JarvisCard hover={false}>
          <div className={styles.topicTitle}>Session complete</div>
          <p className={styles.body}>
            <strong>{detail.selectedTopicTitle ?? "Side learning"}</strong>
            {mins !== null ? ` · about ${mins} min on this session` : null}
          </p>
          {detail.reflectionText ? (
            <p className={styles.muted}>Your reflection was saved.</p>
          ) : null}
        </JarvisCard>
        <div className={styles.memoryBanner}>
          Jarvis may have added suggestions to your memory inbox.{" "}
          <Link href="/memory/review">Review in memory inbox</Link>
        </div>
        <JarvisButton label="Start another session" variant="primary" onClick={resetFlow} />
      </div>
    );
  }

  if ((detail.phase === "sessionReady" || detail.phase === "inProgress") && sections.length > 0 && sec) {
    return (
      <div className={`${styles.page} ${styles.split} screenEnter`}>
        <div className={styles.navCol}>
          {sections.map((s, i) => (
            <button
              key={s.id}
              type="button"
              className={i === sectionIdx ? styles.navBtnOn : styles.navBtn}
              style={{ color: progress[s.id] ? "#34d399" : undefined }}
              onClick={() => setSectionIdx(i)}
            >
              {s.label || s.id}
            </button>
          ))}
          <JarvisButton label="← Back to start" variant="ghost" className={styles.backTopics} onClick={resetFlow} />
        </div>
        <div className={styles.mainCol}>
          <div>
            <div className={styles.breadcrumb}>
              {detail.selectedTopicTitle ?? "Session"} · {sectionIdx + 1}/{sections.length}
            </div>
            <h2 className={styles.h2}>{sec.label}</h2>
          </div>
          <ProgressBar value={pct} showVal={false} />
          <div className={styles.memoryBanner}>
            After you finish, Jarvis may propose updates worth reviewing in your{" "}
            <Link href="/memory/review">memory inbox</Link>.
          </div>
          <JarvisCard hover={false}>
            {sec.content ? <p className={styles.body}>{sec.content}</p> : null}
            {sec.example ? (
              <p className={styles.body}>
                <span className={styles.muted}>Example: </span>
                {sec.example}
              </p>
            ) : null}
            {sec.youtubeQuery ? (
              <p className={styles.body}>
                <a
                  className={styles.link}
                  href={`https://www.youtube.com/results?search_query=${encodeURIComponent(sec.youtubeQuery)}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Search on YouTube
                </a>
              </p>
            ) : null}
            {sec.outputType ? <p className={styles.muted}>Output: {sec.outputType}</p> : null}
            {sec.prompts && sec.prompts.length > 0 ? (
              <ul className={styles.promptList}>
                {sec.prompts.map((pr) => (
                  <li key={pr}>{pr}</li>
                ))}
              </ul>
            ) : null}
          </JarvisCard>
          <div className={styles.navActions}>
            {sectionIdx > 0 ? (
              <JarvisButton label="← Prev" variant="ghost" onClick={() => setSectionIdx((i) => i - 1)} />
            ) : (
              <span />
            )}
            {progress[sec.id] ? (
              <span className={styles.muted}>Marked done</span>
            ) : (
              <JarvisButton
                label={sectionIdx === sections.length - 1 ? "Mark done ✓" : "Mark done →"}
                variant="primary"
                onClick={() => void onMarkSection(sec.id)}
              />
            )}
            {sectionIdx < sections.length - 1 ? (
              <JarvisButton label="Next →" variant="ghost" onClick={() => setSectionIdx((i) => i + 1)} />
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.page} screenEnter`}>
      <div className={styles.toolbar}>
        <h2 className={styles.h2}>Learning topics</h2>
        <LearnHistoryTabs value={mainTab} onChange={setMainTab} />
      </div>
      {error ? <div className={styles.errorBanner}>{error}</div> : null}
      <JarvisCard hover={false}>
        <p className={styles.body}>Phase: {detail.phase}</p>
        <JarvisButton label="Back to start" variant="ghost" onClick={resetFlow} />
      </JarvisCard>
    </div>
  );
}
