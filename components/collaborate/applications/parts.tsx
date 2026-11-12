"use client";

import Button from "@/components/kin/Button";
import { faceSrc, photoSrc } from "@/components/kin/home/parts";
import { toast } from "@/components/kin/Toast";
import type { useCollab } from "@/lib/collab/useCollab";
import type { DiscoverProject } from "@/lib/collab/projects";
import type { Application } from "@/lib/collab/types";
import { Back, Portrait } from "../projects/parts";
import { slotDays, slotFull, type Slot } from "./data";
import { StatusPill, type ApplicationStatus } from "./shared";
import "../styles/projects.css";
import "../styles/applications.css";
import Img from "@/components/kin/Img";

/*
 * Building blocks of the application stage pages, mirrored from the product design (12.44 APPLICATION STATUS, classes
 * in ../styles/applications.css): the two column layout with its heading, Next Steps Panel, Request Summary, Talk Card,
 * Offer Card, Slot Picker (Day Tab and Slot Chip) and the end state layout, which reuses "Interest sent" (dsc-).
 */

type Collab = ReturnType<typeof useCollab>;

/** The host's round photo (Request Summary, Offer Card); initials when we have none. */
function HostAvatar({ project, size, large }: { project: DiscoverProject; size: number; large?: boolean }) {
  const src = faceSrc(project.ownerId);
  const cls = `apl-card__avatar${large ? " apl-card__avatar--lg" : ""}`;
  if (src) return <Img sizes={`${size}px`} className={cls} src={src} width={size} height={size} />;
  return <span className={`${cls} dsc-portrait--initials`} aria-hidden="true">{project.team[0]?.initials ?? project.owner[0]}</span>;
}

/** The large photograph of the end states, as on "Interest sent". */
export const endPhoto = (p: DiscoverProject) => faceSrc(p.ownerId) ?? photoSrc(p.call.photo);

/**
 * Withdrawing interest, from the request page or the project page: the Interest withdrawn toast offers Undo, which sends
 * the same interest again.
 */
export function withdrawWithUndo(collab: Collab, a: Application) {
  collab.withdraw(a.id);
  toast.show({
    message: "Interest withdrawn.",
    actionLabel: "Undo",
    onAction: () => { void collab.apply({ callId: a.callId, role: a.role, works: a.works, links: a.links, files: a.files, statement: a.statement, availability: a.availability, materials: a.materials }); },
  });
}

/* ------------------------------------------------------------------ page layout */

/** Page with the main column (880) and the side column (440), 64 apart. */
export function RequestLayout({ back, head, side, children }: { back: { href: string; label: string }; head: React.ReactNode; side: React.ReactNode; children?: React.ReactNode }) {
  return (
    <div className="apl-page">
      <div className="apl-layout">
        <div className="apl-main">
          <Back href={back.href}>{back.label}</Back>
          {head}
          {children}
        </div>
        <aside className="apl-side">{side}</aside>
      </div>
    </div>
  );
}

/** Heading block: the headline (48) and the support line under it, 36 px below the back link. */
export function RequestHead({ title, lead }: { title: string; lead: string }) {
  return (
    <header className="apl-head">
      <h1 className="apl-h1" data-m="words">{title}</h1>
      <p className="apl-lead" data-m="up">{lead}</p>
    </header>
  );
}

