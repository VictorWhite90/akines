"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronRight, CircleAlert, CircleCheck, CloudOff, Eye, FileText, MessageSquare, Palette, PanelLeft, RefreshCw, RotateCcwClock, type LucideIcon } from "lucide-react";
import Button, { IconButton } from "@/components/kin/Button";
import { faceSrc } from "@/components/kin/home/parts";
import { WORKSPACE_PAGES, type useWorkspace } from "@/lib/collab/workspace";
import { accessOf, editedAt, firstName, initialsOf, nameOf, presenceSummary, versionTime, type LivePerson, type Version } from "@/lib/collab/live";
import { ME } from "@/lib/collab/me";
import type { PersonId } from "@/lib/data/people";
import "../styles/art-workspace.css";
import Img from "@/components/kin/Img";

/*
 * The frame both full-screen workspace tools share, mirrored from the product design (art-workspace.css, tw-):
 * the top bar (project menu, breadcrumb, tool chip, title, save status, who is here, version history, comments,
 * Share), its popovers (the project menu, People in this workspace, and the save status under the pill), the
 * status banners and the version history list. The canvas and the document fill it (ArtWorkspace, ResearchWorkspace).
 */

export type Ws = ReturnType<typeof useWorkspace>;
/**
 * What the status pill says: saved, saving a change, a collaborator who dropped out (still saved), offline, reconnecting,
 * a save that failed, your role allows viewing only, or a read-only preview of an older version.
 */
export type ToolState = "saved" | "saving" | "collaboratorOffline" | "lost" | "reconnecting" | "failed" | "viewOnly" | "versionHistory";
/**
 * The design's state frames, each with its own route (workspace/state-…): they open the tool already in that state.
 * commentReply (the document) and commentThread (the canvas) open the first comment thread.
 */
export type WorkspaceState = "saving" | "couldNotSave" | "collaboratorOffline" | "connectionLost" | "reconnecting" | "viewOnly" | "versionHistory" | "commentReply" | "commentThread";
export const STATE_ROUTE: Record<WorkspaceState, string> = {
  saving: "state-saving", couldNotSave: "state-could-not-save", collaboratorOffline: "state-collaborator-offline", connectionLost: "state-connection-lost",
  reconnecting: "state-reconnecting", viewOnly: "state-view-only", versionHistory: "state-version-history", commentReply: "state-comment-reply", commentThread: "state-comment-thread",
};
const STATUS: Record<ToolState, { tone: "saved" | "saving" | "lost" | "reconnecting" | "failed" | "view"; label: string; icon: LucideIcon }> = {
  saved: { tone: "saved", label: "All changes saved", icon: CircleCheck },
  saving: { tone: "saving", label: "Saving changes", icon: RefreshCw },
  collaboratorOffline: { tone: "saved", label: "All changes saved", icon: CircleCheck },
  lost: { tone: "lost", label: "Connection lost", icon: CloudOff },
  reconnecting: { tone: "reconnecting", label: "Reconnecting", icon: RefreshCw },
  failed: { tone: "failed", label: "Could not save", icon: CircleAlert },
  viewOnly: { tone: "view", label: "View only", icon: Eye },
  versionHistory: { tone: "view", label: "View only", icon: Eye },
};

/** The design's icon: 16px by default, a 1.5 stroke that stays 1.5 at any size. */
export function Ico({ icon: I, size = 16, className }: { icon: LucideIcon; size?: number; className?: string }) {
  return <I size={size} strokeWidth={1.5} absoluteStrokeWidth className={className} aria-hidden="true" focusable="false" />;
}

/**
 * The faces the design's two workspaces show: Kemi (you) as initials, and the workspace photos of Amara Obi, Ayo Bello and
 * Yusuf Danjuma (other photos than their profile ones). Everyone else shows their usual face.
 */
