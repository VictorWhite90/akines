"use client";

import { notFound } from "next/navigation";
import Button from "@/components/kin/Button";
import { CC, leadId, requestHref, useCollaborator, useIntroductions, useMatching, wordsFor } from "@/lib/collab/collaborators";
import { PEOPLE } from "@/lib/data/people";
import { CcAvatar, HERO, Status } from "./parts";

/* Request sent, mirrored from the product design (cc-split with cc-sent): where the introduction stands now. */

export default function RequestSent({ id }: { id?: string }) {
  const c = useCollaborator(id ?? leadId() ?? undefined);
  const { list } = useIntroductions();
  const { brief } = useMatching();
  if (!c) notFound();
  const w = wordsFor(c);
  const intro = list.find((x) => x.to === c.id);
  return (
    <div className="cc-split">
      <div className="cc-split__content">
        <div className="cc-heading cc-heading--hero">
          <p className="cc-eyebrow" data-m="up">Request sent</p>
          <h1 className="cc-h cc-h--sent" data-m="words">Your introduction request is on its way.</h1>
          <p className="cc-support" data-m="up">{w.sentSupport}</p>
        </div>
        <section className="cc-sent" aria-label="Request status" data-m="up">
          <div className="cc-sent__row">
            <CcAvatar id={c.id} size={72} shown={64} />
            <div className="cc-sent__who">
              <p className="cc-sent__name">{PEOPLE[c.id].name}</p>
              <p className="cc-sent__project">{intro?.projectTitle || brief?.name}</p>
            </div>
            <Status status={intro?.status ?? "pending"} />
          </div>
          <hr className="cc-rule" />
          <p className="cc-sent__note">{w.sentNote}</p>
        </section>
        <div className="cc-actions" data-m="up">
          <Button href={CC.discovery} arrow="up-right">Return to collaborators</Button>
          <Button variant="secondary" href={requestHref(c.id, intro?.status)}>View request</Button>
        </div>
      </div>
      <div className="cc-split__photo" data-m="frame">
        {/* eslint-disable-next-line @next/next/no-img-element -- the design's photo */}
        <img className="cover" src={HERO} alt="" decoding="async" width={605} height={762} />
      </div>
    </div>
  );
}
