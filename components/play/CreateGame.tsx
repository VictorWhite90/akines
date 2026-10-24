"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useGames } from "./useGames";
import { draftGameFromPrompt, GAME_CATEGORIES, PLAY_MODES, PLAY_PURPOSES, type Game, type GameDraft } from "@/lib/data/games";
import { ME, type PersonId } from "@/lib/data/people";
import { newId } from "@/lib/useLocal";
import BackLink from "@/components/ui/BackLink";
import Icon from "@/components/ui/Icon";

const BLANK: GameDraft = {
  name: "",
  purpose: "fun",
  category: "icebreakers",
  players: 4,
  mode: "live",
  cards: ["", "", ""],
  turns: "round",
  privacy: "invited",
  end: "cards",
  reflection: ["What surprised you?", "What made you laugh?"],
  reuse: "me",
};

/** Requests the AI Game Creator refuses, whatever the wording. */
const UNSAFE = /humiliat|embarrass|expose|secret|sex|flirt|drunk|dare|insult|roast|rank (their|the) looks|ugly/i;

function Field({ n, label, children }: { n: number; label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-2 border-b border-line py-4 last:border-0 sm:grid-cols-[200px_1fr]">
      <p className="text-[13.5px] font-semibold"><span className="mr-1.5 text-mute">{n}.</span>{label}</p>
      <div>{children}</div>
    </div>
  );
}

function Choice<T extends string>({ value, options, onChange }: { value: T; options: { id: T; label: string }[]; onChange: (v: T) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button key={o.id} type="button" onClick={() => onChange(o.id)} className={`rounded-full border px-3 py-1.5 text-[12.5px] ${value === o.id ? "border-ink-900 bg-ink-900 text-white" : "border-line bg-white hover:border-ink-400"}`}>{o.label}</button>
      ))}
    </div>
  );
}

