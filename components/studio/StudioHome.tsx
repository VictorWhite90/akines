"use client";

import Link from "next/link";
import { useState } from "react";
import Pic from "@/components/home/Pic";
import Avatar, { AvatarStack } from "@/components/ui/Avatar";
import LiveView from "./LiveView";
import { DoorGlyph, Field, Ico, Modal, NoteCard, PhotoPicker, VisitingChip, WorkCard, WorkDetail } from "./parts";
import type { StudioState } from "./useMyStudio";
import { newId, useLocal } from "@/lib/useLocal";
import { PEOPLE } from "@/lib/data/people";
import {
  COVER_CHOICES, DAYS, DISCIPLINES, MAKE_CHOICES, MAX_SEATS, THEMES, VISITING, VISIT_MODES, addDays, fmtDate, hoursText, themeVars, todayIso,
  type Note, type Studio, type Visit, type VisitMode, type VisitingStyle, type Work,
} from "@/lib/data/studio";
import { cn } from "@/lib/cn";

type Tab = "wall" | "progress" | "visits" | "about";
const TABS: { id: Tab; label: string }[] = [
  { id: "wall", label: "My space" },
  { id: "progress", label: "Work in public" },
  { id: "visits", label: "Open doors" },
  { id: "about", label: "About" },
];
const MODE_GLYPH: Record<VisitMode, string> = { Live: "◉", Virtual: "◎", "360°": "◐" };
const toggle = (list: string[], v: string) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

