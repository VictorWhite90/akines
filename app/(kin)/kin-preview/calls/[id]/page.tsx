"use client";

import { use } from "react";
import { ArrowLeft2 } from "iconsax-reactjs";
import Avatar from "@/components/kin/Avatar";
import Button from "@/components/kin/Button";
import { Media } from "@/components/kin/Card";
import Settle from "@/components/kin/Settle";
import { useTransitionBack } from "@/components/kin/ViewTransitions";
import { PEOPLE } from "@/lib/data/people";
import { CALLS } from "../../_sample";
import "../../preview.css";

/** Prototype of the shared-element move: the card's photo becomes this hero. */
export default function PreviewCallDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const back = useTransitionBack("/kin-preview");
  const call = CALLS.find((c) => c.id === id) ?? CALLS[0];
  const host = PEOPLE[call.host];
  return (
    <div className="pv-detail">
      <div className="pv-detail-top">
        <Button variant="ghost" icon onClick={back} aria-label="Back"><ArrowLeft2 size={22} color="currentColor" /></Button>
        <span className="t-small c-3">Open call</span>
      </div>
      <Media photo={call.photo} ratio="16 / 9" sizes="(max-width: 639px) 100vw, 760px" priority className="k-photo hero" style={{ viewTransitionName: `call-${call.id}` }} />
      <Settle className="pv-detail-body">
        <div className="k-call-host"><Avatar person={host} size={28} /><b>{call.org}</b><span>· {call.city} · hosted by {host.name}</span></div>
        <h1 className="t-page">{call.title}</h1>
        <p className="t-body c-2">{call.summary}</p>
        <dl>
          <div><dt>Fee</dt><dd>{call.fee} {call.feeNote}</dd></div>
          <div><dt>Closes</dt><dd>in {call.closes} days</dd></div>
          <div><dt>Roles</dt><dd>{call.roles.join(", ")}</dd></div>
          <div><dt>Field</dt><dd>{call.field}</dd></div>
        </dl>
        <div className="k-row"><Button variant="primary">Apply</Button><Button onClick={back}>Back to the preview</Button></div>
      </Settle>
    </div>
  );
}
