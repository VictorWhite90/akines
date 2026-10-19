"use client";

import Link from "next/link";
import { useState } from "react";
import Avatar from "@/components/ui/Avatar";
import { MOODS } from "@/lib/data/community";
import { ME, PEOPLE, type PersonId } from "@/lib/data/people";

/* ---- Reserve a seat (hero) ---- */
export function ReserveButtons({ roomId }: { roomId: string }) {
  const [held, setHeld] = useState(false);
  return (
    <div className="hero-actions">
      <button className="join" onClick={() => setHeld((v) => !v)} aria-pressed={held}>{held ? "✓ Seat reserved" : "Reserve my seat"}</button>
      <Link className="ghost" href={`/rooms/${roomId}`}>Meet the room</Link>
    </div>
  );
}

/* ---- Meaningful introduction ---- */
export function Introduction({ id, reason, signals, opener }: { id: PersonId; reason: string; signals: string[]; opener: string }) {
  const other = PEOPLE[id];
  const [why, setWhy] = useState(false);
  const [state, setState] = useState<"idle" | "sent" | "passed">("idle");
  return (
    <section className="panel">
      <div className="panel-head">
        <h3>A meaningful introduction</h3>
        <button onClick={() => setWhy((v) => !v)} aria-expanded={why}>Why this match?</button>
      </div>
      <div className="match-card">
        <span className="avatar-wrap"><Avatar person={other} size={54} /></span>
        <div>
          <h4>{other.name}</h4>
          <p>{other.role} · {other.city}</p>
        </div>
        <span className="match-score" title="AI suggestion">94%</span>
      </div>
      <p className="reason">“{reason}”</p>
      {why && (
        <ul className="signals" aria-label="Where your paths cross">
          {signals.map((s) => <li key={s}>{s}</li>)}
          <li style={{ marginTop: 4 }}><i>AI suggestion. You can switch off any signal in Creative DNA.</i></li>
        </ul>
      )}
      {state === "idle" && (
        <div className="match-actions">
          <button onClick={() => setState("passed")}>Not now</button>
          <button className="connect" onClick={() => setState("sent")} title={opener}>Say hello</button>
        </div>
      )}
      {state === "sent" && <p className="sent-note">Introduction sent. {other.name.split(" ")[0]} will see why you were matched, and can reply when ready.</p>}
      {state === "passed" && (
        <p className="sent-note" style={{ background: "#eeeae0", color: "var(--muted)" }}>
          We'll suggest fewer like this. <button onClick={() => setState("idle")} style={{ border: 0, background: "none", textDecoration: "underline", fontSize: 11 }}>Undo</button>
        </p>
      )}
    </section>
  );
}

/* ---- Mood check-in ---- */
const MOOD_GLYPHS: { id: string; glyph: string }[] = [
  { id: "heavy", glyph: "◔" },
  { id: "tender", glyph: "◡" },
  { id: "grounded", glyph: "●" },
  { id: "open", glyph: "✦" },
  { id: "restless", glyph: "☀" },
];

export function MoodCheckin() {
  const [picked, setPicked] = useState<string | null>(null);
  const mood = MOODS.find((m) => m.id === picked);
  return (
    <section className="panel mood">
      <h3>How are you today?</h3>
      <p>A small check-in helps Akines support—not judge—you.</p>
      <div className="moods" role="radiogroup" aria-label="Today's mood">
        {MOOD_GLYPHS.map((m) => (
          <button key={m.id} role="radio" aria-checked={picked === m.id} aria-label={MOODS.find((x) => x.id === m.id)?.word} className={`mood-btn${picked === m.id ? " selected" : ""}`} onClick={() => setPicked(m.id)}>{m.glyph}</button>
        ))}
      </div>
      {mood && <p className="mood-reply" aria-live="polite">{mood.reply}</p>}
      <span className="private-note">⌾ Private to you · Never used for matching, ranking or ads</span>
    </section>
  );
}

export { ME };
