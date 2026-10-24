"use client";

import Link from "next/link";
import { useState } from "react";
import Avatar from "@/components/ui/Avatar";
import Photo from "@/components/ui/Photo";
import { BANTERS } from "@/lib/data/banter";
import { CALLS, COLLABS, ROOMS, STAGES } from "@/lib/data/community";
import { MATCHES } from "@/lib/data/matches";
import { ME, PEOPLE, type PersonId } from "@/lib/data/people";
import { STORIES } from "@/lib/data/stories";
import { useLocal } from "@/lib/useLocal";
import Icon from "@/components/ui/Icon";

const QUESTION = BANTERS[0];
const NOTICES = ROOMS.slice(0, 4);
const LETTERS = MATCHES.slice(0, 3);
const TILTS = [-2.2, 1.4, -0.8, 2];

const WIRE: { t: string; who: PersonId; text: string; live?: boolean }[] = [
  { t: "Now", who: "ayo", text: "is in the dye yard: panel 7, third bath.", live: true },
  { t: "Now", who: "wanjiru", text: "is hosting “Photography and memory”. Five seats taken.", live: true },
  { t: "13:40", who: "tunde", text: "fired the kiln early. Six figures, one cracked." },
  { t: "11:15", who: "fatou", text: "opened in Paris. Leila left her a voice note." },
  { t: "09:02", who: "thandi", text: "kept one bowl back from the firing, as always." },
];

function weekNo(d: Date) {
  const start = new Date(d.getFullYear(), 0, 1);
  return Math.ceil(((d.getTime() - start.getTime()) / 86400000 + start.getDay() + 1) / 7);
}

