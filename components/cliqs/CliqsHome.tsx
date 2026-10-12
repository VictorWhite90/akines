"use client";

import Link from "next/link";
import { useState } from "react";
import Avatar from "@/components/ui/Avatar";
import PageHeader from "@/components/ui/PageHeader";
import { allPeople, ME, PEOPLE, type PersonId } from "@/lib/data/people";
import { newId, useLocal } from "@/lib/useLocal";

type Cliq = { id: string; name: string; why: string; people: PersonId[]; mine?: boolean };

const SEED: Cliq[] = [
  { id: "makers", name: "Makers' Cliq", why: "The people I trust with unfinished work.", people: ["thandi", "ayo", "fatou", "tunde", "kwame"] },
  { id: "photo-lagos", name: "Photography Lagos", why: "Honest eyes on everything I shoot in the city.", people: ["wanjiru", "tunde", "chidi", "zuri", "efua", "leila"] },
];
const others = allPeople.filter((p) => p.id !== ME.id);
const MAX = 8;

/** How Cliqs differ from the other ways of being together on Akines. */
const COMPARE = [
  { name: "Cliq", size: "5–8 people", body: "A trusted, recurring audience. The people you genuinely want to hear from." },
  { name: "KinCircle", size: "3–12 people", body: "Small and purposeful, with a start, a journey and a decision about what's next." },
  { name: "Creative Circle", size: "Larger", body: "An ongoing community around a practice, a place or an interest." },
];

export default function CliqsHome() {
  const [mine, setMine] = useLocal<Cliq[]>("ak:cliqs", []);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [why, setWhy] = useState("");
  const [people, setPeople] = useState<PersonId[]>([]);

  const cliqs = [...mine, ...SEED];
  const toggle = (id: PersonId) => setPeople((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : cur.length >= MAX ? cur : [...cur, id]));
  const create = () => {
    setMine((cur) => [{ id: newId("cliq"), name: name.trim(), why: why.trim(), people, mine: true }, ...cur]);
    setCreating(false);
    setName("");
    setWhy("");
    setPeople([]);
  };

  return (
    <div className="flex flex-col gap-9">
      <PageHeader eyebrow="Cliqs" title={<>Your people, <em>on purpose.</em></>} sub="A Cliq is the five to eight people you genuinely want to hear from. Share a Banter with them, play together, or just check in.">
        <button onClick={() => setCreating((c) => !c)} className="rounded-full bg-night px-6 py-3 text-[14px] font-semibold text-white hover:bg-ink-800">＋ Make a Cliq</button>
      </PageHeader>

      {creating && (
        <section className="rounded-[22px] border border-line bg-paper-50 p-5 sm:p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-[13px] font-semibold">
              Name
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Sunday sketch friends" className="rounded-xl border border-line bg-white px-4 py-3 text-[15px] font-normal outline-none focus:border-ink-900" />
            </label>
            <label className="flex flex-col gap-1.5 text-[13px] font-semibold">
              What brings you together? <span className="font-normal text-mute">(only you see this)</span>
              <input value={why} onChange={(e) => setWhy(e.target.value)} placeholder="People who tell me the truth kindly." className="rounded-xl border border-line bg-white px-4 py-3 text-[15px] font-normal outline-none focus:border-ink-900" />
            </label>
          </div>
          <p className="mt-4 text-[13px] font-semibold">Choose up to {MAX} people <span className="font-normal text-mute">({people.length} chosen)</span></p>
          <div className="mt-2 flex flex-wrap gap-2">
            {others.map((p) => (
              <button key={p.id} onClick={() => toggle(p.id as PersonId)} className={`flex items-center gap-2 rounded-full border py-1 pr-3 pl-1 text-[12.5px] ${people.includes(p.id as PersonId) ? "border-ink-900 bg-ink-900 text-white" : "border-line bg-white hover:border-ink-400"}`}>
                <Avatar person={p} size={24} />{p.name}
              </button>
            ))}
          </div>
          <div className="mt-5 flex items-center justify-between gap-3">
            <p className="text-[12px] text-mute">People only see that they&apos;re in a Cliq with you if you start something together.</p>
            <button onClick={create} disabled={!name.trim() || people.length < 2} className="rounded-full bg-ochre-400 px-6 py-3 text-[14px] font-semibold text-ink-950 disabled:opacity-40">Create Cliq</button>
          </div>
        </section>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {cliqs.map((c) => (
          <article key={c.id} className="flex flex-col rounded-[20px] border border-line bg-paper-50 p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-[22px]">{c.name}</h2>
                <p className="mt-0.5 text-[13px] text-mute">{c.why || "Your trusted people."}</p>
              </div>
              <span className="rounded-full bg-paper-200 px-2.5 py-1 text-[11px]">{c.people.length} people</span>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {c.people.map((pid) => (
                <span key={pid} className="flex items-center gap-1.5 rounded-full bg-white py-1 pr-3 pl-1 text-[12px]"><Avatar person={PEOPLE[pid]} size={22} />{PEOPLE[pid].name.split(" ")[0]}</span>
              ))}
            </div>
            <div className="mt-5 flex flex-wrap gap-2 border-t border-line pt-4 text-[12.5px] font-semibold">
              <Link href="/banter/new" className="rounded-full bg-night px-4 py-2 text-white">Banter with this Cliq</Link>
              <Link href="/banter" className="rounded-full border border-ink-900/20 px-4 py-2">Banter Now</Link>
              <Link href="/play" className="rounded-full border border-ink-900/20 px-4 py-2">Play a game</Link>
            </div>
          </article>
        ))}
      </div>

      <section className="rounded-[22px] bg-paper-200 p-5">
        <h2 className="font-display text-[20px]">Cliqs, KinCircles and Creative Circles</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          {COMPARE.map((x) => (
            <div key={x.name} className="rounded-xl bg-paper-50 p-4">
              <p className="text-[14.5px] font-semibold">{x.name} <span className="font-normal text-mute">· {x.size}</span></p>
              <p className="mt-1 text-[12.5px] leading-relaxed text-mute">{x.body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
