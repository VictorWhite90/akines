"use client";

import { useState } from "react";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import Chip, { AiTag } from "@/components/ui/Chip";
import { ME, PEOPLE, type PersonId } from "@/lib/data/people";

export type Match = { id: PersonId; reason: string; signals: string[]; opener: string; ask?: string };

/** One introduction, with the reason for it stated plainly. Not "people you may know". */
export default function IntroCard({ match, compact = false }: { match: Match; compact?: boolean }) {
  const other = PEOPLE[match.id];
  const [state, setState] = useState<"idle" | "writing" | "sent" | "passed">("idle");
  const [text, setText] = useState(match.opener);

  return (
    <div className="card flex h-full flex-col p-6">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-display text-xl leading-tight font-medium">{compact ? "Someone to meet" : "A meaningful introduction"}</h3>
        <AiTag />
      </div>

      <div className="mt-5 flex items-center gap-4">
        <div className="flex items-center">
          <Avatar person={ME} size={compact ? 48 : 56} ring />
          <span className="-mx-1 h-px w-6 border-t-2 border-dashed border-clay-400" aria-hidden />
          <Avatar person={other} size={compact ? 48 : 56} ring />
        </div>
        <div className="min-w-0">
          <p className="truncate font-semibold">{other.name}</p>
          <p className="truncate text-sm text-mute">{other.role} · {other.city}</p>
        </div>
      </div>

      <blockquote className="font-display mt-5 border-l-[3px] border-ochre-400 pl-4 text-[20px] leading-snug text-ink-800 italic">{match.reason}</blockquote>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {match.signals.map((s) => (
          <Chip key={s} tone="paper">{s}</Chip>
        ))}
      </div>

      {match.ask && (
        <div className="mt-5 rounded-2xl bg-paper-100 px-4 py-3">
          <p className="eyebrow mb-1 text-[10px] text-mute">A way to begin</p>
          <p className="text-sm leading-relaxed">{match.ask}</p>
        </div>
      )}

      <div className="mt-auto pt-6">
        {state === "idle" && (
          <div className="grid grid-cols-2 gap-2.5">
            <Button variant="ghost" onClick={() => setState("passed")}>Not now</Button>
            <Button onClick={() => setState("writing")}>Say hello</Button>
          </div>
        )}
        {state === "writing" && (
          <div>
            <label htmlFor={`hello-${match.id}`} className="mb-1.5 block text-xs font-semibold text-mute">Your first message: it opens with the reason above</label>
            <textarea id={`hello-${match.id}`} value={text} onChange={(e) => setText(e.target.value)} rows={3} className="w-full resize-none rounded-2xl border border-line bg-paper-100 p-3 text-sm outline-none focus:border-ink-500" />
            <div className="mt-2.5 flex gap-2.5">
              <Button variant="ghost" size="sm" onClick={() => setState("idle")}>Back</Button>
              <Button size="sm" className="flex-1" onClick={() => setState("sent")} disabled={!text.trim()}>Send hello</Button>
            </div>
          </div>
        )}
        {state === "sent" && (
          <p className="rounded-2xl bg-moss-100 px-4 py-3 text-sm font-medium text-moss-700">Sent. {other.name.split(" ")[0]} will see the reason you were matched, and can reply when ready.</p>
        )}
        {state === "passed" && (
          <p className="text-sm text-mute">
            No problem: we'll suggest fewer like this. <button onClick={() => setState("idle")} className="font-semibold text-ink-900 underline underline-offset-4">Undo</button>
          </p>
        )}
      </div>
    </div>
  );
}
