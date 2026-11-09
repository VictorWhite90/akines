"use client";

import { useState } from "react";
import { Eraser, Eye, EyeOff, Hand, Maximize, Move, PaintBucket, Pipette, Plus, Redo2, Shapes, SquareDashed, Type, Undo2, ZoomIn, ZoomOut, createLucideIcon, type LucideIcon } from "lucide-react";
import Button from "@/components/kin/Button";
import { faceSrc, photoSrc } from "@/components/kin/home/parts";
import { useCanvas, layerDetail, type Canvas, type Layer, type Pin } from "@/lib/collab/canvas";
import { clock24, firstName, initialsOf, nameOf, type Version } from "@/lib/collab/live";
import { toast } from "@/components/kin/Toast";
import { Banner, Ico, Pop, ToolFrame, VersionList, bannerFor, lastSaved, useToolState, viewingTitle, type ToolState, type Ws } from "./ToolFrame";
import "../styles/art-workspace-panels.css";
// For the reply field (tr-thread__field), which the canvas thread borrows from the document.
import "../styles/research-workspace.css";

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

function ToolBtn({ tool, active, onClick, popup, expanded }: { tool: Tool; active?: boolean; onClick?: () => void; popup?: boolean; expanded?: boolean }) {
  return (
    <button type="button" className="ta-tool" data-active={active || undefined} aria-label={tool.label} aria-pressed={active ? true : undefined} aria-haspopup={popup ? "dialog" : undefined} aria-expanded={popup ? !!expanded : undefined} onClick={onClick}>
      <Ico icon={tool.icon} size={22} />
    </button>
  );
}

function Rail({ canvas, live, brushOpen, colourOpen, onBrush, onColour }: { canvas: Canvas; live: boolean; brushOpen: boolean; colourOpen: boolean; onBrush: () => void; onColour: () => void }) {
  return (
    <div className="ta-rail" role="toolbar" aria-label="Tools" aria-orientation="vertical">
      {PICK.map((t) => <ToolBtn key={t.id} tool={t} />)}
      <i className="ta-rail__rule" aria-hidden="true" />
      {PAINT.map((t) => (t.id === "brush" ? <ToolBtn key={t.id} tool={t} active popup={live} expanded={brushOpen} onClick={live ? onBrush : undefined} /> : <ToolBtn key={t.id} tool={t} />))}
      <span className="ta-rail__spacer" aria-hidden="true" />
      {live ? <button type="button" className="ta-swatch" aria-label={`Colour, ${canvas.colour}`} aria-haspopup="dialog" aria-expanded={colourOpen} onClick={onColour} /> : <span className="ta-swatch" role="img" aria-label={`Current colour ${canvas.colour}`} />}
      <i className="ta-rail__rule" aria-hidden="true" />
      <ToolBtn tool={{ id: "undo", label: "Undo", icon: Undo2 }} />
      <ToolBtn tool={{ id: "redo", label: "Redo", icon: Redo2 }} />
    </div>
  );
}

function Cursor({ who, slot }: Canvas["cursors"][number]) {
  // The styles place the two pointers by slot; the tag names our collaborator.
  return (
    <div className="ta-cursor" data-person={slot} aria-hidden="true">
      <svg className="ta-cursor__ptr" width="20" height="20" viewBox="0 0 20 20" focusable="false"><path d="M3.7 3.2 3.7 17.2 7.5 13.9 10.3 19.1 12.9 17.9 10.2 12.9 15.3 12.9Z" strokeWidth="1.4" strokeLinejoin="round" /></svg>
      <span className="ta-cursor__tag">{firstName(who)}</span>
    </div>
  );
}

