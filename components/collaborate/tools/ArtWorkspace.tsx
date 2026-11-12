"use client";

import { useState } from "react";
import { Eraser, Eye, EyeOff, Hand, Maximize, Move, PaintBucket, Pipette, Plus, Redo2, Shapes, SquareDashed, Type, Undo2, ZoomIn, ZoomOut, createLucideIcon, type LucideIcon } from "lucide-react";
import Button from "@/components/kin/Button";
import { photoSrc } from "@/components/kin/home/parts";
import { useCanvas, layerDetail, type Canvas, type Layer, type Pin } from "@/lib/collab/canvas";
import { clock24, firstName, initialsOf, nameOf, type Version } from "@/lib/collab/live";
import { ME } from "@/lib/collab/me";
import { toast } from "@/components/kin/Toast";
import { Banner, Ico, Pop, ToolFrame, VersionList, bannerFor, lastSaved, lostDetail, lostTitle, toolFace, useToolState, viewingTitle, type ToolState, type WorkspaceState, type Ws } from "./ToolFrame";
import "../styles/art-workspace-panels.css";
// For the reply field (tr-thread__field), which the canvas thread borrows from the document.
import "../styles/research-workspace.css";
import Img from "@/components/kin/Img";

/*
 * The Digital Art Workspace, mirrored from the product design (art-workspace-panels.css, ta-): the tool rail,
 * the artwork with collaborators' pointers and comment pins, the brush bar, zoom and size, and the layers and
 * colour panel, or the version history while you preview an older version. Read from lib/collab/canvas.
 */

const ArtBrush = createLucideIcon("ArtBrush", [
  ["path", { d: "m9.06 11.9 8.07-8.06a2.85 2.85 0 1 1 4.03 4.03l-8.06 8.08", key: "a" }],
  ["path", { d: "M7.07 14.94c-1.66 0-3 1.35-3 3.02 0 1.33-2.5 1.52-2 2.02 1.08 1.1 2.49 2.02 4 2.02 2.2 0 4-1.8 4-4.04a3.01 3.01 0 0 0-3-3.02z", key: "b" }],
]);
type Tool = { id: string; label: string; icon: LucideIcon };
const PICK: Tool[] = [{ id: "select", label: "Select", icon: SquareDashed }, { id: "move", label: "Move", icon: Move }];
const PAINT: Tool[] = [
  { id: "brush", label: "Brush", icon: ArtBrush }, { id: "eraser", label: "Eraser", icon: Eraser }, { id: "smudge", label: "Smudge", icon: Hand },
  { id: "fill", label: "Fill", icon: PaintBucket }, { id: "shapes", label: "Shapes", icon: Shapes }, { id: "text", label: "Text", icon: Type }, { id: "eyedropper", label: "Eyedropper", icon: Pipette },
];

function ToolBtn({ tool, active, disabled, onClick, popup, expanded }: { tool: Tool; active?: boolean; disabled?: boolean; onClick?: () => void; popup?: boolean; expanded?: boolean }) {
  return (
    <button type="button" className="ta-tool" data-active={active || undefined} aria-label={tool.label} aria-pressed={active ? true : undefined} aria-haspopup={popup ? "dialog" : undefined} aria-expanded={popup ? !!expanded : undefined} disabled={disabled} onClick={onClick}>
      <Ico icon={tool.icon} size={22} />
    </button>
  );
}

/** View only (locked) disables every tool but Move. */
function Rail({ canvas, live, locked, brushOpen, colourOpen, onBrush, onColour }: { canvas: Canvas; live: boolean; locked: boolean; brushOpen: boolean; colourOpen: boolean; onBrush: () => void; onColour: () => void }) {
  return (
    <div className="ta-rail" role="toolbar" aria-label="Tools" aria-orientation="vertical">
      {PICK.map((t) => <ToolBtn key={t.id} tool={t} disabled={locked && t.id !== "move"} />)}
      <i className="ta-rail__rule" aria-hidden="true" />
      {PAINT.map((t) => (t.id === "brush" ? <ToolBtn key={t.id} tool={t} active={!locked} disabled={locked} popup={live} expanded={brushOpen} onClick={live ? onBrush : undefined} /> : <ToolBtn key={t.id} tool={t} disabled={locked} />))}
      <span className="ta-rail__spacer" aria-hidden="true" />
      {live ? <button type="button" className="ta-swatch" aria-label={`Colour, ${canvas.colour}`} aria-haspopup="dialog" aria-expanded={colourOpen} onClick={onColour} /> : <span className="ta-swatch" role="img" aria-label={`Current colour ${canvas.colour}`} />}
      <i className="ta-rail__rule" aria-hidden="true" />
      <ToolBtn tool={{ id: "undo", label: "Undo", icon: Undo2 }} disabled={locked} />
      <ToolBtn tool={{ id: "redo", label: "Redo", icon: Redo2 }} disabled={locked} />
    </div>
  );
}

