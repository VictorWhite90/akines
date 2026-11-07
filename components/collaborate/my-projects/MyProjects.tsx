"use client";

import Link from "next/link";
import { useCallback, useRef, useState } from "react";
import Button from "@/components/kin/Button";
import { Empty, Modal, Skeleton } from "@/components/kin/Overlay";
import { toast } from "@/components/kin/Toast";
import { BackLink, CwLink, Dot, IconArrow, Initials, Over } from "@/components/collaborate/workspace/parts";
import { DRAFT_STEPS, draftStep, editedAgo, useDrafts, type ProjectDraft } from "@/lib/collab/drafts";
import { ME } from "@/lib/collab/me";
import type { Project } from "@/lib/collab/types";
import { useCollab } from "@/lib/collab/useCollab";
import { isMine, membersOf, phaseOf } from "@/lib/collab/workspace";
import { activeAgo, cardHref, currentMilestone, progressOf, ProjectProbes, type ProjectSummary } from "./summary";
import "../styles/pages.css";

/*
 * My Projects, mirrored from the product design (cw-page, cw-tabs, cw-pc and cw-dc in ../styles/pages.css):
 * the projects the member hosts or belongs to, and the Start a project builders they haven't finished (drafts).
 * Loading, empty and error are the page's real states: while the projects load, when there are none, and when
 * the backend couldn't send them.
 */

type Tab = "active" | "drafts";
const TABS: Tab[] = ["active", "drafts"];

function Progress({ text, on }: { text: string; on: number }) {
  return (
    <div className="cw-prog">
      <div className="cw-prog__row"><Over className="cw-over--12">PROGRESS</Over><span className="cw-prog__text">{text}</span></div>
      <div className="cw-prog__bar" role="img" aria-label={text}>{[0, 1, 2, 3, 4].map((i) => <i key={i} data-on={i < on ? "true" : "false"} />)}</div>
    </div>
  );
}

function ProjectCard({ p, s }: { p: Project; s?: ProjectSummary }) {
  const prog = progressOf(p);
  const members = membersOf(p);
  return (
    <Link href={cardHref(p)} className="cw-pc">
      <div className="cw-pc__top">
        <span className="cw-pc__stage"><Dot />{phaseOf(p)}</span>
        <span className="cw-pc__act">{p.host === ME ? "Owner" : "Team member"}. Active {activeAgo(s?.lastAt ?? p.createdAt)}</span>
      </div>
      <div className="cw-pc__title"><h2>{p.title}</h2><p>{p.summary}</p></div>
      <hr className="cw-pc__rule" />
      <dl className="cw-pc__details">
        <div><dt className="cw-over cw-over--12">CURRENT MILESTONE</dt><dd>{currentMilestone(p)}</dd></div>
        {s?.next ? <div><dt className="cw-over cw-over--12">NEXT ACTION</dt><dd>{s.next}</dd></div> : null}
      </dl>
      <Progress text={prog.label} on={prog.bars} />
      <div className="cw-pc__foot">
        <div className="cw-pc__team">
          <span className="cw-avs" aria-hidden>{members.slice(0, 3).map((m) => <Initials key={m.id} initials={m.initials} />)}</span>
          <span>{members.length} {members.length === 1 ? "member" : "members"}</span>
        </div>
        <span className="cw-pc__open">Open project<IconArrow /></span>
      </div>
    </Link>
  );
}

function DraftCard({ d, onDelete }: { d: ProjectDraft; onDelete: (d: ProjectDraft) => void }) {
  const step = draftStep(d.at);
  return (
    <article className="cw-dc">
      <div className="cw-dc__top">
        <span className="cw-dc__state"><Dot tone="gray" />DRAFT</span>
        <span className="cw-dc__edited">{editedAgo(d.updatedAt)}</span>
      </div>
      <div className="cw-dc__title"><h2>{d.title}</h2><p>{d.description}</p></div>
      <hr className="cw-pc__rule" />
      <Progress text={`Step ${step} of ${DRAFT_STEPS}`} on={step} />
      <div className="cw-dc__foot">
        <CwLink href={`/collaborate/start?draft=${encodeURIComponent(d.id)}`} arrow>Continue draft</CwLink>
        <CwLink onClick={() => onDelete(d)}>Delete draft</CwLink>
      </div>
    </article>
  );
}

function CardSkeleton() {
  const k = (width: number, height: number, round?: boolean) => <Skeleton width={width} height={height} radius={0} style={round ? { borderRadius: "50%" } : undefined} />;
  return (
    <div className="cw-sk" aria-hidden>
      {k(150, 12)}
      <div className="cw-sk__group">{k(300, 28)}{k(379, 14)}{k(260, 14)}</div>
      <hr className="cw-sk__rule" />
      <div className="cw-sk__group cw-sk__group--8">{k(91, 10)}{k(379, 16)}{k(220, 16)}</div>
      <div className="cw-sk__group cw-sk__group--8">{k(105, 10)}<div className="cw-sk__row">{k(28, 28, true)}{k(70, 14)}</div></div>
      <div className="cw-sk__group cw-sk__group--8">{k(94, 10)}{k(300, 16)}</div>
      <div className="cw-sk__group cw-sk__group--8">{k(115, 10)}{k(140, 16)}</div>
      {k(110, 16)}
    </div>
  );
}

