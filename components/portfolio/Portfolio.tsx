"use client";

import { useRef, useState } from "react";
import Sheet from "@/components/circles/community/Sheet";
import Pic from "@/components/home/Pic";
import Icon from "@/components/ui/Icon";
import { cleanUrl } from "@/lib/collab/proof";
import { KIND_SUGGESTIONS, photoToDataUrl, usePortfolio, type Piece } from "@/lib/portfolio";

/** Fills its (relatively positioned) parent: the member's photo, a sample photo, or a calm tile with the kind. */
export function PieceImage({ piece, sizes = "240px" }: { piece: Pick<Piece, "image" | "photo" | "kind" | "title">; sizes?: string }) {
  // eslint-disable-next-line @next/next/no-img-element -- the member's own upload (a data URL until the API stores it)
  if (piece.image) return <img src={piece.image} alt={piece.title} className="wk-img" />;
  if (piece.photo) return <Pic name={piece.photo} sizes={sizes} />;
  return <span className="wk-none" aria-hidden><Icon name="document" size={26} /><small>{piece.kind || "Work"}</small></span>;
}

export const pieceMeta = (p: Pick<Piece, "kind" | "detail" | "year">) => [p.kind, p.detail, p.year].filter(Boolean).join(" · ");

export function PieceCard({ piece, onOpen }: { piece: Piece; onOpen: () => void }) {
  return (
    <button type="button" className="wk-card" onClick={onOpen} aria-label={`${piece.title}, open`}>
      <span className="wk-ph"><PieceImage piece={piece} />{piece.link && <span className="wk-badge" aria-label="Has a link"><Icon name="link" size={13} /></span>}</span>
      <b>{piece.title}</b>
      <small>{pieceMeta(piece)}</small>
    </button>
  );
}

type Draft = Omit<Piece, "id" | "createdAt">;
const blank = (): Draft => ({ title: "", kind: "", year: String(new Date().getFullYear()), detail: "", link: "", story: "", image: undefined });

/**
 * Add or edit a piece in two short steps: the work itself (photo, title, kind), then the details (year,
 * a link, the story). A photo is optional, because not every kind of work is a picture.
 */
export function PieceForm({ piece, onClose, onSaved }: { piece?: Piece; onClose: () => void; onSaved?: (p: Piece) => void }) {
  const pf = usePortfolio();
  const [step, setStep] = useState(0);
  const [f, setF] = useState<Draft>(() => (piece ? { ...piece } : blank()));
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const file = useRef<HTMLInputElement>(null);
  const set = (p: Partial<Draft>) => setF((x) => ({ ...x, ...p }));
  const link = f.link?.trim() ? cleanUrl(f.link) : "";
  const linkBad = !!f.link?.trim() && !link;

  const pick = async (fl?: File) => {
    if (!fl) return;
    if (!fl.type.startsWith("image/")) return setErr("Choose a photo (JPG, PNG or HEIC).");
    if (fl.size > 15 * 1024 * 1024) return setErr("That photo is over 15 MB.");
    setErr(""); setBusy(true);
    try {
      set({ image: await photoToDataUrl(fl), photo: undefined });
    } catch {
      setErr("We couldn't read that photo. Try another one.");
    } finally {
      setBusy(false);
    }
  };

  const save = () => {
    const clean: Draft = { ...f, title: f.title.trim(), kind: f.kind.trim(), detail: f.detail?.trim() || undefined, link: link || undefined, story: f.story?.trim() || undefined };
    if (piece) {
      pf.edit(piece.id, clean);
      onSaved?.({ ...piece, ...clean });
    } else {
      const added = pf.add(clean);
      onSaved?.(added);
    }
    onClose();
  };

  return (
    <Sheet title={piece ? "Edit this piece" : "Add a piece of work"} sub={step === 0 ? "Step 1 of 2 · The work" : "Step 2 of 2 · The details"} onClose={onClose}>
      <div className="wk-form">
        <div className="wk-steps" aria-hidden><i className="on" /><i className={step === 1 ? "on" : undefined} /></div>
        {step === 0 ? (
          <>
            <div
              className={`wk-drop${f.image || f.photo ? " has" : ""}`}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); void pick(e.dataTransfer.files[0]); }}
            >
              {f.image || f.photo ? (
                <>
                  <span className="wk-ph"><PieceImage piece={f} sizes="480px" /></span>
                  <span className="wk-drop-acts">
                    <button type="button" className="kh-btn outline sm" onClick={() => file.current?.click()}>Change photo</button>
                    <button type="button" className="kh-btn outline sm" onClick={() => set({ image: undefined, photo: undefined })}>Remove</button>
                  </span>
                </>
              ) : (
                <button type="button" className="wk-drop-empty" onClick={() => file.current?.click()} disabled={busy}>
                  <span className="ic"><Icon name="photo" size={24} /></span>
                  <b>{busy ? "Preparing your photo…" : "Add a photo"}</b>
                  <small>Optional. A screenshot, a photo of the finished thing, or you at work. Tap or drop it here.</small>
                </button>
              )}
              <input ref={file} type="file" accept="image/*" hidden onChange={(e) => { void pick(e.target.files?.[0]); e.target.value = ""; }} />
            </div>
            {err && <p className="wk-err" role="alert">{err}</p>}
            <label className="wk-field">
              <span>What is it called?</span>
              <input value={f.title} maxLength={70} onChange={(e) => set({ title: e.target.value })} placeholder="e.g. Booking app for a Garki clinic" autoFocus />
            </label>
            <div className="wk-field">
              <label htmlFor="wk-kind">What kind of work?</label>
              <input id="wk-kind" value={f.kind} maxLength={40} onChange={(e) => set({ kind: e.target.value })} placeholder="e.g. Web app, Mural, Catering" list="wk-kinds" />
              <div className="wk-chips">
                {KIND_SUGGESTIONS.slice(0, 8).map((k) => <button key={k} type="button" className={f.kind === k ? "on" : undefined} onClick={() => set({ kind: k })}>{k}</button>)}
              </div>
              <datalist id="wk-kinds">{KIND_SUGGESTIONS.map((k) => <option key={k} value={k} />)}</datalist>
            </div>
          </>
        ) : (
          <>
            <div className="wk-two">
              <label className="wk-field"><span>Year</span><input value={f.year} inputMode="numeric" maxLength={4} onChange={(e) => set({ year: e.target.value.replace(/\D/g, "") })} /></label>
              <label className="wk-field"><span>A short detail <small>optional</small></span><input value={f.detail ?? ""} maxLength={30} onChange={(e) => set({ detail: e.target.value })} placeholder="e.g. 12 screens, 150 guests" /></label>
            </div>
            <label className="wk-field">
              <span>Where can people see it? <small>optional</small></span>
              <input value={f.link ?? ""} inputMode="url" autoCapitalize="off" spellCheck={false} onChange={(e) => set({ link: e.target.value })} placeholder="A live site, a repo, a video, a post" />
              {linkBad && <em className="wk-err">That doesn&apos;t look like a link yet.</em>}
            </label>
            <label className="wk-field">
              <span>The story behind it <small>optional, but it&apos;s what people remember</small></span>
              <textarea rows={4} maxLength={500} value={f.story ?? ""} onChange={(e) => set({ story: e.target.value })} placeholder="Who was it for? What did you do, and what changed because of it?" />
            </label>
          </>
        )}
        <div className="wk-foot">
          {step === 0 ? <button type="button" className="kh-btn outline" onClick={onClose}>Cancel</button> : <button type="button" className="kh-btn outline" onClick={() => setStep(0)}>Back</button>}
          {step === 0
            ? <button type="button" className="kh-btn amber" disabled={!f.title.trim() || !f.kind.trim() || busy} onClick={() => setStep(1)}>Continue</button>
            : <button type="button" className="kh-btn amber" disabled={linkBad || f.year.length !== 4} onClick={save}>{piece ? "Save changes" : "Add to my work"}</button>}
        </div>
      </div>
    </Sheet>
  );
}

