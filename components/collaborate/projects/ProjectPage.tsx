"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Button from "@/components/kin/Button";
import { Modal } from "@/components/kin/Overlay";
import { toast } from "@/components/kin/Toast";
import { conversationSlots, useCollab } from "@/lib/collab/useCollab";
import { discoverProject, firstOf, fitOf, sentWhen, type DiscoverProject } from "@/lib/collab/projects";
import type { Application } from "@/lib/collab/types";
import { Back, Bar, GlancePanel, InterestPanel, Item, Match, PageState, PrivacyPanel, SaveButton, Section, SkelSection, SkelSide, StageLine, Status, Tags, TeamMemberRow, memberHref, pageStatus } from "./parts";

/*
 * A project's page, mirrored from the product design (classes in ../styles/projects.css): what the project is and
 * needs, its team, progress and way of working, and why it may fit you; beside it, Express interest or your interest
 * as it stands, at a glance and what you are seeing. The project is an open call; interest is an application.
 * A closed call (past its closing date) gets the design's closed page. Older links here to a project's workspace
 * go on to My Projects.
 */

const glance = (p: DiscoverProject) => [
  { label: "Stage", value: p.stage },
  { label: "Type", value: p.type },
  { label: "Team", value: `${p.teamCount} ${p.teamCount === 1 ? "person" : "people"}` },
  { label: "Commitment", value: p.commitment.replace(/\.$/, "") },
  { label: "Location", value: p.glanceLocation },
];

const PENDING = new Set(["submitted", "viewed", "shortlisted", "conversation"]);

