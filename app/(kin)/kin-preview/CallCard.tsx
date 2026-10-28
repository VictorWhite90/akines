"use client";

import { ArrowRight2, ShieldTick } from "iconsax-reactjs";
import Avatar from "@/components/kin/Avatar";
import { Media } from "@/components/kin/Card";
import { TransitionLink } from "@/components/kin/ViewTransitions";
import { PEOPLE } from "@/lib/data/people";
import { motion, useReducedMotion } from "motion/react";
import { spring } from "@/components/kin/motion";
import type { SampleCall } from "./_sample";

const MotionLink = motion.create(TransitionLink);

/** An open call. Its photo carries a view-transition-name so it becomes the hero of the detail page. */
export default function CallCard({ call }: { call: SampleCall }) {
  const reduced = useReducedMotion();
  const host = PEOPLE[call.host];
  return (
    <MotionLink href={`/kin-preview/calls/${call.id}`} className="k-card k-call" whileTap={reduced ? undefined : { scale: 0.985 }} transition={spring.press}>
      <Media photo={call.photo} ratio="16 / 10" sizes="(max-width: 639px) 100vw, 400px" className="k-photo" style={{ viewTransitionName: `call-${call.id}` }} />
      <span className="k-call-body">
        <span className="k-call-host"><Avatar person={host} size={22} /><b>{call.org}</b><ShieldTick size={14} color="currentColor" aria-label="Verified" /><span>· {call.city}</span></span>
        <span className="t-heading">{call.title}</span>
        <span className="t-body c-2">{call.summary}</span>
        {call.fit && <span className="k-call-fit">{call.fit}</span>}
        <span className="k-call-roles">{call.roles.slice(0, 2).join(" · ")}{call.roles.length > 2 ? ` · +${call.roles.length - 2}` : ""}</span>
        <span className="k-call-foot">
          <span className="k-call-fee"><b>{call.fee}</b><small>{call.feeNote} · closes in {call.closes} days</small></span>
          <span className="k-btn primary sm">Apply<ArrowRight2 size={14} color="currentColor" /></span>
        </span>
      </span>
    </MotionLink>
  );
}
