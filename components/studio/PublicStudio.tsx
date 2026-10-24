"use client";

import Link from "next/link";
import { useState } from "react";
import Pic from "@/components/home/Pic";
import Avatar from "@/components/ui/Avatar";
import { DoorGlyph, Ico, NoteCard, VisitingChip, WorkCard, WorkDetail } from "./parts";
import { useStudioState } from "./useMyStudio";
import { MAX_SEATS, VISITING, studioToPublic, themeVars, type PublicStudio, type Work } from "@/lib/data/studio";
import { PEOPLE } from "@/lib/data/people";
import BackLink from "@/components/ui/BackLink";
import { Glyph } from "@/components/ui/Icon";

const MODE_GLYPH: Record<string, string> = { Live: "live", Virtual: "screen", "360°": "world", VR: "video-play" };

/** A studio the way a visitor sees it: cover, the maker, a visit to reserve, the wall and studio notes. */
export default function PublicStudioView({ studio }: { studio: PublicStudio }) {
  const [reserved, setReserved] = useState(false);
  const [asked, setAsked] = useState(false);
  const [detail, setDetail] = useState<Work | null>(null);
  const owner = PEOPLE[studio.owner];
  const v = studio.visit;
  const taken = v ? Math.min(v.seats, v.taken.length + (reserved ? 1 : 0)) : 0;
  const walk = v?.mode === "360°";

  return (
    <div className="sd sd-public" style={themeVars(studio.theme)}>
      {studio.own && (
        <div className="sd-banner" role="status">
          <span><Ico n="eye" size={16} /> You&apos;re viewing your space as a visitor</span>
          <Link href={`/studio${studio.demo ? `?demo=${studio.demo}` : ""}`} className="sd-btn accent small">← Back to my space</Link>
        </div>
      )}
      {!studio.own && <BackLink fallback="/studios" className="sd-back">← Back</BackLink>}

      <section className="sd-hero" aria-label={studio.name}>
        <div className="cover">
          <Pic name={studio.cover} sizes="(max-width: 760px) 100vw, 1100px" priority position="center 40%" />
          <div className="fade" />
          <VisitingChip style={studio.visiting} className="on-cover" />
        </div>
        <div className="band">
          <div className="who">
            <Avatar person={owner} size={54} className="sd-av" />
            <div className="txt">
              <h1 className="font-display">{studio.name}</h1>
              <p className="tagline">{studio.tagline}</p>
              <div className="meta">
                <span className="place">{owner.name} · {studio.place}</span>
                {studio.disciplines.map((d) => <span key={d} className="chip">{d}</span>)}
              </div>
            </div>
          </div>
          <div className={`sd-door static ${studio.doorOpen ? "open" : "shut"}`}>
            <span className="glyph"><DoorGlyph open={studio.doorOpen} size={26} /></span>
            <span className="lbl"><b><i className="dot" />{studio.doorOpen ? "Door open" : "Door closed"}</b><small>{studio.hours}</small></span>
          </div>
        </div>
      </section>

      <div className="sd-cols">
        <div className="sd-main">
          <section className="sd-card visit" aria-label="Next visit">
            {v ? (
              <>
                <div className="top">
                  <div>
                    <p className="ac-eyebrow">Next visit</p>
                    <h2>{v.title}</h2>
                    <p className="when"><span className={`mode ${v.mode === "360°" ? "m360" : v.mode.toLowerCase()}`}><i aria-hidden><Glyph g={MODE_GLYPH[v.mode] ?? "live"} size={12} /></i>{v.mode}</span> {v.when}</p>
                  </div>
                  {studio.visiting === "private" ? (
                    <button className={`sd-btn ${asked ? "done" : "dark"}`} aria-pressed={asked} onClick={() => setAsked((a) => !a)}>{asked ? "✓ Invitation requested" : "Ask for an invitation"}</button>
                  ) : (
                    <button className={`sd-btn ${reserved ? "done" : "dark"}`} aria-pressed={reserved} onClick={() => setReserved((r) => !r)}>{reserved ? (walk ? "✓ Opening…" : "✓ Seat reserved") : walk ? "Walk in" : "Reserve a seat"}</button>
                  )}
                </div>
                <div className="seats" aria-label={`${taken} of ${v.seats} seats taken`}>
                  {Array.from({ length: MAX_SEATS }, (_, i) => {
                    const who = v.taken[i];
                    const you = reserved && i === v.taken.length;
                    if (i >= v.seats) return <span key={i} className="seat off" aria-hidden />;
                    if (who) return <span key={i} className="seat"><Avatar person={PEOPLE[who]} size={30} /></span>;
                    return <span key={i} className={`seat free${you ? " you" : ""}`}>{you ? "You" : ""}</span>;
                  })}
                  <span className="cnt"><b>{taken}</b> of {v.seats} seats taken{studio.visiting === "appointment" && !walk ? " · the maker confirms each seat" : ""}</span>
                </div>
              </>
            ) : (
              <div className="top">
                <div>
                  <p className="ac-eyebrow">Visits</p>
                  <h2>No open door scheduled yet</h2>
                  <p className="when">{VISITING[studio.visiting].blurb}</p>
                </div>
              </div>
            )}
          </section>

          <section aria-label="My space">
            <div className="sd-head"><div><h2>My space</h2><p>Open anything to read the story behind it.</p></div></div>
            {studio.works.length === 0 ? <p className="sd-empty">Nothing in your space yet.</p> : (
              <div className="sd-works">{studio.works.map((w) => <WorkCard key={w.id} work={w} onOpen={() => setDetail(w)} />)}</div>
            )}
          </section>

          {studio.notes.length > 0 && (
            <section aria-label="Studio notes">
              <div className="sd-head"><div><h2>Work in public</h2><p>What you're working on, shared as it happens.</p></div></div>
              <div className="sd-board">{studio.notes.map((n) => <NoteCard key={n.id} note={n} />)}</div>
            </section>
          )}
        </div>

        <aside className="sd-side">
          <section className="sd-card artist">
            <div className="row">
              <Avatar person={owner} size={52} />
              <div><h3>{owner.name}</h3><p>{owner.role} · {owner.city}</p></div>
            </div>
            <p className="ab">{studio.about || owner.about}</p>
            <div className="foot"><VisitingChip style={studio.visiting} /><span className="hrs">{studio.hours}</span></div>
          </section>
          {studio.now && (
            <section className="sd-card now">
              <p className="ac-eyebrow">Working on right now</p>
              <p className="q">&ldquo;{studio.now}&rdquo;</p>
            </section>
          )}
          <section className="sd-card shop">
            <div className="thumbs">{studio.works.slice(0, 3).map((w) => <span key={w.id}><Pic name={w.photo} sizes="90px" /></span>)}</div>
            <h3>Shop from this space</h3>
            <p>If something here is for sale, buy it straight from the person who made it.</p>
            <Link href="/shop" className="sd-link">Browse the shop <Ico n="arrow" size={14} /></Link>
          </section>
        </aside>
      </div>

      {detail && <WorkDetail work={detail} onClose={() => setDetail(null)} />}
    </div>
  );
}

/** /studios/me: the member's own studio, seen as a visitor would. `?demo=1` uses sample data. */
export function OwnStudioPreview({ demo }: { demo?: string }) {
  const { studio, ready } = useStudioState(demo);
  if (!ready) return <div className="sd sd-skel" aria-busy="true"><div className="a" /><div className="b" /></div>;
  if (!studio) {
    return (
      <div className="sd sd-public">
        <div className="sd-card empty-state">
          <p className="ac-eyebrow">Your studio</p>
          <h2 className="font-display">You haven&apos;t opened your space yet.</h2>
          <p>Open it first, then come back to see it the way visitors do.</p>
          <Link href="/studio" className="sd-btn dark">Open my space</Link>
        </div>
      </div>
    );
  }
  return <PublicStudioView studio={{ ...studioToPublic(studio), demo }} />;
}
