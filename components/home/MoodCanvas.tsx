"use client";

import { useState } from "react";
import { MOODS, WEEK_MOODS } from "@/lib/data/community";
import { cn } from "@/lib/cn";

const DAYS = ["Fri", "Sat", "Sun", "Mon", "Tue", "Wed", "Today"];

/** A private daily colour with a week strip, for the wellbeing page. */
export default function MoodCanvas({ className }: { className?: string }) {
  const [today, setToday] = useState<string | null>(null);
  const picked = MOODS.find((m) => m.id === today);

  return (
    <section className={cn("card p-6", className)} aria-labelledby="mood-title">
      <h3 id="mood-title" className="font-display text-xl leading-tight">Today's mood canvas</h3>
      <p className="mt-1 text-sm text-mute">Pick a colour for how your creative self is. No score, no judgement.</p>

      <div className="mt-5 grid grid-cols-7 gap-1.5" aria-label="Your last week in colour">
        {DAYS.map((d, i) => {
          const isToday = i === 6;
          const mood = isToday ? picked : MOODS.find((m) => m.id === WEEK_MOODS[i]);
          return (
            <div key={d} className="text-center">
              <div className={cn("aspect-square rounded-xl transition-colors duration-500", mood ? mood.hue : "border-2 border-dashed border-ink-300/60")} title={mood?.word} />
              <span className={cn("mt-1 block text-[10px]", isToday ? "font-bold" : "text-mute")}>{d}</span>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap gap-2" role="radiogroup" aria-label="Choose today's colour">
        {MOODS.map((m) => (
          <button key={m.id} role="radio" aria-checked={today === m.id} onClick={() => setToday(m.id)} className={cn("flex items-center gap-2 rounded-full border py-1.5 pr-3.5 pl-2 text-[13px] font-medium transition-colors", today === m.id ? "border-night bg-paper-200" : "border-line hover:bg-paper-100")}>
            <span className={cn("h-5 w-5 rounded-full", m.hue)} />
            {m.word}
          </button>
        ))}
      </div>

      <div className="mt-4 min-h-[68px]" aria-live="polite">
        {picked ? <p className="animate-rise rounded-2xl bg-paper-100 px-4 py-3 text-sm leading-relaxed">{picked.reply}</p> : <p className="px-1 pt-1 text-sm text-mute italic">A colour is enough. You can add words later in your journal.</p>}
      </div>
      <p className="mt-3 flex items-center gap-1.5 text-xs text-mute"><span aria-hidden>⊛</span> Private to you. Never used for matching, ranking or ads.</p>
    </section>
  );
}
