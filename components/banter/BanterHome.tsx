"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Avatar from "@/components/ui/Avatar";
import PageHeader from "@/components/ui/PageHeader";
import BanterCard from "./BanterCard";
import { useBanters } from "./useBanters";
import { BANTER_NOW, BANTER_NOW_RULES, BANTER_TYPES, TODAYS_BANTER, type BanterNow, type BanterType } from "@/lib/data/banter";
import { allPeople, ME, PEOPLE, type PersonId } from "@/lib/data/people";
import { newId, useLocal } from "@/lib/useLocal";

const FLOW = ["Banter", "Shared interest", "Human connection", "KinCircle", "Collaboration", "Lasting relationship"];
const others = allPeople.filter((p) => p.id !== ME.id);

export default function BanterHome() {
  const router = useRouter();
  const { all } = useBanters();
  const [type, setType] = useState<BanterType | "all" | "mine">("all");
  const [mySessions, setMySessions] = useLocal<BanterNow[]>("ak:banter-now", []);
  const [starting, setStarting] = useState(false);
  const [topic, setTopic] = useState("");
  const [minutes, setMinutes] = useState(20);
  const [invite, setInvite] = useState<PersonId[]>([]);

  const list = all.filter((b) => (type === "all" ? true : type === "mine" ? b.mine : b.type === type));
  const sessions = [...mySessions, ...BANTER_NOW];

  const toggle = (id: PersonId) => setInvite((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : cur.length >= 7 ? cur : [...cur, id]));
  const startNow = () => {
    const s: BanterNow = { id: newId("now"), topic: topic.trim(), host: ME.id as PersonId, people: [ME.id as PersonId, ...invite], minutes, context: "Your connections", live: true };
    setMySessions((cur) => [s, ...cur]);
    router.push(`/banter/now/${s.id}`);
  };

  return (
    <div className="flex flex-col gap-9">
      <PageHeader eyebrow="Banter" title={<>Talk freely with <em>people who matter.</em></>} sub="Small talk that can become something meaningful. Not a feed, not built to go viral. Just a good question, asked to the right people.">
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setStarting((v) => !v)} className="rounded-full border border-ink-900/20 px-5 py-3 text-[14px] font-semibold hover:bg-ink-900/5">◉ Banter Now</button>
          <Link href="/banter/new" className="rounded-full bg-night px-6 py-3 text-[14px] font-semibold text-white hover:bg-ink-800">＋ Start a Banter</Link>
        </div>
      </PageHeader>

      {/* Start Banter Now */}
      {starting && (
        <section className="rounded-[22px] border border-line bg-paper-50 p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="eyebrow text-clay-600">Banter Now</p>
              <h2 className="font-display mt-1 text-[24px]">A short, spontaneous conversation</h2>
              <p className="mt-1 text-[13px] text-mute">Two to eight invited people. Everyone is an equal participant, and nothing is recorded.</p>
            </div>
            <button onClick={() => setStarting(false)} className="text-[13px] text-mute hover:text-ink-900">Cancel</button>
          </div>
          <div className="mt-5 grid gap-5 md:grid-cols-[1fr_260px]">
            <div className="flex flex-col gap-4">
              <label className="flex flex-col gap-1.5 text-[13px] font-semibold">
                Topic
                <input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Is AI helping or damaging African art?" className="rounded-xl border border-line bg-white px-4 py-3 text-[15px] font-normal outline-none focus:border-ink-900" />
              </label>
              <div>
                <p className="text-[13px] font-semibold">Invite up to seven people <span className="font-normal text-mute">({invite.length} of 7)</span></p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {others.map((p) => (
                    <button key={p.id} onClick={() => toggle(p.id as PersonId)} className={`flex items-center gap-2 rounded-full border py-1 pr-3 pl-1 text-[12.5px] ${invite.includes(p.id as PersonId) ? "border-ink-900 bg-ink-900 text-white" : "border-line bg-white hover:border-ink-400"}`}>
                      <Avatar person={p} size={24} />
                      {p.name.split(" ")[0]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <p className="text-[13px] font-semibold">How long?</p>
              <div className="flex gap-2">
                {[10, 20, 30].map((m) => (
                  <button key={m} onClick={() => setMinutes(m)} className={`flex-1 rounded-xl border py-2.5 text-[13px] font-semibold ${minutes === m ? "border-ink-900 bg-ink-900 text-white" : "border-line bg-white"}`}>{m} min</button>
                ))}
              </div>
              <button disabled={!topic.trim() || invite.length < 1} onClick={startNow} className="mt-auto rounded-full bg-ochre-400 py-3 text-[14px] font-semibold text-ink-950 hover:bg-ochre-300 disabled:opacity-40">Start Banter Now</button>
              <p className="text-[11.5px] text-mute">You need a topic and at least one person.</p>
            </div>
          </div>
        </section>
      )}

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="flex min-w-0 flex-col gap-6">
          {/* Today's Banter */}
          <Link href="/banter/unfinished" className="group block rounded-[22px] bg-night p-6 text-white transition-transform hover:-translate-y-0.5">
            <p className="text-[11px] font-bold tracking-[0.14em] text-ochre-300 uppercase">Today&apos;s Banter</p>
            <p className="font-display mt-2 text-[26px] leading-tight">“{TODAYS_BANTER}”</p>
            <span className="mt-4 inline-block rounded-full bg-white/10 px-4 py-2 text-[13px] font-semibold group-hover:bg-white/20">Join the Banter →</span>
          </Link>

          {/* Filters */}
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Banter types">
            {[{ id: "all", label: "All" }, ...BANTER_TYPES, { id: "mine", label: "Started by me" }].map((t) => (
              <button key={t.id} role="tab" aria-selected={type === t.id} onClick={() => setType(t.id as typeof type)} className={`rounded-full border px-3.5 py-1.5 text-[12.5px] ${type === t.id ? "border-ink-900 bg-ink-900 text-white" : "border-line bg-paper-50 text-ink-700 hover:border-ink-400"}`}>
                {t.label}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            {list.map((b) => <BanterCard key={b.id} banter={b} />)}
            {list.length === 0 && (
              <div className="rounded-[18px] border border-dashed border-line p-8 text-center text-[14px] text-mute">
                Nothing here yet. <Link href="/banter/new" className="font-semibold text-ink-900 underline">Start a Banter</Link>
              </div>
            )}
          </div>
        </div>

        <aside className="flex flex-col gap-5">
          {/* Banter Now */}
          <section className="rounded-[20px] border border-line bg-paper-50 p-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-[19px]">Banter Now</h2>
              <span className="text-[11px] text-mute">2–8 people · no audience</span>
            </div>
            <ul className="mt-3 flex flex-col gap-2.5">
              {sessions.map((s) => (
                <li key={s.id}>
                  <Link href={`/banter/now/${s.id}`} className="block rounded-xl border border-line bg-white p-3 hover:border-ink-400">
                    <p className="flex items-center gap-1.5 text-[10.5px] font-bold tracking-wide uppercase">
                      {s.live ? <><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-clay-500" /><span className="text-clay-600">Live</span></> : <span className="text-mute">Starts {s.startsIn}</span>}
                      <span className="font-normal text-mute normal-case">· {s.minutes} min · {s.context}</span>
                    </p>
                    <p className="mt-1.5 text-[13.5px] leading-snug font-semibold">{s.topic}</p>
                    <div className="mt-2 flex -space-x-2">
                      {s.people.map((id) => <Avatar key={id} person={PEOPLE[id]} size={24} ring />)}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
            <details className="mt-3 text-[12px] text-mute">
              <summary className="cursor-pointer font-semibold text-ink-800">How Banter Now is different</summary>
              <ul className="mt-2 grid gap-1">{BANTER_NOW_RULES.map((r) => <li key={r}>· {r}</li>)}</ul>
            </details>
          </section>

          {/* Where Banter leads */}
          <section className="rounded-[20px] bg-paper-200 p-4">
            <h2 className="font-display text-[19px]">Where a good Banter leads</h2>
            <ol className="mt-3 flex flex-col gap-1.5 text-[13px]">
              {FLOW.map((f, i) => (
                <li key={f} className="flex items-center gap-2.5">
                  <span className="grid h-5 w-5 flex-none place-items-center rounded-full bg-night text-[10px] font-bold text-white">{i + 1}</span>
                  {f}
                </li>
              ))}
            </ol>
            <p className="mt-3 text-[12px] leading-relaxed text-mute">Banter creates the spark. KinCircles deepen the connection. Together Canvas turns it into shared action.</p>
          </section>
        </aside>
      </div>
    </div>
  );
}
