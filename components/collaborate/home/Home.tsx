"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { ArrowRight } from "lucide-react";
import Button from "@/components/kin/Button";
import { toast } from "@/components/kin/Toast";
import Overlays, { type OverlayKind } from "@/components/collaborate/collaborators/Overlays";
import { photoOf } from "@/components/collaborate/collaborators/parts";
import { ago } from "@/components/collaborate/workspace/parts";
import { SkeletonCard, Bar } from "@/components/collaborate/projects/parts";
import { OL } from "@/components/collaborate/overview-lists/data";
import { useFirstVisit } from "@/components/collaborate/overview-lists/loading";
import { useOverview } from "@/components/collaborate/overview-lists/probe";
import { activeAgo, cardHref, ctaOf, currentMilestone, progressOf, ProjectProbes, type ProjectSummary } from "@/components/collaborate/my-projects/summary";
import { collabHref, useIncomingIntroductions, useRecommendations, useSavedCollaborators, type Collaborator } from "@/lib/collab/collaborators";
import { ME } from "@/lib/collab/me";
import { discoverProject, initialsOf, listedOn, profileOf } from "@/lib/collab/projects";
import type { Project } from "@/lib/collab/types";
import { useCollab } from "@/lib/collab/useCollab";
import { isMine, membersOf, phaseOf, workspaceHref } from "@/lib/collab/workspace";
import { PEOPLE, type PersonId } from "@/lib/data/people";
import Carousel from "./Carousel";
import "../styles/home-start.css";

/*
 * Collaborate Home, mirrored from the product design (cs-home in ../styles/home-start.css): the welcome, four
 * counts, your projects, what needs you, people to create with, invitations, open calls, team conversations and
 * the closing Start a project band. Every part is read from our own data (projects, decisions, tasks, threads,
 * offers, proposals, recommendations, calls); a part with nothing to show is left out. The four counts open
 * their lists (My Projects, ../overview-lists). Loading is the design's skeleton (on the first visit too, and at
 * /collaborate/state-loading); someone with no projects, calls or invitations gets the design's Empty page.
 */

const ROUTES = { start: "/collaborate/start", collaborators: "/collaborate/collaborators", myProjects: "/collaborate/my-projects", discover: "/collaborate/discover", intros: "/collaborate/introduction-requests" };
const Arrow = () => <ArrowRight size={16} strokeWidth={1.25} aria-hidden focusable={false} />;
const plural = (n: number, one: string, many: string) => (n === 1 ? one : many);
const first = (id: PersonId) => PEOPLE[id]?.name.split(" ")[0] ?? "Someone";
const dayMonth = (at: number) => new Date(at).toLocaleDateString("en-GB", { day: "numeric", month: "long" });

function Dot() { return <span className="cs-dot" aria-hidden />; }
function Avs({ people, size = 32 }: { people: string[]; size?: number }) {
  return <span className="cs-avs" style={{ ["--s" as string]: `${size}px`, ["--fs" as string]: `${size <= 28 ? 10 : 11}px` } as React.CSSProperties} aria-hidden>{people.map((p, i) => <span key={p + i} className="cs-av">{p}</span>)}</span>;
}
function MoreLink({ href, card, onClick, children }: { href?: string; card?: boolean; onClick?: () => void; children: React.ReactNode }) {
  const cls = card ? "cs-card-link" : "cs-tight";
  return href ? <Button variant="link" href={href} className={cls} iconRight={<Arrow />}>{children}</Button> : <Button variant="link" onClick={onClick} className={cls} iconRight={<Arrow />}>{children}</Button>;
}
function Sec({ label, title, support, children }: { label: string; title: string; support?: string; children?: React.ReactNode }) {
  return (
    <div className="cs-sec">
      <div className="cs-sec__text"><p className="cs-label">{label}</p><h2 className="cs-h2" data-m="words">{title}</h2>{support ? <p className="cs-sec__support">{support}</p> : null}</div>
      {children}
    </div>
  );
}
function Side({ label, title }: { label: string; title: string }) {
  return <div className="cs-side"><p className="cs-label">{label}</p><h2 className="cs-h2" data-m="words">{title}</h2></div>;
}

