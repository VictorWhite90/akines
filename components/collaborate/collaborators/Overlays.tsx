"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ArrowUp, ChevronDown, ChevronUp, Eye, Lock, Share2, Sparkle } from "lucide-react";
import Button, { IconButton } from "@/components/kin/Button";
import { Chip } from "@/components/kin/Chip";
import { Radio } from "@/components/kin/Choice";
import { Drawer, Modal } from "@/components/kin/Overlay";
import { toast } from "@/components/kin/Toast";
import { CC, useMatching, useRecommendations, wordsFor, type Collaborator, type MatchPrefs } from "@/lib/collab/collaborators";
import { Back } from "./parts";

/*
 * The Collaborators dialogs, mirrored from the product design: matching preferences, Ask Akines (a drawer),
 * "Why isn't this a fit?", what's visible and why, and the confirmation before an introduction is sent, and
 * Change project (the project matching is for). `from` says where Ask Akines was opened: from a card it ends
 * with "Back to collaborators", from a profile or Why this match with "Back to profile".
 */

export type OverlayKind = "prefs" | "project" | "ask" | "notrelevant" | "privacy" | "confirm";

const REASONS = ["Skills do not match", "Project interests differ", "Working preferences differ", "Not available", "Other"];

export default function Overlays({ open, onClose, person, onSend, from = "profile" }: { open: OverlayKind | null; onClose: () => void; person: Collaborator | null; onSend?: () => void; from?: "cards" | "profile" }) {
  const router = useRouter();
  const path = usePathname();
  const { setPrefs } = useMatching();
  const { dismiss } = useRecommendations();
  const toDiscovery = () => { if (path !== CC.discovery) router.push(CC.discovery); };
  return (
    <>
      <Prefs open={open === "prefs"} onClose={onClose} onApply={(p) => { setPrefs(p); onClose(); toDiscovery(); }} />
      <ProjectModal open={open === "project"} onClose={onClose} />
      {person ? (
        <>
          <Ask open={open === "ask"} onClose={onClose} c={person} backLabel={from === "cards" ? "Back to collaborators" : "Back to profile"} />
          <NotRelevant open={open === "notrelevant"} onClose={onClose} c={person} onRemove={() => {
            const undo = dismiss(person.id);
            onClose(); toDiscovery();
            toast.show({ message: "Removed from your recommendations.", actionLabel: "Undo", onAction: undo });
          }} />
          <Privacy open={open === "privacy"} onClose={onClose} c={person} />
          <Confirm open={open === "confirm"} onClose={onClose} c={person} onSend={() => { onClose(); onSend?.(); }} />
        </>
      ) : null}
    </>
  );
}

/** Each opening starts afresh, as the design's dialogs do (state set while rendering, not in an effect). */
function useOnOpen(open: boolean, reset: () => void) {
  const [was, setWas] = useState(open);
  if (open !== was) { setWas(open); if (open) reset(); }
}

