"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, CircleCheck, Lock, CircleAlert } from "lucide-react";
import Button from "@/components/kin/Button";
import { Chip } from "@/components/kin/Chip";
import { Modal, Sheet, SheetBanner } from "@/components/kin/Overlay";
import { useLayout } from "@/components/kin/useLayout";
import { faceSrc } from "@/components/kin/home/parts";
import { useSendMessage } from "@/components/messages/send";
import { ME, PEOPLE, type PersonId } from "@/lib/data/people";
import { DEMO } from "@/lib/demo/mode";
import { useLocal } from "@/lib/useLocal";
import Img from "@/components/kin/Img";
import "./care-settings-mobile.css";

/*
 * The product design's care screens (classes in components/kin/community.css). Phones (below 768): the shell's top bar replaces the
 * back link and any heading that repeats its title; buttons are full width and 56 high with the up-right arrow; the trust dialog is a
 * bottom sheet (care-settings-mobile.css, components/kin/sheets-mobile.css).
 */

const Back = () => <Link href="/" className="ch-tlink">Back to Community Home</Link>;
const Arrow = <ArrowRight strokeWidth={1.5} aria-hidden />;
const usePhone = () => useLayout() === "mobile";
/** Phones use the design's "Button Large" (56, full width, arrow up-right); wider screens keep today's button. */
const primaryBtn = (phone: boolean) => (phone ? ({ size: "lg", full: true, arrow: "up-right" } as const) : { iconRight: Arrow });
const secondaryBtn = (phone: boolean) => (phone ? ({ size: "lg", full: true } as const) : {});

export function QuietCompany() {
  const here: PersonId[] = ["tunde-bakare", "ngozi", "folake", "chuka"];
  const phone = usePhone();
  const size = phone ? 72 : 80;
  return (
    <div className="ch-page ch-page--bleed ch-csm">
      <div className="ch-care">
        <p className="ch-label ch-care__eyebrow">Quiet company</p>
        <h1 className="ch-care__title" data-m="words">You are in quiet company.</h1>
        <p className="ch-care__desc">Four others are here. No one is expected to speak. Stay as long as you like.</p>
        <div className="ch-care__present" aria-label="Four people are here">
          {here.map((id) => {
            const src = faceSrc(id);
            return (
              <span key={id} className="ch-av ch-av--accent" style={{ width: size, height: size }}>{src ? <Img src={src} sizes={`${size}px`} /> : null}</span>
            );
          })}
        </div>
        <div className="ch-care__acts">
          <Button {...primaryBtn(phone)} href="/">Leave quietly</Button>
          <Link href="/wellbeing/reflect" className="ch-tlink">Write a private note instead</Link>
        </div>
      </div>
    </div>
  );
}

