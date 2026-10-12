"use client";

import { useState, type FormEvent } from "react";
import { TickCircle } from "iconsax-reactjs";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

type Option = { id: string; label: string; artistFirstName: string };

export default function AskArtist({ options }: { options: Option[] }) {
  const [visitId, setVisitId] = useState(options[0]?.id ?? "");
  const [question, setQuestion] = useState("");
  const [mode, setMode] = useState<"private" | "live">("private");
  const [error, setError] = useState("");
  const [sent, setSent] = useState<string | null>(null);
  const chosen = options.find((o) => o.id === visitId);

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!question.trim()) return setError("Write your question first — one sentence is plenty.");
    setError("");
    setSent(
      mode === "private"
        ? `Sent privately to ${chosen?.artistFirstName}. Artists usually reply within a few days; you'll see it in Messages.`
        : `Added to the Q&A for “${chosen?.label}”. ${chosen?.artistFirstName} answers questions in the order they arrive — no voting.`,
    );
    setQuestion("");
  }

  return (
    <Card className="p-5 sm:p-6">
      <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="ask-visit" className="text-sm font-semibold text-green-950">Which studio?</label>
          <select id="ask-visit" value={visitId} onChange={(e) => setVisitId(e.target.value)} className="w-full rounded-[2px] border border-sand-300 bg-white px-3 py-2.5 text-sm text-green-950">
            {options.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="ask-question" className="text-sm font-semibold text-green-950">Your question</label>
          <textarea
            id="ask-question"
            rows={3}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="e.g. What made you choose olive wood for the firing?"
            className="w-full rounded-[2px] border border-sand-300 bg-white px-3 py-2.5 text-sm text-green-950 placeholder:text-grey-700"
          />
        </div>
        <fieldset className="min-w-0 flex flex-col gap-2">
          <legend className="text-sm font-semibold text-green-950">How should it reach them?</legend>
          <label className="flex items-center gap-2 text-sm text-green-950">
            <input type="radio" name="ask-mode" checked={mode === "private"} onChange={() => setMode("private")} className="h-4 w-4 accent-green-950" />
            Privately, as a message
          </label>
          <label className="flex items-center gap-2 text-sm text-green-950">
            <input type="radio" name="ask-mode" checked={mode === "live"} onChange={() => setMode("live")} className="h-4 w-4 accent-green-950" />
            In the visit&apos;s Q&amp;A (others on the visit will hear the answer)
          </label>
        </fieldset>
        {error && <p role="alert" className="text-sm font-semibold text-alert">{error}</p>}
        <Button type="submit" className="self-start">Ask {chosen?.artistFirstName ?? "the artist"}</Button>
        <p className={sent ? "flex items-start gap-2 rounded-[4px] bg-verified-bg p-3 text-sm text-verified" : "sr-only"} aria-live="polite">
          {sent && <TickCircle size={18} variant="Bulk" color="currentColor" className="mt-0.5 shrink-0" aria-hidden />}
          {sent ?? ""}
        </p>
      </form>
    </Card>
  );
}
