"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  getAccessSession,
  lockAccessSession,
  unlockWithAccessKey,
} from "@/lib/api/adapters/access";
import { ACCESS_UNAUTHORIZED_EVENT } from "@/lib/auth/access-events";
import { isApiError } from "@/lib/api/errors";

type AccessStatus = "checking" | "locked" | "unlocking" | "booting" | "ready";

type AccessGateContextValue = {
  status: AccessStatus;
  unlockError: string | null;
  bootRunId: number;
  unlock: (accessKey: string) => Promise<void>;
  lock: () => Promise<void>;
  completeBoot: () => void;
};

const AccessGateContext = createContext<AccessGateContextValue | null>(null);

type AccessGateProviderProps = {
  children: React.ReactNode;
};

export function AccessGateProvider({ children }: AccessGateProviderProps) {
  const [status, setStatus] = useState<AccessStatus>("checking");
  const [unlockError, setUnlockError] = useState<string | null>(null);
  const [bootRunId, setBootRunId] = useState(0);

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const authenticated = await getAccessSession();
        if (!active) return;
        setStatus(authenticated ? "ready" : "locked");
      } catch (error) {
        if (!active) return;
        if (isApiError(error) && error.status === 401) {
          setStatus("locked");
          return;
        }
        setStatus("locked");
        setUnlockError("Could not verify current access session.");
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const onUnauthorized = () => {
      setStatus((current) => (current === "checking" ? current : "locked"));
      setUnlockError("Session expired. Enter access key to continue.");
    };
    window.addEventListener(ACCESS_UNAUTHORIZED_EVENT, onUnauthorized);
    return () => window.removeEventListener(ACCESS_UNAUTHORIZED_EVENT, onUnauthorized);
  }, []);

  const unlock = useCallback(async (accessKey: string) => {
    setStatus("unlocking");
    setUnlockError(null);
    try {
      const ok = await unlockWithAccessKey(accessKey);
      if (!ok) {
        setStatus("locked");
        setUnlockError("Invalid access key.");
        return;
      }
      setBootRunId((current) => current + 1);
      setStatus("booting");
    } catch (error) {
      setStatus("locked");
      if (isApiError(error) && error.status === 401) {
        setUnlockError("Invalid access key.");
        return;
      }
      setUnlockError("Unlock failed. Try again.");
    }
  }, []);

  const lock = useCallback(async () => {
    try {
      await lockAccessSession();
    } finally {
      setStatus("locked");
      setUnlockError(null);
    }
  }, []);

  const completeBoot = useCallback(() => {
    setStatus("ready");
  }, []);

  const value = useMemo<AccessGateContextValue>(
    () => ({
      status,
      unlockError,
      bootRunId,
      unlock,
      lock,
      completeBoot,
    }),
    [bootRunId, completeBoot, lock, status, unlock, unlockError],
  );

  return <AccessGateContext.Provider value={value}>{children}</AccessGateContext.Provider>;
}

export function useAccessGate(): AccessGateContextValue {
  const context = useContext(AccessGateContext);
  if (context === null) {
    throw new Error("useAccessGate must be used within AccessGateProvider");
  }
  return context;
}

