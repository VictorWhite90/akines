"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Lovely, Setting2 } from "iconsax-reactjs";
import { ME } from "@/lib/data/people";
import { PRESENCE, PRESENCE_LABEL, type PresenceState } from "@/lib/data/village";
import { cn } from "@/lib/cn";
import { PresenceAvatar } from "@/components/village/Presence";

const OPTIONS: { state: PresenceState; hint: string }[] = [
  { state: "studio", hint: "Making work — messages wait politely" },
  { state: "around", hint: "Open to a chat" },
  { state: "quiet", hint: "No pings. Only collaborators you choose can reach you" },
  { state: "away", hint: "Offline" },
];

/** Your creative presence, plus the two personal doors: wellbeing and settings. */
export default function UserPanel() {
  const [state, setState] = useState<PresenceState>(PRESENCE[ME.id].state);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !ref.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("mousedown", close);
    window.addEventListener("keydown", close);
    return () => {
      window.removeEventListener("mousedown", close);
      window.removeEventListener("keydown", close);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative flex items-center gap-2 bg-night-950/60 px-2 py-2">
      <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-haspopup="menu" className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 rounded-[6px] px-1 py-1 text-left hover:bg-night-700">
        <PresenceAvatar personId={ME.id} name={ME.name} size="sm" ring="ring-night-900" state={state} />
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold text-white">{ME.name.split(" ")[0]}</span>
          <span className="block truncate text-xs text-night-muted">{state === "studio" ? PRESENCE[ME.id].activity : PRESENCE_LABEL[state]}</span>
        </span>
      </button>
      <Link href="/wellbeing" aria-label="Wellbeing (private)" title="Wellbeing — private" className="rounded-[6px] p-2 text-night-muted hover:bg-night-700 hover:text-white">
        <Lovely size={18} color="currentColor" aria-hidden />
      </Link>
      <Link href="/dna" aria-label="Creative DNA & settings" title="Creative DNA & settings" className="rounded-[6px] p-2 text-night-muted hover:bg-night-700 hover:text-white">
        <Setting2 size={18} color="currentColor" aria-hidden />
      </Link>

      {open && (
        <div role="menu" className="absolute bottom-full left-2 z-50 mb-2 w-72 rounded-[10px] border border-night-600 bg-night-900 p-2 shadow-2xl">
          <p className="px-3 py-2 text-[11px] font-bold uppercase tracking-[0.1em] text-night-muted">Set your presence</p>
          {OPTIONS.map((o) => (
            <button
              key={o.state}
              type="button"
              role="menuitemradio"
              aria-checked={state === o.state}
              onClick={() => {
                setState(o.state);
                setOpen(false);
              }}
              className={cn("flex w-full cursor-pointer items-start gap-3 rounded-[6px] px-3 py-2 text-left hover:bg-night-700", state === o.state && "bg-night-700")}
            >
              <PresenceAvatar personId={ME.id} name={ME.name} size="xs" ring="ring-night-900" state={o.state} />
              <span>
                <span className="block text-sm font-semibold text-white">{PRESENCE_LABEL[o.state]}</span>
                <span className="block text-xs text-night-muted">{o.hint}</span>
              </span>
            </button>
          ))}
          <div className="my-2 h-px bg-night-700" />
          <Link href={`/people/${ME.id}`} onClick={() => setOpen(false)} className="block rounded-[6px] px-3 py-2 text-sm text-night-text hover:bg-night-700">
            View your profile
          </Link>
        </div>
      )}
    </div>
  );
}