function Prefs({ open, onClose, onApply }: { open: boolean; onClose: () => void; onApply: (p: MatchPrefs) => void }) {
  const { rows, prefs } = useMatching();
  const [draft, setDraft] = useState(prefs);
  useOnOpen(open, () => setDraft(prefs));
  const toggle = (k: keyof MatchPrefs, v: string) => setDraft((d) => { const cur = d[k] ?? []; return { ...d, [k]: cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v] }; });
  return (
    <Modal open={open} onClose={onClose} size="xl" width={1040} className="cc-pref" eyebrow="Your matching preferences" title="What matters most in a collaborator?" description="Choose what matters to you. Every preference is optional."
      footer={<><Button onClick={() => onApply(draft)}>Update recommendations</Button><Button variant="secondary" onClick={onClose}>Cancel</Button></>}>
      <div className="cc-pref__rows">
        {rows.map((r) => (
          <div className="cc-pref__row" key={r.key}>
            <div className="cc-pref__label">
              <p className="cc-pref__name"><span>{r.label}</span><span className="cc-pref__opt">Optional</span></p>
              <p className="cc-pref__desc">{r.desc}</p>
            </div>
            <div className="cc-pref__options" role="group" aria-label={r.label}>
              {r.options.map((o) => <Chip key={o} selected={(draft[r.key] ?? []).includes(o)} onClick={() => toggle(r.key, o)}>{o}</Chip>)}
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
}

/**
 * Change project: the member's projects as a radio list, the one in use ticked ("Current project." in front of
 * its line). Use this project applies the ticked one and shows the toast with Undo.
 */
function ProjectModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { brief, projects, setProject } = useMatching();
  const [draft, setDraft] = useState(brief?.id ?? "");
  useOnOpen(open, () => setDraft(brief?.id ?? ""));
  const use = () => {
    onClose();
    if (!draft || draft === brief?.id) return;
    const undo = setProject(draft);
    toast.show({ message: `Looking for collaborators for ${(projects.find((p) => p.id === draft)?.name ?? "").replace(/\.$/, "")}.`, actionLabel: "Undo", onAction: undo });
  };
  return (
    <Modal open={open} onClose={onClose} width={640} className="cc-proj" eyebrow="Change project" title="Which project is this for?" description="We will look for people who fit the project you choose."
      footer={<><Button onClick={use}>Use this project</Button><Button variant="link" onClick={onClose}>Cancel</Button></>}>
      <div className="cc-proj__list" role="radiogroup" aria-label="Project">
        {projects.map((o) => <Radio key={o.id} name="cc-project" value={o.id} label={o.name} description={o.id === brief?.id ? `Current project. ${o.line}` : o.line} checked={draft === o.id} onChange={() => setDraft(o.id)} />)}
      </div>
    </Modal>
  );
}

function Ask({ open, onClose, c, backLabel }: { open: boolean; onClose: () => void; c: Collaborator; backLabel: string }) {
  const w = wordsFor(c);
  const [picked, setPicked] = useState<string[]>([]);
  useOnOpen(open, () => setPicked([]));
  return (
    <Drawer open={open} onClose={onClose} width={560} className="cc-drawer" eyebrow="Ask Akines" title={`Why ${w.first}?`}>
      <div className="cc-ask">
        <div className="cc-ask__conv">
          <p className="cc-ask__user">{w.askUser}</p>
          <div className="cc-ask__reply">
            <span className="cc-ask__avatar" aria-hidden><Sparkle size={16} strokeWidth={1.5} /></span>
            <div className="cc-ask__answer">
              <p className="cc-cap">Akines</p>
              <div className="cc-ask__text">{c.ask.map((t) => <p key={t}>{t}</p>)}</div>
            </div>
          </div>
          <p className="cc-ask__note">Akines explains matches using only what has been shared. It can’t promise compatibility.</p>
        </div>
        <div className="cc-ask__chips" role="group" aria-label="Follow-up questions">
          {w.askChips.map((q) => <Chip key={q} selected={picked.includes(q)} onClick={() => setPicked((cur) => (cur.includes(q) ? cur.filter((x) => x !== q) : [...cur, q]))}>{q}</Chip>)}
        </div>
        <form className="cc-ask__form" onSubmit={(e) => e.preventDefault()}>
          <input className="cc-ask__input" type="text" aria-label="Ask a follow-up question" placeholder="Ask a follow-up question..." />
          <IconButton type="submit" variant="primary" className="cc-ask__send" label="Send"><ArrowUp size={20} strokeWidth={1.5} /></IconButton>
        </form>
        <Back onClick={onClose}>{backLabel}</Back>
      </div>
    </Drawer>
  );
}

function NotRelevant({ open, onClose, onRemove, c }: { open: boolean; onClose: () => void; onRemove: () => void; c: Collaborator }) {
  const [why, setWhy] = useState(REASONS[0]);
  useOnOpen(open, () => setWhy(REASONS[0]));
  return (
    <Modal open={open} onClose={onClose} width={640} className="cc-nr" eyebrow="Optional feedback" title="Why isn’t this a fit?" description={wordsFor(c).notRelevant}
      footer={<><Button onClick={onRemove}>Remove from recommendations</Button><Button variant="link" onClick={onRemove}>Skip feedback</Button></>}>
      <div role="radiogroup" aria-label="Reason">
        {REASONS.map((r) => <Radio key={r} name="cc-reason" value={r} label={r} checked={why === r} onChange={() => setWhy(r)} />)}
      </div>
    </Modal>
  );
}

const TIER_ICON = { eye: Eye, share: Share2, lock: Lock };

function Privacy({ open, onClose, c }: { open: boolean; onClose: () => void; c: Collaborator }) {
  const w = wordsFor(c);
  const [openRows, setOpenRows] = useState<string[]>([]);
  useOnOpen(open, () => setOpenRows([]));
  return (
    <Modal open={open} onClose={onClose} size="xl" width={1100} className="cc-priv" eyebrow="Privacy and information sharing" title="What you can see, and why." footer={<Button onClick={onClose}>Done</Button>}>
      <div className="cc-priv__tiers">
        {w.tiers.map((t) => {
          const Icon = TIER_ICON[t.icon];
          return (
            <section className="cc-priv__tier" key={t.title}>
              <h3 className="cc-priv__title"><Icon size={18} strokeWidth={1.5} aria-hidden />{t.title}</h3>
              <p className="cc-priv__text">{t.text}</p>
              <ul className="cc-priv__tags">{t.tags.map((x) => <li key={x}>{x}</li>)}</ul>
            </section>
          );
        })}
      </div>
      <div className="cc-priv__why">
        <p className="cc-eyebrow">Why is this visible?</p>
        <div className="cc-priv__list">
          {w.visible.map((r, i) => {
            const on = openRows.includes(r.label);
            return (
              <div className="cc-priv__item" data-open={on || undefined} key={r.label}>
                <button type="button" className="cc-priv__head" aria-expanded={on} aria-controls={`cc-priv-${i}`} onClick={() => setOpenRows((cur) => (cur.includes(r.label) ? cur.filter((x) => x !== r.label) : [...cur, r.label]))}>
                  <span>{r.label}</span>
                  <span className="cc-priv__chev">{on ? <ChevronUp size={16} strokeWidth={1.5} aria-hidden /> : <ChevronDown size={16} strokeWidth={1.5} aria-hidden />}</span>
                </button>
                <div className="cc-priv__panel" id={`cc-priv-${i}`} hidden={!on}><p>{r.text}</p></div>
              </div>
            );
          })}
        </div>
      </div>
    </Modal>
  );
}

function Confirm({ open, onClose, onSend, c }: { open: boolean; onClose: () => void; onSend: () => void; c: Collaborator }) {
  const w = wordsFor(c);
  return (
    <Modal open={open} onClose={onClose} width={560} className="cc-confirm" eyebrow="Confirm your request" title={`Send this request to ${w.first}?`} description={w.confirm}
      footer={<><Button arrow="up-right" onClick={onSend}>Send request</Button><Button variant="secondary" onClick={onClose}>Keep editing</Button></>} />
  );
}
