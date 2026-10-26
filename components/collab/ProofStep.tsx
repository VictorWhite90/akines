"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { PieceForm, PieceImage, pieceMeta } from "@/components/portfolio/Portfolio";
import Icon, { type IconName } from "@/components/ui/Icon";
import { cleanUrl, linkKind, linkLook, proofFor, type ProofSection } from "@/lib/collab/proof";
import type { ProofFile, ProofLink } from "@/lib/collab/types";
import { usePortfolio } from "@/lib/portfolio";
import { useWorkProfile } from "@/lib/workprofile";
import { Drop, FileRow, MAX_BYTES, accepts, toProof } from "./FileParts";

const MAX_LINKS = 6;
const MAX_PIECES = 3;
const MAX_SAMPLES = 3;

export type Proof = { works: string[]; links: ProofLink[]; files: ProofFile[] };
export const proofCount = (p: Proof) => p.works.length + p.links.length + p.files.length;

/** One line for what's attached: "2 links, a CV and 1 piece". */
export function proofSummary(p: Proof) {
  const cv = p.files.some((f) => f.kind === "cv");
  const samples = p.files.filter((f) => f.kind === "sample").length;
  const parts = [
    p.links.length && `${p.links.length} link${p.links.length > 1 ? "s" : ""}`,
    cv && "a CV",
    samples && `${samples} file${samples > 1 ? "s" : ""}`,
    p.works.length && `${p.works.length} piece${p.works.length > 1 ? "s" : ""}`,
  ].filter(Boolean) as string[];
  return parts.length > 1 ? `${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}` : parts[0] ?? "";
}

const SECTION: Record<ProofSection, { title: string; icon: IconName }> = {
  links: { title: "Links", icon: "link" },
  cv: { title: "CV or résumé", icon: "cv" },
  samples: { title: "Files", icon: "document" },
  pieces: { title: "Projects from your work profile", icon: "creative" },
};

/**
 * "Your work", shaped by the role: links and a CV for a developer, pieces for a designer, recordings for an
 * audio editor, a CV and proof of past jobs for a caterer. Every kind of proof is always available; the ones
 * that fit the role come first and open.
 */
export default function ProofStep({ role, host, value, onChange }: { role: string; host: string; value: Proof; onChange: (p: Proof) => void }) {
  const fit = proofFor(role);
  const [open, setOpen] = useState<ProofSection[]>(() => {
    const filled = fit.order.filter((s) => has(value, s));
    return [...new Set([...fit.order.slice(0, 2), ...filled])];
  });
  const total = proofCount(value);

  return (
    <>
      <h2>{fit.title}</h2>
      <p className="hint">{fit.hint} {host} sees these first.</p>
      <div className="co-proof-list">
        {fit.order.map((s, i) => {
          const isOpen = open.includes(s);
          const n = count(value, s);
          return (
            <section key={s} className={`co-proof${isOpen ? " open" : ""}`}>
              <button type="button" className="co-proof-head" aria-expanded={isOpen} onClick={() => setOpen((o) => (isOpen ? o.filter((x) => x !== s) : [...o, s]))}>
                <span className="ic"><Icon name={SECTION[s].icon} size={18} /></span>
                <span className="t">
                  <b>{s === "samples" ? fit.samples.label : SECTION[s].title}</b>
                  {i < 2 && <small>{i === 0 ? "Best for this role" : "Recommended"}</small>}
                </span>
                {n > 0 && <span className="co-chip blue">{n} added</span>}
                <span className="chev" aria-hidden><Icon name="expand" size={16} /></span>
              </button>
              {isOpen && (
                <div className="co-proof-body">
                  {s === "links" && <Links fit={fit} value={value} onChange={onChange} />}
                  {s === "cv" && <Cv value={value} onChange={onChange} />}
                  {s === "samples" && <Samples fit={fit} value={value} onChange={onChange} />}
                  {s === "pieces" && <Pieces value={value} onChange={onChange} />}
                </div>
              )}
            </section>
          );
        })}
      </div>
      <p className="co-muted" style={{ fontSize: 13 }}>{total ? `Attached: ${proofSummary(value)}` : "Add at least one thing, whatever fits your work best."}</p>
    </>
  );
}

function has(p: Proof, s: ProofSection) {
  return count(p, s) > 0;
}
function count(p: Proof, s: ProofSection) {
  if (s === "links") return p.links.length;
  if (s === "pieces") return p.works.length;
  return p.files.filter((f) => f.kind === (s === "cv" ? "cv" : "sample")).length;
}

