"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Avatar from "@/components/ui/Avatar";
import Photo from "@/components/ui/Photo";
import BanterCard from "./BanterCard";
import BanterComposer from "./BanterComposer";
import { useBanters, useResonance } from "./useBanters";
import { BANTER_NOW, BANTER_NOW_RULES, BANTER_TYPES, TODAYS_BANTER, type Banter, type BanterNow, type BanterType } from "@/lib/data/banter";
import { allPeople, ME, PEOPLE, type PersonId } from "@/lib/data/people";
import { newId, useLocal } from "@/lib/useLocal";

const BECOME = [
  { title: "Spark", body: "One honest question, shared on purpose." },
  { title: "Notice resonance", body: "Akines surfaces mutual curiosity and care." },
  { title: "Choose the next shape", body: "Continue privately, meet live, or form a KinCircle." },
];
const others = allPeople.filter((p) => p.id !== ME.id);

export default function BanterHome() {
  const router = useRouter();
  const { all, add } = useBanters();
  const { ids: resonated } = useResonance();
  const [type, setType] = useState<BanterType | "all" | "mine" | "resonate">("all");
  const [fresh, setFresh] = useState<string | null>(null);
  const [mySessions, setMySessions] = useLocal<BanterNow[]>("ak:banter-now", []);
  const [starting, setStarting] = useState(false);
  const [topic, setTopic] = useState("");
  const [minutes, setMinutes] = useState(20);
  const [invite, setInvite] = useState<PersonId[]>([]);

  const list = all.filter((b) => (type === "all" ? true : type === "mine" ? b.mine : type === "resonate" ? resonated.includes(b.id) : b.type === type));
  const sessions = [...mySessions, ...BANTER_NOW];

  const post = (b: Banter) => {
    add(b);
    setType("all");
    setFresh(b.id);
    requestAnimationFrame(() => document.getElementById("feed")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  const toggle = (id: PersonId) => setInvite((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : cur.length >= 7 ? cur : [...cur, id]));
  const startNow = () => {
    const s: BanterNow = { id: newId("now"), topic: topic.trim(), host: ME.id as PersonId, people: [ME.id as PersonId, ...invite], minutes, context: "Your connections", live: true };
    setMySessions((cur) => [s, ...cur]);
    router.push(`/banter/now/${s.id}`);
  };

  return (
    <div className="ap ap-calm flex flex-col gap-8" style={{ ["--c" as string]: "#e09a00" } as React.CSSProperties}>
      <div className="bt-head" style={{ marginBottom: 0 }}>
        <section className="bt-intro">
          <p style={{ margin: 0, fontSize: 12, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "#e09a00" }}>Banter · the spark, not the destination</p>
          <h1>One honest question, to the right people.</h1>
          <p>Not a feed and not built to go viral. Ask something real, see who it resonates with, and let a good exchange grow into a room, a KinCircle or a collaboration.</p>
          <div className="bt-flow">
            {["Ask", "Notice resonance", "Choose the next shape"].map((s, i) => <span key={s}><b>{i + 1}</b>{s}</span>)}
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 18, flexWrap: "wrap" }}>
            <a href="#compose" className="ap-cta" style={{ marginTop: 0, background: "#14121a", color: "#fff" }}>Start a Banter</a>
            <button onClick={() => setStarting((v) => !v)} className="ap-btn" style={{ height: 42, padding: "0 18px" }}>◉ Banter Now</button>
          </div>
        </section>
        <Link href="/banter/unfinished" className="bt-today">
          <Photo name="talkLaugh" sizes="360px" className="absolute inset-0 h-full" />
          <small>Today&apos;s Banter</small>
          <b>“{TODAYS_BANTER}”</b>
          <span>Join the Banter →</span>
        </Link>
      </div>

      {starting && (
        <section className="rounded-[22px] border border-line bg-paper-50 p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-display text-[22px]">Banter Now: a short, spontaneous conversation</h2>
              <p className="mt-1 text-[13px] text-mute">Two to eight invited people, all equal. No audience, nothing recorded.</p>
            </div>
            <button onClick={() => setStarting(false)} className="text-[13px] text-mute hover:text-ink-900">Cancel</button>
          </div>
          <div className="mt-4 grid gap-5 md:grid-cols-[1fr_240px]">
            <div className="flex flex-col gap-3">
              <input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Is AI helping or damaging African art?" aria-label="Topic" className="rounded-xl border border-line bg-white px-4 py-3 text-[15px] outline-none focus:border-ink-900" />
              <div className="flex flex-wrap gap-1.5">
                {others.map((p) => (
                  <button key={p.id} onClick={() => toggle(p.id as PersonId)} className={`flex items-center gap-1.5 rounded-full border py-0.5 pr-3 pl-0.5 text-[12px] ${invite.includes(p.id as PersonId) ? "border-ink-950 bg-ink-950 text-white" : "border-line bg-white"}`}>
                    <Avatar person={p} size={22} />{p.name.split(" ")[0]}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-2.5">
              <div className="flex gap-2">
                {[10, 20, 30].map((m) => <button key={m} onClick={() => setMinutes(m)} className={`flex-1 rounded-xl border py-2.5 text-[13px] font-semibold ${minutes === m ? "border-ink-950 bg-ink-950 text-white" : "border-line bg-white"}`}>{m} min</button>)}
              </div>
              <button disabled={!topic.trim() || invite.length < 1} onClick={startNow} className="rounded-full bg-ochre-400 py-3 text-[14px] font-semibold text-ink-950 disabled:opacity-40">Start Banter Now</button>
              <p className="text-[11.5px] text-mute">{invite.length} of 7 invited</p>
            </div>
          </div>
        </section>
      )}

      <BanterComposer onPost={post} />

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div id="feed" className="flex min-w-0 scroll-mt-24 flex-col gap-4">

          <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Filter Banter">
            {[{ id: "all", label: "All" }, { id: "resonate", label: "✦ Exploring" }, ...BANTER_TYPES, { id: "mine", label: "Started by me" }].map((t) => (
              <button key={t.id} role="tab" aria-selected={type === t.id} onClick={() => setType(t.id as typeof type)} className={`rounded-full border px-3.5 py-1.5 text-[12.5px] ${type === t.id ? "border-ink-950 bg-ink-950 text-white" : "border-line bg-paper-50 text-ink-700 hover:border-ink-400"}`}>{t.label}</button>
            ))}
          </div>

          {list.map((b) => <BanterCard key={b.id} banter={b} highlight={b.id === fresh} />)}
          {list.length === 0 && <p className="rounded-[18px] border border-dashed border-line p-8 text-center text-[14px] text-mute">Nothing here yet. Tap “I want to explore this” on a Banter, or start one above.</p>}
        </div>

        <aside className="flex flex-col gap-4">
          <section className="rounded-[20px] border border-line bg-paper-50 p-4">
            <h2 className="font-display text-[19px]">What a Banter can become</h2>
            <ol className="mt-3 flex flex-col gap-2.5">
              {BECOME.map((s, i) => (
                <li key={s.title} className="flex gap-3 rounded-xl border border-line bg-white p-3">
                  <span className="grid h-8 w-8 flex-none place-items-center rounded-lg bg-paper-200 text-[13px] font-bold">{i + 1}</span>
                  <span><span className="block text-[13.5px] font-semibold">{s.title}</span><span className="block text-[12px] text-mute">{s.body}</span></span>
                </li>
              ))}
            </ol>
          </section>

          <section className="rounded-[20px] border border-line bg-paper-50 p-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-[19px]">Banter Now</h2>
              <span className="text-[11px] text-mute">2–8 people</span>
            </div>
            <ul className="mt-3 flex flex-col gap-2">
              {sessions.map((s) => (
                <li key={s.id}>
                  <Link href={`/banter/now/${s.id}`} className="block rounded-xl border border-line bg-white p-3 hover:border-ink-400">
                    <p className="text-[10.5px] font-bold tracking-wide uppercase">{s.live ? <span className="text-clay-600">● Live</span> : <span className="text-mute">Starts {s.startsIn}</span>} <span className="font-normal text-mute normal-case">· {s.minutes} min · {s.context}</span></p>
                    <p className="mt-1 text-[13.5px] leading-snug font-semibold">{s.topic}</p>
                    <div className="mt-2 flex -space-x-1.5">{s.people.map((id) => <Avatar key={id} person={PEOPLE[id]} size={22} ring />)}</div>
                  </Link>
                </li>
              ))}
            </ul>
            <details className="mt-3 text-[12px] text-mute">
              <summary className="cursor-pointer font-semibold text-ink-800">Not a Clubhouse room</summary>
              <ul className="mt-2 grid gap-1">{BANTER_NOW_RULES.map((r) => <li key={r}>· {r}</li>)}</ul>
            </details>
          </section>

          <section className="rounded-[20px] bg-paper-200 p-4 text-[12.5px] leading-relaxed text-ink-700">
            <p className="font-semibold text-ink-900">Banter creates the spark.</p>
            <p>KinCircles deepen the connection. Together Canvas turns it into shared action.</p>
          </section>
        </aside>
      </div>
    </div>
  );
}
