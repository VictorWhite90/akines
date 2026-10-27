"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Sheet from "@/components/circles/community/Sheet";
import Pic from "@/components/home/Pic";
import Avatar from "@/components/ui/Avatar";
import Icon from "@/components/ui/Icon";
import { KITS, KIT_ORDER, STATUS_LABEL, kitOf } from "@/lib/collab/kits";
import { cleanUrl, linkKind, linkLook } from "@/lib/collab/proof";
import type { Deliverable, DeliverableStatus, Project, ProofItem, WorkKind } from "@/lib/collab/types";
import { ME, useCollab } from "@/lib/collab/useCollab";
import { PEOPLE, type PersonId } from "@/lib/data/people";
import { storePhoto } from "@/lib/portfolio";
import { Drop, FileRow, toProof } from "./FileParts";
import { ago, firstName, naira } from "./parts";

const nameOf = (id: PersonId) => (id === ME ? "You" : firstName(id));
const ONLINE = new Set(["open", "studio", "room"]);
export const isOnline = (id: PersonId) => id === ME || ONLINE.has(PEOPLE[id].presence);

/** Deliverables waiting for the member's review, newest first. */
export const toReview = (p: Project) => (p.deliverables ?? []).filter((d) => d.approver === ME && d.status === "review").sort((a, b) => sentAt(b) - sentAt(a));
const sentAt = (d: Deliverable) => [...d.thread].reverse().find((t) => t.kind === "submitted")?.at ?? 0;

/** A face with a presence dot. */
export function Face({ id, size = 32 }: { id: PersonId; size?: number }) {
  return <span className="ws-face" style={{ ["--s" as string]: `${size}px` } as React.CSSProperties}><Avatar person={PEOPLE[id]} size={size} />{isOnline(id) && <i aria-label="Online" />}</span>;
}

const COLS: { id: string; label: string; match: DeliverableStatus[]; tone: string }[] = [
  { id: "todo", label: "To do", match: ["todo"], tone: "grey" },
  { id: "doing", label: "In progress", match: ["doing", "changes"], tone: "blue" },
  { id: "review", label: "In review", match: ["review"], tone: "amber" },
  { id: "approved", label: "Done", match: ["approved"], tone: "green" },
];

/* ═══════════════════════ Board ═══════════════════════ */

/**
 * The board (S6): what each person promised, as cards that move from To do to Done. Drag a card to start it,
 * send it for review, or (as the approver) approve it. Open a card for its proof and conversation.
 */
