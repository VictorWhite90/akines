"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Avatar from "@/components/ui/Avatar";
import { KINCIRCLE_PREFILL } from "@/components/circles/CreateKinCircle";
import { BANTER_NOW, type BanterNow } from "@/lib/data/banter";
import { ME, PEOPLE, type PersonId } from "@/lib/data/people";
import { useLocal } from "@/lib/useLocal";
import BackLink from "@/components/ui/BackLink";

export default function BanterNowRoom({ id }: { id: string }) {
  const router = useRouter();
  const [mine] = useLocal<BanterNow[]>("ak:banter-now", []);
  const [insights, setInsights] = useLocal<string[]>("ak:banter-insights", []);
  const session = [...mine, ...BANTER_NOW].find((s) => s.id === id);
  const [elapsed, setElapsed] = useState(0);
  const [muted, setMuted] = useState(false);
  const [speaker, setSpeaker] = useState(0);
  const [endedEarly, setEnded] = useState(false);
  const [insight, setInsight] = useState("");
  const [saved, setSaved] = useState(false);

  const people: PersonId[] = session ? (session.people.includes(ME.id as PersonId) ? session.people : [...session.people, ME.id as PersonId]) : [];

  const total = (session?.minutes ?? 0) * 60;
  const left = Math.max(total - elapsed, 0);
  const ended = endedEarly || (total > 0 && left === 0);

  useEffect(() => {
    if (ended) return;
    const t = setTimeout(() => setElapsed((e) => e + 1), 1000);
    return () => clearTimeout(t);
  }, [elapsed, ended]);

  // Gently rotate who's speaking so the room feels alive and shared.
  useEffect(() => {
    if (ended) return;
    const t = setInterval(() => setSpeaker((s) => (s + 1) % Math.max(people.length, 1)), 3500);
    return () => clearInterval(t);
  }, [ended, people.length]);

  if (!session) {
    return (
      <div className="mx-auto max-w-xl py-16 text-center">
        <p className="font-display text-[26px]">This Banter Now has finished.</p>
        <Link href="/banter" className="mt-6 inline-block rounded-full bg-night px-6 py-3 text-[14px] font-semibold text-white">Back to Banter</Link>
      </div>
    );
  }

  const mm = Math.floor(left / 60);
  const ss = left % 60;

  if (ended) {
    return (
      <div className="ap-calm mx-auto flex w-full max-w-2xl flex-col gap-6 py-6">
        <div className="text-center">
          <p className="eyebrow text-clay-600">Banter Now · ended</p>
          <h1 className="font-display mt-2 text-[34px] leading-tight">Did this conversation produce an idea worth continuing?</h1>
          <p className="mt-2 text-[14px] text-mute">“{session.topic}”. Nothing was recorded. Only what you choose to save is kept.</p>
        </div>
        <section className="rounded-[22px] border border-line bg-paper-50 p-5">
          <label className="flex flex-col gap-2 text-[13px] font-semibold">
            Save one insight
            <input value={insight} onChange={(e) => setInsight(e.target.value)} placeholder="AI should help the archive, never sign the painting." className="rounded-xl border border-line bg-white px-4 py-3 text-[15px] font-normal outline-none focus:border-ink-900" />
          </label>
          <button
            disabled={!insight.trim() || saved}
            onClick={() => { setInsights([insight.trim(), ...insights]); setSaved(true); }}
            className="mt-3 rounded-full bg-night px-5 py-2.5 text-[13px] font-semibold text-white disabled:opacity-40"
          >
            {saved ? "Insight saved ✓" : "Save insight"}
          </button>
        </section>
        <div className="grid gap-3 sm:grid-cols-3">
          <Link href="/collaborate" className="rounded-[18px] border border-line bg-paper-50 p-4 hover:border-ink-400">
            <p className="text-[18px]" aria-hidden>⌘</p>
            <p className="mt-1 text-[14px] font-semibold">Create a project</p>
            <p className="mt-0.5 text-[12px] text-mute">Open a Collaboration Studio.</p>
          </Link>
          <button
            onClick={() => {
              localStorage.setItem(KINCIRCLE_PREFILL, JSON.stringify({ name: session.topic.slice(0, 40), purpose: `Started from Banter Now: “${session.topic}”`, invitees: people }));
              router.push("/circles/new");
            }}
            className="rounded-[18px] border border-line bg-paper-50 p-4 text-left hover:border-ink-400"
          >
            <p className="text-[18px]" aria-hidden>◎</p>
            <p className="mt-1 text-[14px] font-semibold">Turn into a KinCircle</p>
            <p className="mt-0.5 text-[12px] text-mute">Keep meeting with purpose.</p>
          </button>
          <Link href="/banter" className="rounded-[18px] border border-line bg-paper-50 p-4 hover:border-ink-400">
            <p className="text-[18px]" aria-hidden>○</p>
            <p className="mt-1 text-[14px] font-semibold">Let it end</p>
            <p className="mt-0.5 text-[12px] text-mute">A good conversation is enough.</p>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="ap-calm flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <BackLink fallback="/banter" className="text-[13px] text-mute hover:text-ink-900">← Back</BackLink>
        <div className="flex flex-wrap gap-2 text-[11.5px]">
          <span className="rounded-full bg-paper-200 px-3 py-1">Not recorded</span>
          <span className="rounded-full bg-paper-200 px-3 py-1">No audience</span>
          <span className="rounded-full bg-paper-200 px-3 py-1">{people.length} of 8 people</span>
        </div>
      </div>

      <section className="rounded-[26px] bg-night p-5 text-white sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="flex items-center gap-2 text-[11px] font-bold tracking-[0.14em] text-ochre-300 uppercase"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-clay-400" /> Banter Now · {session.context}</p>
            <h1 className="font-display mt-2 max-w-2xl text-[30px] leading-tight sm:text-[36px]">{session.topic}</h1>
          </div>
          <p className="font-display text-[40px] tabular-nums" aria-label="Time left">{mm}:{String(ss).padStart(2, "0")}</p>
        </div>

        {/* Equal tiles: no stage, no hosts above guests */}
        <ul className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {people.map((pid, i) => {
            const p = PEOPLE[pid];
            const me = pid === ME.id;
            const talking = i === speaker && !(me && muted);
            return (
              <li key={pid} className={`flex flex-col items-center gap-2 rounded-2xl p-5 transition-colors ${talking ? "bg-white/15 ring-2 ring-ochre-300" : "bg-white/5"}`}>
                <Avatar person={p} size={64} />
                <p className="text-[13.5px] font-semibold">{me ? "You" : p.name.split(" ")[0]}</p>
                <p className="text-[11px] text-white/60">{me && muted ? "Muted" : talking ? "Speaking" : "Listening"}</p>
              </li>
            );
          })}
        </ul>

        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <button onClick={() => setMuted((m) => !m)} className={`rounded-full px-5 py-3 text-[13.5px] font-semibold ${muted ? "bg-white text-ink-950" : "bg-white/10 hover:bg-white/20"}`}>{muted ? "Unmute" : "Mute"}</button>
          <button onClick={() => setEnded(true)} className="rounded-full bg-ochre-400 px-5 py-3 text-[13.5px] font-semibold text-ink-950 hover:bg-ochre-300">End and reflect</button>
          <Link href="/banter" className="rounded-full bg-white/10 px-5 py-3 text-[13.5px] font-semibold hover:bg-white/20">Leave quietly</Link>
        </div>
      </section>
      <p className="text-center text-[12px] text-mute">Everyone joins as an equal participant. When time is up, the group decides whether anything is worth continuing.</p>
    </div>
  );
}
