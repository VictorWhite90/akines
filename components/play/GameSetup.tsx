"use client";

import Link from "next/link";
import { useState } from "react";
import Avatar from "@/components/ui/Avatar";
import GameCover from "./GameCover";
import GameCircle from "./GameCircle";
import { useGames } from "./useGames";
import { GAME_CATEGORIES, PLAY_AUDIENCES, PLAY_MODES, PLAY_PURPOSES, type PlayMode } from "@/lib/data/games";
import { allPeople, ME, type PersonId } from "@/lib/data/people";
import BackLink from "@/components/ui/BackLink";

const others = allPeople.filter((p) => p.id !== ME.id);

export default function GameSetup({ id }: { id: string }) {
  const { all } = useGames();
  const game = all.find((g) => g.id === id);
  const [mode, setMode] = useState<PlayMode | null>(null);
  const [audience, setAudience] = useState(PLAY_AUDIENCES[0]);
  const [invite, setInvite] = useState<PersonId[]>([]);
  const [why, setWhy] = useState("");
  const [started, setStarted] = useState(false);

  if (!game) {
    return (
      <div className="mx-auto max-w-xl py-16 text-center">
        <p className="font-display text-[26px]">We couldn&apos;t find that game.</p>
        <Link href="/play" className="mt-6 inline-block rounded-full bg-night px-6 py-3 text-[14px] font-semibold text-white">Back to Play Together</Link>
      </div>
    );
  }

  const chosenMode = mode ?? game.modes[0];
  if (started) return <GameCircle game={game} title={game.name} players={invite} mode={chosenMode} />;

  const maxPlayers = Number(game.players.split("–").pop()) || 8;
  const toggle = (pid: PersonId) => setInvite((cur) => (cur.includes(pid) ? cur.filter((x) => x !== pid) : cur.length + 1 >= maxPlayers ? cur : [...cur, pid]));
  const purposeLabels = game.purposes.map((p) => PLAY_PURPOSES.find((x) => x.id === p)!.label);
  const defaultWhy = `${ME.name.split(" ")[0]} invited you to play “${game.name}” to ${purposeLabels[0].toLowerCase()}.`;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <BackLink fallback="/play" className="text-[13px] text-mute hover:text-ink-900">← Back</BackLink>

      <div className="grid gap-6 md:grid-cols-[1fr_340px]">
        <div className="flex flex-col gap-5">
          <div>
            <p className="eyebrow text-clay-600">{GAME_CATEGORIES.find((c) => c.id === game.category)!.label}</p>
            <h1 className="font-display mt-1 text-[38px] leading-tight">{game.name}</h1>
            <p className="mt-2 text-[15.5px] leading-relaxed text-mute">{game.blurb}</p>
            <p className="mt-3 flex flex-wrap gap-2 text-[12px]">
              {purposeLabels.map((p) => <span key={p} className="rounded-full bg-paper-200 px-3 py-1">{p}</span>)}
              <span className="rounded-full border border-line px-3 py-1 text-mute">{game.players} players · {game.minutes} min</span>
            </p>
          </div>

          <section className="rounded-[20px] border border-line bg-paper-50 p-5">
            <h2 className="font-display text-[20px]">1. How will you play?</h2>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {PLAY_MODES.filter((m) => game.modes.includes(m.id)).map((m) => (
                <button key={m.id} onClick={() => setMode(m.id)} className={`rounded-xl border p-3.5 text-left ${chosenMode === m.id ? "border-ink-900 bg-ink-900 text-white" : "border-line bg-white hover:border-ink-400"}`}>
                  <p className="text-[14px] font-semibold">{m.label}</p>
                  <p className={`mt-0.5 text-[12px] ${chosenMode === m.id ? "text-white/70" : "text-mute"}`}>{m.body}</p>
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-[20px] border border-line bg-paper-50 p-5">
            <h2 className="font-display text-[20px]">2. Who should play?</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {PLAY_AUDIENCES.map((a) => (
                <button key={a} onClick={() => setAudience(a)} className={`rounded-full border px-3 py-1.5 text-[12.5px] ${audience === a ? "border-ink-900 bg-ink-900 text-white" : "border-line bg-white"}`}>{a}</button>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {others.map((p) => (
                <button key={p.id} onClick={() => toggle(p.id as PersonId)} className={`flex items-center gap-2 rounded-full border py-1 pr-3 pl-1 text-[12.5px] ${invite.includes(p.id as PersonId) ? "border-ink-900 bg-ink-900 text-white" : "border-line bg-white hover:border-ink-400"}`}>
                  <Avatar person={p} size={24} />{p.name.split(" ")[0]}
                </button>
              ))}
            </div>
            <label className="mt-4 flex flex-col gap-1.5 text-[13px] font-semibold">
              Why are you inviting them?
              <textarea rows={2} value={why} onChange={(e) => setWhy(e.target.value)} placeholder={defaultWhy} className="resize-none rounded-xl border border-line bg-white px-4 py-3 text-[14px] font-normal outline-none focus:border-ink-900" />
              <span className="text-[11.5px] font-normal text-mute">A personal reason feels warmer than a generic notification. Everyone sees it on their invitation.</span>
            </label>
          </section>
        </div>

        <aside className="flex flex-col gap-4">
          <GameCover game={game} className="big aspect-[4/3] rounded-[20px]" />
          <section className="rounded-[20px] border border-line bg-paper-50 p-4">
            <h2 className="font-display text-[18px]">Cards in this game</h2>
            <ol className="mt-2 flex flex-col gap-2 text-[13px]">{game.cards.map((c, i) => <li key={c} className="flex gap-2"><span className="text-mute">{i + 1}.</span>{c}</li>)}</ol>
          </section>
          <section className="rounded-[20px] bg-paper-200 p-4">
            <p className="text-[12px] font-semibold">Invitation preview</p>
            <p className="mt-1.5 text-[13px] leading-relaxed">“{why.trim() || defaultWhy}”</p>
          </section>
          <button onClick={() => setStarted(true)} disabled={invite.length === 0 && chosenMode !== "person"} className="rounded-full bg-night py-3.5 text-[14.5px] font-semibold text-white disabled:opacity-40">
            Send invitations and start
          </button>
          {invite.length === 0 && chosenMode !== "person" && <p className="-mt-2 text-center text-[11.5px] text-mute">Invite at least one person.</p>}
        </aside>
      </div>
    </div>
  );
}
