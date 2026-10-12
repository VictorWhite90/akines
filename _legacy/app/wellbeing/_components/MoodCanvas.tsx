"use client";

import { useId, useState } from "react";
import { TickCircle } from "iconsax-reactjs";
import Button from "@/components/ui/Button";
import Chip from "@/components/ui/Chip";
import { cn } from "@/lib/cn";
import { MOOD_COLOURS, MOOD_HISTORY, MOOD_SHAPES, hasCrisisLanguage, type MoodEntry, type MoodShape } from "../_data";
import SafetyPanel from "./SafetyPanel";
import { useWellbeing } from "./WellbeingContext";

export function MoodShapeIcon({ shape, colour, size = 40, className }: { shape: MoodShape; colour: string; size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 40 40" width={size} height={size} aria-hidden className={className}>
      {shape === "circle" && <circle cx="20" cy="20" r="15" fill={colour} />}
      {shape === "square" && <rect x="6" y="6" width="28" height="28" rx="3" fill={colour} />}
      {shape === "triangle" && <path d="M20 5 L36 34 L4 34 Z" fill={colour} />}
      {shape === "wave" && <path d="M3 22 C 9 10, 15 10, 20 20 S 31 30, 37 18" stroke={colour} strokeWidth="6" fill="none" strokeLinecap="round" />}
      {shape === "spiral" && (
        <path d="M20 20 m0 -2 a2 2 0 1 1 -2 2 a5 5 0 1 1 5 5 a9 9 0 1 1 9 -9 a13 13 0 1 1 -13 -13" stroke={colour} strokeWidth="3.5" fill="none" strokeLinecap="round" />
      )}
    </svg>
  );
}

/** Daily Mood Canvas: a colour, a shape and one word, kept privately (W1). */
export default function MoodCanvas() {
  const { hasHistory } = useWellbeing();
  const [colour, setColour] = useState(MOOD_COLOURS[0]);
  const [shape, setShape] = useState<MoodShape>("circle");
  const [word, setWord] = useState("");
  const [history, setHistory] = useState<MoodEntry[]>(hasHistory ? MOOD_HISTORY : []);
  const [status, setStatus] = useState("");
  const [crisis, setCrisis] = useState(false);
  const wordId = useId();

  const cleanWord = word.trim().split(/\s+/)[0] ?? "";
  const savedToday = history.some((h) => h.date === "Today");

  function save() {
    if (hasCrisisLanguage(word)) {
      setCrisis(true);
      setStatus("");
      return;
    }
    if (!cleanWord) {
      setStatus("Add one word for today — any word at all.");
      return;
    }
    setCrisis(false);
    const entry: MoodEntry = { id: `today-${Date.now()}`, date: "Today", colour: colour.hex, colourName: colour.name, shape, word: cleanWord.toLowerCase() };
    setHistory((prev) => [...prev.filter((h) => h.date !== "Today"), entry].slice(-7));
    setStatus(`Saved privately: ${colour.name.toLowerCase()} ${shape}, “${cleanWord.toLowerCase()}”. Only you can see this.`);
  }

  return (
    <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_220px]">
      <div className="flex min-w-0 flex-col gap-5">
        <fieldset>
          <legend className="text-sm font-semibold text-green-950">Pick a colour</legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {MOOD_COLOURS.map((c) => (
              <button
                key={c.name}
                type="button"
                aria-pressed={colour.name === c.name}
                aria-label={c.name}
                title={c.name}
                onClick={() => setColour(c)}
                className={cn(
                  "h-10 w-10 cursor-pointer rounded-full border-2 transition-transform",
                  colour.name === c.name ? "scale-110 border-green-950 ring-2 ring-white ring-offset-2 ring-offset-green-950" : "border-white shadow-sm",
                )}
                style={{ backgroundColor: c.hex }}
              />
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend className="text-sm font-semibold text-green-950">Pick a shape</legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {MOOD_SHAPES.map((s) => (
              <Chip key={s.id} selected={shape === s.id} onToggle={() => setShape(s.id)} icon={<MoodShapeIcon shape={s.id} colour="currentColor" size={16} />}>
                {s.label}
              </Chip>
            ))}
          </div>
        </fieldset>
        <div>
          <label htmlFor={wordId} className="text-sm font-semibold text-green-950">
            One word for today
          </label>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
            <input
              id={wordId}
              value={word}
              onChange={(e) => setWord(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && save()}
              maxLength={40}
              placeholder="e.g. tender, scattered, hopeful"
              className="h-11 min-w-0 flex-1 rounded-[2px] border border-sand-300 bg-white px-3 text-sm text-green-950 placeholder:text-grey-600"
            />
            <Button onClick={save}>{savedToday ? "Update today" : "Save privately"}</Button>
          </div>
        </div>
        <div aria-live="polite">
          {crisis ? (
            <SafetyPanel onClose={() => setCrisis(false)} closeLabel="Back to my canvas" />
          ) : (
            status && (
              <p className="flex items-start gap-2 text-sm text-calm">
                <TickCircle size={18} variant="Bulk" color="currentColor" className="mt-px shrink-0" aria-hidden />
                {status}
              </p>
            )
          )}
        </div>
      </div>

      <div className="flex flex-col items-center justify-center gap-3 rounded-[4px] bg-sand-100 p-6" aria-label={`Preview of today's canvas: ${colour.name} ${shape}${cleanWord ? `, “${cleanWord}”` : ""}`} role="img">
        <MoodShapeIcon shape={shape} colour={colour.hex} size={120} />
        <p className="font-playfair text-lg italic text-green-950">{cleanWord ? cleanWord.toLowerCase() : "…"}</p>
      </div>

      <div className="md:col-span-2">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-grey-700">Your last week · private</p>
        {history.length === 0 ? (
          <p className="mt-2 text-sm text-grey-700">Nothing saved yet. Your canvases will gather here — only for you.</p>
        ) : (
          <ol className="mt-3 flex flex-wrap gap-2">
            {history.map((h) => (
              <li
                key={h.id}
                className={cn("flex w-20 shrink-0 flex-col items-center gap-1 rounded-[4px] border bg-white p-2 text-center", h.date === "Today" ? "border-green-950" : "border-sand-200")}
              >
                <MoodShapeIcon shape={h.shape} colour={h.colour} size={32} />
                <span className="w-full truncate text-xs text-green-950">{h.word}</span>
                <span className="text-[10px] text-grey-700">
                  {h.date}
                  <span className="sr-only">: {h.colourName} {h.shape}</span>
                </span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
