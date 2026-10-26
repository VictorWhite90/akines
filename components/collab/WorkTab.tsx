"use client";

import { useRef, useState } from "react";
import Sheet from "@/components/circles/community/Sheet";
import Pic from "@/components/home/Pic";
import Avatar from "@/components/ui/Avatar";
import Icon from "@/components/ui/Icon";
import { KITS, KIT_ORDER, STATUS_LABEL, kitOf } from "@/lib/collab/kits";
import { cleanUrl, linkKind, linkLook } from "@/lib/collab/proof";
import type { Deliverable, Project, ProofItem, WorkKind } from "@/lib/collab/types";
import { ME, useCollab } from "@/lib/collab/useCollab";
import { PEOPLE, type PersonId } from "@/lib/data/people";
import { photoToDataUrl } from "@/lib/portfolio";
import { Drop, FileRow } from "./FileParts";
import { ago, firstName, naira } from "./parts";

const nameOf = (id: PersonId) => (id === ME ? "You" : firstName(id));
const COLS: { id: string; label: string; match: Deliverable["status"][] }[] = [
  { id: "todo", label: "To do", match: ["todo"] },
  { id: "doing", label: "In progress", match: ["doing", "changes"] },
  { id: "review", label: "Ready for review", match: ["review"] },
  { id: "approved", label: "Approved", match: ["approved"] },
];

/** Deliverables waiting for the member's review, across a project. */
export const toReview = (p: Project) => (p.deliverables ?? []).filter((d) => d.approver === ME && d.status === "review");

/**
 * The Work tab (S6): what each person promised, with proof and approval. People do the work in their own
 * tools (pinned at the top); here it's agreed, shown, reviewed and approved. Approval writes to the record,
 * releases the deliverable's share and shows on the owner's work profile as verified work.
 */
export default function WorkTab({ p, openId, idea }: { p: Project; openId?: string | null; idea?: React.ReactNode }) {
  const co = useCollab();
  const kit = kitOf(p.kind);
  const list = p.deliverables ?? [];
  const [open, setOpen] = useState<string | null>(openId ?? null);
  const [adding, setAdding] = useState(false);
  const locked = p.stage >= 2 && !p.charter.signedAt;
  const current = list.find((d) => d.id === open);

  if (!list.length) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        {idea}
        <KitPicker p={p} />
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div className="co-sec-head">
        <div>
          <h2>{kit.many}</h2>
          <p>What each person promised, the proof, and who approves it. {kit.value}.</p>
        </div>
        <div className="co-row">
          <KindSwitch p={p} />
          <button className="kh-btn amber" onClick={() => setAdding(true)}><Icon name="upload" size={16} />Add a {kit.one.toLowerCase()}</button>
        </div>
      </div>

      <Tools p={p} />

      {locked && <div className="co-lock"><Icon name="private" size={20} /><span><b>Work opens once everyone has signed the charter.</b> You can plan now; sending for review and approving start after signing.</span></div>}

      <div className="co-wboard">
        {COLS.map((c) => {
          const items = list.filter((d) => c.match.includes(d.status));
          return (
            <section key={c.id} className={`co-col ${c.id}`}>
              <div className="co-col-head">{c.label}<span>{items.length}</span></div>
              {items.map((d) => <DCard key={d.id} d={d} onOpen={() => setOpen(d.id)} />)}
              {!items.length && <p className="co-col-empty">{c.id === "review" ? "Nothing waiting" : c.id === "approved" ? "Approved work lands here" : "—"}</p>}
            </section>
          );
        })}
      </div>

      {adding && <AddDeliverable p={p} onClose={() => setAdding(false)} />}
      {current && <DeliverableSheet p={p} d={current} locked={locked} onClose={() => setOpen(null)} onRemove={() => { co.project.removeDeliverable(p.id, current.id); setOpen(null); }} />}
    </div>
  );
}

