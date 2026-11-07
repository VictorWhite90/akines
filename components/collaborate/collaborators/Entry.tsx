"use client";

import { Check } from "lucide-react";
import Button from "@/components/kin/Button";
import { CC } from "@/lib/collab/collaborators";
import { Arrow, HERO } from "./parts";

/* Collaborators, the way in, mirrored from the product design (cc-split): a hero with the three promises and a photo. */

const PRINCIPLES = ["Every recommendation comes with a reason.", "You decide what to share and who sees it.", "Nothing is sent without your approval."];

export default function Entry() {
  return (
    <div className="cc-split">
      <div className="cc-split__content">
        <div className="cc-heading cc-heading--hero">
          <p className="cc-eyebrow" data-m="up">Discover your people</p>
          <h1 className="cc-h cc-h--hero" data-m="words">Find the people who can help your idea grow.</h1>
          <p className="cc-support" data-m="up">Discover people whose skills, experience and working preferences may complement yours.</p>
        </div>
        <div className="cc-actions" data-m="up">
          <Button href={CC.matching} iconRight={<Arrow />}>Explore collaborators</Button>
          <Button variant="secondary" href={CC.start}>Start a project</Button>
        </div>
        <ul className="cc-principles" data-m="up">
          {PRINCIPLES.map((p) => <li key={p}><Check size={16} strokeWidth={1.5} aria-hidden /><span>{p}</span></li>)}
        </ul>
      </div>
      <div className="cc-split__photo" data-m="frame">
        {/* eslint-disable-next-line @next/next/no-img-element -- the design's photo */}
        <img className="cover" src={HERO} alt="" decoding="async" width={605} height={762} />
      </div>
    </div>
  );
}
