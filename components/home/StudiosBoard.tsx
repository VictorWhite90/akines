"use client";

import Link from "next/link";
import { useState } from "react";
import Avatar, { AvatarStack } from "@/components/ui/Avatar";
import Photo from "@/components/ui/Photo";
import { STUDIOS, type StudioVisit } from "@/lib/data/community";
import { PEOPLE, type PersonId } from "@/lib/data/people";
import { STUDIO_KEY, type Studio } from "@/lib/data/studio";
import { useLocal } from "@/lib/useLocal";
import { cn } from "@/lib/cn";

const MODES = ["All", "Live", "Virtual", "360°", "VR"] as const;
const GLYPH: Record<StudioVisit["mode"], string> = { Live: "◉", Virtual: "◎", "360°": "◐", VR: "◈" };
const HOW: Record<StudioVisit["mode"], string> = { Live: "Real-time with the maker", Virtual: "A guided hour, six at a time", "360°": "Walk it at your own pace", VR: "Step inside with a headset" };
const VISITORS: Record<string, PersonId[]> = { tunde: ["amara", "leila", "zuri"], thandi: ["efua", "chidi"], kwame: ["nandi", "wanjiru", "ayo", "leila"], ayo: ["fatou"], fatou: ["thandi", "amara"], wanjiru: ["kwame", "zuri", "chidi"], efua: ["chidi"], nandi: ["zuri", "leila"], leila: ["amara", "efua"] };

function Reserve({ mode, className }: { mode: StudioVisit["mode"]; className?: string }) {
  const [done, setDone] = useState(false);
  const walk = mode === "360°";
  return (
    <button onClick={() => setDone((v) => !v)} aria-pressed={done} className={cn("rounded-full px-4 py-2 text-[12px] font-bold transition-colors", done ? "bg-[#eef1db] text-[#415232]" : "bg-night text-white hover:bg-ink-900", className)}>
      {done ? (walk ? "✓ Opening…" : "✓ Place reserved") : walk ? "Walk in" : "Reserve a place"}
    </button>
  );
}

function OpenYourStudio() {
  const [mine] = useLocal<Studio | null>(STUDIO_KEY, null);
  return (
    <Link href="/studio" className="sd-invite">
      <span className="glyph" aria-hidden>✦</span>
      <span className="tx">
        <b>{mine ? mine.name : "Have a studio of your own?"}</b>
        <small>{mine ? (mine.doorOpen ? "Your door is open. Step back into your studio." : "Your door is closed. Step back into your studio.") : "Open your studio: hang your work, pin what you're making, and invite people in."}</small>
      </span>
      <span className="go">{mine ? "Go to my studio →" : "Open your own studio →"}</span>
    </Link>
  );
}

