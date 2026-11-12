"use client";

import { useState } from "react";
import { ArrowRight, ArrowUpRight, CircleCheck, Lock } from "lucide-react";
import Button from "@/components/kin/Button";
import { Chip } from "@/components/kin/Chip";
import { Modal, Sheet, SheetBanner } from "@/components/kin/Overlay";
import { useLayout } from "@/components/kin/useLayout";
import { faceSrc } from "@/components/kin/home/parts";
import { useSendMessage } from "@/components/messages/send";
import { ME, PEOPLE, type PersonId } from "@/lib/data/people";
import Img from "@/components/kin/Img";

/*
 * The design's plan modal (classes ch-ov* in components/kin/community.css): who, a few times to choose from, a
 * short note, then "Invitation sent". Sending posts an invitation into your conversation with them, so they see
 * it in Messages and nothing starts until they accept.
 */

const TIMES = ["Today, 6:30 PM", "Tomorrow, 12:30 PM", "Another time"];
export const TIMES_NOW = ["Right now", "Today, 5:00 PM", "Tomorrow, 10:00 AM"];
const PRIVACY = "They will see your invitation and choose whether to join. Nothing starts until they accept.";

export type Plan = {
  eyebrow: string;
  title: string;
  lead: string;
  people: PersonId[];
  /** The line beside the faces (the design's peopleText, e.g. "Suggested: Folake"); their names when omitted. */
  peopleText?: string;
  /** The time choices (the design's T_EVE when omitted; T_NOW for a Quick Catch-up). */
  times?: string[];
  /** The conversation the invitation goes to (a project's), or the person's direct chat when omitted. */
  convo?: string;
  note: string;
  placeholder?: string;
  image?: string;
  /** Where the invitation's card points, e.g. the project's meeting room. */
  href?: string;
};

const names = (ids: PersonId[]) => {
  const n = ids.map((p) => PEOPLE[p]?.name.split(" ")[0] ?? "A member");
  return n.length > 1 ? `${n.slice(0, -1).join(", ")} and ${n[n.length - 1]}` : n[0] ?? "";
};

export default function PlanCall({ plan, open, onClose }: { plan: Plan; open: boolean; onClose: () => void }) {
  const send = useSendMessage();
  const [slot, setSlot] = useState(0);
  const [note, setNote] = useState(plan.note);
  const [sent, setSent] = useState(false);
  const close = () => { onClose(); setTimeout(() => { setSent(false); setSlot(0); setNote(plan.note); }, 300); };
  const invite = () => {
    const msg = { from: ME.id as PersonId, kind: "invite" as const, invite: "meetup" as const, title: plan.title.replace(/^Arrange a /, ""), detail: [(plan.times ?? TIMES)[slot], note.trim()].filter(Boolean).join(" · "), href: plan.href };
    // A project that has no conversation yet: the invitation goes to the first person's direct chat instead.
    if (!(plan.convo && send(plan.convo, msg))) send(plan.people[0], msg);
    setSent(true);
  };
  const image = plan.image ?? faceSrc(plan.people[0]);
  const phone = useLayout() === "mobile";
  const times = plan.times ?? TIMES;
  const faces = (size: number, gap: number) => (
    <div className="ch-ppl">
      <span className="ch-avs" style={{ "--ch-av-gap": `-${gap}px` } as React.CSSProperties}>
        {plan.people.map((p) => (
          <span key={p} className="ch-av ch-av--light" style={{ width: size, height: size }}>
            {faceSrc(p) ? <Img src={faceSrc(p)} sizes={`${size}px`} /> : null}
          </span>
        ))}
      </span>
      <span className="ch-ppl__text">{plan.peopleText ?? names(plan.people)}</span>
    </div>
  );

  // Phones: the design's bottom sheets (Sheet:Arrange a Create Call / Quick Catch-up, Sheet:Invitation sent).
  if (phone) {
    if (sent) {
      return (
        <Sheet open={open} onClose={close} title="Invitation sent" variant="result" actions={<Button size="lg" onClick={close}>Done</Button>}>
          <span className="chs__ok"><CircleCheck size={40} strokeWidth={1.25} absoluteStrokeWidth aria-hidden /></span>
          <p className="ch-ov__lead">{PRIVACY}</p>
        </Sheet>
      );
    }
    return (
      <Sheet open={open} onClose={close} title={plan.title} variant="plan" actions={<><Button variant="secondary" size="lg" onClick={close}>Cancel</Button><Button size="lg" iconRight={<ArrowUpRight strokeWidth={1.5} aria-hidden />} onClick={invite}>Send invitation</Button></>}>
        <SheetBanner image={image} size="sm" />
        <p className="chs__eyebrow">{plan.eyebrow}</p>
        <p className="ch-ov__lead">{plan.lead}</p>
        {faces(44, 12)}
        <div className="ch-ov__field">
          <p className="ch-ov__label">Choose a time</p>
          <div className="ch-chips chs__times" role="group" aria-label="Choose a time">
            {times.map((t, i) => <Chip key={t} variant="choice" selected={slot === i} onClick={() => setSlot(i)}>{t}</Chip>)}
          </div>
        </div>
        <textarea className="ch-note" aria-label="Add a short note" placeholder={plan.placeholder ?? "Add a short note (optional)"} rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
        <p className="ch-ov__privacy"><Lock size={16} strokeWidth={1.25} absoluteStrokeWidth aria-hidden /><span>{PRIVACY}</span></p>
      </Sheet>
    );
  }

  if (sent) {
    return (
      <Modal open={open} onClose={close} width={480} hideClose label="Invitation sent" className="ch-ov ch-ov--result">
        <div className="ch-result">
          <span className="ch-result__icon"><CircleCheck size={40} strokeWidth={1.25} absoluteStrokeWidth aria-hidden /></span>
          <h2 className="ch-result__title">Invitation sent</h2>
          <p className="ch-result__text">{PRIVACY}</p>
          <div className="ch-result__actions">
            <Button onClick={close}>Done</Button>
          </div>
        </div>
      </Modal>
    );
  }
  return (
    <Modal open={open} onClose={close} width={560} image={image} eyebrow={plan.eyebrow} title={plan.title} className="ch-ov ch-ov--modal">
      <div className="ch-ov__body">
        <p className="ch-ov__lead">{plan.lead}</p>
        {faces(40, 10)}
        <div className="ch-ov__field">
          <p className="ch-ov__label">Choose a time</p>
          <div className="ch-chips" role="group" aria-label="Choose a time">
            {times.map((t, i) => <Chip key={t} variant="choice" selected={slot === i} onClick={() => setSlot(i)}>{t}</Chip>)}
          </div>
        </div>
        <textarea className="ch-note" aria-label="Add a short note" placeholder={plan.placeholder ?? "Add a short note (optional)"} rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
        <p className="ch-ov__privacy"><Lock size={16} strokeWidth={1.25} absoluteStrokeWidth aria-hidden /><span>{PRIVACY}</span></p>
        <div className="ch-ov__actions">
          <Button iconRight={<ArrowRight strokeWidth={1.5} aria-hidden />} onClick={invite}>Send invitation</Button>
          <Button variant="secondary" onClick={close}>Cancel</Button>
        </div>
      </div>
    </Modal>
  );
}