function DCard({ d, onOpen }: { d: Deliverable; onOpen: () => void }) {
  const mineToReview = d.approver === ME && d.status === "review";
  const counts = { link: d.proof.filter((x) => x.kind === "link").length, file: d.proof.filter((x) => x.kind === "file").length, image: d.proof.filter((x) => x.kind === "image").length };
  const steps = d.steps.length ? `${d.steps.filter((s) => s.done).length}/${d.steps.length}` : "";
  return (
    <button type="button" className={`co-dcard${mineToReview ? " ask" : ""}`} onClick={onOpen}>
      {mineToReview && <span className="co-chip blue" style={{ height: 22, fontSize: 11 }}>Needs your review</span>}
      {d.status === "changes" && <span className="co-chip warn" style={{ height: 22, fontSize: 11 }}>Changes asked</span>}
      <b>{d.title}</b>
      <span className="who"><Avatar person={PEOPLE[d.owner]} size={22} />{nameOf(d.owner)}<em>→</em>{d.approver === ME ? "you approve" : `${nameOf(d.approver)} approves`}</span>
      <span className="meta">
        <span><Icon name="event" size={12} />{d.due}</span>
        {steps && <span><Icon name="poll" size={12} />{steps}</span>}
        {counts.link > 0 && <span><Icon name="link" size={12} />{counts.link}</span>}
        {counts.file > 0 && <span><Icon name="document" size={12} />{counts.file}</span>}
        {counts.image > 0 && <span><Icon name="photo" size={12} />{counts.image}</span>}
        {d.share ? <span className="share">{d.share}%</span> : null}
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
    <section className="co-panel" style={{ gap: 16 }}>
      <div>
        <h2>What kind of work is this?</h2>
        <p className="hint" style={{ marginTop: 6 }}>It shapes the plan, the tools you pin, how work is reviewed and what your meetings look like. You can change it later.</p>
      </div>
      <div className="co-kits" role="radiogroup" aria-label="Kind of work">
        {KIT_ORDER.map((k) => (
          <button key={k} type="button" role="radio" aria-checked={pick === k} className={pick === k ? "on" : undefined} onClick={() => setPick(k)}>
            <span className="ic"><Icon name={KITS[k].icon} size={20} /></span><b>{KITS[k].label}</b><small>{KITS[k].blurb}</small>
          </button>
        ))}
      </div>
      <div className="co-kit-preview">
        <b>The {kit.label.toLowerCase()} plan</b>
        <ol>{kit.starter.map((s) => <li key={s.title}><span>{s.title}</span><small>{s.due} · {s.share}%</small></li>)}</ol>
        <p className="co-muted" style={{ fontSize: 13 }}>Proof looks like: {kit.proofHint.toLowerCase()}. Review: {kit.approver}.</p>
      </div>
      <div className="co-row">
        <button className="kh-btn amber" onClick={() => co.project.setKind(p.id, pick, true)}>Use this plan</button>
        <button className="kh-btn outline" onClick={() => { co.project.setKind(p.id, pick, false); co.project.addDeliverable(p.id, { title: `First ${KITS[pick].one.toLowerCase()}`, owner: ME, approver: p.host === ME ? p.members.find((m) => m.id !== ME)?.id ?? ME : p.host, due: "This week" }); }}>Start from scratch</button>
      </div>
    </section>
  );
}

/** The team's own tools, pinned: the repo, the design file, the drive, the class page. */
function Tools({ p }: { p: Project }) {
  const co = useCollab();
  const kit = kitOf(p.kind);
  const tools = p.tools ?? [];
  const [form, setForm] = useState<{ label: string; url: string } | null>(null);
  const clean = form ? cleanUrl(form.url) : null;
  return (
    <section className="co-tools" aria-label="Tools">
      <span className="lbl">Where the work lives</span>
      {tools.map((t) => {
        const k = linkLook({ url: t.url, kind: t.kind });
        return (
          <span key={t.id} className="co-tool">
            <a href={t.url} target="_blank" rel="noopener noreferrer"><Icon name={k.icon} size={15} /><b>{t.label}</b><small>{k.short}</small></a>
            <button type="button" aria-label={`Unpin ${t.label}`} onClick={() => co.project.removeTool(p.id, t.id)}>×</button>
          </span>
        );
      })}
      {form ? (
        <form className="co-tool-form" onSubmit={(e) => { e.preventDefault(); if (clean && form.label.trim()) { co.project.addTool(p.id, { label: form.label.trim(), url: clean, kind: linkKind(clean) }); setForm(null); } }}>
          <input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="Name, e.g. Code repository" aria-label="Tool name" autoFocus />
          <input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="Paste the link" aria-label="Tool link" inputMode="url" />
          <button className="kh-btn amber sm" disabled={!clean || !form.label.trim()}>Pin</button>
          <button type="button" className="kh-btn outline sm" onClick={() => setForm(null)}>Cancel</button>
        </form>
      ) : (
        <>
          {kit.tools.filter((t) => !tools.some((x) => x.label === t.label)).slice(0, 3).map((t) => <button key={t.label} type="button" className="co-tool add" onClick={() => setForm({ label: t.label, url: "" })}>+ {t.label}</button>)}
          <button type="button" className="co-tool add" onClick={() => setForm({ label: "", url: "" })}>+ Pin a tool</button>
        </>
      )}
    </section>
  );
}