const TOOL_FACES: Partial<Record<PersonId, string | null>> = {
  kemi: null,
  "amara-obi": "/kin/design/people/workspace/amara.jpg",
  "ayo-bello": "/kin/design/people/workspace/ayo.jpg",
  "yusuf-danjuma": "/kin/design/people/workspace/yusuf.jpg",
};
export const toolFace = (who: PersonId): string | undefined => { const f = TOOL_FACES[who]; return f === null ? undefined : f ?? faceSrc(who); };

/** A person's avatar with their live ring and dot. */
export function LiveAvatar({ who, state }: { who: PersonId; state: LivePerson["state"] | "offline" }) {
  const src = toolFace(who);
  return (
    <span className="tw-av" data-state={state} title={nameOf(who)}>
      {state !== "away" ? <span className="tw-av__ring" /> : null}
      <span className="tw-av__photo">{src ? <Img sizes="40px" src={src} /> : <span className="tw-av__initials">{initialsOf(who)}</span>}</span>
      {state !== "away" ? <span className="tw-av__dot" /> : null}
    </span>
  );
}

/**
 * Saving: a change shows "Saving changes" for a moment, then "All changes saved". Offline shows "Connection lost".
 * A save that fails shows "Could not save" until Try again (`failed` starts the tool in that state).
 */
export function useToolState(ws: Ws, forced?: WorkspaceState) {
  const router = useRouter();
  const [saving, setSaving] = useState(forced === "saving");
  const [error, setError] = useState(forced === "couldNotSave");
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [net, setNet] = useState<"online" | "lost" | "reconnecting">(forced === "connectionLost" ? "lost" : forced === "reconnecting" ? "reconnecting" : "online");
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  // The Saving and Reconnecting frames, as in the design: Saving reads "All changes saved" after 1.5 s and returns to the
  // workspace after 2 s; Reconnecting returns after 3 s. An open save status popover holds them (they start again when it closes).
  const [hold, setHold] = useState(false);
  const base = ws.project ? ws.href("workspace") : null;
  useEffect(() => {
    if (hold || !base || (forced !== "saving" && forced !== "reconnecting")) return;
    const timers = forced === "saving"
      ? [setTimeout(() => { setSaving(false); setSavedAt(Date.now()); }, 1500), setTimeout(() => router.replace(base), 2000)]
      : [setTimeout(() => router.replace(base), 3000)];
    return () => timers.forEach(clearTimeout);
  }, [forced, hold, base, router]);
  useEffect(() => {
    const off = () => setNet("lost");
    const on = () => { setNet("reconnecting"); window.setTimeout(() => setNet("online"), 1500); };
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the browser's connection when the tool opens
    if (!navigator.onLine) setNet("lost");
    window.addEventListener("offline", off);
    window.addEventListener("online", on);
    return () => { window.removeEventListener("offline", off); window.removeEventListener("online", on); clearTimeout(timer.current); };
  }, []);
  const save = () => { setError(false); setSaving(true); clearTimeout(timer.current); timer.current = setTimeout(() => { setSaving(false); setSavedAt(Date.now()); }, 1500); };
  return {
    net,
    saving,
    failed: error,
    /** When this visit last saved a change. */
    savedAt,
    /** Show a change being saved. */
    save,
    /** Try again after the connection was lost (the Connection lost frame goes to the Reconnecting frame). */
    retry: () => {
      if (forced === "connectionLost" && base) { router.replace(`${base}/${STATE_ROUTE.reconnecting}`); return; }
      setNet("reconnecting"); window.setTimeout(() => setNet(navigator.onLine ? "online" : "lost"), 3000);
    },
    /** Told when the save status popover opens or closes. */
    onSaveOpenChange: setHold,
  };
}

function Status({ state, onToggle, expanded }: { state: ToolState; onToggle?: () => void; expanded?: boolean }) {
  const s = STATUS[state];
  const body = <><Ico icon={s.icon} className="tw-status__icon" /><span className="tw-status__label">{s.label}</span></>;
  // with a save status popover the pill is the button that opens it
  return onToggle
    ? <button type="button" className="tw-status" data-tone={s.tone} aria-haspopup="dialog" aria-expanded={Boolean(expanded)} onClick={onToggle}>{body}</button>
    : <span className="tw-status" data-tone={s.tone} role="status">{body}</span>;
}