/** Next Steps Panel: serif title and three numbered lines. */
export function NextSteps({ title, lines }: { title: string; lines: [string, string, string] }) {
  return (
    <section className="apl-panel" aria-label={title} data-m="up">
      <h2 className="apl-panel__title">{title}</h2>
      <ol className="apl-panel__lines">
        {lines.map((line, i) => (
          <li key={i} className="apl-panel__line">
            <span className="apl-panel__num" aria-hidden="true">{i + 1}</span>
            <span className="apl-panel__text">{line}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}

/* ------------------------------------------------------------------ cards */

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="apl-fact">
      <dt className="apl-label">{label}</dt>
      <dd className="apl-fact__value">{value}</dd>
    </div>
  );
}

/** Request Summary: who, role, availability, when it was sent and the note. */
export function RequestSummary({ project: p, app, sent, status }: { project: DiscoverProject; app: Application; sent: string; status: ApplicationStatus }) {
  return (
    <section className="apl-card" aria-label="Your request" data-m="up">
      <div className="apl-card__head">
        <HostAvatar project={p} size={72} large />
        <div className="apl-card__info">
          <p className="apl-label">Your request to join</p>
          <p className="apl-card__title">{p.title}</p>
          <p className="apl-card__sub">Led by {p.owner}, {p.place}</p>
        </div>
        <StatusPill status={status} />
      </div>
      <hr className="apl-rule" />
      <dl className="apl-facts">
        <Fact label="Role" value={app.role} />
        {app.availability ? <Fact label="Availability" value={app.availability} /> : null}
        <Fact label="Sent" value={sent} />
      </dl>
      {app.statement ? (
        <>
          <hr className="apl-rule" />
          <div className="apl-noteblock">
            <p className="apl-label">Your note</p>
            <p className="apl-noteblock__text">{app.statement}</p>
          </div>
        </>
      ) : null}
    </section>
  );
}

/** Talk Card: the booked date and time, length, where, with whom. */
export function TalkCard({ slot, host, hostName }: { slot: Slot; host: string; hostName: string }) {
  return (
    <section className="apl-card" aria-label="Your talk" data-m="up">
      <div className="apl-card__head apl-card__head--top">
        <div className="apl-when">
          <p className="apl-label">Your talk with {host}</p>
          <p className="apl-when__date">{slot.weekday} {slot.date}</p>
          {slot.time ? <p className="apl-when__time">{slot.time} WAT</p> : null}
        </div>
        <StatusPill status="Talk booked" />
      </div>
      <hr className="apl-rule" />
      <dl className="apl-facts">
        <Fact label="Length" value="20 minutes" />
        <Fact label="Where" value="Video call" />
        <Fact label="With" value={hostName} />
      </dl>
      <p className="apl-card__note">The call link is ready when it is time. You will find it here and in your messages.</p>
    </section>
  );
}

/** Offer Card: the offer with role, fee, start date and the host's note. */
export function OfferCard({ project: p, role, fee, start, sent, note }: { project: DiscoverProject; role: string; fee?: string; start?: string; sent: string; note?: string }) {
  const host = p.owner.split(" ")[0];
  return (
    <section className="apl-card" aria-label="Your offer" data-m="up">
      <div className="apl-card__head">
        <HostAvatar project={p} size={56} />
        <div className="apl-card__info">
          <p className="apl-label">Offer from {p.owner}</p>
          <p className="apl-card__title">{p.title}</p>
        </div>
        <StatusPill status="Offer received" />
      </div>
      <hr className="apl-rule" />
      <dl className="apl-facts">
        <Fact label="Role" value={role} />
        {fee ? <Fact label="Hours" value={fee} /> : null}
        {start ? <Fact label="Start date" value={start} /> : null}
        <Fact label="Sent" value={sent} />
      </dl>
      {note ? (
        <>
          <hr className="apl-rule" />
          <div className="apl-noteblock apl-noteblock--offer">
            <p className="apl-label">A note from {host}</p>
            <p className="apl-noteblock__quote">{note}</p>
          </div>
        </>
      ) : null}
    </section>
  );
}

/* ------------------------------------------------------------------ slot picker */

const IconCheck = () => (
  <svg width={14} height={14} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth={0.875} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    <path transform="translate(2.3333 3.5)" d="M9.3333 0L2.9167 6.4167L0 3.5" />
  </svg>
);

/**
 * Slot Picker: the host's days (Day Tab), the times of the chosen day (Slot Chip), the summary and Confirm time.
 * Changing the day clears the time, as the design's variants do.
 */
export function SlotPicker({ host, slots, day, slot, onDay, onSlot, onConfirm }: { host: string; slots: string[]; day: string; slot: string | null; onDay: (d: string) => void; onSlot: (s: string) => void; onConfirm: () => void }) {
  const days = slotDays(slots);
  const current = days.find((d) => d.key === day) ?? days[0];
  const picked = current?.slots.find((s) => s.value === slot) ?? null;
  return (
    <section className="apl-card apl-picker" aria-label="Available times" data-m="up">
      <header className="apl-picker__head">
        <h2 className="apl-picker__heading">{host}&apos;s available times</h2>
        <p className="apl-picker__support">Choose one time. You can change it later.</p>
      </header>
      <div className="apl-days" role="group" aria-label="Day">
        {days.map((d) => (
          <button key={d.key} type="button" className="apl-day" aria-pressed={d.key === current?.key} data-selected={d.key === current?.key || undefined} onClick={() => d.key !== current?.key && onDay(d.key)}>
            <span className="apl-day__weekday">{d.weekday}</span>
            <span className="apl-day__date">{d.date}</span>
            {d.key === current?.key ? <i className="apl-day__bar" aria-hidden="true" /> : null}
          </button>
        ))}
      </div>
      {current ? (
        <div className="apl-slots" role="group" aria-label={`Times on ${current.weekday} ${current.date}`}>
          {current.slots.map((s) => (
            <button key={s.value} type="button" className="apl-slot" aria-pressed={slot === s.value} data-selected={slot === s.value || undefined} onClick={() => onSlot(s.value)}>
              {slot === s.value ? <IconCheck /> : null}
              <span>{s.time || s.value}</span>
            </button>
          ))}
        </div>
      ) : null}
      <hr className="apl-rule" />
      <div className="apl-picker__foot">
        <p className="apl-picker__summary" data-chosen={picked ? "true" : undefined} aria-live="polite">{picked ? slotFull(picked) : "Choose a time to continue."}</p>
        <Button disabled={!picked} onClick={onConfirm}>Confirm time</Button>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ end states */

/** End state (Joined, Offer declined, Not selected, Withdrawn): the "Interest sent" layout, the host's photograph flush right. */
export function EndState({ project: p, eyebrow, title, lead, meta, status, note, children }: { project: DiscoverProject; eyebrow: string; title: string; lead: string; meta: string; status: ApplicationStatus; note: string; children: React.ReactNode }) {
  return (
    <div className="dsc-sent">
      <div className="dsc-sent__content">
        <p className="dsc-eyebrow" data-m="up">{eyebrow}</p>
        <h1 className="dsc-h1 dsc-h1--sent" data-m="words">{title}</h1>
        <p className="dsc-lead" data-m="up">{lead}</p>
        <section className="dsc-request" aria-label="Your request" data-m="up">
          <div className="dsc-request__row">
            <Portrait project={p} size={64} />
            <div className="dsc-request__info">
              <p className="dsc-request__name">{p.title}</p>
              <p className="dsc-request__meta">{meta}</p>
            </div>
            <StatusPill status={status} />
          </div>
          <hr className="dsc-request__rule" />
          <p className="dsc-request__note">{note}</p>
        </section>
        <div className="dsc-actions">{children}</div>
      </div>
      <div className="dsc-sent__photo" data-m="frame">
        <Img sizes="(max-width: 899px) 100vw, 40vw" className="cover" src={endPhoto(p)} />
      </div>
    </div>
  );
}
