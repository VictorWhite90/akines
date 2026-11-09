"use client";

import { useEffect, useState } from "react";
import Button from "@/components/kin/Button";
import { Field, Input, Textarea } from "@/components/kin/Field";
import { Modal } from "@/components/kin/Overlay";
import { clock24, nextWeekdays, type Applicant, type OfferTerms } from "@/lib/collab/applicants";
import { CwLink } from "../workspace/parts";
import { CLOSE_MODAL, NOT_NOW, OFFER, START_MODAL, TIMES } from "./data";
import "../styles/applicants.css";

/*
 * The overlays of the applicant journeys, mirrored from the product design's applicants/modals.tsx, all 640 wide:
 * Propose times, Send offer, Not now, Close call and Start project. The person is kept while a modal leaves, so
 * its headline does not change during the exit.
 */

/** Keeps the last value while a modal or panel leaves. */
export function useKept<T>(value: T | null): T | null {
  const [last, setLast] = useState(value);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- keep the last value for the exit
  useEffect(() => { if (value) setLast(value); }, [value]);
  return value ?? last;
}

const filled = (v: string) => (v.trim() ? "ap-filled" : undefined);

/* ------------------------------------------------------------------ Modal:Propose times */

/** Sends the chosen slots as useCollab keeps them: "Mon 9 Nov · 14:00". */
export function ProposeTimesModal({ open, person, onClose, onSend }: { open: boolean; person: Applicant | null; onClose: () => void; onSend: (slots: string[], message: string) => void }) {
  const p = useKept(person);
  const [days, setDays] = useState<string[]>(() => nextWeekdays());
  const defaults = (d: string[]) => TIMES.chosen.map(([di, si]) => `${d[di]}|${TIMES.slots[si]}`);
  const [chosen, setChosen] = useState<string[]>(() => defaults(days));
  const [message, setMessage] = useState("");
  useEffect(() => {
    if (!open) return;
    const d = nextWeekdays();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- every opening starts again from the frame
    setDays(d); setChosen(defaults(d)); setMessage("");
  }, [open]);

  const toggle = (key: string) => setChosen((c) => (c.includes(key) ? c.filter((x) => x !== key) : c.length >= TIMES.max ? c : [...c, key]));
  const send = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!chosen.length) return;
    const slots = chosen.map((k) => { const [day, time] = k.split("|"); return `${day} · ${clock24(time)}`; });
    onSend(slots, message);
  };
  if (!p) return null;

  return (
    <Modal open={open} onClose={onClose} width={640} eyebrow={TIMES.eyebrow} title={TIMES.title(p.first)} description={TIMES.description}
      footer={<><Button type="submit" form="ap-times-form" disabled={!chosen.length}>{TIMES.send}</Button><CwLink onClick={onClose}>{TIMES.cancel}</CwLink></>}>
      <form id="ap-times-form" className="ap-form" onSubmit={send} noValidate>
        <fieldset className="ap-slots">
          <legend className="sr-only">Times</legend>
          {days.map((day) => (
            <div className="ap-day" key={day}>
              <span className="ap-day__name">{day}</span>
              {TIMES.slots.map((s) => {
                const key = `${day}|${s}`;
                const on = chosen.includes(key);
                return (
                  <button type="button" key={key} className="ap-slot" aria-pressed={on} aria-disabled={!on && chosen.length >= TIMES.max ? true : undefined} onClick={() => toggle(key)}>
                    {s}<span className="sr-only"> on {day}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </fieldset>
        <p className="ap-count" aria-live="polite">{TIMES.count(chosen.length)}</p>
        <Field label={TIMES.message.label} hint={TIMES.message.hint}>
          <Textarea className="ap-ta" value={message} placeholder={TIMES.message.placeholder} onChange={(e) => setMessage(e.target.value)} />
        </Field>
      </form>
    </Modal>
  );
}

/* ------------------------------------------------------------------ Modal:Send offer */

function CalendarIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d="M6 2.5V5.5M14 2.5V5.5" />
      <rect x="2.5" y="4.5" width="15" height="13" rx="1.5" />
      <path d="M2.5 8.5H17.5" />
    </svg>
  );
}

/** Opens filled as the frame: the role they asked for, the hours, a start date two weeks out (a Monday) and a note. */
export function SendOfferModal({ open, person, onClose, onSend }: { open: boolean; person: Applicant | null; onClose: () => void; onSend: (terms: OfferTerms) => void }) {
  const p = useKept(person);
  const [role, setRole] = useState("");
  const [hours, setHours] = useState("");
  const [start, setStart] = useState("");
  const [note, setNote] = useState("");
  useEffect(() => {
    if (!open || !person) return;
    const monday = nextWeekdays(10).filter((d) => d.startsWith("Mon"))[1] ?? nextWeekdays(1)[0];
    // eslint-disable-next-line react-hooks/set-state-in-effect -- every opening starts again from the frame
    setRole(person.wants); setHours(OFFER.hours.value); setStart(monday); setNote(OFFER.note.value);
  }, [open, person]);

  const ready = Boolean(role.trim() && hours.trim() && start.trim());
  const send = (e?: React.FormEvent) => { e?.preventDefault(); if (ready) onSend({ role: role.trim(), hours: hours.trim(), start: start.trim(), note: note.trim() }); };
  if (!p) return null;

  return (
    <Modal open={open} onClose={onClose} width={640} eyebrow={OFFER.eyebrow} title={OFFER.title(p.first)} description={OFFER.description(p.first)}
      footer={<><Button type="submit" form="ap-offer-form" disabled={!ready}>{OFFER.send}</Button><CwLink onClick={onClose}>{OFFER.cancel}</CwLink></>}>
      <form id="ap-offer-form" className="ap-form" onSubmit={send} noValidate>
        <Field label={OFFER.role.label} hint={OFFER.role.hint}><Input className={filled(role)} value={role} placeholder={OFFER.role.placeholder} onChange={(e) => setRole(e.target.value)} /></Field>
        <div className="ap-form__pair">
          <Field label={OFFER.hours.label} hint={OFFER.hours.hint}><Input className={filled(hours)} value={hours} placeholder={OFFER.hours.placeholder} onChange={(e) => setHours(e.target.value)} /></Field>
          {/* the design draws no date picker, so the date is typed */}
          <Field label={OFFER.start.label} hint={OFFER.start.hint}><Input className={`ap-date ${filled(start) ?? ""}`.trim()} value={start} placeholder={OFFER.start.placeholder} onChange={(e) => setStart(e.target.value)} iconRight={<CalendarIcon />} /></Field>
        </div>
        <Field label={OFFER.note.label} hint={OFFER.note.hint}><Textarea className="ap-ta" value={note} placeholder={OFFER.note.placeholder} onChange={(e) => setNote(e.target.value)} /></Field>
      </form>
    </Modal>
  );
}

/* ------------------------------------------------------------------ Modal:Not now */

export function NotNowModal({ open, person, onClose, onSend }: { open: boolean; person: Applicant | null; onClose: () => void; onSend: (message: string) => void }) {
  const p = useKept(person);
  const [message, setMessage] = useState("");
  // eslint-disable-next-line react-hooks/set-state-in-effect -- a fresh form each time it opens
  useEffect(() => { if (open) setMessage(""); }, [open]);
  if (!p) return null;
  return (
    <Modal open={open} onClose={onClose} width={640} eyebrow={NOT_NOW.eyebrow} title={NOT_NOW.title(p.first)} description={NOT_NOW.description(p.first)}
      footer={<><Button type="submit" form="ap-notnow-form">{NOT_NOW.send}</Button><CwLink onClick={onClose}>{NOT_NOW.cancel}</CwLink></>}>
      <form id="ap-notnow-form" className="ap-form" onSubmit={(e) => { e.preventDefault(); onSend(message); }} noValidate>
        <Field label={NOT_NOW.to.label} hint={NOT_NOW.to.hint}><Input className="ap-filled" value={p.name} readOnly /></Field>
        <Field label={NOT_NOW.message.label} hint={NOT_NOW.message.hint}><Input className={filled(message)} value={message} placeholder={NOT_NOW.message.placeholder} onChange={(e) => setMessage(e.target.value)} /></Field>
      </form>
    </Modal>
  );
}

/* ------------------------------------------------------------------ Modal:Close call, Modal:Start project */

export function CloseCallModal({ open, onClose, onConfirm }: { open: boolean; onClose: () => void; onConfirm: () => void }) {
  return (
    <Modal open={open} onClose={onClose} width={640} eyebrow={CLOSE_MODAL.eyebrow} title={CLOSE_MODAL.title} description={CLOSE_MODAL.description}
      footer={<><Button onClick={onConfirm}>{CLOSE_MODAL.confirm}</Button><CwLink onClick={onClose}>{CLOSE_MODAL.cancel}</CwLink></>} />
  );
}

export function StartProjectModal({ open, names, onClose, onConfirm }: { open: boolean; names: string[]; onClose: () => void; onConfirm: () => void }) {
  // kept as one string, so a new array with the same names is the same value
  const shown = useKept(names.join("|") || null)?.split("|") ?? [];
  if (!shown.length) return null;
  return (
    <Modal open={open} onClose={onClose} width={640} eyebrow={START_MODAL.eyebrow} title={START_MODAL.title(shown)} description={START_MODAL.description(shown)}
      footer={<><Button onClick={onConfirm}>{START_MODAL.confirm}</Button><CwLink onClick={onClose}>{START_MODAL.cancel}</CwLink></>} />
  );
}
