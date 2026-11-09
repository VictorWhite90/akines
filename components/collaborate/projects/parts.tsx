"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, Bookmark, Eye } from "lucide-react";
import Button from "@/components/kin/Button";
import { faceSrc } from "@/components/kin/home/parts";
import { sentWhen, type DiscoverProject } from "@/lib/collab/projects";
import type { Application } from "@/lib/collab/types";
import { requestHref } from "@/components/collaborate/applications/paths";
import type { PersonId } from "@/lib/data/people";
import "../styles/projects.css";

/*
 * The design's shared pieces for Discover Projects, Saved projects, a project's page, Express interest and member
 * pages (classes in ../styles/projects.css): back link, text link, status, notice, page states, page head, the
 * stage line, the project card and its skeleton, sections, facts, tags, members and the side panels.
 */

export const ArrowIcon = () => <ArrowRight size={16} strokeWidth={1.25} aria-hidden focusable={false} />;
/** The card's and the opportunity's arrow, a touch heavier. */
export const CtaArrow = () => <ArrowRight size={16} strokeWidth={1.4} aria-hidden focusable={false} />;
export const SaveIcon = ({ filled, size = 20 }: { filled?: boolean; size?: number }) => <Bookmark size={size} strokeWidth={size < 16 ? 0.75 : 1.5} fill={filled ? "currentColor" : "none"} aria-hidden focusable={false} />;

export function Back({ href, children }: { href: string; children: React.ReactNode }) {
  return <Link href={href} className="dsc-back"><ArrowLeft size={16} strokeWidth={1} aria-hidden focusable={false} /><span>{children}</span></Link>;
}

export function DsLink({ href, onClick, arrow, children }: { href?: string; onClick?: () => void; arrow?: boolean; children: React.ReactNode }) {
  const inner = <><span className="dsc-link__label">{children}</span>{arrow ? <ArrowIcon /> : null}</>;
  return href ? <Link href={href} className="dsc-link">{inner}</Link> : <button type="button" className="dsc-link" onClick={onClick}>{inner}</button>;
}

const STATUS = { open: "Open", closed: "Closed", pending: "Pending" } as const;
export function Status({ status, label }: { status: keyof typeof STATUS; label?: string }) {
  return <span className={`dsc-status dsc-status--${status}`}><i aria-hidden="true" />{label ?? STATUS[status]}</span>;
}

export function Notice({ title, text, tone }: { title: string; text: string; tone?: "error" }) {
  return (
    <div className={`dsc-notice${tone === "error" ? " dsc-notice--error" : ""}`} role={tone === "error" ? "alert" : undefined}>
      <span className="dsc-notice__rule" aria-hidden="true" />
      <div className="dsc-notice__body"><p className="dsc-notice__title">{title}</p><p className="dsc-notice__text">{text}</p></div>
    </div>
  );
}

/** An empty, closed or failed page: a short rule, a headline, a line and its actions. */
export function PageState({ headline, support, pair, role, children }: { headline: string; support: string; pair?: boolean; role?: string; children: React.ReactNode }) {
  return (
    <section className="dsc-state" role={role}>
      <span className="dsc-state__rule" aria-hidden="true" />
      <h2 className="dsc-state__headline">{headline}</h2>
      <p className="dsc-state__support">{support}</p>
      <div className="dsc-state__actions" data-pair={pair || undefined}>{children}</div>
    </section>
  );
}

export function PageHead({ eyebrow, title, lead, link }: { eyebrow: string; title: string; lead: string; link?: React.ReactNode }) {
  return (
    <header className="dsc-head">
      <div className="dsc-head__copy">
        <p className="dsc-eyebrow" data-m="up">{eyebrow}</p>
        <h1 className="dsc-h1" data-m="words">{title}</h1>
        <p className="dsc-lead" data-m="up">{lead}</p>
      </div>
      {link ? <div className="dsc-head__link">{link}</div> : null}
    </header>
  );
}