export default function Board({ p, openId, onOpen, idea }: { p: Project; openId: string | null; onOpen: (id: string | null) => void; idea?: React.ReactNode }) {
  const co = useCollab();
  const kit = kitOf(p.kind);
  const list = p.deliverables ?? [];
  const [filter, setFilter] = useState<"all" | "mine" | "review">("all");
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [drag, setDrag] = useState<string | null>(null);
  const [over, setOver] = useState<string | null>(null);
  const [toast, setToast] = useState("");
  const [full, setFull] = useState(false);
  const locked = p.stage >= 2 && !p.charter.signedAt;
  const current = list.find((d) => d.id === openId);
  const say = (t: string) => { setToast(t); setTimeout(() => setToast(""), 2600); };

  if (!list.length) return <div className="ws-stack">{idea}<KitPicker p={p} /></div>;

  const shown = list.filter((d) => filter === "all" || (filter === "mine" ? d.owner === ME : d.approver === ME && d.status === "review"));
  const drop = (col: string) => {
    const d = list.find((x) => x.id === drag);
    setDrag(null); setOver(null);
    if (!d) return;
    const from = COLS.find((c) => c.match.includes(d.status))!.id;
    if (from === col) return;
    if (locked) return say("Work opens once everyone has signed the charter.");
    if (col === "doing" && d.status === "todo" && d.owner === ME) return co.project.startDeliverable(p.id, d.id);
    if (col === "todo" && d.status === "doing" && d.owner === ME) return co.project.backToTodo(p.id, d.id);
    if (col === "review" && (d.status === "doing" || d.status === "changes") && d.owner === ME) { co.project.submitDeliverable(p.id, d.id, ""); return say(`Sent to ${nameOf(d.approver)} for review.`); }
    if (col === "approved" && d.status === "review" && d.approver === ME) { co.project.approveDeliverable(p.id, d.id, ""); return say(`Approved. It's on ${firstName(d.owner)}'s profile as verified work.`); }
    if (col === "approved" && d.approver !== ME) return say(`Only ${nameOf(d.approver)} can approve this one.`);
    if (d.owner !== ME) return say(`This is ${firstName(d.owner)}'s card; only they can move it.`);
    onOpen(d.id);
  };
  const addQuick = () => {
    if (title.trim()) co.project.addDeliverable(p.id, { title: title.trim(), owner: ME, approver: p.host === ME ? p.members.find((m) => m.id !== ME)?.id ?? ME : p.host, due: "No date" });
    setTitle(""); setAdding(false);
  };
  const waiting = toReview(p).length;

  return (
    <div className="ws-stack">
      <div className="ws-toolbar">
        <div className="ws-seg" role="tablist" aria-label="Show">
          {([["all", "All", list.length], ["mine", "Mine", list.filter((d) => d.owner === ME).length], ["review", "Waiting for me", waiting]] as const).map(([k, l, n]) => <button key={k} role="tab" aria-selected={filter === k} className={filter === k ? "on" : undefined} onClick={() => setFilter(k)}>{l}<span>{n}</span></button>)}
        </div>
        <span className="ws-grow" />
        <KindSwitch p={p} />
        <button className="kh-btn amber sm" onClick={() => setFull(true)}><Icon name="upload" size={15} />New {kit.one.toLowerCase()}</button>
      </div>

      {locked && <div className="ws-note"><Icon name="private" size={16} />Work opens once everyone has signed the charter. You can plan now.</div>}

      <div className="ws-board">
        {COLS.map((c) => {
          const items = shown.filter((d) => c.match.includes(d.status));
          return (
            <section key={c.id} className={`ws-col ${c.tone}${over === c.id ? " over" : ""}`} onDragOver={(e) => { e.preventDefault(); setOver(c.id); }} onDragLeave={() => setOver(null)} onDrop={() => drop(c.id)}>
              <header><i />{c.label}<span>{items.length}</span></header>
              <div className="ws-cards">
                {items.map((d) => <Card key={d.id} p={p} d={d} onOpen={() => onOpen(d.id)} onDrag={setDrag} dragging={drag === d.id} />)}
                {!items.length && <p className="ws-empty-col">{c.id === "review" ? "Nothing waiting" : c.id === "approved" ? "Approved work lands here" : "Drop a card here"}</p>}
              </div>
              {c.id === "todo" && (adding ? (
                <form className="ws-quick" onSubmit={(e) => { e.preventDefault(); addQuick(); }}>
                  <textarea autoFocus value={title} onChange={(e) => setTitle(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); addQuick(); } if (e.key === "Escape") setAdding(false); }} placeholder={`What will you deliver? e.g. ${kit.starter[1]?.title ?? "First draft"}`} rows={2} />
                  <div><button className="kh-btn amber sm">Add card</button><button type="button" className="ws-x" onClick={() => setAdding(false)} aria-label="Cancel">×</button></div>
                </form>
              ) : <button className="ws-addcard" onClick={() => { setAdding(true); setTitle(""); }}>+ Add a card</button>)}
            </section>
          );
        })}
      </div>

      {toast && <div className="ws-toast" role="status">{toast}</div>}
      {full && <AddDeliverable p={p} onClose={() => setFull(false)} />}
      {current && <CardPanel p={p} d={current} locked={locked} onClose={() => onOpen(null)} onRemove={() => { co.project.removeDeliverable(p.id, current.id); onOpen(null); }} />}
    </div>
  );
}

const cover = (d: Deliverable) => d.proof.find((x) => x.kind === "image");

/** A proof photo: a sample photo or the member's own upload. */
function Shot({ x, sizes }: { x: ProofItem; sizes: string }) {
  if (x.photo) return <Pic name={x.photo} sizes={sizes} />;
  // eslint-disable-next-line @next/next/no-img-element -- the member's own upload (a data URL until the API stores it)
  return x.src ? <img src={x.src} alt="" /> : null;
}

function Card({ p, d, onOpen, onDrag, dragging }: { p: Project; d: Deliverable; onOpen: () => void; onDrag: (id: string | null) => void; dragging: boolean }) {
  const img = cover(d);
  const forMe = d.approver === ME && d.status === "review";
  const steps = d.steps.length;
  const done = d.steps.filter((s) => s.done).length;
  const comments = d.thread.length;
  const money = d.share && p.budget.total ? naira(Math.round((p.budget.total * d.share) / 100)) : "";
  return (
    <button type="button" draggable onDragStart={() => onDrag(d.id)} onDragEnd={() => onDrag(null)} className={`ws-card${forMe ? " ask" : ""}${dragging ? " dragging" : ""}`} onClick={onOpen}>
      {img && <span className="ws-cover"><Shot x={img} sizes="280px" /></span>}
      <span className="ws-labels">
        {forMe && <span className="ws-label blue">Waiting for you</span>}
        {d.status === "changes" && <span className="ws-label amber">Changes asked</span>}
        {d.status === "approved" && <span className="ws-label green"><Icon name="verified" size={11} />Approved</span>}
        {d.owner === ME && d.status !== "approved" && !forMe && <span className="ws-label grey">Yours</span>}
        {money && d.status !== "approved" && <span className="ws-label plain">{money}</span>}
      </span>
      <b>{d.title}</b>
      {steps > 0 && <span className="ws-steps"><i style={{ width: `${(done / steps) * 100}%` }} /></span>}
      <span className="ws-card-foot">
        <span className="ws-meta">
          <span title="Due"><Icon name="event" size={12} />{d.due}</span>
          {comments > 0 && <span title="Messages"><Icon name="message" size={12} />{comments}</span>}
          {d.proof.length > 0 && <span title="Proof"><Icon name="link" size={12} />{d.proof.length}</span>}
        </span>
        <span className="ws-who" title={`${PEOPLE[d.owner].name} delivers · ${PEOPLE[d.approver].name} approves`}><Avatar person={PEOPLE[d.owner]} size={26} /></span>
      </span>
    </button>
  );
}

