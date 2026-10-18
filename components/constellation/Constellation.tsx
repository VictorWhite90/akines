"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Avatar from "@/components/ui/Avatar";
import { BRIGHTNESS, ORBITS, STARS, TONIGHT, type Orbit, type Star } from "@/lib/data/constellation";
import { ME, PEOPLE, PRESENCE, type Person } from "@/lib/data/people";
import { useLocal } from "@/lib/useLocal";

type Filter = "all" | Orbit | "quiet";

const PRESENCE_COLOR: Record<string, string> = { studio: "var(--nx-brass)", room: "var(--nx-ember)", quiet: "rgba(243,239,230,.35)", open: "var(--nx-sage)" };
const SIZE: Record<Orbit, number> = { cliq: 54, kin: 44, new: 40 };
const KIND_GLYPH = { room: "◉", banter: "❝", game: "☺", now: "◎", circle: "✦" } as const;

const pos = (s: Star) => {
  const r = ORBITS.find((o) => o.id === s.orbit)!.radius;
  const a = (s.angle * Math.PI) / 180;
  return { x: 50 + r * Math.cos(a), y: 50 + r * Math.sin(a) };
};

const visible = (s: Star, f: Filter) => (f === "all" ? true : f === "quiet" ? !!s.quiet : s.orbit === f);

