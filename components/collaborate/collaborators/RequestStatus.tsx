"use client";

import { useEffect, useState } from "react";
import { notFound, useRouter } from "next/navigation";
import Button from "@/components/kin/Button";
import { Modal, Skeleton } from "@/components/kin/Overlay";
import { toast } from "@/components/kin/Toast";
import { ApplicationTimeline } from "@/components/collaborate/applications/shared";
import { LOADING_MS } from "@/components/collaborate/overview-lists/loading";
import { CC, profileHref, requestHref, requestPage, useIntroductions, type IntroStatus } from "@/lib/collab/collaborators";
import { PEOPLE } from "@/lib/data/people";
import { Back, CcAvatar, CcEmpty, Heading, Status } from "./parts";

/*
 * Where one introduction request you sent stands, mirrored from the product design (12.47, cc-rq in
 * ../styles/collaborators.css): the request card, the timeline, what is shared, and what to do next. `stage`
 * is set by the review addresses (Not now, state-accepted, state-not-now); otherwise the page shows the
 * request's own status. Withdraw request (pending only) asks first, then returns to the list without it,
 * with Undo on the toast.
 */

export default function RequestStatus({ id, stage }: { id: string; stage?: IntroStatus }) {
  const router = useRouter();
  const intros = useIntroductions();
  const [asking, setAsking] = useState(false);
  // the withdrawn request, kept on screen while the list opens (it has already left the data)
  const [leaving, setLeaving] = useState<ReturnType<typeof intros.get>>(null);
  if (!intros.ready) return null;
  const intro = intros.get(id) ?? leaving;
  if (!intro) notFound();
  const page = requestPage(intro, stage);
  const p = PEOPLE[intro.to];

  const withdraw = () => {
    setLeaving(intro);
    const undo = intros.withdraw(intro.id);
    setAsking(false);
    router.push(CC.requests);
    toast.show({ message: "Request withdrawn.", actionLabel: "Undo", onAction: undo });
  };

  return (
    <>
      <div className="cc-page cc-req">
        <div className="cc-req__col">
          <Back href={CC.requests}>Back to introduction requests</Back>
          <Heading eyebrow="Your introduction" title={page.headline} support={page.support} />

          <section className="cc-rq" aria-label="Your request" data-m="up">
            <div className="cc-rq__row">
              <CcAvatar id={intro.to} size={72} shown={64} />
              <div className="cc-rq__info">
                <h2 className="cc-rq__name">{p.name}</h2>
                <p className="cc-rq__project">{intro.projectTitle ? `${p.role} · For ${intro.projectTitle}` : p.role}</p>
              </div>
              <Status status={page.stage} />
            </div>
            <hr className="cc-rule" />
            <p className="cc-rq__sent">{page.sent}</p>
            <p className="cc-eyebrow">Your note</p>
            <p className="cc-rq__note">{intro.message}</p>
          </section>

          <div data-m="up">
            <ApplicationTimeline heading="Where your request stands" steps={page.steps} trailingLine={page.steps[page.steps.length - 1].state !== "ended"} />
          </div>

          <aside className="cc-notice" data-m="up">
            <h2 className="cc-notice__title">{page.notice.title}</h2>
            <p className="cc-notice__text">{page.notice.text}</p>
          </aside>

          <div className="cc-actions" data-m="up">
            {/* no one to one conversation exists yet, so the design gives it no destination: left plain */}
            {page.stage === "accepted" ? <Button arrow="up-right">Start a conversation</Button> : null}
            {page.stage === "notnow" ? <Button href={CC.discovery} arrow="up-right">Find other collaborators</Button> : null}
            <Button variant="secondary" href={profileHref(intro.to)}>View profile</Button>
            {page.stage === "pending" ? <Button variant="link" onClick={() => setAsking(true)} aria-haspopup="dialog">Withdraw request</Button> : null}
          </div>
        </div>
      </div>

      <Modal open={asking} onClose={() => setAsking(false)} width={640} className="cc-wd" eyebrow="Withdraw request" title="Withdraw your request?" description="The request is removed from their list. You can send a new request later."
        footer={<><Button onClick={withdraw}>Withdraw request</Button><Button variant="link" onClick={() => setAsking(false)}>Keep my request</Button></>} />
    </>
  );
}

function SkeletonRequestCard() {
  return (
    <div className="cc-sk-card" aria-hidden="true">
      <div className="cc-sk-card__top">
        <Skeleton width={56} height={56} radius={28} />
        <div className="cc-sk-card__text"><Skeleton width={200} height={22} radius={0} /><Skeleton width={140} height={12} radius={0} /></div>
      </div>
      <div className="cc-sk-row"><Skeleton width={120} height={36} radius={0} /><Skeleton width={140} height={36} radius={0} /><Skeleton width={110} height={36} radius={0} /></div>
      <hr className="cc-rule cc-sk-card__rule" />
      <div className="cc-sk-card__fields">
        <div className="cc-sk-field"><Skeleton width={110} height={10} radius={0} /><Skeleton width={240} height={16} radius={0} /></div>
        <div className="cc-sk-field cc-sk-field--grow"><Skeleton width={80} height={10} radius={0} /><Skeleton width="100%" height={16} radius={0} /></div>
      </div>
      <div className="cc-sk-row cc-sk-card__actions"><Skeleton width={81} height={36} radius={0} /><Skeleton width={89} height={36} radius={0} /></div>
    </div>
  );
}

/**
 * The request's Loading and Could not load frames, at their own addresses (state-loading, state-error).
 * Loading shows for 2.5 s and then the request; Try again goes back to Loading.
 */
export function RequestState({ id, initial }: { id: string; initial: "loading" | "error" }) {
  const router = useRouter();
  const [phase, setPhase] = useState(initial);
  useEffect(() => {
    if (phase !== "loading") return;
    const t = window.setTimeout(() => router.replace(requestHref(id)), LOADING_MS);
    return () => window.clearTimeout(t);
  }, [phase, id, router]);
  return (
    <div className="cc-page cc-req">
      <div className="cc-req__col">
        <Back href={CC.requests}>Back to introduction requests</Back>
        {phase === "loading" ? (
          <div className="cc-sk" aria-busy="true" aria-label="Loading your request">
            <div className="cc-sk-head" aria-hidden="true">
              <Skeleton className="cc-sk--head" width={220} height={28} radius={0} />
              <Skeleton className="cc-sk--head" width={440} height={16} radius={0} />
            </div>
            <SkeletonRequestCard />
            <SkeletonRequestCard />
          </div>
        ) : (
          <div role="alert">
            <CcEmpty title="We could not load this request." text="Check your connection and try again. Your note and your request are safe." textWidth={760}
              action={<div className="cc-actions cc-rq-err__actions"><Button onClick={() => setPhase("loading")}>Try again</Button><Button variant="secondary" href={CC.requests}>Back to requests</Button></div>} />
          </div>
        )}
      </div>
    </div>
  );
}
