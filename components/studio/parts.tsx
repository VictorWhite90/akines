"use client";

import { useEffect, type ReactNode } from "react";
import Pic from "@/components/home/Pic";
import { PHOTO, type PhotoKey } from "@/lib/data/images";
import { VISITING, fmtShort, themeVars, type Note, type ThemeId, type VisitingStyle, type Work } from "@/lib/data/studio";

/* ---------- icons ---------- */
const P = {
  plus: <path d="M12 5v14M5 12h14" />,
  live: <><circle cx="12" cy="12" r="2.2" /><path d="M7.5 7.5a6.4 6.4 0 0 0 0 9M16.5 7.5a6.4 6.4 0 0 1 0 9M4.6 4.6a10.5 10.5 0 0 0 0 14.8M19.4 4.6a10.5 10.5 0 0 1 0 14.8" /></>,
  cal: <><rect x="3.5" y="5" width="17" height="15.5" rx="2.5" /><path d="M8 3v4M16 3v4M3.5 10h17" /></>,
  eye: <><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" /><circle cx="12" cy="12" r="2.8" /></>,
  x: <path d="M6 6l12 12M18 6 6 18" />,
  trash: <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" />,
  mic: <><path d="M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3Z" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></>,
  cam: <><rect x="3" y="6" width="13" height="12" rx="2" /><path d="m16 10 5-3v10l-5-3" /></>,
  send: <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7Z" />,
  store: <><path d="M4 9.5 5.5 4h13L20 9.5" /><path d="M4 9.5a2.7 2.7 0 0 0 5.3 0 2.7 2.7 0 0 0 5.4 0 2.7 2.7 0 0 0 5.3 0M5.5 12.5V20h13v-7.5" /></>,
  pen: <><path d="M4 20h4L19 9l-4-4L4 16v4Z" /><path d="m13.5 6.5 4 4" /></>,
  pin: <><path d="M9 3h6l-1 6 3 3H7l3-3-1-6Z" /><path d="M12 12v9" /></>,
  image: <><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="9" cy="10" r="1.6" /><path d="m21 16-5-5-8 8" /></>,
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
};
export function Ico({ n, size = 18 }: { n: keyof typeof P; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {P[n]}
    </svg>
  );
}

export function DoorGlyph({ open, size = 24 }: { open: boolean; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {open ? (
        <>
          <path d="M6 21V4.5A1.5 1.5 0 0 1 7.5 3H17a1 1 0 0 1 1 1v17" />
          <path d="M6 21l7-2V6L6 4.5" fill="currentColor" fillOpacity=".18" />
          <circle cx="11" cy="12.5" r=".9" fill="currentColor" stroke="none" />
          <path d="M3 21h18" />
        </>
      ) : (
        <>
          <rect x="6" y="3" width="12" height="18" rx="1.5" />
          <path d="M9.5 7h5M9.5 11h5" />
          <circle cx="15.2" cy="15.5" r=".9" fill="currentColor" stroke="none" />
          <path d="M3 21h18" />
        </>
      )}
    </svg>
  );
}

/* ---------- modal ---------- */
export function Modal({ title, eyebrow, onClose, children, wide = false, dark = false }: { title?: ReactNode; eyebrow?: string; onClose: () => void; children: ReactNode; wide?: boolean; dark?: boolean }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div className={`sd-modal${dark ? " dark" : ""}`} role="dialog" aria-modal="true" aria-label={typeof title === "string" ? title : eyebrow} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`card${wide ? " wide" : ""}`}>
        <button className="x" onClick={onClose} aria-label="Close">×</button>
        {eyebrow && <p className="ac-eyebrow">{eyebrow}</p>}
        {title && <h2>{title}</h2>}
        {children}
      </div>
    </div>
  );
}

