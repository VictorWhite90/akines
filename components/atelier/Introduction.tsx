"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Avatar from "@/components/ui/Avatar";
import { ME, PEOPLE, type PersonId } from "@/lib/data/people";

type Thread = { label: string; kind: "match" | "comp" | "own" };
type Match = {
  id: PersonId;
  headline: React.ReactNode;
  reason: React.ReactNode;
  mine: Thread[];
  theirs: Thread[];
  /** Which of my threads ties to which of theirs: [myIndex, theirIndex, kind]. */
  ties: [number, number, "match" | "comp"][];
  first: string;
};

const MATCHES: Match[] = [
  {
    id: "leila",
    headline: <>Two collectors who love the same thing <span className="at-hand">for different reasons.</span></>,
    reason: <>You both collect <b>African contemporary work</b> and care about <b>the diaspora</b>. You buy for <i>the story behind a piece</i>; Leila buys work <i>she can argue with</i>. That difference is the point: each of you sees what the other misses.</>,
    mine: [{ label: "Collects for story", kind: "comp" }, { label: "African contemporary", kind: "match" }, { label: "Diaspora & home", kind: "match" }, { label: "Prefers small rooms", kind: "match" }, { label: "Lagos", kind: "own" }],
    theirs: [{ label: "Collects to argue", kind: "comp" }, { label: "African contemporary", kind: "match" }, { label: "Diaspora & return", kind: "match" }, { label: "Prefers small rooms", kind: "match" }, { label: "Casablanca", kind: "own" }],
    ties: [[0, 0, "comp"], [1, 1, "match"], [2, 2, "match"], [3, 3, "match"]],
    first: "Start with a private Banter: “What's the last piece you argued with?”",
  },
  {
    id: "chidi",
    headline: <>A collector and a student <span className="at-hand">learning to look.</span></>,
    reason: <>Chidi is at the start, <b>learning how to see work slowly</b>. You have twelve years of <b>buying with care</b>. He'd bring <i>fresh eyes</i>; you'd bring <i>patience and context</i>. A mentorship, if you both want one.</>,
    mine: [{ label: "12 years collecting", kind: "comp" }, { label: "Looks slowly", kind: "match" }, { label: "Story-led", kind: "match" }, { label: "Lagos", kind: "own" }],
    theirs: [{ label: "First year", kind: "comp" }, { label: "Learning to look", kind: "match" }, { label: "Story-led", kind: "match" }, { label: "Enugu", kind: "own" }],
    ties: [[0, 0, "comp"], [1, 1, "match"], [2, 2, "match"]],
    first: "Start with a slow game: “Guess the story behind the artwork”.",
  },
  {
    id: "wanjiru",
    headline: <>A photographer and a collector <span className="at-hand">who both keep small things.</span></>,
    reason: <>Wanjiru photographs <b>what people keep in their pockets</b>; you collect <b>work about memory</b>. Her markets project needs <i>a collector who knows Lagos</i>, and you'd get <i>a way into an archive as it's made</i>.</>,
    mine: [{ label: "Memory & objects", kind: "match" }, { label: "Knows Lagos", kind: "comp" }, { label: "Story-led", kind: "match" }, { label: "Lagos", kind: "own" }],
    theirs: [{ label: "Memory & objects", kind: "match" }, { label: "Needs a Lagos eye", kind: "comp" }, { label: "Story-led", kind: "match" }, { label: "Nairobi", kind: "own" }],
    ties: [[0, 0, "match"], [1, 1, "comp"], [2, 2, "match"]],
    first: "Start in her KinCircle: West African Markets, week 4.",
  },
];

const ROW = 64;
const TOP = 34;
/** Height of the portrait, name and role above the first thread. */
const HEAD = 192;

