"use client";

import { useState } from "react";
import { notFound } from "next/navigation";
import { Eye } from "lucide-react";
import Button from "@/components/kin/Button";
import { toast } from "@/components/kin/Toast";
import { CC, collabHref, leadId, useCollaborator, useSavedCollaborators, wordsFor } from "@/lib/collab/collaborators";
import { PEOPLE } from "@/lib/data/people";
import Overlays, { type OverlayKind } from "./Overlays";
import { Arrow, Back, photoOf } from "./parts";

/* A collaborator's profile, mirrored from the product design (cc-prof): who they are and what they shared, with the next steps beside it. */

export default function Profile({ id }: { id?: string }) {
  const c = useCollaborator(id ?? leadId() ?? undefined);
  const { save } = useSavedCollaborators();
  const [open, setOpen] = useState<OverlayKind | null>(null);
  if (!c) notFound();
  const p = PEOPLE[c.id], h = collabHref(c.id), w = wordsFor(c);
  const src = photoOf(c.id, 640);
  const onSave = () => { const undo = save(c.id); toast.show({ message: "Saved to your collaborators.", actionLabel: "Undo", onAction: undo }); };
  return (
    <>
      <div className="cc-page cc-prof">
        <div className="cc-prof__main">
          <Back href={CC.discovery}>Back to collaborators</Back>
          <header className="cc-prof__head">
            <div className="cc-prof__photo" data-m="frame">
              {/* eslint-disable-next-line @next/next/no-img-element -- member photo */}
              {src ? <img className="cover" src={src} alt="" decoding="async" width={280} height={352} /> : null}
            </div>
            <div className="cc-prof__id">
              <p className="cc-prof__avail"><span className="cc-dot" aria-hidden />{c.availability}</p>
              <h1 className="cc-prof__name" data-m="words">{p.name}</h1>
              <p className="cc-prof__role">{p.role}</p>
              <p className="cc-prof__intro">{c.intro}</p>
              <ul className="cc-tags" aria-label="Key skills">{c.keySkills.map((s) => <li key={s}>{s}</li>)}</ul>
            </div>
          </header>
          <section className="cc-sec" aria-labelledby="cc-sec-about" data-m="up">
            <h2 className="cc-eyebrow" id="cc-sec-about">About</h2>
            <p className="cc-sec__body">{c.about}</p>
          </section>
          <section className="cc-sec" aria-labelledby="cc-sec-exp" data-m="up">
            <h2 className="cc-eyebrow" id="cc-sec-exp">Experience</h2>
            <ul className="cc-items">{c.experienceList.map((x) => <li key={x.title}><p className="cc-items__title">{x.title}</p><p className="cc-items__detail">{x.detail}</p></li>)}</ul>
          </section>
          <section className="cc-sec" aria-labelledby="cc-sec-skills" data-m="up">
            <h2 className="cc-eyebrow" id="cc-sec-skills">Skills</h2>
            <ul className="cc-tags">{c.skills.map((s) => <li key={s}>{s}</li>)}</ul>
          </section>
          <section className="cc-sec" aria-labelledby="cc-sec-int" data-m="up">
            <h2 className="cc-eyebrow" id="cc-sec-int">Interests</h2>
            <ul className="cc-tags">{c.interests.map((s) => <li key={s}>{s}</li>)}</ul>
          </section>
          <section className="cc-sec" aria-labelledby="cc-sec-pref" data-m="up">
            <h2 className="cc-eyebrow" id="cc-sec-pref">Working preferences</h2>
            <dl className="cc-prefs">{c.preferences.map((x) => <div key={x.label}><dt>{x.label}</dt><dd>{x.value}</dd></div>)}</dl>
          </section>
          {c.contributions.length ? (
            <section className="cc-sec" aria-labelledby="cc-sec-con" data-m="up">
              <h2 className="cc-eyebrow" id="cc-sec-con">Contributions</h2>
              <ul className="cc-items">{c.contributions.map((x) => <li key={x.title}><p className="cc-items__title">{x.title}</p><p className="cc-items__detail">{x.detail}</p></li>)}</ul>
            </section>
          ) : null}
          <section className="cc-sec" aria-labelledby="cc-sec-ctx" data-m="up">
            <h2 className="cc-eyebrow" id="cc-sec-ctx">Match context</h2>
            <div className="cc-context-box">
              <p className="cc-context-box__text">{c.matchContext}</p>
              <div><Button variant="link" href={h.why} iconRight={<Arrow />}>See the full explanation</Button></div>
            </div>
          </section>
        </div>
        <aside className="cc-prof__side" aria-label="Actions">
          <section className="cc-panel" data-m="up">
            <h2 className="cc-eyebrow">Interested in {w.first}?</h2>
            <Button full href={h.request} iconRight={<Arrow />}>Request introduction</Button>
            <Button full variant="secondary" onClick={onSave}>Save for later</Button>
            <div className="cc-panel__links">
              <Button variant="link" onClick={() => setOpen("notrelevant")}>Not relevant</Button>
              <Button variant="link" onClick={() => setOpen("ask")}>Ask Akines why</Button>
            </div>
          </section>
          <section className="cc-panel cc-panel--note" data-m="up">
            <h2 className="cc-panel__head"><Eye size={16} strokeWidth={1.5} aria-hidden /><span className="cc-eyebrow">What you’re seeing</span></h2>
            <p className="cc-panel__text">{w.seeing}</p>
            <div><Button variant="link" onClick={() => setOpen("privacy")}>See what’s shared</Button></div>
          </section>
        </aside>
      </div>
      <Overlays open={open} onClose={() => setOpen(null)} person={c} />
    </>
  );
}