function KindSwitch({ p }: { p: Project }) {
  const co = useCollab();
  return (
    <label className="co-kind">
      <Icon name={kitOf(p.kind).icon} size={15} />
      <select value={p.kind ?? "make"} onChange={(e) => co.project.setKind(p.id, e.target.value as WorkKind, false)} aria-label="Kind of work">
        {KIT_ORDER.map((k) => <option key={k} value={k}>{KITS[k].label}</option>)}
      </select>
    </label>
  );
}

function KitPicker({ p }: { p: Project }) {
  const co = useCollab();
  const [pick, setPick] = useState<WorkKind>(p.kind ?? "make");
  const kit = KITS[pick];
  return (
    <section className="ws-box">
      <div>
        <h2 className="ws-h2">What kind of work is this?</h2>
        <p className="ws-faint">It shapes the workspace, the tools you pin, how work is reviewed and your meetings. You can change it later.</p>
      </div>
      <div className="co-kits" role="radiogroup" aria-label="Kind of work">
        {KIT_ORDER.map((k) => (
          <button key={k} type="button" role="radio" aria-checked={pick === k} className={pick === k ? "on" : undefined} onClick={() => setPick(k)}>
            <span className="ic"><Icon name={KITS[k].icon} size={20} /></span><b>{KITS[k].label}</b><small>{KITS[k].blurb}</small>
          </button>
        ))}
      </div>
      <div className="co-kit-preview">
        <b>The {kit.label.toLowerCase()} workspace starts with</b>
        <ol>{kit.starter.map((s) => <li key={s.title}><span>{s.title}</span><small>{s.due} · {s.share}%</small></li>)}</ol>
        <p className="co-muted" style={{ fontSize: 13 }}>Proof looks like: {kit.proofHint.toLowerCase()}. Review: {kit.approver}.</p>
      </div>
      <div className="co-row">
        <button className="kh-btn amber" onClick={() => co.project.setKind(p.id, pick, true)}>Use this setup</button>
        <button className="kh-btn outline" onClick={() => { co.project.setKind(p.id, pick, false); co.project.addDeliverable(p.id, { title: `First ${KITS[pick].one.toLowerCase()}`, owner: ME, approver: p.host === ME ? p.members.find((m) => m.id !== ME)?.id ?? ME : p.host, due: "This week" }); }}>Start empty</button>
      </div>
    </section>
  );
}

/** Pin the team's own tools: the repo, the design file, the drive, the class page. */
export function Tools({ p }: { p: Project }) {
  const co = useCollab();
  const kit = kitOf(p.kind);
  const tools = p.tools ?? [];
  const [form, setForm] = useState<{ label: string; url: string } | null>(null);
  const clean = form ? cleanUrl(form.url) : null;
  return (
    <div className="ws-tools">
      {tools.map((t) => {
        const k = linkLook({ url: t.url, kind: t.kind });
        return (
          <span key={t.id} className="ws-tool">
            <a href={t.url} target="_blank" rel="noopener noreferrer" title={k.short}><Icon name={k.icon} size={15} /><span>{t.label}</span></a>
            <button type="button" aria-label={`Unpin ${t.label}`} onClick={() => co.project.removeTool(p.id, t.id)}>×</button>
          </span>
        );
      })}
      {form ? (
        <form className="ws-tool-form" onSubmit={(e) => { e.preventDefault(); if (clean && form.label.trim()) { co.project.addTool(p.id, { label: form.label.trim(), url: clean, kind: linkKind(clean) }); setForm(null); } }}>
          <input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="Name" aria-label="Tool name" />
          <input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="Paste the link" aria-label="Tool link" inputMode="url" autoFocus />
          <div className="co-row"><button className="kh-btn amber sm" disabled={!clean || !form.label.trim()}>Pin</button><button type="button" className="kh-btn outline sm" onClick={() => setForm(null)}>Cancel</button></div>
        </form>
      ) : (
        <button type="button" className="ws-tool add" onClick={() => setForm({ label: kit.tools.find((t) => !tools.some((x) => x.label === t.label))?.label ?? "", url: "" })}>+ Pin a tool</button>
      )}
    </div>
  );
}

