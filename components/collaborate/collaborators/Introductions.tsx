"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/kin/Button";
import { toast } from "@/components/kin/Toast";
import { faceSrc } from "@/components/kin/home/parts";
import { DsLink } from "@/components/collaborate/projects/parts";
import { Dot } from "@/components/collaborate/workspace/parts";
import { EmptyPanel, ListPage, SkeletonRequest } from "@/components/collaborate/overview-lists/parts";
import { useFirstVisit } from "@/components/collaborate/overview-lists/loading";
import { LOADING_COUNT, countOf } from "@/components/collaborate/overview-lists/data";
import { CC, profileHref, pronounOf, receivedOn, useIncomingIntroductions, type IncomingIntroduction } from "@/lib/collab/collaborators";
import { skillsOf } from "@/lib/collab/team";
import { workspaceHref } from "@/lib/collab/workspace";
import { PEOPLE } from "@/lib/data/people";

/*
 * Introduction requests: people who asked to be introduced to you, mirrored from the product design (12.49,
 * overview-lists/Lists.tsx; the card is the Team page's Interest Request, pt-req, with ol-req on top). Accept
 * and Not now answer for real (lib/collab/collaborators) and show the answer in place with a toast; Undo
 * returns to the request. The list shows its Loading frame the first time it is opened in a visit. `variant`
 * is a review address: Accepted and Not now show the first request answered (nothing is saved), Empty and
 * Loading their frames.
 */

const PAGE = {
  eyebrow: "COLLABORATOR INTRODUCTIONS",
  title: "Introduction requests.",
  lead: "People who asked to be introduced to you. You decide whether to connect.",
  tab: "Waiting for you",
  empty: { headline: "No introduction requests yet.", support: "When someone asks to be introduced to you, their note will appear here.", action: "Explore collaborators", href: CC.entry },
};
const nameOf = (r: IncomingIntroduction) => PEOPLE[r.from]?.name ?? "Someone";
const LINES = {
  accepted: (r: IncomingIntroduction) => ({ line: `You and ${nameOf(r)} are now connected.`, toast: `Introduction accepted. You and ${nameOf(r)} are connected.` }),
  notnow: (r: IncomingIntroduction) => {
    const subj = { he: "He", she: "She", they: "They" }[pronounOf(r.from)];
    return { line: `Response sent to ${nameOf(r)}. ${subj} will see that you are not available to connect right now.`, toast: `Response sent. ${nameOf(r)} will see it shortly.` };
  },
};
/** The toasts of the review addresses stay longer so they can be looked at. */
const STATE_TOAST_MS = 8000;

type Variant = "accepted" | "not-now" | "empty" | "loading";
type Answer = { id: string; status: "accepted" | "notnow" };

function RequestCard({ r, onAccept, onNotNow }: { r: IncomingIntroduction; onAccept: () => void; onNotNow: () => void }) {
  const name = nameOf(r);
  const photo = faceSrc(r.from, 112);
  const skills = skillsOf(r.from);
  return (
    <article className="pt-req ol-req" aria-label={`Introduction request from ${name}`}>
      <div className="pt-req__top">
        <div className="pt-req__person">
          {/* eslint-disable-next-line @next/next/no-img-element -- their face */}
          <span className="pt-photo" style={{ "--pt-ph": "56px" } as React.CSSProperties} aria-hidden>{photo ? <img src={photo} alt="" width={56} height={56} loading="lazy" decoding="async" /> : null}</span>
          <div className="pt-req__text"><h3 className="pt-req__name">{name}</h3><p className="pt-req__role">{PEOPLE[r.from]?.role}</p></div>
        </div>
        <p className="pt-req__sent">{receivedOn(r.receivedAt)}</p>
      </div>
      {/* a skill tag has no destination in the design: it reacts to hover and press only */}
      {skills.length ? <ul className="pt-skills" aria-label="Skills">{skills.map((s) => <li key={s}><button type="button" className="pt-skill">{s}</button></li>)}</ul> : null}
      <div className="pt-rule" aria-hidden />
      <div className="pt-req__fields ol-req__fields">
        <div className="pt-req__field ol-req__purpose"><p className="cw-over cw-over--12">Shared purpose</p><p className="pt-req__value">{r.purpose}</p></div>
        <div className="pt-req__field pt-req__field--grow"><p className="cw-over cw-over--12">Their note</p><p className="pt-req__value pt-req__value--msg">{r.note}</p></div>
      </div>
      <div className="pt-req__actions">
        <Button size="sm" onClick={onAccept}>Accept</Button>
        <Button size="sm" variant="secondary" onClick={onNotNow}>Not now</Button>
        <DsLink href={profileHref(r.from)}>View profile</DsLink>
      </div>
    </article>
  );
}

