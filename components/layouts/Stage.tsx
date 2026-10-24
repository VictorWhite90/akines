"use client";

import Link from "next/link";
import { useState } from "react";
import Avatar from "@/components/ui/Avatar";
import Photo from "@/components/ui/Photo";
import { BANTERS } from "@/lib/data/banter";
import { CIRCLES, ROOMS } from "@/lib/data/community";
import { STARS } from "@/lib/data/constellation";
import { GAMES } from "@/lib/data/games";
import { PEOPLE, type PersonId } from "@/lib/data/people";
import Icon, { Glyph } from "@/components/ui/Icon";

type Act = { id: string; kind: "now" | "banter" | "game" | "room" | "circle"; when: string; title: string; who: PersonId[]; live?: boolean };

const ACTS: Act[] = [
  { id: "now", kind: "now", when: "Live now", title: "Is AI helping or damaging African art?", who: ["tunde", "kwame", "zuri"], live: true },
  { id: "banter", kind: "banter", when: "Waiting for you", title: BANTERS[0].prompt, who: [BANTERS[0].by, ...BANTERS[0].replies.map((r) => r.by)] },
  { id: "game", kind: "game", when: "20:00", title: "How Well Do We Remember?", who: ["kwame", "tunde", "efua"] },
  { id: "room", kind: "room", when: "21:00", title: ROOMS[0].title, who: ROOMS[0].seated },
  { id: "circle", kind: "circle", when: "Week 4 of 8", title: "West African Markets · Make", who: ["wanjiru", "efua", "fatou"] },
];
const GLYPH = { now: "live", banter: "banter", game: "play", room: "live", circle: "circle" } as const;
const DOT: Record<string, string> = { studio: "var(--nx-brass)", room: "var(--nx-ember)", quiet: "rgba(243,239,230,.35)", open: "var(--nx-sage)" };

