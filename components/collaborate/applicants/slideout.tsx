"use client";

import Button from "@/components/kin/Button";
import { Field, Textarea } from "@/components/kin/Field";
import { Drawer } from "@/components/kin/Overlay";
import { toast } from "@/components/kin/Toast";
import { noteState, type Applicant, type Review } from "@/lib/collab/applicants";
import { StatusPill } from "../applications/shared";
import { CwLink, Dot, Over } from "../workspace/parts";
import { ROW, SLIDE } from "./data";
import { useKept } from "./modals";
import { Portrait, subline, type Group } from "./parts";
import "../styles/applicants.css";

/*
 * Slide-out:Applicant (Applicant Detail), mirrored from the product design's applicants/slideout.tsx: the 480 wide
 * right panel of the member slide-out with the portrait, name, subline and status, what they want to join as,
 * availability, message, skills, a private note and the actions of the status:
 *   New          Shortlist, Not now
 *   Shortlisted  Propose times, Send offer (off until a talk is booked), Not now as a link
 *   Talk booked  Send offer, Not now
 * A call's people have only the New actions, as in the design.
 */

export type SlideHandlers = { shortlist: (id: string) => void; propose: (id: string) => void; offer: (id: string) => void; notNow?: (id: string) => void };

function Footer({ a, group, h }: { a: Applicant; group: Group; h: SlideHandlers }) {
  const notNow = h.notNow ? () => h.notNow?.(a.id) : undefined;
  if (a.status === "New") return <><Button size="sm" onClick={() => h.shortlist(a.id)}>{ROW.shortlist}</Button><Button size="sm" variant="secondary" onClick={notNow}>{ROW.notNow}</Button></>;
  if (group === "call") return null;
  if (a.status === "Shortlisted") return <><Button size="sm" onClick={() => h.propose(a.id)}>{ROW.proposeTimes}</Button><Button size="sm" variant="secondary" disabled>{ROW.sendOffer}</Button><CwLink onClick={notNow}>{ROW.notNow}</CwLink></>;
  if (a.status === "Talk booked") return <><Button size="sm" onClick={() => h.offer(a.id)}>{ROW.sendOffer}</Button><Button size="sm" variant="secondary" onClick={notNow}>{ROW.notNow}</Button></>;
  return null;
}

export function ApplicantSlideOut({ id, group, review, onClose, h }: { id: string | null; group: Group; review: Review; onClose: () => void; h: SlideHandlers }) {
  const live = id ? review.list.find((x) => x.id === id) ?? null : null;
  // the panel keeps its person while it leaves
  const a = useKept(live);
  if (!a) return null;
  const ns = noteState(a);
  const save = () => { review.saveNote(a.id); toast.show({ message: SLIDE.noteToast }); };

  return (
    <Drawer open={!!live} onClose={onClose} eyebrow={SLIDE.eyebrow} label={`${SLIDE.eyebrow} ${a.name}`} width={480} flush className="cd-slide" footer={<Footer a={a} group={group} h={h} />}>
      <div className="cd-member ap-slide">
        <div className="cd-member__body">
          <div className="ap-id">
            <Portrait a={a} size={72} />
            <div className="ap-id__text">
              <h2 className="ap-id__name" tabIndex={-1} data-autofocus>{a.name}</h2>
              <p className="ap-id__sub">{subline(a, group)}</p>
              <StatusPill status={a.status} />
            </div>
          </div>
          <div className="ap-facts">
            <div className="ap-field"><Over className="cw-over--12">{ROW.wants}</Over><p className="ap-field__value">{a.wants}</p></div>
            <div className="ap-field"><Over className="cw-over--12">{ROW.availability}</Over><p className="ap-field__value">{a.availability}</p></div>
          </div>
          <div className="ap-block"><Over className="cw-over--12">{ROW.message}</Over><p className="ap-field__value">{a.message}</p></div>
          {a.skills.length ? (
            <div className="ap-block">
              <Over className="cw-over--12">{SLIDE.skills}</Over>
              <ul className="cd-chips" aria-label="Skills">{a.skills.map((sk) => <li key={sk}>{sk}</li>)}</ul>
            </div>
          ) : null}
          <div className="ap-note">
            <Field label={SLIDE.note.label} hint={SLIDE.note.helper}>
              <Textarea className="ap-ta" value={a.draft} placeholder={SLIDE.note.placeholder} onChange={(e) => review.setDraft(a.id, e.target.value)} />
            </Field>
            <div className="ap-note__actions">
              <Button size="sm" variant="secondary" disabled={ns !== "draft"} onClick={save}>{SLIDE.note.save}</Button>
              {ns === "saved" ? <span className="ap-note__saved" role="status"><Dot tone="green" size={8} />{SLIDE.note.saved}</span> : null}
            </div>
          </div>
        </div>
      </div>
    </Drawer>
  );
}
