"use client";

import { useState } from "react";
import Button from "@/components/kin/Button";
import { toast } from "@/components/kin/Toast";
import { CC, requestHref, sampleCollaborator, sentOn, useIntroductions, useSavedCollaborators, type Collaborator } from "@/lib/collab/collaborators";
import { PEOPLE } from "@/lib/data/people";
import Overlays, { type OverlayKind } from "./Overlays";
import { Back, CcAvatar, CcEmpty, Heading, PersonCard, photoOf, Status } from "./parts";
import Img from "@/components/kin/Img";

/*
 * Saved collaborators and introduction requests, mirrored from the product design (cc-list). `staticEmpty` is the
 * design's empty state for each, reached from its own address.
 */

export function SavedCollaborators({ staticEmpty }: { staticEmpty?: boolean }) {
  const { saved, unsave } = useSavedCollaborators();
  const [open, setOpen] = useState<OverlayKind | null>(null);
  const [who, setWho] = useState<Collaborator | null>(null);
  const people = staticEmpty ? [] : saved.map(sampleCollaborator).filter((c): c is Collaborator => !!c);
  const onRemove = (c: Collaborator) => { const undo = unsave(c.id); toast.show({ message: "Removed from your saved collaborators.", actionLabel: "Undo", onAction: undo }); };
  return (
    <>
      <div className="cc-page cc-list">
        <Back href={CC.discovery}>Back to collaborators</Back>
        <div className="cc-list__head">
          <Heading className="cc-list__heading" eyebrow="Saved for later" title="People worth a conversation." support="Saving never contacts anyone. Request an introduction whenever you’re ready." />
          <div className="cc-list__link" data-m="up"><Button variant="link" href={staticEmpty ? CC.requestsEmpty : CC.requests}>Introduction requests</Button></div>
        </div>
        {people.length ? (
          <div className="cc-grid" data-m="stagger">
            {people.map((c) => <PersonCard key={c.id} c={c} saved saveLabel="Remove from saved" hideNotRelevant onSave={() => onRemove(c)} onAsk={() => { setWho(c); setOpen("ask"); }} />)}
          </div>
        ) : (
          <CcEmpty title="Your next collaborator is waiting to be discovered." text="Save people whose skills and interests may complement your projects." action={<div><Button href={CC.discovery}>Explore collaborators</Button></div>} />
        )}
      </div>
      <Overlays open={open} onClose={() => setOpen(null)} person={who} />
    </>
  );
}

export function IntroductionRequests({ staticEmpty }: { staticEmpty?: boolean }) {
  const { list } = useIntroductions();
  // a withdrawn request has left the list (Undo on its toast brings it back)
  const rows = staticEmpty ? [] : list;
  return (
    <div className="cc-page cc-list">
      <Back href={CC.discovery}>Back to collaborators</Back>
      <div className="cc-list__head">
        <Heading className="cc-list__heading" eyebrow="Your introductions" title="Where each introduction stands." support="You decide who to contact. Each person decides whether to connect." />
        <div className="cc-list__link" data-m="up"><Button variant="link" href={staticEmpty ? CC.savedEmpty : CC.saved}>Saved collaborators</Button></div>
      </div>
      {rows.length ? (
        <ul className="cc-reqs" data-m="stagger">
          {rows.map((r) => {
            const p = PEOPLE[r.to];
            const src = photoOf(r.to);
            return (
              <li className="cc-req-row" key={r.id}>
                <div className="cc-req-row__photo">
                  {src ? <Img sizes="96px" src={src} width={96} height={120} /> : <CcAvatar id={r.to} size={96} />}
                </div>
                <div className="cc-req-row__info">
                  <h2 className="cc-req-row__name">{p.name}</h2>
                  <p className="cc-req-row__role">{p.role}</p>
                  {r.projectTitle ? <p className="cc-req-row__project">For {r.projectTitle}</p> : null}
                  <p className="cc-req-row__msg">{r.message.replace(/\s*\n+\s*/g, " ")}</p>
                </div>
                <div className="cc-req-row__status">
                  <Status status={r.status} />
                  <p className="cc-req-row__date">{sentOn(r.sentAt)}</p>
                  <Button variant="link" href={requestHref(r.to, r.status)}>View request</Button>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <CcEmpty title="No introductions yet." text="When you request a connection, you’ll be able to follow its progress here." />
      )}
    </div>
  );
}
