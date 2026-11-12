"use client";

import { useState } from "react";
import { notFound } from "next/navigation";
import { Eye } from "lucide-react";
import Button from "@/components/kin/Button";
import { CC, collabHref, leadId, useCollaborator, wordsFor } from "@/lib/collab/collaborators";
import { PEOPLE } from "@/lib/data/people";
import Overlays, { type OverlayKind } from "./Overlays";
import { Back, Heading, photoOf } from "./parts";
import Img from "@/components/kin/Img";

/* Why this match, mirrored from the product design (cc-why): each reason with where it came from, and a summary of the person. */

export default function WhyMatch({ id }: { id?: string }) {
  const c = useCollaborator(id ?? leadId() ?? undefined);
  const [open, setOpen] = useState<OverlayKind | null>(null);
  if (!c) notFound();
  const p = PEOPLE[c.id], h = collabHref(c.id), w = wordsFor(c);
  const src = c.photos?.wide ?? photoOf(c.id);
  return (
    <>
      <div className="cc-page cc-why">
        <div className="cc-why__main">
          <Back href={CC.discovery}>Back to collaborators</Back>
          <Heading eyebrow="Why this match" title="You may bring different strengths to the same purpose." support="Here’s what makes this collaboration worth exploring." />
          <ol className="cc-rows" data-m="stagger">
            {c.reasons.map((r, i) => (
              <li className="cc-row" key={r.category}>
                <div className="cc-row__meta"><span className="cc-row__no">{String(i + 1).padStart(2, "0")}</span><span className="cc-row__cat">{r.category}</span></div>
                <div className="cc-row__body">
                  <p className="cc-row__text">{r.text}</p>
                  <p className="cc-row__src"><Eye size={14} strokeWidth={1.5} aria-hidden /><span>{r.source}</span></p>
                </div>
              </li>
            ))}
          </ol>
        </div>
        <aside className="cc-why__side" aria-label="Match summary">
          <div className="cc-summary" data-m="up">
            <div className="cc-summary__photo">
              {src ? <Img sizes="382px" src={src} width={382} height={300} /> : null}
            </div>
            <p className="cc-card__avail-text"><span className="cc-dot" aria-hidden />{c.availability}</p>
            <h2 className="cc-summary__name">{p.name}</h2>
            <p className="cc-card__role">{p.role}</p>
            <Button full href={h.profile} arrow="up-right">View profile</Button>
            <Button full variant="secondary" href={h.request}>Request introduction</Button>
            <Button variant="link" onClick={() => setOpen("ask")}>Ask Akines why</Button>
            <div className="cc-summary__privacy">
              <hr className="cc-rule" />
              <p><Eye size={16} strokeWidth={1.5} aria-hidden /><span>{w.privacyNote}</span></p>
              <Button variant="link" onClick={() => setOpen("privacy")}>What’s visible and why</Button>
            </div>
          </div>
        </aside>
      </div>
      <Overlays open={open} onClose={() => setOpen(null)} person={c} />
    </>
  );
}