export default function ProjectPage({ id }: { id: string }) {
  const collab = useCollab({ engine: true });
  const router = useRouter();
  const [withdrawing, setWithdrawing] = useState(false);
  const status = pageStatus(collab);
  const call = collab.call(id);
  const workspace = !call && collab.projects.some((p) => p.id === id);

  useEffect(() => {
    if (workspace) router.replace(`/collaborate/my-projects/${encodeURIComponent(id)}`);
  }, [workspace, id, router]);

  if (status === "loading" || workspace) return <LoadingProject />;
  if (status === "error" || !call) {
    return (
      <div className="dsc-page"><div className="dsc-stack">
        <Back href="/collaborate/discover">Back to discover projects</Back>
        <PageState pair role="alert" headline="We could not load this project." support="Check your connection and try again. Your saved projects are safe.">
          <Button onClick={() => window.location.reload()}>Try again</Button>
          <Button variant="secondary" href="/collaborate/discover">Back to discover projects</Button>
        </PageState>
      </div></div>
    );
  }

  const p = discoverProject(call, collab.projects);
  const saved = collab.state.saved.includes(p.id);
  const save = () => collab.toggleSave(p.id);
  const app = collab.appFor(p.id);
  const owner = firstOf(p.ownerId);

  if (p.closed && !app) {
    return (
      <div className="dsc-page"><div className="dsc-stack">
        <Back href="/collaborate/discover">Back to discover projects</Back>
        <div className="dsc-summary-head"><StageLine stage={p.stage} type={p.type} /><h1 className="dsc-h1 dsc-h1--detail">{p.title}</h1></div>
        <PageState pair headline="This project is not looking for people right now." support="The owner has paused new collaborators. You can save it and check back later, or look at other projects.">
          <Button href="/collaborate/discover">Back to discover projects</Button>
          <SaveButton saved={saved} onClick={save} full={false} />
        </PageState>
      </div></div>
    );
  }

  const withdraw = (a: Application) => {
    collab.withdraw(a.id);
    setWithdrawing(false);
    // Undo sends the same interest again.
    toast.show({ message: "Interest withdrawn.", actionLabel: "Undo", onAction: () => { void collab.apply({ callId: a.callId, role: a.role, works: a.works, links: a.links, files: a.files, statement: a.statement, availability: a.availability, materials: a.materials }); } });
  };
  const ownerMember = p.team[0];

  return (
    <div className="dsc-page">
      <div className="dsc-detail">
        <div className="dsc-detail__main">
          <Back href="/collaborate/discover">Back to discover projects</Back>
          <span className="dsc-spacer" style={{ height: 36 }} />
          <header className="dsc-project-head">
            <div className="dsc-project-head__info">
              <StageLine stage={p.stage} type={p.type} />
              <h1 className="dsc-h1 dsc-h1--detail" data-m="words">{p.title}</h1>
              <p className="dsc-project-head__owner">{ownerMember ? <Link href={memberHref(ownerMember.id, p.id)}>Led by {p.owner}, {p.place}</Link> : <>Led by {p.owner}, {p.place}</>}</p>
              <p className="dsc-project-head__intro">{p.intro}</p>
              <Tags tags={p.skillTags} label="Skills needed" />
            </div>
          </header>
          <Section title="About the project"><p className="dsc-body">{p.about}</p></Section>
          <Section title="What the project needs"><div className="dsc-items">{p.needs.map((n) => <Item key={n.title} title={n.title} detail={n.detail} />)}</div></Section>
          <Section title="The team so far"><div className="dsc-members">{p.team.map((m) => <TeamMemberRow key={m.id} initials={m.initials} name={m.name} role={m.role} href={memberHref(m.id, p.id)} />)}</div></Section>
          {p.progress.length ? <Section title="Progress so far"><div className="dsc-items">{p.progress.map((g) => <Item key={g.title} title={g.title} detail={g.detail} />)}</div></Section> : null}
          <Section title="Working together"><dl className="dsc-facts">{p.working.map((w) => <div key={w.label} className="dsc-fact"><dt>{w.label}</dt><dd>{w.value}</dd></div>)}</dl></Section>
          <Section title="Why this may fit you"><Match sentence={fitOf(p, saved)} /></Section>
        </div>
        <aside className="dsc-detail__side" aria-label="Project actions">
          {app ? <YourInterest app={app} owner={owner} saved={saved} onSave={save} onWithdraw={() => setWithdrawing(true)} /> : <InterestPanel interestHref={`/collaborate/projects/${encodeURIComponent(p.id)}/interest`} saved={saved} onSave={save} />}
          <GlancePanel rows={glance(p)} />
          <PrivacyPanel text="The project summary and what the owner chose to share. Private details stay private." />
        </aside>
      </div>
      <Modal open={withdrawing} onClose={() => setWithdrawing(false)} width={640} className="dsc-modal dsc-modal--withdraw" eyebrow="Withdraw interest" title="Withdraw your interest?" description={`${owner} will no longer see your request. You can send interest again later.`}
        footer={<div className="dsc-modal__actions dsc-modal__actions--wide">
          <Button onClick={() => app && withdraw(app)}>Withdraw interest</Button>
          <button type="button" className="dsc-link" onClick={() => setWithdrawing(false)}><span className="dsc-link__label">Keep my interest</span></button>
        </div>} />
    </div>
  );
}

