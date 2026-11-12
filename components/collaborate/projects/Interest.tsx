"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useState } from "react";
import Button from "@/components/kin/Button";
import { Chip } from "@/components/kin/Chip";
import { Radio } from "@/components/kin/Choice";
import { Field, Textarea } from "@/components/kin/Field";
import { faceSrc, photoSrc } from "@/components/kin/home/parts";
import { ME, useCollab } from "@/lib/collab/useCollab";
import { ANOTHER_WAY, INTEREST_TIMES, discoverProject, firstOf, type DiscoverProject } from "@/lib/collab/projects";
import type { Application } from "@/lib/collab/types";
import { PEOPLE } from "@/lib/data/people";
import { requestHref } from "@/components/collaborate/applications/paths";
import { LOADING_MS } from "@/components/collaborate/overview-lists/loading";
import { ArrowIcon, Back, DsLink, Notice, PageState, Portrait, Status, pageStatus, sampleApp } from "./parts";

/*
 * Express interest, mirrored from the product design (classes in ../styles/projects.css): choose a role, say how
 * much time you can give, add a note; then the "interest sent" page. Sending is an application to the open call
 * (the role, the time as availability, the note as the statement). If you already sent interest, the sent page shows.
 */

type Phase = "form" | "sending" | "error" | "sent";
/** The design's frames at their own addresses: the blank form, Sending, Could not send and Interest sent. */
export type InterestVariant = "empty" | "sending" | "error" | "sent";

export default function Interest({ id, variant }: { id: string; variant?: InterestVariant }) {
  const collab = useCollab({ engine: true });
  const status = pageStatus(collab);
  const call = collab.call(id);
  const back = `/collaborate/projects/${encodeURIComponent(id)}`;

  if (status === "loading") return <div className="dsc-page" aria-busy="true" />;
  if (status === "error" || !call) {
    return (
      <div className="dsc-page"><div className="dsc-stack">
        <Back href={back}>Back to project</Back>
        <PageState pair role="alert" headline="We could not load this project." support="Check your connection and try again. Your saved projects are safe.">
          <Button onClick={() => window.location.reload()}>Try again</Button>
          <Button variant="secondary" href="/collaborate/discover">Back to discover projects</Button>
        </PageState>
      </div></div>
    );
  }
  const p = discoverProject(call, collab.projects);
  const app = collab.appFor(call.id) ?? (variant === "sent" ? sampleApp(p, INTEREST_TIMES[0]) : undefined);
  if (app) return <Sent project={p} app={app} />;
  return <InterestForm key={call.id} project={p} variant={variant} />;
}

