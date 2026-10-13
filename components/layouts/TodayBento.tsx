"use client";

import Link from "next/link";
import { useState } from "react";
import Avatar from "@/components/ui/Avatar";
import Photo from "@/components/ui/Photo";
import { BANTERS } from "@/lib/data/banter";
import { ROOMS } from "@/lib/data/community";
import { BRIGHTNESS, STARS } from "@/lib/data/constellation";
import { GAMES } from "@/lib/data/games";
import { PEOPLE } from "@/lib/data/people";

const DAY = [
  { t: "08:00", kind: "done", title: "Morning check-in", body: "You said: steady." },
  { t: "10:00", kind: "done", title: "Answered Tunde's Banter", body: "Currency redesign · friendly debate" },
  { t: "Now", kind: "live", title: "Banter Now is live", body: "Is AI helping or damaging African art?", href: "/banter/now/ai-art" },
  { t: "16:00", kind: "", title: "Kwame is waiting on you", body: "Keep the painting unfinished?", href: "/banter/unfinished" },
  { t: "20:00", kind: "", title: "Game night with the university group", body: "How Well Do We Remember?", href: "/play/session/uni-night" },
  { t: "21:00", kind: "", title: "Presence Room", body: "What does home remember?", href: "/rooms" },
  { t: "22:00", kind: "", title: "Close the day", body: "One private reflection, two minutes." },
];

