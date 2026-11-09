"use client";

import Link from "next/link";
import Button from "@/components/kin/Button";
import { Back, Bar } from "@/components/collaborate/projects/parts";
import { DecisionStatusLabel } from "@/components/collaborate/workspace/Decisions";
import { BACK } from "./data";
import type { AwaitingDecision } from "./probe";
import "../styles/workspace.css";
import "../styles/team.css";
import "../styles/overview-lists.css";

/*
 * Pieces shared by the lists behind the Collaborate Home count tiles, mirrored from the product design
 * (ol-* in ../styles/overview-lists.css): the page frame (back link, header, tab row with its count), the Empty
 * panel, the Loading skeletons and the Awaiting Decision Row.
 */

type FrameProps = {
  eyebrow: string;
  title: string;
  lead: string;
  tab: string;
  /** The count at the right of the tab row ("2 decisions", "Loading"). */
  count: string;
  busy?: boolean;
  children: React.ReactNode;
};

/** Back link, header (eyebrow, serif title, support), one open tab with the count, then the results. */
export function ListPage({ eyebrow, title, lead, tab, count, busy, children }: FrameProps) {
  return (
    <div className="ol-page">
      <div className="ol-stack">
        <Back href={BACK.href}>{BACK.label}</Back>
        <header className="ol-head">
          <p className="ol-eyebrow" data-m="up">{eyebrow}</p>
          <h1 className="ol-h1" data-m="words">{title}</h1>
          <p className="ol-lead" data-m="up">{lead}</p>
        </header>
        <div className="ol-tabs">
          <span className="ol-tab" aria-current="page">{tab}</span>
          <span className="ol-count" aria-live="polite">{count}</span>
        </div>
        <section className="ol-results" aria-label={title} aria-busy={busy || undefined}>{children}</section>
      </div>
    </div>
  );
}

/** Empty State: amber rule, serif headline, support and one action. */
export function EmptyPanel({ headline, support, action, href }: { headline: string; support: string; action: string; href: string }) {
  return (
    <div className="ol-state">
      <span className="ol-state__rule" aria-hidden="true" />
      <h2 className="ol-state__headline">{headline}</h2>
      <p className="ol-state__support">{support}</p>
      <div><Button href={href} arrow="up-right">{action}</Button></div>
    </div>
  );
}

/** Skeleton / List Row: title and status bars, then meta and date bars. */
export function SkeletonRow() {
  return (
    <div className="ol-skrow" aria-hidden="true">
      <div className="ol-skrow__line"><Bar w={300} h={16} /><Bar w={150} h={14} /></div>
      <div className="ol-skrow__line"><Bar w={260} h={12} /><Bar w={180} h={12} /></div>
    </div>
  );
}

/** Decision and task list skeleton: one bordered box of rows. */
export function SkeletonList({ rows }: { rows: number }) {
  return <div className="ol-box" aria-hidden="true">{Array.from({ length: rows }, (_, i) => <SkeletonRow key={i} />)}</div>;
}

/** Skeleton / Request Card (for the Introduction requests list). */
export function SkeletonRequest() {
  return (
    <div className="ol-skreq" aria-hidden="true">
      <div className="ol-skreq__top">
        <Bar w={56} h={56} r={28} />
        <div className="ol-skreq__text"><Bar w={200} h={22} /><Bar w={140} h={12} /></div>
      </div>
      <div className="ol-skreq__chips"><Bar w={120} h={36} /><Bar w={140} h={36} /><Bar w={110} h={36} /></div>
      <div className="ol-skreq__rule" />
      <div className="ol-skreq__fields">
        <div className="ol-skreq__field ol-skreq__field--purpose"><Bar w={110} h={10} /><Bar w="100%" h={16} /></div>
        <div className="ol-skreq__field"><Bar w={80} h={10} /><Bar w="100%" h={16} /></div>
      </div>
      <div className="ol-skreq__actions"><Bar w={81} h={36} /><Bar w={89} h={36} /></div>
    </div>
  );
}

/**
 * Awaiting Decision Row: title and status, who asked and the project, when it was proposed and the deadline, and
 * Review. The row and the button open the decision. The project name is underlined like the milestone of the
 * Decision Row it was cloned from and has no destination in the design.
 */
export function AwaitingDecisionRow({ item }: { item: AwaitingDecision }) {
  return (
    <li className="ol-drow">
      <div className="ol-drow__content">
        <div className="ol-drow__top">
          <Link href={item.href} className="ol-drow__hit">{item.title}</Link>
          <DecisionStatusLabel status="awaiting" />
        </div>
        <div className="ol-drow__bottom">
          <div className="ol-drow__meta">
            <span>Asked by {item.askedBy}</span>
            <span aria-hidden="true">·</span>
            <button type="button" className="ol-drow__project">{item.project}</button>
          </div>
          <div className="ol-drow__meta">
            <span>{item.proposed}</span>
            {item.deadline ? <><span aria-hidden="true">·</span><span>{item.deadline}</span></> : null}
          </div>
        </div>
      </div>
      <Button size="sm" variant="secondary" arrow="up-right" href={item.href} aria-label={`Review ${item.title}`}>Review</Button>
    </li>
  );
}
