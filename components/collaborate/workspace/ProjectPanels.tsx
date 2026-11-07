"use client";

import Link from "next/link";
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowUp, Check, RotateCcw, X } from "lucide-react";
import Button, { IconButton } from "@/components/kin/Button";
import { Chip } from "@/components/kin/Chip";
import { Toggle } from "@/components/kin/Choice";
import { Field, Input, Textarea } from "@/components/kin/Field";
import { Modal } from "@/components/kin/Overlay";
import { CreateAiMark } from "@/components/shell/Companion";
import type { NotifyPrefs } from "@/lib/collab/workspace";
import "@/components/shell/companion.css";
import "../styles/meeting-popovers.css";

/*
 * The project bar's panels, mirrored from the product design (classes ph-* in ../styles/meeting-popovers.css and
 * cai-* in the shell's companion.css): the switch-project menu, project notifications, project settings and its
 * dialogs (edit details, archive, leave, notification preferences), and Create AI opened on the project.
 */

const EXIT_MS = 180;
function usePresence(open: boolean, ms = EXIT_MS) {
  const [mounted, setMounted] = useState(open);
  const [state, setState] = useState<"open" | "closed">(open ? "open" : "closed");
  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- presence follows `open`
      setMounted(true); setState("open"); return;
    }
    setState("closed");
    const t = window.setTimeout(() => setMounted(false), window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : ms);
    return () => window.clearTimeout(t);
  }, [open, ms]);
  return { mounted, state };
}

/**
 * The design's popover (ph-pop): fixed under its trigger, kept on screen, closed by Escape, Tab or a press
 * outside; arrow keys, Home and End move between its items. `onClose(true)` returns focus to the trigger.
 */
