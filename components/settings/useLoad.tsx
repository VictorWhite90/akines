"use client";

import { useCallback, useEffect, useState } from "react";
import type { ApiResult } from "@/lib/api/client";

/** Loads one API resource for a settings section and lets the section reload it after a change. */
export function useLoad<T>(load: () => Promise<ApiResult<T>>) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    const r = await load();
    if (r.ok) {
      setData(r.data);
      setError(null);
    } else {
      setError(r.message);
    }
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `load` is a stable module function per section
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetches once when the section opens
    void reload();
  }, [reload]);

  return { data, setData, error, loading, reload };
}

export function Status({ loading, error, onRetry }: { loading: boolean; error: string | null; onRetry: () => void }) {
  if (loading) return <p className="kh-none" aria-busy="true">Loading…</p>;
  if (error) return <p className="kh-none" role="alert">{error} <button onClick={onRetry}>Try again</button></p>;
  return null;
}

export function Notice({ text, tone = "ok" }: { text: string | null; tone?: "ok" | "bad" }) {
  if (!text) return null;
  return <p className={`st-notice ${tone}`} role={tone === "bad" ? "alert" : "status"}>{text}</p>;
}