/** Layout B: one thing on stage at a time; your people are always in the dock below. */
export default function Stage() {
  const [actId, setActId] = useState("now");
  const [pulled, setPulled] = useState<Record<string, PersonId[]>>({});
  const act = ACTS.find((a) => a.id === actId)!;
  const extra = pulled[act.id] ?? [];
  const seats = [...new Set([...act.who, ...extra])];

  const pull = (id: PersonId) =>
    setPulled((cur) => {
      const list = cur[act.id] ?? [];
      return { ...cur, [act.id]: list.includes(id) ? list.filter((x) => x !== id) : [...list, id] };
    });

  return (
    <div className="lx-stagewrap">
      <nav className="lx-now" aria-label="Now">
        {ACTS.map((a) => (
          <button key={a.id} className={a.id === actId ? "on" : undefined} onClick={() => setActId(a.id)}>
            <span className="lx-ico" style={{ width: 30, height: 30 }}><Glyph g={GLYPH[a.kind]} size={15} /></span>
            <span style={{ textAlign: "left" }}>
              <span className={`lx-when${a.live ? " live" : ""}`} style={{ display: "block" }}>{a.live ? "● " : ""}{a.when}</span>
              <span style={{ display: "block", maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.title}</span>
            </span>
          </button>
        ))}
      </nav>

      <section className="lx-stage" aria-label="Stage">
        <div key={act.id} className="lx-stage-card">
          <StageBody act={act} />
          <p className="lx-eye" style={{ marginTop: 26 }}>On stage · {seats.length} {seats.length === 1 ? "person" : "people"}</p>
          <div className="lx-seats">
            {seats.map((id) => (
              <div key={id} className={`lx-seat${extra.includes(id) ? " new" : ""}`}>
                <Avatar person={PEOPLE[id]} size={56} />
                {PEOPLE[id].name.split(" ")[0]}
                {extra.includes(id) && <span style={{ color: "var(--nx-brass)", fontSize: 10.5 }}>invited</span>}
              </div>
            ))}
            <div className="lx-seat"><span style={{ width: 56, height: 56, borderRadius: "50%", border: "1.5px dashed var(--nx-line)", display: "grid", placeItems: "center" }}>+</span>Tap the dock</div>
          </div>
        </div>
      </section>

      <div className="lx-dock">
        <div className="lx-dock-in" role="list" aria-label="Your people">
          {STARS.filter((s) => s.orbit !== "new").map((s) => {
            const p = PEOPLE[s.id];
            const on = seats.includes(s.id);
            return (
              <button key={s.id} role="listitem" className={`lx-dockp${on ? " in" : ""}`} onClick={() => pull(s.id)} aria-pressed={extra.includes(s.id)} title={on ? `${p.name} is on stage` : `Bring ${p.name} onto the stage`}>
                <Avatar person={p} size={44} />
                <span className="dot" style={{ background: DOT[p.presence] }} />
                {p.name.split(" ")[0]}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StageBody({ act }: { act: Act }) {
  if (act.kind === "now") {
    return (
      <>
        <p className="lx-when live">● Banter Now · 20 min · not recorded</p>
        <h2 className="lx-h" style={{ fontSize: 38, marginTop: 8 }}>{act.title}</h2>
        <p className="lx-mute" style={{ fontSize: 15 }}>Equal seats, no audience. Join and say one thing, or just listen.</p>
        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
          <Link className="lx-btn brass" href="/banter/now/ai-art" style={{ height: 44, padding: "0 20px" }}>Join the conversation</Link>
          <button className="lx-btn" style={{ height: 44 }}>Listen first</button>
        </div>
      </>
    );
  }
  if (act.kind === "banter") {
    const b = BANTERS[0];
    return (
      <div style={{ display: "grid", gridTemplateColumns: "1fr 220px", gap: 22 }}>
        <div>
          <p className="lx-eye">Banter · {b.audienceLabel}</p>
          <h2 className="lx-h" style={{ fontSize: 32, marginTop: 8 }}>{b.prompt}</h2>
          {b.replies.slice(0, 2).map((r) => (
            <p key={r.id} style={{ fontSize: 14, margin: "12px 0 0" }}><b>{PEOPLE[r.by].name.split(" ")[0]}:</b> <span className="lx-mute">{r.kind === "voice" ? `voice note ${r.length}` : r.text}</span></p>
          ))}
          <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
            <Link className="lx-btn brass" href={`/banter/${b.id}`}>Add a thoughtful response</Link>
            <button className="lx-btn"><Icon name="spark" size={15} className="ic-inline" /> I want to explore this</button>
          </div>
        </div>
        {b.photo && <Photo name={b.photo} sizes="220px" className="h-full min-h-48 rounded-2xl" />}
      </div>
    );
  }
  if (act.kind === "game") {
    const g = GAMES.find((x) => x.id === "remember")!;
    return (
      <>
        <p className="lx-eye">Game night · {g.name}</p>
        <div style={{ padding: 28, borderRadius: 22, background: "var(--nx-parchment)", color: "var(--nx-night)", marginTop: 12 }}>
          <p className="lx-eye" style={{ color: "#b4532a", margin: 0 }}>Card 1 of {g.cards.length}</p>
          <p style={{ font: "500 30px/1.25 var(--nx-serif)", margin: "8px 0 0" }}>{g.cards[0]}</p>
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
          <Link className="lx-btn brass" href="/play/session/uni-night">Join the game</Link>
          <button className="lx-btn">Skip, no explanation needed</button>
        </div>
      </>
    );
  }
  if (act.kind === "room") {
    const r = ROOMS[0];
    return (
      <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 22, alignItems: "center" }}>
        <Photo name={r.photo} sizes="240px" className="h-48 rounded-2xl" />
        <div>
          <p className="lx-when">{r.when} · Presence Room · six seats</p>
          <h2 className="lx-h" style={{ fontSize: 30, marginTop: 8 }}>{r.title}</h2>
          <p className="lx-mute" style={{ fontSize: 14 }}>{r.blurb}</p>
          <Link className="lx-btn brass" href={`/rooms/${r.id}`} style={{ marginTop: 10 }}>Reserve a seat</Link>
        </div>
      </div>
    );
  }
  const c = CIRCLES[3];
  return (
    <>
      <p className="lx-eye">KinCircle · week 4 of 8 · Make</p>
      <h2 className="lx-h" style={{ fontSize: 34, marginTop: 8 }}>West African Markets</h2>
      <div className="lx-bar" style={{ maxWidth: 420 }}><i style={{ width: "50%" }} /></div>
      <p className="lx-mute" style={{ fontSize: 14.5, marginTop: 12 }}>This week: each member brings one photograph and one trader&apos;s story. “{c.starter}”</p>
      <Link className="lx-btn brass" href="/circles" style={{ marginTop: 10 }}>Continue the journey</Link>
    </>
  );
}
