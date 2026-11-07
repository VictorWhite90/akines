"use client";

import { useState } from "react";
import { notFound, useRouter } from "next/navigation";
import Button from "@/components/kin/Button";
import { Field, Textarea } from "@/components/kin/Field";
import { toast } from "@/components/kin/Toast";
import { collabHref, leadId, suggestedMessage, useCollaborator, useIntroductions, useMatching, useSavedCollaborators, wordsFor, type Collaborator } from "@/lib/collab/collaborators";
import { PEOPLE } from "@/lib/data/people";
import Overlays, { type OverlayKind } from "./Overlays";
import { Arrow, Back, CcAvatar, Heading } from "./parts";

/*
 * An introduction request, mirrored from the product design (cc-req): the project and the person, a suggested
 * message to edit, and a confirmation before anything is sent. Sending records an introduction (lib/collab/collaborators).
 */

export default function Request({ id }: { id?: string }) {
  const c = useCollaborator(id ?? leadId() ?? undefined);
  if (!c) notFound();
  return <RequestFor c={c} />;
}

function RequestFor({ c }: { c: Collaborator }) {
  const router = useRouter();
  const { brief } = useMatching();
  const { send } = useIntroductions();
  const { save } = useSavedCollaborators();
  const [open, setOpen] = useState<OverlayKind | null>(null);
  const [message, setMessage] = useState(() => suggestedMessage(c, brief));
  const [error, setError] = useState(false);
  const p = PEOPLE[c.id], h = collabHref(c.id), w = wordsFor(c);
  const onSend = () => { if (!message.trim()) { setError(true); return; } setOpen("confirm"); };
  const onSave = () => { const undo = save(c.id); toast.show({ message: "Saved to your collaborators.", actionLabel: "Undo", onAction: undo }); };
  const confirmed = () => {
    send({ to: c.id, projectId: brief?.id ?? null, projectTitle: brief?.name ?? "", message: message.trim() });
    router.push(h.sent);
  };
  return (
    <>
      <div className="cc-page cc-req">
        <div className="cc-req__col">
          <Back href={h.profile}>Back to profile</Back>
          <Heading eyebrow="Make a connection" title="Start with a conversation." support="Introduce yourself, explain what you’re creating and tell them why you think you could work well together." />
          <section className="cc-summary-row" aria-label="Request summary" data-m="up">
            <div className="cc-summary-row__half">
              <p className="cc-eyebrow">Project</p>
              <p className="cc-summary-row__project">{brief?.name ?? "No project yet"}</p>
            </div>
            <span className="cc-summary-row__rule" aria-hidden />
            <div className="cc-summary-row__half cc-summary-row__half--person">
              <CcAvatar id={c.id} size={56} />
              <div className="cc-summary-row__info">
                <p className="cc-eyebrow">Collaborator</p>
                <p className="cc-summary-row__name">{p.name}</p>
                <p className="cc-summary-row__role">{p.role}</p>
              </div>
            </div>
          </section>
          <div data-m="up">
            <Field label="Your message" hint="You can edit this message before it is sent." error={error ? "Write a short message to continue." : undefined} htmlFor="cc-message">
              <Textarea id="cc-message" className={`cc-message${message.trim() ? " cc-message--filled" : ""}`} rows={8} placeholder="Tell them why you’d like to collaborate..." value={message} invalid={error}
                onChange={(e) => { setMessage(e.target.value); if (e.target.value.trim()) setError(false); }} />
            </Field>
          </div>
          <aside className="cc-notice" data-m="up">
            <h2 className="cc-notice__title">Nothing is sent until you confirm.</h2>
            <p className="cc-notice__text">{w.requestNotice}</p>
          </aside>
          <div className="cc-actions" data-m="up">
            <Button iconRight={<Arrow />} onClick={onSend}>Send introduction request</Button>
            <Button variant="secondary" onClick={onSave}>Save for later</Button>
          </div>
        </div>
      </div>
      <Overlays open={open} onClose={() => setOpen(null)} person={c} onSend={confirmed} />
    </>
  );
}
