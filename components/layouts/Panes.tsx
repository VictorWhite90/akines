"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Avatar from "@/components/ui/Avatar";
import Photo from "@/components/ui/Photo";
import { BANTERS, BANTER_MOODS } from "@/lib/data/banter";
import { CIRCLES, ROOMS } from "@/lib/data/community";
import { STARS } from "@/lib/data/constellation";
import { GAMES, GAME_SESSIONS } from "@/lib/data/games";
import { PEOPLE, PRESENCE, type Person, type PersonId } from "@/lib/data/people";

type Pane =
  | { kind: "today" }
  | { kind: "banter"; id: string }
  | { kind: "person"; id: PersonId }
  | { kind: "circle"; id: string }
  | { kind: "game"; id: string }
  | { kind: "room"; id: string };

const key = (p: Pane) => ("id" in p ? `${p.kind}:${p.id}` : p.kind);
const TITLE: Record<Pane["kind"], string> = { today: "Today", banter: "Banter", person: "Person", circle: "KinCircle", game: "Game", room: "Presence Room" };

/** Layout A: every click opens a pane beside the current one, so your path stays visible. */
export default function Panes() {
  const [stack, setStack] = useState<Pane[]>([{ kind: "today" }, { kind: "banter", id: "unfinished" }, { kind: "person", id: "kwame" }]);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    box.current?.scrollTo({ left: box.current.scrollWidth, behavior: "smooth" });
  }, [stack.length]);

  const open = (from: number) => (p: Pane) => setStack((s) => [...s.slice(0, from + 1), p]);
  const close = (i: number) => setStack((s) => s.slice(0, Math.max(i, 1)));

  return (
    <div className="lx-panes" ref={box}>
      {stack.map((p, i) => {
        const next = stack[i + 1];
        const sel = (q: Pane) => !!next && key(next) === key(q);
        return (
          <section key={`${i}-${key(p)}`} className="lx-pane" aria-label={TITLE[p.kind]}>
            <div className="lx-pane-top">
              <span className="lx-trail">{stack.slice(0, i + 1).map((x) => TITLE[x.kind]).join("  ›  ")}</span>
              {i > 0 && <button className="lx-btn" style={{ height: 30 }} onClick={() => close(i)} aria-label="Close pane">×</button>}
            </div>
            <PaneBody pane={p} open={open(i)} sel={sel} />
          </section>
        );
      })}
    </div>
  );
}

