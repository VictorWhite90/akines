"use client";

import { useState } from "react";
import Button from "@/components/kin/Button";
import { toast } from "@/components/kin/Toast";
import { CC, INTENTIONS, skillsLine, useMatching, useRecommendations, useSavedCollaborators, type Collaborator } from "@/lib/collab/collaborators";
import type { PersonId } from "@/lib/data/people";
import Overlays, { type OverlayKind } from "./Overlays";
import { CcEmpty, Heading, PersonCard } from "./parts";

/*
 * Collaborators, the recommendations, mirrored from the product design (cc-disc): what we're matching on, then a
 * card per person with the reason. `forceEmpty` is the design's "no recommendations" state.
 */

export default function Discovery({ forceEmpty }: { forceEmpty?: boolean }) {
  const { brief, prefs, intention } = useMatching();
  const recs = useRecommendations();
  const { savedNow, save } = useSavedCollaborators();
  const [open, setOpen] = useState<OverlayKind | null>(null);
  const [who, setWho] = useState<Collaborator | null>(null);
  const people = forceEmpty ? [] : recs.list;
  const label = INTENTIONS.find((m) => m.id === intention)?.label ?? "For a project";
  const onSave = (id: PersonId) => { const undo = save(id); toast.show({ message: "Saved to your collaborators.", actionLabel: "Undo", onAction: undo }); };
  const context = [
    { label: "Project", value: brief?.name ?? "No project yet" },
    { label: "Skills needed", value: skillsLine(prefs) },
    { label: "Project stage", value: brief?.stage ?? "Not started" },
    { label: "Matching intention", value: label },
  ];
  const openFor = (c: Collaborator, kind: OverlayKind) => { setWho(c); setOpen(kind); };
  return (
    <>
      <div className="cc-page cc-disc">
        <div className="cc-disc__head">
          <Heading className="cc-disc__heading" eyebrow="People to create with" title="The right people can change an idea." support="Explore people whose skills, experience and way of working may complement your project." />
          <div className="cc-disc__links" data-m="up">
            <Button variant="link" href={CC.saved}>Saved collaborators</Button>
            <Button variant="link" href={CC.requests}>Introduction requests</Button>
          </div>
        </div>
        <section className="cc-context" aria-label="Matching context" data-m="up">
          {context.map((m) => (
            <div className="cc-context__item" key={m.label}><p className="cc-eyebrow">{m.label}</p><p className="cc-context__value">{m.value}</p></div>
          ))}
          <Button variant="secondary" onClick={() => setOpen("prefs")}>Adjust matching</Button>
        </section>
        {people.length ? (
          <div className="cc-grid" data-m="stagger">
            {people.map((c) => {
              const isSaved = savedNow.includes(c.id);
              return <PersonCard key={c.id} c={c} saved={isSaved} saveLabel={isSaved ? "Saved" : "Save for later"} onSave={isSaved ? undefined : () => onSave(c.id)} onNotRelevant={() => openFor(c, "notrelevant")} onAsk={() => openFor(c, "ask")} />;
            })}
          </div>
        ) : (
          <CcEmpty title="We’re still finding the right people." text="Try adjusting your matching preferences to discover more collaborators." textWidth={760} action={<div><Button onClick={() => setOpen("prefs")}>Adjust preferences</Button></div>} />
        )}
      </div>
      <Overlays open={open} onClose={() => setOpen(null)} person={who} from="cards" />
    </>
  );
}
