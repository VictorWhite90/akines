"use client";

import { useRef, useState } from "react";
import Sheet from "@/components/circles/community/Sheet";
import { Drop, FileRow, MAX_BYTES, accepts } from "@/components/collab/FileParts";
import Pic from "@/components/home/Pic";
import Icon, { type IconName } from "@/components/ui/Icon";
import { cleanUrl, linkKind, linkLook } from "@/lib/collab/proof";
import type { ProofLink } from "@/lib/collab/types";
import { KIND_SUGGESTIONS, storeFile, storePhoto, usePortfolio, type Piece } from "@/lib/portfolio";
import { SKILLS, WORK_KEY, type WorkProfile } from "@/lib/workprofile";

const MAX_PHOTOS = 6;
const MAX_FILES = 4;
const FILE_TYPES = ".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.md,audio/*,video/mp4";

const cover = (p: Pick<Piece, "image" | "images">) => p.image ?? p.images?.[0];

/** Fills its (relatively positioned) parent: the cover photo, a sample photo, or a calm tile saying what's inside. */
export function PieceImage({ piece, sizes = "240px" }: { piece: Pick<Piece, "image" | "images" | "photo" | "kind" | "title" | "links" | "files" | "link">; sizes?: string }) {
  const src = cover(piece);
  // eslint-disable-next-line @next/next/no-img-element -- the member's own upload (a data URL until the API stores it)
  if (src) return <img src={src} alt={piece.title} className="wk-img" />;
  if (piece.photo) return <Pic name={piece.photo} sizes={sizes} />;
  const icon: IconName = piece.files?.length ? "document" : piece.links?.length || piece.link ? "link" : "edit";
  return <span className="wk-none" aria-hidden><Icon name={icon} size={26} /><small>{piece.kind || "Project"}</small></span>;
}

export const pieceMeta = (p: Pick<Piece, "kind" | "detail" | "year">) => [p.kind, p.detail, p.year].filter(Boolean).join(" · ");

/** What a project holds, as small icons: links, files, photos, a write-up. */
function Formats({ p }: { p: Piece }) {
  const links = p.links?.length ?? (p.link ? 1 : 0);
  const photos = (p.image ? 1 : 0) + (p.images?.length ?? 0);
  const items: [IconName, string][] = [];
  if (links) items.push(["link", `${links} link${links > 1 ? "s" : ""}`]);
  if (p.files?.length) items.push(["document", `${p.files.length} file${p.files.length > 1 ? "s" : ""}`]);
  if (photos) items.push(["photo", `${photos} photo${photos > 1 ? "s" : ""}`]);
  if (p.story && p.story.length > 80) items.push(["edit", "Case study"]);
  if (!items.length) return null;
  return <span className="wk-formats">{items.map(([i, l]) => <span key={l} title={l}><Icon name={i} size={12} />{l}</span>)}</span>;
}

export function PieceCard({ piece, onOpen }: { piece: Piece; onOpen: () => void }) {
  return (
    <button type="button" className="wk-card" onClick={onOpen} aria-label={`${piece.title}, open`}>
      <span className="wk-ph"><PieceImage piece={piece} /></span>
      <b>{piece.title}</b>
      <small>{[piece.role, piece.kind, piece.year].filter(Boolean).join(" · ")}</small>
      <Formats p={piece} />
    </button>
  );
}

/** Paste a link, see what it is, add it. Used by projects and the work profile. */
export function LinkAdder({ links, onChange, max = 6, placeholder = "Paste a link: a live site, a repo, a video, a post" }: { links: ProofLink[]; onChange: (l: ProofLink[]) => void; max?: number; placeholder?: string }) {
  const [url, setUrl] = useState("");
  const [err, setErr] = useState("");
  const clean = cleanUrl(url);
  const add = () => {
    if (!clean) return setErr("That doesn't look like a link yet.");
    if (links.some((l) => l.url === clean)) return setErr("You've already added that one.");
    onChange([...links, { url: clean, kind: linkKind(clean) }]);
    setUrl(""); setErr("");
  };
  return (
    <div className="wk-links">
      {links.length > 0 && (
        <ul className="co-items">
          {links.map((l) => {
            const k = linkLook(l);
            return (
              <li key={l.url} className="co-item">
                <span className="ic"><Icon name={k.icon} size={18} /></span>
                <span className="t"><b>{k.label}</b><a href={l.url} target="_blank" rel="noopener noreferrer">{k.short}</a></span>
                <button type="button" className="x" aria-label={`Remove ${k.label}`} onClick={() => onChange(links.filter((x) => x.url !== l.url))}><Icon name="close" size={18} /></button>
              </li>
            );
          })}
        </ul>
      )}
      {links.length < max && (
        <div className="co-link-add">
          <span className="ic" aria-hidden><Icon name={clean ? linkLook({ url: clean, kind: linkKind(clean) }).icon : "link"} size={18} /></span>
          <input value={url} inputMode="url" autoCapitalize="off" autoCorrect="off" spellCheck={false} aria-label="Paste a link" placeholder={placeholder} onChange={(e) => { setUrl(e.target.value); setErr(""); }} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }} />
          <button type="button" className="kh-btn amber sm" disabled={!url.trim()} onClick={add}>Add</button>
        </div>
      )}
      {err && <p className="co-err" role="alert">{err}</p>}
    </div>
  );
}

