"use client";

import Link from "next/link";
import { useState } from "react";
import Avatar from "@/components/ui/Avatar";
import PageHeader from "@/components/ui/PageHeader";
import Photo from "@/components/ui/Photo";
import { useGames } from "./useGames";
import { GAME_CATEGORIES, GAME_SAFEGUARDS, GAME_SESSIONS, PLAY_MODES, PLAY_OUTCOMES, PLAY_PURPOSES, type GameCategory, type PlayPurpose } from "@/lib/data/games";
import { PEOPLE } from "@/lib/data/people";

export default function PlayHome() {
  const { all } = useGames();
  const [purpose, setPurpose] = useState<PlayPurpose | null>(null);
  const [category, setCategory] = useState<GameCategory | "all">("all");

  const games = all.filter((g) => (purpose ? g.purposes.includes(purpose) : true) && (category === "all" ? true : g.category === category));

  return (
    <div className="flex flex-col gap-9">
      <PageHeader eyebrow="Play Together" title={<>The game is just <em>a reason to connect.</em></>} sub="Play live or slowly with friends, Cliqs and KinCircle members. Talk while you play, then decide what to carry forward together.">
        <div className="flex flex-wrap gap-2">
          <Link href="/play/new" className="rounded-full border border-ink-900/20 px-5 py-3 text-[14px] font-semibold hover:bg-ink-900/5">✦ Create a Game</Link>
          <a href="#choose" className="rounded-full bg-night px-6 py-3 text-[14px] font-semibold text-white hover:bg-ink-800">Choose a Game</a>
        </div>
      </PageHeader>

      {/* Invitations */}
      <section>
        <h2 className="font-display text-[22px]">You&apos;re invited</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          {GAME_SESSIONS.map((s) => {
            const host = PEOPLE[s.host];
            return (
              <Link key={s.id} href={`/play/session/${s.id}`} className="flex flex-col rounded-[18px] border border-line bg-paper-50 p-4 transition-all hover:-translate-y-0.5 hover:shadow-lift">
                <p className="flex items-center gap-1.5 text-[10.5px] font-bold tracking-wide uppercase">
                  {s.live && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-clay-500" />}
                  <span className={s.live ? "text-clay-600" : "text-mute"}>{s.when}</span>
                  <span className="font-normal text-mute normal-case">· {PLAY_MODES.find((m) => m.id === s.mode)!.label}</span>
                </p>
                <p className="mt-2 text-[16px] font-semibold">{s.title}</p>
                <p className="mt-1.5 flex-1 text-[12.5px] leading-relaxed text-mute">{s.why}</p>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex -space-x-2">{s.players.map((id) => <Avatar key={id} person={PEOPLE[id]} size={26} ring />)}</div>
                  <span className="text-[12px] font-semibold">Join {host.name.split(" ")[0]} →</span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Purpose */}
      <section id="choose" className="scroll-mt-24">
        <h2 className="font-display text-[22px]">Why do you want to play?</h2>
        <p className="mt-1 text-[13px] text-mute">Akines recommends games that fit your intention.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {PLAY_PURPOSES.map((p) => (
            <button key={p.id} onClick={() => setPurpose(purpose === p.id ? null : p.id)} aria-pressed={purpose === p.id} className={`flex items-center gap-2 rounded-full border px-4 py-2 text-[13px] ${purpose === p.id ? "border-ink-900 bg-ink-900 text-white" : "border-line bg-paper-50 hover:border-ink-400"}`}>
              <span aria-hidden>{p.glyph}</span>{p.label}
            </button>
          ))}
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
        <section className="min-w-0">
          <div className="flex flex-wrap gap-2">
            {[{ id: "all", label: "All games" }, ...GAME_CATEGORIES].map((c) => (
              <button key={c.id} onClick={() => setCategory(c.id as typeof category)} className={`rounded-full border px-3 py-1.5 text-[12px] ${category === c.id ? "border-ink-900 bg-ink-900 text-white" : "border-line bg-paper-50 text-ink-700 hover:border-ink-400"}`}>{c.label}</button>
            ))}
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {games.map((g) => (
              <Link key={g.id} href={`/play/${g.id}`} className="group flex flex-col overflow-hidden rounded-[18px] border border-line bg-paper-50 transition-all hover:-translate-y-0.5 hover:shadow-lift">
                <Photo name={g.photo} sizes="320px" className="h-[120px]">
                  <span className="absolute top-2.5 left-2.5 rounded-full bg-paper-50/95 px-2.5 py-1 text-[10px] font-bold tracking-wide uppercase">{GAME_CATEGORIES.find((c) => c.id === g.category)!.label}</span>
                  {g.mine && <span className="absolute top-2.5 right-2.5 rounded-full bg-ochre-400 px-2.5 py-1 text-[10px] font-bold uppercase">Yours</span>}
                </Photo>
                <div className="flex flex-1 flex-col p-3.5">
                  <p className="text-[15px] leading-snug font-semibold">{g.name}</p>
                  <p className="mt-1 line-clamp-2 flex-1 text-[12px] leading-relaxed text-mute">{g.blurb}</p>
                  <p className="mt-2.5 text-[11.5px] text-mute">{g.players} players · {g.minutes} min{g.by && ` · by ${PEOPLE[g.by].name.split(" ")[0]}`}</p>
                </div>
              </Link>
            ))}
          </div>
          {games.length === 0 && (
            <p className="mt-4 rounded-[18px] border border-dashed border-line p-8 text-center text-[14px] text-mute">
              No game fits that yet. <Link href="/play/new" className="font-semibold text-ink-900 underline">Create one</Link>, or ask the AI Game Creator.
            </p>
          )}
        </section>

        <aside className="flex flex-col gap-4">
          <section className="rounded-[20px] bg-night p-5 text-white">
            <p className="text-[11px] font-bold tracking-[0.14em] text-ochre-300 uppercase">AI Game Creator</p>
            <p className="font-display mt-2 text-[20px] leading-snug">Describe the game you need, in plain words.</p>
            <p className="mt-2 text-[12.5px] text-white/70">“A gentle game for five artists who just met and may collaborate on an exhibition.”</p>
            <Link href="/play/new#ai" className="mt-4 inline-block rounded-full bg-ochre-400 px-5 py-2.5 text-[13px] font-semibold text-ink-950">Try it</Link>
          </section>
          <section className="rounded-[20px] border border-line bg-paper-50 p-4">
            <h2 className="font-display text-[18px]">What playing has created</h2>
            <p className="text-[11.5px] text-mute">Relationship outcomes, never leaderboards.</p>
            <dl className="mt-3 grid grid-cols-2 gap-3">
              {PLAY_OUTCOMES.map((o) => (
                <div key={o.label} className="rounded-xl bg-white p-3">
                  <dt className="text-[11px] leading-tight text-mute">{o.label}</dt>
                  <dd className="font-display text-[24px]">{o.value}</dd>
                </div>
              ))}
            </dl>
          </section>
          <section className="rounded-[20px] bg-paper-200 p-4">
            <h2 className="font-display text-[18px]">Every game includes</h2>
            <ul className="mt-2 grid gap-1 text-[12.5px]">{GAME_SAFEGUARDS.map((s) => <li key={s}>✓ {s}</li>)}</ul>
          </section>
        </aside>
      </div>
    </div>
  );
}
