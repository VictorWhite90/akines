"use client";

import { createContext, Fragment, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

type WellbeingState = {
  /** The global "Need to talk to someone now?" panel. */
  safetyOpen: boolean;
  openSafety: () => void;
  closeSafety: () => void;
  /** False once the member deletes their wellbeing data — tools start empty. */
  hasHistory: boolean;
  deleteAll: () => void;
  resetKey: number;
};

const Ctx = createContext<WellbeingState | null>(null);

export function useWellbeing() {
  const value = useContext(Ctx);
  if (!value) throw new Error("useWellbeing must be used inside <WellbeingProvider>");
  return value;
}

export function WellbeingProvider({ children }: { children: ReactNode }) {
  const [safetyOpen, setSafetyOpen] = useState(false);
  const [hasHistory, setHasHistory] = useState(true);
  const [resetKey, setResetKey] = useState(0);

  const openSafety = useCallback(() => {
    setSafetyOpen(true);
    // Let the panel render, then move focus to it so keyboard and screen-reader users land there.
    requestAnimationFrame(() => {
      const el = document.getElementById("safety-panel");
      el?.scrollIntoView({ block: "start" });
      el?.focus({ preventScroll: true });
    });
  }, []);
  const closeSafety = useCallback(() => setSafetyOpen(false), []);
  const deleteAll = useCallback(() => {
    setHasHistory(false);
    setResetKey((k) => k + 1);
  }, []);

  const value = useMemo(
    () => ({ safetyOpen, openSafety, closeSafety, hasHistory, deleteAll, resetKey }),
    [safetyOpen, openSafety, closeSafety, hasHistory, deleteAll, resetKey],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

/** Remounts its children (clearing their local state) when the member deletes their data. */
export function ResetBoundary({ children }: { children: ReactNode }) {
  const { resetKey } = useWellbeing();
  return <Fragment key={resetKey}>{children}</Fragment>;
}
