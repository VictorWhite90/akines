"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { Bold, Check, ChevronDown, Italic, Link as LinkIcon, List, ListOrdered, MessageSquarePlus, Quote, Redo2, RotateCcwClock, Table, TextAlignCenter, TextAlignStart, Underline, Undo2, type LucideIcon } from "lucide-react";
import Button from "@/components/kin/Button";
import { toast } from "@/components/kin/Toast";
import { faceSrc } from "@/components/kin/home/parts";
import { useDocument, type Block, type Doc, type DocThread, type Part } from "@/lib/collab/documents";
import { clock24, editedAt, firstName, initialsOf, nameOf, type Version } from "@/lib/collab/live";
import { ME } from "@/lib/collab/me";
import type { PersonId } from "@/lib/data/people";
import { Banner, Ico, Pop, ToolFrame, VersionList, bannerFor, useToolState, viewingTitle, type ToolState, type Ws } from "./ToolFrame";
import "../styles/research-workspace.css";

/*
 * The Research Workspace, mirrored from the product design (research-workspace.css, tr-): the formatting bar with
 * the editing mode, the outline, the page with comment highlights, a collaborator's cursor and your caret, and
 * the comments panel, or the version history while you preview an older version. Read from lib/collab/documents.
 */

const STYLES = [
  { id: "normal", label: "Normal text" }, { id: "h1", label: "Heading 1" }, { id: "h2", label: "Heading 2" },
  { id: "h3", label: "Heading 3" }, { id: "quote", label: "Quote" },
];
const MODES = ["Editing", "Suggesting", "Viewing"] as const;

function Tool({ label, icon, dim }: { label: string; icon: LucideIcon; dim?: boolean }) {
  return <button type="button" className="tr-tool" aria-label={label} disabled={dim}><Ico icon={icon} size={20} /></button>;
}

function FormatBar({ mode, onMode, style, styleOpen, onStyle }: { mode: string; onMode: (m: (typeof MODES)[number]) => void; style: string; styleOpen: boolean; onStyle: () => void }) {
  const label = STYLES.find((s) => s.id === style)!.label;
  return (
    <div className="tr-bar" role="toolbar" aria-label="Formatting">
      <div className="tr-bar__group"><Tool label="Undo" icon={Undo2} /><Tool label="Redo" icon={Redo2} /></div>
      <i className="tr-bar__rule" />
      <button type="button" className="tr-style" onClick={onStyle} aria-haspopup="menu" aria-expanded={styleOpen} aria-label={`Text style: ${label}`}>
        <span>{label}</span><Ico icon={ChevronDown} />
      </button>
      <i className="tr-bar__rule" />
      <div className="tr-bar__group"><Tool label="Bold" icon={Bold} /><Tool label="Italic" icon={Italic} /><Tool label="Underline" icon={Underline} /><Tool label="Link" icon={LinkIcon} /></div>
      <i className="tr-bar__rule" />
      <div className="tr-bar__group"><Tool label="Bulleted list" icon={List} /><Tool label="Numbered list" icon={ListOrdered} /><Tool label="Align left" icon={TextAlignStart} /><Tool label="Align centre" icon={TextAlignCenter} /></div>
      <i className="tr-bar__rule" />
      <div className="tr-bar__group"><Tool label="Table" icon={Table} /><Tool label="Quote" icon={Quote} /><Tool label="Comment" icon={MessageSquarePlus} /></div>
      <span className="tr-bar__spacer" />
      <div className="tr-mode" role="radiogroup" aria-label="Mode">
        {MODES.map((m) => <button key={m} type="button" role="radio" aria-checked={mode === m} className="tr-mode__item" data-on={mode === m || undefined} onClick={() => onMode(m)}>{m}</button>)}
      </div>
    </div>
  );
}

