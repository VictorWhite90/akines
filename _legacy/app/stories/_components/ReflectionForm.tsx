"use client";

import { useState, type FormEvent } from "react";
import { Home2, Microphone2, RecordCircle, TickCircle, Trash } from "iconsax-reactjs";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import TrustLabel from "@/components/ui/TrustLabel";
import { ME } from "@/lib/data";

type Added = { text: string; livesIn: string; audio: boolean };

/** Owner-only form: adds a collector reflection to the work's living history (C8, C9). */
export default function ReflectionForm({ storyTitle }: { storyTitle: string }) {
  const [text, setText] = useState("");
  const [livesIn, setLivesIn] = useState("");
  const [audio, setAudio] = useState<"none" | "recording" | "attached">("none");
  const [added, setAdded] = useState<Added[]>([]);
  const [error, setError] = useState("");

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!text.trim()) {
      setError("Write a line or two first — even one sentence is enough.");
      return;
    }
    setAdded((prev) => [...prev, { text: text.trim(), livesIn: livesIn.trim(), audio: audio === "attached" }]);
    setText("");
    setLivesIn("");
    setAudio("none");
    setError("");
  }

  return (
    <div className="flex flex-col gap-4">
      {added.map((entry, i) => (
        <article key={i} className="rounded-[4px] border border-gold-400 bg-white p-5">
          <div className="flex flex-wrap items-center gap-3">
            <Avatar name={ME.name} size="sm" verified={ME.verified} />
            <p className="text-sm font-semibold text-green-950">{ME.name} <span className="font-normal text-grey-700">· Just now</span></p>
            <TrustLabel source="self-declared" compact />
          </div>
          <p className="mt-3 text-sm leading-relaxed text-grey-800">{entry.text}</p>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-grey-700">
            {entry.livesIn && <span className="flex items-center gap-1"><Home2 size={14} color="currentColor" aria-hidden /> Lives in: {entry.livesIn}</span>}
            {entry.audio && <span className="flex items-center gap-1"><Microphone2 size={14} color="currentColor" aria-hidden /> Audio reflection attached (0:24)</span>}
          </div>
        </article>
      ))}

      <form onSubmit={submit} className="rounded-[4px] border border-sand-200 bg-sand-100 p-5" aria-labelledby="reflect-heading">
        <h3 id="reflect-heading" className="font-playfair text-lg font-semibold text-green-950">Add your reflection</h3>
        <p className="mt-1 text-sm text-grey-700">
          Shown as if you owned <em>{storyTitle}</em>. Why you bought it, what changed, how it feels, who lives with it. Your words join its legacy and pass to future owners.
        </p>

        <label htmlFor="reflection-text" className="mt-4 block text-sm font-semibold text-green-950">Your reflection</label>
        <textarea
          id="reflection-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          aria-invalid={!!error}
          aria-describedby={error ? "reflection-error" : undefined}
          placeholder="The first morning it hung in our flat…"
          className="mt-2 w-full rounded-[2px] border border-sand-300 bg-white p-3 text-sm text-green-950 placeholder:text-grey-700"
        />
        {error && <p id="reflection-error" className="mt-1 text-sm text-alert">{error}</p>}

        <label htmlFor="reflection-lives" className="mt-4 block text-sm font-semibold text-green-950">Where it lives <span className="font-normal text-grey-700">(optional)</span></label>
        <input
          id="reflection-lives"
          value={livesIn}
          onChange={(e) => setLivesIn(e.target.value)}
          placeholder="e.g. Above the dining table, Ikoyi"
          className="mt-2 h-11 w-full rounded-[2px] border border-sand-300 bg-white px-3 text-sm text-green-950 placeholder:text-grey-700"
        />

        <div className="mt-4">
          <p className="text-sm font-semibold text-green-950">Audio note <span className="font-normal text-grey-700">(optional)</span></p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            {audio === "none" && (
              <Button variant="outline" size="sm" onClick={() => setAudio("recording")} icon={<Microphone2 size={16} color="currentColor" aria-hidden />}>
                Record a voice reflection
              </Button>
            )}
            {audio === "recording" && (
              <>
                <span className="flex items-center gap-1.5 text-sm text-alert"><RecordCircle size={16} variant="Bold" color="currentColor" aria-hidden /> Recording… (placeholder)</span>
                <Button variant="outline" size="sm" onClick={() => setAudio("attached")}>Stop and attach</Button>
              </>
            )}
            {audio === "attached" && (
              <>
                <span className="flex items-center gap-1.5 text-sm text-verified"><TickCircle size={16} variant="Bold" color="currentColor" aria-hidden /> Voice reflection attached · 0:24</span>
                <Button variant="ghost" size="sm" onClick={() => setAudio("none")} icon={<Trash size={16} color="currentColor" aria-hidden />}>Remove</Button>
              </>
            )}
          </div>
          <p className="mt-1 text-xs text-grey-700">Prototype placeholder — nothing is actually recorded.</p>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Button type="submit">Add to its legacy</Button>
          <p className="text-xs text-grey-700">Marked self-declared. You can edit or remove it later.</p>
        </div>
        <p aria-live="polite" className="mt-3 text-sm font-semibold text-verified">
          {added.length > 0 && `Added. Your reflection is now part of ${storyTitle}'s living history.`}
        </p>
      </form>
    </div>
  );
}