export function StageLine({ stage, type }: { stage: string; type?: string }) {
  return (
    <div className="dsc-stage">
      <i aria-hidden="true" />
      <span className="dsc-stage__name">{stage}</span>
      {type ? <><span className="dsc-stage__sep" aria-hidden="true">·</span><span className="dsc-stage__type">{type}</span></> : null}
    </div>
  );
}

export const projectHref = (id: string) => `/collaborate/projects/${id}`;
export const memberHref = (id: PersonId, projectId: string) => `/collaborate/members/${id}?project=${encodeURIComponent(projectId)}`;

export function ProjectCard({ project: p, mode, saved, onSave }: { project: DiscoverProject; mode: "discover" | "saved"; saved: boolean; onSave: () => void }) {
  const closed = p.closed;
  return (
    <article className="dsc-card" data-closed={closed || undefined}>
      <div className="dsc-card__top">
        <StageLine stage={p.stage} type={p.type} />
        {saved && closed && mode === "discover" ? (
          <span className="dsc-card__saved dsc-card__saved--static"><SaveIcon size={12} />Saved</span>
        ) : saved ? (
          <button type="button" className="dsc-card__saved" aria-pressed="true" aria-label={mode === "saved" ? `Remove ${p.title} from saved projects` : `Saved: ${p.title}. Select to remove`} onClick={onSave}><SaveIcon size={12} />Saved</button>
        ) : (
          <button type="button" className="dsc-card__save" aria-pressed="false" aria-label={`Save ${p.title}`} onClick={onSave}><SaveIcon /></button>
        )}
      </div>
      <div className="dsc-card__group">
        <h3 className="dsc-card__title"><Link href={projectHref(p.id)}>{p.title}</Link></h3>
        <p className="dsc-card__purpose">{p.purpose}</p>
      </div>
      <div className="dsc-card__divider" />
      <div className="dsc-card__field">
        <span className="dsc-label">Looking for</span>
        <p className="dsc-card__skills">{closed ? "No longer looking for people" : p.roles.join(" · ")}</p>
      </div>
      <div className="dsc-card__field dsc-card__field--team">
        <span className="dsc-label">Current team</span>
        <div className="dsc-card__team">
          <span className="dsc-card__avatars">{p.team.slice(0, 2).map((m) => <span key={m.id} className="dsc-card__avatar">{m.initials}</span>)}</span>
          <span>{p.teamCount} {p.teamCount === 1 ? "person" : "people"}</span>
        </div>
      </div>
      <div className="dsc-card__field">
        <span className="dsc-label">Commitment</span>
        <p className="dsc-card__text dsc-card__text--commit">{p.commitment}</p>
      </div>
      <div className="dsc-card__field">
        <span className="dsc-label">Project owner</span>
        <p className="dsc-card__text">{p.owner}</p>
      </div>
      <Button variant="link" href={projectHref(p.id)} className="dsc-card__cta" iconRight={<CtaArrow />}>{closed ? "View project" : "Explore project"}</Button>
      {mode === "saved" || closed ? <span className="dsc-card__status"><Status status={closed ? "closed" : "open"} /></span> : null}
    </article>
  );
}

export function Bar({ w, h, r, className }: { w: number | string; h: number; r?: number; className?: string }) {
  return <span className={`dsc-bar${className ? ` ${className}` : ""}`} style={{ width: w, height: h, borderRadius: r }} />;
}

