"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Avatar from "@/components/ui/Avatar";
import Photo from "@/components/ui/Photo";
import { CLIQS, type Cliq } from "@/lib/data/cliqs";
import { allPeople, ME, PEOPLE, PRESENCE, type Person, type PersonId } from "@/lib/data/people";
import { newId, useLocal } from "@/lib/useLocal";

const SAFFRON = "#e09a00";
const c = { ["--c" as string]: SAFFRON } as React.CSSProperties;
const MAX = 8;
const others = allPeople.filter((p) => p.id !== ME.id);
const DOT: Record<string, string> = { studio: "#ffb000", room: "#e5007e", quiet: "#c4c1cc", open: "#00a86b" };
const KIND: Record<string, string> = { banter: "❝", voice: "◉", game: "☺", photo: "▣" };
const RITUALS = ["One photo each, every Friday", "Sunday show-and-tell of something unfinished", "A monthly 20-minute Banter Now", "A slow game once a fortnight", "No ritual, just here when needed"];

/** How Cliqs differ from the other ways of being together on Akines. */
const COMPARE = [
  { name: "Cliq", size: "5–8 people", body: "A trusted, recurring audience. The people you genuinely want to hear from.", on: true },
  { name: "KinCircle", size: "3–12 people", body: "Small and purposeful, with a start, a journey and a decision about what's next." },
  { name: "Creative Circle", size: "Larger", body: "An ongoing community around a practice, a place or an interest." },
];