/** Your interest as it stands: waiting, a time to talk, an offer, on the team, or not this time. */
function YourInterest({ app, owner, saved, onSave, onWithdraw }: { app: Application; owner: string; saved: boolean; onSave: () => void; onWithdraw: () => void }) {
  const collab = useCollab();
  const router = useRouter();
  const pending = PENDING.has(app.stage);
  return (
    <section className="dsc-panel-card dsc-panel-card--actions" aria-label="Your interest">
      <p className="dsc-eyebrow">Your interest</p>
      <div className="dsc-sent-status">
        {app.stage === "joined" ? <Status status="open" label="Joined" /> : app.stage === "not-selected" ? <Status status="closed" label="Not selected" /> : app.stage === "offer" ? <Status status="open" label="Offer" /> : <Status status="pending" />}
        <span>{sentWhen(app)}</span>
      </div>
      {app.stage === "shortlisted" && !app.slot ? (
        <>
          <p className="dsc-panel-card__note">{owner} shortlisted you. Pick a time for a 20-minute conversation.</p>
          {(app.slotsOffered?.length ? app.slotsOffered : conversationSlots()).map((s) => <Button key={s} variant="secondary" full onClick={() => collab.pickSlot(app.id, s)}>{s}</Button>)}
        </>
      ) : app.stage === "conversation" ? (
        <p className="dsc-panel-card__note">You are talking with {owner} on {app.slot}. You can withdraw your interest until they decide.</p>
      ) : app.stage === "offer" ? (
        <>
          <p className="dsc-panel-card__note">{owner} would like you on the team as {(app.offer?.role ?? app.role).toLowerCase()}{app.offer?.fee ? `, for ${app.offer.fee}` : ""}.</p>
          <Button full onClick={async () => { const pid = await collab.acceptOffer(app.id); if (pid) router.push(`/collaborate/my-projects/${pid}`); }}>Accept and join</Button>
          <Button variant="secondary" full onClick={() => collab.declineOffer(app.id)}>Decline</Button>
        </>
      ) : app.stage === "joined" ? (
        <>
          <p className="dsc-panel-card__note">You are on the team as {app.role.toLowerCase()}.</p>
          {app.projectId ? <Button href={`/collaborate/my-projects/${app.projectId}`} full>Open the project</Button> : null}
        </>
      ) : app.stage === "not-selected" ? (
        <p className="dsc-panel-card__note">{app.feedback ?? `${owner} chose other people this time.`}</p>
      ) : (
        <p className="dsc-panel-card__note">{owner} will reply here. You can withdraw your interest until they respond.</p>
      )}
      {pending ? <Button variant="secondary" full onClick={onWithdraw}>Withdraw interest</Button> : null}
      <SaveButton saved={saved} onClick={onSave} />
    </section>
  );
}

function LoadingProject() {
  return (
    <div className="dsc-page">
      <div className="dsc-detail" aria-busy="true" aria-label="Loading the project">
        <div className="dsc-detail__main" aria-hidden="true">
          <Bar w={170} h={14} />
          <span className="dsc-spacer" style={{ height: 36 }} />
          <div className="dsc-skel-header">
            <Bar w={220} h={12} /><Bar w={560} h={56} />
            <div className="dsc-skel-header__lead"><Bar w="93%" h={18} /><Bar w={600} h={18} /></div>
            <div className="dsc-skel-chips">{[0, 1, 2, 3].map((i) => <Bar key={i} w={110} h={36} r={999} />)}</div>
          </div>
          <SkelSection><Bar w={140} h={12} /><Bar w="100%" h={16} /><Bar w="100%" h={16} /><Bar w={640} h={16} /></SkelSection>
          <SkelSection><Bar w={140} h={12} />{[0, 1, 2].map((i) => <div key={i} className="dsc-skel-item"><Bar w={300} h={22} /><Bar w={440} h={14} /></div>)}</SkelSection>
          <SkelSection><Bar w={140} h={12} /><div className="dsc-skel-chips">{[0, 1, 2, 3].map((i) => <Bar key={i} w={120} h={36} r={999} />)}</div></SkelSection>
          <SkelSection><Bar w={140} h={12} />{[0, 1].map((i) => <div key={i} className="dsc-skel-member"><Bar w={44} h={44} r={22} /><div className="dsc-skel-member__text"><Bar w={140} h={14} /><Bar w={100} h={12} /></div></div>)}</SkelSection>
          <SkelSection><Bar w={140} h={12} />{[0, 1, 2, 3].map((i) => <div key={i} className="dsc-skel-row"><Bar w={208} h={14} /><Bar w={400} h={16} /></div>)}</SkelSection>
        </div>
        <SkelSide rows />
      </div>
    </div>
  );
}