function InterestForm({ project: p, variant }: { project: DiscoverProject; variant?: InterestVariant }) {
  const collab = useCollab();
  const router = useRouter();
  const uid = useId();
  const owner = firstOf(p.ownerId);
  const roles = [...p.roles, ANOTHER_WAY];
  // A role that is what you already do starts chosen; nothing else is filled in for you.
  const mine = PEOPLE[ME]?.role?.toLowerCase();
  // The Sending and Could not send frames show a role and a time chosen, as drawn.
  const framed = variant === "sending" || variant === "error";
  const [role, setRole] = useState(() => (variant === "empty" ? "" : roles.find((r) => r.toLowerCase() === mine) ?? (framed ? roles[0] : "")));
  const [time, setTime] = useState(framed ? INTEREST_TIMES[0] : "");
  const [message, setMessage] = useState("");
  const [phase, setPhase] = useState<Phase>(variant === "sending" ? "sending" : variant === "error" ? "error" : "form");
  const back = `/collaborate/projects/${encodeURIComponent(p.id)}`;
  const sending = phase === "sending";
  // The Sending route sends nothing: after the design's 2.5 s it goes on to Interest sent.
  useEffect(() => {
    if (variant !== "sending") return;
    const t = window.setTimeout(() => router.replace(`${back}/interest/state-sent`), LOADING_MS);
    return () => window.clearTimeout(t);
  }, [variant, back, router]);

  const send = async () => {
    if (!role || sending) return;
    setPhase("sending");
    const r = await collab.apply({
      callId: p.id, role, works: [], links: [], files: [], statement: message.trim(), availability: time,
      materials: Object.fromEntries(p.call.materials.map((m) => [m.id, m.id === "why" ? !!message.trim() : m.id === "availability" ? !!time : false])),
    });
    // On success the page turns into the sent page, as the application now exists.
    if (!r.ok) setPhase("error");
    else window.scrollTo({ top: 0 });
  };

  return (
    <div className="dsc-page">
      <form className="dsc-interest" onSubmit={(e) => { e.preventDefault(); void send(); }}>
        <Back href={back}>Back to project</Back>
        <header className="dsc-interest__heading">
          <p className="dsc-eyebrow" data-m="up">Express interest</p>
          <h1 className="dsc-h1 dsc-h1--interest" data-m="words">Tell the team how you can help.</h1>
          <p className="dsc-lead" data-m="up">Choose a role, say how much time you can give and add a note if you like. {owner} reviews every request personally.</p>
        </header>
        <section className="dsc-summary-card" aria-label="Project and owner">
          <div className="dsc-summary-card__project"><p className="dsc-eyebrow">Project</p><p className="dsc-summary-card__name">{p.title}</p></div>
          <span className="dsc-summary-card__divider" aria-hidden="true" />
          <div className="dsc-summary-card__owner">
            <Portrait project={p} size={56} />
            <div className="dsc-summary-card__info"><p className="dsc-eyebrow">Project owner</p><p className="dsc-summary-card__name">{p.owner}</p><p className="dsc-summary-card__role">{PEOPLE[p.ownerId]?.role || "Project owner"}</p></div>
          </div>
        </section>
        <div className="dsc-interest__fields" inert={sending || undefined}>
          <div className="dsc-group" role="group" aria-labelledby={`${uid}-role`}>
            <p className="dsc-eyebrow" id={`${uid}-role`}>Which role would you like to take?</p>
            {/* The chosen role is a toggle, as in the design: clicking it again clears the choice. */}
            <div className="dsc-roles" onClick={(e) => { if (e.target instanceof HTMLInputElement && e.target.value === role) setRole(""); }}>{roles.map((r) => <Radio key={r} name="role" value={r} label={r} checked={role === r} onChange={() => setRole(r)} />)}</div>
          </div>
          <div className="dsc-group" role="group" aria-labelledby={`${uid}-time`}>
            <p className="dsc-eyebrow" id={`${uid}-time`}>How much time can you give?</p>
            <div className="dsc-times">{INTEREST_TIMES.map((t) => <Chip key={t} variant="choice" selected={time === t} onClick={() => setTime(t)}>{t}</Chip>)}</div>
          </div>
          <Field label="Your message" hint="Optional. A few sentences are enough." className="dsc-message">
            <Textarea rows={3} value={message} data-filled={message ? "true" : undefined} placeholder={`Tell ${owner} why this project matters to you and what you could bring.`} onChange={(e) => setMessage(e.target.value)} />
          </Field>
        </div>
        <Notice title="Only the project owner sees this." text={`${owner} will see your message and your public profile. Your contact details stay private until you both agree to talk.`} />
        {phase === "error" ? <Notice tone="error" title="We could not send your interest." text="Check your connection and try again. Your answers are saved." /> : null}
        <div className="dsc-actions">
          {phase === "error"
            ? <Button type="submit" iconRight={<ArrowIcon />}>Try again</Button>
            : <Button type="submit" disabled={!role || sending} iconRight={sending ? undefined : <ArrowIcon />} aria-busy={sending || undefined}>{sending ? "Sending..." : "Send interest"}</Button>}
          <Button variant="secondary" disabled={sending} onClick={() => router.push(back)}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}

function Sent({ project: p, app }: { project: DiscoverProject; app: Application }) {
  const owner = firstOf(p.ownerId);
  const photo = faceSrc(p.ownerId, 1200) ?? photoSrc(p.call.photo, 1200);
  const pending = !["joined", "not-selected", "offer"].includes(app.stage);
  return (
    <div className="dsc-sent">
      <div className="dsc-sent__content">
        <p className="dsc-eyebrow" data-m="up">Interest sent</p>
        <h1 className="dsc-h1 dsc-h1--sent" data-m="words">Your interest is on its way.</h1>
        <p className="dsc-lead" data-m="up">{owner} can now read your message and decide whether to invite you onto the team. You will see the reply here.</p>
        <section className="dsc-request dsc-request--link" aria-label="Your request" data-m="up">
          <div className="dsc-request__row">
            <Portrait project={p} size={64} />
            <div className="dsc-request__info">
              <p className="dsc-request__name">{p.title}</p>
              <p className="dsc-request__meta">{app.role}{app.availability ? `, ${app.availability.charAt(0).toLowerCase()}${app.availability.slice(1)}` : ""}</p>
            </div>
            {pending ? <Status status="pending" /> : app.stage === "not-selected" ? <Status status="closed" label="Not selected" /> : <Status status="open" label={app.stage === "joined" ? "Joined" : "Offer"} />}
          </div>
          <hr className="dsc-request__rule" />
          <p className="dsc-request__note">{pending ? `${owner} has not replied yet. You will see the decision here when it arrives.` : `${owner} has replied. See it on your request.`}</p>
          {/* 12.44: the card and this link open the request */}
          <DsLink href={requestHref(p.id)} arrow>View request</DsLink>
        </section>
        <div className="dsc-actions">
          <Button href={`/collaborate/projects/${encodeURIComponent(p.id)}`} iconRight={<ArrowIcon />}>Back to project</Button>
          <Button variant="secondary" href="/collaborate/discover">Find more projects</Button>
        </div>
      </div>
      <div className="dsc-sent__photo" data-m="frame">
        {/* eslint-disable-next-line @next/next/no-img-element -- the design's photo beside the sent page */}
        <img className="cover" src={photo} alt="" decoding="async" />
      </div>
    </div>
  );
}