function Avatar({ who }: { who: Pin["messages"][number]["who"] }) {
  const src = faceSrc(who);
  // eslint-disable-next-line @next/next/no-img-element -- member face
  return src ? <img className="ta-msg__av" src={src} alt="" loading="lazy" decoding="async" /> : <span className="ta-msg__av ta-msg__av--init" aria-hidden="true">{initialsOf(who)}</span>;
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
  const src = layer.editor ? faceSrc(layer.editor) : undefined;
  const inner = (
    <>
      <span className="ta-layer__thumb" data-layer={layer.id} />
      <span className="ta-layer__text"><span className="ta-layer__name">{layer.name}</span><span className="ta-layer__detail">{layerDetail(layer)}</span></span>
      {/* eslint-disable-next-line @next/next/no-img-element -- member face */}
      {layer.editor && src ? <img className="ta-layer__editor" src={src} alt="" loading="lazy" decoding="async" title={`${nameOf(layer.editor)} is editing this layer`} /> : null}
      <span className="ta-layer__eye" aria-hidden="true"><Ico icon={layer.hidden ? EyeOff : Eye} size={18} /></span>
    </>
  );
  return layer.hidden ? <div className="ta-layer" data-hidden aria-label={`${layer.name}, hidden`}>{inner}</div> : <button type="button" className="ta-layer" data-selected={selected || undefined} aria-pressed={selected} onClick={onToggle}>{inner}</button>;
}

export default function ArtWorkspace({ ws, failed }: { ws: Ws; failed?: boolean }) {
  const { canvas, reply, resolve, restore } = useCanvas(ws.project);
  const tool = useToolState(failed);
  const [history, setHistory] = useState(false);
  const [thread, setThread] = useState(false);
  const [pin2, setPin2] = useState(false);
  const [brushOpen, setBrushOpen] = useState(false);
  const [colourOpen, setColourOpen] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(() => new Set(["colour"]));
  const [preview, setPreview] = useState<Version | null>(null);
  if (!canvas) return null;

  const state: ToolState = tool.net !== "online" ? tool.net : history ? "versionHistory" : tool.saving ? "saving" : tool.failed ? "failed" : "saved";
  const banner = bannerFor(state);
  const live = !history;
  const pins = canvas.pins.filter((p) => !p.resolved);
  const pin1 = pins.find((p) => p.n === 1);
  const picked = preview ?? canvas.versions[Math.min(2, canvas.versions.length - 1)];
  const toggleLayer = (id: string) => setSelected((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const openHistory = () => { setHistory((h) => !h); setThread(false); setPreview(null); };

  return (
    <ToolFrame ws={ws} kind="art" state={state} title={canvas.title} people={canvas.presence}
      history={history} onHistory={openHistory}
      comments={thread} onComments={() => { if (history) setHistory(false); setThread((t) => !t && !!pin1); }}
      // with a comment thread open the pill has no popover, as in the design
      save={thread ? undefined : { last: lastSaved(tool.savedAt, canvas.versions[0]?.at), onSaveNow: tool.save, onHistory: openHistory, onRetry: tool.save }} saveOpen={failed}
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
        <Rail canvas={canvas} live={live} brushOpen={brushOpen} colourOpen={colourOpen} onBrush={() => setBrushOpen((o) => !o)} onColour={() => setColourOpen((o) => !o)} />
        <div className="ta-canvas">
          <div className="ta-scroll">
            <div className="ta-stage">
              <div className="ta-board">
                {/* eslint-disable-next-line @next/next/no-img-element -- the artwork */}
                <img className="ta-board__art" src={photoSrc(canvas.art, 1760)} alt="" width={880} height={660} loading="lazy" decoding="async" />
                {canvas.cursors.map((c) => <Cursor key={c.who} {...c} />)}
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
            <Banner kind={banner} className="ta-banner" title={banner === "version" ? viewingTitle(picked) : undefined} onRetry={tool.retry}
              onBack={() => setHistory(false)}
              onRestore={() => { restore(picked); setHistory(false); tool.save(); toast.show({ message: "Version restored." }); }} />
          ) : null}
        </div>
        <aside className="ta-panel" aria-label={history ? "Version history" : "Layers"}>
          {history ? <VersionList versions={canvas.versions} selected={picked?.id} onSelect={setPreview} /> : (
            <div className="ta-layers">
              <header className="ta-layers__head">
                <h2 className="ta-layers__title">Layers</h2>
                <button type="button" className="ta-compact" aria-label="Add layer"><Ico icon={Plus} size={20} /></button>
              </header>
              {canvas.layers.map((l) => <LayerRow key={l.id} layer={l} selected={selected.has(l.id)} onToggle={() => toggleLayer(l.id)} />)}
              <Colour canvas={canvas} />
            </div>
          )}
        </aside>
      </div>
    </ToolFrame>
  );
}
