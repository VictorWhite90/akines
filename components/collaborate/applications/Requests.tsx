"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Button from "@/components/kin/Button";
import { Chip } from "@/components/kin/Chip";
import { Modal } from "@/components/kin/Overlay";
import { toast } from "@/components/kin/Toast";
import { conversationSlots, useCollab } from "@/lib/collab/useCollab";
import { discoverProject, firstOf, type DiscoverProject } from "@/lib/collab/projects";
import type { Application } from "@/lib/collab/types";
import { Back, DsLink, PageState, pageStatus } from "../projects/parts";
import { DetailSkeleton, WithdrawInterestModal } from "../projects/ProjectPage";
import { TAB_TITLE, dayLabel, lowerFirst, offerSteps, parseSlot, pendingSteps, sentOn, shortlistedSteps, slotDays, slotFull, stageAt, stageOf, talkSteps, type Stage } from "./data";
import { DISCOVER_PATH, HOME_PATH, MY_PROJECTS_PATH, projectPath, requestHref, type RequestView } from "./paths";
import { EndState, NextSteps, OfferCard, RequestHead, RequestLayout, RequestSummary, SlotPicker, TalkCard, withdrawWithUndo } from "./parts";
import { ApplicationTimeline } from "./shared";

/*
 * Your request, mirrored from the product design (12.44 APPLICATION STATUS): what you see after "Interest sent".
 * The request is your Application on the open call; it moves through Pending, Shortlisted, Pick a time, Talk booked
 * and Offer received, and ends as Joined, Offer declined, Not selected or Withdrawn. The base address shows the stage
 * the application is at (live, so the host's answer shows as it comes); each tail opens one stage's page.
 */

const LOADING_MS = 2500;
type Collab = ReturnType<typeof useCollab>;
type Ctx = { collab: Collab; p: DiscoverProject; app: Application; host: string; leave: (href: string) => void };

/** Sets the browser tab title after the route has set its own. */
function useTabTitle(title: string | null) {
  useEffect(() => {
    if (!title) return;
    const t = window.setTimeout(() => { document.title = `${title} · Akines`; }, 0);
    return () => window.clearTimeout(t);
  }, [title]);
}

const offeredSlots = (a: Application) => (a.slotsOffered?.length ? a.slotsOffered : conversationSlots());

/* ------------------------------------------------------------------ Pending */

function PendingPage({ collab, p, app, host, leave }: Ctx) {
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const sent = sentOn(app);
  return (
    <>
      <RequestLayout
        back={{ href: projectPath(p.id), label: "Back to project" }}
        head={<RequestHead title="Your request" lead={`Sent ${sent}. ${host} has not replied yet. You will see the answer here.`} />}
        side={
          <>
            <NextSteps title="What happens next" lines={[`${host} reads your note and your profile.`, "If they would like to talk, they shortlist you and you pick a time.", "You hear back here, so there is nothing to chase."]} />
            <DsLink onClick={() => setWithdrawOpen(true)}>Withdraw interest</DsLink>
          </>
        }
      >
        <div className="apl-stack">
          <RequestSummary project={p} app={app} sent={sent} status="Pending" />
          <ApplicationTimeline steps={pendingSteps(app, host)} />
        </div>
      </RequestLayout>
      {/* the project page's Withdraw interest modal; it leads to the project with the Interest withdrawn toast */}
      <WithdrawInterestModal open={withdrawOpen} onClose={() => setWithdrawOpen(false)} owner={host} onWithdraw={() => {
        setWithdrawOpen(false);
        leave(projectPath(p.id));
        withdrawWithUndo(collab, app);
      }} />
    </>
  );
}

/* ------------------------------------------------------------------ Shortlisted */

function ShortlistedPage({ p, app, host }: Ctx) {
  return (
    <RequestLayout
      back={{ href: projectPath(p.id), label: "Back to project" }}
      head={<RequestHead title={`${p.owner} shortlisted you.`} lead="They would like to talk before deciding. It is a 20 minute video call, and you choose the time." />}
      side={<NextSteps title="What happens next" lines={["Pick a time that suits you.", `Talk with ${host} for 20 minutes on a video call.`, "They may then send you an offer. Nothing is agreed until you accept."]} />}
    >
      <div className="apl-actions">
        <Button href={requestHref(p.id, "time")}>Pick a time to talk</Button>
      </div>
      <p className="apl-note">{host} shortlisted you on {dayLabel(stageAt(app, "shortlisted"))}. Choose a time that suits you.</p>
      <div className="apl-stack">
        <RequestSummary project={p} app={app} sent={sentOn(app)} status="Shortlisted" />
        <ApplicationTimeline steps={shortlistedSteps(app)} />
      </div>
    </RequestLayout>
  );
}