function Cursor({ who, slot, faded }: Canvas["cursors"][number] & { faded?: boolean }) {
  // The styles place the two pointers by slot; the tag names our collaborator.
  return (
    <div className="ta-cursor" data-person={slot} data-faded={faded || undefined} aria-hidden="true">
      <svg className="ta-cursor__ptr" width="20" height="20" viewBox="0 0 20 20" focusable="false"><path d="M3.7 3.2 3.7 17.2 7.5 13.9 10.3 19.1 12.9 17.9 10.2 12.9 15.3 12.9Z" strokeWidth="1.4" strokeLinejoin="round" /></svg>
      <span className="ta-cursor__tag">{firstName(who)}</span>
    </div>
  );
}

function Avatar({ who }: { who: Pin["messages"][number]["who"] }) {
  const src = toolFace(who);
  return src ? <Img sizes="28px" className="ta-msg__av" src={src} /> : <span className="ta-msg__av ta-msg__av--init" aria-hidden="true">{initialsOf(who)}</span>;
}

function ThreadCard({ pin, onReply, onResolve }: { pin: Pin; onReply: (t: string) => void; onResolve: () => void }) {
  const [replying, setReplying] = useState(false);
  const [draft, setDraft] = useState("");
  return (
    <section className="ta-thread" aria-label={`Comment thread on pin ${pin.n}`}>
      <div className="ta-thread__messages">
        {pin.messages.map((m, i) => (
          <div key={i} className="ta-msg">
            <Avatar who={m.who} />
            <div className="ta-msg__body">
              <p className="ta-msg__head"><span className="ta-msg__name">{nameOf(m.who)}</span><span className="ta-msg__time">{clock24(m.at)}</span></p>
              <p className="ta-msg__text">{m.text}</p>
            </div>
          </div>
        ))}
      </div>
      {replying ? (
        <>
          {/* The design's canvas thread has no reply field; this is the document thread's. */}
          <textarea className="tr-thread__field" rows={1} value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Write a reply" aria-label="Write a reply" autoFocus />
          <div className="ta-thread__actions">
            <Button variant="ghost" size="sm" onClick={() => { setDraft(""); setReplying(false); }}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={() => { const t = draft.trim(); if (t) onReply(t); setDraft(""); setReplying(false); }}>Reply</Button>
          </div>
        </>
      ) : (
        <div className="ta-thread__actions">
          <Button variant="ghost" size="sm" onClick={() => setReplying(true)}>Reply</Button>
          <Button variant="secondary" size="sm" onClick={onResolve}>Resolve</Button>
        </div>
      )}
    </section>
  );
}

function BrushBar({ canvas }: { canvas: Canvas }) {
  // The sliders are 72px wide; the fill follows the value.
  const fill = (v: number, max: number) => `${Math.round((v / max) * 72)}px`;
  return (
    <div className="ta-brushbar" role="group" aria-label="Brush options">
      <div className="ta-brushbar__row">
        <Ico icon={ArtBrush} size={20} />
        <span className="ta-brushbar__name">{canvas.brush.name}</span>
        <i className="ta-brushbar__rule" aria-hidden="true" />
        <span className="ta-brushbar__label" data-w="size">Size</span>
        <span className="ta-slider" style={{ ["--ta-fill" as string]: fill(canvas.brush.size, 61) } as React.CSSProperties} aria-hidden="true" />
        <span className="ta-brushbar__value" data-w="size">{canvas.brush.size} px</span>
        <i className="ta-brushbar__rule" aria-hidden="true" />
        <span className="ta-brushbar__label" data-w="opacity">Opacity</span>
        <span className="ta-slider" style={{ ["--ta-fill" as string]: fill(canvas.brush.opacity, 100) } as React.CSSProperties} aria-hidden="true" />
        <span className="ta-brushbar__value" data-w="opacity">{canvas.brush.opacity}%</span>
      </div>
    </div>
  );
}