/** A popover under the top bar: focus moves in, Escape or a click outside closes it, focus returns. */
export function Pop({ onClose, label, className, kind, children }: { onClose: () => void; label: string; className?: string; kind?: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const close = useRef(onClose);
  useEffect(() => { close.current = onClose; });
  useEffect(() => {
    const back = document.activeElement as HTMLElement | null;
    (ref.current?.querySelector<HTMLElement>('a[href], button:not([disabled]), [tabindex="0"]') ?? ref.current)?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close.current(); };
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("keydown", onKey); if (back && document.contains(back)) back.focus({ preventScroll: true }); };
  }, []);
  return (
    <>
      <div className="tw-scrim" onClick={onClose} aria-hidden="true" />
      <div ref={ref} className={["tw-pop", className].filter(Boolean).join(" ")} data-kind={kind} role="dialog" aria-label={label} tabIndex={-1}>{children}</div>
    </>
  );
}

/** The save status popover follows the pill: Saved, Saving, Offline, Could not save. Reconnecting and a version preview have none. */
type SaveKind = "saved" | "saving" | "offline" | "failed";
const SAVE_KIND_OF: Partial<Record<ToolState, SaveKind>> = { saved: "saved", collaboratorOffline: "saved", saving: "saving", lost: "offline", failed: "failed" };
const SAVE_ICON: Record<SaveKind, LucideIcon> = { saved: CircleCheck, saving: RefreshCw, offline: CloudOff, failed: CircleAlert };
const SAVE_COPY = {
  saved: { title: "All changes saved", note: "Autosave is on", now: "Save now", history: "Version history" },
  saving: { title: "Saving your changes", note: "Autosave is on" },
  offline: { title: "Working offline", note: "Your changes are saved on this device and will sync when you are back online." },
  failed: { title: "We could not save your changes.", retry: "Try again" },
};
/** "Last saved just now" after a save in the last minute, otherwise when the latest version was saved. */
export const lastSaved = (savedAt: number | null, latest?: number) => {
  const at = Math.max(savedAt ?? 0, latest ?? 0);
  return !at || Date.now() - at < 60_000 ? "Last saved just now" : `Last saved ${editedAt(at)}`;
};
/** What the save status popover shows and does. */
export type SaveInfo = { last: string; onSaveNow: () => void; onHistory: () => void; onRetry: () => void };

/** Save Status Popover: a 320 wide card 8 px under the pill, closed by a click outside, the pill or Escape. */
function SavePop({ kind, info, onClose }: { kind: SaveKind; info: SaveInfo; onClose: () => void }) {
  const c = SAVE_COPY[kind];
  return (
    <Pop onClose={onClose} label="Save status" className="tw-pop--save" kind={kind}>
      <div className="tw-save__head">
        <Ico icon={SAVE_ICON[kind]} size={20} className="tw-save__icon" />
        <h2 className="tw-save__title">{c.title}</h2>
      </div>
      {kind === "saved" ? (
        <>
          <div className="tw-save__details"><p>{info.last}</p><p>{SAVE_COPY.saved.note}</p></div>
          <hr className="tw-save__rule" />
          <div className="tw-save__actions">
            <Button variant="secondary" size="sm" onClick={() => { onClose(); info.onSaveNow(); }}>{SAVE_COPY.saved.now}</Button>
            <a href="#version-history" className="tw-save__link" onClick={(e) => { e.preventDefault(); onClose(); info.onHistory(); }}>{SAVE_COPY.saved.history}</a>
          </div>
        </>
      ) : null}
      {kind === "saving" || kind === "offline" ? <div className="tw-save__details"><p>{SAVE_COPY[kind].note}</p></div> : null}
      {kind === "failed" ? (
        <>
          <hr className="tw-save__rule" />
          <div className="tw-save__actions"><Button size="sm" onClick={() => { onClose(); info.onRetry(); }}>{SAVE_COPY.failed.retry}</Button></div>
        </>
      ) : null}
    </Pop>
  );
}

