"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Avatar from "@/components/ui/Avatar";
import Photo from "@/components/ui/Photo";
import { useBanterReplies, useBanters } from "./useBanters";
import { BANTER_LIFETIMES, BANTER_MOODS, BANTER_NOW, MOOD_LOOK, lifeLeft, toneIssue, softenWording, type Banter, type BanterLifetime, type BanterMood } from "@/lib/data/banter";
import { CLIQS } from "@/lib/data/cliqs";
import { CIRCLES } from "@/lib/data/community";
import { ME, PEOPLE, type PersonId } from "@/lib/data/people";
import { newId } from "@/lib/useLocal";

const AUDIENCES = [
  ...CLIQS.map((c) => ({ id: `cliq:${c.id}`, label: c.name, reach: c.people.length })),
  ...CIRCLES.filter((c) => c.joined).map((c) => ({ id: `circle:${c.id}`, label: c.name, reach: 12 })),
  { id: "community", label: "Wider Akines community", reach: 120 },
];

/** A small countdown ring showing how much of the Banter's life is left. */
function LifeRing({ b }: { b: Banter }) {
  const { label, pct } = lifeLeft(b);
  const r = 16;
  const c = 2 * Math.PI * r;
  return (
    <span className="bd-life" title={label}>
      <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden>
        <circle cx="20" cy="20" r={r} fill="none" stroke="currentColor" strokeOpacity=".2" strokeWidth="4" />
        <circle cx="20" cy="20" r={r} fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - pct)} transform="rotate(-90 20 20)" />
      </svg>
      <span>{label}</span>
    </span>
  );
}

function Card({ b, depth, onSkip }: { b: Banter; depth: number; onSkip: () => void }) {
  const [added] = useBanterReplies(b.id);
  const replies = [...b.replies, ...added];
  const look = MOOD_LOOK[b.mood];
  const mood = BANTER_MOODS.find((m) => m.id === b.mood)!;
  const inside = [...new Set([b.by, ...replies.map((r) => r.by)])];
  const last = replies.slice(-2);
  const by = PEOPLE[b.by];
  return (
    <article className={`bd-card d${depth}`} style={{ background: look.bg, color: look.ink }} aria-hidden={depth > 0}>
      <header className="bd-top">
        <span className="bd-mood">{mood.label}</span>
        <span className="bd-aud">{b.audienceLabel}</span>
        <LifeRing b={b} />
      </header>

      <div className="bd-body">
        <div className="bd-ask">
          <p className="bd-who"><Avatar person={by} size={30} ring /> <b>{b.mine ? "You" : by.name.split(" ")[0]}</b> asks</p>
          <h2>{b.prompt}</h2>
          {b.poll && <p className="bd-chip">≡ Poll · {b.poll.options.length} options</p>}
          {b.media && <p className="bd-chip">{b.media.kind === "music" ? "♪" : "▶"} {b.media.label}</p>}
        </div>
        {b.photo && <Photo name={b.photo} sizes="220px" className="bd-photo" />}
      </div>

      <div className="bd-inside">
        <p className="bd-label">Inside the conversation</p>
        {last.length === 0 ? (
          <p className="bd-quiet">Nobody has said anything yet. Be the first voice.</p>
        ) : (
          last.map((r) => (
            <div key={r.id} className="bd-bubble">
              <Avatar person={PEOPLE[r.by]} size={24} />
              <span><b>{r.by === ME.id ? "You" : PEOPLE[r.by].name.split(" ")[0]}</b> {r.kind === "voice" ? `◉ voice note ${r.length}` : r.kind === "photo" ? "▣ shared a photo" : r.text}</span>
            </div>
          ))
        )}
      </div>

      <footer className="bd-foot">
        <span className="bd-faces">
          {inside.slice(0, 5).map((id) => <span key={id}><Avatar person={PEOPLE[id]} size={30} ring /></span>)}
          <em>{inside.length} {inside.length === 1 ? "person" : "people"} talking</em>
        </span>
        <span className="bd-acts">
          <button onClick={onSkip} className="bd-skip" tabIndex={depth ? -1 : 0}>Not for me</button>
          <Link href={`/banter/${b.id}`} className="bd-join" tabIndex={depth ? -1 : 0}>Join the conversation →</Link>
        </span>
      </footer>
    </article>
  );
}