function AddDeliverable({ p, onClose }: { p: Project; onClose: () => void }) {
  const co = useCollab();
  const kit = kitOf(p.kind);
  const others = p.members.filter((m) => m.id !== ME);
  const [f, setF] = useState({ title: "", owner: ME as PersonId, approver: (p.host === ME ? others[0]?.id ?? ME : p.host) as PersonId, due: "", share: "" });
  return (
    <Sheet title={`Add a ${kit.one.toLowerCase()}`} sub="Something one person promises to the team, and who approves it." onClose={onClose}>
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
        {f.owner === f.approver && <p className="co-muted" style={{ fontSize: 12.5 }}>Usually someone else approves, so the work is checked by a second pair of eyes.</p>}
        <div className="co-flow-foot"><button type="button" className="kh-btn outline" onClick={onClose}>Cancel</button><button className="kh-btn amber" disabled={!f.title.trim()}>Add</button></div>
      </form>
    </Sheet>
  );
}

function ProofView({ x, onRemove }: { x: ProofItem; onRemove?: () => void }) {
  if (x.kind === "file" && x.file) return <FileRow f={x.file} onRemove={onRemove} />;
  if (x.kind === "link" && x.url) {
    const k = linkLook({ url: x.url, kind: linkKind(x.url) });
    return (
      <li className="co-item">
        <span className="ic"><Icon name={k.icon} size={18} /></span>
        <span className="t"><b>{x.title}</b><a href={x.url} target="_blank" rel="noopener noreferrer">{k.short}</a></span>
        {onRemove && <button type="button" className="x" aria-label="Remove" onClick={onRemove}><Icon name="close" size={18} /></button>}
      </li>
    );
  }
  if (x.kind === "image") {
    return (
      <li className="co-item img">
        {/* eslint-disable-next-line @next/next/no-img-element -- the member's own upload */}
        <span className="ph">{x.photo ? <Pic name={x.photo} sizes="120px" /> : x.src ? <img src={x.src} alt="" /> : null}</span>
        <span className="t"><b>{x.title}</b><small>Photo · {nameOf(x.by)}</small></span>
        {onRemove && <button type="button" className="x" aria-label="Remove" onClick={onRemove}><Icon name="close" size={18} /></button>}
      </li>
    );
  }
  return (
    <li className="co-item note">
      <span className="ic"><Icon name="edit" size={17} /></span>
      <span className="t"><b>{x.title}</b><p>{x.text}</p></span>
      {onRemove && <button type="button" className="x" aria-label="Remove" onClick={onRemove}><Icon name="close" size={18} /></button>}
    </li>
  );
}