function ProjectMenu({ ws, onClose }: { ws: Ws; onClose: () => void }) {
  return (
    <Pop onClose={onClose} label="Project menu" className="tw-pop--menu">
      <nav className="tw-menu" aria-label="Project workspace">
        <p className="tw-menu__eyebrow">PROJECT WORKSPACE</p>
        <ul className="tw-menu__list">
          {WORKSPACE_PAGES.map((p, i) => {
            const inner = <><span className="tw-menu__num">{String(i + 1).padStart(2, "0")}</span><span className="tw-menu__label">{p.label}</span></>;
            return <li key={p.key}>{p.key === "workspace" ? <button type="button" className="tw-menu__item" aria-current="page" onClick={onClose}>{inner}</button> : <Link href={ws.href!(p.key)} className="tw-menu__item">{inner}</Link>}</li>;
          })}
        </ul>
      </nav>
    </Pop>
  );
}

/** A person in the top bar and People: live, or offline when they lost connection. */
type Shown = Omit<LivePerson, "state"> & { state: LivePerson["state"] | "offline" };

function PeoplePop({ ws, people, onClose }: { ws: Ws; people: Shown[]; onClose: () => void }) {
  return (
    <Pop onClose={onClose} label="People and access" className="tw-pop--people">
      <div className="tw-people">
        <header className="tw-people__head">
          <h2 className="tw-people__title">People in this workspace</h2>
          <p className="tw-people__sub">{presenceSummary(people.map((p) => (p.state === "offline" ? { ...p, state: "away" as const } : { ...p, state: p.state })))}</p>
        </header>
        <ul className="tw-people__list">
          {/* as in the design: you first, then who is here, then who is not */}
          {[...people].sort((a, b) => Number(b.who === ME) - Number(a.who === ME) || Number(a.state === "away") - Number(b.state === "away")).map((p) => {
            const access = p.access ?? accessOf(p.who, ws.project!.host);
            return (
              <li key={p.who} className="tw-person">
                <LiveAvatar who={p.who} state={p.state} />
                <span className="tw-person__who"><span className="tw-person__name">{nameOf(p.who) + (p.who === ME ? " (you)" : "")}</span><span className="tw-person__note">{p.note}</span></span>
                <span className="tw-role" data-owner={access === "Owner" || undefined}>{access}</span>
              </li>
            );
          })}
        </ul>
        <hr className="tw-people__rule" />
        <footer className="tw-people__foot">
          <p>Only the project owner can change who has access. Access follows the project team and its agreements.</p>
          <Button variant="secondary" size="sm" href={ws.href!("team")}>Manage access</Button>
        </footer>
      </div>
    </Pop>
  );
}

type BannerKind = "collaborator" | "reconnecting" | "lost" | "view" | "version";
const BANNER: Record<BannerKind, { tone: "warning" | "error" | "info"; icon: LucideIcon; title: string; detail: string }> = {
  // the title names the collaborator ("Amara lost connection"), and the detail says her or their (lostDetail)
  collaborator: { tone: "warning", icon: RefreshCw, title: "", detail: "Their changes so far are saved. They will show up again when they are back online." },
  reconnecting: { tone: "warning", icon: RefreshCw, title: "Reconnecting to the workspace", detail: "Hold on. You can keep working and nothing will be lost." },
  lost: { tone: "error", icon: CloudOff, title: "Connection lost", detail: "Your changes are saved on this device. We will sync them when you are back online." },
  view: { tone: "info", icon: Eye, title: "You can view and comment, but not edit", detail: "Editing follows your role in this project. The project owner manages access." },
  version: { tone: "info", icon: RotateCcwClock, title: "", detail: "This is a preview. The current version is not changed until you restore." },
};