export default function StudiosBoard() {
  const [mode, setMode] = useState<(typeof MODES)[number]>("All");
  const next = STUDIOS[0];
  const nextArtist = PEOPLE[next.artist];
  const shown = STUDIOS.filter((s) => (mode === "All" || s.mode === mode) && s.id !== next.id);

  return (
    <div className="space-y-10">
      <OpenYourStudio />

      {/* Next live visit */}
      <section aria-label="Next live visit" className="overflow-hidden rounded-[26px] border border-line bg-paper-50 shadow-soft">
        <div className="grid md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div className="relative min-h-[260px] bg-paper-200">
            <Photo name={next.photo} sizes="(max-width: 768px) 100vw, 520px" className="absolute inset-0 h-full" position="center 40%" />
            <Link href={`/studios/${next.id}`} aria-label={`Visit ${nextArtist.name}'s studio`} className="absolute inset-0 z-[1]" />
            <span className="pointer-events-none absolute top-4 left-4 z-[2] flex items-center gap-2 rounded-full bg-night/80 px-3 py-1.5 text-[11px] font-semibold text-white backdrop-blur"><span className="live-dot" style={{ width: 7, height: 7, background: "#d9ed6c", borderRadius: "50%", boxShadow: "0 0 0 4px rgba(217,237,108,.2)" }} />Live · {next.when}</span>
          </div>
          <div className="flex flex-col p-6 md:p-8">
            <p className="ac-eyebrow">Next live visit</p>
            <h2 className="font-display mt-2 text-[32px] leading-[1.06] md:text-[38px]">Firing day with <em>{nextArtist.name.split(" ")[0]}.</em></h2>
            <p className="mt-2 flex items-center gap-2.5 text-[13px] text-mute"><Avatar person={nextArtist} size={30} /><Link href={`/studios/${next.id}`} className="hover:text-night hover:underline">{nextArtist.name} · {nextArtist.role}, {next.place}</Link></p>
            <p className="mt-4 max-w-md text-[14px] leading-relaxed text-ink-800">{next.blurb}</p>
            <div className="mt-auto flex flex-wrap items-center gap-4 pt-6">
              <Reserve mode={next.mode} className="!px-6 !py-3 !text-[13px]" />
              <span className="flex items-center gap-2 text-[12px] text-mute"><AvatarStack people={VISITORS[next.id].map((id) => PEOPLE[id])} size={26} max={4} /> {VISITORS[next.id].length} of 6 places taken</span>
            </div>
          </div>
        </div>
      </section>

      {/* Browse */}
      <section aria-label="All studio visits">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="ac-eyebrow">Browse</p>
            <h2 className="font-display mt-1 text-[26px] leading-tight">Choose how you'd like to visit</h2>
          </div>
          <div role="tablist" aria-label="Visit type" className="flex flex-wrap gap-2">
            {MODES.map((m) => (
              <button key={m} role="tab" aria-selected={mode === m} onClick={() => setMode(m)} className={cn("rounded-full border px-3.5 py-1.5 text-[12px] font-semibold transition-colors", mode === m ? "border-night bg-night text-paper-50" : "border-line bg-paper-50 hover:bg-paper-200")}>
                {m !== "All" && <span aria-hidden className="mr-1.5">{GLYPH[m]}</span>}{m}
              </button>
            ))}
          </div>
        </div>

        {shown.length === 0 ? (
          <p className="mt-6 rounded-2xl border border-dashed border-line px-5 py-8 text-center text-[13px] text-mute">No other {mode} visits are scheduled yet. Try another type.</p>
        ) : (
          <ul className="mt-5 grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
            {shown.map((s) => {
              const a = PEOPLE[s.artist];
              return (
                <li key={s.id} className="animate-rise">
                  <article className="group flex h-full flex-col overflow-hidden rounded-[18px] border border-line bg-paper-50 transition-all duration-300 hover:-translate-y-[3px] hover:shadow-lift">
                    <div className="relative h-[150px] overflow-hidden bg-paper-200">
                      <Photo name={s.photo} sizes="(max-width: 768px) 100vw, 320px" className="absolute inset-0 h-full [&_img]:transition-transform [&_img]:duration-700 [&_img]:group-hover:scale-105" position="center 40%" />
                      <Link href={`/studios/${s.id}`} aria-label={`Visit ${a.name}'s studio`} className="absolute inset-0 z-[1]" />
                      <span className="pointer-events-none absolute top-3 left-3 z-10 flex items-center gap-1.5 rounded-full bg-paper-50/95 px-2.5 py-1 text-[10px] font-bold tracking-wide uppercase"><span aria-hidden>{GLYPH[s.mode]}</span>{s.mode}</span>
                    </div>
                    <div className="flex flex-1 flex-col p-4">
                      <p className="text-[10px] font-bold tracking-[0.12em] text-clay-500 uppercase">{s.when}</p>
                      <div className="mt-2 flex items-center gap-2.5">
                        <Avatar person={a} size={34} />
                        <div className="min-w-0 leading-tight"><h3 className="font-display truncate text-[18px]"><Link href={`/studios/${s.id}`} className="hover:underline">{a.name}</Link></h3><p className="truncate text-[11px] text-mute">{a.role} · {s.place}</p></div>
                      </div>
                      <p className="mt-3 line-clamp-3 text-[12px] leading-[1.5] text-mute">{s.blurb}</p>
                      <div className="mt-auto flex items-center justify-between gap-2 pt-4">
                        <span className="text-[10px] text-mute">{HOW[s.mode]}</span>
                        <Reserve mode={s.mode} className="shrink-0 !px-3.5 !py-1.5 !text-[11px]" />
                      </div>
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* How it works */}
      <section aria-label="How a visit works" className="rounded-[22px] border border-[#d8d0c0] bg-[#e7dfcf] p-6">
        <ol className="grid gap-5 md:grid-cols-4">
          {[
            ["Reserve", "Small groups only, so you can actually talk."],
            ["Step in", "Live, guided, 360° or headset. Pick what suits you."],
            ["Ask anything", "About the work, the money, the doubt."],
            ["Take it home", "If something follows you, buy it there and then."],
          ].map(([t, d], i) => (
            <li key={t} className="flex gap-3">
              <span className="font-display text-[26px] leading-none text-clay-500">0{i + 1}</span>
              <div><p className="text-[14px] font-bold">{t}</p><p className="mt-0.5 text-[12px] leading-snug text-[#56605b]">{d}</p></div>
            </li>
          ))}
        </ol>
        <p className="mt-5 text-[12px] text-[#56605b]">Prefer a private hour? <Link href="/rooms" className="font-bold underline underline-offset-4">Try a Presence Room</Link> instead.</p>
      </section>
    </div>
  );
}