export function Popover({ open, onClose, trigger, edge, align, width, label, role, className, children }: { open: boolean; onClose: (refocus: boolean) => void; trigger: React.RefObject<HTMLElement | null>; edge?: React.RefObject<HTMLElement | null>; align: "start" | "end"; width: number; label: string; role: "menu" | "dialog"; className?: string; children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- portals need the document
  useEffect(() => setReady(true), []);
  const { mounted, state } = usePresence(open);
  const panel = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number; w: number } | null>(null);
  const close = useRef(onClose);
  useEffect(() => { close.current = onClose; }, [onClose]);

  useLayoutEffect(() => {
    if (!open) return;
    const place = () => {
      const t = trigger.current;
      if (!t) return;
      const r = t.getBoundingClientRect();
      const w = Math.min(width, window.innerWidth - 32);
      const e = (edge?.current ?? t).getBoundingClientRect();
      let left = align === "end" ? e.right - w : r.left - 18;
      left = Math.max(16, Math.min(left, window.innerWidth - w - 16));
      setPos({ top: Math.round(r.bottom + 6), left: Math.round(left), w });
    };
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => { window.removeEventListener("resize", place); window.removeEventListener("scroll", place, true); };
  }, [open, align, width, trigger, edge]);

  useEffect(() => {
    if (!open) return;
    const down = (e: PointerEvent) => { const t = e.target as Node; if (!panel.current?.contains(t) && !trigger.current?.contains(t)) close.current(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") { e.preventDefault(); close.current(true); } };
    document.addEventListener("pointerdown", down);
    document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("pointerdown", down); document.removeEventListener("keydown", esc); };
  }, [open, trigger]);

  const items = () => Array.from(panel.current?.querySelectorAll<HTMLElement>("a[href], button:not([disabled])") ?? []);
  const placed = pos !== null;
  useEffect(() => {
    if (open && placed && panel.current && !panel.current.contains(document.activeElement)) items()[0]?.focus({ preventScroll: true });
  }, [open, placed]);

  const keys = (e: React.KeyboardEvent) => {
    const list = items(), i = list.indexOf(document.activeElement as HTMLElement);
    if (e.key === "ArrowDown") { e.preventDefault(); list[(i + 1) % list.length]?.focus(); }
    else if (e.key === "ArrowUp") { e.preventDefault(); list[(i - 1 + list.length) % list.length]?.focus(); }
    else if (e.key === "Home") { e.preventDefault(); list[0]?.focus(); }
    else if (e.key === "End") { e.preventDefault(); list[list.length - 1]?.focus(); }
    else if (e.key === "Tab") { e.preventDefault(); onClose(true); }
  };

  if (!ready || !mounted) return null;
  return createPortal(
    <div ref={panel} role={role} aria-label={label} tabIndex={-1} className={["ph-pop", className].filter(Boolean).join(" ")} data-state={state} data-k-overlay="" style={{ top: pos?.top ?? 0, left: pos?.left ?? 0, width: pos?.w ?? width, visibility: pos ? "visible" : "hidden" }} onKeyDown={keys}>
      {children}
    </div>,
    document.body,
  );
}

const Eyebrow = ({ children }: { children: React.ReactNode }) => <p className="ph-eyebrow">{children}</p>;
const Rule = () => <div className="ph-rule" role="separator" />;
/** The design's text-link button in dialog footers (cw-link ph-link). */
const FootLink = ({ onClick, children }: { onClick: () => void; children: React.ReactNode }) => <button type="button" className="cw-link ph-link" onClick={onClick}><span className="cw-link__label">{children}</span></button>;

export type SwitchItem = { id: string; name: string; line: string; href: string };
export function SwitchMenu({ open, onClose, trigger, current, projects, allHref }: { open: boolean; onClose: (refocus: boolean) => void; trigger: React.RefObject<HTMLElement | null>; current: string; projects: SwitchItem[]; allHref: string }) {
  return (
    <Popover open={open} onClose={onClose} trigger={trigger} align="start" width={400} label="Your projects" role="menu" className="ph-pop--switch">
      <Eyebrow>YOUR PROJECTS</Eyebrow>
      {projects.map((p) => {
        const here = p.id === current;
        const inner = (
          <>
            <span className="ph-item__text"><span className="ph-item__serif">{p.name}</span><span className="ph-item__cap">{p.line}</span></span>
            {here ? <span className="ph-item__check"><Check size={24} strokeWidth={1.5} aria-hidden /></span> : null}
          </>
        );
        return here
          ? <button key={p.id} type="button" role="menuitem" className="ph-item" aria-current="true" onClick={() => onClose(true)}>{inner}</button>
          : <Link key={p.id} href={p.href} role="menuitem" className="ph-item" onClick={() => onClose(false)}>{inner}</Link>;
      })}
      <Rule />
      <Link href={allHref} role="menuitem" className="ph-item" onClick={() => onClose(false)}><span className="ph-item__label">View all projects</span></Link>
    </Popover>
  );
}

export type ProjectNote = { id: string; title: string; who: string; when: string; action: string; href: string };
export function NotificationsPanel({ open, onClose, trigger, edge, projectName, notes, unread, onRead, onReadAll, onPreferences }: { open: boolean; onClose: (refocus: boolean) => void; trigger: React.RefObject<HTMLElement | null>; edge: React.RefObject<HTMLElement | null>; projectName: string; notes: ProjectNote[]; unread: string[]; onRead: (id: string) => void; onReadAll: () => void; onPreferences: () => void }) {
  const caught = unread.length === 0;
  return (
    <Popover open={open} onClose={onClose} trigger={trigger} edge={edge} align="end" width={456} label="Project notifications" role="dialog" className="ph-pop--notes">
      <div className="ph-head">
        <p className="ph-head__title">Project notifications</p>
        {caught ? <span className="ph-head__done">All caught up</span> : <button type="button" className="ph-head__link" onClick={(e) => { onReadAll(); e.currentTarget.closest<HTMLElement>(".ph-pop")?.focus(); }}>Mark all as read</button>}
      </div>
      {notes.map((n) => {
        const isNew = unread.includes(n.id);
        return (
          <Link key={n.id} href={n.href} className="ph-item ph-note" data-unread={isNew || undefined} onClick={() => { onRead(n.id); onClose(false); }}>
            <span className="ph-note__mark" aria-hidden />
            <span className="ph-note__text">
              <span className="ph-note__title">{isNew ? <span className="sr-only">Unread. </span> : null}{n.title}</span>
              <span className="ph-item__cap">{projectName}. {n.who}. {n.when}</span>
              <span className="ph-note__act">{n.action}</span>
            </span>
          </Link>
        );
      })}
      <Rule />
      <button type="button" className="ph-item ph-item--col" onClick={() => { onClose(false); onPreferences(); }}>
        <span className="ph-item__label">Notification preferences</span>
        <span className="ph-item__cap">Choose what reaches you and how often.</span>
      </button>
    </Popover>
  );
}

export function SettingsMenu({ open, onClose, trigger, edge, openToCollaborators, onToggleOpen, onEdit, onArchive, onLeave }: { open: boolean; onClose: (refocus: boolean) => void; trigger: React.RefObject<HTMLElement | null>; edge: React.RefObject<HTMLElement | null>; openToCollaborators: boolean; onToggleOpen: (v: boolean) => void; onEdit: () => void; onArchive: () => void; onLeave: () => void }) {
  const then = (fn: () => void) => () => { onClose(false); fn(); };
  return (
    <Popover open={open} onClose={onClose} trigger={trigger} edge={edge} align="end" width={340} label="PROJECT SETTINGS" role="menu" className="ph-pop--settings">
      <Eyebrow>PROJECT SETTINGS</Eyebrow>
      <button type="button" role="menuitem" className="ph-item ph-item--col" onClick={then(onEdit)}>
        <span className="ph-item__label">Edit project details</span>
        <span className="ph-item__cap">Name, summary and what the team needs.</span>
      </button>
      <div className="ph-item ph-item--toggle" onClick={(e) => { if (!(e.target as HTMLElement).closest("button")) onToggleOpen(!openToCollaborators); }}>
        <span className="ph-item__text">
          <span className="ph-item__label">Open to new collaborators</span>
          <span className="ph-item__cap">People can find this project and express interest.</span>
        </span>
        <Toggle checked={openToCollaborators} onChange={onToggleOpen} aria-label="Open to new collaborators" />
      </div>
      <Rule />
      <button type="button" role="menuitem" className="ph-item ph-item--col" onClick={then(onArchive)}>
        <span className="ph-item__label">Archive project</span>
        <span className="ph-item__cap">Moves it out of your active projects. You can restore it.</span>
      </button>
      <button type="button" role="menuitem" className="ph-item ph-item--col ph-item--danger" onClick={then(onLeave)}>
        <span className="ph-item__label">Leave project</span>
        <span className="ph-item__cap">Your access ends. Your work stays on the project record.</span>
      </button>
    </Popover>
  );
}

export type Details = { name: string; summary: string; needs: string };
export function EditDetailsDialog({ open, onClose, details, onSave }: { open: boolean; onClose: () => void; details: Details; onSave: (d: Details) => void }) {
  const [name, setName] = useState(details.name);
  const [summary, setSummary] = useState(details.summary);
  const [needs, setNeeds] = useState(details.needs);
  const [error, setError] = useState("");
  const form = useId().replace(/:/g, "");
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) { setWasOpen(open); if (open) { setName(details.name); setSummary(details.summary); setNeeds(details.needs); setError(""); } }
  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!name.trim()) { setError("Give the project a name to continue."); return; }
    onSave({ name: name.trim(), summary: summary.trim(), needs: needs.trim() });
  };
  return (
    <Modal open={open} onClose={onClose} width={640} className="ph-modal" eyebrow="PROJECT DETAILS" title="Edit project details" description="Changes are shown to everyone on the team."
      footer={<><Button type="submit" form={form}>Save changes</Button><FootLink onClick={onClose}>Cancel</FootLink></>}>
      <form id={form} className="cw-form" onSubmit={submit} noValidate>
        <Field label="Project name" hint="Everyone on the team sees this name." error={error || undefined}>
          <Input value={name} placeholder={details.name} onChange={(e) => { setName(e.target.value); if (error) setError(""); }} />
        </Field>
        <Field label="Short summary" hint="One or two sentences are enough.">
          <Textarea rows={2} className="cw-ta" value={summary} onChange={(e) => setSummary(e.target.value)} />
        </Field>
        <Field label="What the team needs" hint="This helps Akines suggest collaborators.">
          <Input value={needs} onChange={(e) => setNeeds(e.target.value)} />
        </Field>
      </form>
    </Modal>
  );
}

