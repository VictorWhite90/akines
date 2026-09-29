"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";

const ROWS = [
  { id: "match", title: "Use my Creative DNA to suggest introductions", body: "The signals behind every match stay visible to you.", on: true },
  { id: "show", title: "Show my archetype on my profile", body: "Others see a single line, like “Story-seeker”, never the numbers.", on: false },
  { id: "rooms", title: "Suggest Presence Rooms from my DNA", body: "Rooms that sit close to how you like to talk.", on: true },
  { id: "well", title: "Use wellbeing check-ins for any of this", body: "Never. This is locked off and can't be changed.", on: false, locked: true },
];

export default function DnaControls() {
  const [state, setState] = useState<Record<string, boolean>>(Object.fromEntries(ROWS.map((r) => [r.id, r.on])));
  return (
    <ul className="divide-y divide-line">
      {ROWS.map((r) => {
        const on = state[r.id];
        return (
          <li key={r.id} className="flex items-start justify-between gap-5 py-4 first:pt-0 last:pb-0">
            <div><p className="font-semibold">{r.title}</p><p className="mt-0.5 text-sm text-mute">{r.body}</p></div>
            <button role="switch" aria-checked={on} aria-label={r.title} disabled={r.locked} onClick={() => setState((s) => ({ ...s, [r.id]: !s[r.id] }))} className={cn("relative mt-1 h-7 w-12 shrink-0 rounded-full transition-colors disabled:opacity-50", on ? "bg-moss-500" : "bg-ink-200")}>
              <span className={cn("absolute top-1 h-5 w-5 rounded-full bg-paper-50 shadow-soft transition-all", on ? "left-6" : "left-1")} />
            </button>
          </li>
        );
      })}
    </ul>
  );
}