/* ---------- photo picker ---------- */
export function PhotoPicker({ keys, value, onChange, label, size = "md" }: { keys: PhotoKey[]; value?: PhotoKey; onChange: (k: PhotoKey | undefined) => void; label: string; size?: "sm" | "md" }) {
  return (
    <div className={`sd-picker ${size}`} role="radiogroup" aria-label={label}>
      {keys.map((k) => (
        <button type="button" key={k} role="radio" aria-checked={value === k} title={PHOTO[k].alt} className={value === k ? "on" : ""} onClick={() => onChange(value === k ? undefined : k)}>
          <Pic name={k} sizes="120px" />
          {value === k && <span className="tick" aria-hidden>✓</span>}
        </button>
      ))}
    </div>
  );
}

/* ---------- small pieces ---------- */
export function VisitingChip({ style, className = "" }: { style: VisitingStyle; className?: string }) {
  return <span className={`sd-vchip ${style} ${className}`}>{VISITING[style].label}</span>;
}

/** The studio's compact card: used as the wizard preview and reusable elsewhere. */
export function StudioCard({ name, tagline, place, disciplines, cover, theme, visiting, hours, doorOpen = true }: { name: string; tagline?: string; place?: string; disciplines: string[]; cover: PhotoKey; theme: ThemeId; visiting: VisitingStyle; hours?: string; doorOpen?: boolean }) {
  return (
    <article className="sd sd-mini" style={themeVars(theme)}>
      <div className="cover">
        <Pic name={cover} sizes="360px" />
        <span className={`sd-status ${doorOpen ? "open" : "shut"}`}><i />{doorOpen ? "Door open" : "Door closed"}</span>
      </div>
      <div className="wall">
        <h3 className="font-display">{name || "Your space name"}</h3>
        <p className="tag">{tagline || "A line about what you do."}</p>
        {place && <p className="where">{place}</p>}
        <div className="chips">
          {disciplines.slice(0, 3).map((d) => <span key={d}>{d}</span>)}
          {disciplines.length > 3 && <span>+{disciplines.length - 3}</span>}
        </div>
      </div>
      <div className="foot">
        <VisitingChip style={visiting} />
        {hours && <span className="hrs">{hours}</span>}
      </div>
    </article>
  );
}

export function WorkCard({ work, onOpen }: { work: Work; onOpen: () => void }) {
  return (
    <button className="sd-work" onClick={onOpen} aria-label={`${work.title}, open the story`}>
      <span className="ph"><Pic name={work.photo} sizes="(max-width: 760px) 50vw, 220px" /></span>
      <span className="tt">{work.title}</span>
      <span className="mm">{[work.medium, work.year].filter(Boolean).join(" · ")}</span>
    </button>
  );
}

export function WorkDetail({ work, onClose, onRemove }: { work: Work; onClose: () => void; onRemove?: () => void }) {
  return (
    <Modal onClose={onClose} wide>
      <div className="sd-detail">
        <div className="ph"><Pic name={work.photo} sizes="(max-width: 760px) 100vw, 320px" /></div>
        <div className="tx">
          <p className="ac-eyebrow">On the wall</p>
          <h2>{work.title}</h2>
          <p className="meta">{[work.medium, work.size, work.year].filter(Boolean).join(" · ")}</p>
          <h4>The story behind it</h4>
          <p className="story">{work.story || "No story written yet."}</p>
          <div className="btns">
            <button className="sd-btn" onClick={onClose}>Close</button>
            {onRemove && <button className="sd-btn quiet" onClick={onRemove}><Ico n="trash" size={14} /> Remove from my space</button>}
          </div>
        </div>
      </div>
    </Modal>
  );
}

export function NoteCard({ note, onRemove }: { note: Note; onRemove?: () => void }) {
  return (
    <article className="sd-note">
      {note.photo && <div className="ph"><Pic name={note.photo} sizes="(max-width: 760px) 50vw, 240px" /></div>}
      <div className="bd">
        <p className="top"><span>{note.kind === "sketch" ? "Sketch" : "Note"}</span><time dateTime={note.date}>{fmtShort(note.date)}</time></p>
        <p className="tx">{note.text}</p>
      </div>
      {onRemove && <button className="rm" onClick={onRemove} aria-label="Remove this note"><Ico n="x" size={13} /></button>}
    </article>
  );
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="sd-field">
      <span className="lb">{label}{hint && <small>{hint}</small>}</span>
      {children}
    </label>
  );
}