function AddDeliverable({ p, onClose }: { p: Project; onClose: () => void }) {
  const co = useCollab();
  const kit = kitOf(p.kind);
  const others = p.members.filter((m) => m.id !== ME);
  const [f, setF] = useState({ title: "", owner: ME as PersonId, approver: (p.host === ME ? others[0]?.id ?? ME : p.host) as PersonId, due: "", share: "" });
  return (
    <Sheet title={`New ${kit.one.toLowerCase()}`} sub="Something one person promises to the team, and who checks it." onClose={onClose}>
      <form className="co-dform" onSubmit={(e) => { e.preventDefault(); if (!f.title.trim()) return; co.project.addDeliverable(p.id, { title: f.title.trim(), owner: f.owner, approver: f.approver, due: f.due.trim() || "No date", share: Number(f.share) || undefined }); onClose(); }}>
        <div className="co-field"><label htmlFor="dl-t">What will be delivered?</label><input id="dl-t" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder={kit.starter[1]?.title ?? "e.g. First draft"} autoFocus /></div>
        <div className="co-two-fields">
          <div className="co-field"><label htmlFor="dl-o">Who delivers it</label><select id="dl-o" value={f.owner} onChange={(e) => setF({ ...f, owner: e.target.value as PersonId })}>{p.members.map((m) => <option key={m.id} value={m.id}>{m.id === ME ? "You" : PEOPLE[m.id].name}</option>)}</select></div>
          <div className="co-field"><label htmlFor="dl-a">Who approves it</label><select id="dl-a" value={f.approver} onChange={(e) => setF({ ...f, approver: e.target.value as PersonId })}>{p.members.map((m) => <option key={m.id} value={m.id}>{m.id === ME ? "You" : PEOPLE[m.id].name}</option>)}</select></div>
        </div>
        <div className="co-two-fields">
          <div className="co-field"><label htmlFor="dl-d">Due</label><input id="dl-d" value={f.due} onChange={(e) => setF({ ...f, due: e.target.value })} placeholder="e.g. Fri 22 Nov" /></div>
          <div className="co-field"><label htmlFor="dl-s">Share of the budget <small>optional</small></label><input id="dl-s" value={f.share} inputMode="numeric" onChange={(e) => setF({ ...f, share: e.target.value.replace(/\D/g, "").slice(0, 3) })} placeholder="%" /></div>
        </div>
        <div className="co-flow-foot"><button type="button" className="kh-btn outline" onClick={onClose}>Cancel</button><button className="kh-btn amber" disabled={!f.title.trim()}>Add</button></div>
      </form>
    </Sheet>
  );
}

/* ═══════════════════════ Card panel ═══════════════════════ */

function ProofView({ x, onRemove }: { x: ProofItem; onRemove?: () => void }) {
  if (x.kind === "file" && x.file) return <FileRow f={x.file} onRemove={onRemove} />;
  if (x.kind === "link" && x.url) {
    const k = linkLook({ url: x.url, kind: linkKind(x.url) });
    return (
      <li className="co-item ws-linkcard">
        <span className="ic"><Icon name={k.icon} size={18} /></span>
        <a className="t" href={x.url} target="_blank" rel="noopener noreferrer"><b>{x.title}</b><small>{k.short}</small></a>
        <a className="open" href={x.url} target="_blank" rel="noopener noreferrer">Open</a>
        {onRemove && <button type="button" className="x" aria-label="Remove" onClick={onRemove}><Icon name="close" size={18} /></button>}
      </li>
    );
  }
  if (x.kind === "note") {
    return (
      <li className="co-item note">
        <span className="ic"><Icon name="edit" size={17} /></span>
        <span className="t"><b>{x.title}</b><p>{x.text}</p></span>
        {onRemove && <button type="button" className="x" aria-label="Remove" onClick={onRemove}><Icon name="close" size={18} /></button>}
      </li>
    );
  }
  return null;
}