/* ------------------------------------------------------------------ Pick a time and Slot chosen */

function PickTimePage({ collab, p, app, host, leave }: Ctx) {
  const slots = offeredSlots(app);
  // Change time comes back here with the booked time chosen.
  const booked = app.slot && slots.includes(app.slot) ? app.slot : null;
  const [day, setDay] = useState(() => (booked ? slotDays([booked])[0].key : slotDays(slots)[0]?.key ?? ""));
  const [slot, setSlot] = useState<string | null>(booked);
  const confirm = () => {
    if (!slot) return;
    collab.pickSlot(app.id, slot);
    toast.show({ message: `Time booked with ${host}.` });
    leave(requestHref(p.id, "talk"));
  };
  return (
    <RequestLayout
      back={{ href: requestHref(p.id), label: "Back to your request" }}
      head={<RequestHead title="Pick a time to talk." lead={`${host} shared these times. It is a 20 minute video call. Times are shown in WAT, Lagos time.`} />}
      side={<NextSteps title="About the talk" lines={["20 minutes, on a video call.", `${host} sees the time you choose.`, "You can change the time later if something comes up."]} />}
    >
      <div className="apl-stack">
        <SlotPicker host={host} slots={slots} day={day} slot={slot} onDay={(d) => { setDay(d); setSlot(null); }} onSlot={setSlot} onConfirm={confirm} />
      </div>
    </RequestLayout>
  );
}

/* ------------------------------------------------------------------ Talk booked */

function TalkBookedPage({ p, app, host }: Ctx) {
  const slot = parseSlot(app.slot ?? offeredSlots(app)[0]);
  return (
    <RequestLayout
      back={{ href: projectPath(p.id), label: "Back to project" }}
      head={<RequestHead title="Your talk is booked." lead={`${slotFull(slot)}. ${host} has been told, and you can change the time if something comes up.`} />}
      side={<NextSteps title="After the talk" lines={[`${host} decides whether to send you an offer.`, "If they do, you will see it here and can take your time.", "You do not have to accept. Nothing is agreed until you do."]} />}
    >
      <div className="apl-actions">
        {/* plain in the design: the call link, calendar and message have no destination yet */}
        <Button arrow="up-right">Open call link</Button>
        <DsLink>Add to calendar</DsLink>
        <DsLink href={requestHref(p.id, "time")}>Change time</DsLink>
        <DsLink>Message {host}</DsLink>
      </div>
      <div className="apl-stack">
        <TalkCard slot={slot} host={host} hostName={p.owner} />
        <ApplicationTimeline steps={talkSteps(app, slot)} />
      </div>
    </RequestLayout>
  );
}

/* ------------------------------------------------------------------ Offer received with its two modals */

const DECLINE_REASONS = ["The timing does not work", "It is not the right fit", "I joined another project", "I would rather not say"];

/** What the offer says: from the offer itself, else the call it answers. */
const offerOf = (p: DiscoverProject, a: Application) => ({
  role: a.offer?.role ?? a.role,
  fee: a.offer?.fee ?? p.call.fee,
  start: a.offer?.start ?? p.call.timeline[p.call.timeline.length - 2]?.when,
});