/** Suggested skills for a field as tap-to-add chips, plus anything typed. */
export function SkillPicker({ value, onChange, field, max = 15 }: { value: string[]; onChange: (s: string[]) => void; field?: string; max?: number }) {
  const [typed, setTyped] = useState("");
  const pool = [...new Set([...(field ? SKILLS[field] ?? [] : []), ...Object.values(SKILLS).flat()])];
  const q = typed.trim().toLowerCase();
  const suggest = (q ? pool.filter((s) => s.toLowerCase().includes(q)) : (field ? SKILLS[field] ?? [] : pool.slice(0, 12))).filter((s) => !value.includes(s)).slice(0, 12);
  const add = (s: string) => {
    const t = s.trim();
    if (!t || value.some((v) => v.toLowerCase() === t.toLowerCase()) || value.length >= max) return;
    onChange([...value, t]); setTyped("");
  };
  return (
    <div className="wk-skills">
      {value.length > 0 && (
        <div className="wk-chosen">{value.map((s) => <span key={s}>{s}<button type="button" aria-label={`Remove ${s}`} onClick={() => onChange(value.filter((x) => x !== s))}>×</button></span>)}</div>
      )}
      <div className="co-link-add">
        <span className="ic" aria-hidden><Icon name="search" size={17} /></span>
        <input value={typed} onChange={(e) => setTyped(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(typed); } }} placeholder={value.length >= max ? `Up to ${max} skills` : "Search or type a skill"} disabled={value.length >= max} aria-label="Add a skill" />
        {q && !pool.some((s) => s.toLowerCase() === q) && <button type="button" className="kh-btn outline sm" onClick={() => add(typed)}>Add “{typed.trim()}”</button>}
      </div>
      {suggest.length > 0 && <div className="wk-chips">{suggest.map((s) => <button key={s} type="button" onClick={() => add(s)}>+ {s}</button>)}</div>}
      <small className="co-muted">{value.length} of {max}</small>
    </div>
  );
}

type Draft = Omit<Piece, "id" | "createdAt">;
const blank = (): Draft => ({ title: "", kind: "", role: "", year: String(new Date().getFullYear()), detail: "", story: "", links: [], files: [], images: [], skills: [] });
const fromPiece = (p: Piece): Draft => ({ ...p, links: p.links ?? (p.link ? [{ url: p.link, kind: linkKind(p.link) }] : []), files: p.files ?? [], images: [...(p.image ? [p.image] : []), ...(p.images ?? [])], image: undefined, skills: p.skills ?? [] });
const STEPS = ["Basics", "Content", "Description"] as const;

/**
 * Add or edit a project in three short steps, the way freelance profiles do it: the basics (title, kind, your
 * role), the content (links, files, photos: whatever suits the work, in any mix), then the write-up and skills.
 */