export function SkeletonCard() {
  return (
    <div className="dsc-skel-card" aria-hidden="true">
      <Bar w={150} h={12} />
      <div className="dsc-skel-card__group"><Bar w={300} h={28} /><Bar w="100%" h={14} /><Bar w={260} h={14} /></div>
      <span className="dsc-skel-card__divider" />
      <div className="dsc-skel-card__field"><Bar w={91} h={10} /><Bar w="100%" h={16} /><Bar w={220} h={16} /></div>
      <div className="dsc-skel-card__field"><Bar w={105} h={10} /><div className="dsc-skel-card__team"><Bar w={28} h={28} r={14} /><Bar w={70} h={14} /></div></div>
      <div className="dsc-skel-card__field"><Bar w={94} h={10} /><Bar w={300} h={16} /></div>
      <div className="dsc-skel-card__field"><Bar w={115} h={10} /><Bar w={140} h={16} /></div>
      <Bar w={110} h={16} />
    </div>
  );
}

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="dsc-section" data-m="up"><h2 className="dsc-eyebrow">{title}</h2>{children}</section>;
}
export function Item({ title, detail }: { title: string; detail: string }) {
  return <div className="dsc-item"><h3 className="dsc-item__title">{title}</h3><p className="dsc-item__detail">{detail}</p></div>;
}
export function Facts({ rows, compact }: { rows: { label: string; value: string }[]; compact?: boolean }) {
  return <dl className={`dsc-facts${compact ? " dsc-facts--compact" : ""}`}>{rows.map((r) => <div key={r.label} className={`dsc-fact${compact ? " dsc-fact--compact" : ""}`}><dt>{r.label}</dt><dd>{r.value}</dd></div>)}</dl>;
}
export function Tags({ tags, label }: { tags: string[]; label: string }) {
  return <ul className="dsc-tags" aria-label={label}>{tags.map((t) => <li key={t}><span className="dsc-tag">{t}</span></li>)}</ul>;
}
export function TeamMemberRow({ initials, name, role, href }: { initials: string; name: string; role: string; href?: string }) {
  const inner = <><span className="dsc-member__avatar" aria-hidden="true">{initials}</span><span className="dsc-member__info"><span className="dsc-member__name">{name}</span><span className="dsc-member__role">{role}</span></span></>;
  return href ? <Link href={href} className="dsc-member">{inner}</Link> : <div className="dsc-member dsc-member--static">{inner}</div>;
}
export function Match({ sentence, children }: { sentence: string; children?: React.ReactNode }) {
  return <div className="dsc-match"><p className="dsc-match__sentence">{sentence}</p>{children}</div>;
}

export function SaveButton({ saved, onClick, full = true }: { saved: boolean; onClick: () => void; full?: boolean }) {
  return <Button variant="secondary" full={full} className="dsc-savebtn" data-saved={saved || undefined} aria-pressed={saved} icon={<SaveIcon filled={saved} />} onClick={onClick}>{saved ? "Saved" : "Save project"}</Button>;
}

export function InterestPanel({ interestHref, saved, onSave }: { interestHref?: string; saved: boolean; onSave: () => void }) {
  return (
    <section className="dsc-panel-card dsc-panel-card--actions" aria-label="Interest">
      <p className="dsc-eyebrow">Interested in this project?</p>
      {interestHref ? <Button href={interestHref} full iconRight={<ArrowIcon />}>Express interest</Button> : <Button full iconRight={<ArrowIcon />} disabled>Express interest</Button>}
      <SaveButton saved={saved} onClick={onSave} />
    </section>
  );
}

const PENDING = new Set(["submitted", "viewed", "shortlisted", "conversation"]);

