"use client";

import { useEffect, useState } from "react";
import { NEEDS } from "@/components/collaborate/start/data";
import Button from "@/components/kin/Button";
import { Radio } from "@/components/kin/Choice";
import { CC, INTENTIONS, useMatching } from "@/lib/collab/collaborators";
import Overlays, { type OverlayKind } from "./Overlays";
import { Back, Heading } from "./parts";

/* Your collaboration intention, mirrored from the product design (cc-match): what you're looking for, and for which project. */

export default function Matching() {
  const { intention, setIntention, setNeed, brief, projects } = useMatching();
  const [open, setOpen] = useState<OverlayKind | null>(null);
  // Create AI's Explore collaborators chat opens this page with ?need=<need id>: the choice is preselected from it
  useEffect(() => {
    const need = new URLSearchParams(window.location.search).get("need");
    if (need && NEEDS.some((n) => n.id === need)) setNeed(need);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once, as the page opens
  }, []);
  return (
    <>
    <div className="cc-page cc-match">
      <div className="cc-match__intro">
        <Heading eyebrow="Your collaboration intention" title="Who would you like to work with?" support="Tell us what you’re looking for so we can recommend people who may be a meaningful fit." />
        <div className="cc-actions cc-actions--wide" data-m="up">
          <Button href={CC.discovery} arrow="up-right">Show collaborators</Button>
          <Back href={CC.entry}>Back</Back>
        </div>
      </div>
      <div className="cc-match__side">
        <div className="cc-options" role="radiogroup" aria-label="Who would you like to work with?" data-m="stagger">
          {INTENTIONS.map((t, i) => (
            <Radio key={t.id} variant="card" name="cc-intention" value={t.id} index={`0${i + 1}`} label={t.title} description={t.text} checked={intention === t.id} onChange={() => setIntention(t.id)} />
          ))}
        </div>
        <section className="cc-with" aria-label="Matching with" data-m="up">
          <p className="cc-eyebrow">Matching with your approved brief</p>
          <h2 className="cc-with__name">{brief?.name ?? "No project yet"}</h2>
          <p className="cc-with__line">{brief?.line ?? "Start a project, or match on your skills and interests."}</p>
          {/* with no project of yours yet there is nothing to change to: My Projects is where one starts */}
          <div>{projects.length ? <Button variant="link" onClick={() => setOpen("project")} aria-haspopup="dialog">Change project</Button> : <Button variant="link" href={CC.myProjects}>Change project</Button>}</div>
        </section>
        <p className="cc-note" data-m="up">No project yet? Choose “For my skills” or “For a shared interest” and we’ll use your profile and interests instead.</p>
      </div>
    </div>
    <Overlays open={open} onClose={() => setOpen(null)} person={null} />
    </>
  );
}