function AddProof({ p, d }: { p: Project; d: Deliverable }) {
  const co = useCollab();
  const [mode, setMode] = useState<"link" | "file" | "image" | "note" | null>(null);
  const [title, setTitle] = useState("");
  const [val, setVal] = useState("");
  const [busy, setBusy] = useState(false);
  const photo = useRef<HTMLInputElement>(null);
  const kit = kitOf(p.kind);
  const add = (item: Omit<ProofItem, "id" | "by" | "at">) => { co.project.addProof(p.id, d.id, item); setMode(null); setTitle(""); setVal(""); };
  const url = mode === "link" ? cleanUrl(val) : null;
  return (
    <div className="co-addproof">
      <div className="co-row">
        <span className="co-muted" style={{ fontSize: 13 }}>Add proof:</span>
        <button type="button" className={`co-chip co-quick${mode === "link" ? " on" : ""}`} onClick={() => setMode("link")}><Icon name="link" size={13} />Link</button>
        <button type="button" className={`co-chip co-quick${mode === "file" ? " on" : ""}`} onClick={() => setMode("file")}><Icon name="document" size={13} />File</button>
        <button type="button" className="co-chip co-quick" disabled={busy} onClick={() => photo.current?.click()}><Icon name="photo" size={13} />{busy ? "Adding…" : "Photo"}</button>
        <button type="button" className={`co-chip co-quick${mode === "note" ? " on" : ""}`} onClick={() => setMode("note")}><Icon name="edit" size={13} />Note</button>
        <input ref={photo} type="file" accept="image/*" hidden onChange={async (e) => { const f = e.target.files?.[0]; e.target.value = ""; if (!f) return; setBusy(true); try { add({ kind: "image", title: f.name.replace(/\.[^.]+$/, "").slice(0, 60) || "Photo", src: await photoToDataUrl(f) }); } finally { setBusy(false); } }} />
      </div>
      {!mode && <p className="co-muted" style={{ fontSize: 12.5, margin: 0 }}>For a {kit.one.toLowerCase()}: {kit.proofHint.toLowerCase()}.</p>}
      {mode === "link" && (
        <form className="co-proof-form" onSubmit={(e) => { e.preventDefault(); if (url) add({ kind: "link", title: title.trim() || linkLook({ url, kind: linkKind(url) }).label, url }); }}>
          <input value={val} onChange={(e) => setVal(e.target.value)} placeholder="Paste the link: a pull request, a preview, a doc" inputMode="url" aria-label="Link" autoFocus />
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What is it? e.g. Try it on the test site" aria-label="Link name" />
          <button className="kh-btn amber sm" disabled={!url}>Add link</button>
        </form>
      )}
      {mode === "file" && <Drop accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.md,.zip,audio/*,video/mp4" label="Add a file" sub="A report, slides, a drawing, a recording. Up to 5 MB." onFiles={(fs) => { const f = fs[0]; if (f && f.size <= 5 * 1024 * 1024) add({ kind: "file", title: f.name, file: { id: `f-${f.name}-${f.size}`, name: f.name, size: f.size, type: f.type || f.name.split(".").pop() || "", kind: "sample" } }); }} />}
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

function DeliverableSheet({ p, d, locked, onClose, onRemove }: { p: Project; d: Deliverable; locked: boolean; onClose: () => void; onRemove: () => void }) {
  const co = useCollab();
  const kit = kitOf(p.kind);
  const [note, setNote] = useState("");
  const [changing, setChanging] = useState(false);
  const [step, setStep] = useState("");
  const owner = d.owner === ME;
  const approver = d.approver === ME;
  const value = d.share && p.budget.total ? Math.round((p.budget.total * d.share) / 100) : 0;
  const canEdit = owner && d.status !== "approved" && d.status !== "review";

  return (
    <Sheet title={d.title} sub={`${STATUS_LABEL[d.status]} · due ${d.due}`} onClose={onClose} wide>
      <div className="co-dsheet">
        <div className="co-droles">
          <span><Avatar person={PEOPLE[d.owner]} size={30} /><span><small>Delivers</small><b>{d.owner === ME ? "You" : PEOPLE[d.owner].name}</b></span></span>
          <Icon name="more" size={16} />
          <span><Avatar person={PEOPLE[d.approver]} size={30} /><span><small>Approves</small><b>{d.approver === ME ? "You" : PEOPLE[d.approver].name}</b></span></span>
          {d.share ? <span className="val"><small>Releases</small><b>{value ? naira(value) : `${d.share}%`}</b></span> : null}
        </div>

        {d.status === "approved" && (
          <div className="co-approved"><Icon name="verified" size={20} /><span><b>Approved by {nameOf(d.approver)}{d.approvedAt ? ` ${ago(d.approvedAt)}` : ""}.</b> It&apos;s in the project record{value ? `, ${naira(value)} is released in Share value,` : ""} and on {d.owner === ME ? "your" : `${firstName(d.owner)}'s`} work profile as verified work.</span></div>
        )}
        {approver && d.status === "review" && <div className="co-update ask"><Icon name="verified" size={18} /><span><b>{nameOf(d.owner)} sent this for your review.</b> {kit.reviewHint}</span></div>}

        <section className="co-block">
          <h2 style={{ fontSize: 15 }}>Steps</h2>
          {d.steps.length > 0 && (
            <ul className="co-milestones">{d.steps.map((s) => <li key={s.id} className={s.done ? "done" : undefined}><button className="box" disabled={!owner} onClick={() => co.project.toggleStep(p.id, d.id, s.id)} aria-pressed={s.done} aria-label={s.title}>{s.done ? "✓" : ""}</button><span>{s.title}</span></li>)}</ul>
          )}
          {owner && d.status !== "approved" ? (
            <form className="co-inline-form" onSubmit={(e) => { e.preventDefault(); if (step.trim()) { co.project.addStep(p.id, d.id, step.trim()); setStep(""); } }}>
              <input value={step} onChange={(e) => setStep(e.target.value)} placeholder="Add a step" aria-label="Add a step" />
              <button className="kh-btn outline sm" disabled={!step.trim()}>Add</button>
            </form>
          ) : !d.steps.length && <p className="co-muted" style={{ fontSize: 13 }}>No steps listed.</p>}
        </section>

        <section className="co-block">
          <h2 style={{ fontSize: 15 }}>Proof of the work</h2>
          {d.proof.length ? <ul className="co-items">{d.proof.map((x) => <ProofView key={x.id} x={x} onRemove={canEdit && x.by === ME ? () => co.project.removeProof(p.id, d.id, x.id) : undefined} />)}</ul> : <p className="co-muted" style={{ fontSize: 13 }}>Nothing attached yet. {kit.proofHint}.</p>}
          {canEdit && <AddProof p={p} d={d} />}
        </section>

        <section className="co-block">
          <h2 style={{ fontSize: 15 }}>Conversation</h2>
          {d.thread.length > 0 && (
            <ul className="co-dthread">
              {d.thread.map((t, i) => (
                <li key={i} className={t.kind}>
                  <Avatar person={PEOPLE[t.by]} size={26} />
                  <div><b>{nameOf(t.by)}</b>{t.kind !== "comment" && <span className="tag">{t.kind === "submitted" ? "Sent for review" : t.kind === "changes" ? "Asked for changes" : "Approved"}</span>}<time>{ago(t.at)}</time><p>{t.text}</p></div>
                </li>
              ))}
            </ul>
          )}
          <textarea className="co-dnote" value={note} onChange={(e) => setNote(e.target.value)} rows={2} placeholder={approver && d.status === "review" ? (changing ? "What needs to change? Be specific." : "A note with your approval (optional)") : owner && (d.status === "doing" || d.status === "changes") ? "A note for the reviewer (optional)" : "Add a comment"} aria-label="Note" />
        </section>

        <div className="co-dactions">
          {owner && d.status === "todo" && <button className="kh-btn amber" disabled={locked} onClick={() => co.project.startDeliverable(p.id, d.id)}>Start</button>}
          {owner && (d.status === "doing" || d.status === "changes") && <button className="kh-btn amber" disabled={locked} onClick={() => { co.project.submitDeliverable(p.id, d.id, note.trim()); setNote(""); }}><Icon name="send" size={16} />Send to {nameOf(d.approver)} for review</button>}
          {owner && d.status === "review" && !approver && <span className="co-muted" style={{ fontSize: 13.5 }}>Waiting for {nameOf(d.approver)} to review.</span>}
          {approver && d.status === "review" && !changing && (
            <>
              <button className="kh-btn outline" onClick={() => setChanging(true)}>Ask for changes</button>
              <button className="kh-btn amber" disabled={locked} onClick={() => { co.project.approveDeliverable(p.id, d.id, note.trim()); setNote(""); }}><Icon name="verified" size={16} />Approve</button>
            </>
          )}
          {approver && d.status === "review" && changing && (
            <>
              <button className="kh-btn outline" onClick={() => setChanging(false)}>Back</button>
              <button className="kh-btn amber" disabled={!note.trim()} onClick={() => { co.project.askChanges(p.id, d.id, note.trim()); setNote(""); setChanging(false); }}>Send back with notes</button>
            </>
          )}
          {note.trim() && !(approver && d.status === "review") && !(owner && (d.status === "doing" || d.status === "changes")) && <button className="kh-btn outline" onClick={() => { co.project.commentDeliverable(p.id, d.id, note.trim()); setNote(""); }}>Comment</button>}
          {owner && d.status === "todo" && <button className="kh-btn outline" style={{ marginRight: "auto" }} onClick={() => { if (window.confirm(`Remove “${d.title}”?`)) onRemove(); }}><Icon name="remove" size={16} />Remove</button>}
        </div>
      </div>
    </Sheet>
  );
}

/** Home: what needs the member's review, across this project. */
export function ReviewQueue({ p, onOpen }: { p: Project; onOpen: (id: string) => void }) {
  const items = toReview(p);
  if (!items.length) return null;
  return (
    <section className="co-card co-pad co-queue">
      <h2 style={{ fontSize: 16 }}><Icon name="verified" size={17} />Needs your review · {items.length}</h2>
      {items.map((d) => (
        <button key={d.id} type="button" onClick={() => onOpen(d.id)}>
          <Avatar person={PEOPLE[d.owner]} size={30} />
          <span><b>{d.title}</b><small>From {nameOf(d.owner)} · {d.proof.length} {d.proof.length === 1 ? "piece" : "pieces"} of proof</small></span>
          <span className="kh-btn amber sm">Review</span>
        </button>
      ))}
    </section>
  );
}

/** Home: the member's own deliverables that aren't approved yet. */
export function MyDeliverables({ p, onOpen }: { p: Project; onOpen: (id: string) => void }) {
  const mine = (p.deliverables ?? []).filter((d) => d.owner === ME && d.status !== "approved");
  if (!mine.length) return null;
  return (
    <section className="co-card co-pad co-queue">
      <h2 style={{ fontSize: 16 }}><Icon name="project" size={17} />What you promised · {mine.length}</h2>
      {mine.map((d) => (
        <button key={d.id} type="button" onClick={() => onOpen(d.id)}>
          <span className={`co-status ${d.status}`} aria-hidden />
          <span><b>{d.title}</b><small>{STATUS_LABEL[d.status]} · due {d.due} · {d.approver === ME ? "you approve" : `${nameOf(d.approver)} approves`}</small></span>
          <Icon name="more" size={16} />
        </button>
      ))}
    </section>
  );
}

/** Home: a one-minute weekly check-in, and the team's latest. */
export function Checkins({ p }: { p: Project }) {
  const co = useCollab();
  const kit = kitOf(p.kind);
  const [f, setF] = useState({ done: "", next: "", stuck: "" });
  const [open, setOpen] = useState(false);
  const list = p.checkins ?? [];
  return (
    <section className="co-card co-pad" style={{ display: "grid", gap: 12 }}>
      <div className="co-sec-head"><h2 style={{ fontSize: 16 }}>Weekly check-ins</h2>{!open && <button className="kh-btn outline sm" onClick={() => setOpen(true)}>Post yours</button>}</div>
      {open && (
        <form className="co-checkin" onSubmit={(e) => { e.preventDefault(); if (!f.done.trim() && !f.next.trim()) return; co.project.checkin(p.id, { done: f.done.trim(), next: f.next.trim(), stuck: f.stuck.trim() || undefined }); setF({ done: "", next: "", stuck: "" }); setOpen(false); }}>
          <label><span>Done</span><input value={f.done} onChange={(e) => setF({ ...f, done: e.target.value })} placeholder={kit.checkin.done} autoFocus /></label>
          <label><span>Next</span><input value={f.next} onChange={(e) => setF({ ...f, next: e.target.value })} placeholder={kit.checkin.next} /></label>
          <label><span>Stuck</span><input value={f.stuck} onChange={(e) => setF({ ...f, stuck: e.target.value })} placeholder="Anything in your way? (optional)" /></label>
          <div className="co-row" style={{ justifyContent: "flex-end" }}><button type="button" className="kh-btn outline sm" onClick={() => setOpen(false)}>Cancel</button><button className="kh-btn amber sm" disabled={!f.done.trim() && !f.next.trim()}>Post</button></div>
        </form>
      )}
      {list.length ? (
        <ul className="co-checkins">
          {list.slice(0, 4).map((c) => (
            <li key={c.id}>
              <Avatar person={PEOPLE[c.who]} size={28} />
              <div>
                <b>{nameOf(c.who)}</b><time>{ago(c.at)}</time>
                {c.done && <p><em>Done</em>{c.done}</p>}
                {c.next && <p><em>Next</em>{c.next}</p>}
                {c.stuck && <p className="stuck"><em>Stuck</em>{c.stuck}</p>}
              </div>
            </li>
          ))}
        </ul>
      ) : !open && <p className="co-muted" style={{ fontSize: 13.5 }}>Once a week, everyone says what they did, what&apos;s next and what&apos;s in the way. One minute each.</p>}
    </section>
  );
}

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
        <p className="co-muted" style={{ fontSize: 12.5, margin: 0 }}>Each deliverable&apos;s share is released when it&apos;s approved. In the live app the money is held by Paystack until then.</p>
      </div>
    </section>
  );
}

/** Record: who delivered what, approved by whom. The contribution record a supervisor or client can rely on. */
export function Contributions({ p }: { p: Project }) {
  const list = p.deliverables ?? [];
  if (!list.length) return null;
  return (
    <section className="co-block">
      <h2>Who delivered what</h2>
      <p className="co-muted" style={{ fontSize: 14 }}>Every approved deliverable, with who approved it and when. Each one also shows on the person&apos;s work profile as verified work.</p>
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