function Zoom() {
  return (
    <div className="ta-zoom" role="group" aria-label="Zoom">
      <button type="button" className="ta-compact" aria-label="Zoom out"><Ico icon={ZoomOut} size={20} /></button>
      <span className="ta-zoom__value">100%</span>
      <button type="button" className="ta-compact" aria-label="Zoom in"><Ico icon={ZoomIn} size={20} /></button>
      <i className="ta-zoom__rule" aria-hidden="true" />
      <button type="button" className="ta-compact" aria-label="Fit to screen"><Ico icon={Maximize} size={20} /></button>
    </div>
  );
}

function Colour({ canvas, faded }: { canvas: Canvas; faded?: boolean }) {
  return (
    <div className="ta-colour" data-faded={faded || undefined}>
      <div className="ta-colour__head"><h2 className="ta-colour__title">Colour</h2><span className="ta-colour__hex">{canvas.colour}</span></div>
      <div className="ta-colour__field" aria-hidden="true"><span className="ta-colour__picker" /></div>
      <div className="ta-colour__hue" aria-hidden="true"><span className="ta-colour__knob" /></div>
      <ul className="ta-colour__recent" aria-label="Recent colours">
        {canvas.recent.map((c, i) => <li key={c} className="ta-colour__swatch" data-on={i === 0 || undefined} style={{ background: c }} title={c} />)}
      </ul>
    </div>
  );
}

function LayerRow({ layer, selected, onToggle }: { layer: Layer; selected: boolean; onToggle: () => void }) {
  const src = layer.editor ? toolFace(layer.editor) : undefined;
  const inner = (
    <>
      <span className="ta-layer__thumb" data-layer={layer.id} />
      <span className="ta-layer__text"><span className="ta-layer__name">{layer.name}</span><span className="ta-layer__detail">{layerDetail(layer)}</span></span>
      {layer.editor && src ? <Img sizes="22px" className="ta-layer__editor" src={src} title={`${nameOf(layer.editor)} is editing this layer`} /> : null}
      <span className="ta-layer__eye" aria-hidden="true"><Ico icon={layer.hidden ? EyeOff : Eye} size={18} /></span>
    </>
  );
  return layer.hidden ? <div className="ta-layer" data-hidden aria-label={`${layer.name}, hidden`}>{inner}</div> : <button type="button" className="ta-layer" data-selected={selected || undefined} aria-pressed={selected} onClick={onToggle}>{inner}</button>;
}