export default function Introduction() {
  const [idx, setIdx] = useState(0);
  const [state, setState] = useState<"idle" | "mine" | "joined" | "declined">("idle");
  const m = MATCHES[idx];
  const them = PEOPLE[m.id];
  const first = them.name.split(" ")[0];

  useEffect(() => {
    if (state !== "mine") return;
    const t = setTimeout(() => setState("joined"), 2600);
    return () => clearTimeout(t);
  }, [state]);

  const pick = (i: number) => {
    setIdx(i);
    setState("idle");
  };

  const h = TOP * 2 + (Math.max(m.mine.length, m.theirs.length) - 1) * ROW;
  const joined = state === "joined";

  return (
    <div className="at">
      <span className="at-wash" style={{ width: 600, height: 600, left: -200, top: 120, background: "rgba(38,48,107,.18)" }} aria-hidden />
      <span className="at-wash" style={{ width: 520, height: 520, right: -180, top: -60, background: "rgba(194,96,63,.14)", animationDelay: "-12s" }} aria-hidden />

      <div className="at-intro">
        <div style={{ display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap" }}>
          {MATCHES.map((x, i) => (
            <button key={x.id} className={`at-chip${i === idx ? " on" : ""}`} style={{ padding: "6px 14px 6px 6px", fontSize: 13 }} onClick={() => pick(i)}>
              <Avatar person={PEOPLE[x.id]} size={26} />{PEOPLE[x.id].name.split(" ")[0]}
            </button>
          ))}
        </div>

        <div className="at-intro-head" style={{ marginTop: 28 }}>
          <p className="at-mono">A meaningful introduction · suggested, never automatic</p>
          <h1 className="at-serif">{m.headline}</h1>
        </div>

        <div className="at-pair">
          <div className="at-side">
            <span className={`at-portrait${state === "mine" || joined ? " yes" : ""}`}><Avatar person={ME} size={110} /></span>
            <p className="at-serif" style={{ fontSize: 26, margin: "12px 0 0" }}>You</p>
            <p className="at-mono" style={{ margin: "2px 0 0" }}>{ME.role} · {ME.city}</p>
            <ul className="at-threads" style={{ marginTop: 18 }}>
              {m.mine.map((t) => <li key={t.label} className={t.kind} style={{ height: ROW - 10 }}><span className="k">{t.label}</span></li>)}
            </ul>
          </div>

          <div className={`at-knot${joined ? " joined" : ""}`} style={{ height: h + HEAD }} aria-hidden>
            <svg viewBox={`0 0 260 ${h + HEAD}`} preserveAspectRatio="none">
              {m.ties.map(([a, b, k], i) => {
                const y1 = HEAD + TOP + a * ROW;
                const y2 = HEAD + TOP + b * ROW;
                const mid = (y1 + y2) / 2 + (k === "comp" ? -26 : 14);
                return <path key={`${idx}-${i}`} className={k} d={`M0 ${y1} C 90 ${y1}, 100 ${mid}, 130 ${mid} S 170 ${y2}, 260 ${y2}`} style={{ animationDelay: `${i * 0.18}s` }} />;
              })}
            </svg>
            <div className="seal" style={{ top: HEAD + h / 2 }}>{joined ? <>Introduced</> : state === "mine" ? <>Waiting for {first}</> : <>Two yeses<br />needed</>}</div>
            {joined && (
              <div className="at-burst" style={{ top: HEAD + h / 2 }}>
                {Array.from({ length: 14 }, (_, i) => {
                  const a = (i / 14) * Math.PI * 2;
                  return <span key={i} style={{ ["--x" as string]: `${Math.cos(a) * 90}px`, ["--y" as string]: `${Math.sin(a) * 90}px`, animationDelay: `${(i % 3) * 0.05}s` }} />;
                })}
              </div>
            )}
          </div>

          <div className="at-side right">
            <span className={`at-portrait${joined ? " yes" : ""}`}><Avatar person={them} size={110} /></span>
            <p className="at-serif" style={{ fontSize: 26, margin: "12px 0 0" }}>{them.name}</p>
            <p className="at-mono" style={{ margin: "2px 0 0" }}>{them.role} · {them.city}</p>
            <ul className="at-threads" style={{ marginTop: 18 }}>
              {m.theirs.map((t) => <li key={t.label} className={t.kind} style={{ height: ROW - 10 }}><span className="k">{t.label}</span></li>)}
            </ul>
          </div>
        </div>

        <p className="at-mono" style={{ textAlign: "center", marginTop: 6 }}>
          <span style={{ color: "var(--at-indigo)" }}>━ shared thread</span> &nbsp;·&nbsp; <span style={{ color: "var(--at-terra)" }}>┅ complementary strength</span>
        </p>

        <div className="at-card at-reason">
          <p className="at-mono">Why this connection</p>
          <p className="big">{m.reason}</p>
          <p className="at-mono" style={{ marginTop: 16 }}>Based only on what you both chose to reveal in your Creative DNA</p>
        </div>

        {state === "declined" ? (
          <p className="at-empty" style={{ marginTop: 30 }}>Understood. {first} won&apos;t be told, and Akines won&apos;t suggest this again.</p>
        ) : (
          <>
            <div className="at-consent">
              <span className={`at-yes${state !== "idle" ? " done" : ""}`}><b>{state !== "idle" ? "✓" : "1"}</b>Your yes</span>
              <span className="at-mono">+</span>
              <span className={`at-yes${joined ? " done" : ""}`}><b>{joined ? "✓" : "2"}</b>{first}&apos;s yes</span>
            </div>
            <div className="at-consent" style={{ marginTop: 18 }}>
              {state === "idle" && (
                <>
                  <button className="at-btn ink" onClick={() => setState("mine")}>Yes, I&apos;d like to meet {first}</button>
                  <button className="at-btn ghost">Ask a question first</button>
                  <button className="at-btn ghost" onClick={() => setState("declined")}>Not now</button>
                </>
              )}
              {state === "mine" && <p className="at-hand" style={{ fontSize: 20, margin: 0 }}>We&apos;ve let {first} know, gently. Waiting for their yes…</p>}
              {joined && (
                <>
                  <Link href="/banter#start" className="at-btn ink">Start a private Banter</Link>
                  <Link href="/atelier/room" className="at-btn">Reserve two seats in a room</Link>
                </>
              )}
            </div>
            {joined && <p className="at-hand" style={{ textAlign: "center", fontSize: 19, marginTop: 14 }}>{m.first}</p>}
          </>
        )}

        <div className="at-hidden">
          {[["Contact details", "Hidden until both say yes"], ["Private conversation", "Opens after the introduction"], ["Each other's journals", "Only what each of you shares later"]].map(([t, s]) => (
            <div key={t} className={joined ? "open" : undefined}>
              <p className="at-mono" style={{ margin: 0, color: joined ? "#8f6420" : undefined }}>{joined ? "Now open" : "Locked"}</p>
              <p style={{ margin: "4px 0 0", fontWeight: 600 }}>{t}</p>
              <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--at-mute)" }}>{joined && t === "Contact details" ? "Shared with each other only" : s}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
