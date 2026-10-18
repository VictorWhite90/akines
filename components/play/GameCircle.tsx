"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Avatar from "@/components/ui/Avatar";
import { KINCIRCLE_PREFILL } from "@/components/circles/CreateKinCircle";
import { AFTER_GAME, PLAY_MODES, type Game, type PlayMode } from "@/lib/data/games";
import { ME, PEOPLE, type PersonId } from "@/lib/data/people";
import { useLocal } from "@/lib/useLocal";
import BackLink from "@/components/ui/BackLink";

/** Warm, varied stand-in answers from the other players, so the prototype feels like a real round. */
const ANSWERS = [
  "Okay, this one made me laugh before I even started typing.",
  "Honestly? I've never told anyone this, but here goes…",
  "Mine is small, but it still matters to me.",
  "I'm going to pass on the details and just say: Lagos, 2014.",
  "This reminded me of my grandmother's kitchen, every time.",
  "I need a minute. Can I come back to this one?",
];

type Answer = { by: PersonId; text: string };
type Chat = { by: PersonId; text: string };

export default function GameCircle({ game, title, players, mode }: { game: Game; title: string; players: PersonId[]; mode: PlayMode }) {
  const router = useRouter();
  const everyone: PersonId[] = players.includes(ME.id as PersonId) ? players : [ME.id as PersonId, ...players];
  const [card, setCard] = useState(0);
  const [answers, setAnswers] = useState<Record<number, Answer[]>>({});
  const [mine, setMine] = useState("");
  const [paused, setPaused] = useState(false);
  const [done, setDone] = useState(false);
  const [chat, setChat] = useState<Chat[]>([{ by: everyone[1] ?? everyone[0], text: "So glad we're doing this 🙂" }]);
  const [chatText, setChatText] = useState("");
  const [memories, setMemories] = useLocal<string[]>(`ak:game-memories:${game.id}`, []);
  const [consent, setConsent] = useState<string | null>(null);
  const [reflections, setReflections] = useState<Record<number, string>>({});
  const [chosen, setChosen] = useState<string[]>([]);

  const prompt = game.cards[card];
  const round = answers[card] ?? [];
  const iAnswered = round.some((a) => a.by === ME.id);
  const turn = everyone[card % everyone.length];
  const modeLabel = PLAY_MODES.find((m) => m.id === mode)!.label;

  const others = everyone.filter((p) => p !== ME.id);
  const fillOthers = (base: Answer[]) => {
    const add = others.filter((p) => !base.some((a) => a.by === p)).slice(0, 3).map((p, i) => ({ by: p, text: ANSWERS[(card * 2 + i) % ANSWERS.length] }));
    return [...base, ...add];
  };

  const answer = () => {
    if (!mine.trim()) return;
    setAnswers((cur) => ({ ...cur, [card]: fillOthers([...(cur[card] ?? []), { by: ME.id as PersonId, text: mine.trim() }]) }));
    setMine("");
  };
  const skip = () => setAnswers((cur) => ({ ...cur, [card]: fillOthers(cur[card] ?? []) }));
  const next = () => (card + 1 < game.cards.length ? setCard(card + 1) : setDone(true));

  const sendChat = () => {
    if (!chatText.trim()) return;
    setChat((c) => [...c, { by: ME.id as PersonId, text: chatText.trim() }]);
    setChatText("");
  };

  if (done) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <div className="text-center">
          <p className="eyebrow text-clay-600">{title} · finished</p>
          <h1 className="font-display mt-2 text-[34px] leading-tight">Before you go, a moment to reflect.</h1>
          <p className="mt-2 text-[14px] text-mute">Answer any, all or none. Reflections stay private unless you share them.</p>
        </div>
        <section className="flex flex-col gap-3 rounded-[22px] border border-line bg-paper-50 p-5">
          {game.reflection.map((q, i) => (
            <label key={q} className="flex flex-col gap-1.5 text-[13.5px] font-semibold">
              {q}
              <input value={reflections[i] ?? ""} onChange={(e) => setReflections((r) => ({ ...r, [i]: e.target.value }))} className="rounded-xl border border-line bg-white px-4 py-2.5 text-[14px] font-normal outline-none focus:border-ink-900" />
            </label>
          ))}
        </section>
        <section>
          <h2 className="font-display text-[22px]">What happens next?</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {AFTER_GAME.map((a) => {
              const on = chosen.includes(a.id);
              const act = () => {
                if (a.id === "circle") {
                  localStorage.setItem(KINCIRCLE_PREFILL, JSON.stringify({ type: "friendship", name: title, purpose: `Grew out of playing “${game.name}” together.`, invitees: everyone }));
                  router.push("/circles/new");
                  return;
                }
                if (a.href) {
                  router.push(a.href);
                  return;
                }
                if (a.id === "memory") setMemories((m) => [`${title}: ${game.cards[0]}`, ...m]);
                setChosen((c) => (c.includes(a.id) ? c : [...c, a.id]));
              };
              return (
                <button key={a.id} onClick={act} className={`rounded-[18px] border p-4 text-left ${on ? "border-ink-900 bg-paper-200" : "border-line bg-paper-50 hover:border-ink-400"}`}>
                  <p className="text-[18px]" aria-hidden>{a.glyph}</p>
                  <p className="mt-1 text-[14px] font-semibold">{a.label}</p>
                  {on && <p className="mt-0.5 text-[12px] text-moss-700">{a.id === "memory" ? "Saved to your shared memories" : "Invitation sent for next week"}</p>}
                </button>
              );
            })}
          </div>
        </section>
        <Link href="/play" className="self-center text-[13px] text-mute hover:text-ink-900">Back to Play Together</Link>
      </div>
    );
  }

  return (
    <div className="grid w-full gap-6 lg:grid-cols-[1fr_300px]">
      <div className="flex min-w-0 flex-col gap-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <BackLink fallback="/play" className="text-[13px] text-mute hover:text-ink-900">← Back</BackLink>
          <div className="flex flex-wrap gap-2 text-[11.5px]">
            <span className="rounded-full bg-paper-200 px-3 py-1">{modeLabel}</span>
            <span className="rounded-full bg-paper-200 px-3 py-1">No audience · no scores</span>
          </div>
        </div>

        <section className="rounded-[26px] bg-night p-5 text-white sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold tracking-[0.14em] text-ochre-300 uppercase">Game Circle · {game.name}</p>
              <h1 className="font-display mt-1 text-[26px]">{title}</h1>
            </div>
            <p className="text-[12px] text-white/60">Card {card + 1} of {game.cards.length}</p>
          </div>

          {/* Players and turn indicator */}
          <ul className="mt-5 flex flex-wrap gap-3">
            {everyone.map((pid) => {
              const answered = round.some((a) => a.by === pid);
              return (
                <li key={pid} className={`flex items-center gap-2 rounded-full py-1 pr-3 pl-1 text-[12.5px] ${pid === turn ? "bg-white/15 ring-1 ring-ochre-300" : "bg-white/5"}`}>
                  <Avatar person={PEOPLE[pid]} size={26} />
                  {pid === ME.id ? "You" : PEOPLE[pid].name.split(" ")[0]}
                  {answered && <span className="text-moss-300" aria-label="answered">✓</span>}
                </li>
              );
            })}
          </ul>

          {/* The shared board */}
          <div className="mt-6 rounded-[22px] bg-paper-50 p-6 text-ink-950 sm:p-8">
            <p className="text-[11px] font-bold tracking-[0.14em] text-clay-600 uppercase">{turn === ME.id ? "Your turn to start" : `${PEOPLE[turn].name.split(" ")[0]} starts this one`}</p>
            <p className="font-display mt-2 text-[26px] leading-snug sm:text-[30px]">{paused ? "Paused. Take your time." : prompt}</p>
          </div>

          {!paused && !iAnswered && (
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <input value={mine} onChange={(e) => setMine(e.target.value)} onKeyDown={(e) => e.key === "Enter" && answer()} placeholder="Share as much or as little as you like…" className="flex-1 rounded-full bg-white/10 px-5 py-3 text-[14.5px] text-white outline-none placeholder:text-white/50 focus:bg-white/15" />
              <button onClick={answer} disabled={!mine.trim()} className="rounded-full bg-ochre-400 px-6 py-3 text-[14px] font-semibold text-ink-950 disabled:opacity-40">Share</button>
            </div>
          )}

          {round.length > 0 && (
            <ul className="mt-4 flex flex-col gap-2">
              {round.map((a) => (
                <li key={a.by} className="flex items-start gap-3 rounded-2xl bg-white/5 p-3">
                  <Avatar person={PEOPLE[a.by]} size={30} />
                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] text-white/60">{a.by === ME.id ? "You" : PEOPLE[a.by].name.split(" ")[0]}</p>
                    <p className="text-[14px]">{a.text}</p>
                  </div>
                  <button onClick={() => setConsent(`${a.by === ME.id ? "You" : PEOPLE[a.by].name.split(" ")[0]}: “${a.text}”`)} className="flex-none rounded-full bg-white/10 px-3 py-1 text-[11px] hover:bg-white/20">Save as memory</button>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-5 flex flex-wrap gap-2">
            {(iAnswered || round.length > 0) && <button onClick={next} className="rounded-full bg-white px-5 py-2.5 text-[13.5px] font-semibold text-ink-950">{card + 1 < game.cards.length ? "Next card" : "Finish the game"}</button>}
            {!iAnswered && !paused && <button onClick={skip} className="rounded-full bg-white/10 px-5 py-2.5 text-[13.5px] font-semibold hover:bg-white/20">Skip, no explanation needed</button>}
            <button onClick={() => setPaused((p) => !p)} className="rounded-full bg-white/10 px-5 py-2.5 text-[13.5px] font-semibold hover:bg-white/20">{paused ? "Resume" : "Pause"}</button>
            <Link href="/play" className="rounded-full px-5 py-2.5 text-[13.5px] font-semibold text-white/70 hover:text-white">Leave quietly</Link>
          </div>
        </section>

        {consent && (
          <div className="rounded-[18px] border border-ochre-400 bg-ochre-200/40 p-4 text-[13px]">
            <p className="font-semibold">Save this to the group&apos;s shared memories?</p>
            <p className="mt-1 text-mute">Everyone in the game is asked first. It&apos;s only saved if they agree.</p>
            <div className="mt-3 flex gap-2">
              <button onClick={() => { setMemories((m) => [consent, ...m]); setConsent(null); }} className="rounded-full bg-night px-4 py-2 font-semibold text-white">Ask and save</button>
              <button onClick={() => setConsent(null)} className="rounded-full border border-ink-900/30 px-4 py-2 font-semibold">Cancel</button>
            </div>
          </div>
        )}
      </div>

      <aside className="flex flex-col gap-4">
        <section className="flex flex-col rounded-[20px] border border-line bg-paper-50 p-4">
          <h2 className="font-display text-[18px]">Side chat</h2>
          <p className="text-[11.5px] text-mute">Only the players can see this.</p>
          <ul className="mt-3 flex max-h-60 flex-col gap-2 overflow-y-auto">
            {chat.map((c, i) => (
              <li key={i} className={`max-w-[85%] rounded-2xl px-3 py-2 text-[13px] ${c.by === ME.id ? "self-end bg-night text-white" : "bg-white"}`}>
                {c.by !== ME.id && <span className="block text-[10.5px] text-mute">{PEOPLE[c.by].name.split(" ")[0]}</span>}
                {c.text}
              </li>
            ))}
          </ul>
          <div className="mt-3 flex gap-2">
            <input value={chatText} onChange={(e) => setChatText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendChat()} placeholder="Say something…" className="min-w-0 flex-1 rounded-full border border-line bg-white px-3.5 py-2 text-[13px] outline-none" />
            <button onClick={sendChat} className="rounded-full bg-night px-3.5 text-[12.5px] font-semibold text-white">Send</button>
          </div>
        </section>
        <section className="rounded-[20px] bg-paper-200 p-4">
          <h2 className="font-display text-[18px]">Shared memories</h2>
          {memories.length === 0 ? (
            <p className="mt-1 text-[12.5px] text-mute">Nothing saved yet. Tap “Save as memory” on any answer, and everyone is asked first.</p>
          ) : (
            <ul className="mt-2 flex flex-col gap-2 text-[12.5px]">{memories.slice(0, 5).map((m) => <li key={m}>❖ {m}</li>)}</ul>
          )}
        </section>
        <section className="rounded-[20px] border border-line p-4 text-[12px] text-mute">
          <p className="font-semibold text-ink-900">Host controls</p>
          <p className="mt-1">The host can pause, skip a card for everyone, or remove a prompt that isn&apos;t landing. Report anything privately from the menu.</p>
        </section>
      </aside>
    </div>
  );
}