export function ConfirmDialog({ open, onClose, eyebrow, title, description, confirm, keep, onConfirm }: { open: boolean; onClose: () => void; eyebrow: string; title: string; description: string; confirm: string; keep: string; onConfirm: () => void }) {
  return <Modal open={open} onClose={onClose} width={640} className="ph-modal" eyebrow={eyebrow} title={title} description={description} footer={<><Button onClick={onConfirm}>{confirm}</Button><FootLink onClick={onClose}>{keep}</FootLink></>} />;
}

const PREF_ROWS: { key: keyof NotifyPrefs; label: string; text: string }[] = [
  { key: "review", label: "Review requests", text: "When someone asks you to review work." },
  { key: "decisions", label: "Decisions and agreements", text: "When something is waiting for your acknowledgement." },
  { key: "conversations", label: "New conversations", text: "When a conversation starts or someone replies." },
  { key: "milestones", label: "Milestone reminders", text: "A reminder before a milestone is due." },
];
export function PrefsDialog({ open, onClose, name, prefs, onSave }: { open: boolean; onClose: () => void; name: string; prefs: NotifyPrefs; onSave: (p: NotifyPrefs) => void }) {
  const [draft, setDraft] = useState(prefs);
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) { setWasOpen(open); if (open) setDraft(prefs); }
  const uid = useId().replace(/:/g, "");
  return (
    <Modal open={open} onClose={onClose} width={640} className="ph-modal" eyebrow="NOTIFICATIONS" title="What should reach you?" description={`Choose what you hear about for ${name}. Private reflections never appear here.`}
      footer={<><Button onClick={() => onSave(draft)}>Save preferences</Button><FootLink onClick={onClose}>Cancel</FootLink></>}>
      <ul className="ph-prefs">
        {PREF_ROWS.map((r) => (
          <li key={r.key} className="ph-pref">
            <label className="ph-pref__text" htmlFor={`${uid}-${r.key}`}><span className="ph-pref__label">{r.label}</span><span className="ph-pref__desc">{r.text}</span></label>
            <Toggle id={`${uid}-${r.key}`} checked={draft[r.key]} onChange={(v) => setDraft((d) => ({ ...d, [r.key]: v }))} aria-label={r.label} />
          </li>
        ))}
      </ul>
    </Modal>
  );
}