export default function Introductions({ variant }: { variant?: Variant }) {
  const router = useRouter();
  const intros = useIncomingIntroductions();
  const first = useFirstVisit("ol-introductions", { stateRoute: variant === "loading", skip: !!variant, onDone: () => router.replace(CC.introductions) });
  const loading = first || (variant !== "empty" && !intros.ready);
  // the review addresses answer the first request on screen only; a real answer is kept with its request
  const shown: Answer | null = variant === "accepted" || variant === "not-now" ? (intros.list[0] ? { id: intros.list[0].id, status: variant === "accepted" ? "accepted" : "notnow" } : null) : null;
  const [answered, setAnswered] = useState<Answer | null>(null);
  const answer = shown ?? answered;
  const answeredReq = answer ? intros.list.find((x) => x.id === answer.id) ?? null : null;
  const waiting = variant ? (variant === "empty" ? [] : intros.waiting.filter((x) => x.id !== shown?.id)) : intros.waiting;

  // the review addresses: the page with its toast already showing; Undo goes back to the request
  const stateRow = shown ? intros.list.find((x) => x.id === shown.id) : undefined;
  useEffect(() => {
    if (!shown || !stateRow || loading) return;
    toast.show({ message: LINES[shown.status](stateRow).toast, actionLabel: "Undo", duration: STATE_TOAST_MS, onAction: () => router.push(CC.introductions) });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once, when the review frame shows
  }, [variant, stateRow?.id, loading]);

  const respond = (r: IncomingIntroduction, status: Answer["status"]) => {
    const undo = status === "accepted" ? intros.accept(r.id) : intros.notNow(r.id);
    setAnswered({ id: r.id, status });
    toast.show({ message: LINES[status](r).toast, actionLabel: "Undo", onAction: () => { undo(); setAnswered(null); } });
  };

  let body: React.ReactNode;
  if (loading) body = <SkeletonRequest />;
  else if (!waiting.length && !answeredReq) body = <EmptyPanel {...PAGE.empty} />;
  else body = (
    <>
      {answer && answeredReq ? (
        <>
          <div className="ol-narrow"><p className="pt-confirm"><Dot tone="green" size={8} /><span>{LINES[answer.status](answeredReq).line}</span></p></div>
          <div className="ol-next">
            {answer.status === "accepted" ? (
              <>
                {/* the conversation starts in the project's Conversations, as the design's New conversation modal does */}
                {answeredReq.projectId ? <Button arrow="up-right" href={workspaceHref(answeredReq.projectId, "conversations")}>Start a conversation</Button> : <Button arrow="up-right">Start a conversation</Button>}
                <DsLink href={profileHref(answeredReq.from)}>View profile</DsLink>
              </>
            ) : (
              <DsLink onClick={() => { if (shown) router.push(CC.introductions); else { intros.reopen(answeredReq.id); setAnswered(null); } }}>Undo</DsLink>
            )}
          </div>
        </>
      ) : null}
      {waiting.map((r) => <RequestCard key={r.id} r={r} onAccept={() => respond(r, "accepted")} onNotNow={() => respond(r, "notnow")} />)}
    </>
  );

  return (
    <ListPage eyebrow={PAGE.eyebrow} title={PAGE.title} lead={PAGE.lead} tab={PAGE.tab} count={loading ? LOADING_COUNT : countOf(waiting.length, "introduction", "introductions")} busy={loading}>
      {body}
    </ListPage>
  );
}
