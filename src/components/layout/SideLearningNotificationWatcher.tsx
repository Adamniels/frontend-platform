"use client";

import { useCallback, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { fetchSideLearningSessionsByLifecycle } from "@/lib/api/adapters/side-learning";
import type { SideLearningSessionSummary } from "@/types/content";
import { useNotifications } from "./NotificationsContext";

const POLL_MS = 5000;
const READY_PHASES = new Set(["sessionReady", "inProgress"]);
const REVIEW_READY_PHASE = "completed";
const TOPIC_SELECTION_PHASE = "awaitingTopicSelection";
const PROPOSING_PHASE = "proposingTopics";
const GENERATING_PHASE = "generatingSession";
const ANALYZING_PHASE = "analyzingReflection";

function storageSet(key: string): Set<string> {
  if (typeof sessionStorage === "undefined") return new Set();
  try {
    return new Set(JSON.parse(sessionStorage.getItem(key) || "[]") as string[]);
  } catch {
    return new Set();
  }
}

function writeStorageSet(key: string, values: Set<string>) {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.setItem(key, JSON.stringify([...values]));
}

export function SideLearningNotificationWatcher() {
  const pathname = usePathname();
  const { push } = useNotifications();
  const phaseBySessionRef = useRef<Map<string, string>>(new Map());
  const topicNotifiedRef = useRef<Set<string>>(storageSet("platform:side-learning-topic-notified"));
  const readyNotifiedRef = useRef<Set<string>>(storageSet("platform:side-learning-ready-notified"));
  const reviewNotifiedRef = useRef<Set<string>>(storageSet("platform:side-learning-review-notified"));
  const pathnameRef = useRef(pathname);

  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  const inspectSessions = useCallback(async () => {
    const [ongoingPage, archivePage] = await Promise.all([
      fetchSideLearningSessionsByLifecycle("ongoing"),
      fetchSideLearningSessionsByLifecycle("archive"),
    ]);
    const seenIds = new Set<string>();

    for (const session of [...ongoingPage.items, ...archivePage.items]) {
      seenIds.add(session.id);
      const previousPhase = phaseBySessionRef.current.get(session.id);
      const currentPhase = session.phase;
      const onSideLearning = pathnameRef.current.startsWith("/side-learning");

      if (
        !onSideLearning
        && previousPhase === PROPOSING_PHASE
        && currentPhase === TOPIC_SELECTION_PHASE
        && !topicNotifiedRef.current.has(session.id)
      ) {
        push({
          title: "Choose a learning topic",
          message: "Jarvis found a few directions for your next session and needs your input.",
          tone: "info",
          actionLabel: "Review topics",
          href: sideLearningSessionHref(session.id),
        });
        topicNotifiedRef.current.add(session.id);
        writeStorageSet("platform:side-learning-topic-notified", topicNotifiedRef.current);
      }

      if (
        previousPhase === GENERATING_PHASE
        && READY_PHASES.has(currentPhase)
        && !readyNotifiedRef.current.has(session.id)
      ) {
        pushReadyNotification(session, pathnameRef.current);
        readyNotifiedRef.current.add(session.id);
        writeStorageSet("platform:side-learning-ready-notified", readyNotifiedRef.current);
      }

      if (
        previousPhase === ANALYZING_PHASE
        && currentPhase === REVIEW_READY_PHASE
        && !reviewNotifiedRef.current.has(session.id)
      ) {
        push({
          title: "Memory review ready",
          message: "Jarvis may have learned something new from your session.",
          tone: "info",
          actionLabel: "Check memory review",
          href: "/memory/review",
        });
        reviewNotifiedRef.current.add(session.id);
        writeStorageSet("platform:side-learning-review-notified", reviewNotifiedRef.current);
      }

      phaseBySessionRef.current.set(session.id, currentPhase);
    }

    for (const id of phaseBySessionRef.current.keys()) {
      if (!seenIds.has(id)) phaseBySessionRef.current.delete(id);
    }
  }, [push]);

  useEffect(() => {
    let cancelled = false;
    const tick = async () => {
      try {
        await inspectSessions();
      } catch {
        /* Notifications should never disturb the shell if polling fails. */
      }
    };

    void tick();
    const timer = window.setInterval(() => {
      if (!cancelled) void tick();
    }, POLL_MS);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [inspectSessions]);

  return null;

  function pushReadyNotification(session: SideLearningSessionSummary, currentPath: string) {
    const onSideLearning = currentPath.startsWith("/side-learning");
    push({
      title: onSideLearning ? "Session generated" : "Session ready",
      message: onSideLearning
        ? "Jarvis may have noticed something worth saving while preparing this session. Review any memory suggestions when you have a moment."
        : session.selectedTopicTitle
          ? `Your learning session for "${session.selectedTopicTitle}" is ready.`
          : "Your learning session is ready.",
      tone: "success",
      actionLabel: onSideLearning ? "Review memory" : "Open session",
      href: onSideLearning ? "/memory/review" : sideLearningSessionHref(session.id),
    });
  }
}

function sideLearningSessionHref(sessionId: string) {
  return `/side-learning?sessionId=${encodeURIComponent(sessionId)}`;
}
