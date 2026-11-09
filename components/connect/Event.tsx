"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { Bookmark, Check } from "lucide-react";
import Button from "@/components/kin/Button";
import { Field, Input } from "@/components/kin/Field";
import { Modal } from "@/components/kin/Overlay";
import { toast } from "@/components/kin/Toast";
import { faceSrc, photoSrc } from "@/components/kin/home/parts";
import { eventById, eventPlace, eventTag, eventWhen, type ConnectEvent } from "@/lib/connect/events";
import { profilePath } from "@/lib/connect/profiles";
import { ME, PEOPLE } from "@/lib/data/people";
import { SESSION_KEY } from "@/lib/session";
import { PATHS } from "./data";
import { BackLink, NoResults } from "./parts";
import { useRegistration } from "./state";
import "./event.css";

/**
 * Connect, an event, mirrored from the product design (connect/discover/event.tsx, 11.71): the Register panel, the
 * Register dialog (name from the profile, the address the confirmation goes to), the Registered panel and the toast with
 * Undo. Save event and Share this event have no destination in the design, so they stay plain controls.
 */

const EMAIL_OK = /^\S+@\S+\.\S+$/;

/** The signed-in member's name and email, as the session keeps them for the UI. */
function member(): { name: string; email: string } {
  try {
    const s = JSON.parse(localStorage.getItem(SESSION_KEY) ?? "{}") as { name?: string; email?: string };
    return { name: s.name || ME.name, email: s.email ?? "" };
  } catch {
    return { name: ME.name, email: "" };
  }
}

function RegisterDialog({ event, open, onClose, onRegister }: { event: ConnectEvent; open: boolean; onClose: () => void; onRegister: (email: string) => void }) {
  const formId = useId();
  const [who, setWho] = useState({ name: ME.name, email: "" });
  const [email, setEmail] = useState("");
  useEffect(() => {
    if (!open) return;
    const m = member();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the dialog opens with the member's details
    setWho(m);
    setEmail(m.email);
  }, [open]);
  const valid = EMAIL_OK.test(email.trim());
  return (
    <Modal
      open={open}
      onClose={onClose}
      width={480}
      hideClose
      className="dxv-dialog"
      title={`Register for ${event.title}`}
      description="We will email your confirmation to the address below. You can cancel your place at any time."
      footer={<><Button type="submit" form={formId} disabled={!valid}>Register</Button><Button variant="secondary" onClick={onClose}>Cancel</Button></>}
    >
      <form id={formId} className="dxv-form" noValidate onSubmit={(e) => { e.preventDefault(); if (valid) onRegister(email.trim()); }}>
        <Field label="Name" hint="From your Akines profile."><Input readOnly value={who.name} autoComplete="name" /></Field>
        <Field label="Email" hint="We will send your confirmation here."><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" inputMode="email" data-autofocus /></Field>
      </form>
    </Modal>
  );
}

export default function EventPage({ id }: { id: string }) {
  const event = eventById(id);
  if (!event) {
    return (
      <div className="fd-page dxv-page">
        <div className="dxv-body"><div className="dxv-main"><BackLink href={PATHS.events}>Back to Events</BackLink><NoResults text="This event is not on Akines any more." action={{ label: "Show all events", href: PATHS.events }} /></div></div>
      </div>
    );
  }
  return <EventDetail event={event} />;
}