function ProjectCard({ p, s }: { p: Project; s?: ProjectSummary }) {
  const prog = progressOf(p);
  const members = membersOf(p);
  return (
    <article className="cs-pc cs-hcard">
      <div className="cs-pc__top"><span className="cs-stage"><Dot />{phaseOf(p)}</span><span className="cs-pc__active">Active {activeAgo(s?.lastAt ?? p.createdAt)}</span></div>
      <div className="cs-pc__title"><h3>{p.title}</h3><p>{p.summary}</p></div>
      <hr className="cs-rule" />
      <div className="cs-pc__details">
        <div><p className="cs-label cs-label--muted">Current milestone</p><p className="cs-val">{currentMilestone(p)}</p></div>
        {s?.next ? <div><p className="cs-label cs-label--muted">Next action</p><p className="cs-val">{s.next}</p></div> : null}
      </div>
      <div className="cs-pc__progress">
        <div className="cs-pc__plabel"><span className="cs-label cs-label--muted">Progress</span><span className="cs-small">{prog.label}</span></div>
        <div className="cs-pc__bars" role="img" aria-label={prog.label}>{[0, 1, 2, 3, 4].map((i) => <span key={i} data-on={i < prog.bars || undefined} />)}</div>
      </div>
      <div className="cs-pc__foot">
        <span className="cs-pc__team"><Avs people={members.slice(0, 3).map((m) => m.initials)} /><span>{members.length} {plural(members.length, "collaborator", "collaborators")}</span></span>
        <Button variant="link" href={cardHref(p)} className="cs-tight" iconRight={<Arrow />}>{ctaOf(p)}</Button>
      </div>
    </article>
  );
}

function NewProject() {
  return (
    <article className="cs-np">
      <div className="cs-np__text">
        <p className="cs-label cs-label--muted">New project</p>
        <h3>Start something new.</h3>
        <p>Bring your intention to Akines. We’ll help you clarify it, find the right people and prepare to create together.</p>
      </div>
      <div><Button href={ROUTES.start} iconRight={<Arrow />}>Start a project</Button></div>
    </article>
  );
}

