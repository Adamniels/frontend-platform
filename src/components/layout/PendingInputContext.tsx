"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

type PendingInputContextValue = {
  count: number;
  setCount: (n: number) => void;
};

const PendingInputContext = createContext<PendingInputContextValue | null>(null);

export function PendingInputProvider({ children }: { children: ReactNode }) {
  const [count, setCount] = useState(3);

  const value = useMemo(() => ({ count, setCount }), [count]);

  return (
    <PendingInputContext.Provider value={value}>{children}</PendingInputContext.Provider>
  );
}

export function usePendingInputCount(): PendingInputContextValue {
  const ctx = useContext(PendingInputContext);
  if (!ctx) {
    throw new Error("usePendingInputCount must be used within PendingInputProvider");
  }
  return ctx;
}