/** The banner over the work: offline, reconnecting, or previewing an older version. */
export function Banner({ kind, title, detail, className, onRetry, onBack, onRestore, onRequest }: { kind: BannerKind; title?: string; detail?: string; className?: string; onRetry?: () => void; onBack?: () => void; onRestore?: () => void; onRequest?: () => void }) {
  const b = BANNER[kind];
  return (
    <div className={["tw-banner", className].filter(Boolean).join(" ")} data-tone={b.tone} data-kind={kind} role={kind === "lost" ? "alert" : "status"}>
      <Ico icon={b.icon} size={20} className="tw-banner__icon" />
      <div className="tw-banner__text">
        <p className="tw-banner__title">{title ?? b.title}</p>
        <p className="tw-banner__detail">{detail ?? b.detail}</p>
      </div>
      {kind === "lost" ? <div className="tw-banner__actions"><Button variant="secondary" size="sm" onClick={onRetry}>Try again</Button></div> : null}
      {kind === "view" ? <div className="tw-banner__actions"><Button variant="secondary" size="sm" onClick={onRequest}>Request edit access</Button></div> : null}
      {kind === "version" ? (
        <div className="tw-banner__actions">
          <Button variant="ghost" size="sm" onClick={onBack}>Back to current</Button>
          <Button variant="primary" size="sm" onClick={onRestore}>Restore this version</Button>
        </div>
      ) : null}
    </div>
  );
}
const BANNER_OF: Partial<Record<ToolState, BannerKind>> = { collaboratorOffline: "collaborator", lost: "lost", reconnecting: "reconnecting", viewOnly: "view", versionHistory: "version" };
export const bannerFor = (state: ToolState): BannerKind | null => BANNER_OF[state] ?? null;
/** "Amara lost connection" */
export const lostTitle = (who: PersonId) => `${firstName(who)} lost connection`;
/** The design's words for Amara Obi; anyone else is "their". */
const SHE: PersonId[] = ["amara-obi"];
export const lostDetail = (who: PersonId) => (SHE.includes(who) ? "Her changes so far are saved. She will show up again when she is back online." : undefined);
/** "Viewing the version from yesterday, 16:20" */
export const viewingTitle = (v: Version) => { const t = versionTime(v.at); return `Viewing the version from ${t.charAt(0).toLowerCase()}${t.slice(1)}`; };

