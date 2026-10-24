"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Avatar from "@/components/ui/Avatar";
import Photo from "@/components/ui/Photo";
import { KINCIRCLE_PREFILL } from "@/components/circles/kincircleDraft";
import { useBanterReplies, useBanters, usePollVotes, useResonance } from "./useBanters";
import { BANTER_LIFETIMES, BANTER_MOODS, REACTIONS, toneCheck, type BanterReply } from "@/lib/data/banter";
import type { PhotoKey } from "@/lib/data/images";
import { ME, PEOPLE, type PersonId } from "@/lib/data/people";
import { newId, useLocal } from "@/lib/useLocal";
import BackLink from "@/components/ui/BackLink";
import Icon from "@/components/ui/Icon";

const BOUNDARIES = ["Don't include me in this kind of Banter", "Mute this subject", "Leave quietly", "Report privately", "Ask the creator to clarify", "Limit mentions"];
const REPLY_PHOTOS: PhotoKey[] = ["studioEasel", "clayBowl", "textileRolls", "beadsHung"];

function VoiceNote({ length }: { length: string }) {
  const [playing, setPlaying] = useState(false);
  return (
    <button onClick={() => setPlaying((p) => !p)} className="mt-2 flex w-full max-w-[280px] items-center gap-3 rounded-full bg-paper-200 py-2 pr-4 pl-2 text-left" aria-label={playing ? "Pause voice note" : "Play voice note"}>
      <span className="grid h-8 w-8 flex-none place-items-center rounded-full bg-night text-[11px] text-white"><Icon name={playing ? "pause" : "play-media"} size={14} /></span>
      <span className="flex h-6 flex-1 items-center gap-[3px]" aria-hidden>
        {Array.from({ length: 24 }, (_, i) => (
          <span key={i} className={`w-[3px] rounded-full ${playing ? "animate-pulse bg-ink-900" : "bg-ink-400"}`} style={{ height: `${30 + ((i * 37) % 70)}%`, animationDelay: `${i * 40}ms` }} />
        ))}
      </span>
      <span className="text-[11.5px] text-mute">{length}</span>
    </button>
  );
}

