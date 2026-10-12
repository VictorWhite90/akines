"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { TickCircle } from "iconsax-reactjs";
import Button from "@/components/ui/Button";
import Chip from "@/components/ui/Chip";
import Tabs from "@/components/ui/Tabs";
import { cn } from "@/lib/cn";
import { ARTIST_ANXIETY_PROMPTS, COLLECTOR_PROMPTS, GRATITUDE_SEED, JOURNAL_PROMPT, hasCrisisLanguage } from "../_data";
import SafetyPanel from "./SafetyPanel";
import { useWellbeing } from "./WellbeingContext";

const fieldCls = "mt-2 w-full rounded-[2px] border border-sand-300 bg-white p-3 text-sm text-green-950 placeholder:text-grey-600";

function Saved({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-start gap-2 text-sm text-calm">
      <TickCircle size={18} variant="Bulk" color="currentColor" className="mt-px shrink-0" aria-hidden />
      <span>{children}</span>
    </p>
  );
}

/** Artist-anxiety and collector reflection prompts (W1). */
export function ReflectionPrompts() {
  const [tab, setTab] = useState<"artist" | "collector">("artist");
  const [promptIdx, setPromptIdx] = useState(0);
  const [text, setText] = useState("");
  const [saved, setSaved] = useState("");
  const [crisis, setCrisis] = useState(false);
  const fieldId = useId();
  const prompts = tab === "artist" ? ARTIST_ANXIETY_PROMPTS : COLLECTOR_PROMPTS;

  function keep() {
    if (hasCrisisLanguage(text)) {
      setCrisis(true);
      setSaved("");
      return;
    }
    if (!text.trim()) return;
    setCrisis(false);
    setSaved("Kept privately. You can reread it here any time — nobody else can.");
    setText("");
  }

  return (
    <div>
      <Tabs
        idPrefix="reflect"
        label="Reflection prompts"
        value={tab}
        onChange={(v) => {
          setTab(v);
          setPromptIdx(0);
          setSaved("");
        }}
        items={[
          { id: "artist", label: "For artists", hint: "anxiety & doubt" },
          { id: "collector", label: "For collectors" },
        ]}
      />
      <div role="tabpanel" id={`reflect-panel-${tab}`} aria-labelledby={`reflect-tab-${tab}`} className="pt-4">
        <fieldset>
          <legend className="sr-only">Choose a prompt</legend>
          <div className="flex flex-col gap-2">
            {prompts.map((p, i) => (
              <button
                key={p}
                type="button"
                aria-pressed={promptIdx === i}
                onClick={() => setPromptIdx(i)}
                className={cn(
                  "cursor-pointer rounded-[4px] border px-4 py-3 text-left font-playfair text-base leading-snug transition-colors",
                  promptIdx === i ? "border-calm bg-calm-bg text-green-950" : "border-sand-200 bg-white text-grey-800 hover:border-calm",
                )}
              >
                {p}
              </button>
            ))}
          </div>
        </fieldset>
        <label htmlFor={fieldId} className="mt-4 block text-sm font-semibold text-green-950">
          Your response <span className="font-normal text-grey-700">(private)</span>
        </label>
        <textarea id={fieldId} rows={3} value={text} onChange={(e) => setText(e.target.value)} placeholder={prompts[promptIdx]} className={fieldCls} />
        <Button onClick={keep} variant="outline" size="sm" className="mt-3" disabled={!text.trim()}>
          Keep privately
        </Button>
        <div aria-live="polite" className="mt-3">
          {crisis ? <SafetyPanel onClose={() => setCrisis(false)} closeLabel="Back to my prompts" /> : saved && <Saved>{saved}</Saved>}
        </div>
      </div>
    </div>
  );
}

/** Expressive art-journaling prompt with a private-by-default option (W1, C7). */
export function JournalPrompt() {
  const [text, setText] = useState("");
  const [visibility, setVisibility] = useState<"private" | "journal">("private");
  const [saved, setSaved] = useState("");
  const [crisis, setCrisis] = useState(false);
  const fieldId = useId();

  function save() {
    if (hasCrisisLanguage(text)) {
      setCrisis(true);
      setSaved("");
      return;
    }
    if (!text.trim()) return;
    setCrisis(false);
    setSaved(
      visibility === "private"
        ? "Saved to your private wellbeing notes. It will never appear in your Artist Journal."
        : "Saved as a draft in your Artist Journal. It stays private until you choose who can see it.",
    );
    setText("");
  }

  return (
    <div>
      <p className="font-playfair text-lg font-semibold text-green-950">{JOURNAL_PROMPT.title}</p>
      <p className="mt-1 text-sm leading-relaxed text-grey-800">{JOURNAL_PROMPT.text}</p>
      <label htmlFor={fieldId} className="mt-4 block text-sm font-semibold text-green-950">
        Three words, or more
      </label>
      <textarea id={fieldId} rows={3} value={text} onChange={(e) => setText(e.target.value)} className={fieldCls} />
      <fieldset className="mt-3">
        <legend className="text-sm font-semibold text-green-950">Where should this live?</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          <Chip selected={visibility === "private"} onToggle={() => setVisibility("private")}>
            Only me (private)
          </Chip>
          <Chip selected={visibility === "journal"} onToggle={() => setVisibility("journal")}>
            Draft in my Artist Journal
          </Chip>
        </div>
      </fieldset>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Button onClick={save} variant="outline" size="sm" disabled={!text.trim()}>
          Save
        </Button>
        <Link href="/journals" className="text-sm font-semibold text-green-950 underline underline-offset-4">
          Open my journal
        </Link>
      </div>
      <div aria-live="polite" className="mt-3">
        {crisis ? <SafetyPanel onClose={() => setCrisis(false)} closeLabel="Back to my journal prompt" /> : saved && <Saved>{saved}</Saved>}
      </div>
    </div>
  );
}

/** Private gratitude notes (W1). */
export function GratitudeNotes() {
  const { hasHistory } = useWellbeing();
  const [notes, setNotes] = useState(hasHistory ? GRATITUDE_SEED : []);
  const [text, setText] = useState("");
  const [crisis, setCrisis] = useState(false);
  const [status, setStatus] = useState("");
  const fieldId = useId();

  function add() {
    if (hasCrisisLanguage(text)) {
      setCrisis(true);
      return;
    }
    if (!text.trim()) return;
    setCrisis(false);
    setNotes((n) => [{ id: `g-${n.length + 1}-${text.length}`, date: "Today", text: text.trim() }, ...n]);
    setText("");
    setStatus("Added to your private gratitude notes.");
  }

  return (
    <div>
      <label htmlFor={fieldId} className="text-sm font-semibold text-green-950">
        One small thing you&apos;re grateful for
      </label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          id={fieldId}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          className="mt-2 h-11 min-w-0 flex-1 rounded-[2px] border border-sand-300 bg-white px-3 text-sm text-green-950"
        />
        <Button onClick={add} variant="outline" className="sm:mt-2" disabled={!text.trim()}>
          Add note
        </Button>
      </div>
      <div aria-live="polite" className="mt-3">
        {crisis ? <SafetyPanel onClose={() => setCrisis(false)} closeLabel="Back to my notes" /> : status && <Saved>{status}</Saved>}
      </div>
      {notes.length > 0 ? (
        <ul className="mt-4 flex flex-col gap-2">
          {notes.map((n) => (
            <li key={n.id} className="rounded-[4px] bg-sand-100 px-4 py-3 text-sm text-green-950">
              <span className="mr-2 text-xs font-semibold text-grey-700">{n.date}</span>
              {n.text}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-grey-700">No notes yet.</p>
      )}
    </div>
  );
}