function Links({ fit, value, onChange }: { fit: ReturnType<typeof proofFor>; value: Proof; onChange: (p: Proof) => void }) {
  const [url, setUrl] = useState("");
  const [note, setNote] = useState("");
  const [hint, setHint] = useState(fit.suggest[0]?.placeholder ?? "yourwork.com");
  const [err, setErr] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const clean = cleanUrl(url);
  const preview = clean ? linkLook({ url: clean, kind: linkKind(clean) }) : null;
  const full = value.links.length >= MAX_LINKS;
  const { wp } = useWorkProfile();
  const fromProfile = wp.links.filter((l) => !value.links.some((v) => v.url === l.url));

  const add = () => {
    if (!clean) return setErr("That doesn't look like a link. Try something like " + hint + ".");
    if (value.links.some((l) => l.url === clean)) return setErr("You've already added that one.");
    onChange({ ...value, links: [...value.links, { url: clean, kind: linkKind(clean), note: note || undefined }] });
    setUrl(""); setNote(""); setErr("");
  };

  return (
    <>
      {fromProfile.length > 0 && !full && (
        <div className="co-from-profile">
          <small>From your work profile</small>
          <div className="co-row">
            {fromProfile.map((l) => { const k = linkLook(l); return <button key={l.url} type="button" className="co-chip co-quick on" onClick={() => onChange({ ...value, links: [...value.links, l].slice(0, MAX_LINKS) })}><Icon name={k.icon} size={13} />+ {k.label}</button>; })}
          </div>
        </div>
      )}
      <div className="co-row" role="group" aria-label="Quick add">
        {fit.suggest.map((sg) => (
          <button key={sg.label} type="button" className="co-chip co-quick" disabled={full} onClick={() => { setHint(sg.placeholder); setNote(sg.kind === "site" ? sg.label : ""); setErr(""); input.current?.focus(); }}>
            + {sg.label}
          </button>
        ))}
      </div>
      <div className="co-link-add">
        <span className="ic" aria-hidden><Icon name={preview?.icon ?? "link"} size={18} /></span>
        <input ref={input} value={url} disabled={full} inputMode="url" autoCapitalize="off" autoCorrect="off" spellCheck={false} aria-label={note ? `${note} link` : "Paste a link"} placeholder={full ? `Up to ${MAX_LINKS} links` : `Paste a link · ${hint}`} onChange={(e) => { setUrl(e.target.value); setErr(""); }} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }} />
        <button type="button" className="kh-btn amber sm" disabled={!url.trim() || full} onClick={add}>Add</button>
      </div>
      {preview && !err && <p className="co-muted" style={{ fontSize: 12.5, marginTop: -4 }}>Adds as <b>{note || preview.label}</b> · {preview.short}</p>}
      {err && <p className="co-err" role="alert">{err}</p>}
      {value.links.length > 0 && (
        <ul className="co-items">
          {value.links.map((l) => {
            const look = linkLook(l);
            return (
              <li key={l.url} className="co-item">
                <span className="ic"><Icon name={look.icon} size={18} /></span>
                <span className="t"><b>{look.label}</b><a href={l.url} target="_blank" rel="noopener noreferrer">{look.short}</a></span>
                <button type="button" className="x" aria-label={`Remove ${look.label}`} onClick={() => onChange({ ...value, links: value.links.filter((x) => x.url !== l.url) })}><Icon name="close" size={18} /></button>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}

function Cv({ value, onChange }: { value: Proof; onChange: (p: Proof) => void }) {
  const [err, setErr] = useState("");
  const cv = value.files.find((f) => f.kind === "cv");
  const { wp } = useWorkProfile();
  const ACCEPT = ".pdf,.doc,.docx";
  const pick = (fs: File[]) => {
    const f = fs[0];
    if (!f) return;
    if (!accepts(f, ACCEPT)) return setErr("Send your CV as a PDF or a Word document.");
    if (f.size > MAX_BYTES) return setErr("That file is over 5 MB. A PDF export is usually much smaller.");
    setErr("");
    onChange({ ...value, files: [...value.files.filter((x) => x.kind !== "cv"), toProof(f, "cv")] });
  };
  return (
    <>
      {!cv && wp.cv && (
        <button type="button" className="co-use-cv" onClick={() => onChange({ ...value, files: [...value.files, wp.cv!] })}>
          <span className="ic doc">{(wp.cv.name.split(".").pop() ?? "CV").toUpperCase().slice(0, 4)}</span>
          <span className="t"><b>Use the CV from your work profile</b><small>{wp.cv.name}</small></span>
          <span className="kh-btn amber sm">Attach</span>
        </button>
      )}
      {cv
        ? <ul className="co-items"><FileRow f={cv} onRemove={() => onChange({ ...value, files: value.files.filter((x) => x.kind !== "cv") })} /></ul>
        : <Drop accept={ACCEPT} label={wp.cv ? "Or upload a different CV" : "Upload your CV"} sub="PDF or Word, up to 5 MB. Drop it here or tap to choose." onFiles={pick} />}
      {err && <p className="co-err" role="alert">{err}</p>}
      {!cv && !wp.cv && <p className="co-muted" style={{ fontSize: 12.5 }}>No CV? That&apos;s fine. Your work profile goes with every application.</p>}
    </>
  );
}

function Samples({ fit, value, onChange }: { fit: ReturnType<typeof proofFor>; value: Proof; onChange: (p: Proof) => void }) {
  const [err, setErr] = useState("");
  const samples = value.files.filter((f) => f.kind === "sample");
  const room = MAX_SAMPLES - samples.length;
  const pick = (fs: File[]) => {
    const ok = fs.filter((f) => accepts(f, fit.samples.accept) && f.size <= MAX_BYTES);
    const fresh = ok.map((f) => toProof(f, "sample")).filter((p) => !samples.some((s) => s.id === p.id)).slice(0, room);
    setErr(ok.length < fs.length ? "Some files were skipped: check the type, and keep each under 5 MB." : fs.length > room ? `Up to ${MAX_SAMPLES} files.` : "");
    if (fresh.length) onChange({ ...value, files: [...value.files, ...fresh] });
  };
  return (
    <>
      {samples.length > 0 && <ul className="co-items">{samples.map((f) => <FileRow key={f.id} f={f} onRemove={() => onChange({ ...value, files: value.files.filter((x) => x.id !== f.id) })} />)}</ul>}
      {room > 0 && <Drop accept={fit.samples.accept} multiple label={samples.length ? "Add another file" : `Add ${fit.samples.label.toLowerCase()}`} sub={`${fit.samples.hint} Up to ${MAX_SAMPLES}, 5 MB each.`} onFiles={pick} />}
      {err && <p className="co-err" role="alert">{err}</p>}
    </>
  );
}

function Pieces({ value, onChange }: { value: Proof; onChange: (p: Proof) => void }) {
  const pf = usePortfolio();
  const [adding, setAdding] = useState(false);
  const toggle = (id: string) => {
    const w = value.works;
    onChange({ ...value, works: w.includes(id) ? w.filter((x) => x !== id) : w.length >= MAX_PIECES ? w : [...w, id] });
  };
  const full = value.works.length >= MAX_PIECES;
  return (
    <>
      <p className="co-muted" style={{ fontSize: 13, marginTop: -4 }}>
        {pf.pieces.length ? <>From the Work tab on <Link href="/profile" className="co-link">your profile</Link>. A project you add here is saved there too.</> : <>No projects in your work profile yet. Add one here (links, files, photos or a write-up) and it&apos;s saved to <Link href="/profile" className="co-link">your profile</Link> for next time.</>}
      </p>
      <div className="co-works">
        <button type="button" className="co-work co-work-add" onClick={() => setAdding(true)} disabled={full}>
          <span className="ph"><span className="in"><Icon name="upload" size={22} /><b>Add a project</b><small>{full ? `Up to ${MAX_PIECES}` : "Links, files, photos or a write-up"}</small></span></span>
        </button>
        {pf.pieces.map((w) => {
          const on = value.works.includes(w.id);
          return (
            <button key={w.id} type="button" className={`co-work${on ? " on" : ""}`} onClick={() => toggle(w.id)} aria-pressed={on}>
              <span className="ph"><PieceImage piece={w} sizes="220px" /><span className="tick">{on ? value.works.indexOf(w.id) + 1 : "+"}</span></span>
              <b>{w.title}</b><small>{pieceMeta(w)}</small>
            </button>
          );
        })}
      </div>
      <p className="co-muted" style={{ fontSize: 12.5 }}>{value.works.length} of {MAX_PIECES} chosen</p>
      {adding && <PieceForm onClose={() => setAdding(false)} onSaved={(p) => { if (!full) onChange({ ...value, works: [...value.works, p.id] }); }} />}
    </>
  );
}