function EventDetail({ event }: { event: ConnectEvent }) {
  const reg = useRegistration(event.id);
  const email = reg.email;
  const registered = email !== undefined;
  const [open, setOpen] = useState(false);
  const host = PEOPLE[event.host];

  // Focus follows the panel: the pill after Register, the Register button after Cancel registration
  const focusAfter = useRef<"pill" | "register" | null>(null);
  const pill = useRef<HTMLDivElement>(null);
  const registerBtn = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const want = focusAfter.current;
    focusAfter.current = null;
    if (want === "pill" && registered) pill.current?.focus({ preventScroll: true });
    else if (want === "register" && !registered) registerBtn.current?.focus({ preventScroll: true });
  }, [registered]);

  const facts = [
    { label: "Date", value: eventWhen(event) },
    { label: "Place", value: eventPlace(event) },
    { label: "Format", value: event.mode },
    { label: "Host", value: host.name },
  ];
  const save = <Button variant="secondary" full className="dxv-save" icon={<Bookmark size={20} strokeWidth={1.25} absoluteStrokeWidth aria-hidden focusable={false} />}>Save event</Button>;
  const share = <button type="button" className="fd-link dxv-share">Share this event</button>;

  return (
    <div className="fd-page dxv-page">
      <div className="dxv-body">
        <article className="dxv-main" aria-labelledby="dxv-title">
          <BackLink href={PATHS.events}>Back to Events</BackLink>
          <div className="fd-photo dxv-hero" data-m="frame">
            {/* eslint-disable-next-line @next/next/no-img-element -- the event photo */}
            <img className="cover" src={photoSrc(event.photo, 1600)} alt="" decoding="async" draggable={false} />
          </div>
          <div className="dxv-title">
            <p className="dxv-tag">{eventTag(event)}</p>
            <h1 className="dxv-h1" id="dxv-title">{event.title}</h1>
            <Link href={profilePath(event.host)} className="dxv-host">
              {/* eslint-disable-next-line @next/next/no-img-element -- the host's face */}
              <span className="dxv-av">{faceSrc(event.host) ? <img src={faceSrc(event.host)} alt="" decoding="async" draggable={false} /> : null}</span>
              <span className="dxv-host__text"><span className="dxv-host__label">Hosted by</span><span className="dxv-host__name">{host.name}</span></span>
            </Link>
          </div>
          <dl className="dxv-facts">{facts.map((f) => <div className="dxv-fact" key={f.label}><dt>{f.label}</dt><dd>{f.value}</dd></div>)}</dl>
          <section className="dxl-block dxv-about" aria-labelledby="dxv-about">
            <h2 className="dxl-eyebrow" id="dxv-about">ABOUT</h2>
            <p className="dxl-body">{event.about}</p>
          </section>
        </article>

        <aside className="dxv-side" aria-label="Registration">
          <section className="dxl-panel" aria-labelledby="dxv-reg">
            <h2 className="dxl-eyebrow" id="dxv-reg">{registered ? "REGISTRATION" : "REGISTER FOR THIS EVENT"}</h2>
            {registered ? (
              <>
                <div className="dxl-pill dxv-registered" role="status" tabIndex={-1} ref={pill}><Check size={16} strokeWidth={1.5} absoluteStrokeWidth aria-hidden focusable={false} /><span>Registered</span></div>
                <p className="dxl-note">{`We emailed your confirmation to ${email}.`}</p>
                {save}
                <button type="button" className="fd-link dxv-share" onClick={() => { focusAfter.current = "register"; reg.cancel(); }}>Cancel registration</button>
                {share}
              </>
            ) : (
              <>
                <Button full ref={registerBtn} onClick={() => { focusAfter.current = "pill"; setOpen(true); }}>Register</Button>
                {save}
                {share}
              </>
            )}
          </section>
          {event.bring.length ? (
            <section className="dxl-panel dxl-panel--tight dxv-bring" aria-labelledby="dxv-bring">
              <h2 className="dxl-eyebrow" id="dxv-bring">WHAT TO BRING</h2>
              <div className="dxl-note dxl-note--plain">{event.bring.map((l) => <p key={l}>{l}</p>)}</div>
            </section>
          ) : null}
        </aside>
      </div>
      <RegisterDialog
        event={event}
        open={open}
        onClose={() => { setOpen(false); focusAfter.current = null; }}
        onRegister={(to) => {
          reg.register(to);
          setOpen(false);
          toast.show({ message: "You are registered for this event.", actionLabel: "Undo", onAction: () => reg.cancel() });
        }}
      />
    </div>
  );
}