function AddProof({ p, d }: { p: Project; d: Deliverable }) {
  const co = useCollab();
  const [mode, setMode] = useState<"link" | "file" | "note" | null>(null);
  const [title, setTitle] = useState("");
  const [val, setVal] = useState("");
  const [busy, setBusy] = useState(false);
  const photo = useRef<HTMLInputElement>(null);
  const add = (item: Omit<ProofItem, "id" | "by" | "at">) => { co.project.addProof(p.id, d.id, item); setMode(null); setTitle(""); setVal(""); };
  const url = mode === "link" ? cleanUrl(val) : null;
  return (
    <div className="ws-addproof">
      <div className="ws-addproof-btns">
        <button type="button" className={mode === "link" ? "on" : undefined} onClick={() => setMode(mode === "link" ? null : "link")}><Icon name="link" size={15} />Link</button>
        <button type="button" className={mode === "file" ? "on" : undefined} onClick={() => setMode(mode === "file" ? null : "file")}><Icon name="document" size={15} />File</button>
        <button type="button" disabled={busy} onClick={() => photo.current?.click()}><Icon name="photo" size={15} />{busy ? "Adding…" : "Photo"}</button>
        <button type="button" className={mode === "note" ? "on" : undefined} onClick={() => setMode(mode === "note" ? null : "note")}><Icon name="edit" size={15} />Note</button>
        <input ref={photo} type="file" accept="image/*" hidden onChange={async (e) => { const f = e.target.files?.[0]; e.target.value = ""; if (!f) return; setBusy(true); try { add({ kind: "image", title: f.name.replace(/\.[^.]+$/, "").slice(0, 60) || "Photo", src: await storePhoto(f) }); } finally { setBusy(false); } }} />
      </div>
      {mode === "link" && (
        <form className="co-proof-form" onSubmit={(e) => { e.preventDefault(); if (url) add({ kind: "link", title: title.trim() || linkLook({ url, kind: linkKind(url) }).label, url }); }}>
          <input value={val} onChange={(e) => setVal(e.target.value)} placeholder="Paste the link: a pull request, a preview, a doc" inputMode="url" aria-label="Link" autoFocus />
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What is it? e.g. Try it on the test site" aria-label="Link name" />
          <button className="kh-btn amber sm" disabled={!url}>Add link</button>
        </form>
      )}
      {mode === "file" && <Drop accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.md,.zip,audio/*,video/mp4" label="Add a file" sub="A report, slides, a drawing, a recording. Up to 5 MB." onFiles={(fs) => { const f = fs[0]; if (f && f.size <= 5 * 1024 * 1024) add({ kind: "file", title: f.name, file: toProof(f, "sample") }); }} />}
      {mode === "note" && (
        <form className="co-proof-form" onSubmit={(e) => { e.preventDefault(); if (val.trim()) add({ kind: "note", title: title.trim() || "Note", text: val.trim() }); }}>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title, e.g. What changed" aria-label="Note title" autoFocus />
          <textarea value={val} onChange={(e) => setVal(e.target.value)} placeholder="Write it up: what you did, results, anything the reviewer should know." aria-label="Note" rows={3} />
          <button className="kh-btn amber sm" disabled={!val.trim()}>Add note</button>
        </form>
      )}
    </div>
  );
}

/** A card opened: slides in from the right, like a task in Trello or Linear. */
function CardPanel({ p, d, locked, onClose, onRemove }: { p: Project; d: Deliverable; locked: boolean; onClose: () => void; onRemove: () => void }) {
  const co = useCollab();
  const kit = kitOf(p.kind);
  const [note, setNote] = useState("");
  const [changing, setChanging] = useState(false);
  const [step, setStep] = useState("");
  const [mounted, setMounted] = useState(false);
  const owner = d.owner === ME;
  const approver = d.approver === ME;
  const value = d.share && p.budget.total ? Math.round((p.budget.total * d.share) / 100) : 0;
  const canEdit = owner && d.status !== "approved" && d.status !== "review";
  const images = d.proof.filter((x) => x.kind === "image");
  const others = d.proof.filter((x) => x.kind !== "image");

  // eslint-disable-next-line react-hooks/set-state-in-effect -- the portal target exists only after mount
  useEffect(() => setMounted(true), []);
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", k); document.body.style.overflow = prev; };
  }, [onClose]);
  if (!mounted) return null;

  return createPortal(
    <div className="ws-scrim" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <aside className="ws-panel kh co" role="dialog" aria-modal="true" aria-label={d.title}>
        <header className="ws-panel-head">
          <span className={`ws-status ${d.status}`}>{STATUS_LABEL[d.status]}</span>
          <span className="ws-crumb">{kit.one} · {p.title}</span>
          <span className="ws-grow" />
          {owner && d.status === "todo" && <button className="ws-iconbtn" aria-label="Delete card" onClick={() => { if (window.confirm(`Remove “${d.title}”?`)) onRemove(); }}><Icon name="remove" size={17} /></button>}
          <button className="ws-iconbtn" onClick={onClose} aria-label="Close"><Icon name="close" size={20} /></button>
        </header>

        <div className="ws-panel-body">
          <h2>{d.title}</h2>
          <dl className="ws-props">
            <div><dt>Delivers</dt><dd><Face id={d.owner} size={24} />{d.owner === ME ? "You" : PEOPLE[d.owner].name}</dd></div>
            <div><dt>Approves</dt><dd><Face id={d.approver} size={24} />{d.approver === ME ? "You" : PEOPLE[d.approver].name}</dd></div>
            <div><dt>Due</dt><dd><Icon name="event" size={15} />{d.due}</dd></div>
            {d.share ? <div><dt>Releases</dt><dd><Icon name="chart" size={15} />{value ? naira(value) : `${d.share}%`}</dd></div> : null}
          </dl>

          {d.status === "approved" && <div className="co-approved"><Icon name="verified" size={20} /><span><b>Approved by {nameOf(d.approver)}{d.approvedAt ? ` ${ago(d.approvedAt)}` : ""}.</b> It&apos;s in the record{value ? `, ${naira(value)} is released,` : ""} and on {d.owner === ME ? "your" : `${firstName(d.owner)}'s`} profile as verified work.</span></div>}
          {approver && d.status === "review" && <div className="ws-askbox"><Face id={d.owner} size={36} /><span><b>{PEOPLE[d.owner].name} is waiting for you</b>{kit.reviewHint}</span></div>}

          {images.length > 0 && <div className={`ws-gallery n${Math.min(images.length, 3)}`}>{images.map((x) => <figure key={x.id}><Shot x={x} sizes="260px" /><figcaption>{x.title}</figcaption></figure>)}</div>}

          <section className="ws-sec">
            <h3>Proof of the work <span>{d.proof.length}</span></h3>
            {others.length > 0 && <ul className="co-items">{others.map((x) => <ProofView key={x.id} x={x} onRemove={canEdit && x.by === ME ? () => co.project.removeProof(p.id, d.id, x.id) : undefined} />)}</ul>}
            {!d.proof.length && <p className="ws-faint">Nothing attached yet. For a {kit.one.toLowerCase()}: {kit.proofHint.toLowerCase()}.</p>}
            {canEdit && <AddProof p={p} d={d} />}
          </section>

          {(d.steps.length > 0 || canEdit) && (
            <section className="ws-sec">
              <h3>Checklist {d.steps.length > 0 && <span>{d.steps.filter((s) => s.done).length}/{d.steps.length}</span>}</h3>
              {d.steps.length > 0 && <ul className="ws-check">{d.steps.map((s) => <li key={s.id}><button className={s.done ? "on" : undefined} disabled={!owner} onClick={() => co.project.toggleStep(p.id, d.id, s.id)} aria-pressed={s.done} aria-label={s.title}>{s.done && "✓"}</button><span className={s.done ? "done" : undefined}>{s.title}</span></li>)}</ul>}
              {canEdit && <form className="ws-addstep" onSubmit={(e) => { e.preventDefault(); if (step.trim()) { co.project.addStep(p.id, d.id, step.trim()); setStep(""); } }}><input value={step} onChange={(e) => setStep(e.target.value)} placeholder="+ Add an item" aria-label="Add a checklist item" /></form>}
            </section>
          )}

          <section className="ws-sec">
            <h3>Conversation <span>{d.thread.length}</span></h3>
            <ul className="ws-chat">
              {d.thread.map((t, i) => (
                <li key={i} className={`${t.by === ME ? "me" : ""} ${t.kind}`}>
                  {t.by !== ME && <Avatar person={PEOPLE[t.by]} size={28} />}
                  <div>
                    <small>{nameOf(t.by)}{t.kind !== "comment" && <em>{t.kind === "submitted" ? " · sent for review" : t.kind === "changes" ? " · asked for changes" : " · approved"}</em>} · {ago(t.at)}</small>
                    <p>{t.text}</p>
                  </div>
                </li>
              ))}
              {!d.thread.length && <p className="ws-faint">No messages yet.</p>}
            </ul>
          </section>
        </div>

        <footer className="ws-panel-foot">
          <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} placeholder={approver && d.status === "review" ? (changing ? `What should ${firstName(d.owner)} change? Be specific.` : `Say something to ${firstName(d.owner)} (optional)`) : "Write a comment…"} aria-label="Message" />
          <div className="ws-foot-acts">
            {approver && d.status === "review" && !changing && (
              <>
                <button className="kh-btn outline" onClick={() => setChanging(true)}>Ask for changes</button>
                <button className="kh-btn amber" disabled={locked} onClick={() => { co.project.approveDeliverable(p.id, d.id, note.trim()); setNote(""); }}><Icon name="verified" size={16} />Approve</button>
              </>
            )}
            {approver && d.status === "review" && changing && (
              <>
                <button className="kh-btn outline" onClick={() => setChanging(false)}>Back</button>
                <button className="kh-btn amber" disabled={!note.trim()} onClick={() => { co.project.askChanges(p.id, d.id, note.trim()); setNote(""); setChanging(false); }}>Send back</button>
              </>
            )}
            {!(approver && d.status === "review") && <button className="kh-btn outline" disabled={!note.trim()} onClick={() => { co.project.commentDeliverable(p.id, d.id, note.trim()); setNote(""); }}>Comment</button>}
            {owner && d.status === "todo" && <button className="kh-btn amber" disabled={locked} onClick={() => co.project.startDeliverable(p.id, d.id)}>Start working on it</button>}
            {owner && (d.status === "doing" || d.status === "changes") && <button className="kh-btn amber" disabled={locked} onClick={() => { co.project.submitDeliverable(p.id, d.id, note.trim()); setNote(""); }}><Icon name="send" size={16} />Send to {nameOf(d.approver)} for review</button>}
            {owner && d.status === "review" && !approver && <span className="ws-faint">Waiting for {nameOf(d.approver)}</span>}
          </div>
        </footer>
      </aside>
    </div>,
    document.body,
  );
}