export function PieceDetail({ piece, onClose, onEdit, onRemove }: { piece: Piece; onClose: () => void; onEdit?: () => void; onRemove?: () => void }) {
  return (
    <Sheet title={piece.title} sub={pieceMeta(piece)} onClose={onClose} wide>
      <div className="wk-detail">
        <span className="wk-ph big"><PieceImage piece={piece} sizes="640px" /></span>
        {piece.link && <a className="wk-link" href={piece.link} target="_blank" rel="noopener noreferrer nofollow"><Icon name="link" size={16} />{piece.link.replace(/^https?:\/\//, "")}</a>}
        <p className="wk-story">{piece.story || <span className="co-muted">No story written yet.</span>}</p>
        {(onEdit || onRemove) && (
          <div className="wk-foot">
            {onRemove && <button type="button" className="kh-btn outline" onClick={() => { if (window.confirm(`Remove “${piece.title}” from your work? It also leaves My Studio.`)) onRemove(); }}><Icon name="remove" size={16} />Remove</button>}
            {onEdit && <button type="button" className="kh-btn amber" onClick={onEdit}><Icon name="edit" size={16} />Edit</button>}
          </div>
        )}
      </div>
    </Sheet>
  );
}

/** The Work tab on your profile: everything you've made, in one place. */
export function WorkTab() {
  const pf = usePortfolio();
  const [adding, setAdding] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Piece | null>(null);
  const open = openId ? pf.get(openId) : undefined;
  if (!pf.ready) return <div className="wk-grid" aria-busy="true" />;

  return (
    <>
      {pf.pieces.length === 0 ? (
        <div className="mp-empty">
          <h2>Show what you&apos;ve made</h2>
          <p>An app, a mural, a menu, an event you ran. Your work shows here, on your studio wall, and goes with you when you apply to open calls.</p>
          <button className="kh-btn primary" onClick={() => setAdding(true)}>Add your first piece</button>
        </div>
      ) : (
        <>
          <div className="wk-head">
            <p>{pf.pieces.length} {pf.pieces.length === 1 ? "piece" : "pieces"} · also on your studio wall and in your applications</p>
            <button className="kh-btn amber sm" onClick={() => setAdding(true)}><Icon name="upload" size={15} />Add work</button>
          </div>
          <div className="wk-grid">
            <button type="button" className="wk-add" onClick={() => setAdding(true)}><span className="ic"><Icon name="upload" size={22} /></span><b>Add a piece</b><small>A photo, a title and the story</small></button>
            {pf.pieces.map((p) => <PieceCard key={p.id} piece={p} onOpen={() => setOpenId(p.id)} />)}
          </div>
        </>
      )}
      {adding && <PieceForm onClose={() => setAdding(false)} />}
      {open && !editing && <PieceDetail piece={open} onClose={() => setOpenId(null)} onEdit={() => setEditing(open)} onRemove={() => { pf.remove(open.id); setOpenId(null); }} />}
      {editing && <PieceForm piece={editing} onClose={() => setEditing(null)} />}
    </>
  );
}