function OfferPage({ collab, p, app, host, leave }: Ctx) {
  const { role, fee, start } = offerOf(p, app);
  const [acceptOpen, setAcceptOpen] = useState(false);
  const [declineOpen, setDeclineOpen] = useState(false);
  // the reason is optional and only the host sees it, so it is not shown anywhere on this side
  const [reason, setReason] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const accept = async () => {
    setBusy(true);
    await collab.acceptOffer(app.id);
    setAcceptOpen(false);
    toast.show({ message: `You joined ${p.title}.` });
    leave(requestHref(p.id, "joined"));
  };
  const decline = () => {
    setDeclineOpen(false);
    leave(requestHref(p.id, "declined"));
    collab.declineOffer(app.id);
  };
  const closeDecline = () => { setDeclineOpen(false); setReason(null); };
  const slot = app.slot ? parseSlot(app.slot) : null;
  return (
    <>
      <RequestLayout
        back={{ href: projectPath(p.id), label: "Back to project" }}
        head={<RequestHead title={`${host} sent you an offer.`} lead="Read it through and reply when you are ready. Nothing is agreed until you accept." />}
        side={<NextSteps title="If you accept" lines={[`You join ${p.title} as ${role}.`, start ? `You start on ${start}.` : "You agree a start date together.", "You can see the team, tasks and files straight away."]} />}
      >
        <div className="apl-stack">
          <OfferCard project={p} role={role} fee={fee} start={start} sent={dayLabel(stageAt(app, "offer"))} note={app.stage === "offer" ? app.feedback : undefined} />
          <div className="apl-offer-actions">
            <Button onClick={() => setAcceptOpen(true)}>Accept offer</Button>
            <Button variant="secondary" onClick={() => setDeclineOpen(true)}>Decline offer</Button>
            {/* plain in the design */}
            <DsLink>Ask a question</DsLink>
            {/* the agreement is written once the team exists, so there is none to open before you accept */}
            <DsLink>See the working agreement</DsLink>
          </div>
          <ApplicationTimeline steps={offerSteps(app, slot)} />
        </div>
      </RequestLayout>

      <Modal open={acceptOpen} onClose={() => setAcceptOpen(false)} width={640} className="dsc-modal" eyebrow="Accept offer" title={`Join ${p.title} as ${role}?`}
        description={`${start ? `You start on ${start}${fee ? `, ${fee}` : ""}. ` : ""}${host} will be told right away.`}
        footer={<div className="dsc-modal__actions dsc-modal__actions--wide">
          <Button onClick={() => { void accept(); }} loading={busy}>Accept and join</Button>
          <DsLink onClick={() => setAcceptOpen(false)}>Not yet</DsLink>
        </div>} />

      <Modal open={declineOpen} onClose={closeDecline} width={640} className="dsc-modal" eyebrow="Decline offer" title="Decline this offer?"
        description={`${host} will be told. You can add a reason if you like. It is optional and only ${host} sees it.`}
        footer={<div className="dsc-modal__actions dsc-modal__actions--wide">
          <Button onClick={decline}>Decline offer</Button>
          <DsLink onClick={closeDecline}>Keep the offer</DsLink>
        </div>}>
        <div className="apl-reasons" role="group" aria-label="Reason (optional)">
          {DECLINE_REASONS.map((r) => <Chip key={r} variant="choice" selected={reason === r} onClick={() => setReason(reason === r ? null : r)}>{r}</Chip>)}
        </div>
      </Modal>
    </>
  );
}

/* ------------------------------------------------------------------ end states */

const metaOf = (a: Application) => `${a.role}${a.availability ? `, ${lowerFirst(a.availability)}` : ""}`;

function JoinedPage({ p, app, host }: Ctx) {
  const { start } = offerOf(p, app);
  return (
    <EndState project={p} eyebrow="You are on the team" title="You are on the team." lead={`Welcome to ${p.title}. ${host} has been told${start ? `, and your first day is ${start}` : ""}.`}
      meta={metaOf(app)} status="Joined" note="What you can do now: say hello to the team, see your first tasks and read the working agreement.">
      <Button href={app.projectId ? `${MY_PROJECTS_PATH}/${encodeURIComponent(app.projectId)}` : MY_PROJECTS_PATH} arrow="up-right">Open project</Button>
      <Button variant="secondary" href={HOME_PATH}>Back to Collaborate</Button>
    </EndState>
  );
}

function DeclinedPage({ p, app, host }: Ctx) {
  return (
    <EndState project={p} eyebrow="Offer declined" title="You declined the offer." lead={`${host} has been told. There is nothing more to do here, and you can look for other projects whenever you like.`}
      meta={metaOf(app)} status="Declined" note={`You declined on ${dayLabel(stageAt(app, "withdrawn"))}. If you added a reason, only ${host} can see it.`}>
      <Button href={DISCOVER_PATH} arrow="up-right">Find more projects</Button>
      <Button variant="secondary" href={HOME_PATH}>Back to Collaborate</Button>
    </EndState>
  );
}