export default function ArtWorkspace({ ws, state: frame }: { ws: Ws; state?: WorkspaceState }) {
  const { canvas, reply, resolve, restore } = useCanvas(ws.project);
  const tool = useToolState(ws, frame);
  const locked = frame === "viewOnly";
  const [history, setHistory] = useState(frame === "versionHistory");
  // the comment thread frame opens with pin 1's thread
  const [thread, setThread] = useState(frame === "commentThread" || frame === "commentReply");
  const [pin2, setPin2] = useState(false);
  const [brushOpen, setBrushOpen] = useState(false);
  const [colourOpen, setColourOpen] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(() => new Set(["colour"]));
  const [preview, setPreview] = useState<Version | null>(null);
  if (!canvas) return null;

  // the collaborator whose pointer is first on the canvas drops out in the Collaborator offline frame
  const offline = frame === "collaboratorOffline" ? canvas.cursors[0]?.who ?? canvas.presence.find((p) => p.who !== ME && p.state === "editing")?.who : undefined;
  const state: ToolState = tool.net !== "online" ? tool.net : history ? "versionHistory" : tool.saving ? "saving" : tool.failed ? "failed" : locked ? "viewOnly" : offline ? "collaboratorOffline" : "saved";
  const banner = bannerFor(state);
  const live = !history && !locked;
  const pins = canvas.pins.filter((p) => !p.resolved);
  const pin1 = pins.find((p) => p.n === 1);
  const picked = preview ?? canvas.versions[Math.min(2, canvas.versions.length - 1)];
  const toggleLayer = (id: string) => setSelected((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const openHistory = () => { setHistory((h) => !h); setThread(false); setPreview(null); };

  return (
    <ToolFrame ws={ws} kind="art" state={state} title={canvas.title} people={canvas.presence} offline={offline}
      history={history} onHistory={openHistory}
      comments={thread} onComments={() => { if (history) setHistory(false); setThread((t) => !t && !!pin1); }}
      // with a comment thread open the pill has no popover, as in the design
      save={thread ? undefined : { last: lastSaved(tool.savedAt, canvas.versions[0]?.at), onSaveNow: tool.save, onHistory: openHistory, onRetry: tool.save }} saveOpen={frame === "couldNotSave"} onSaveOpenChange={tool.onSaveOpenChange}
      overlays={<>
        {brushOpen ? (
          <Pop onClose={() => setBrushOpen(false)} label="Brush library" className="ta-pop ta-pop--brush">
            <div className="ta-brushes">
              <h2 className="ta-brushes__title">Brushes</h2>
              <ul className="ta-brushes__list">
                {canvas.brushes.map((b) => {
                  const on = b.name === canvas.brush.name;
                  return <li key={b.id} className="ta-brush" data-active={on || undefined} aria-current={on ? "true" : undefined}><span className="ta-brush__name">{b.name}</span><span className="ta-brush__stroke" data-brush={b.id} aria-hidden="true" /></li>;
                })}
              </ul>
            </div>
          </Pop>
        ) : null}
        {colourOpen ? <Pop onClose={() => setColourOpen(false)} label="Colour picker" className="ta-pop ta-pop--colour"><Colour canvas={canvas} /></Pop> : null}
      </>}>
      <div className="ta-body" data-banner={banner ? "" : undefined}>
        <Rail canvas={canvas} live={live} locked={locked} brushOpen={brushOpen} colourOpen={colourOpen} onBrush={() => setBrushOpen((o) => !o)} onColour={() => setColourOpen((o) => !o)} />
        <div className="ta-canvas">
          <div className="ta-scroll">
            <div className="ta-stage">
              <div className="ta-board">
                <Img sizes="(max-width: 1023px) 100vw, 880px" className="ta-board__art" src={photoSrc(canvas.art)} width={880} height={660} />
                {canvas.cursors.map((c) => <Cursor key={c.who} {...c} faded={c.who === offline} />)}
                {pins.map((p) => (p.n === 1
                  ? <button key={p.id} type="button" className="ta-pin" data-n={1} data-selected={(thread && !history) || undefined} aria-label={thread ? "Close comment 1" : "Open comment 1"} aria-expanded={history ? undefined : thread} onClick={history ? undefined : () => setThread((t) => !t)}>1</button>
                  : <button key={p.id} type="button" className="ta-pin" data-n={p.n} data-selected={pin2 || undefined} aria-label={`Comment ${p.n}`} aria-pressed={pin2} onClick={() => setPin2((o) => !o)}>{p.n}</button>))}
                {thread && pin1 && !history ? <ThreadCard pin={pin1} onReply={(t) => { reply(pin1.id, t); tool.save(); }} onResolve={() => { resolve(pin1.id, true); setThread(false); tool.save(); toast.show({ message: "Comment resolved.", actionLabel: "Undo", onAction: () => resolve(pin1.id, false) }); }} /> : null}
              </div>
            </div>
          </div>
          {live ? <BrushBar canvas={canvas} /> : null}
          <Zoom />
          <div className="ta-size">{canvas.size.width} x {canvas.size.height} px, {canvas.size.dpi} dpi</div>
          {banner && picked ? (
            <Banner kind={banner} className="ta-banner" title={banner === "version" ? viewingTitle(picked) : banner === "collaborator" && offline ? lostTitle(offline) : undefined} detail={banner === "collaborator" && offline ? lostDetail(offline) : undefined} onRetry={tool.retry}
              onRequest={() => toast.show({ message: "Edit access requested." })}
              onBack={() => setHistory(false)}
              onRestore={() => { restore(picked); setHistory(false); tool.save(); toast.show({ message: "Version restored." }); }} />
          ) : null}
        </div>
        <aside className="ta-panel" aria-label={history ? "Version history" : "Layers"}>
          {history ? <VersionList versions={canvas.versions} selected={picked?.id} onSelect={setPreview} /> : (
            <div className="ta-layers">
              <header className="ta-layers__head">
                <h2 className="ta-layers__title">Layers</h2>
                <button type="button" className="ta-compact" aria-label="Add layer" disabled={locked}><Ico icon={Plus} size={20} /></button>
              </header>
              {canvas.layers.map((l) => <LayerRow key={l.id} layer={l} selected={selected.has(l.id)} onToggle={() => toggleLayer(l.id)} />)}
              <Colour canvas={canvas} faded={locked} />
            </div>
          )}
        </aside>
      </div>
    </ToolFrame>
  );
}