/* ═══════════════════════ Home pieces ═══════════════════════ */

/** Everyone waiting for the member's review, as a compact inbox: tap a row to open the card. */
export function ReviewInbox({ p, onOpen }: { p: Project; onOpen: (id: string) => void }) {
  const [all, setAll] = useState(false);
  const items = toReview(p);
  if (!items.length) {
    return (
      <section className="ws-inbox empty">
        <span className="ic"><Icon name="verified" size={22} /></span>
        <div><b>You&apos;re all caught up</b><small>Nobody is waiting for your review.</small></div>
      </section>
    );
  }
  const shown = all ? items : items.slice(0, 3);
  const count = (d: Deliverable, k: ProofItem["kind"]) => d.proof.filter((x) => x.kind === k).length;
  return (
    <section className="ws-inbox">
      <header>
        <span className="ws-stackfaces">{items.slice(0, 4).map((d) => <Avatar key={d.id} person={PEOPLE[d.owner]} size={26} />)}</span>
        <h3>Waiting for your review</h3>
        <span className="ws-pill">{items.length}</span>
      </header>
      <ul>
        {shown.map((d) => {
          const last = [...d.thread].reverse().find((t) => t.kind === "submitted");
          const img = cover(d);
          return (
            <li key={d.id}>
              <button type="button" onClick={() => onOpen(d.id)}>
                <Face id={d.owner} size={40} />
                <span className="t">
                  <span className="who"><b>{PEOPLE[d.owner].name}</b><time>{last ? ago(last.at) : ""}</time></span>
                  <span className="what">{d.title}</span>
                  {last?.text && <span className="quote">{last.text}</span>}
                  <span className="chips">
                    {count(d, "link") > 0 && <span><Icon name="link" size={12} />{count(d, "link")}</span>}
                    {count(d, "file") > 0 && <span><Icon name="document" size={12} />{count(d, "file")}</span>}
                    {count(d, "image") > 0 && <span><Icon name="photo" size={12} />{count(d, "image")}</span>}
                    {count(d, "note") > 0 && <span><Icon name="edit" size={12} />note</span>}
                  </span>
                </span>
                {img && <span className="thumb"><Shot x={img} sizes="80px" /></span>}
                <span className="kh-btn amber sm go">Review</span>
                <Icon name="more" size={16} className="chev" />
              </button>
            </li>
          );
        })}
      </ul>
      {items.length > 3 && <button type="button" className="ws-seeall" onClick={() => setAll(!all)}>{all ? "Show fewer" : `See all ${items.length}`}</button>}
    </section>
  );
}