function PaneBody({ pane, open, sel }: { pane: Pane; open: (p: Pane) => void; sel: (p: Pane) => boolean }) {
  if (pane.kind === "today") {
    return (
      <>
        <p className="lx-eye">Tuesday · for you</p>
        <h2 className="lx-h" style={{ fontSize: 30, marginTop: 6 }}>Good evening, Amara.</h2>
        <p className="lx-mute" style={{ fontSize: 13.5, margin: "6px 0 16px" }}>Three people are waiting on you, and one room starts soon.</p>

        <p className="lx-eye" style={{ marginTop: 10 }}>Banters for you</p>
        {BANTERS.slice(0, 4).map((b) => {
          const p: Pane = { kind: "banter", id: b.id };
          return (
            <button key={b.id} className={`lx-row${sel(p) ? " on" : ""}`} onClick={() => open(p)}>
              <Avatar person={PEOPLE[b.by]} size={34} />
              <span style={{ minWidth: 0 }}>
                <span className="lx-faint" style={{ fontSize: 11.5 }}>{PEOPLE[b.by].name.split(" ")[0]} · {b.audienceLabel}</span>
                <span style={{ display: "block", fontSize: 13.5, fontWeight: 600, lineHeight: 1.35 }}>{b.prompt}</span>
              </span>
            </button>
          );
        })}

        <p className="lx-eye" style={{ marginTop: 16 }}>Tonight</p>
        {GAME_SESSIONS.slice(0, 1).map((s) => {
          const p: Pane = { kind: "game", id: s.game };
          return (
            <button key={s.id} className={`lx-row${sel(p) ? " on" : ""}`} onClick={() => open(p)}>
              <span className="lx-ico">☺</span>
              <span><span className="lx-when">{s.when}</span><span style={{ display: "block", fontSize: 13.5, fontWeight: 600 }}>{s.title}</span></span>
            </button>
          );
        })}
        {ROOMS.slice(0, 2).map((r) => {
          const p: Pane = { kind: "room", id: r.id };
          return (
            <button key={r.id} className={`lx-row${sel(p) ? " on" : ""}`} onClick={() => open(p)}>
              <span className="lx-ico">◉</span>
              <span><span className={`lx-when${r.status === "live" ? " live" : ""}`}>{r.when}</span><span style={{ display: "block", fontSize: 13.5, fontWeight: 600 }}>{r.title}</span></span>
            </button>
          );
        })}

        <p className="lx-eye" style={{ marginTop: 16 }}>Your Cliq</p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 8 }}>
          {STARS.filter((s) => s.orbit === "cliq").map((s) => {
            const p: Pane = { kind: "person", id: s.id };
            return (
              <button key={s.id} onClick={() => open(p)} className={`lx-row${sel(p) ? " on" : ""}`} style={{ width: "auto", flexDirection: "column", gap: 6, padding: 10 }}>
                <Avatar person={PEOPLE[s.id]} size={44} />
                <span style={{ fontSize: 11.5 }}>{PEOPLE[s.id].name.split(" ")[0]}</span>
              </button>
            );
          })}
        </div>
      </>
    );
  }

  if (pane.kind === "banter") {
    const b = BANTERS.find((x) => x.id === pane.id)!;
    const mood = BANTER_MOODS.find((m) => m.id === b.mood)!;
    return (
      <>
        <button className="lx-row" onClick={() => open({ kind: "person", id: b.by })} style={{ padding: 6 }}>
          <Avatar person={PEOPLE[b.by]} size={30} />
          <span style={{ fontSize: 12.5 }}><b>{PEOPLE[b.by].name}</b> <span className="lx-faint">· {b.audienceLabel} · {b.ago}</span></span>
        </button>
        <h2 className="lx-h" style={{ fontSize: 26, margin: "10px 0" }}>{b.prompt}</h2>
        {b.photo && <Photo name={b.photo} sizes="420px" className="h-44 rounded-2xl" />}
        <p style={{ margin: "12px 0" }}><span className="lx-btn" style={{ height: 26, cursor: "default" }}>{mood.label}</span> <span className="lx-faint" style={{ fontSize: 12 }}>{mood.hint}</span></p>
        <p className="lx-eye">{b.replies.length} thoughtful responses</p>
        {b.replies.map((r) => (
          <button key={r.id} className={`lx-row${sel({ kind: "person", id: r.by }) ? " on" : ""}`} onClick={() => open({ kind: "person", id: r.by })} style={{ alignItems: "flex-start" }}>
            <Avatar person={PEOPLE[r.by]} size={30} />
            <span style={{ fontSize: 13, lineHeight: 1.45 }}><b>{PEOPLE[r.by].name.split(" ")[0]}</b> <span className="lx-mute">{r.kind === "voice" ? `◉ voice note · ${r.length}` : r.text}</span></span>
          </button>
        ))}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 14 }}>
          <button className="lx-btn brass" onClick={() => open({ kind: "circle", id: "textiles" })}>◎ Turn into a KinCircle</button>
          <button className="lx-btn" onClick={() => open({ kind: "game", id: "unfinished-artwork" })}>☺ Play about it</button>
        </div>
      </>
    );
  }

  if (pane.kind === "person") {
    const p: Person = PEOPLE[pane.id];
    const star = STARS.find((s) => s.id === pane.id);
    const theirs = BANTERS.filter((b) => b.by === pane.id);
    return (
      <>
        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
          <Avatar person={p} size={72} />
          <div>
            <h2 className="lx-h" style={{ fontSize: 28 }}>{p.name}</h2>
            <p className="lx-mute" style={{ margin: "2px 0 0", fontSize: 13 }}>{p.role} · {p.city}</p>
            <p className="lx-faint" style={{ margin: "4px 0 0", fontSize: 12 }}>● {PRESENCE[p.presence].label}{p.note ? ` · ${p.note}` : ""}</p>
          </div>
        </div>
        <p style={{ margin: "14px 0", fontSize: 14, lineHeight: 1.55 }}>{p.about}</p>
        {star && (
          <div style={{ padding: 14, borderRadius: 16, background: "rgba(233,184,92,.08)", border: "1px solid var(--nx-line)", fontSize: 13.5 }}>
            <p className="lx-eye" style={{ margin: "0 0 4px" }}>Why you&apos;re connected</p>{star.why}
            <p className="lx-faint" style={{ margin: "6px 0 0", fontSize: 12 }}>Last: {star.last}</p>
          </div>
        )}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "14px 0" }}>
          <Link className="lx-btn brass" href="/banter#compose">❝ Banter</Link>
          <button className="lx-btn">◉ Voice note</button>
          <button className="lx-btn" onClick={() => open({ kind: "game", id: "two-truths" })}>☺ Play</button>
        </div>
        {theirs.length > 0 && <p className="lx-eye">Their Banters</p>}
        {theirs.map((b) => (
          <button key={b.id} className={`lx-row${sel({ kind: "banter", id: b.id }) ? " on" : ""}`} onClick={() => open({ kind: "banter", id: b.id })}>
            <span className="lx-ico">❝</span><span style={{ fontSize: 13.5, fontWeight: 600 }}>{b.prompt}</span>
          </button>
        ))}
        <p className="lx-eye" style={{ marginTop: 12 }}>Circles you share</p>
        {CIRCLES.slice(3, 5).map((c) => (
          <button key={c.id} className={`lx-row${sel({ kind: "circle", id: c.id }) ? " on" : ""}`} onClick={() => open({ kind: "circle", id: c.id })}>
            <span className="lx-ico">◎</span><span style={{ fontSize: 13.5, fontWeight: 600 }}>{c.name}</span>
          </button>
        ))}
      </>
    );
  }

  if (pane.kind === "circle") {
    const c = CIRCLES.find((x) => x.id === pane.id) ?? CIRCLES[0];
    return (
      <>
        <Photo name={c.photo} sizes="440px" className="h-40 rounded-2xl" />
        <p className="lx-eye" style={{ marginTop: 14 }}>KinCircle · week 4 of 8</p>
        <h2 className="lx-h" style={{ fontSize: 28, marginTop: 4 }}>{c.name}</h2>
        <p className="lx-mute" style={{ fontSize: 13.5, lineHeight: 1.55 }}>{c.blurb}</p>
        <div className="lx-bar"><i style={{ width: "50%" }} /></div>
        <p className="lx-faint" style={{ fontSize: 12 }}>Arrive · Understand · <b style={{ color: "var(--nx-brass)" }}>Make</b> · Reflect · Continue</p>
        <div style={{ padding: 14, borderRadius: 16, background: "rgba(243,239,230,.04)", margin: "12px 0", fontSize: 14 }}>
          <p className="lx-eye" style={{ margin: "0 0 4px" }}>This week&apos;s prompt</p>“{c.starter}”
        </div>
        <p className="lx-eye">Members</p>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 6 }}>
          {(["ayo", "efua", "chidi", "kwame", "zuri"] as PersonId[]).map((id) => (
            <button key={id} className={`lx-row${sel({ kind: "person", id }) ? " on" : ""}`} onClick={() => open({ kind: "person", id })} style={{ width: "auto", padding: 6 }}>
              <Avatar person={PEOPLE[id]} size={34} />
            </button>
          ))}
        </div>
        <button className="lx-btn brass" style={{ marginTop: 14 }} onClick={() => open({ kind: "room", id: "indigo-memory" })}>◉ Open this week&apos;s room</button>
      </>
    );
  }

  if (pane.kind === "game") {
    const g = GAMES.find((x) => x.id === pane.id) ?? GAMES[0];
    return (
      <>
        <Photo name={g.photo} sizes="440px" className="h-40 rounded-2xl" />
        <p className="lx-eye" style={{ marginTop: 14 }}>Play Together · {g.players} players · {g.minutes} min</p>
        <h2 className="lx-h" style={{ fontSize: 28, marginTop: 4 }}>{g.name}</h2>
        <p className="lx-mute" style={{ fontSize: 13.5, lineHeight: 1.55 }}>{g.blurb}</p>
        <div style={{ padding: 18, borderRadius: 18, background: "var(--nx-parchment)", color: "var(--nx-night)", margin: "12px 0" }}>
          <p className="lx-eye" style={{ color: "#b4532a", margin: 0 }}>First card</p>
          <p style={{ font: "500 20px/1.3 var(--nx-serif)", margin: "6px 0 0" }}>{g.cards[0]}</p>
        </div>
        <Link className="lx-btn brass" href={`/play/${g.id}`}>Invite people and play</Link>
      </>
    );
  }

  const r = ROOMS.find((x) => x.id === pane.id) ?? ROOMS[0];
  return (
    <>
      <Photo name={r.photo} sizes="440px" className="h-40 rounded-2xl" />
      <p className={`lx-when${r.status === "live" ? " live" : ""}`} style={{ marginTop: 14 }}>{r.when} · six seats</p>
      <h2 className="lx-h" style={{ fontSize: 26, marginTop: 4 }}>{r.title}</h2>
      <p className="lx-mute" style={{ fontSize: 13.5, lineHeight: 1.55 }}>{r.blurb}</p>
      <div style={{ display: "flex", gap: 8, margin: "12px 0" }}>
        {Array.from({ length: 6 }, (_, i) => r.seated[i]).map((id, i) =>
          id ? (
            <button key={i} className="lx-row" style={{ width: "auto", padding: 4 }} onClick={() => open({ kind: "person", id })}><Avatar person={PEOPLE[id]} size={38} /></button>
          ) : (
            <span key={i} style={{ width: 46, height: 46, borderRadius: "50%", border: "1.5px dashed var(--nx-line)", display: "grid", placeItems: "center", color: "var(--nx-faint)" }}>+</span>
          ),
        )}
      </div>
      <Link className="lx-btn brass" href={`/rooms/${r.id}`}>Take a seat</Link>
      <p className="lx-faint" style={{ fontSize: 12, marginTop: 10 }}>No audience. Not recorded. You can leave quietly.</p>
    </>
  );
}
