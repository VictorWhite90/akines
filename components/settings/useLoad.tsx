"use client";

import { useCallback, useEffect, useState } from "react";
import { CircleAlert, CircleCheck } from "lucide-react";
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
  if (loading) return <p className="ch-set__rowdesc" aria-busy="true">Loading…</p>;
  if (error) return <p className="ch-set__note ch-set__note--bad" role="alert"><CircleAlert size={20} strokeWidth={1.5} aria-hidden /><span>{error}</span> <button type="button" className="ch-tlink" onClick={onRetry}>Try again</button></p>;
  return null;
}

/** A result line under a form: the design's confirmation, or an error in the error tone. */
export function Notice({ text, tone = "ok" }: { text: string | null; tone?: "ok" | "bad" }) {
  if (!text) return null;
  const Icon = tone === "bad" ? CircleAlert : CircleCheck;
  return <p className={`ch-set__note${tone === "bad" ? " ch-set__note--bad" : ""}`} role={tone === "bad" ? "alert" : "status"}><Icon size={20} strokeWidth={1.5} aria-hidden /><span>{text}</span></p>;
}

/** One block of an account section: a serif title, a line of text, then its fields or rows. */
export function Block({ title, text, tag, danger, children }: { title: string; text?: React.ReactNode; tag?: React.ReactNode; danger?: boolean; children?: React.ReactNode }) {
  return (
    <section className={`ch-set__block${danger ? " ch-set__block--danger" : ""}`}>
      <h2 className="ch-set__blocktitle">{title}{tag}</h2>
      {text ? <p className="ch-set__blocktext">{text}</p> : null}
      {children}
    </section>
  );
}
