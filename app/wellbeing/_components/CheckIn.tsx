"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { Lovely } from "iconsax-reactjs";
import Button from "@/components/ui/Button";
import { hasCrisisLanguage } from "../_data";
import SafetyPanel from "./SafetyPanel";

const SCALE = ["Very low", "Low", "Steady", "High", "Very high"];

function Slider({ label, value, onChange, left, right }: { label: string; value: number; onChange: (v: number) => void; left: string; right: string }) {
  const id = useId();
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="text-sm font-semibold text-green-950">
          {label}
        </label>
        <span className="text-xs text-grey-700">{SCALE[value - 1]}</span>
      </div>
      <input
        id={id}
        type="range"
        min={1}
        max={5}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-valuetext={SCALE[value - 1]}
        className="mt-2 w-full cursor-pointer accent-calm"
      />
      <div className="flex justify-between text-[11px] text-grey-700">
        <span>{left}</span>
        <span>{right}</span>
      </div>
    </div>
  );
}

/** A gentle prompt shaped by the check-in — never a score, never stored against you. */
function reflect(energy: number, stress: number, connection: number): { title: string; body: string; link?: { href: string; label: string } } {
  if (stress >= 4 && energy <= 2)
    return {
      title: "It sounds like a heavy stretch.",
      body: "What is one thing you could put down today — not finish, just put down? The work will still be there tomorrow, and so will you.",
      link: { href: "#breathe", label: "Try two minutes of slow breathing" },
    };
  if (connection <= 2)
    return {
      title: "Making alone can get quiet.",
      body: "Is there one person who understands your work you could send a single photo to today? No explanation needed.",
      link: { href: "/circles/textiles", label: "The Textiles Circle meets on Wednesday" },
    };
  if (stress >= 4)
    return {
      title: "Plenty of energy, and plenty of pressure.",
      body: "Which of today's pressures is actually yours, and which did you borrow from someone else's timeline?",
    };
  if (energy >= 4)
    return {
      title: "There's some fire in you today.",
      body: "What would you try if this were an experiment rather than a finished piece? Give yourself one hour to play.",
      link: { href: "/journals", label: "Note the idea in your journal" },
    };
  return {
    title: "A steady day is a good day.",
    body: "What small ritual helped you get here? It might be worth keeping.",
  };
}

/** Quick private check-in (W1): energy, stress, connection → a gentle reflection prompt. */
export default function CheckIn() {
  const [energy, setEnergy] = useState(3);
  const [stress, setStress] = useState(3);
  const [connection, setConnection] = useState(3);
  const [note, setNote] = useState("");
  const [result, setResult] = useState<ReturnType<typeof reflect> | null>(null);
  const [crisis, setCrisis] = useState(false);
  const noteId = useId();

  function submit() {
    if (hasCrisisLanguage(note)) {
      setCrisis(true);
      setResult(null);
      return;
    }
    setCrisis(false);
    setResult(reflect(energy, stress, connection));
  }

  return (
    <div className="flex flex-col gap-5">
      <Slider label="Energy" value={energy} onChange={setEnergy} left="Drained" right="Full" />
      <Slider label="Stress" value={stress} onChange={setStress} left="At ease" right="Stretched" />
      <Slider label="Connection" value={connection} onChange={setConnection} left="Alone" right="Held" />
      <div>
        <label htmlFor={noteId} className="text-sm font-semibold text-green-950">
          Anything on your mind? <span className="font-normal text-grey-700">(optional, private)</span>
        </label>
        <textarea
          id={noteId}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          className="mt-2 w-full rounded-[2px] border border-sand-300 bg-white p-3 text-sm text-green-950"
        />
      </div>
      <Button onClick={submit} variant="outline" className="self-start">
        Check in
      </Button>
      <div aria-live="polite">
        {crisis && <SafetyPanel onClose={() => setCrisis(false)} closeLabel="Back to my check-in" />}
        {result && (
          <div className="rounded-[4px] bg-calm-bg p-4">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-calm">
              <Lovely size={16} variant="Bulk" color="currentColor" aria-hidden /> A reflection for you
            </p>
            <p className="mt-2 font-playfair text-lg text-green-950">{result.title}</p>
            <p className="mt-1 text-sm leading-relaxed text-grey-800">{result.body}</p>
            {result.link && (
              <Link href={result.link.href} className="mt-3 inline-block text-sm font-semibold text-green-950 underline underline-offset-4">
                {result.link.label}
              </Link>
            )}
            <p className="mt-3 text-xs text-grey-700">Saved only to your private history. Not a score, not a diagnosis.</p>
          </div>
        )}
      </div>
    </div>
  );
}