const slug = (s: string) => `tr-${s.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

function Outline({ doc, history, onHistory }: { doc: Doc; history: boolean; onHistory: () => void }) {
  const [current, setCurrent] = useState(doc.outline[0]?.label);
  const go = (label: string) => { setCurrent(label); document.getElementById(slug(label))?.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" }); };
  const foot = <><Ico icon={RotateCcwClock} size={18} /><span>Version history</span></>;
  return (
    <nav className="tr-outline" aria-label="Outline">
      <p className="tr-outline__head">OUTLINE</p>
      <ul className="tr-outline__list">
        {doc.outline.map((o) => <li key={o.label}><button type="button" className="tr-outline__item" data-level={o.level} aria-current={current === o.label ? "location" : undefined} onClick={() => go(o.label)}>{o.label}</button></li>)}
      </ul>
      <div className="tr-outline__foot">
        {/* The design links here to the version history; it is a button that opens it. */}
        {history ? <span className="tr-outline__link" aria-current="page">{foot}</span> : <a href="#version-history" className="tr-outline__link" onClick={(e) => { e.preventDefault(); onHistory(); }}>{foot}</a>}
      </div>
    </nav>
  );
}

function Run({ part, caret }: { part: Part; caret: boolean }) {
  if (typeof part === "string") return <>{part}</>;
  if ("caret" in part) return caret ? <span className="tr-caret" aria-hidden="true" /> : null;
  // The two highlight tones are the design's (named after its sample people): strong for the active thread, soft for others.
  if ("mark" in part) return <mark className={`tr-mark tr-mark--${part.mark === "strong" ? "ayo" : "amara"}`}>{part.text}</mark>;
  return (
    <>
      <span className="tr-sel">{part.sel}</span>
      <span className="tr-cursor" aria-hidden="true"><span className="tr-cursor__tag">{firstName(part.cursor)}</span><span className="tr-cursor__caret" /></span>
    </>
  );
}

function Page({ doc, caret }: { doc: Doc; caret: boolean }) {
  const last = doc.versions[0];
  return (
    <article className="tr-page">
      <h2 className="tr-page__title">{doc.title}</h2>
      <p className="tr-page__meta">Draft {doc.draft}{last ? `, last edited ${editedAt(last.at)}` : ""}</p>
      {doc.blocks.map((b: Block, i) => (b.kind === "h2"
        ? <h3 key={i} id={slug(b.text)} className="tr-h2">{b.text}</h3>
        : (
          <p key={i} className={`tr-p tr-p--${b.variant}`}>
            {b.lines.map((l, j) => <span key={j} className={l.cont ? "tr-line tr-line--cont" : "tr-line"}>{l.parts.map((p, k) => <Fragment key={k}><Run part={p} caret={caret} /></Fragment>)}</span>)}
          </p>
        )))}
    </article>
  );
}

function Face({ who }: { who: PersonId }) {
  const src = faceSrc(who);
  // eslint-disable-next-line @next/next/no-img-element -- member face
  return src ? <img className="tr-c28" src={src} alt="" loading="lazy" decoding="async" /> : <span className="tr-c28 tr-c28--kemi" aria-hidden="true">{initialsOf(who)}</span>;
}

type ThreadState = "open" | "replying" | "resolved";

function ThreadCard({ thread, state, active, onState, onPick }: { thread: DocThread; state: ThreadState; active: boolean; onState: (s: ThreadState, reply?: string) => void; onPick: () => void }) {
  const field = useRef<HTMLTextAreaElement>(null);
  const [draft, setDraft] = useState("");
  const prev = useRef(state);
  useEffect(() => { if (prev.current !== "replying" && state === "replying") field.current?.focus({ preventScroll: true }); prev.current = state; }, [state]);
  return (
    <section className="tr-thread" data-state={state} data-active={active || state === "replying" || undefined} aria-label={`Comment thread on "${thread.quote}"`} onClick={onPick}>
      <div className="tr-thread__quote"><i className="tr-thread__bar" /><p>{thread.quote}</p></div>
      <div className="tr-thread__msgs">
        {thread.messages.map((m, i) => (
          <div key={i} className="tr-msg">
            <Face who={m.who} />
            <div className="tr-msg__body"><p className="tr-msg__head"><b>{nameOf(m.who)}</b><span>{clock24(m.at)}</span></p><p className="tr-msg__text">{m.text}</p></div>
          </div>
        ))}
      </div>
      {state === "open" ? (
        <div className="tr-thread__actions">
          <Button variant="ghost" size="sm" onClick={() => onState("replying")}>Reply</Button>
          <Button variant="secondary" size="sm" onClick={() => onState("resolved")}>Resolve</Button>
        </div>
      ) : null}
      {state === "replying" ? (
        <>
          <textarea ref={field} className="tr-thread__field" rows={1} value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Write a reply" aria-label="Write a reply" />
          <div className="tr-thread__actions tr-thread__actions--end">
            <Button variant="ghost" size="sm" onClick={() => { setDraft(""); onState("open"); }}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={() => { const t = draft.trim(); setDraft(""); onState("open", t || undefined); }}>Reply</Button>
          </div>
        </>
      ) : null}
      {state === "resolved" ? (
        <div className="tr-thread__actions tr-thread__actions--between">
          <span className="tr-thread__done"><Ico icon={Check} /><span>Resolved by {thread.resolvedBy ? firstName(thread.resolvedBy) : "the team"}</span></span>
          <Button variant="ghost" size="sm" onClick={() => onState("open")}>Reopen</Button>
        </div>
      ) : null}
    </section>
  );
}

function Comments({ doc, onReply, onResolve }: { doc: Doc; onReply: (id: string, t: string) => void; onResolve: (id: string, r: boolean) => void }) {
  const [filter, setFilter] = useState<"Open" | "Resolved" | "Mine">("Open");
  const [replying, setReplying] = useState<string | null>(null);
  const [active, setActive] = useState(doc.threads.find((t) => !t.resolved)?.id);
  // Threads you resolve here stay in place (with Reopen) until you change the filter.
  const [kept, setKept] = useState<string[]>([]);
  const open = doc.threads.filter((t) => !t.resolved).length;
  const resolved = doc.threads.length - open;
  const shown = doc.threads.filter((t) => (filter === "Open" ? !t.resolved || kept.includes(t.id) : filter === "Resolved" ? t.resolved : t.messages.some((m) => m.who === ME)));
  const stateOf = (t: DocThread): ThreadState => (t.resolved ? "resolved" : replying === t.id ? "replying" : "open");
  const change = (t: DocThread, s: ThreadState, reply?: string) => {
    setActive(t.id);
    setReplying(s === "replying" ? t.id : null);
    if (reply) onReply(t.id, reply);
    if (s === "resolved" && !t.resolved) { onResolve(t.id, true); setKept((k) => [...k, t.id]); }
    if (s === "open" && t.resolved) onResolve(t.id, false);
  };
  return (
    <div className="tr-comments">
      <header className="tr-comments__head"><h2>Comments</h2><p>{`${open} open, ${resolved} resolved`}</p></header>
      <div className="tr-filters" role="group" aria-label="Filter comments">
        {(["Open", "Resolved", "Mine"] as const).map((f) => <button key={f} type="button" className="tr-filter" data-on={filter === f || undefined} aria-pressed={filter === f} onClick={() => { setFilter(f); setKept([]); }}>{f}</button>)}
      </div>
      {shown.map((t) => <ThreadCard key={t.id} thread={t} state={stateOf(t)} active={active === t.id} onState={(s, r) => change(t, s, r)} onPick={() => setActive(t.id)} />)}
      {filter === "Open" && resolved ? <p className="tr-comments__resolved"><Ico icon={Check} /><span>{resolved === 1 ? "1 resolved comment" : `${resolved} resolved comments`}</span></p> : null}
    </div>
  );
}

export default function ResearchWorkspace({ ws }: { ws: Ws }) {
  const { doc, reply, resolve, restore } = useDocument(ws.project);
  const tool = useToolState();
  const [mode, setMode] = useState<(typeof MODES)[number]>("Editing");
  const [style, setStyle] = useState("h2");
  const [styleOpen, setStyleOpen] = useState(false);
  const [history, setHistory] = useState(false);
  const [preview, setPreview] = useState<Version | null>(null);
  if (!doc) return null;

  const state: ToolState = tool.net !== "online" ? tool.net : history ? "versionHistory" : tool.saving ? "saving" : "saved";
  const banner = bannerFor(state);
  const picked = preview ?? doc.versions[Math.min(2, doc.versions.length - 1)];
  const toggleHistory = () => { setHistory((h) => !h); setPreview(null); };

  return (
    <ToolFrame ws={ws} kind="research" state={state} title={doc.title} people={doc.presence}
      history={history} onHistory={toggleHistory} comments={!history} onComments={() => setHistory(false)}
      overlays={styleOpen ? (
        <Pop onClose={() => setStyleOpen(false)} label="Text style" className="tr-pop--style">
          <ul className="tr-styles" role="menu">
            {STYLES.map((s) => (
              <li key={s.id} role="none">
                <button type="button" role="menuitemradio" aria-checked={s.id === style} className="tr-styles__item" data-style={s.id} data-on={s.id === style || undefined} onClick={() => { setStyle(s.id); setStyleOpen(false); }}>
                  <span>{s.label}</span>{s.id === style ? <Ico icon={Check} /> : null}
                </button>
              </li>
            ))}
          </ul>
        </Pop>
      ) : null}>
      <FormatBar mode={mode} onMode={setMode} style={style} styleOpen={styleOpen} onStyle={() => setStyleOpen((o) => !o)} />
      <div className="tr-body">
        <Outline doc={doc} history={history} onHistory={toggleHistory} />
        <div className="tr-stage">
          {banner && picked ? (
            <Banner kind={banner} title={banner === "version" ? viewingTitle(picked) : undefined} onRetry={tool.retry}
              onBack={() => setHistory(false)}
              onRestore={() => { restore(picked); setHistory(false); tool.save(); toast.show({ message: "Version restored." }); }} />
          ) : null}
          <main className="tr-canvas" id="main" tabIndex={-1}><Page doc={doc} caret={mode !== "Viewing"} /></main>
        </div>
        <aside className="tr-side" aria-label={history ? "Version history" : "Comments"}>
          {history ? <VersionList versions={doc.versions} selected={picked?.id} onSelect={setPreview} />
            : <Comments doc={doc} onReply={(id, t) => { reply(id, t); tool.save(); }} onResolve={(id, r) => { resolve(id, r); tool.save(); }} />}
        </aside>
      </div>
    </ToolFrame>
  );
}
