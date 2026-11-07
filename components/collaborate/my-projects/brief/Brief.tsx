"use client";

import { useState } from "react";
import Button from "@/components/kin/Button";
import { Field, Textarea } from "@/components/kin/Field";
import NotFound from "@/components/kin/NotFound";
import { Modal } from "@/components/kin/Overlay";
import { toast } from "@/components/kin/Toast";
import { CtxBlock, PageHead, WorkspaceFrame } from "@/components/collaborate/workspace/Frame";
import { useBrief, type BriefPart } from "@/lib/collab/brief";
import { useWorkspace, type WorkspaceMember } from "@/lib/collab/workspace";
import { BackLink, CwLink, PeopleBlock } from "./parts";

/*
 * A project's shared brief, mirrored from the product design (collaborate-my-projects-…-brief): the numbered
 * parts, each opening "Suggest a change", and a context column with the version, what the team still has to
 * acknowledge, team availability and Create AI. Read from our Project through useBrief (lib/collab/brief.ts).
 */

const count = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

function SuggestDialog({ part, open, onClose, onSend }: { part: BriefPart | null; open: boolean; onClose: () => void; onSend: (text: string) => void }) {
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  // Keep the last part while the dialog closes, so its title doesn't vanish mid-animation.
  const [shown, setShown] = useState<BriefPart | null>(part);
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) { setText(""); setError(""); }
  }
  if (part && part !== shown) setShown(part);
  const send = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!text.trim()) { setError("Write a short message to continue."); return; }
    onSend(text);
  };
  return (
    <Modal
      open={open}
      onClose={onClose}
      width={640}
      eyebrow="SUGGEST A CHANGE"
      title={shown ? `${shown.number} ${shown.heading}` : ""}
      description="Tell the team what you would change and why. Significant changes need the team's acknowledgement."
      footer={<><Button type="submit" form="cw-suggest-form">Send suggestion</Button><CwLink onClick={onClose}>Cancel</CwLink></>}
    >
      <form id="cw-suggest-form" onSubmit={send} noValidate>
        <Field label="Your suggestion" hint="The team will see your name with the suggestion." error={error || undefined}>
          <Textarea rows={3} className="cw-ta" value={text} placeholder="Describe the change you suggest and why." onChange={(e) => { setText(e.target.value); if (error) setError(""); }} />
        </Field>
      </form>
    </Modal>
  );
}

function Context({ brief, members }: { brief: ReturnType<typeof useBrief>; members: WorkspaceMember[] }) {
  const oldest = brief.pending[0];
  return (
    <>
      <CtxBlock label="BRIEF VERSION">
        <p className="cw-session__title">Version {brief.version}</p>
        <p className="cw-ctx__line">{brief.updated}</p>
        <CwLink arrow>View version history</CwLink>
      </CtxBlock>
      {oldest ? (
        <CtxBlock label="WAITING FOR THE TEAM">
          <p className="cw-ctx__item">{count(brief.pending.length, "change needs", "changes need")} acknowledgement.</p>
          <p className="cw-ctx__line">{oldest.acknowledged.length} of {brief.team} members have acknowledged {brief.pending.length === 1 ? "it" : "the first"}.</p>
        </CtxBlock>
      ) : null}
      <PeopleBlock people={members.filter((m) => !m.you)} />
      <CtxBlock label="CREATE AI">
        <span className="cw-aitag">AI SUGGESTIONS</span>
        <p className="cw-ctx__line">Create AI can suggest improvements to the brief. It never changes the brief without your approval.</p>
      </CtxBlock>
    </>
  );
}

export default function Brief({ id }: { id: string }) {
  const ws = useWorkspace(id);
  const call = ws.project?.callId ? ws.collab.call(ws.project.callId) : undefined;
  const brief = useBrief(ws.project, ws.project ? ws.summary : "", call);
  const [part, setPart] = useState<BriefPart | null>(null);
  const [open, setOpen] = useState(false);

  if (!ws.ready || !brief.ready) return null;
  if (!ws.project) return <NotFound />;

  const suggest = (p: BriefPart) => { setPart(p); setOpen(true); };
  const send = (text: string) => {
    if (!part) return;
    const changeId = brief.suggest(part.key, text);
    setOpen(false);
    toast.show({ message: "Suggestion sent to the team.", actionLabel: "Undo", duration: 2500, onAction: () => brief.withdraw(changeId) });
  };

  return (
    <WorkspaceFrame projectId={id} active="overview" context={<Context brief={brief} members={ws.members} />}>
      <PageHead back={<BackLink href={ws.href()}>Back to overview</BackLink>} label="SHARED PROJECT BRIEF" title="The project brief." lead="A living document that defines the project's direction. Every member can suggest changes.">
        <p className="cw-pagehead__meta">Version {brief.version}. {brief.updated}.</p>
        {brief.parts[0] ? <div><Button variant="secondary" onClick={() => suggest(brief.parts[0])}>Suggest a change</Button></div> : null}
      </PageHead>
      <ol className="cw-parts" data-m="stagger">
        {brief.parts.map((p) => (
          <li key={p.key}>
            <button type="button" className="cw-part" onClick={() => suggest(p)} aria-haspopup="dialog">
              <span className="cw-part__n">{p.number}</span>
              <span className="cw-part__text">
                <span className="cw-part__main">
                  <span className="cw-over">{p.title}</span>
                  <span className="cw-part__body">{p.body}</span>
                </span>
                <span className="cw-part__hint" aria-hidden><span className="cw-part__hintin"><span className="cw-link"><span className="cw-link__label">Suggest a change</span></span></span></span>
              </span>
            </button>
          </li>
        ))}
      </ol>
      <SuggestDialog part={part} open={open} onClose={() => setOpen(false)} onSend={send} />
    </WorkspaceFrame>
  );
}