/** Layout C: a day that ends, beside a bento board of your spaces. */
export default function TodayBento() {
  const [bright, setBright] = useState(3);
  const cliq = STARS.filter((s) => s.orbit === "cliq");
  const banter = BANTERS[2];
  const room = ROOMS[0];
  const game = GAMES.find((g) => g.id === "remember")!;

  return (
    <div className="lx-tb">
      <aside className="lx-today" aria-label="Today">
        <p className="lx-eye">Tuesday</p>
        <h2 className="lx-h" style={{ fontSize: 30, marginTop: 6 }}>Your day, Amara.</h2>
        <p className="lx-mute" style={{ fontSize: 13, margin: "6px 0 0" }}>A few good moments, then it ends. No endless scroll.</p>

        <div style={{ display: "flex", gap: 6, marginTop: 14 }} role="radiogroup" aria-label="How bright are you today?">
          {BRIGHTNESS.map((b) => (
            <button key={b.level} role="radio" aria-checked={bright === b.level} aria-label={b.label} onClick={() => setBright(b.level)} className="lx-btn" style={{ flex: 1, height: 38, padding: 0, justifyContent: "center", borderColor: bright === b.level ? "var(--nx-brass)" : undefined, background: bright === b.level ? "rgba(233,184,92,.12)" : undefined }}>
              <span style={{ width: 4 + b.level * 2.5, height: 4 + b.level * 2.5, borderRadius: "50%", background: "var(--nx-brass)", opacity: 0.35 + b.level * 0.13 }} />
            </button>
          ))}
        </div>

        <div className="lx-tl">
          {DAY.map((d) => {
            const body = (
              <>
                <span className={`lx-when${d.kind === "live" ? " live" : ""}`}>{d.t}</span>
                <span style={{ display: "block", fontSize: 14, fontWeight: 600, marginTop: 2, opacity: d.kind === "done" ? 0.55 : 1 }}>{d.title}</span>
                <span className="lx-faint" style={{ display: "block", fontSize: 12.5 }}>{d.body}</span>
              </>
            );
            return (
              <div key={d.t + d.title} className={`lx-tli ${d.kind}`}>
                {d.href ? <Link href={d.href} style={{ color: "inherit", textDecoration: "none" }}>{body}</Link> : body}
              </div>
            );
          })}
        </div>
        <div className="lx-end">— That&apos;s everything today —<br /><span className="lx-faint" style={{ fontSize: 12 }}>Go make something. We&apos;ll be here tomorrow.</span></div>
      </aside>

      <section className="lx-bento" aria-label="Your spaces">
        <Link href="/circles" className="lx-tile w2">
          <p className="lx-eye">KinCircle · week 4 of 8</p>
          <h3 className="lx-h" style={{ marginTop: 6 }}>West African Markets</h3>
          <div className="lx-bar"><i style={{ width: "50%" }} /></div>
          <p className="lx-faint" style={{ fontSize: 12, marginTop: 8 }}>Arrive · Understand · <b style={{ color: "var(--nx-brass)" }}>Make</b> · Reflect · Continue</p>
          <div style={{ display: "flex", marginTop: "auto" }}>{(["wanjiru", "efua", "fatou", "nandi"] as const).map((id, i) => <span key={id} style={{ marginLeft: i ? -8 : 0 }}><Avatar person={PEOPLE[id]} size={30} ring /></span>)}</div>
        </Link>

        <Link href={`/rooms/${room.id}`} className="lx-tile photo h2">
          <Photo name={room.photo} sizes="360px" className="absolute inset-0 h-full" />
          <div className="lx-tile-in">
            <p className="lx-when">{room.when} · 6 seats</p>
            <h3 className="lx-h" style={{ fontSize: 20, marginTop: 4 }}>{room.title}</h3>
          </div>
        </Link>

        <Link href="/cliqs" className="lx-tile">
          <p className="lx-eye">Your Cliq</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: "auto" }}>{cliq.map((s) => <Avatar key={s.id} person={PEOPLE[s.id]} size={38} />)}</div>
          <p className="lx-faint" style={{ fontSize: 12, marginTop: 8 }}>2 in the studio · 1 open to chat</p>
        </Link>

        <Link href={`/banter/${banter.id}`} className="lx-tile w2 h2">
          <p className="lx-eye">Banter · resonating</p>
          <h3 className="lx-h" style={{ fontSize: 26, marginTop: 8 }}>{banter.prompt}</h3>
          <p className="lx-mute" style={{ fontSize: 13.5 }}>{banter.replies[0].text}</p>
          <div style={{ marginTop: "auto", padding: 12, borderRadius: 14, background: "rgba(233,184,92,.10)", border: "1px solid var(--nx-line)", fontSize: 13 }}>✦ 4 people want to explore this. <b style={{ color: "var(--nx-brass)" }}>Invite them into a KinCircle →</b></div>
        </Link>

        <Link href="/play/session/uni-night" className="lx-tile photo">
          <Photo name={game.photo} sizes="360px" className="absolute inset-0 h-full" />
          <div className="lx-tile-in">
            <p className="lx-when">20:00 · game night</p>
            <h3 className="lx-h" style={{ fontSize: 18, marginTop: 4 }}>How Well Do We Remember?</h3>
          </div>
        </Link>

        <Link href="/studio" className="lx-tile photo">
          <Photo name="studioEasel" sizes="360px" className="absolute inset-0 h-full" />
          <div className="lx-tile-in">
            <p className="lx-eye">My studio</p>
            <h3 className="lx-h" style={{ fontSize: 18, marginTop: 4 }}>3 visitors this week</h3>
          </div>
        </Link>

        <Link href="/store" className="lx-tile">
          <p className="lx-eye">My store</p>
          <p style={{ font: "500 34px var(--nx-serif)", margin: "auto 0 0", color: "var(--nx-brass)" }}>₦184k</p>
          <p className="lx-faint" style={{ fontSize: 12, margin: 0 }}>2 orders · from people who know your story</p>
        </Link>

        <Link href="/wellbeing" className="lx-tile">
          <p className="lx-eye" style={{ color: "var(--nx-sage)" }}>Care</p>
          <h3 className="lx-h" style={{ fontSize: 18, marginTop: 6 }}>Efua has gone quiet</h3>
          <p className="lx-faint" style={{ fontSize: 12.5 }}>3 weeks. Send a voice note?</p>
          <span className="lx-btn" style={{ marginTop: "auto", alignSelf: "flex-start" }}>◉ Voice note</span>
        </Link>
      </section>
    </div>
  );
}