export default function Weekly() {
  const now = new Date();
  const date = now.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const next = new Date(now.getTime() + 7 * 86400000).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });

  const [asked, setAsked] = useLocal<boolean>("ak:weekly-asked", false);
  const [explore, setExplore] = useLocal<boolean>("ak:weekly-explore", false);
  const [seats, setSeats] = useLocal<Record<string, boolean>>("ak:weekly-seats", {});
  const [tearing, setTearing] = useState<string | null>(null);
  const [sealed, setSealed] = useLocal<string[]>("ak:weekly-sealed", []);
  const [folded, setFolded] = useLocal<string[]>("ak:weekly-folded", []);
  const [clipped, setClipped] = useLocal<string[]>("ak:weekly-clipped", []);

  const tear = (id: string) => {
    setTearing(id);
    setTimeout(() => {
      setSeats((s) => ({ ...s, [id]: true }));
      setTearing(null);
    }, 850);
  };

  return (
    <div className="at ed">
      <span className="at-wash" style={{ width: 700, height: 700, left: -260, top: 200, background: "rgba(38,48,107,.12)" }} aria-hidden />
      <span className="at-wash" style={{ width: 600, height: 600, right: -220, top: 900, background: "rgba(194,96,63,.10)", animationDelay: "-11s" }} aria-hidden />

      <article className="ed-sheet">
        {/* Masthead */}
        <div className="ed-top">
          <span className="at-mono">Vol. 1 · No. {weekNo(now)}</span>
          <span className="at-mono">Lagos · Accra · Nairobi · Dakar · Casablanca</span>
          <span className="at-mono">{date}</span>
        </div>
        <hr className="ed-rule double" />
        <h1 className="ed-title">The Akines <em>Weekly</em></h1>
        <p className="ed-motto">Edited by your circles, never by an algorithm. It ends at the bottom of the page.</p>
        <hr className="ed-rule" />
        <nav className="ed-index" aria-label="In this edition">
          {[["#front", "Front page"], ["#notices", "Notices"], ["#making", "In the making"], ["#letters", "Letters"], ["#classifieds", "Classifieds"], ["#readings", "Readings"]].map(([h, l]) => <a key={h} href={h}>{l}</a>)}
        </nav>
        <hr className="ed-rule double" />

        {/* Front page */}
        <div id="front" className="ed-grid">
          <section className="ed-col" style={{ gridColumn: "span 8" }}>
            <p className="ed-kicker">KinCircle · forming this week · 2 seats left</p>
            <h2 className="ed-h1">Six strangers set out to save a disappearing market.</h2>
            <p className="ed-deck">A photographer in Nairobi, an archivist in Kumasi and a tailor in Dakar have eight weeks to record what the traders of West Africa want remembered.</p>
            <figure className="ed-photo" style={{ margin: "18px 0 0" }}>
              <div className="ed-duo"><Photo name="talkGroup" sizes="(max-width: 1080px) 100vw, 800px" className="h-[340px]" position="center 40%" /></div>
              <figcaption>Fig. 1 · The circle&apos;s first meeting, week one. Photograph by Wanjiru Kamau, shared with permission.</figcaption>
            </figure>
            <div className="ed-body">
              <p>It began as a Banter. Wanjiru asked one question to two circles she trusts: would anyone help document the markets that are quietly closing? Fourteen people said they wanted to explore it. Akines noticed that five of them brought skills the others lacked.</p>
              <p>Efua brings oral-history notes from Kejetia. Fatou knows the tailors of Sandaga by name. Nandi offered to host a room on consent before a single photograph is taken. What&apos;s missing, the circle says, is a collector who knows Lagos.</p>
              <p>The group meets on Thursdays. Credit and ownership were agreed before anyone picked up a camera, and every trader decides whether their story leaves the market.</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", marginTop: 14 }}>
              <span style={{ display: "flex" }}>{(["wanjiru", "efua", "fatou", "nandi"] as PersonId[]).map((id, i) => <span key={id} style={{ marginLeft: i ? -10 : 0 }}><Avatar person={PEOPLE[id]} size={36} ring /></span>)}</span>
              <button className={`at-btn${asked ? "" : " ink"}`} onClick={() => setAsked(!asked)}>{asked ? "✓ You asked to join · waiting on the circle" : "Ask to join this circle"}</button>
              <span className="at-mono">Why you: you collect work about memory, in Lagos</span>
            </div>
          </section>

          <aside className="ed-col" style={{ gridColumn: "span 4" }}>
            <div className="ed-q">
              <p className="at-mono" style={{ color: "rgba(243,236,223,.7)", margin: 0 }}>The question of the week · Makers&apos; Cliq</p>
              <p className="big">{QUESTION.prompt}</p>
              {QUESTION.replies.slice(0, 2).map((r) => (
                <p key={r.id} className="ed-q-reply"><b>{PEOPLE[r.by].name.split(" ")[0]}:</b> {r.kind === "voice" ? `voice note, ${r.length}` : r.text}</p>
              ))}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <Link href={`/banter/${QUESTION.id}`} className="ed-q-btn">Add a response</Link>
                <button className={`ed-q-btn${explore ? " on" : ""}`} onClick={() => setExplore(!explore)}><Icon name="spark" size={15} className="ic-inline" /> {explore ? "You want to explore this" : "I want to explore this"}</button>
              </div>
            </div>

            <div className="ed-wire">
              <p className="ed-kicker" style={{ color: "var(--at-ink)" }}>From the wire · today</p>
              <ul style={{ listStyle: "none", margin: "8px 0 0", padding: 0 }}>
                {WIRE.map((w) => (
                  <li key={w.who + w.t}>
                    <time>{w.live ? <><span className="ed-live" />now</> : w.t}</time>
                    <span><b>{PEOPLE[w.who].name}</b> {w.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>

        {/* Notices */}
        <section id="notices" className="ed-section">
          <hr className="ed-rule double" />
          <div className="ed-section-head">
            <h2>Notices <em>· take a seat</em></h2>
            <span className="at-mono">Six seats a room. Tear a strip to keep one.</span>
          </div>
          <div className="ed-notices">
            {NOTICES.map((r, i) => {
              const host = PEOPLE[r.host];
              const open = Math.max(6 - r.seated.length, 0);
              const mine = seats[r.id];
              return (
                <div key={r.id} className="ed-notice" style={{ transform: `rotate(${TILTS[i]}deg)` }}>
                  <span className="ed-pin" aria-hidden />
                  <p className="at-mono" style={{ margin: 0, color: r.status === "live" ? "var(--at-terra)" : undefined }}>{r.status === "live" ? "● " : ""}{r.when}</p>
                  <h3 className="ed-h3">{r.title}</h3>
                  <p style={{ margin: "8px 0 0", fontSize: 13, lineHeight: 1.5, color: "var(--at-ink-2)" }}>{r.blurb}</p>
                  <p className="at-mono" style={{ margin: "10px 0 0" }}>Host · {host.name}</p>
                  {mine ? (
                    <p className="ed-taken">Your seat is kept. See you there.</p>
                  ) : open === 0 ? (
                    <p className="ed-taken" style={{ background: "transparent", color: "var(--at-mute)" }}>Full. Ask the host about next time.</p>
                  ) : (
                    <div className="ed-tabs">
                      {Array.from({ length: open }, (_, s) => (
                        <button key={s} className={`ed-tab${tearing === r.id && s === 0 ? " tearing" : ""}`} onClick={() => tear(r.id)} aria-label={`Take a seat at ${r.title}`}>
                          Take a seat
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* In the making */}
        <section id="making" className="ed-section">
          <hr className="ed-rule double" />
          <div className="ed-section-head">
            <h2>In the <em>making</em></h2>
            <span className="at-mono">Collaborations from your circles · contact sheet</span>
          </div>
          <div className="ed-making">
            {COLLABS.map((c, i) => (
              <Link key={c.id} href={`/collaborate/${c.id}`} className="ed-frame" style={{ color: "inherit", textDecoration: "none" }}>
                <span className="num">{String(i + 1).padStart(2, "0")}A ▸</span>
                <div className="ed-duo" style={{ marginTop: 6 }}><Photo name={c.photo} sizes="300px" className="h-[150px]" /></div>
                <span className="ed-stamp" aria-hidden>{c.route}<br />{c.medium}</span>
                <h3 className="ed-h3" style={{ marginTop: 12 }}>{c.title}</h3>
                <p style={{ margin: "6px 0 0", fontSize: 13, lineHeight: 1.5, color: "var(--at-ink-2)" }}>{c.blurb}</p>
                <div className="ed-stages">
                  {STAGES.map((s, j) => <span key={s} className={j < c.stage ? "done" : j === c.stage ? "now" : undefined}><i />{s}</span>)}
                </div>
                <p className="at-mono" style={{ margin: "12px 0 0", display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ display: "flex" }}>{c.makers.map((id, k) => <span key={id} style={{ marginLeft: k ? -8 : 0 }}><Avatar person={PEOPLE[id]} size={22} ring /></span>)}</span>
                  {c.next}
                </p>
              </Link>
            ))}
          </div>
        </section>

        {/* Letters */}
        <section id="letters" className="ed-section">
          <hr className="ed-rule double" />
          <div className="ed-section-head">
            <h2>Letters <em>· introductions</em></h2>
            <span className="at-mono">Nobody is introduced without two yeses</span>
          </div>
          <div className="ed-letters">
            {LETTERS.map((m) => {
              const p = PEOPLE[m.id as PersonId];
              const isSealed = sealed.includes(m.id);
              const isFolded = folded.includes(m.id);
              if (isFolded) {
                return (
                  <div key={m.id} className="ed-letter" style={{ display: "grid", placeItems: "center", minHeight: 200, opacity: 0.6 }}>
                    <p className="at-hand" style={{ fontSize: 17, textAlign: "center" }}>Folded away. {p.name.split(" ")[0]} won&apos;t be told.</p>
                    <button className="at-btn ghost" onClick={() => setFolded(folded.filter((x) => x !== m.id))}>Unfold</button>
                  </div>
                );
              }
              return (
                <div key={m.id} className="ed-letter">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                    <p className="dear">Dear {ME.name.split(" ")[0]},</p>
                    <Avatar person={p} size={46} />
                  </div>
                  <p className="text">May we introduce <b>{p.name}</b>, {p.role.toLowerCase()} in {p.city}? {m.reason}</p>
                  <div style={{ marginTop: 10 }}>{m.signals.map((s) => <span key={s} className="ed-postage">{s}</span>)}</div>
                  <p className="at-hand" style={{ fontSize: 15, margin: "12px 0 0" }}>If you meet: {m.ask}</p>
                  {!isSealed && (
                    <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                      <button className="at-btn ink" style={{ height: 40 }} onClick={() => setSealed([...sealed, m.id])}>Seal it, say hello</button>
                      <button className="at-btn ghost" style={{ height: 40 }} onClick={() => setFolded([...folded, m.id])}>Not now</button>
                    </div>
                  )}
                  {isSealed && (
                    <>
                      <p className="at-mono" style={{ margin: "18px 0 0" }}>Sent · waiting for {p.name.split(" ")[0]}&apos;s yes</p>
                      <span className="ed-seal" aria-hidden>Kin<br />sealed</span>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Classifieds */}
        <section id="classifieds" className="ed-section">
          <hr className="ed-rule double" />
          <div className="ed-section-head">
            <h2>Classifieds <em>· open calls</em></h2>
            <span className="at-mono">Popularity hidden in first review · fees and rights stated up front</span>
          </div>
          <div className="ed-classifieds">
            {CALLS.map((c) => (
              <div key={c.id} className="ed-ad">
                <span className="ed-days">{c.days} days left</span>
                <h3>{c.title}</h3>
                <p className="at-mono" style={{ margin: "4px 0 0" }}>{c.org} · {c.city}</p>
                <p>{c.blurb}</p>
                <p className="at-mono" style={{ margin: "8px 0 0" }}>{c.tags.join(" · ")}</p>
                <button className={`ed-clip${clipped.includes(c.id) ? " on" : ""}`} onClick={() => setClipped(clipped.includes(c.id) ? clipped.filter((x) => x !== c.id) : [...clipped, c.id])}>
                  <Icon name="clip" size={15} className="ic-inline" /> {clipped.includes(c.id) ? "Clipped to your studio" : "Clip it"}
                </button>
              </div>
            ))}
            <div className="ed-ad">
              <span className="ed-days" style={{ background: "var(--at-terra)" }}>Wanted</span>
              <h3>A collector who knows Lagos</h3>
              <p>For the West African Markets circle. Thursdays, eight weeks. Bring an eye, not a chequebook.</p>
              <button className={`ed-clip${asked ? " on" : ""}`} onClick={() => setAsked(!asked)}>{asked ? "✓ You answered" : "Answer the ad"}</button>
            </div>
            <div className="ed-ad">
              <span className="ed-days">Ongoing</span>
              <h3>Six seats, every Sunday</h3>
              <p>“The business of collecting”, hosted by Zuri. First purchase, first fear. Honest numbers only.</p>
              <Link href="/rooms/collecting" className="ed-clip" style={{ textDecoration: "none" }}>See the room</Link>
            </div>
          </div>
        </section>

        {/* Readings */}
        <section id="readings" className="ed-section">
          <hr className="ed-rule double" />
          <div className="ed-section-head">
            <h2>Readings <em>· from the journals</em></h2>
            <span className="at-mono">Shared by their writers, for this circle</span>
          </div>
          <div className="ed-readings">
            {STORIES.filter((s) => s.id !== "five-voices").slice(0, 3).map((s) => (
              <Link key={s.id} href={`/stories/${s.id}`} className="ed-reading">
                <div className="ed-duo"><Photo name={s.photo} sizes="400px" className="h-[200px]" /></div>
                <p className="ed-kicker" style={{ marginTop: 12 }}>{s.kind}{s.voice ? ` · Voice note · ${s.voice}` : ""}</p>
                <h3 className="ed-h3" style={{ fontSize: 24 }}>{s.title}</h3>
                <p style={{ margin: "6px 0 0", font: "italic 16px/1.5 var(--at-serif)", color: "var(--at-ink-2)" }}>{s.excerpt}</p>
                <p className="at-mono" style={{ margin: "10px 0 0" }}>By {PEOPLE[s.by].name} · {s.read} · {s.reflections} reflections</p>
              </Link>
            ))}
          </div>
        </section>

        {/* End */}
        <footer className="ed-end">
          <hr className="ed-rule double" />
          <p className="fin">— Fin —</p>
          <p>That&apos;s the whole edition. There is nothing more to scroll. The next one is printed {next}. Until then, go make something.</p>
          <div className="ed-colophon">
            <span className="at-mono">Compiled from 3 circles, 2 Cliqs and 11 people you chose</span>
            <span className="at-mono">No ads · No rankings · No follower counts</span>
          </div>
        </footer>
      </article>
    </div>
  );
}