/** Side panel once interest was sent: status, note, View request (12.44), Withdraw interest, Save project. */
export function SentPanel({ app, owner, saved, onSave, onWithdraw }: { app: Application; owner: string; saved: boolean; onSave: () => void; onWithdraw: () => void }) {
  const pending = PENDING.has(app.stage);
  const note = app.stage === "shortlisted" && !app.slot ? `${owner} shortlisted you. Pick a time for a 20-minute conversation.`
    : app.stage === "conversation" ? `You are talking with ${owner} on ${app.slot}. You can withdraw your interest until they decide.`
    : app.stage === "offer" ? `${owner} would like you on the team as ${(app.offer?.role ?? app.role).toLowerCase()}.`
    : app.stage === "joined" ? `You are on the team as ${app.role.toLowerCase()}.`
    : app.stage === "not-selected" ? `${owner} chose other people this time.`
    : `${owner} will reply here. You can withdraw your interest until they respond.`;
  return (
    <section className="dsc-panel-card dsc-panel-card--actions" aria-label="Your interest">
      <p className="dsc-eyebrow">Your interest</p>
      <div className="dsc-sent-status">
        {app.stage === "joined" ? <Status status="open" label="Joined" /> : app.stage === "not-selected" ? <Status status="closed" label="Not selected" /> : app.stage === "offer" ? <Status status="open" label="Offer" /> : <Status status="pending" />}
        <span>{sentWhen(app)}</span>
      </div>
      <p className="dsc-panel-card__note">{note}</p>
      <DsLink href={requestHref(app.callId)} arrow>View request</DsLink>
      {pending ? <Button variant="secondary" full onClick={onWithdraw}>Withdraw interest</Button> : null}
      <SaveButton saved={saved} onClick={onSave} />
    </section>
  );
}

export function GlancePanel({ rows }: { rows: { label: string; value: string }[] }) {
  return (
    <section className="dsc-panel-card dsc-panel-card--glance" aria-label="At a glance">
      <h2 className="dsc-eyebrow">At a glance</h2>
      <Facts rows={rows} compact />
    </section>
  );
}

export function PrivacyPanel({ text }: { text: string }) {
  return (
    <section className="dsc-panel-card dsc-panel-card--privacy" aria-label="What you are seeing">
      <div className="dsc-panel-card__head"><Eye size={16} strokeWidth={1} aria-hidden focusable={false} /><h2 className="dsc-eyebrow">What you’re seeing</h2></div>
      <p className="dsc-panel-card__note">{text}</p>
    </section>
  );
}

export function SkelSection({ children, height }: { children: React.ReactNode; height?: number }) {
  return <div className="dsc-skel-section" style={height ? { minHeight: height } : undefined}>{children}</div>;
}

export function SkelSide({ rows }: { rows?: boolean }) {
  return (
    <div className="dsc-detail__side" aria-hidden="true">
      <div className="dsc-panel-card dsc-skel-panel"><Bar w={200} h={12} /><Bar w="100%" h={48} r={999} /><Bar w="100%" h={48} r={999} /></div>
      {rows ? <div className="dsc-panel-card dsc-skel-panel dsc-skel-panel--rows"><Bar w={120} h={12} />{[0, 1, 2, 3, 4].map((i) => <div key={i} className="dsc-skel-row dsc-skel-row--tight"><Bar w={110} h={14} /><Bar w={200} h={14} /></div>)}</div> : null}
      <div className="dsc-panel-card dsc-skel-panel"><Bar w={160} h={12} /><Bar w="100%" h={14} /><Bar w={300} h={14} /></div>
    </div>
  );
}

/** The owner's photo, or their initials when we have none. */
export function Portrait({ project, size }: { project: DiscoverProject; size: number }) {
  const owner = project.team[0];
  const src = owner ? faceSrc(owner.id, size * 2) : undefined;
  // eslint-disable-next-line @next/next/no-img-element -- the design's owner portrait
  if (src) return <img className="dsc-portrait" src={src} alt="" width={size} height={size} loading="lazy" decoding="async" />;
  return <span className="dsc-portrait dsc-portrait--initials" style={{ width: size, height: size }} aria-hidden="true">{owner?.initials ?? project.owner[0]}</span>;
}

/** The page is ready, still loading, or could not load (the backend answered with an error and nothing to show). */
export function pageStatus(collab: { ready: boolean; notice?: string; calls: unknown[] }) {
  if (!collab.ready) return "loading" as const;
  if (collab.notice && collab.calls.length === 0) return "error" as const;
  return "ready" as const;
}