const CHOICES = ["Summarise where we are.", "Prepare the next meeting agenda.", "What information is missing?", "Suggest our next steps.", "Summarise the open decision."];
const THINKING_MS = 2200;
const stamp = () => `Today, ${new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;

/**
 * Create AI, opened from the project bar: the same panel as the corner one (cai-*), started on the project.
 * Asking where things stand gives a summary built from the project's own data and links to what needs the member.
 */
export function ProjectAi({ open, onClose, projectName, answer, go }: { open: boolean; onClose: () => void; projectName: string; answer: string; go: { label: string; href: string }[] }) {
  const { mounted, state } = usePresence(open, 220);
  const [view, setView] = useState<"start" | "thinking" | "answer">("start");
  const [picked, setPicked] = useState<number[]>([]);
  const [time, setTime] = useState("");
  const [layout, setLayout] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [inApp, setInApp] = useState(false);
  const panel = useRef<HTMLElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const lead = useId();

  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) { setWasOpen(open); if (open) { setView("start"); setPicked([]); setTime(stamp()); } }

  useEffect(() => {
    if (!open) return;
    const read = () => setLayout(window.matchMedia("(max-width: 767px)").matches ? "mobile" : window.matchMedia("(max-width: 1279px)").matches ? "tablet" : "desktop");
    read();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the app frame is only known in the browser
    setInApp(!!document.querySelector(".app"));
    const t = window.setTimeout(() => panel.current?.focus({ preventScroll: true }), 30);
    document.body.classList.add("ph-ai-on");
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", esc);
    window.addEventListener("resize", read);
    return () => { window.clearTimeout(t); document.body.classList.remove("ph-ai-on"); document.removeEventListener("keydown", esc); window.removeEventListener("resize", read); };
  }, [open, onClose]);

  useEffect(() => {
    if (!open || view !== "thinking") return;
    const t = window.setTimeout(() => setView("answer"), THINKING_MS);
    return () => window.clearTimeout(t);
  }, [open, view]);
  useEffect(() => {
    body.current?.scrollTo({ top: body.current.scrollHeight, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }, [view, mounted]);

  const pick = (i: number) => { setPicked((p) => (p.includes(i) ? p : [...p, i])); if (i === 0) setView("thinking"); };
  const restart = () => { setView("start"); setPicked([]); setTime(stamp()); };

  if (!mounted) return null;
  return (
    <div className="cai ph-ai" data-open={open || undefined} data-layout={layout} data-app={inApp || undefined}>
      <section ref={panel} tabIndex={-1} className="cai-panel" data-state={state} role="dialog" aria-modal="false" aria-label="Create AI">
        <header className="cai-head">
          <span className="cai-head__mark" aria-hidden><CreateAiMark size={32} /></span>
          <h2 className="cai-head__title">Create AI</h2>
          <div className="cai-head__actions">
            <IconButton label="Start again" size="sm" variant="ghost" onClick={restart}><RotateCcw strokeWidth={1.5} /></IconButton>
            <IconButton label="Close" size="sm" variant="ghost" onClick={onClose}><X strokeWidth={1.5} /></IconButton>
          </div>
        </header>
        <div className="cai-body" ref={body} aria-live="polite">
          {view === "start" ? (
            <>
              <p className="cai-stamp">{time}</p>
              <div className="cai-msg cai-msg--bot">
                <p className="cai-hello">{projectName}.</p>
                <h3 className="cai-q">How can I help with the project?</h3>
                <p className="cai-lead" id={lead}>Choose where to start, or ask anything.</p>
                <div className="cai-chips" role="group" aria-labelledby={lead}>
                  {CHOICES.map((c, i) => <Chip key={c} variant="choice" selected={picked.includes(i)} onClick={() => pick(i)}>{c}</Chip>)}
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="cai-msg cai-msg--me"><p>{CHOICES[0]}</p></div>
              <div className="cai-msg cai-msg--bot">
                {view === "thinking" ? <p className="cai-typing" role="status" aria-label="Create AI is thinking"><span /><span /><span /></p> : (
                  <>
                    <p className="cai-text">{answer}</p>
                    {go.length ? <div className="cai-go">{go.map((g) => <Button key={g.label} size="sm" variant="secondary" arrow="up-right" href={g.href} onClick={onClose}>{g.label}</Button>)}</div> : null}
                  </>
                )}
              </div>
            </>
          )}
        </div>
        <form className="cai-form" onSubmit={(e) => e.preventDefault()}>
          <label className="cai-field">
            <span className="sr-only">Message Create AI</span>
            <input className="cai-input" type="text" readOnly placeholder="Ask about this project" autoComplete="off" />
            <IconButton label="Send" size="sm" variant="primary" type="submit" disabled><ArrowUp strokeWidth={1.6} /></IconButton>
          </label>
          <p className="cai-foot">Create AI can get things wrong. Please check anything important.</p>
        </form>
      </section>
      <button type="button" className="cai-launcher" aria-label="Close Create AI" aria-expanded={open} onClick={onClose}><CreateAiMark size={56} /></button>
    </div>
  );
}