export default function CliqsHome() {
  const [mine, setMine] = useLocal<Cliq[]>("ak:cliqs", []);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [why, setWhy] = useState("");
  const [ritual, setRitual] = useState(RITUALS[0]);
  const [people, setPeople] = useState<PersonId[]>([]);
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const cliqs = [...mine, ...CLIQS];
  const everyone = [...new Set(cliqs.flatMap((q) => q.people))];
  const aroundNow = everyone.filter((id) => PEOPLE[id].presence === "open" || PEOPLE[id].presence === "studio");
  const toggle = (id: PersonId) => setPeople((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : cur.length >= MAX ? cur : [...cur, id]));
  const create = () => {
    setMine((cur) => [{ id: newId("cliq"), name: name.trim(), why: why.trim(), people, ritual, active: "just started", mine: true }, ...cur]);
    setCreating(false);
    setName("");
    setWhy("");
    setPeople([]);
    setToast(`“${name.trim()}” is ready. Nobody is told until you start something together.`);
  };

  return (
    <div className="ap" style={c}>
      <div className="ap-hello">
        <div>
          <p style={{ margin: 0, fontSize: 12, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: SAFFRON }}>Cliqs</p>
          <h1 style={{ marginTop: 4 }}>Your people, on purpose.</h1>
          <p>The five to eight people you genuinely want to hear from. Share a Banter, start a quick call or play together.</p>
        </div>
        <div className="ap-now">
          <span className="cq-pill"><i style={{ background: "#00a86b" }} />{aroundNow.length} of your people around now</span>
          <button onClick={() => setCreating((v) => !v)} className="cq-pill dark">＋ Make a Cliq</button>
        </div>
      </div>

      {/* Around now */}
      <section className="cq-around" aria-label="Around now">
        {everyone.map((id) => {
          const p: Person = PEOPLE[id];
          return (
            <Link key={id} href="/banter#start" className="cq-person" title={`${p.name} · ${PRESENCE[p.presence].label}`}>
              <span className="cq-ring" style={{ borderColor: DOT[p.presence] }}><Avatar person={p} size={52} /></span>
              <b>{p.name.split(" ")[0]}</b>
              <small>{p.note ?? PRESENCE[p.presence].label}</small>
            </Link>
          );
        })}
      </section>

      {creating && (
        <section className="cq-make">
          <div className="kc-head" style={{ marginBottom: 6 }}>
            <h2 style={{ fontSize: 20 }}>Make a Cliq</h2>
            <button className="ap-btn" onClick={() => setCreating(false)}>Cancel</button>
          </div>
          <div className="cq-form">
            <label>Name<input value={name} onChange={(e) => setName(e.target.value)} placeholder="Sunday sketch friends" /></label>
            <label>What brings you together? <small>(only you see this)</small><input value={why} onChange={(e) => setWhy(e.target.value)} placeholder="People who tell me the truth kindly." /></label>
          </div>
          <p className="cq-label">A small ritual (optional)</p>
          <div className="cq-chips">{RITUALS.map((r) => <button key={r} onClick={() => setRitual(r)} className={`ap-btn${ritual === r ? " on" : ""}`}>{r}</button>)}</div>
          <p className="cq-label">Choose up to {MAX} people <span>({people.length} chosen)</span></p>
          <div className="cq-chips">
            {others.map((p) => (
              <button key={p.id} onClick={() => toggle(p.id as PersonId)} className={`cq-pick${people.includes(p.id as PersonId) ? " on" : ""}`}>
                <Avatar person={p} size={26} />{p.name}
              </button>
            ))}
          </div>
          <div className="ap-foot" style={{ marginTop: 18 }}>
            <span className="ap-meta">People only see they&apos;re in a Cliq with you if you start something together.</span>
            <button className="ap-cta" style={{ marginTop: 0, background: "#14121a", color: "#fff" }} onClick={create} disabled={!name.trim() || people.length < 2}>Create Cliq</button>
          </div>
        </section>
      )}

      <div className="cq-grid">
        {cliqs.map((q) => {
          const latest = q.latest;
          return (
            <article key={q.id} className="cq-card">
              <div className="cq-top">
                {q.photo ? <Photo name={q.photo} sizes="120px" className="h-[86px] w-[86px] flex-none rounded-[20px]" /> : <span className="cq-mono">{q.name.slice(0, 1)}</span>}
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "flex-start" }}>
                    <h2>{q.name}</h2>
                    <span className="ap-tag">{q.people.length} people</span>
                  </div>
                  <p className="cq-why">{q.why || "Your trusted people."}</p>
                  {q.ritual && <p className="cq-ritual">↻ {q.ritual}</p>}
                </div>
              </div>

              <div className="cq-members">
                {q.people.map((id) => (
                  <span key={id} className="cq-m" title={`${PEOPLE[id].name} · ${PRESENCE[PEOPLE[id].presence].label}`}>
                    <Avatar person={PEOPLE[id]} size={34} />
                    <i style={{ background: DOT[PEOPLE[id].presence] }} />
                  </span>
                ))}
                <span className="ap-meta" style={{ marginLeft: 6 }}>{q.active}</span>
              </div>

              {latest && (
                <div className="cq-latest">
                  <span className="cq-k">{KIND[latest.kind]}</span>
                  <p><b>{PEOPLE[latest.by].name.split(" ")[0]}</b> {latest.text}</p>
                  <small>{latest.ago}</small>
                </div>
              )}

              {q.quiet && (
                <div className="cq-quiet">
                  <Avatar person={PEOPLE[q.quiet]} size={26} />
                  <span>{PEOPLE[q.quiet].name.split(" ")[0]} has been quiet for a while.</span>
                  <button onClick={() => setToast(`A gentle voice note is on its way to ${PEOPLE[q.quiet!].name.split(" ")[0]}.`)}>Check in</button>
                </div>
              )}

              <div className="cq-actions">
                <Link href="/banter#start" className="cq-act lead"><span>❝</span>Banter</Link>
                <Link href="/banter" className="cq-act"><span>◉</span>Banter Now</Link>
                <Link href="/play" className="cq-act"><span>☺</span>Play</Link>
                <button className="cq-act" onClick={() => setToast(`Voice note sent to ${q.name}.`)}><span>♪</span>Voice note</button>
              </div>
            </article>
          );
        })}
      </div>

      <section className="kc-section">
        <div className="kc-head"><h2>Cliqs, KinCircles and Creative Circles</h2></div>
        <div className="cq-compare">
          {COMPARE.map((x) => (
            <div key={x.name} className={x.on ? "on" : undefined}>
              <b>{x.name}</b> <span>· {x.size}</span>
              <p>{x.body}</p>
            </div>
          ))}
        </div>
      </section>

      {toast && <div role="status" className="cq-toast">{toast}</div>}
    </div>
  );
}
