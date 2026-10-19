"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Avatar from "@/components/ui/Avatar";
import Photo from "@/components/ui/Photo";
import { KINCIRCLE_PREFILL } from "@/components/circles/CreateKinCircle";
import { useBanterReplies, usePollVotes, useResonance } from "./useBanters";
import { BANTER_LIFETIMES, BANTER_MOODS, softenWording, toneCheck, type Banter } from "@/lib/data/banter";
import { ME, PEOPLE, type PersonId } from "@/lib/data/people";
import { newId } from "@/lib/useLocal";

/** Resonance needed before Akines offers to grow a Banter into something bigger. */
const GROW_AT = 3;

/** A Banter in the feed: respond thoughtfully, vote, say you want to explore it, or grow it into a circle. */
export default function BanterCard({ banter, highlight = false }: { banter: Banter; highlight?: boolean }) {
  const router = useRouter();
  const by = PEOPLE[banter.by];
  const mood = BANTER_MOODS.find((m) => m.id === banter.mood)!;
  const life = BANTER_LIFETIMES.find((l) => l.id === banter.lifetime)!;
  const [added, setAdded] = useBanterReplies(banter.id);
  const { ids: resonated, toggle } = useResonance();
  const { votes, vote } = usePollVotes();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [warn, setWarn] = useState(false);

  const replies = [...banter.replies, ...added];
  const latest = replies[replies.length - 1];
  const iResonate = resonated.includes(banter.id);
  const resonance = [...(banter.resonance ?? []), ...(iResonate ? [ME.id as PersonId] : [])];
  const myVote = votes[banter.id];

  const respond = (force = false) => {
    if (!text.trim()) return;
    if (!force && toneCheck(text)) {
      setWarn(true);
      return;
    }
    setAdded((cur) => [...cur, { id: newId("r"), by: ME.id as PersonId, kind: "text", text: text.trim(), ago: "now" }]);
    setText("");
    setWarn(false);
    setOpen(false);
  };

  const grow = () => {
    localStorage.setItem(KINCIRCLE_PREFILL, JSON.stringify({ type: banter.type === "collab" ? "project" : "creative", name: banter.spark?.suggestion ?? banter.prompt.slice(0, 40), purpose: `Grew out of a Banter: “${banter.prompt}”`, invitees: [banter.by, ...resonance] }));
    router.push("/circles/new");
  };

  return (
    <article className={`rounded-[20px] border bg-paper-50 p-4 sm:p-5 ${highlight ? "border-ochre-400 ring-2 ring-ochre-300/60" : "border-line"}`}>
      <div className="flex gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11.5px] text-mute">
            <Avatar person={by} size={28} />
            <span className="font-semibold text-ink-900">{banter.mine ? "You" : by.name}</span>
            <span>· {banter.audienceLabel}</span>
            <span className={`rounded-full px-2 py-0.5 font-semibold ${mood.tone}`}>{mood.label}</span>
            <span>· {banter.ago}</span>
          </div>
          <Link href={`/banter/${banter.id}`} className="mt-2.5 block text-[16.5px] leading-snug font-semibold text-ink-950 hover:underline">{banter.prompt}</Link>
          {banter.media && <p className="mt-2 inline-flex rounded-full bg-paper-200 px-3 py-1 text-[12px]">{banter.media.kind === "music" ? "♪" : "▶"} {banter.media.label}</p>}
        </div>
        {banter.photo && <Photo name={banter.photo} sizes="96px" className="hidden h-24 w-24 flex-none rounded-xl sm:block" />}
      </div>

      {banter.poll && (
        <ul className="mt-3 flex flex-col gap-1.5">
          {banter.poll.options.map((o, i) => {
            const total = banter.poll!.votes.reduce((a, b) => a + b, 0) + (myVote !== undefined ? 1 : 0);
            const n = banter.poll!.votes[i] + (myVote === i ? 1 : 0);
            const pct = total ? Math.round((n / total) * 100) : 0;
            return (
              <li key={o}>
                <button onClick={() => vote(banter.id, i)} className={`relative w-full overflow-hidden rounded-xl border px-3.5 py-2 text-left text-[13px] ${myVote === i ? "border-ink-950" : "border-line bg-white hover:border-ink-400"}`}>
                  {myVote !== undefined && <span className="absolute inset-y-0 left-0 bg-ochre-200/70" style={{ width: `${pct}%` }} aria-hidden />}
                  <span className="relative flex justify-between gap-3"><span>{o}{myVote === i && " ✓"}</span>{myVote !== undefined && <span className="text-mute">{pct}%</span>}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {latest && (
        <Link href={`/banter/${banter.id}`} className="mt-3 flex gap-2.5 rounded-xl bg-paper-200/70 px-3 py-2.5 text-[13px] hover:bg-paper-200">
          <Avatar person={PEOPLE[latest.by]} size={22} />
          <span className="min-w-0 flex-1">
            <span className="font-semibold">{latest.by === ME.id ? "You" : PEOPLE[latest.by].name.split(" ")[0]}</span>{" "}
            <span className="text-ink-700">{latest.kind === "voice" ? `sent a voice note (${latest.length})` : latest.kind === "photo" ? "shared a photograph" : latest.text}</span>
          </span>
          {replies.length > 1 && <span className="flex-none text-[11.5px] text-mute">+{replies.length - 1} more</span>}
        </Link>
      )}

      {open && (
        <div className="mt-3">
          <textarea value={text} onChange={(e) => { setText(e.target.value); setWarn(false); }} rows={2} autoFocus placeholder={mood.id === "encourage" ? "Something kind and useful…" : mood.id === "honest" ? "Be honest, and specific…" : "Add something thoughtful…"} className="w-full resize-none rounded-xl border border-line bg-white px-3.5 py-2.5 text-[14px] outline-none focus:border-ink-900" />
          {warn && (
            <p className="mt-1.5 text-[12px]">This could sound personal. <button onClick={() => setText(softenWording(text))} className="font-semibold underline">Use calmer wording</button> or <button onClick={() => respond(true)} className="font-semibold underline">send anyway</button>.</p>
          )}
          <div className="mt-2 flex justify-end gap-2">
            <button onClick={() => setOpen(false)} className="rounded-full px-4 py-2 text-[12.5px] text-mute">Cancel</button>
            <button onClick={() => respond()} disabled={!text.trim()} className="rounded-full bg-ink-950 px-4 py-2 text-[12.5px] font-semibold text-white disabled:opacity-40">Respond</button>
          </div>
        </div>
      )}

      <div className="bc-acts mt-3.5 flex flex-wrap items-center gap-2 border-t border-line pt-3">
        {!banter.closed && !open && <button onClick={() => setOpen(true)} className="rounded-full bg-ai/15 px-3.5 py-2 text-[12.5px] font-semibold text-ink-900 hover:bg-ai/25">Add a thoughtful response</button>}
        <button onClick={() => toggle(banter.id)} aria-pressed={iResonate} className={`flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-[12.5px] font-semibold ${iResonate ? "border-ink-950 bg-ink-950 text-white" : "border-line bg-white hover:border-ink-400"}`}>
          ✦ {iResonate ? "You want to explore this" : "I want to explore this"}
        </button>
        {resonance.length >= GROW_AT && !banter.closed && (
          <>
            <button onClick={grow} className="rounded-full border border-ink-950 px-3.5 py-2 text-[12.5px] font-semibold hover:bg-ink-950 hover:text-white">Invite {resonance.length} voices into a KinCircle</button>
            <Link href="/rooms/new" className="rounded-full border border-line px-3.5 py-2 text-[12.5px] font-semibold hover:border-ink-400">Reserve a Presence Room</Link>
          </>
        )}
        <span className="ml-auto flex items-center gap-2 text-[11.5px] text-mute">
          {resonance.length > 0 && (
            <span className="flex items-center gap-1.5">
              <span className="flex -space-x-1.5">{resonance.slice(0, 4).map((id) => <Avatar key={id} person={PEOPLE[id]} size={20} ring />)}</span>
              {resonance.length} resonate
            </span>
          )}
          <span>{banter.closed ? "Closed" : life.short}</span>
        </span>
      </div>
    </article>
  );
}