export default function BanterThread({ id }: { id: string }) {
  const router = useRouter();
  const { all, close } = useBanters();
  const banter = all.find((b) => b.id === id);
  const [added, setAdded] = useBanterReplies(id);
  const [myReactions, setMyReactions] = useLocal<string[]>(`ak:banter-react:${id}`, []);
  const [insights, setInsights] = useLocal<string[]>("ak:banter-insights", []);
  const [text, setText] = useState("");
  const [photo, setPhoto] = useState<PhotoKey | undefined>();
  const [attach, setAttach] = useState(false);
  const [recording, setRecording] = useState(0);
  const [toneWarn, setToneWarn] = useState(false);
  const [toast, setToast] = useState("");
  const [menu, setMenu] = useState(false);
  const [ai, setAi] = useState(false);
  const { ids: resonated, toggle: toggleResonance } = useResonance();
  const { votes, vote } = usePollVotes();

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    if (!recording) return;
    const t = setInterval(() => setRecording((r) => r + 1), 1000);
    return () => clearInterval(t);
  }, [recording]);

  if (!banter) {
    return (
      <div className="mx-auto max-w-xl py-16 text-center">
        <p className="font-display text-[26px]">This Banter has ended.</p>
        <p className="mt-2 text-mute">Casual Banter naturally expires. Anything important was saved as an insight.</p>
        <Link href="/banter" className="mt-6 inline-block rounded-full bg-night px-6 py-3 text-[14px] font-semibold text-white">Back to Banter</Link>
      </div>
    );
  }

  const by = PEOPLE[banter.by];
  const mood = BANTER_MOODS.find((m) => m.id === banter.mood)!;
  const life = BANTER_LIFETIMES.find((l) => l.id === banter.lifetime)!;
  const replies = [...banter.replies, ...added];
  const mine = banter.mine;

  const send = (reply: Omit<BanterReply, "id" | "by" | "ago">, force = false) => {
    if (!force && reply.text && toneCheck(reply.text)) {
      setToneWarn(true);
      return;
    }
    setAdded((cur) => [...cur, { ...reply, id: newId("r"), by: ME.id as PersonId, ago: "now" }]);
    setText("");
    setPhoto(undefined);
    setAttach(false);
    setToneWarn(false);
  };

  const stopRecording = () => {
    const secs = Math.max(recording - 1, 1);
    setRecording(0);
    send({ kind: "voice", length: `0:${String(secs).padStart(2, "0")}` }, true);
  };

  const react = (r: string) => setMyReactions((cur) => (cur.includes(r) ? cur.filter((x) => x !== r) : [...cur, r]));

  const turnIntoCircle = () => {
    const spark = banter.spark;
    localStorage.setItem(
      KINCIRCLE_PREFILL,
      JSON.stringify({ type: banter.type === "collab" ? "project" : "creative", name: spark?.suggestion ?? banter.prompt.slice(0, 40), purpose: `Started from a Banter: “${banter.prompt}”`, invitees: spark?.people ?? [banter.by, ...resonance, ...replies.map((r) => r.by)] }),
    );
    router.push("/circles/new?size=small");
  };

  const saveInsight = () => {
    const line = banter.spark?.text ?? banter.prompt;
    setInsights((cur) => (cur.includes(line) ? cur : [line, ...cur]));
    setToast("Insight saved. It stays after the Banter ends.");
  };

  const iResonate = resonated.includes(banter.id);
  const resonance = [...(banter.resonance ?? []), ...(iResonate ? [ME.id as PersonId] : [])];
  const myVote = votes[banter.id];
  const pollTotal = banter.poll ? banter.poll.votes.reduce((a, b) => a + b, 0) + (myVote !== undefined ? 1 : 0) : 0;

  const contributors = new Set(replies.map((r) => r.by));
  const unanswered = replies.filter((r) => r.text?.trim().endsWith("?"));

  return (
    <div className="ap-calm mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[1fr_300px]" style={{ ["--c" as string]: "#e09a00" } as React.CSSProperties}>
      <div className="flex min-w-0 flex-col gap-5">
        <div className="flex items-center justify-between">
          <BackLink fallback="/banter" className="text-[13px] text-mute hover:text-ink-900">← Back</BackLink>
          <div className="relative">
            <button onClick={() => setMenu((m) => !m)} className="rounded-full border border-line px-3.5 py-1.5 text-[12.5px] hover:border-ink-400" aria-expanded={menu}>Your boundaries <Icon name="expand" size={12} className="ic-inline" /></button>
            {menu && (
              <ul className="absolute right-0 z-20 mt-2 w-64 overflow-hidden rounded-2xl border border-line bg-white py-1 shadow-lift">
                {BOUNDARIES.map((b) => (
                  <li key={b}>
                    <button
                      onClick={() => {
                        setMenu(false);
                        if (b === "Leave quietly") {
                          router.push("/banter");
                          return;
                        }
                        setToast(b === "Report privately" ? "Reported privately. Only the safety team will see this." : `Done: ${b.toLowerCase()}. Nobody is notified.`);
                      }}
                      className="w-full px-4 py-2.5 text-left text-[13px] hover:bg-paper-100"
                    >
                      {b}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* The Banter */}
        <article className="rounded-[22px] border border-line bg-paper-50 p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2 text-[12px] text-mute">
            <Avatar person={by} size={30} />
            <span className="font-semibold text-ink-900">{mine ? "You" : by.name}</span>
            <span>· {banter.audienceLabel}</span>
            <span>· {banter.ago}</span>
          </div>
          <h1 className="font-display mt-3 text-[28px] leading-tight">{banter.prompt}</h1>
          {banter.photo && <Photo name={banter.photo} sizes="(max-width: 1024px) 100vw, 720px" className="mt-4 h-[260px] rounded-2xl" position="center 30%" />}
          {banter.media && <p className="mt-3 inline-flex rounded-full bg-paper-200 px-3 py-1 text-[12.5px]"><Icon name={banter.media.kind === "music" ? "music" : "video-play"} size={13} className="ic-inline" /> {banter.media.label}</p>}
          {banter.poll && (
            <ul className="mt-4 flex flex-col gap-1.5">
              {banter.poll.options.map((o, i) => {
                const n = banter.poll!.votes[i] + (myVote === i ? 1 : 0);
                const pct = pollTotal ? Math.round((n / pollTotal) * 100) : 0;
                return (
                  <li key={o}>
                    <button onClick={() => vote(banter.id, i)} className={`relative w-full overflow-hidden rounded-xl border px-4 py-2.5 text-left text-[14px] ${myVote === i ? "border-ink-950" : "border-line bg-white hover:border-ink-400"}`}>
                      {myVote !== undefined && <span className="absolute inset-y-0 left-0 bg-ochre-200/70" style={{ width: `${pct}%` }} aria-hidden />}
                      <span className="relative flex justify-between gap-3"><span>{o}{myVote === i && " ✓"}</span>{myVote !== undefined && <span className="text-mute">{pct}% · {n}</span>}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
          <div className="mt-4 flex flex-wrap items-center gap-2 text-[11.5px]">
            <span className={`rounded-full px-2.5 py-1 font-semibold ${mood.tone}`}>{mood.label}</span>
            <span className="text-mute">{mood.hint}</span>
            <span className="ml-auto rounded-full border border-line px-2.5 py-1 text-mute">{banter.closed ? "Closed" : life.id === "24h" ? "This Banter ends tonight" : life.short}</span>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-4">
            <button onClick={() => toggleResonance(banter.id)} aria-pressed={iResonate} className={`rounded-full border px-4 py-2 text-[13px] font-semibold ${iResonate ? "border-ink-950 bg-ink-950 text-white" : "border-line bg-white hover:border-ink-400"}`}><Icon name="spark" size={15} className="ic-inline" /> {iResonate ? "You want to explore this" : "I want to explore this"}</button>
            {resonance.length > 0 && (
              <span className="flex items-center gap-2 text-[12px] text-mute">
                <span className="flex -space-x-1.5">{resonance.map((pid) => <Avatar key={pid} person={PEOPLE[pid]} size={22} ring />)}</span>
                {resonance.length} want to explore this{banter.reach ? ` · sent to ${banter.reach}` : ""}
              </span>
            )}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {REACTIONS.map((r) => {
              const n = (banter.reactions[r] ?? 0) + (myReactions.includes(r) ? 1 : 0);
              return (
                <button key={r} onClick={() => react(r)} aria-pressed={myReactions.includes(r)} className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[13px] ${myReactions.includes(r) ? "border-ink-900 bg-paper-200" : "border-line bg-white hover:border-ink-400"}`}>
                  <span>{r}</span>{n > 0 && <span className="text-[11.5px] text-mute">{n}</span>}
                </button>
              );
            })}
          </div>
        </article>

        {/* Akines noticed a shared intention */}
        {banter.spark && !banter.closed && (
          <section className="rounded-[22px] border border-ai/30 bg-ai/10 p-5">
            <p className="flex items-center gap-2 text-[11px] font-bold tracking-[0.12em] text-ink-800 uppercase"><span aria-hidden><Icon name="spark" size={18} /></span> Akines Companion · suggestion</p>
            <p className="mt-2 text-[14.5px] leading-relaxed">{banter.spark.text}</p>
            <p className="mt-1 text-[14.5px] font-semibold">Would you like to create a KinCircle called <em>{banter.spark.suggestion}</em>?</p>
            <div className="mt-3 flex -space-x-2">{banter.spark.people.map((pid) => <Avatar key={pid} person={PEOPLE[pid]} size={28} ring />)}</div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button onClick={turnIntoCircle} className="rounded-full bg-night px-5 py-2.5 text-[13px] font-semibold text-white">Turn into a KinCircle</button>
              <button onClick={() => setToast("Not now. Akines won't suggest this again for this Banter.")} className="rounded-full border border-ink-900/20 px-5 py-2.5 text-[13px] font-semibold">Not now</button>
            </div>
            <p className="mt-3 text-[11px] text-mute">Suggested because these members replied with complementary skills. Nobody is added without saying yes.</p>
          </section>
        )}

        {/* Replies */}
        <section className="flex flex-col gap-3" aria-label="Replies">
          {replies.map((r) => {
            const p = PEOPLE[r.by];
            return (
              <div key={r.id} className="flex gap-3 rounded-[18px] border border-line bg-paper-50 p-4">
                <Avatar person={p} size={34} />
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] text-mute"><span className="font-semibold text-ink-900">{r.by === ME.id ? "You" : p.name}</span> · {r.ago}{r.kind === "voice" && " · voice note"}</p>
                  {r.text && <p className="mt-1 text-[14.5px] leading-relaxed">{r.text}</p>}
                  {r.kind === "voice" && <VoiceNote length={r.length ?? "0:30"} />}
                  {r.kind === "photo" && r.photo && <Photo name={r.photo} ratio="4/3" sizes="320px" className="mt-2 max-w-[320px] rounded-xl" />}
                </div>
              </div>
            );
          })}
        </section>

        {/* Composer */}
        {banter.closed ? (
          <p className="rounded-[18px] bg-paper-200 p-4 text-center text-[13px] text-mute">This Banter is closed. You can still read it, and saved insights remain.</p>
        ) : (
          <section className="rounded-[20px] border border-line bg-white p-3">
            {toneWarn && (
              <div className="mb-3 rounded-xl border border-ochre-400 bg-ochre-200/50 p-3 text-[12.5px]">
                <p className="font-semibold">This could sound personal rather than playful. Would you like to soften the wording?</p>
                <div className="mt-2 flex gap-2">
                  <button onClick={() => setToneWarn(false)} className="rounded-full bg-night px-3.5 py-1.5 font-semibold text-white">Edit it</button>
                  <button onClick={() => send(photo ? { kind: "photo", photo, text } : { kind: "text", text }, true)} className="rounded-full border border-ink-900/30 px-3.5 py-1.5 font-semibold">Send anyway</button>
                </div>
              </div>
            )}
            {attach && (
              <div className="mb-3 flex gap-2">
                {REPLY_PHOTOS.map((k) => (
                  <button key={k} onClick={() => setPhoto(photo === k ? undefined : k)} className={`w-16 overflow-hidden rounded-lg ring-2 ${photo === k ? "ring-ink-900" : "ring-transparent"}`}><Photo name={k} ratio="1" sizes="64px" /></button>
                ))}
              </div>
            )}
            {recording ? (
              <div className="flex items-center gap-3 px-2 py-1.5">
                <span className="h-3 w-3 animate-pulse rounded-full bg-clay-500" />
                <span className="flex-1 text-[14px]">Recording… 0:{String(recording - 1).padStart(2, "0")}</span>
                <button onClick={() => setRecording(0)} className="text-[13px] text-mute">Cancel</button>
                <button onClick={stopRecording} className="rounded-full bg-night px-4 py-2 text-[13px] font-semibold text-white">Send voice note</button>
              </div>
            ) : (
              <div className="flex items-end gap-2">
                <button onClick={() => setAttach((a) => !a)} className={`grid h-10 w-10 flex-none place-items-center rounded-full border ${attach ? "border-ink-900" : "border-line"}`} aria-label="Add a photograph"><Icon name="photo" size={18} /></button>
                <button onClick={() => setRecording(1)} className="grid h-10 w-10 flex-none place-items-center rounded-full border border-line" aria-label="Record a voice note"><Icon name="live" size={18} /></button>
                <textarea value={text} onChange={(e) => setText(e.target.value)} rows={1} placeholder={mood.id === "encourage" ? "Something kind and useful…" : "Add to the Banter…"} className="max-h-32 min-h-10 flex-1 resize-none rounded-2xl bg-paper-100 px-4 py-2.5 text-[14.5px] outline-none" />
                <button onClick={() => send(photo ? { kind: "photo", photo, text } : { kind: "text", text })} disabled={!text.trim() && !photo} className="rounded-full bg-night px-5 py-2.5 text-[13.5px] font-semibold text-white disabled:opacity-40">Send</button>
              </div>
            )}
          </section>
        )}
      </div>

      <aside className="flex flex-col gap-4">
        <section className="rounded-[20px] border border-line bg-paper-50 p-4">
          <h2 className="font-display text-[18px]">Turn good Banter into action</h2>
          <div className="mt-3 flex flex-col gap-2 text-[13px]">
            <button onClick={saveInsight} className="rounded-xl border border-line bg-white px-3.5 py-2.5 text-left hover:border-ink-400"><Icon name="save" size={15} className="ic-inline" /> Save this insight</button>
            <Link href={`/messages`} className="rounded-xl border border-line bg-white px-3.5 py-2.5 hover:border-ink-400"><Icon name="message" size={15} className="ic-inline" /> Continue privately</Link>
            <button onClick={turnIntoCircle} className="rounded-xl border border-line bg-white px-3.5 py-2.5 text-left hover:border-ink-400"><Icon name="circle" size={15} className="ic-inline" /> Turn into a KinCircle</button>
            <Link href="/rooms/new" className="rounded-xl border border-line bg-white px-3.5 py-2.5 hover:border-ink-400"><Icon name="live" size={15} className="ic-inline" /> Reserve a Presence Room</Link>
            <Link href="/collaborate" className="rounded-xl border border-line bg-white px-3.5 py-2.5 hover:border-ink-400"><Icon name="collaborate" size={15} className="ic-inline" /> Create something from this</Link>
            <Link href="/play" className="rounded-xl border border-line bg-white px-3.5 py-2.5 hover:border-ink-400"><Icon name="play" size={15} className="ic-inline" /> Play a game together</Link>
            {mine && !banter.closed && (
              <button onClick={() => { close(banter.id); setToast("Banter closed. Saved insights stay."); }} className="rounded-xl px-3.5 py-2.5 text-left text-ruby-600 hover:bg-ruby-50">Close the Banter</button>
            )}
          </div>
        </section>

        <section className="rounded-[20px] border border-line bg-paper-50 p-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-[18px]">Akines Companion</h2>
            <span className="rounded-full bg-ai/15 px-2 py-0.5 text-[10px] font-bold uppercase">AI</span>
          </div>
          <p className="mt-1 text-[12px] text-mute">Supports quietly. Never posts, comments or picks a winner.</p>
          {!ai ? (
            <button onClick={() => setAi(true)} className="mt-3 w-full rounded-full border border-ink-900/20 py-2.5 text-[13px] font-semibold hover:bg-ink-900/5">Summarise this Banter</button>
          ) : (
            <div className="mt-3 flex flex-col gap-3 text-[12.5px] leading-relaxed">
              <p><span className="font-semibold">So far:</span> {replies.length} replies from {contributors.size} people{banter.spark ? `, circling one idea: ${banter.spark.suggestion.toLowerCase()}.` : "."}</p>
              <p><span className="font-semibold">Unanswered:</span> {unanswered.length ? unanswered.map((u) => `“${u.text}”`).join(" ") : "No open questions."}</p>
              <p><span className="font-semibold">Quieter voices:</span> {contributors.size < 3 ? "Only a few people have joined. A specific question might help others in." : "Most people have had a turn. Consider asking anyone who's only reacted."}</p>
            </div>
          )}
        </section>

        {insights.length > 0 && (
          <section className="rounded-[20px] bg-paper-200 p-4">
            <h2 className="font-display text-[18px]">Saved insights</h2>
            <ul className="mt-2 flex flex-col gap-2 text-[12.5px]">{insights.slice(0, 4).map((i) => <li key={i}><Icon name="save" size={15} className="ic-inline" /> {i}</li>)}</ul>
          </section>
        )}
      </aside>

      {toast && <div role="status" className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-full bg-night px-5 py-3 text-[13px] text-white shadow-lift md:bottom-8">{toast}</div>}
    </div>
  );
}