function NotSelectedPage({ p, app, host }: Ctx) {
  return (
    <EndState project={p} eyebrow="Not selected this time" title={`${host} chose other collaborators this time.`} lead="This says little about your work. Other projects are looking for people with your skills."
      meta={metaOf(app)} status="Not selected" note={(app.stage === "not-selected" && app.feedback) || `${host} has made a choice for now. Your request stays in your history.`}>
      <Button href={DISCOVER_PATH} arrow="up-right">Find more projects</Button>
      <Button variant="secondary" href={HOME_PATH}>Back to Collaborate</Button>
    </EndState>
  );
}

function WithdrawnPage({ p, app, host }: Ctx) {
  return (
    <EndState project={p} eyebrow="Interest withdrawn" title="You withdrew your interest." lead={`${host} has been told. You can send interest again at any time.`}
      meta={metaOf(app)} status="Withdrawn" note={`Withdrawn ${dayLabel(stageAt(app, "withdrawn"))}. Nothing else is needed from you.`}>
      <Button href={projectPath(p.id)} arrow="up-right">Back to project</Button>
      <Button variant="secondary" href={DISCOVER_PATH}>Find more projects</Button>
    </EndState>
  );
}

const PAGES: Record<Stage, (c: Ctx) => React.ReactNode> = {
  pending: PendingPage, shortlisted: ShortlistedPage, talk: TalkBookedPage, offer: OfferPage,
  joined: JoinedPage, declined: DeclinedPage, "not-selected": NotSelectedPage, withdrawn: WithdrawnPage,
};

/* ------------------------------------------------------------------ states */

/** Could not load: Try again shows Loading, then the request. */
function ErrorState({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (!loading) return;
    const t = window.setTimeout(() => router.replace(requestHref(id)), LOADING_MS);
    return () => window.clearTimeout(t);
  }, [loading, id, router]);
  if (loading) return <DetailSkeleton label="Loading your request" />;
  return (
    <div className="dsc-page"><div className="dsc-stack">
      <Back href={projectPath(id)}>Back to project</Back>
      <PageState pair role="alert" headline="We could not load your request." support="Check your connection and try again. Your request is safe.">
        <Button onClick={() => setLoading(true)}>Try again</Button>
        <Button variant="secondary" href={projectPath(id)}>Back to project</Button>
      </PageState>
    </div></div>
  );
}

/** The Loading frame at its own address, then the request. */
function LoadingState({ id }: { id: string }) {
  const router = useRouter();
  useEffect(() => {
    const t = window.setTimeout(() => router.replace(requestHref(id)), LOADING_MS);
    return () => window.clearTimeout(t);
  }, [id, router]);
  return <DetailSkeleton label="Loading your request" />;
}

/* ------------------------------------------------------------------ route */

export default function RequestPage({ id, view }: { id: string; view?: RequestView }) {
  const collab = useCollab({ engine: true });
  const router = useRouter();
  const status = pageStatus(collab);
  const call = collab.call(id);
  // Your newest request on this call; a withdrawn one still has its page.
  const mine = collab.myApps.filter((a) => a.callId === id);
  const app = mine.find((a) => a.stage !== "withdrawn") ?? mine[0];
  // A page that sends you on keeps showing while the next one opens, rather than flashing the stage it just changed.
  const [held, setHeld] = useState<Stage | null>(null);
  const live = app ? stageOf(app) : null;
  const stage: Stage | null = view && view !== "time" && !view.startsWith("state-") ? (view as Stage) : held ?? live;
  const missing = status === "ready" && !!call && !app && !view?.startsWith("state-");
  const host = call ? firstOf(call.host) : "";

  useEffect(() => {
    // No request on this call: its project page is where you send one.
    if (missing) router.replace(projectPath(id));
  }, [missing, id, router]);
  useTabTitle(status === "ready" && app && !view?.startsWith("state-") ? (view === "time" ? "Pick a time" : stage === "offer" ? `Offer from ${host}` : stage ? TAB_TITLE[stage] : null) : null);

  if (view === "state-loading") return <LoadingState id={id} />;
  if (view === "state-error") return <ErrorState id={id} />;
  if (status === "loading" || missing) return <DetailSkeleton label="Loading your request" />;
  if (status === "error" || !call || !app || !stage) return <ErrorState id={id} />;

  const ctx: Ctx = { collab, p: discoverProject(call, collab.projects), app, host, leave: (href) => { setHeld(stage); router.push(href); } };
  if (view === "time") return <PickTimePage {...ctx} />;
  const Page = PAGES[stage];
  return <Page {...ctx} />;
}