export function PieceForm({ piece, onClose, onSaved }: { piece?: Piece; onClose: () => void; onSaved?: (p: Piece) => void }) {
  const pf = usePortfolio();
  const [step, setStep] = useState(0);
  const [f, setF] = useState<Draft>(() => (piece ? fromPiece(piece) : blank()));
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [field] = useState(readField);
  const photoInput = useRef<HTMLInputElement>(null);
  const set = (p: Partial<Draft>) => setF((x) => ({ ...x, ...p }));
  const photos = f.images ?? [];
  const hasContent = !!(f.links?.length || f.files?.length || photos.length || f.photo);

  const addPhotos = async (fs: File[]) => {
    const ok = fs.filter((x) => x.type.startsWith("image/") && x.size <= 15 * 1024 * 1024).slice(0, MAX_PHOTOS - photos.length);
    setErr(ok.length < fs.length ? `Photos only, up to ${MAX_PHOTOS}, each under 15 MB.` : "");
    if (!ok.length) return;
    setBusy(true);
    try {
      const urls = await Promise.all(ok.map(storePhoto));
      setF((x) => ({ ...x, images: [...(x.images ?? []), ...urls], photo: undefined }));
    } catch (e) {
      setErr(e instanceof Error && e.message ? e.message : "We couldn't read one of those photos.");
    } finally {
      setBusy(false);
    }
  };
  const addFiles = async (fs: File[]) => {
    const have = f.files ?? [];
    const ok = fs.filter((x) => accepts(x, FILE_TYPES) && x.size <= MAX_BYTES && !have.some((h) => h.name === x.name && h.size === x.size)).slice(0, MAX_FILES - have.length);
    setErr(ok.length < fs.length ? "Some files were skipped: documents, decks, sheets or audio, each under 5 MB." : "");
    if (!ok.length) return;
    setBusy(true);
    try {
      const stored = await Promise.all(ok.map((x) => storeFile(x, "sample")));
      setF((x) => ({ ...x, files: [...(x.files ?? []), ...stored] }));
    } catch (e) {
      setErr(e instanceof Error && e.message ? e.message : "That file didn't upload. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const save = () => {
    const [first, ...rest] = photos;
    const clean: Draft = {
      ...f, title: f.title.trim(), kind: f.kind.trim(), role: f.role?.trim() || undefined, detail: f.detail?.trim() || undefined, story: f.story?.trim() || undefined,
      image: first, images: rest, link: f.links?.[0]?.url,
    };
    if (piece) {
      pf.edit(piece.id, clean);
      onSaved?.({ ...piece, ...clean });
    } else {
      const added = pf.add(clean);
      onSaved?.(added);
    }
    onClose();
  };

  const can = [!!f.title.trim() && !!f.kind.trim() && f.year.length === 4, true, true];

  return (
    <Sheet title={piece ? "Edit project" : "Add a project"} sub={`Step ${step + 1} of 3 · ${STEPS[step]}`} onClose={onClose} wide>
      <div className="wk-form">
        <div className="wk-steps" aria-hidden>{STEPS.map((s, i) => <i key={s} className={i <= step ? "on" : undefined} />)}</div>

        {step === 0 && (
          <>
            <label className="wk-field">
              <span>Project title</span>
              <input value={f.title} maxLength={80} onChange={(e) => set({ title: e.target.value })} placeholder="e.g. Booking app for a Garki clinic, Wedding for 300 guests" autoFocus />
            </label>
            <div className="wk-field">
              <label htmlFor="wk-kind">What kind of work?</label>
              <input id="wk-kind" value={f.kind} maxLength={40} onChange={(e) => set({ kind: e.target.value })} placeholder="e.g. Web app, Catering, Research, Mural" list="wk-kinds" />
              <div className="wk-chips">{KIND_SUGGESTIONS.slice(0, 10).map((k) => <button key={k} type="button" className={f.kind === k ? "on" : undefined} onClick={() => set({ kind: k })}>{k}</button>)}</div>
              <datalist id="wk-kinds">{KIND_SUGGESTIONS.map((k) => <option key={k} value={k} />)}</datalist>
            </div>
            <div className="wk-two rev">
              <label className="wk-field"><span>Your role <small>optional</small></span><input value={f.role ?? ""} maxLength={50} onChange={(e) => set({ role: e.target.value })} placeholder="e.g. Lead developer, Head cook" /></label>
              <label className="wk-field"><span>Year</span><input value={f.year} inputMode="numeric" maxLength={4} onChange={(e) => set({ year: e.target.value.replace(/\D/g, "") })} /></label>
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <p className="wk-lede">Show it the way that suits the work. Add any mix, or skip this and describe it in the next step.</p>
            <section className="wk-block">
              <h4><Icon name="link" size={16} />Links <small>a live site, a repo, a video, a post, a shared doc</small></h4>
              <LinkAdder links={f.links ?? []} onChange={(links) => set({ links })} />
            </section>
            <section className="wk-block">
              <h4><Icon name="document" size={16} />Files <small>a case study, report, deck, menu or audio · up to {MAX_FILES}, 5 MB each</small></h4>
              {(f.files?.length ?? 0) > 0 && <ul className="co-items">{f.files!.map((x) => <FileRow key={x.id} f={x} onRemove={() => set({ files: f.files!.filter((y) => y.id !== x.id) })} />)}</ul>}
              {(f.files?.length ?? 0) < MAX_FILES && <Drop accept={FILE_TYPES} multiple label="Add a file" sub="PDF, Word, PowerPoint, Excel or audio. Drop it here or tap to choose." onFiles={(fs) => void addFiles(fs)} />}
            </section>
            <section className="wk-block">
              <h4><Icon name="photo" size={16} />Photos <small>optional · the first is the cover · up to {MAX_PHOTOS}</small></h4>
              <div className="wk-photos">
                {photos.map((src, i) => (
                  <span key={i} className="wk-photo">
                    {/* eslint-disable-next-line @next/next/no-img-element -- the member's own upload */}
                    <img src={src} alt="" />
                    {i === 0 && <em>Cover</em>}
                    <button type="button" aria-label="Remove photo" onClick={() => set({ images: photos.filter((_, j) => j !== i) })}>×</button>
                  </span>
                ))}
                {photos.length < MAX_PHOTOS && (
                  <button type="button" className="wk-photo add" onClick={() => photoInput.current?.click()} disabled={busy} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); void addPhotos([...e.dataTransfer.files]); }}>
                    <Icon name="photo" size={20} /><small>{busy ? "Preparing…" : "Add photos"}</small>
                  </button>
                )}
              </div>
              <input ref={photoInput} type="file" accept="image/*" multiple hidden onChange={(e) => { void addPhotos([...(e.target.files ?? [])]); e.target.value = ""; }} />
            </section>
            {err && <p className="co-err" role="alert">{err}</p>}
            {!hasContent && <p className="co-muted" style={{ fontSize: 12.5 }}>Nothing to attach? That&apos;s fine: a good write-up in the next step is enough.</p>}
          </>
        )}

        {step === 2 && (
          <>
            <label className="wk-field">
              <span>Describe the project <small>{(f.story ?? "").length}/1500</small></span>
              <textarea rows={7} maxLength={1500} value={f.story ?? ""} onChange={(e) => set({ story: e.target.value })} placeholder={"What was the goal or the problem?\nWhat did you do?\nWhat changed because of it?"} />
            </label>
            <label className="wk-field"><span>A short detail <small>optional</small></span><input value={f.detail ?? ""} maxLength={30} onChange={(e) => set({ detail: e.target.value })} placeholder="e.g. 12 screens, 150 guests, 3 months" /></label>
            <div className="wk-field">
              <span className="l">Skills you used <small>optional</small></span>
              <SkillPicker value={f.skills ?? []} onChange={(skills) => set({ skills })} field={field} max={8} />
            </div>
          </>
        )}

        <div className="wk-foot">
          {step === 0 ? <button type="button" className="kh-btn outline" onClick={onClose}>Cancel</button> : <button type="button" className="kh-btn outline" onClick={() => setStep(step - 1)}>Back</button>}
          {step < 2
            ? <button type="button" className="kh-btn amber" disabled={!can[step] || busy} onClick={() => setStep(step + 1)}>Continue</button>
            : <button type="button" className="kh-btn amber" onClick={save}>{piece ? "Save changes" : "Add project"}</button>}
        </div>
      </div>
    </Sheet>
  );
}