export default function StudioHome({ state, demo }: { state: StudioState; demo?: string }) {
  const studio = state.studio as Studio;
  const { update } = state;
  const [tab, setTab] = useState<Tab>("wall");
  const [modal, setModal] = useState<null | "work" | "note" | "visit">(null);
  const [detail, setDetail] = useState<Work | null>(null);
  const [live, setLive] = useState(demo === "live");
  const [products, , browser] = useLocal<{ status: string }[]>("ac:products", []);
  const today = browser ? todayIso() : ""; // only after hydration, so server and browser agree

  const place = [studio.city, studio.country].filter(Boolean).join(", ");
  const visits = [...studio.visits].sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  const previewHref = demo ? `/studios/me?demo=${demo === "live" ? "1" : demo}` : "/studios/me";

  return (
    <div className="sd sd-home" style={themeVars(studio.theme)}>
      {/* ---------- hero ---------- */}
      <section className="sd-hero" aria-label="Your studio">
        <div className="cover">
          <Pic name={studio.cover} sizes="(max-width: 760px) 100vw, 1100px" priority position="center 40%" />
          <div className="fade" />
          <span className="sd-tag"><span aria-hidden>✦</span> My studio</span>
          <VisitingChip style={studio.visiting} className="on-cover" />
        </div>
        <div className="band">
          <div className="who">
            <Avatar person={PEOPLE[studio.owner]} size={54} className="sd-av" />
            <div className="txt">
              <h1 className="font-display">{studio.name}</h1>
              <p className="tagline">{studio.tagline || "Add a tagline in About."}</p>
              <div className="meta">
                {place && <span className="place">{place}</span>}
                {studio.disciplines.map((d) => <span key={d} className="chip">{d}</span>)}
              </div>
            </div>
          </div>
          <button className={cn("sd-door", studio.doorOpen ? "open" : "shut")} role="switch" aria-checked={studio.doorOpen} onClick={() => update({ doorOpen: !studio.doorOpen })}>
            <span className="glyph"><DoorGlyph open={studio.doorOpen} size={26} /></span>
            <span className="lbl">
              <b><i className="dot" />{studio.doorOpen ? "Door open" : "Door closed"}</b>
              <small>{studio.doorOpen ? (studio.visiting === "private" ? "Invited guests may come in" : studio.hours.days.length ? `Welcome ${hoursText(studio.hours)}` : "Guests are welcome") : "Resting. Nobody can drop in."}</small>
            </span>
            <span className="track" aria-hidden><i /></span>
          </button>
        </div>
        <div className="acts">
          <button className="sd-btn accent" onClick={() => setLive(true)}><Ico n="live" size={16} /> Go live now</button>
          <button className="sd-btn ghost" onClick={() => { setTab("visits"); setModal("visit"); }}><Ico n="cal" size={16} /> Host an open door</button>
          <Link className="sd-btn ghost" href={previewHref}><Ico n="eye" size={16} /> Preview as visitor</Link>
        </div>
      </section>

      <div className="sd-cols">
        <div className="sd-main">
          <div className="sd-tabs" role="tablist" aria-label="Studio sections">
            {TABS.map((t) => (
              <button key={t.id} role="tab" id={`sd-tab-${t.id}`} aria-selected={tab === t.id} aria-controls={`sd-pane-${t.id}`} className={tab === t.id ? "on" : ""} onClick={() => setTab(t.id)}>
                {t.label}
                {t.id === "wall" && <em>{studio.works.length}</em>}
                {t.id === "progress" && <em>{studio.notes.length}</em>}
                {t.id === "visits" && <em>{studio.visits.length}</em>}
              </button>
            ))}
          </div>

          <div role="tabpanel" id={`sd-pane-${tab}`} aria-labelledby={`sd-tab-${tab}`} className="sd-pane">
            {tab === "wall" && (
              <>
                <div className="sd-head">
                  <div><h2>My space</h2><p>What you do and what you've made. Open anything to read the story behind it.</p></div>
                  <button className="sd-btn dark" onClick={() => setModal("work")}>＋ Add to my space</button>
                </div>
                <div className="sd-works">
                  <button className="sd-add" onClick={() => setModal("work")}><span>＋</span>Add to my space<small>A title, a photo and the story</small></button>
                  {studio.works.map((w) => <WorkCard key={w.id} work={w} onOpen={() => setDetail(w)} />)}
                </div>
                {studio.works.length === 0 && <p className="sd-empty">Your space is empty for now. The first thing you share is always the hardest.</p>}
              </>
            )}

            {tab === "progress" && (
              <>
                <div className="sd-head">
                  <div><h2>Work in public</h2><p>Share the journey as it happens: progress, doubts and small wins. Your people follow along.</p></div>
                  <button className="sd-btn dark" onClick={() => setModal("note")}>＋ Share an update</button>
                </div>
                {studio.notes.length === 0 ? (
                  <p className="sd-empty">Nothing shared yet. One honest update about what you're working on is plenty.</p>
                ) : (
                  <div className="sd-board">
                    {[...studio.notes].sort((a, b) => b.date.localeCompare(a.date)).map((n) => <NoteCard key={n.id} note={n} onRemove={() => update((s) => ({ ...s, notes: s.notes.filter((x) => x.id !== n.id) }))} />)}
                  </div>
                )}
              </>
            )}

            {tab === "visits" && (
              <>
                <div className="sd-head">
                  <div><h2>Visits</h2><p>Six seats at most, so it stays a real conversation: a live session, a class, a tour.</p></div>
                  <button className="sd-btn dark" onClick={() => setModal("visit")}><Ico n="cal" size={15} /> Host an open door</button>
                </div>
                {visits.length === 0 ? (
                  <p className="sd-empty">No open doors planned. Host a live session, a class or a tour and invite people in.</p>
                ) : (
                  <ul className="sd-visits">
                    {visits.map((v) => {
                      const d = new Date(`${v.date}T12:00:00Z`);
                      const past = today !== "" && v.date < today;
                      return (
                        <li key={v.id} className={past ? "past" : ""}>
                          <div className="date"><b>{d.toLocaleDateString("en-GB", { day: "numeric", timeZone: "UTC" })}</b><small>{d.toLocaleDateString("en-GB", { month: "short", timeZone: "UTC" })}</small></div>
                          <div className="info">
                            <h3>{v.title}</h3>
                            <p>{fmtDate(v.date)} · {v.time} <span className={`mode ${v.mode === "360°" ? "m360" : v.mode.toLowerCase()}`}><i aria-hidden>{MODE_GLYPH[v.mode]}</i>{v.mode}</span>{past && <span className="mode past">Past</span>}</p>
                          </div>
                          <div className="rsvp">
                            {v.rsvps.length > 0 ? <AvatarStack people={v.rsvps.map((id) => PEOPLE[id])} size={26} max={4} /> : null}
                            <span><b>{v.rsvps.length}</b> of {v.seats} seats taken</span>
                          </div>
                          <button className="sd-x" aria-label={`Cancel ${v.title}`} onClick={() => update((s) => ({ ...s, visits: s.visits.filter((x) => x.id !== v.id) }))}><Ico n="x" size={14} /></button>
                        </li>
                      );
                    })}
                  </ul>
                )}
                <h3 className="sd-sub">Recent visitors</h3>
                {studio.visitors.length === 0 ? (
                  <p className="sd-empty small">Nobody has dropped in yet. Open the door and post your hours.</p>
                ) : (
                  <ul className="sd-people">
                    {studio.visitors.map((v) => (
                      <li key={v.who}>
                        <Avatar person={PEOPLE[v.who]} size={36} />
                        <div><b>{PEOPLE[v.who].name}</b><small>{PEOPLE[v.who].role} · {v.when}</small></div>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}

            {tab === "about" && <AboutTab studio={studio} update={update} />}
          </div>
        </div>

        <aside className="sd-side" aria-label="At a glance">
          <section className="sd-card">
            <p className="ac-eyebrow">At a glance</p>
            <dl className="sd-stats">
              <div><dt>In my space</dt><dd>{studio.works.length}</dd></div>
              <div><dt>Visitors this month</dt><dd>{studio.visitsThisMonth}</dd></div>
              <div><dt>Open doors planned</dt><dd>{studio.visits.length}</dd></div>
            </dl>
            <p className="sd-fine">No follower or like counts, on purpose. Here you only count what you shared and who came in.</p>
          </section>

          {studio.now && (
            <section className="sd-card now">
              <p className="ac-eyebrow">Working on right now</p>
              <p className="q">&ldquo;{studio.now}&rdquo;</p>
            </section>
          )}

          <section className="sd-card sell">
            <span className="ic"><Ico n="store" size={20} /></span>
            <div>
              <h3>Sell from your space</h3>
              <p>{products.length > 0 ? `${products.length} ${products.length === 1 ? "piece" : "pieces"} in your store. Visitors can buy while they look around.` : "Nothing in your store yet. List a product or service and people can buy it."}</p>
              <Link href="/store" className="sd-link">{products.length > 0 ? "Open my store" : "Set up my store"} <Ico n="arrow" size={14} /></Link>
            </div>
          </section>

          <section className="sd-card sell">
            <span className="ic"><Ico n="pen" size={20} /></span>
            <div>
              <h3>Write in your journal</h3>
              <p>Updates here are for your people. The journal is where you can be less polished.</p>
              <Link href="/journal" className="sd-link">Open my journal <Ico n="arrow" size={14} /></Link>
            </div>
          </section>
        </aside>
      </div>

      {modal === "work" && <WorkForm onClose={() => setModal(null)} onSave={(w) => { update((s) => ({ ...s, works: [w, ...s.works] })); setModal(null); setTab("wall"); }} />}
      {modal === "note" && <NoteForm onClose={() => setModal(null)} onSave={(n) => { update((s) => ({ ...s, notes: [n, ...s.notes] })); setModal(null); }} />}
      {modal === "visit" && <VisitForm onClose={() => setModal(null)} onSave={(v) => { update((s) => ({ ...s, visits: [...s.visits, v] })); setModal(null); }} />}
      {detail && <WorkDetail work={detail} onClose={() => setDetail(null)} onRemove={() => { update((s) => ({ ...s, works: s.works.filter((w) => w.id !== detail.id) })); setDetail(null); }} />}
      {live && <LiveView studio={studio} onEnd={() => setLive(false)} />}
    </div>
  );
}

/* ---------- forms ---------- */
function WorkForm({ onClose, onSave }: { onClose: () => void; onSave: (w: Work) => void }) {
  const [f, setF] = useState<Work>(() => ({ id: newId("w"), title: "", medium: "", size: "", year: String(new Date().getFullYear()), photo: MAKE_CHOICES[0], story: "" }));
  const set = (p: Partial<Work>) => setF((x) => ({ ...x, ...p }));
  return (
    <Modal onClose={onClose} eyebrow="My space" title="Add something to your space" wide>
      <form className="sd-formgrid" onSubmit={(e) => { e.preventDefault(); if (f.title.trim()) onSave({ ...f, title: f.title.trim() }); }}>
        <Field label="Title"><input value={f.title} onChange={(e) => set({ title: e.target.value })} placeholder="What do you call it?" autoFocus maxLength={60} /></Field>
        <div className="sd-three">
          <Field label="Medium"><input value={f.medium} onChange={(e) => set({ medium: e.target.value })} placeholder="Oil on linen" /></Field>
          <Field label="Size"><input value={f.size} onChange={(e) => set({ size: e.target.value })} placeholder="90 × 70 cm" /></Field>
          <Field label="Year"><input value={f.year} onChange={(e) => set({ year: e.target.value })} inputMode="numeric" maxLength={4} /></Field>
        </div>
        <div className="sd-field">
          <span className="lb">Photo <small>From the catalogue for now</small></span>
          <PhotoPicker keys={MAKE_CHOICES} value={f.photo} onChange={(k) => k && set({ photo: k })} label="Photo" size="sm" />
        </div>
        <Field label="The story behind it" hint="Optional, but it's what people remember">
          <textarea rows={3} value={f.story} onChange={(e) => set({ story: e.target.value })} placeholder="Where did it start? What nearly went wrong?" />
        </Field>
        <button className="sd-btn dark full" type="submit" disabled={!f.title.trim()}>Add to my space</button>
      </form>
    </Modal>
  );
}

function NoteForm({ onClose, onSave }: { onClose: () => void; onSave: (n: Note) => void }) {
  const [f, setF] = useState<Note>(() => ({ id: newId("n"), kind: "note", date: todayIso(), text: "" }));
  return (
    <Modal onClose={onClose} eyebrow="Work in public" title="Share an update" wide>
      <form className="sd-formgrid" onSubmit={(e) => { e.preventDefault(); if (f.text.trim()) onSave({ ...f, text: f.text.trim() }); }}>
        <div className="sd-seg" role="radiogroup" aria-label="Kind">
          {(["note", "sketch"] as const).map((k) => <button type="button" key={k} role="radio" aria-checked={f.kind === k} className={f.kind === k ? "on" : ""} onClick={() => setF({ ...f, kind: k })}>{k === "note" ? "A note" : "A sketch"}</button>)}
        </div>
        <Field label="What's on your mind?"><textarea rows={3} value={f.text} onChange={(e) => setF({ ...f, text: e.target.value })} placeholder="A win, a doubt, a step forward, something you learned today." autoFocus /></Field>
        <div className="sd-field">
          <span className="lb">A photo <small>Optional. Tap again to remove.</small></span>
          <PhotoPicker keys={MAKE_CHOICES} value={f.photo} onChange={(k) => setF({ ...f, photo: k })} label="Note photo" size="sm" />
        </div>
        <button className="sd-btn dark full" type="submit" disabled={!f.text.trim()}>Pin it</button>
      </form>
    </Modal>
  );
}

function VisitForm({ onClose, onSave }: { onClose: () => void; onSave: (v: Visit) => void }) {
  const [f, setF] = useState<Visit>(() => ({ id: newId("v"), title: "", date: addDays(todayIso(), 7), time: "17:00", mode: "Live", seats: MAX_SEATS, rsvps: [] }));
  return (
    <Modal onClose={onClose} eyebrow="Visits" title="Host an open door">
      <form className="sd-formgrid" onSubmit={(e) => { e.preventDefault(); onSave({ ...f, title: f.title.trim() || "Open door hour" }); }}>
        <Field label="Title"><input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="Open door hour" maxLength={60} autoFocus /></Field>
        <div className="sd-two tight">
          <Field label="Date"><input type="date" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} required /></Field>
          <Field label="Time"><input type="time" value={f.time} onChange={(e) => setF({ ...f, time: e.target.value })} required /></Field>
        </div>
        <div className="sd-field">
          <span className="lb">How will people visit?</span>
          <div className="sd-seg" role="radiogroup" aria-label="Mode">
            {VISIT_MODES.map((m) => <button type="button" key={m} role="radio" aria-checked={f.mode === m} className={f.mode === m ? "on" : ""} onClick={() => setF({ ...f, mode: m })}><i aria-hidden>{MODE_GLYPH[m]}</i> {m}</button>)}
          </div>
        </div>
        <div className="sd-field">
          <span className="lb">Seats <small>Up to {MAX_SEATS}, so everyone can speak</small></span>
          <div className="sd-seg seats" role="radiogroup" aria-label="Seats">
            {Array.from({ length: MAX_SEATS }, (_, i) => i + 1).map((n) => <button type="button" key={n} role="radio" aria-checked={f.seats === n} className={f.seats === n ? "on" : ""} onClick={() => setF({ ...f, seats: n })}>{n}</button>)}
          </div>
        </div>
        <button className="sd-btn dark full" type="submit" disabled={!f.date}>Add to my calendar</button>
      </form>
    </Modal>
  );
}

/* ---------- about tab: edit in place ---------- */
function AboutTab({ studio, update }: { studio: Studio; update: StudioState["update"] }) {
  return (
    <div className="sd-about">
      <div className="sd-head">
        <div><h2>About your space</h2><p>Changes save as you type.</p></div>
      </div>
      <div className="sd-edit">
        <Field label="Studio name"><input value={studio.name} onChange={(e) => update({ name: e.target.value })} maxLength={48} /></Field>
        <Field label="Tagline"><input value={studio.tagline} onChange={(e) => update({ tagline: e.target.value })} maxLength={90} /></Field>
        <div className="sd-two">
          <Field label="City"><input value={studio.city} onChange={(e) => update({ city: e.target.value })} /></Field>
          <Field label="Country"><input value={studio.country} onChange={(e) => update({ country: e.target.value })} /></Field>
        </div>
        <div className="sd-field">
          <span className="lb">Disciplines</span>
          <div className="sd-chips" role="group" aria-label="Disciplines">
            {DISCIPLINES.map((d) => <button type="button" key={d} aria-pressed={studio.disciplines.includes(d)} className={studio.disciplines.includes(d) ? "on" : ""} onClick={() => update({ disciplines: toggle(studio.disciplines, d) })}>{d}</button>)}
          </div>
        </div>
        <Field label="About my space"><textarea rows={4} value={studio.about} onChange={(e) => update({ about: e.target.value })} /></Field>
        <Field label="What you're working on right now"><input value={studio.now} onChange={(e) => update({ now: e.target.value })} maxLength={120} /></Field>

        <div className="sd-field">
          <span className="lb">The door</span>
          <div className="sd-styles" role="radiogroup" aria-label="Visiting style">
            {(Object.keys(VISITING) as VisitingStyle[]).map((v) => (
              <button type="button" key={v} role="radio" aria-checked={studio.visiting === v} className={studio.visiting === v ? "on" : ""} onClick={() => update({ visiting: v })}>
                <b>{VISITING[v].label}</b><small>{VISITING[v].blurb}</small>
              </button>
            ))}
          </div>
        </div>
        <div className="sd-field">
          <span className="lb">Weekly open hours</span>
          <div className="sd-days" role="group" aria-label="Open days">
            {DAYS.map((d) => <button type="button" key={d} aria-pressed={studio.hours.days.includes(d)} className={studio.hours.days.includes(d) ? "on" : ""} onClick={() => update({ hours: { ...studio.hours, days: toggle(studio.hours.days, d) } })}>{d}</button>)}
          </div>
          <div className="sd-two tight">
            <Field label="From"><input type="time" value={studio.hours.from} onChange={(e) => update({ hours: { ...studio.hours, from: e.target.value } })} /></Field>
            <Field label="To"><input type="time" value={studio.hours.to} onChange={(e) => update({ hours: { ...studio.hours, to: e.target.value } })} /></Field>
          </div>
        </div>

        <div className="sd-field">
          <span className="lb">Cover photo</span>
          <PhotoPicker keys={COVER_CHOICES} value={studio.cover} onChange={(k) => k && update({ cover: k })} label="Cover photo" size="sm" />
        </div>
        <div className="sd-field">
          <span className="lb">Wall colour</span>
          <div className="sd-swatches" role="radiogroup" aria-label="Wall colour">
            {THEMES.map((t) => (
              <button type="button" key={t.id} role="radio" aria-checked={studio.theme === t.id} className={studio.theme === t.id ? "on" : ""} onClick={() => update({ theme: t.id })}>
                <i style={{ background: t.wall, boxShadow: `inset -14px 0 0 ${t.accent}` }} /><b>{t.name}</b>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