export default function CreateGame() {
  const router = useRouter();
  const { add } = useGames();
  const [d, setD] = useState<GameDraft>(BLANK);
  const [ask, setAsk] = useState("");
  const [warmups, setWarmups] = useState<string[]>([]);
  const [refused, setRefused] = useState(false);
  const [drafted, setDrafted] = useState(false);

  const set = <K extends keyof GameDraft>(k: K, v: GameDraft[K]) => setD((cur) => ({ ...cur, [k]: v }));
  const setCard = (i: number, v: string) => setD((cur) => ({ ...cur, cards: cur.cards.map((c, j) => (j === i ? v : c)) }));
  const setRefl = (i: number, v: string) => setD((cur) => ({ ...cur, reflection: cur.reflection.map((c, j) => (j === i ? v : c)) }));

  const generate = () => {
    if (UNSAFE.test(ask)) {
      setRefused(true);
      return;
    }
    setRefused(false);
    const g = draftGameFromPrompt(ask);
    setWarmups(g.warmups);
    setD(g);
    setDrafted(true);
  };

  const cards = d.cards.filter((c) => c.trim());
  const canSave = d.name.trim() && cards.length >= 2;

  const save = () => {
    const game: Game = {
      id: newId("game"),
      name: d.name.trim(),
      category: d.category,
      purposes: [d.purpose],
      players: `2–${d.players}`,
      minutes: Math.max(10, cards.length * 6),
      modes: [d.mode, ...(d.mode === "live" ? (["slow"] as const) : (["live"] as const))],
      photo: d.category === "collab" ? "galleryHall" : d.category === "reconnection" ? "photoAlbum" : d.category === "family" ? "journalWindow" : "talkLaugh",
      blurb: `A ${PLAY_PURPOSES.find((p) => p.id === d.purpose)!.label.toLowerCase()} game, made by you.`,
      cards: [...warmups.slice(0, 2), ...cards],
      reflection: d.reflection.filter((r) => r.trim()),
      by: ME.id as PersonId,
      mine: true,
    };
    add(game);
    router.push(`/play/${game.id}`);
  };

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <BackLink fallback="/play" className="text-[13px] text-mute hover:text-ink-900">← Back</BackLink>
      <div>
        <p className="eyebrow text-clay-600">Create a Game</p>
        <h1 className="font-display mt-1 text-[38px] leading-tight">Make a game for your people.</h1>
        <p className="mt-2 text-[15px] text-mute">No technical knowledge needed. Start from a sentence, or build it yourself.</p>
      </div>

      {/* AI Game Creator */}
      <section id="ai" className="scroll-mt-24 rounded-[22px] bg-night p-5 text-white sm:p-6">
        <p className="text-[11px] font-bold tracking-[0.14em] text-ochre-300 uppercase"><Icon name="spark" size={15} className="ic-inline" /> AI Game Creator</p>
        <p className="font-display mt-2 text-[22px]">Describe what you need.</p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <input value={ask} onChange={(e) => setAsk(e.target.value)} onKeyDown={(e) => e.key === "Enter" && ask.trim() && generate()} placeholder="A gentle game for five artists who have just met and may collaborate on an exhibition." className="flex-1 rounded-full bg-white/10 px-5 py-3 text-[14.5px] outline-none placeholder:text-white/45 focus:bg-white/15" />
          <button onClick={generate} disabled={!ask.trim()} className="rounded-full bg-ochre-400 px-6 py-3 text-[14px] font-semibold text-ink-950 disabled:opacity-40">Draft my game</button>
        </div>
        {refused && <p className="mt-3 rounded-xl bg-ruby-500/20 px-4 py-3 text-[13px]">Akines won&apos;t create humiliating, manipulative, discriminatory, sexual or intrusive challenges. Try describing the feeling you want the group to have instead.</p>}
        {drafted && !refused && (
          <div className="mt-4 rounded-xl bg-white/5 p-4 text-[13px]">
            <p className="font-semibold">Drafted below: a structure, six warm-ups, four challenges, rules and a reflection round.</p>
            <p className="mt-1 text-white/70">Review and edit everything. Nothing is sent until you choose to invite people.</p>
            <ul className="mt-3 grid gap-1 text-white/80 sm:grid-cols-2">{warmups.map((w) => <li key={w}>· {w}</li>)}</ul>
          </div>
        )}
      </section>

      {/* Builder */}
      <section className="rounded-[22px] border border-line bg-paper-50 px-5 sm:px-6">
        <Field n={1} label="Game name">
          <input value={d.name} onChange={(e) => set("name", e.target.value)} placeholder="The City Through My Eyes" className="w-full rounded-xl border border-line bg-white px-4 py-2.5 text-[14.5px] outline-none focus:border-ink-900" />
        </Field>
        <Field n={2} label="Purpose">
          <Choice value={d.purpose} options={PLAY_PURPOSES.map((p) => ({ id: p.id, label: p.label }))} onChange={(v) => set("purpose", v)} />
          <div className="mt-3"><Choice value={d.category} options={GAME_CATEGORIES.map((c) => ({ id: c.id, label: c.label }))} onChange={(v) => set("category", v)} /></div>
        </Field>
        <Field n={3} label="Number of players">
          <div className="flex items-center gap-3">
            <input type="range" min={2} max={12} value={d.players} onChange={(e) => set("players", Number(e.target.value))} className="flex-1 accent-ink-900" />
            <span className="w-16 text-[14px] font-semibold">Up to {d.players}</span>
          </div>
        </Field>
        <Field n={4} label="Live or slow play">
          <Choice value={d.mode} options={PLAY_MODES.map((m) => ({ id: m.id, label: m.label }))} onChange={(v) => set("mode", v)} />
        </Field>
        <Field n={5} label="Question or challenge cards">
          <div className="flex flex-col gap-2">
            {d.cards.map((c, i) => (
              <input key={i} value={c} onChange={(e) => setCard(i, e.target.value)} placeholder={i === 0 ? "Share a photograph that represents home without showing a building." : `Card ${i + 1}`} className="rounded-xl border border-line bg-white px-4 py-2.5 text-[14px] outline-none focus:border-ink-900" />
            ))}
            <button type="button" onClick={() => set("cards", [...d.cards, ""])} className="self-start text-[12.5px] font-semibold text-ink-700 hover:text-ink-950">＋ Add a card</button>
          </div>
        </Field>
        <Field n={6} label="Turn structure">
          <Choice value={d.turns} options={[{ id: "round", label: "Take turns in a circle" }, { id: "free", label: "Anyone answers anytime" }, { id: "host", label: "Host picks who's next" }]} onChange={(v) => set("turns", v)} />
        </Field>
        <Field n={7} label="Privacy level">
          <Choice value={d.privacy} options={[{ id: "invited", label: "Only invited players" }, { id: "cliq", label: "My Cliq" }, { id: "circle", label: "My KinCircle" }]} onChange={(v) => set("privacy", v)} />
        </Field>
        <Field n={8} label="End condition">
          <Choice value={d.end} options={[{ id: "cards", label: "When the cards run out" }, { id: "time", label: "After a set time" }, { id: "host", label: "When the host ends it" }]} onChange={(v) => set("end", v)} />
        </Field>
        <Field n={9} label="Reflection questions">
          <div className="flex flex-col gap-2">
            {d.reflection.map((r, i) => (
              <input key={i} value={r} onChange={(e) => setRefl(i, e.target.value)} className="rounded-xl border border-line bg-white px-4 py-2.5 text-[14px] outline-none focus:border-ink-900" />
            ))}
          </div>
        </Field>
        <Field n={10} label="Who can reuse it">
          <Choice value={d.reuse} options={[{ id: "me", label: "Only me" }, { id: "invited", label: "People I play with" }, { id: "community", label: "The Akines community" }]} onChange={(v) => set("reuse", v)} />
        </Field>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[12.5px] text-mute">Every game includes skip, pause, leave quietly and private reporting.</p>
        <button onClick={save} disabled={!canSave} className="rounded-full bg-night px-7 py-3 text-[14px] font-semibold text-white disabled:opacity-40">Save and invite players</button>
      </div>
    </div>
  );
}