function PersonCard({ c, onSave, onOverlay }: { c: Collaborator; onSave: () => void; onOverlay: (k: OverlayKind) => void }) {
  const person = PEOPLE[c.id];
  const href = collabHref(c.id);
  const src = c.photos?.home ?? photoOf(c.id, 900);
  // Home's own words for the person where they have them, else their discovery card's.
  const h = c.home;
  const purpose = h?.purpose ?? c.reasons.find((r) => r.category === "Shared purpose")?.text ?? c.matchContext;
  const availability = h?.availability ?? c.availability;
  return (
    <article className="cs-cc cs-hcard">
      <Link className="cs-cc__photo" href={href.profile} tabIndex={-1} aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element -- the collaborator's portrait */}
        {src ? <img className="cover" src={src} loading="lazy" decoding="async" alt="" /> : null}
      </Link>
      <div className="cs-cc__body">
        <div className="cs-cc__profile">
          <p className="cs-cc__avail"><Dot />{/[.!?]$/.test(availability) ? availability : `${availability}.`}</p>
          <div className="cs-cc__who"><h3><Link className="cs-cc__name" href={href.profile}>{person?.name}</Link></h3><p className="cs-cc__role">{person?.role}</p></div>
          <p className="cs-cc__skills">{h?.skills ?? c.keySkills.join(" · ")}</p>
          <hr className="cs-rule" />
          <div className="cs-cc__fields">
            <div><p className="cs-label cs-label--muted">Shared purpose</p><p className="cs-val cs-val--sm">{purpose}</p></div>
            <div><p className="cs-label cs-label--muted">Complementary skill</p><p className="cs-val cs-val--sm">{h?.skill ?? c.experience}</p></div>
            <div><p className="cs-label cs-label--muted">Working preference</p><p className="cs-val cs-val--sm">{h?.preference ?? c.preference}</p></div>
          </div>
        </div>
        <div className="cs-cc__match">
          <div className="cs-cc__why"><p className="cs-label cs-label--muted">Why you may work well together</p><p className="cs-cc__text">{h?.match ?? c.compat}</p></div>
          <div className="cs-cc__actions">
            <Button full iconRight={<Arrow />} href={href.request}>Request introduction</Button>
            <Button full variant="secondary" onClick={onSave}>Save for later</Button>
            <div className="cs-cc__links">
              <Button variant="link" onClick={() => onOverlay("notrelevant")}>Not relevant</Button>
              <Button variant="link" onClick={() => onOverlay("ask")}>Ask Akines why</Button>
              <Button variant="link" onClick={() => onOverlay("prefs")}>Adjust matching preferences</Button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

type Invite = { key: string; title: string; text: string; date: string; by: PersonId; role: string; commitment?: string; team: string[]; members: string; contribution: string; href: string; accept: () => void; decline: () => void };
function InviteCard({ v }: { v: Invite }) {
  const by = PEOPLE[v.by]?.name ?? "Someone";
  return (
    <article className="cs-ic cs-hcard">
      <div className="cs-ic__top"><span className="cs-stage"><Dot />Invitation</span><span className="cs-small">{v.date}</span></div>
      <div className="cs-ic__title"><h3>{v.title}</h3><p>{v.text}</p></div>
      <hr className="cs-rule" />
      <div className="cs-ic__row">
        <div><p className="cs-label cs-label--muted">Invited by</p><p className="cs-ic__by"><Avs people={[initialsOf(by)]} /><span>{by}</span></p></div>
        <div><p className="cs-label cs-label--muted">Proposed role</p><p className="cs-val">{v.role}</p></div>
        {v.commitment ? <div><p className="cs-label cs-label--muted">Time commitment</p><p className="cs-val">{v.commitment}</p></div> : null}
      </div>
      <div className="cs-ic__row cs-ic__row--2">
        <div><p className="cs-label cs-label--muted">Team members</p><p className="cs-ic__by"><Avs people={v.team} /><span>{v.members}</span></p></div>
        <div><p className="cs-label cs-label--muted">Expected contribution</p><p className="cs-val">{v.contribution}</p></div>
      </div>
      <div className="cs-ic__actions">
        <Button iconRight={<Arrow />} href={v.href}>Review invitation</Button>
        <Button variant="secondary" onClick={v.accept}>Accept</Button>
        <Button variant="link" onClick={v.decline}>Decline</Button>
      </div>
    </article>
  );
}

type Open = { id: string; stage: string; title: string; text: string; looking: string; team: string[]; teamText: string; commitment: string; owner: string };
function OpenCard({ o }: { o: Open }) {
  return (
    <article className="cs-oc cs-hcard">
      <span className="cs-stage"><Dot />{o.stage}</span>
      <div className="cs-oc__title"><h3>{o.title}</h3><p>{o.text}</p></div>
      <hr className="cs-rule" />
      <div className="cs-oc__skills"><p className="cs-label cs-label--muted">Looking for</p><p className="cs-val">{o.looking}</p></div>
      <div className="cs-oc__teamf"><p className="cs-label cs-label--muted">Current team</p><p className="cs-oc__team"><Avs people={o.team} size={28} /><span>{o.teamText}</span></p></div>
      <div className="cs-oc__commit"><p className="cs-label cs-label--muted">Commitment</p><p className="cs-val cs-val--sm">{o.commitment}</p></div>
      <div><p className="cs-label cs-label--muted">Project owner</p><p className="cs-val cs-val--sm">{o.owner}</p></div>
      <Button variant="link" href={`/collaborate/projects/${encodeURIComponent(o.id)}`} className="cs-oc__cta cs-tight" iconRight={<Arrow />}>Explore project</Button>
    </article>
  );
}

type Tile = { n: string; label: string; count: number; unit: string; text: string; link: string; href: string };

/**
 * Overview Indicator. The whole tile opens the page of its count; the Card Link inside is the keyboard and screen
 * reader link, the tile has an inert link over it for the mouse.
 */
function OverviewTile({ t }: { t: Tile }) {
  return (
    <li className="cs-tile">
      <Link className="cs-tile__hit" href={t.href} tabIndex={-1} aria-hidden />
      <p className="cs-tile__head"><span className="cs-tile__n">{t.n}</span><span className="cs-label">{t.label}</span></p>
      <p className="cs-tile__count"><span className="cs-tile__big">{t.count}</span><span className="cs-tile__unit">{t.unit}</span></p>
      <p className="cs-tile__text">{t.text}</p>
      <MoreLink href={t.href}>{t.link}</MoreLink>
    </li>
  );
}

const firstName = () => PEOPLE[ME]?.name.split(" ")[0];

/** 01 Welcome header of Home and of Home Loading. */
function Welcome() {
  const name = firstName();
  return (
    <section className="cs-band cs-welcome" aria-label="Welcome">
      <div className="cs-welcome__text">
        <p className="cs-label">Your collaboration space</p>
        <h1 className="cs-h1" data-m="words">{name ? `Welcome back, ${name}.` : "Welcome back."}</h1>
        <p className="cs-welcome__support">Your ideas are moving. Here’s what needs your attention today.</p>
      </div>
      <div className="cs-welcome__actions">
        <Button href={ROUTES.start} iconRight={<Arrow />}>Start a project</Button>
        <Button href={ROUTES.collaborators} variant="secondary">Explore collaborators</Button>
      </div>
    </section>
  );
}

function WorkspaceHead() {
  return <Sec label="Your workspace" title="Pick up where you left off." support="Your projects, ready when you are."><MoreLink href={ROUTES.myProjects} card>View All Projects</MoreLink></Sec>;
}
function AttentionHead() {
  return <Side label="Your next action" title="A few things need you." />;
}

/** Home Loading: the welcome header is live; the tiles, project cards and attention rows are skeletons. */
function HomeSkeleton() {
  return (
    <div className="cs-home" aria-busy="true">
      <Welcome />
      <section className="cs-band" aria-label="Overview, loading">
        <ul className="cs-ov" aria-hidden="true">
          {[0, 1, 2, 3].map((i) => (
            <li key={i} className="cs-sktile">
              <div className="cs-sktile__top"><Bar w={150} h={10} /><Bar w={56} h={44} /><Bar w={230} h={14} /></div>
              <Bar w={96} h={14} />
            </li>
          ))}
        </ul>
      </section>
      <section className="cs-band cs-stack" aria-label="Continue working, loading">
        <WorkspaceHead />
        <div className="cs-skcards" aria-hidden="true">{[0, 1, 2].map((i) => <SkeletonCard key={i} />)}</div>
      </section>
      <section className="cs-band cs-split2" aria-label="Needs your attention, loading">
        <AttentionHead />
        <div className="cs-skatt" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <div key={i} className="cs-skatt__row">
              <div className="cs-skatt__line"><Bar w={300} h={16} /><Bar w={150} h={14} /></div>
              <div className="cs-skatt__line"><Bar w={260} h={12} /><Bar w={180} h={12} /></div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

/** The state route of Home Loading: the skeleton, then Home. That visit counts as the first one, so Home does not load twice. */
export function HomeLoadingState() {
  const router = useRouter();
  useFirstVisit("collaborate-home", { stateRoute: true, onDone: () => router.replace(OL.home) });
  return <HomeSkeleton />;
}

const BEGIN = [
  { n: "01", title: "Start a project", text: "Bring an idea and let Akines help you shape it into a brief.", action: "Start a project", href: ROUTES.start },
  { n: "02", title: "Find collaborators", text: "See people whose skills and interests fit what you are making.", action: "Find collaborators", href: ROUTES.collaborators },
  { n: "03", title: "Browse open calls", text: "Offer your skills to a project that is looking for people.", action: "Browse open calls", href: ROUTES.discover },
];
const CAN = [
  { title: "Start a project", support: "Describe an idea and Akines helps you shape it into a brief." },
  { title: "Find collaborators", support: "See people whose skills and interests fit what you are making." },
  { title: "Join an open call", support: "Offer your skills to a project that is looking for people." },
];

/**
 * Home Empty: the page of someone with no projects yet. Welcome, three ways to begin, the four tiles at zero and
 * what you can do here. At its "state-" route the tiles open the Empty frames of their lists.
 */
export function HomeEmpty({ staticState = false }: { staticState?: boolean }) {
  const name = firstName();
  const tiles: Tile[] = [
    { n: "01", label: "Active projects", count: 0, unit: "projects", text: "No projects yet.", link: "My Projects", href: ROUTES.myProjects },
    { n: "02", label: "Decisions awaiting you", count: 0, unit: "decisions", text: "Nothing waiting for you.", link: "Pending decisions", href: staticState ? OL.decisionsEmpty : OL.decisions },
    { n: "03", label: "Collaborator introductions", count: 0, unit: "introductions", text: "No introductions yet.", link: "Introduction requests", href: staticState ? OL.introductionsEmpty : OL.introductions },
    { n: "04", label: "Tasks due this week", count: 0, unit: "tasks", text: "No tasks yet.", link: "Upcoming tasks", href: staticState ? OL.tasksEmpty : OL.tasks },
  ];
  return (
    <div className="cs-home cs-home--empty">
      <section className="cs-band cs-welcome" aria-label="Welcome">
        <div className="cs-welcome__text">
          <p className="cs-label">Your collaboration space</p>
          <h1 className="cs-h1" data-m="words">{name ? `Welcome, ${name}.` : "Welcome."}</h1>
          <p className="cs-welcome__support">You have no projects yet. Start one, find someone to make it with, or join an open call.</p>
        </div>
      </section>

      <section className="cs-band cs-stack" aria-label="Where to begin">
        <Sec label="Start here" title="Three ways to begin." support="Pick one. You can do the others whenever you like." />
        <ul className="cs-sps" data-m="stagger">
          {BEGIN.map((c) => (
            <li key={c.n} className="cs-sps__item">
              <Link className="cs-sp" href={c.href}>
                <span className="cs-sp__n">{c.n}</span>
                <span className="cs-sp__bottom">
                  <span className="cs-sp__title">{c.title}</span>
                  <span className="cs-sp__text">{c.text}</span>
                  <span className="cs-sp__action"><span>{c.action}</span><Arrow /></span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="cs-band cs-stack" aria-label="At a glance">
        <Sec label="At a glance" title="Nothing here yet, and that is fine." support="These fill in as you start working with others." />
        <ul className="cs-ov" data-m="stagger">{tiles.map((t) => <OverviewTile key={t.n} t={t} />)}</ul>
      </section>

      <section className="cs-band cs-split2" aria-label="What you can do here">
        <Side label="What you can do here" title="A shared space for creative work." />
        <ul className="cs-cap">
          {CAN.map((l) => (
            <li key={l.title} className="cs-cap__line">
              <p className="cs-cap__title">{l.title}</p>
              <p className="cs-cap__support">{l.support}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default function CollaborateHome() {
  const collab = useCollab({ engine: true });
  const router = useRouter();
  const recs = useRecommendations();
  const { save } = useSavedCollaborators();
  // The person stays set while a dialog closes, so it can animate out.
  const [overlay, setOverlay] = useState<OverlayKind | null>(null);
  const [who, setWho] = useState<Collaborator | null>(null);
  const [sums, setSums] = useState<Record<string, ProjectSummary>>({});
  const onSummary = useCallback((s: ProjectSummary) => setSums((cur) => ({ ...cur, [s.id]: s })), []);
  const overview = useOverview();
  const firstVisit = useFirstVisit("collaborate-home");

  const mine = collab.projects.filter(isMine);
  const summaries = mine.map((p) => sums[p.id]).filter((s): s is ProjectSummary => !!s);
  const decisions = summaries.flatMap((s) => s.decisions).sort((a, b) => b.at - a.at);
  const incoming = useIncomingIntroductions().waiting;
  /** Project ideas someone sent the member: these are invitations. */
  const proposalsIn = collab.proposals.filter((p) => p.from && p.from !== ME && p.status === "sent");

  // Invitations: offers to join a call's team, and project ideas someone sent the member.
  const invites: Invite[] = [
    ...collab.myApps.filter((a) => a.stage === "offer").flatMap((a): Invite[] => {
      const call = collab.call(a.callId);
      if (!call) return [];
      const dp = discoverProject(call, collab.projects);
      const role = a.offer?.role ?? a.role;
      const at = [...a.history].reverse().find((h) => h.stage === "offer")?.at ?? a.history[a.history.length - 1]?.at ?? 0;
      return [{
        key: a.id, title: call.title, text: call.summary, date: `Invited ${dayMonth(at)}`, by: call.host, role, commitment: profileOf(call).commitment,
        team: dp.team.slice(0, 3).map((m) => m.initials), members: `${dp.teamCount} ${plural(dp.teamCount, "member", "members")}`,
        contribution: profileOf(call).needs?.[role] ?? call.about, href: `/collaborate/projects/${encodeURIComponent(call.id)}`,
        accept: () => { void collab.acceptOffer(a.id).then((pid) => { toast.show({ message: `You joined ${call.title}.` }); if (pid) router.push(workspaceHref(pid)); }); },
        decline: () => { collab.declineOffer(a.id); toast.show({ message: "Invitation declined." }); },
      }];
    }),
    ...proposalsIn.map((p): Invite => ({
      key: p.id, title: p.title, text: p.idea, date: `Invited ${dayMonth(p.at)}`, by: p.from!, role: p.theirRole,
      team: [initialsOf(PEOPLE[p.from!]?.name ?? "")], members: "1 member", contribution: `Work with ${first(p.from!)}, who would be the ${p.myRole.toLowerCase()}.`, href: ROUTES.intros,
      accept: () => { void collab.answerProposal(p.id, "accept").then((pid) => { toast.show({ message: `You joined ${p.title}.` }); if (pid) router.push(workspaceHref(pid)); }); },
      decline: () => { void collab.answerProposal(p.id, "decline"); toast.show({ message: "Invitation declined." }); },
    })),
  ];

  const attentionByKind = [
    decisions.map((d) => ({ key: d.href, type: "Decision awaiting you", time: `Requested ${ago(d.at).toLowerCase()}`, title: d.projectTitle, text: `The team needs your approval: ${d.title.charAt(0).toLowerCase()}${d.title.slice(1).replace(/\.$/, "")}.`, cta: "Review decision", href: d.href })),
    invites.map((v) => ({ key: v.key, type: "Project invitation", time: v.date, title: v.title, text: "You have been invited to contribute to a new project.", cta: "Review invitation", href: v.href })),
    incoming.map((p) => ({ key: `in-${p.id}`, type: "Collaborator introduction", time: `Received ${ago(p.receivedAt).toLowerCase()}`, title: PEOPLE[p.from]?.name ?? "Someone", text: "A potential collaborator would like to connect around your project.", cta: "Review introduction", href: OL.introductions })),
  ];
  // The first of each kind, then the rest, so a decision, an invitation and an introduction all get a place.
  const attention = [...attentionByKind.flatMap((k) => k.slice(0, 1)), ...attentionByKind.flatMap((k) => k.slice(1))].slice(0, 3);

  const taken = new Set(collab.projects.filter(isMine).map((p) => p.callId));
  const open: Open[] = collab.calls.filter((c) => listedOn(c, "home") && !c.postedByMe && c.host !== ME && c.closesInDays > 0 && !collab.appFor(c.id) && !taken.has(c.id)).map((c) => {
    const dp = discoverProject(c, collab.projects);
    return { id: c.id, stage: dp.stage, title: c.title, text: c.summary, looking: c.roles.join(" · "), team: dp.team.slice(0, 3).map((m) => m.initials), teamText: `${dp.teamCount} ${plural(dp.teamCount, "person", "people")}`, commitment: dp.commitment, owner: dp.owner };
  });

  // The people Home has its own words for (the design's carousel), else every recommendation.
  const homeRecs = recs.list.some((c) => c.home) ? recs.list.filter((c) => c.home) : recs.list;

  const messages = summaries.flatMap((s) => s.messages.map((m) => ({ ...m, order: m.at ?? s.lastAt }))).sort((a, b) => b.order - a.order).slice(0, 3);

  if (firstVisit || !collab.ready || (mine.length > 0 && !overview.ready)) return <>{overview.probes}<HomeSkeleton /></>;
  if (!mine.length && !collab.hostedCalls.length && !invites.length) return <HomeEmpty />;

  const tiles: Tile[] = [
    { n: "01", label: "Active projects", count: mine.length, unit: plural(mine.length, "active project", "active projects"), text: "Where your ideas are moving.", link: "My Projects", href: ROUTES.myProjects },
    { n: "02", label: "Decisions awaiting you", count: decisions.length, unit: plural(decisions.length, "decision", "decisions"), text: "Your team needs your approval.", link: "Pending decisions", href: OL.decisions },
    { n: "03", label: "Collaborator introductions", count: incoming.length, unit: plural(incoming.length, "introduction", "introductions"), text: "Someone would like to connect.", link: "Introduction requests", href: OL.introductions },
    { n: "04", label: "Tasks due this week", count: overview.tasks.length, unit: plural(overview.tasks.length, "task", "tasks"), text: "Plan your week around them.", link: "Upcoming tasks", href: OL.tasks },
  ];

  return (
    <div className="cs-home">
      <ProjectProbes projects={mine} onChange={onSummary} />
      {overview.probes}
      <Welcome />

      <section className="cs-band" aria-label="Overview">
        <ul className="cs-ov" data-m="stagger">
          {tiles.map((t) => <OverviewTile key={t.n} t={t} />)}
        </ul>
      </section>

      <section className="cs-band cs-stack" aria-label="Continue working">
        <WorkspaceHead />
        <Carousel label="Your projects" noun="projects" per={{ desktop: 2, tablet: 1, mobile: 1 }}>
          {[...mine.map((p) => <ProjectCard key={p.id} p={p} s={sums[p.id]} />), <NewProject key="new" />]}
        </Carousel>
      </section>

      {attention.length ? (
        <section className="cs-band cs-split2" aria-label="Needs your attention">
          <AttentionHead />
          <ul className="cs-att">
            {attention.map((a) => (
              <li key={a.key} className="cs-att__item">
                <div className="cs-att__type"><span className="cs-att__kind"><span className="cs-dot cs-dot--sm" aria-hidden />{a.type}</span><span className="cs-small">{a.time}</span></div>
                <div className="cs-att__content"><h3>{a.title}</h3><p>{a.text}</p></div>
                <Button variant="secondary" href={a.href} className="cs-att__action" iconRight={<Arrow />}>{a.cta}</Button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {homeRecs.length ? (
        <section className="cs-band cs-stack" aria-label="Suggested collaborators">
          <Sec label="People to create with" title="The right people can change an idea." support="Meet people whose experience, perspective and way of working may complement yours." />
          <Carousel label="Suggested collaborators" noun="collaborator" per={{ desktop: 1, tablet: 1, mobile: 1 }}>
            {homeRecs.map((c) => (
              <PersonCard key={c.id} c={c} onOverlay={(kind) => { setWho(c); setOverlay(kind); }} onSave={() => { const undo = save(c.id); toast.show({ message: "Saved to your collaborators.", actionLabel: "Undo", onAction: undo }); }} />
            ))}
          </Carousel>
        </section>
      ) : null}

      {invites.length ? (
        <section className="cs-band cs-split2" aria-label="Invitations">
          <Side label="Your next collaboration" title="You’ve been invited." />
          <Carousel label="Your invitations" noun="invitation" per={{ desktop: 1, tablet: 1, mobile: 1 }} className="cs-car--invites">
            {invites.map((v) => <InviteCard key={v.key} v={v} />)}
          </Carousel>
        </section>
      ) : null}

      {open.length ? (
        <section className="cs-band cs-stack" aria-label="Open calls">
          <Sec label="Open collaborations" title="Ideas looking for people." support="Explore projects seeking the skills, experience and perspective you can bring.">
            <div className="cs-sec__links">
              <MoreLink href={OL.openCalls} card>Your open calls</MoreLink>
              <MoreLink href={ROUTES.discover} card>View All Open Calls</MoreLink>
            </div>
          </Sec>
          <Carousel label="Open calls" noun="open calls" per={{ desktop: 3, tablet: 2, mobile: 1 }}>
            {open.map((o) => <OpenCard key={o.id} o={o} />)}
          </Carousel>
        </section>
      ) : null}

      {messages.length ? (
        <section className="cs-band cs-split2" aria-label="Recent team messages">
          <Side label="Team conversations" title="Stay connected." />
          <ul className="cs-msgs2">
            {messages.map((m) => (
              <li key={m.key} className="cs-mp">
                <span className="cs-mp__slot">{m.unread ? <span className="cs-dot" role="img" aria-label="Unread" /> : null}</span>
                <div className="cs-mp__body">
                  <p className="cs-label cs-label--muted">{m.projectTitle}</p>
                  <p className="cs-mp__sender">{m.sender}</p>
                  <p className="cs-mp__text">“{m.text}”</p>
                </div>
                <div className="cs-mp__meta">
                  <span className="cs-small">{m.at ? ago(m.at) : m.clock}</span>
                  <Button variant="link" href={m.href} className="cs-tight" iconRight={<Arrow />}>Open conversation</Button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="cs-band" aria-label="Start a project">
        <div className="cs-start">
          <span className="cs-start__rule" aria-hidden />
          <div className="cs-start__content">
            <div className="cs-start__text">
              <p className="cs-label">Your next idea</p>
              <h2 className="cs-start__title" data-m="words">Something meaningful starts with an idea.</h2>
              <p className="cs-start__support">Bring your intention to Akines. We’ll help you clarify it, find the right people and prepare to create together.</p>
            </div>
            <div className="cs-start__actions">
              <Button href={ROUTES.start} iconRight={<Arrow />}>Start a project</Button>
              <Button href={ROUTES.collaborators} variant="secondary">Explore collaborators</Button>
            </div>
          </div>
        </div>
      </section>

      <Overlays open={overlay} onClose={() => setOverlay(null)} person={who} />
    </div>
  );
}