export default function Constellation() {
  const [filter, setFilter] = useState<Filter>("all");
  const [sel, setSel] = useState<Star | null>(null);
  const [bright, setBright] = useLocal<number>("ak:brightness", 3);
  const [intros, setIntros] = useLocal<Record<string, "yes" | "no">>("ak:intros", {});
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  const stars = STARS.filter((s) => intros[s.id] !== "no");
  const quiet = stars.filter((s) => s.quiet);
  const pending = stars.filter((s) => s.orbit === "new" && !intros[s.id]);
  const level = BRIGHTNESS.find((b) => b.level === bright)!;
  const pick = (s: Star) => setSel((cur) => (cur?.id === s.id ? null : s));

  const filters: { id: Filter; label: string; color: string; n: number }[] = [
    { id: "all", label: "Everyone", color: "var(--nx-text)", n: stars.length },
    { id: "cliq", label: "Your Cliq", color: "var(--nx-brass)", n: stars.filter((s) => s.orbit === "cliq").length },
    { id: "kin", label: "KinCircles", color: "var(--nx-sage)", n: stars.filter((s) => s.orbit === "kin").length },
    { id: "new", label: "New introductions", color: "var(--nx-moon)", n: stars.filter((s) => s.orbit === "new").length },
    { id: "quiet", label: "Going quiet", color: "var(--nx-ember)", n: quiet.length },
  ];

  return (
    <div className="cx">
      <div className="cx-stars" aria-hidden />
      <div className="cx-in">
        {/* Left: the sky */}
        <section aria-label="Your constellation">
          <div className="cx-hello">
            <p className="cx-eyebrow">Your constellation</p>
            <h1>Fewer people. <em>Brighter</em> connections.</h1>
            <p>Everyone here is in your sky for a reason. Brightness grows with moments you share, never with likes or followers. Tap someone to see why, and what you could do together.</p>
          </div>

          <div className="cx-filters" role="tablist" aria-label="Show">
            {filters.map((f) => (
              <button key={f.id} role="tab" aria-selected={filter === f.id} className={`cx-chip${filter === f.id ? " on" : ""}`} onClick={() => setFilter(f.id)}>
                <i style={{ background: f.color }} />{f.label}<span style={{ opacity: 0.6 }}>{f.n}</span>
              </button>
            ))}
          </div>

          <div className={`cx-sky${sel ? " paused" : ""}`}>
            {ORBITS.map((o) => (
              <div key={o.id} className={`cx-ring ${o.id}`} style={{ width: `${o.radius * 2}%`, height: `${o.radius * 2}%` }} aria-hidden />
            ))}

            <div className="cx-spin">
              <svg className="cx-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
                {stars.map((s) => {
                  const p = pos(s);
                  const on = visible(s, filter);
                  return (
                    <line key={s.id} x1="50" y1="50" x2={p.x} y2={p.y} stroke={s.orbit === "new" ? "#7fa8ff" : "#e9b85c"} strokeWidth={sel?.id === s.id ? 0.45 : 0.12 + s.strength * 0.08} strokeOpacity={on ? (s.quiet ? 0.18 : 0.2 + s.strength * 0.15) : 0.04} strokeDasharray={s.orbit === "new" || s.quiet ? "0.8 0.8" : undefined} vectorEffect="non-scaling-stroke" />
                  );
                })}
              </svg>
              {stars.map((s) => {
                const p = pos(s);
                const person = PEOPLE[s.id];
                const on = visible(s, filter);
                return (
                  <div key={s.id} className={`cx-star${on ? "" : " cx-dim"}`} style={{ left: `${p.x}%`, top: `${p.y}%` }}>
                    <div className="cx-upright">
                      <button
                        className={`cx-node s${s.strength}${s.orbit === "new" ? " new" : ""}${s.quiet ? " quiet" : ""}${sel?.id === s.id ? " sel" : ""}`}
                        onClick={() => pick(s)}
                        aria-pressed={sel?.id === s.id}
                        aria-label={`${person.name}, ${ORBITS.find((o) => o.id === s.orbit)!.label}${s.quiet ? `, quiet for ${s.quiet}` : ""}`}
                      >
                        <span className="cx-halo" />
                        <Avatar person={person} size={SIZE[s.orbit]} />
                        <span className="cx-presence" style={{ background: PRESENCE_COLOR[person.presence] }} />
                      </button>
                      <span className="cx-name">{person.name.split(" ")[0]}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="cx-me">
              <span className="cx-me-glow"><Avatar person={ME} size={78} /></span>
              <b>You</b>
            </div>
          </div>

          <p className="cx-sub" style={{ textAlign: "center" }}>
            <span style={{ color: "var(--nx-sage)" }}>●</span> open to chat · <span style={{ color: "var(--nx-brass)" }}>●</span> in the studio · <span style={{ color: "var(--nx-ember)" }}>●</span> in a room · <span style={{ opacity: 0.5 }}>●</span> quiet mode
          </p>
        </section>

        {/* Right: person or tonight */}
        <aside className="cx-side">
          <section className="cx-card">
            <p className="cx-eyebrow">Private check-in</p>
            <h2 style={{ marginTop: 6 }}>How bright are you tonight?</h2>
            <div className="cx-bright" role="radiogroup" aria-label="Your brightness tonight">
              {BRIGHTNESS.map((b) => (
                <button key={b.level} role="radio" aria-checked={bright === b.level} aria-label={b.label} className={bright === b.level ? "on" : undefined} onClick={() => setBright(b.level)}>
                  <span style={{ width: 4 + b.level * 3, height: 4 + b.level * 3, opacity: 0.35 + b.level * 0.13, boxShadow: `0 0 ${b.level * 5}px rgba(233,184,92,.8)` }} />
                </button>
              ))}
            </div>
            <p style={{ margin: "10px 0 0", fontSize: 13.5 }}><b style={{ color: "var(--nx-brass)" }}>{level.label}.</b> <span style={{ color: "var(--nx-mute)" }}>{level.hint}</span></p>
            <p className="cx-sub">Only you see this. It shapes suggestions, nothing else.</p>
          </section>

          {sel ? (
            <PersonPanel star={sel} decided={intros[sel.id]} onClose={() => setSel(null)} onIntro={(v) => { setIntros((cur) => ({ ...cur, [sel.id]: v })); setToast(v === "yes" ? `Introduction requested. If ${PEOPLE[sel.id].name.split(" ")[0]} says yes too, you'll be introduced.` : "Got it. Akines won't suggest this introduction again."); if (v === "no") setSel(null); }} onToast={setToast} />
          ) : (
            <section className="cx-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <h2>Tonight in your sky</h2>
                <span className="cx-sub" style={{ margin: 0 }}>Only your people</span>
              </div>
              <div style={{ display: "grid", gap: 4, marginTop: 10 }}>
                {TONIGHT.map((e) => (
                  <Link key={e.id} href={e.href} className="cx-event">
                    <span className="cx-kind" aria-hidden>{KIND_GLYPH[e.kind]}</span>
                    <span style={{ minWidth: 0, flex: 1 }}>
                      <span className={`cx-when${e.live ? " live" : ""}`}>{e.live ? "● " : ""}{e.when}</span>
                      <span style={{ display: "block", fontSize: 14, fontWeight: 600, lineHeight: 1.3, marginTop: 2 }}>{e.title}</span>
                    </span>
                    <span style={{ display: "flex" }}>{e.who.slice(0, 3).map((id, i) => <span key={id} style={{ marginLeft: i ? -8 : 0 }}><Avatar person={PEOPLE[id]} size={24} ring /></span>)}</span>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </aside>

        {/* Bottom strip: relationship care */}
        <div className="cx-strip">
          <section className="cx-card">
            <p className="cx-eyebrow" style={{ color: "var(--nx-ember)" }}>Going quiet</p>
            {quiet.length === 0 ? (
              <p className="cx-sub">Nobody's drifting. Lovely.</p>
            ) : (
              quiet.map((s) => (
                <div key={s.id} style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 10 }}>
                  <Avatar person={PEOPLE[s.id]} size={44} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: 14.5, fontWeight: 600 }}>{PEOPLE[s.id].name}</p>
                    <p className="cx-sub" style={{ margin: 0 }}>No moments together for {s.quiet}. No pressure, just a nudge.</p>
                  </div>
                </div>
              ))
            )}
            {quiet.length > 0 && (
              <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
                <button className="cx-btn brass" onClick={() => setToast(`Voice note sent to ${PEOPLE[quiet[0].id].name.split(" ")[0]}.`)}>◉ Send a voice note</button>
                <Link className="cx-btn" href="/play">☺ Invite to a game</Link>
              </div>
            )}
          </section>

          <section className="cx-card">
            <p className="cx-eyebrow" style={{ color: "var(--nx-moon)" }}>Waiting for your yes</p>
            {pending.length === 0 ? (
              <p className="cx-sub">No introductions waiting. New ones arrive when there's a real reason.</p>
            ) : (
              pending.map((s) => (
                <div key={s.id} style={{ marginTop: 10, display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <Avatar person={PEOPLE[s.id]} size={40} />
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>{PEOPLE[s.id].name} <span className="cx-sub" style={{ display: "inline" }}>· {PEOPLE[s.id].role}</span></p>
                    <p style={{ margin: "2px 0 8px", fontSize: 12.5, color: "var(--nx-mute)", lineHeight: 1.45 }}>{s.why}</p>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="cx-btn brass" style={{ height: 32 }} onClick={() => { setIntros((c) => ({ ...c, [s.id]: "yes" })); setToast(`Introduction requested. If ${PEOPLE[s.id].name.split(" ")[0]} says yes too, you'll be introduced.`); }}>Yes, introduce us</button>
                      <button className="cx-btn" style={{ height: 32 }} onClick={() => setIntros((c) => ({ ...c, [s.id]: "no" }))}>Not now</button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </section>

          <section className="cx-card">
            <p className="cx-eyebrow">This week, together</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 10 }}>
              {[["7", "shared moments"], ["3", "Banters answered"], ["1", "game night"], ["2", "rooms joined"]].map(([n, l]) => (
                <div key={l} style={{ padding: "10px 12px", borderRadius: 14, background: "rgba(243,239,230,.04)" }}>
                  <p style={{ margin: 0, font: "500 26px var(--nx-serif)", color: "var(--nx-brass)" }}>{n}</p>
                  <p className="cx-sub" style={{ margin: 0 }}>{l}</p>
                </div>
              ))}
            </div>
            <p className="cx-sub" style={{ marginTop: 10 }}>Measured in moments, never screen time.</p>
          </section>
        </div>
      </div>
      {toast && <div role="status" style={{ position: "fixed", bottom: 100, left: "50%", transform: "translateX(-50%)", zIndex: 60, padding: "12px 20px", borderRadius: 99, background: "var(--nx-brass)", color: "var(--nx-night)", fontSize: 13.5, fontWeight: 600, boxShadow: "0 12px 30px rgba(0,0,0,.4)" }}>{toast}</div>}
    </div>
  );
}

function PersonPanel({ star, decided, onClose, onIntro, onToast }: { star: Star; decided?: "yes" | "no"; onClose: () => void; onIntro: (v: "yes" | "no") => void; onToast: (t: string) => void }) {
  const p: Person = PEOPLE[star.id];
  const first = p.name.split(" ")[0];
  const orbit = ORBITS.find((o) => o.id === star.orbit)!;
  return (
    <section className="cx-card" aria-live="polite">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
          <Avatar person={p} size={64} />
          <div>
            <h3>{p.name}</h3>
            <p className="cx-sub" style={{ margin: "2px 0 0" }}>{p.role} · {p.city}</p>
          </div>
        </div>
        <button className="nx-icon" style={{ width: 36, height: 36, background: "transparent" }} onClick={onClose} aria-label="Close">×</button>
      </div>
      <p style={{ margin: "12px 0 0", fontSize: 13, color: "var(--nx-mute)" }}>
        <span style={{ color: PRESENCE_COLOR[p.presence] }}>●</span> {PRESENCE[p.presence].label}{p.note ? ` · ${p.note}` : ""}
      </p>
      <div className="cx-why">
        <small>{star.orbit === "new" ? "Why Akines suggests this" : "Why you're connected"}</small>
        {star.why}
      </div>
      <p style={{ margin: "12px 0 6px", fontSize: 12.5, color: "var(--nx-faint)" }}>{orbit.label} · last: {star.last}</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{star.shared.map((t) => <span key={t} className="cx-tag">{t}</span>)}</div>

      {star.orbit === "new" ? (
        decided === "yes" ? (
          <p className="cx-why" style={{ background: "rgba(127,168,255,.1)", borderColor: "rgba(127,168,255,.3)" }}>You said yes. Waiting for {first}. Contact details are only shared when you both agree.</p>
        ) : (
          <div className="cx-actions">
            <button className="cx-btn brass" onClick={() => onIntro("yes")}>Yes, introduce us</button>
            <button className="cx-btn" onClick={() => onIntro("no")}>Not now</button>
          </div>
        )
      ) : (
        <div className="cx-actions">
          <Link className="cx-btn brass" href="/banter#start">❝ Banter with {first}</Link>
          <button className="cx-btn" onClick={() => onToast(`Voice note sent to ${first}.`)}>◉ Voice note</button>
          <Link className="cx-btn" href="/play">☺ Play a game</Link>
          <Link className="cx-btn" href="/rooms/new">◉ Invite to a room</Link>
        </div>
      )}
    </section>
  );
}
