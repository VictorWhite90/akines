"use client";

import { useState, type FormEvent } from "react";
import { TickCircle } from "iconsax-reactjs";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Chip from "@/components/ui/Chip";
import Media from "@/components/ui/Media";
import { IMG } from "@/lib/data";
import { cn } from "@/lib/cn";

const WORKS = [
  { id: "indigo", title: "Indigo Crossing", note: "Hand-dyed indigo, salvaged cloth", image: IMG.textile },
  { id: "river", title: "What the River Kept", note: "Beadwork and thread, in progress", image: IMG.beads },
  { id: "resist", title: "Resist test, round 3", note: "Studio test on paper", image: IMG.paperPrints },
];

const FOCUS = ["Composition", "Colour & material", "Artist statement", "Pricing", "Ready for open calls?"];

const WHO = [
  { id: "peers", label: "Peers in this circle", hint: "Two or three members, usually within a few days." },
  { id: "mentor", label: "A mentor", hint: "A verified, more experienced artist or curator. Slower, deeper." },
] as const;

export default function FeedbackRequestForm({ circleName }: { circleName: string }) {
  const [works, setWorks] = useState<Set<string>>(new Set(["indigo"]));
  const [focus, setFocus] = useState<Set<string>>(new Set());
  const [question, setQuestion] = useState("");
  const [who, setWho] = useState<(typeof WHO)[number]["id"]>("peers");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  function toggle(set: Set<string>, value: string, update: (s: Set<string>) => void) {
    const next = new Set(set);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    update(next);
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (works.size === 0) return setError("Choose at least one work to share.");
    if (focus.size === 0 && !question.trim()) return setError("Tell reviewers what kind of feedback would help.");
    setError("");
    setSent(true);
  }

  return (
    <Card className="p-5 sm:p-6">
      <p className="sr-only" aria-live="polite">{sent ? "Feedback request sent." : ""}</p>
      {sent ? (
        <div className="flex flex-col gap-3">
          <p className="flex items-center gap-2 font-playfair text-xl font-semibold text-green-950">
            <TickCircle size={22} variant="Bulk" color="var(--color-verified)" aria-hidden /> Request sent
          </p>
          <p className="text-sm text-grey-800">
            {works.size} {works.size === 1 ? "work" : "works"} shared with {who === "peers" ? `peers in ${circleName}` : "a mentor"}.
            {" "}Images are watermarked and visible only inside this circle. You&apos;ll get written feedback, not ratings.
          </p>
          <Button size="sm" variant="outline" className="self-start" onClick={() => setSent(false)}>Edit or send another</Button>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
          <fieldset className="min-w-0">
            <legend className="text-sm font-semibold text-green-950">Choose works to share</legend>
            <ul className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {WORKS.map((w) => {
                const checked = works.has(w.id);
                return (
                  <li key={w.id}>
                    <label className={cn("flex h-full cursor-pointer flex-col overflow-hidden rounded-[4px] border", checked ? "border-green-950 ring-1 ring-green-950" : "border-sand-200")}>
                      <Media src={w.image} alt="" ratio="4/3" sizes="(max-width: 640px) 100vw, 200px" />
                      <span className="flex items-start gap-2 p-3">
                        <input type="checkbox" checked={checked} onChange={() => toggle(works, w.id, setWorks)} className="mt-0.5 h-4 w-4 shrink-0 accent-green-950" />
                        <span className="text-sm">
                          <span className="block font-semibold text-green-950">{w.title}</span>
                          <span className="block text-xs text-grey-700">{w.note}</span>
                        </span>
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
            <p className="mt-2 text-xs text-grey-700">Placeholder works from your portfolio. Watermarked when shared.</p>
          </fieldset>

          <fieldset className="min-w-0">
            <legend className="text-sm font-semibold text-green-950">What feedback do you want?</legend>
            <div className="mt-3 flex flex-wrap gap-2">
              {FOCUS.map((f) => (
                <Chip key={f} selected={focus.has(f)} onToggle={() => toggle(focus, f, setFocus)}>{f}</Chip>
              ))}
            </div>
            <label htmlFor="feedback-question" className="mt-4 block text-sm text-grey-800">Anything specific? (optional)</label>
            <textarea
              id="feedback-question"
              rows={3}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g. Does the indigo read as a map, or just as texture?"
              className="mt-1.5 w-full rounded-[2px] border border-sand-300 bg-white px-3 py-2.5 text-sm text-green-950 placeholder:text-grey-700"
            />
          </fieldset>

          <fieldset className="min-w-0">
            <legend className="text-sm font-semibold text-green-950">From whom?</legend>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {WHO.map((o) => (
                <label key={o.id} className={cn("flex cursor-pointer items-start gap-3 rounded-[4px] border p-3", who === o.id ? "border-green-950 bg-sand-50" : "border-sand-200")}>
                  <input type="radio" name="feedback-who" checked={who === o.id} onChange={() => setWho(o.id)} className="mt-0.5 h-4 w-4 shrink-0 accent-green-950" />
                  <span className="text-sm">
                    <span className="block font-semibold text-green-950">{o.label}</span>
                    <span className="block text-xs text-grey-700">{o.hint}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          {error && <p role="alert" className="text-sm font-semibold text-alert">{error}</p>}
          <Button type="submit" className="self-start">Request feedback</Button>
        </form>
      )}
    </Card>
  );
}
