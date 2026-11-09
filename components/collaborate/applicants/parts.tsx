"use client";

import { useId } from "react";
import { Check } from "lucide-react";
import Button from "@/components/kin/Button";
import { Skeleton } from "@/components/kin/Overlay";
import { faceSrc } from "@/components/kin/home/parts";
import type { Applicant, ReviewStatus } from "@/lib/collab/applicants";
import { cn } from "@/lib/cn";
import { StatusPill } from "../applications/shared";
import { CwLink, Dot, Initials, Over, initialsOf } from "../workspace/parts";
import { COMPARE, ROW } from "./data";
import "../styles/applicants.css";

/*
 * The pieces the applicant screens share, mirrored from the product design's applicants/parts.tsx (ap-* in
 * ../styles/applicants.css): Applicant Filter, Applicant Row, Compare Bar, Compare Table, the notice with the amber
 * rule, the Joined notice and the Applicant Row Skeleton.
 */

export type Group = "project" | "call";

/* ------------------------------------------------------------------ people */

export function Portrait({ a, size = 56 }: { a: Pick<Applicant, "person" | "name">; size?: number }) {
  const src = faceSrc(a.person, size * 2);
  return (
    <span className="ap-portrait" style={{ ["--ap-p" as string]: `${size}px` } as React.CSSProperties} aria-hidden>
      {/* eslint-disable-next-line @next/next/no-img-element -- their face */}
      {src ? <img src={src} alt="" width={size} height={size} decoding="async" /> : <Initials initials={initialsOf(a.name)} size={size} />}
    </span>
  );
}

/** "Career Researcher · Applied 2 Nov", "... · Talk Tue 10 Nov, 4:00 pm", "... · Offer sent Wed 11 Nov", "... · Joined Fri 13 Nov". A call's people also have the place. */
export function subline(a: Applicant, group: Group, status: ReviewStatus = a.status): string {
  const tail =
    status === "Talk booked" && a.talk ? `Talk ${a.talk}` : status === "Offer sent" && a.offerSent ? `Offer sent ${a.offerSent}` : status === "Joined" && a.joined ? `Joined ${a.joined}` : a.applied ? `Applied ${a.applied}` : "";
  return [a.role, group === "call" ? a.place : "", tail].filter(Boolean).join(" · ");
}

/** The kit's checkbox (k-check), as the design's Checkbox draws it. */
export function Checkbox({ checked, onChange, disabled, label, className }: { checked: boolean; onChange: () => void; disabled?: boolean; label: React.ReactNode; className?: string }) {
  const id = useId();
  return (
    <label className={cn("k-check", disabled && "k-check--disabled", className)} htmlFor={id}>
      <input id={id} type="checkbox" className="k-check__input" checked={checked} disabled={disabled} onChange={onChange} />
      <span className="k-check__box" aria-hidden><Check size={14} strokeWidth={1.8} /></span>
      <span className="k-check__text"><span className="k-check__label">{label}</span></span>
    </label>
  );
}

/* ------------------------------------------------------------------ Applicant Filter */

export type ChipItem = { key: string; label: string; count: number };