/** The member's own cards that aren't done yet. */
export function YourWork({ p, onOpen }: { p: Project; onOpen: (id: string) => void }) {
  const mine = (p.deliverables ?? []).filter((d) => d.owner === ME && d.status !== "approved");
  return (
    <section className="ws-box">
      <h3 className="ws-h3">Your work <span>{mine.length}</span></h3>
      {mine.length ? (
        <ul className="ws-rows">
          {mine.map((d) => (
            <li key={d.id}>
              <button type="button" onClick={() => onOpen(d.id)}>
                <span className={`ws-dot-s ${d.status}`} aria-hidden />
                <span className="t">
                  <b>{d.title}</b>
                  <small>{STATUS_LABEL[d.status]} · due {d.due} · {d.approver === ME ? "you approve" : `${firstName(d.approver)} approves`}</small>
                </span>
                <Icon name="more" size={15} />
              </button>
            </li>
          ))}
        </ul>
      ) : <p className="ws-faint">Nothing on your plate.</p>}
    </section>
  );
}

/** Team updates: the latest check-ins as short posts, and the activity log folded away below. */
export function TeamFeed({ p }: { p: Project }) {
  const co = useCollab();
  const kit = kitOf(p.kind);
  const [f, setF] = useState({ done: "", next: "", stuck: "" });
  const [open, setOpen] = useState(false);
  const [more, setMore] = useState(false);
  const [log, setLog] = useState(false);
  const [cheers, setCheers] = useState<Record<string, boolean>>({});
  const posts = [...(p.checkins ?? [])].sort((a, b) => b.at - a.at);
  const shown = more ? posts : posts.slice(0, 3);
  const events = [...p.ledger].reverse().slice(0, 10);

  return (
    <section className="ws-box">
      <h3 className="ws-h3">Team updates</h3>
      {open ? (
        <form className="ws-compose open" onSubmit={(e) => { e.preventDefault(); if (!f.done.trim() && !f.next.trim()) return; co.project.checkin(p.id, { done: f.done.trim(), next: f.next.trim(), stuck: f.stuck.trim() || undefined }); setF({ done: "", next: "", stuck: "" }); setOpen(false); }}>
          <Face id={ME} size={36} />
          <div>
            <label><em className="done">Done</em><input value={f.done} onChange={(e) => setF({ ...f, done: e.target.value })} placeholder={kit.checkin.done} autoFocus /></label>
            <label><em className="next">Next</em><input value={f.next} onChange={(e) => setF({ ...f, next: e.target.value })} placeholder={kit.checkin.next} /></label>
            <label><em className="stuck">Stuck</em><input value={f.stuck} onChange={(e) => setF({ ...f, stuck: e.target.value })} placeholder="Anything in your way? (optional)" /></label>
            <div className="co-row" style={{ justifyContent: "flex-end" }}><button type="button" className="kh-btn outline sm" onClick={() => setOpen(false)}>Cancel</button><button className="kh-btn amber sm" disabled={!f.done.trim() && !f.next.trim()}>Post update</button></div>
          </div>
        </form>
      ) : (
        <button type="button" className="ws-compose" onClick={() => setOpen(true)}><Face id={ME} size={34} /><span className="tx">Share an update with the team…</span></button>
      )}
      <div className="ws-feed">
        {shown.map((c) => (
          <article key={c.id} className="ws-post">
            <Face id={c.who} size={36} />
            <div>
              <header><b>{c.who === ME ? "You" : PEOPLE[c.who].name}</b><small>{ago(c.at)}</small></header>
              {c.done && <p><em className="done">Done</em><span>{c.done}</span></p>}
              {c.next && <p><em className="next">Next</em><span>{c.next}</span></p>}
              {c.stuck && <p><em className="stuck">Stuck</em><span>{c.stuck}</span></p>}
              <footer><button type="button" className={cheers[c.id] ? "on" : undefined} onClick={() => setCheers((x) => ({ ...x, [c.id]: !x[c.id] }))} aria-label={cheers[c.id] ? "Remove cheer" : "Cheer"}>👏{cheers[c.id] ? " 1" : ""}</button></footer>
            </div>
          </article>
        ))}
        {!posts.length && <p className="ws-faint">No updates yet. One line on what you did and what&apos;s next is plenty.</p>}
      </div>
      {posts.length > 3 && <button type="button" className="ws-seeall" onClick={() => setMore(!more)}>{more ? "Show fewer" : `See all ${posts.length} updates`}</button>}
      <button type="button" className="ws-logtoggle" aria-expanded={log} onClick={() => setLog(!log)}><Icon name="time" size={14} />Activity<span>{p.ledger.length}</span><Icon name="expand" size={14} className={log ? "up" : undefined} /></button>
      {log && (
        <ul className="ws-log">
          {events.map((l, i) => (
            <li key={i}>
              {l.who === "akines" ? <span className="co-ak"><Icon name="verified" size={12} /></span> : <Avatar person={PEOPLE[l.who]} size={20} />}
              <span><span className="tx">{l.who === "akines" ? l.what : <><b>{l.who === ME ? "You" : firstName(l.who)} </b>{l.what.charAt(0).toLowerCase() + l.what.slice(1)}</>}</span><time>{ago(l.at)}</time></span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/* ═══════════════════════ Value and record ═══════════════════════ */

/** Share value: what's been released by approvals so far. */
export function Released({ p }: { p: Project }) {
  const list = (p.deliverables ?? []).filter((d) => d.share);
  if (!list.length || !p.budget.total) return null;
  const approved = list.filter((d) => d.status === "approved");
  const pct = approved.reduce((n, d) => n + (d.share ?? 0), 0);
  const byOwner = p.members.map((m) => ({ m, amount: approved.filter((d) => d.owner === m.id).reduce((n, d) => n + Math.round((p.budget.total * (d.share ?? 0)) / 100), 0) })).filter((x) => x.amount > 0);
  return (
    <section className="co-block">
      <h2>Released by approvals</h2>
      <div className="co-card co-pad" style={{ display: "grid", gap: 12 }}>
        <div className="co-row" style={{ justifyContent: "space-between" }}><b style={{ fontSize: 20 }}>{naira(Math.round((p.budget.total * pct) / 100))}</b><span className="co-muted" style={{ fontSize: 13 }}>{pct}% of {naira(p.budget.total)} · {approved.length} of {list.length} approved</span></div>
        <span className="co-progress"><i style={{ width: `${Math.min(100, pct)}%` }} /></span>
        {byOwner.length > 0 && <ul className="co-released">{byOwner.map(({ m, amount }) => <li key={m.id}><Avatar person={PEOPLE[m.id]} size={24} /><span>{nameOf(m.id)}</span><b>{naira(amount)}</b></li>)}</ul>}
        <p className="co-muted" style={{ fontSize: 12.5, margin: 0 }}>Each card&apos;s share is released when it&apos;s approved. In the live app the money is held by Paystack until then.</p>
      </div>
    </section>
  );
}

/** Record: who delivered what, approved by whom. */
export function Contributions({ p }: { p: Project }) {
  const list = p.deliverables ?? [];
  if (!list.length) return null;
  return (
    <section className="co-block">
      <h2>Who delivered what</h2>
      <p className="co-muted" style={{ fontSize: 14 }}>Every approved card, with who approved it and when. Each one also shows on the person&apos;s work profile as verified work.</p>
      <div className="co-contrib">
        {p.members.map((m) => {
          const mine = list.filter((d) => d.owner === m.id);
          if (!mine.length) return null;
          return (
            <div key={m.id} className="co-card co-pad">
              <div className="co-row"><Avatar person={PEOPLE[m.id]} size={32} /><span><b>{m.id === ME ? "You" : PEOPLE[m.id].name}</b><small className="co-muted" style={{ display: "block", fontSize: 12.5 }}>{m.role} · {mine.filter((d) => d.status === "approved").length} of {mine.length} approved</small></span></div>
              <ul>{mine.map((d) => <li key={d.id} className={d.status === "approved" ? "ok" : undefined}><Icon name={d.status === "approved" ? "verified" : "time"} size={14} /><span>{d.title}</span><small>{d.status === "approved" ? `Approved by ${nameOf(d.approver)}${d.approvedAt ? `, ${new Date(d.approvedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}` : ""}` : STATUS_LABEL[d.status]}</small></li>)}</ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}
