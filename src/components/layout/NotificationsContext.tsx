"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

export type NotificationTone = "info" | "success" | "warning" | "danger";

export type AppNotification = {
  id: string;
  title: string;
  message: string;
  tone?: NotificationTone;
  actionLabel?: string;
  href?: string;
  onAction?: (() => void) | null;
  durationMs?: number;
};

type AppNotificationInput = Omit<AppNotification, "id">;

type NotificationsContextValue = {
  notifications: AppNotification[];
  push: (notification: AppNotificationInput) => string;
  dismiss: (id: string) => void;
  dismissAll: () => void;
};

const DEFAULT_DURATION_MS = 5000;

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

function makeNotificationId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `notif-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const timersRef = useRef<Map<string, number>>(new Map());

  const dismiss = useCallback((id: string) => {
    const timer = timersRef.current.get(id);
    if (timer !== undefined) {
      window.clearTimeout(timer);
      timersRef.current.delete(id);
    }
    setNotifications((current) => current.filter((item) => item.id !== id));
  }, []);

  const dismissAll = useCallback(() => {
    for (const timer of timersRef.current.values()) {
      window.clearTimeout(timer);
    }
    timersRef.current.clear();
    setNotifications([]);
  }, []);

  const push = useCallback((notification: AppNotificationInput) => {
    const id = makeNotificationId();
    const next: AppNotification = {
      id,
      tone: "info",
      durationMs: DEFAULT_DURATION_MS,
      ...notification,
    };
    setNotifications((current) => [next, ...current]);
    return id;
  }, []);

  useEffect(() => {
    for (const notification of notifications) {
      if (timersRef.current.has(notification.id)) continue;
      const duration = notification.durationMs ?? DEFAULT_DURATION_MS;
      if (duration <= 0) continue;
      const timer = window.setTimeout(() => {
        dismiss(notification.id);
      }, duration);
      timersRef.current.set(notification.id, timer);
    }

    const activeIds = new Set(notifications.map((item) => item.id));
    for (const [id, timer] of timersRef.current.entries()) {
      if (activeIds.has(id)) continue;
      window.clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, [dismiss, notifications]);

  useEffect(() => {
    return () => {
      for (const timer of timersRef.current.values()) {
        window.clearTimeout(timer);
      }
      timersRef.current.clear();
    };
  }, []);

  const value = useMemo<NotificationsContextValue>(
    () => ({ notifications, push, dismiss, dismissAll }),
    [dismiss, dismissAll, notifications, push],
  );

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}

export function useNotifications(): NotificationsContextValue {
  const value = useContext(NotificationsContext);
  if (!value) {
    throw new Error("useNotifications must be used within NotificationProvider");
  }
  return value;
}