export function FilterChips({ items, value, onChange, label }: { items: ChipItem[]; value: string; onChange: (key: string) => void; label: string }) {
  return (
    <div className="ap-chips" role="group" aria-label={label}>
      {items.map((i) => (
        <button type="button" key={i.key} className="ap-chip" aria-pressed={i.key === value} onClick={() => onChange(i.key)}>
          {i.label} {i.count}
        </button>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ Applicant Row */

/** What a row's controls do. A missing handler leaves the control plain, as the design does. */
export type RowHandlers = {
  open?: () => void;
  shortlist?: () => void;
  propose?: () => void;
  offer?: () => void;
  notNow?: () => void;
  undo?: () => void;
  team?: string;
};

function RowActions({ group, status, h }: { group: Group; status: ReviewStatus; h: RowHandlers }) {
  if (group === "call") {
    return (
      <>
        {status === "New" ? <Button size="sm" onClick={h.shortlist}>{ROW.shortlist}</Button> : null}
        {status === "New" || status === "Shortlisted" || status === "Talk booked" ? <Button size="sm" variant="secondary" onClick={h.notNow}>{ROW.notNow}</Button> : null}
      </>
    );
  }
  switch (status) {
    case "New":
      return <><Button size="sm" onClick={h.shortlist}>{ROW.shortlist}</Button><Button size="sm" variant="secondary" onClick={h.notNow}>{ROW.notNow}</Button></>;
    case "Shortlisted":
      return <><Button size="sm" onClick={h.propose}>{ROW.proposeTimes}</Button><Button size="sm" variant="secondary" onClick={h.notNow}>{ROW.notNow}</Button></>;
    case "Talk booked":
      return <><Button size="sm" onClick={h.offer}>{ROW.sendOffer}</Button><Button size="sm" variant="secondary" onClick={h.notNow}>{ROW.notNow}</Button></>;
    case "Offer sent":
      return <p className="ap-row__info">{ROW.offerInfo}</p>;
    case "Joined":
      return h.team ? <Button size="sm" variant="secondary" href={h.team}>{ROW.seeOnTeam}</Button> : <Button size="sm" variant="secondary">{ROW.seeOnTeam}</Button>;
    case "Not now":
      return <Button size="sm" variant="secondary" onClick={h.undo}>{ROW.undo}</Button>;
  }
}

export function ApplicantRow({ a, group, status = a.status, selected, tickLocked, onTick, h }: { a: Applicant; group: Group; status?: ReviewStatus; selected: boolean; tickLocked: boolean; onTick: () => void; h: RowHandlers }) {
  return (
    <article className="ap-row" data-status={status} data-selected={selected || undefined} aria-label={a.name}>
      <div className="ap-row__top">
        <Portrait a={a} />
        <div className="ap-row__who">
          <h3 className="ap-row__name">{a.name}</h3>
          <p className="ap-row__sub">{subline(a, group, status)}</p>
        </div>
        <StatusPill status={status} />
        <Checkbox className="ap-row__tick" checked={selected} disabled={tickLocked && !selected} onChange={onTick} label={<>{ROW.compare}<span className="sr-only"> {a.name}</span></>} />
      </div>
      <div className="ap-row__rule" aria-hidden />
      <div className="ap-row__fields">
        <div className="ap-field ap-field--wants"><Over className="cw-over--12">{ROW.wants}</Over><p className="ap-field__value">{a.wants}</p></div>
        <div className="ap-field ap-field--avail"><Over className="cw-over--12">{ROW.availability}</Over><p className="ap-field__value">{a.availability}</p></div>
        <div className="ap-field ap-field--message"><Over className="cw-over--12">{ROW.message}</Over><p className="ap-field__value">{a.message}</p></div>
      </div>
      <div className="ap-row__actions">
        <RowActions group={group} status={status} h={h} />
        <CwLink className={cn("ap-row__view", h.open && "ap-row__view--go")} onClick={h.open}>
          {ROW.view}<span className="sr-only"> {a.name}</span>
        </CwLink>
      </div>
    </article>
  );
}

/* ------------------------------------------------------------------ Compare Bar */

export function CompareBar({ count, names, onClear, onCompare }: { count: number; names: string; onClear: () => void; onCompare: () => void }) {
  return (
    <section className="ap-bar" aria-label="Compare" data-m="up">
      <div className="ap-bar__text">
        <p className="ap-bar__summary" aria-live="polite">{COMPARE.summary(count)}</p>
        <p className="ap-bar__names">{names}</p>
      </div>
      <CwLink onClick={onClear}>{COMPARE.clear}</CwLink>
      <Button size="sm" onClick={onCompare}>{COMPARE.compare}</Button>
    </section>
  );
}

/* ------------------------------------------------------------------ Notice, Joined notice */

export function Notice({ title, text }: { title: string; text: string }) {
  return (
    <div className="ap-notice">
      <div className="ap-notice__body">
        <p className="ap-notice__title">{title}</p>
        <p className="ap-notice__text">{text}</p>
      </div>
    </div>
  );
}

export function JoinedNotice({ message }: { message: string }) {
  return <p className="ap-joined" role="status"><Dot tone="green" size={8} /><span>{message}</span></p>;
}

/* ------------------------------------------------------------------ Applicant Row Skeleton */

export function RowSkeleton() {
  return (
    <div className="ap-skel">
      <div className="ap-skel__top">
        <Skeleton width={20} height={20} radius={4} />
        <Skeleton width={56} height={56} radius={28} />
        <div className="ap-skel__text">
          <Skeleton width={220} height={20} radius={4} />
          <Skeleton width={160} height={14} radius={4} />
        </div>
        <Skeleton width={96} height={31} radius={16} />
      </div>
      <div className="ap-skel__fields">
        <Skeleton width={160} height={44} radius={4} />
        <Skeleton width={200} height={44} radius={4} />
        <Skeleton width={420} height={44} radius={4} />
      </div>
      <div className="ap-skel__actions">
        <Skeleton width={100} height={36} radius={18} />
        <Skeleton width={96} height={36} radius={18} />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ Compare Table */

export type CompareColumn = { a: Applicant; status: ReviewStatus; actions: React.ReactNode };

/** A real table, so the rows line up across the people. */
export function CompareTable({ columns }: { columns: CompareColumn[] }) {
  const rows: { key: string; label: string; value: (c: CompareColumn) => React.ReactNode; muted?: (c: CompareColumn) => boolean }[] = [
    { key: "role", label: COMPARE.rows[0], value: (c) => c.a.role },
    { key: "wants", label: COMPARE.rows[1], value: (c) => c.a.wants },
    { key: "avail", label: COMPARE.rows[2], value: (c) => c.a.availability },
    { key: "skills", label: COMPARE.rows[3], value: (c) => c.a.skills.join(", ") || COMPARE.notShared, muted: (c) => !c.a.skills.length },
    { key: "exp", label: COMPARE.rows[4], value: (c) => c.a.experience ?? COMPARE.notShared, muted: (c) => !c.a.experience },
    { key: "message", label: COMPARE.rows[5], value: (c) => c.a.message },
    { key: "notes", label: COMPARE.rows[6], value: (c) => c.a.note.trim() || COMPARE.noNote, muted: (c) => !c.a.note.trim() },
  ];
  return (
    <div className="ap-cmp-wrap" data-m="up">
      <table className="ap-cmp" data-columns={columns.length}>
        <caption className="sr-only">Applicants side by side</caption>
        <colgroup>
          <col className="ap-cmp__lab" />
          {columns.map((c) => <col key={c.a.id} />)}
        </colgroup>
        <thead>
          <tr>
            <td className="ap-cmp__corner" aria-hidden />
            {columns.map((c) => (
              <th key={c.a.id} scope="col" className="ap-cmp__col">
                <div className="ap-cmp__who">
                  <Portrait a={c.a} size={64} />
                  <p className="ap-cmp__name">{c.a.name}</p>
                  <StatusPill status={c.status} />
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.key} data-h={r.key}>
              <th scope="row" className="ap-cmp__label"><span><Over className="cw-over--12">{r.label}</Over></span></th>
              {columns.map((c) => <td key={c.a.id}><div className={cn("ap-cmp__in", r.muted?.(c) && "ap-cmp__in--muted")}>{r.value(c)}</div></td>)}
            </tr>
          ))}
          <tr data-h="actions">
            <th scope="row" className="ap-cmp__label"><span><span className="sr-only">Actions</span></span></th>
            {columns.map((c) => <td key={c.a.id}><div className="ap-cmp__acts">{c.actions}</div></td>)}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