export default function BanterDeck() {
  const router = useRouter();
  const { all, add } = useBanters();
  const open = all.filter((b) => !b.closed);
  const [i, setI] = useState(0);
  const [q, setQ] = useState("");
  const [mood, setMood] = useState<BanterMood>("fun");
  const [aud, setAud] = useState(AUDIENCES[0].id);
  const [life, setLife] = useState<BanterLifetime>("3d");
  const [ack, setAck] = useState(false);

  const n = open.length;
  const next = () => setI((x) => (x + 1) % n);
  const prev = () => setI((x) => (x - 1 + n) % n);

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest("input, textarea, select")) return;
      if (e.key === "ArrowRight") setI((x) => (x + 1) % n);
      if (e.key === "ArrowLeft") setI((x) => (x - 1 + n) % n);
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [n]);

  const issue = ack ? null : toneIssue(q);
  const audience = AUDIENCES.find((a) => a.id === aud)!;

  const start = () => {
    const b: Banter = {
      id: newId("banter"),
      by: ME.id as PersonId,
      format: "ask",
      type: "everyday",
      mood,
      audience: aud === "community" ? "community" : aud.startsWith("circle") ? "circle" : "selected",
      audienceLabel: audience.label,
      lifetime: life,
      prompt: q.trim(),
      ago: "now",
      reactions: {},
      replies: [],
      resonance: [],
      reach: audience.reach,
      mine: true,
    };
    add(b);
    router.push(`/banter/${b.id}`);
  };

  const stack = n ? [0, 1, 2].map((d) => open[(i + d) % n]).filter((b, idx, arr) => arr.indexOf(b) === idx) : [];

  return (
    <div className="ap ap-calm bd" style={{ ["--c" as string]: "#e09a00" } as React.CSSProperties}>
      <header className="bd-head">
        <div>
          <p className="bd-kicker">Banter</p>
          <h1>One question. A small chat. It fades, or it grows.</h1>
        </div>
        <div className="bd-headr">
        <button className="bd-create" onClick={() => { const t = document.getElementById("bd-q") as HTMLTextAreaElement | null; t?.scrollIntoView({ behavior: "smooth", block: "center" }); t?.focus(); }}>＋ Start your own Banter</button>
        <ol className="bd-how">
          <li><b>1</b>Someone asks one honest question</li>
          <li><b>2</b>Their people join a short chat about it</li>
          <li><b>3</b>It fades away, or becomes a KinCircle, room or project</li>
        </ol>
        </div>
      </header>

      <div className="bd-grid">
        <section aria-label="Banters waiting for you">
          <div className="bd-deckhead">
            <h3>Waiting for your voice <span>{n ? i + 1 : 0} of {n}</span></h3>
            <div>
              <button onClick={prev} aria-label="Previous Banter">←</button>
              <button onClick={next} aria-label="Next Banter">→</button>
            </div>
          </div>
          <div className="bd-deck">
            {stack.slice().reverse().map((b) => {
              const depth = stack.indexOf(b);
              return <Card key={b.id} b={b} depth={depth} onSkip={next} />;
            })}
          </div>
          <div className="bd-dots" role="tablist" aria-label="Banters">
            {open.map((b, k) => <button key={b.id} role="tab" aria-selected={k === i} aria-label={b.prompt} className={k === i ? "on" : undefined} onClick={() => setI(k)} />)}
          </div>
        </section>

        <aside className="bd-side">
          <section className="bd-ask-box" id="start">
            <p className="bd-kicker" style={{ fontSize: 11 }}>Your turn</p>
            <h3>Start your own Banter</h3>
            <p className="bd-note" style={{ marginTop: -4, marginBottom: 10 }}>Write one honest question. You&apos;ll go straight into its chat room.</p>
            <textarea id="bd-q" value={q} onChange={(e) => { setQ(e.target.value); setAck(false); }} rows={3} placeholder="Can an unfinished artwork still be honest?" />
            {issue === "harsh" && (
              <div className="bd-warn">
                <b>This could sound personal rather than playful.</b>
                <span>Try: “{softenWording(q)}”</span>
                <div><button onClick={() => setQ(softenWording(q))}>Use calmer wording</button><button onClick={() => setAck(true)}>Keep mine</button></div>
              </div>
            )}
            {issue === "sweeping" && (
              <div className="bd-warn">
                <b>This reads as a judgement about a whole group of people.</b>
                <span>Banter works best as a real question. Try: “What do you think holds artists back here?”</span>
                <div><button onClick={() => setQ("What do you think holds artists back here?")}>Use the question</button><button onClick={() => setAck(true)}>Keep mine</button></div>
              </div>
            )}
            <p className="bd-l">Mood</p>
            <div className="bd-moods">
              {BANTER_MOODS.map((m) => (
                <button key={m.id} onClick={() => setMood(m.id)} className={mood === m.id ? "on" : undefined} style={{ ["--m" as string]: MOOD_LOOK[m.id].bg } as React.CSSProperties}>{m.label}</button>
              ))}
            </div>
            <div className="bd-two">
              <label><span className="bd-l">Who hears it</span>
                <select value={aud} onChange={(e) => setAud(e.target.value)}>{AUDIENCES.map((a) => <option key={a.id} value={a.id}>{a.label}</option>)}</select>
              </label>
              <label><span className="bd-l">How long</span>
                <select value={life} onChange={(e) => setLife(e.target.value as BanterLifetime)}>{BANTER_LIFETIMES.map((l) => <option key={l.id} value={l.id}>{l.label}</option>)}</select>
              </label>
            </div>
            <button className="bd-start" disabled={q.trim().length < 5 || !!issue} onClick={start}>Start the Banter</button>
            <p className="bd-note">Goes to {audience.reach} {audience.reach === 1 ? "person" : "people"}, each told why. No likes, no followers. <Link href="/banter/classic#compose">More options</Link></p>
          </section>

          <section className="bd-now">
            <h3><i />Banter Now</h3>
            <p className="bd-note">Live voice chats, 2–8 people, nothing recorded.</p>
            {BANTER_NOW.map((s) => (
              <Link key={s.id} href={`/banter/now/${s.id}`} className="bd-now-row">
                <span className={s.live ? "live" : undefined}>{s.live ? "Live" : s.startsIn}</span>
                <b>{s.topic}</b>
                <span className="bd-faces small">{s.people.slice(0, 4).map((id) => <span key={id}><Avatar person={PEOPLE[id]} size={22} ring /></span>)}</span>
              </Link>
            ))}
          </section>
        </aside>
      </div>
    </div>
  );
}