/** The member's field, for skill suggestions, without subscribing to the whole work profile. */
function readField() {
  try {
    return (JSON.parse(localStorage.getItem(WORK_KEY) ?? "null") as WorkProfile | null)?.field;
  } catch {
    return undefined;
  }
}

export function PieceDetail({ piece, onClose, onEdit, onRemove }: { piece: Piece; onClose: () => void; onEdit?: () => void; onRemove?: () => void }) {
  const links = piece.links ?? (piece.link ? [{ url: piece.link, kind: linkKind(piece.link) }] : []);
  const photos = [...(piece.image ? [piece.image] : []), ...(piece.images ?? [])];
  return (
    <Sheet title={piece.title} sub={[piece.role, piece.kind, piece.detail, piece.year].filter(Boolean).join(" · ")} onClose={onClose} wide>
      <div className="wk-detail">
        {(photos.length > 0 || piece.photo) && <span className="wk-ph big"><PieceImage piece={piece} sizes="640px" /></span>}
        {photos.length > 1 && (
          <div className="wk-photos">
            {/* eslint-disable-next-line @next/next/no-img-element -- the member's own uploads */}
            {photos.slice(1).map((src, i) => <span key={i} className="wk-photo"><img src={src} alt="" /></span>)}
          </div>
        )}
        {piece.story ? <p className="wk-story">{piece.story}</p> : <p className="co-muted">No description yet.</p>}
        {links.length > 0 && (
          <ul className="co-items">
            {links.map((l) => { const k = linkLook(l); return <li key={l.url} className="co-item"><span className="ic"><Icon name={k.icon} size={18} /></span><span className="t"><b>{k.label}</b><a href={l.url} target="_blank" rel="noopener noreferrer nofollow">{k.short}</a></span></li>; })}
          </ul>
        )}
        {(piece.files?.length ?? 0) > 0 && <ul className="co-items">{piece.files!.map((x) => <FileRow key={x.id} f={x} />)}</ul>}
        {(piece.skills?.length ?? 0) > 0 && <div className="wk-tags">{piece.skills!.map((s) => <span key={s}>{s}</span>)}</div>}
        {(onEdit || onRemove) && (
          <div className="wk-foot">
            {onRemove ? <button type="button" className="kh-btn outline" onClick={() => { if (window.confirm(`Remove “${piece.title}”? It also leaves My Studio.`)) onRemove(); }}><Icon name="remove" size={16} />Remove</button> : <span />}
            {onEdit && <button type="button" className="kh-btn amber" onClick={onEdit}><Icon name="edit" size={16} />Edit</button>}
          </div>
        )}
      </div>
    </Sheet>
  );
}