/** The version history list: the current version, then older ones to preview. */
export function VersionList({ versions, selected, onSelect }: { versions: Version[]; selected?: string; onSelect: (v: Version) => void }) {
  return (
    <div className="tw-vh">
      <header className="tw-vh__head">
        <h2 className="tw-vh__title">Version history</h2>
        <p className="tw-vh__sub">Pick a version to preview it</p>
      </header>
      <ul className="tw-vh__list">
        {versions.map((v, i) => {
          const inner = (
            <>
              <i className="tw-vh__dot" aria-hidden="true" />
              <span className="tw-vh__text"><span className="tw-vh__time">{versionTime(v.at)}</span><span className="tw-vh__detail">{nameOf(v.who)}, {v.what}</span></span>
              {i === 0 ? <span className="tw-vh__current">Current</span> : null}
            </>
          );
          return (
            <li key={v.id}>
              {i === 0 ? <div className="tw-vh__row" data-state="current">{inner}</div> : <button type="button" className="tw-vh__row" data-state={v.id === selected ? "selected" : "default"} aria-pressed={v.id === selected} onClick={() => onSelect(v)}>{inner}</button>}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** The full-screen tool: top bar and popovers around the tool's body. */
export function ToolFrame({ ws, kind, state, title, people: present, offline, history, onHistory, comments, onComments, save, saveOpen: initialSave, onSaveOpenChange, children, overlays }: {
  ws: Ws; kind: "art" | "research"; state: ToolState; title: string; people: LivePerson[];
  /** Version history is open. */ history: boolean; onHistory: () => void;
  /** The comments control: pressed when the comments are showing. */ comments: boolean; onComments: () => void;
  /** The save status popover's controls (without it the pill has no popover). */ save?: SaveInfo;
  /** The save status popover is open when the tool opens (the Could not save state). */ saveOpen?: boolean;
  /** Told when the save status popover opens or closes. */ onSaveOpenChange?: (open: boolean) => void;
  /** A collaborator who lost connection: their avatar shows offline. */ offline?: PersonId;
  children: React.ReactNode; overlays?: React.ReactNode;
}) {
  const [menu, setMenu] = useState(false);
  const [who, setWho] = useState(false);
  const [saveOpen, setSaveOpen] = useState(Boolean(initialSave));
  const saveKind = save ? SAVE_KIND_OF[state] : undefined;
  const saveShown = saveOpen && saveKind !== undefined;
  const told = useRef(onSaveOpenChange);
  useEffect(() => { told.current = onSaveOpenChange; });
  useEffect(() => { told.current?.(saveShown); }, [saveShown]);
  const people: Shown[] = offline ? present.map((p) => (p.who === offline ? { ...p, state: "offline" as const } : p)) : present;
  const shown = people.filter((p) => p.state !== "away");
  const avatars = shown.slice(0, 3);
  const more = people.length - avatars.length;
  return (
    <div className="tw-ws" data-kind={kind} data-state={state}>
      <header className="tw-top">
        <IconButton label="Project menu" size="sm" variant="ghost" onClick={() => setMenu((o) => !o)} aria-haspopup="menu" aria-expanded={menu} className="tw-top__menu"><Ico icon={PanelLeft} /></IconButton>
        <nav className="tw-crumb" aria-label="Breadcrumb">
          <span className="tw-crumb__project">{ws.project!.title}</span>
          <Ico icon={ChevronRight} className="tw-crumb__sep" />
          <span className="tw-crumb__here" aria-current="page">Workspace</span>
        </nav>
        <span className="tw-chip"><Ico icon={kind === "research" ? FileText : Palette} /><span>{kind === "research" ? "Research Workspace" : "Digital Art Workspace"}</span></span>
        <div className="tw-title">
          <h1 className="tw-title__text">{title}</h1>
          {save && saveKind ? (
            <span className="tw-statuswrap">
              <Status state={state} onToggle={() => setSaveOpen((o) => !o)} expanded={saveShown} />
              {saveShown ? <SavePop kind={saveKind} info={save} onClose={() => setSaveOpen(false)} /> : null}
            </span>
          ) : <Status state={state} />}
        </div>
        <div className="tw-actions">
          <button type="button" className="tw-presence" onClick={() => setWho((o) => !o)} aria-haspopup="dialog" aria-expanded={who} aria-label={`People in this workspace, ${shown.filter((p) => p.state !== "offline").length} here now`}>
            {avatars.map((p) => <LiveAvatar key={p.who} who={p.who} state={p.state} />)}
            {more > 0 ? <span className="tw-presence__more">+{more}</span> : null}
          </button>
          <IconButton label="Version history" size="sm" variant="ghost" onClick={onHistory} aria-pressed={history}><Ico icon={RotateCcwClock} /></IconButton>
          <IconButton label="Comments" size="sm" variant="ghost" onClick={onComments} aria-pressed={comments}><Ico icon={MessageSquare} /></IconButton>
          <Button variant="primary" size="sm" onClick={() => setWho((o) => !o)} aria-haspopup="dialog">Share</Button>
        </div>
      </header>
      {children}
      {menu ? <ProjectMenu ws={ws} onClose={() => setMenu(false)} /> : null}
      {who ? <PeoplePop ws={ws} people={people} onClose={() => setWho(false)} /> : null}
      {overlays}
    </div>
  );
}
