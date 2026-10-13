"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Avatar from "@/components/ui/Avatar";
import { ME, PEOPLE, type PersonId } from "@/lib/data/people";

const PHASES = ["Arrive", "Opening turns", "Conversation", "Close"] as const;
type Phase = (typeof PHASES)[number];

const HOST: PersonId = "nandi";
/** Six seats, equal weight. One stays open; you sit at the bottom. */
const SEATS: (PersonId | null)[] = ["nandi", "kwame", "leila", "amara", "zuri", null];
const ANGLES = [-90, -30, 30, 90, 150, 210];
const ORDER = SEATS.map((p, i) => ({ p, i })).filter((s): s is { p: PersonId; i: number } => !!s.p);

const AGREEMENTS = [
  "What's said here stays here. Nothing is recorded.",
  "Everyone speaks once before anyone replies.",
  "You can pass, at any time, without explaining.",
  "No advice unless someone asks for it.",
];
const QUESTION = "What does home remember?";

export default function PresenceRoom() {
  const [phase, setPhase] = useState<Phase>("Arrive");
  const [agreed, setAgreed] = useState<string[]>([]);
  const [turn, setTurn] = useState(0);
  const [turned, setTurned] = useState<PersonId[]>([]);
  const [speaker, setSpeaker] = useState<PersonId | null>(null);
  const [muted, setMuted] = useState(true);
  const [hand, setHand] = useState(false);
  const [keep, setKeep] = useState<PersonId[]>([]);
  const [line, setLine] = useState("");
  const [closed, setClosed] = useState(false);

  const current = ORDER[turn]?.p;
  const myTurn = phase === "Opening turns" && current === ME.id;

  // Opening turns: each person is given the floor in turn. Yours waits for you.
  const advance = (who: PersonId) => {
    setTurned((x) => [...x, who]);
    setTurn(turn + 1);
    if (turn + 1 >= ORDER.length) setPhase("Conversation");
  };

  useEffect(() => {
    if (phase !== "Opening turns" || !current || current === ME.id) return;
    const t = setTimeout(() => advance(current), 3200);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- advance only reads turn, which current already tracks
  }, [phase, current]);

  // Open conversation: the floor moves around naturally.
  useEffect(() => {
    if (phase !== "Conversation") return;
    const people = ORDER.map((o) => o.p).filter((p) => p !== ME.id || !muted);
    let i = 0;
    const t = setInterval(() => setSpeaker(people[i++ % people.length]), 2800);
    return () => clearInterval(t);
  }, [phase, muted]);

  const endMyTurn = () => {
    setSpeaker(null);
    advance(ME.id as PersonId);
  };

  // Who has the floor: during opening turns it's whoever's turn it is (you only once you choose to speak).
  const floor: PersonId | null = phase === "Opening turns" ? (current === ME.id ? (speaker === ME.id ? (ME.id as PersonId) : null) : current ?? null) : speaker;

  const phaseIdx = PHASES.indexOf(phase);

  return (
    <div className="at">
      <span className="at-wash" style={{ width: 700, height: 700, left: "20%", top: 40, background: "rgba(201,151,58,.18)" }} aria-hidden />
      <span className="at-wash" style={{ width: 500, height: 500, left: -180, bottom: -160, background: "rgba(38,48,107,.16)", animationDelay: "-8s" }} aria-hidden />

      <div className="at-room">
        <section className="at-room-main" aria-label="The table">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <div>
              <p className="at-mono" style={{ margin: 0 }}>Presence Room · hosted by {PEOPLE[HOST].name} · textiles theme</p>
              <h1 className="at-serif" style={{ margin: "4px 0 0", fontSize: 34, fontWeight: 400 }}>{QUESTION}</h1>
            </div>
            <nav className="at-phases" aria-label="Room rhythm">
              {PHASES.map((p, i) => (
                <span key={p} className={`at-phase${p === phase ? " on" : i < phaseIdx ? " done" : ""}`}>{p}</span>
              ))}
            </nav>
          </div>

          <div className="at-tablewrap">
            <div className="at-table">
              <span className="at-hearth" aria-hidden />
              <div className="at-tabletop">
                <div>
                  <p style={{ fontFamily: "var(--at-mono)", fontSize: 10.5, letterSpacing: ".08em", textTransform: "uppercase", opacity: 0.75 }}>{phase === "Opening turns" ? "Opening turn" : phase}</p>
                  <p className="at-serif" style={{ fontSize: 20, lineHeight: 1.25, marginTop: 6 }}>
                    {phase === "Arrive" && "Take a breath. Read the agreement."}
                    {phase === "Opening turns" && (myTurn ? "Your turn. Speak, or pass." : `${PEOPLE[current ?? HOST].name.split(" ")[0]} is sharing`)}
                    {phase === "Conversation" && (floor ? `${floor === ME.id ? "You" : PEOPLE[floor].name.split(" ")[0]} has the floor` : "Open conversation")}
                    {phase === "Close" && "Thank you for being here."}
                  </p>
                  {phase === "Opening turns" && <p style={{ fontSize: 12, opacity: 0.8, marginTop: 6 }}>{turned.length} of {ORDER.length} have spoken</p>}
                </div>
              </div>

              {SEATS.map((p, i) => {
                const a = (ANGLES[i] * Math.PI) / 180;
                const left = `${50 + 44 * Math.cos(a)}%`;
                const top = `${50 + 44 * Math.sin(a)}%`;
                if (!p) {
                  return (
                    <div key={i} className="at-seat empty" style={{ left, top }}>
                      <span className="ring">+</span>
                      <small>Open seat</small>
                    </div>
                  );
                }
                const me = p === ME.id;
                return (
                  <div key={p} className={`at-seat${floor === p ? " speaking" : ""}${turned.includes(p) ? " turned" : ""}`} style={{ left, top }}>
                    <span className="ring"><Avatar person={PEOPLE[p]} size={74} /></span>
                    <b>{me ? "You" : PEOPLE[p].name.split(" ")[0]}</b>
                    <small>{p === HOST ? "host" : me ? (muted ? "muted" : "speaking") : floor === p ? "speaking" : "listening"}{me && hand ? " · ✋" : ""}</small>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="at-controls">
            {phase === "Opening turns" && myTurn && (
              <>
                <button className="at-btn ink" onClick={() => { setMuted(false); setSpeaker(ME.id as PersonId); }}>Speak</button>
                <button className="at-btn" onClick={endMyTurn}>{speaker === ME.id ? "I'm done" : "Pass, no explanation needed"}</button>
              </>
            )}
            {phase === "Conversation" && (
              <>
                <button className="at-btn" onClick={() => setMuted((m) => !m)}>{muted ? "Unmute" : "Mute"}</button>
                <button className={`at-btn${hand ? " ink" : ""}`} onClick={() => setHand((h) => !h)}>✋ {hand ? "Hand raised" : "Raise a hand"}</button>
                <button className="at-btn ghost" onClick={() => { setPhase("Close"); setSpeaker(null); }}>Begin closing</button>
              </>
            )}
            {phase !== "Close" && <Link href="/rooms" className="at-btn ghost">Leave quietly</Link>}
          </div>
        </section>

        <aside className="at-room-side">
          {phase === "Arrive" && (
            <>
              <div>
                <p className="at-mono">Before we begin</p>
                <p className="at-serif" style={{ fontSize: 24, margin: "4px 0 0" }}>A small agreement</p>
              </div>
              {AGREEMENTS.map((a) => (
                <button key={a} className={`at-pick${agreed.includes(a) ? " on" : ""}`} onClick={() => setAgreed((x) => (x.includes(a) ? x.filter((y) => y !== a) : [...x, a]))} aria-pressed={agreed.includes(a)} style={{ textAlign: "left", alignItems: "flex-start", padding: 12 }}>
                  <span style={{ width: 20, height: 20, flex: "none", borderRadius: 6, border: "1.5px solid var(--at-ink-2)", display: "grid", placeItems: "center", fontSize: 12, background: agreed.includes(a) ? "var(--at-ochre)" : "transparent", color: "#fff" }}>{agreed.includes(a) ? "✓" : ""}</span>
                  {a}
                </button>
              ))}
              <div className="at-card" style={{ padding: 14 }}>
                <p className="at-mono" style={{ margin: 0 }}>Your boundaries tonight</p>
                <div className="at-boundary" style={{ marginTop: 8 }}><i>◐</i>Listening first is welcome. You can pass your opening turn.</div>
              </div>
              <button className="at-btn ink" disabled={agreed.length < AGREEMENTS.length} style={{ opacity: agreed.length < AGREEMENTS.length ? 0.4 : 1 }} onClick={() => setPhase("Opening turns")}>
                I agree, take my seat
              </button>
              <p className="at-mono" style={{ margin: 0 }}>{agreed.length} of {AGREEMENTS.length} agreed</p>
            </>
          )}

          {(phase === "Opening turns" || phase === "Conversation") && (
            <>
              <div>
                <p className="at-mono">The room</p>
                <p className="at-serif" style={{ fontSize: 22, margin: "4px 0 0" }}>Five people, one question</p>
              </div>
              {AGREEMENTS.slice(0, 3).map((a) => <div key={a} className="at-boundary"><i>✓</i>{a}</div>)}
              <div className="at-card" style={{ padding: 16 }}>
                <p className="at-mono" style={{ margin: 0 }}>From the host</p>
                <p className="at-hand" style={{ fontSize: 17, margin: "6px 0 0" }}>“Bring one cloth, place or smell that means home. Start there.”</p>
              </div>
              <p style={{ fontSize: 13, color: "var(--at-mute)", lineHeight: 1.5, margin: 0 }}>No audience, no recording, no follower counts. Everyone at the table has the same size seat, the host included.</p>
            </>
          )}

          {phase === "Close" && !closed && (
            <>
              <div>
                <p className="at-mono">Closing</p>
                <p className="at-serif" style={{ fontSize: 24, margin: "4px 0 0" }}>Anything worth carrying out?</p>
                <p style={{ fontSize: 13, color: "var(--at-mute)", margin: "6px 0 0" }}>No pressure. A good evening is enough on its own.</p>
              </div>
              <p className="at-mono" style={{ margin: 0 }}>Stay connected privately with…</p>
              {ORDER.filter((o) => o.p !== ME.id).map(({ p }) => (
                <button key={p} className={`at-pick${keep.includes(p) ? " on" : ""}`} onClick={() => setKeep((x) => (x.includes(p) ? x.filter((y) => y !== p) : [...x, p]))} aria-pressed={keep.includes(p)}>
                  <Avatar person={PEOPLE[p]} size={30} />{PEOPLE[p].name}
                  <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--at-mute)" }}>{keep.includes(p) ? "asked ✓" : ""}</span>
                </button>
              ))}
              <p className="at-mono" style={{ margin: 0 }}>Only they'll know, and only if they choose you too.</p>
              <label style={{ display: "grid", gap: 6 }}>
                <span className="at-mono">One line to remember (private)</span>
                <input value={line} onChange={(e) => setLine(e.target.value)} placeholder="Home is the smell of the indigo vat." style={{ height: 42, border: 0, borderBottom: "1px solid var(--at-ink-2)", background: "transparent", font: "italic 16px var(--at-serif)", outline: "none" }} />
              </label>
              <button className="at-btn ink" onClick={() => setClosed(true)}>Close the room</button>
              <button className="at-btn ghost" onClick={() => setClosed(true)}>Nothing more needed</button>
            </>
          )}

          {phase === "Close" && closed && (
            <div style={{ textAlign: "center", marginTop: 40 }}>
              <p className="at-serif" style={{ fontSize: 28, margin: 0 }}>Room closed.</p>
              <p className="at-hand" style={{ fontSize: 18 }}>{line.trim() ? `“${line.trim()}”` : "Nothing was recorded. Only you remember it."}</p>
              {keep.length > 0 && <p style={{ fontSize: 13.5, color: "var(--at-ink-2)" }}>You asked to stay connected with {keep.map((p) => PEOPLE[p].name.split(" ")[0]).join(", ")}. You&apos;ll hear if they say yes too.</p>}
              <Link href="/atelier" className="at-btn" style={{ marginTop: 12 }}>Back to today</Link>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