export function ReflectPrivately() {
  // Preview starts with the design's sample note.
  const [text, setText] = useLocal<string>("ak:reflect-draft", DEMO ? "A slow morning, one honest conversation with a friend, and time to finish the outreach plan." : "");
  const [notes, setNotes] = useLocal<{ at: number; text: string }[]>("ak:reflect-notes", []);
  const [saved, setSaved] = useLocal<boolean>("ak:reflect-saved", false);
  const phone = usePhone();
  return (
    <div className="ch-page ch-csm">
      <div className="ch-wide">
        <Back />
        <p className="ch-label">Wellbeing · Reflect privately</p>
        <h1 className="ch-wide__title" data-m="words">What would make today feel a little lighter?</h1>
        <p className="ch-wide__desc">Write whatever comes to mind. There is no right answer.</p>
        <p className="ch-line"><Lock size={20} strokeWidth={1.25} aria-hidden /><span>Only you can see this. It is never shared, and nothing is sent.</span></p>
        {saved ? (
          <div className="ch-acts ch-acts--col" aria-live="polite">
            <p className="ch-confirm"><CircleCheck size={20} strokeWidth={1.5} aria-hidden /><span>Saved. Only you can see this.</span></p>
            <button type="button" className="ch-tlink" onClick={() => { setSaved(false); setText(""); }}>Write another</button>
            <Button variant="secondary" {...secondaryBtn(phone)} href="/">Back to Community Home</Button>
          </div>
        ) : (
          <>
            <textarea className="ch-field" aria-label="Your private note" placeholder="Start writing here." value={text} onChange={(e) => setText(e.target.value)} />
            <div className="ch-acts">
              <Button {...primaryBtn(phone)} onClick={() => { if (!text.trim()) return; setNotes([{ at: Date.now(), text: text.trim() }, ...notes]); setSaved(true); }}>Save privately</Button>
              <Button variant="secondary" {...secondaryBtn(phone)} href="/">Back to Community Home</Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const OPTIONS: [string, string][] = [
  ["A counsellor or therapist", "Someone trained to listen, who you can see regularly."],
  ["Your doctor or a local clinic", "A good first step if you are not sure where to start."],
  ["A helpline in your country", "Often free and confidential. Search for one near you."],
];
export function ProfessionalSupport() {
  const [trust, setTrust] = useState(false);
  const phone = usePhone();
  return (
    <div className="ch-page ch-csm ch-csm--pro">
      <div className="ch-wide">
        <Back />
        <p className="ch-label">Wellbeing · Professional support</p>
        <h1 className="ch-wide__title" data-m="words">Find professional support</h1>
        <p className="ch-wide__desc">Talking with a trained professional can help, whatever the reason. Akines keeps this page private and does not share it with anyone.</p>
        <div className="ch-opts" data-m="stagger">
          {OPTIONS.map(([t, d]) => <div key={t} className="ch-opt"><span className="ch-opt__title">{t}</span><span className="ch-opt__desc">{d}</span></div>)}
        </div>
        <p className="ch-alert" role="note"><CircleAlert size={20} strokeWidth={1.25} aria-hidden /><span>If you or someone near you may be in immediate danger, contact your local emergency number now.</span></p>
        <div className="ch-acts">
          <Button {...primaryBtn(phone)} onClick={() => setTrust(true)}>Message someone I trust</Button>
          <Button variant="secondary" {...secondaryBtn(phone)} href="/">Back to Community Home</Button>
        </div>
      </div>
      <TrustModal open={trust} onClose={() => setTrust(false)} />
    </div>
  );
}

/* The design's "Message someone I trust" modal (560 wide, then "Message sent"). The message goes to their chat. */
const TRUSTED: PersonId[] = ["amara-okafor", "folake", "chuka"];
const TRUST_NOTE = "Hi, it has been a heavy week. Could we talk for a little while tonight?";
function TrustModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const send = useSendMessage();
  const [who, setWho] = useState(0);
  const [note, setNote] = useState(TRUST_NOTE);
  const [sent, setSent] = useState(false);
  const close = () => { onClose(); setTimeout(() => { setSent(false); setWho(0); setNote(TRUST_NOTE); }, 300); };
  const submit = () => {
    if (!note.trim()) return;
    send(TRUSTED[who], { from: ME.id as PersonId, kind: "text", text: note.trim() } as Parameters<typeof send>[1]);
    setSent(true);
  };
  const phone = usePhone();
  if (phone) {
    // The design's Sheet:Message someone I trust and Sheet:Message sent (its PhoneOverlay).
    if (sent) {
      return (
        <Sheet open={open} onClose={close} title="Message sent" variant="result" actions={<><Button variant="secondary" size="lg" onClick={() => { close(); router.push("/messages"); }}>Open Messages</Button><Button size="lg" onClick={close}>Done</Button></>}>
          <span className="chs__ok"><CircleCheck size={40} strokeWidth={1.25} absoluteStrokeWidth aria-hidden /></span>
          <p className="ch-ov__lead">Only the person you chose will see it. Your check-in stays private.</p>
        </Sheet>
      );
    }
    return (
      <Sheet open={open} onClose={close} title="Message someone I trust" variant="form" actions={<><Button variant="secondary" size="lg" onClick={close}>Cancel</Button><Button size="lg" onClick={submit}>Send message</Button></>}>
        <SheetBanner image="/kin/design/home/community/ngozi.jpg" size="md" label="Wellbeing" />
        <p className="ch-ov__lead">Choose who you would like to reach. Only they will see your message.</p>
        <div className="ch-ov__field">
          <p className="ch-ov__label">Who do you trust?</p>
          <div className="ch-chips" role="group" aria-label="Who do you trust?">
            {TRUSTED.map((id, i) => <Chip key={id} variant="choice" selected={who === i} onClick={() => setWho(i)}>{PEOPLE[id]?.name.split(" ")[0] ?? "A member"}</Chip>)}
          </div>
        </div>
        <textarea className="ch-note" aria-label="Your message" placeholder="Write a few words. You choose what to share." rows={3} value={note} onChange={(e) => setNote(e.target.value)} />
        <p className="ch-ov__privacy chs__privacy-lg"><Lock size={20} strokeWidth={1.25} absoluteStrokeWidth aria-hidden /><span>Your check-in stays private. This message is sent only because you chose to send it.</span></p>
      </Sheet>
    );
  }
  if (sent) {
    return (
      <Modal open={open} onClose={close} width={480} hideClose label="Message sent" className="ch-ov ch-ov--result">
        <div className="ch-result">
          <span className="ch-result__icon"><CircleCheck size={40} strokeWidth={1.25} absoluteStrokeWidth aria-hidden /></span>
          <h2 className="ch-result__title">Message sent</h2>
          <p className="ch-result__text">Only the person you chose will see it. Your check-in stays private.</p>
          <div className="ch-result__actions">
            <Button onClick={close}>Done</Button>
            <Button variant="secondary" onClick={() => { close(); router.push("/messages"); }}>Open Messages</Button>
          </div>
        </div>
      </Modal>
    );
  }
  return (
    <Modal open={open} onClose={close} width={560} image="/kin/design/home/community/ngozi.jpg" eyebrow="Wellbeing" title="Message someone I trust" className="ch-ov ch-ov--modal">
      <div className="ch-ov__body">
        <p className="ch-ov__lead">Choose who you would like to reach. Only they will see your message.</p>
        <div className="ch-ov__field">
          <p className="ch-ov__label">Who do you trust?</p>
          <div className="ch-chips" role="group" aria-label="Who do you trust?">
            {TRUSTED.map((id, i) => <Chip key={id} variant="choice" selected={who === i} onClick={() => setWho(i)}>{PEOPLE[id]?.name.split(" ")[0] ?? "A member"}</Chip>)}
          </div>
        </div>
        <textarea className="ch-note" aria-label="Your message" placeholder="Write a few words. You choose what to share." rows={3} value={note} onChange={(e) => setNote(e.target.value)} />
        <p className="ch-ov__privacy"><Lock size={16} strokeWidth={1.25} absoluteStrokeWidth aria-hidden /><span>Your check-in stays private. This message is sent only because you chose to send it.</span></p>
        <div className="ch-ov__actions">
          <Button iconRight={Arrow} onClick={submit}>Send message</Button>
          <Button variant="secondary" onClick={close}>Cancel</Button>
        </div>
      </div>
    </Modal>
  );
}