function Tabs({ tab, onTab, count }: { tab: Tab; onTab: (t: Tab) => void; count?: string }) {
  const refs = useRef<Record<Tab, HTMLButtonElement | null>>({ active: null, drafts: null });
  return (
    <div className="cw-tabs" data-m="up">
      <div className="cw-tabs__list" role="tablist" aria-label="My projects" onKeyDown={(e) => {
        if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
        e.preventDefault();
        const next = TABS[(TABS.indexOf(tab) + (e.key === "ArrowRight" ? 1 : -1) + TABS.length) % TABS.length];
        onTab(next); refs.current[next]?.focus();
      }}>
        {TABS.map((t) => (
          <button key={t} ref={(el) => { refs.current[t] = el; }} type="button" role="tab" id={`cw-tab-${t}`} aria-selected={tab === t} aria-controls="cw-tabpanel" tabIndex={tab === t ? 0 : -1} className="cw-tab" onClick={() => onTab(t)}>
            <span className="cw-tab__label">{t === "active" ? "Active" : "Drafts"}</span><span className="cw-tab__rule" />
          </button>
        ))}
      </div>
      {count ? <span className="cw-tabs__count">{count}</span> : null}
    </div>
  );
}

export default function MyProjects({ initialTab = "active" }: { initialTab?: Tab }) {
  const collab = useCollab({ engine: true });
  const drafts = useDrafts();
  const [tab, setTab] = useState<Tab>(initialTab);
  const [deleting, setDeleting] = useState<ProjectDraft | null>(null);
  // The dialog keeps the title while it closes.
  const [lastTitle, setLastTitle] = useState("");
  const askDelete = (d: ProjectDraft) => { setDeleting(d); setLastTitle(d.title); };
  const [sums, setSums] = useState<Record<string, ProjectSummary>>({});
  const onSummary = useCallback((s: ProjectSummary) => setSums((cur) => ({ ...cur, [s.id]: s })), []);

  const mine = collab.projects.filter(isMine);
  const ready = collab.ready && drafts.ready;
  const state = !ready ? "loading" : collab.notice && !mine.length ? "error" : "list";

  const confirmDelete = () => {
    if (!deleting) return;
    const gone = drafts.remove(deleting.id);
    setDeleting(null);
    if (gone) toast.show({ message: "Draft deleted.", actionLabel: "Undo", duration: 2500, onAction: () => { drafts.restore(gone.draft, gone.index); setTab("drafts"); } });
  };

  if (state === "error") {
    return (
      <div className="cw-page cw-page--state">
        <div data-m="up"><BackLink href="/collaborate">Back to Collaborate</BackLink></div>
        <div data-m="up">
          <Empty className="cw-empty" title="We could not load your projects." text="Check your connection and try again. Your drafts are safe." action={<Button onClick={() => window.location.reload()}>Try again</Button>} />
        </div>
      </div>
    );
  }

  const empty = state === "list" && tab === "active" && !mine.length;
  const count = state !== "list" || empty ? undefined : tab === "active" ? `${mine.length} ${mine.length === 1 ? "project" : "projects"}` : `${drafts.drafts.length} ${drafts.drafts.length === 1 ? "draft" : "drafts"}`;
  return (
    <div className="cw-page">
      <ProjectProbes projects={mine} onChange={onSummary} />
      <header className="cw-head" data-m="up">
        <div className="cw-head__copy">
          <Over>MY PROJECTS</Over>
          <h1 className="cw-h1">Your projects.</h1>
          <p className="cw-lead">The projects you started and the ones you have joined.</p>
        </div>
        <Button href="/collaborate/start" arrow="right">Start a project</Button>
      </header>
      <Tabs tab={state === "list" ? tab : "active"} onTab={(t) => { if (state === "list") setTab(t); }} count={count} />
      <div id="cw-tabpanel" role="tabpanel" aria-labelledby={`cw-tab-${tab}`} aria-busy={state === "loading"} className="cw-panel">
        {state === "loading" ? <div className="cw-grid" role="status" aria-label="Loading your projects"><CardSkeleton /><CardSkeleton /></div> : null}
        {empty ? (
          <div className="cw-panel__empty" data-m="up">
            <Empty className="cw-empty" title="You have no projects yet." text="Start a project of your own, or find one to join. Your projects will appear here." action={<Button href="/collaborate/start" arrow="right">Start a project</Button>} />
            <CwLink href="/collaborate/discover" arrow>Discover projects</CwLink>
          </div>
        ) : null}
        {state === "list" && tab === "active" && mine.length ? <div className="cw-grid" data-m="stagger">{mine.map((p) => <ProjectCard key={p.id} p={p} s={sums[p.id]} />)}</div> : null}
        {state === "list" && tab === "drafts" ? (
          drafts.drafts.length
            ? <div className="cw-grid" data-m="stagger">{drafts.drafts.map((d) => <DraftCard key={d.id} d={d} onDelete={askDelete} />)}</div>
            : <Empty className="cw-empty" title="You have no drafts." text="A project you save for later will wait here." action={<Button href="/collaborate/start" arrow="right">Start a project</Button>} />
        ) : null}
      </div>
      <Modal open={!!deleting} onClose={() => setDeleting(null)} width={640} eyebrow="DELETE DRAFT" title="Delete this draft?"
        description={`${lastTitle} and the answers you saved will be removed. This cannot be undone.`}
        footer={<><Button onClick={confirmDelete}>Delete draft</Button><CwLink onClick={() => setDeleting(null)}>Keep draft</CwLink></>} />
    </div>
  );
}
