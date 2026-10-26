"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Drop, FileRow, MAX_BYTES, accepts, toProof } from "@/components/collab/FileParts";
import { LinkAdder, PieceCard, PieceDetail, PieceForm, SkillPicker } from "@/components/portfolio/Portfolio";
import Icon from "@/components/ui/Icon";
import { DEMO } from "@/lib/demo/mode";
import { usePortfolio, type Piece } from "@/lib/portfolio";
import {
  EXPERIENCE_KINDS, LEVELS, OPEN_TO, SKILLS, WORK_FIELDS, completeness, monthLabel, rateLabel, useWorkProfile,
  type Certificate, type Education, type Experience, type RateUnit, type WorkProfile,
} from "@/lib/workprofile";
import { SETUP_STEPS, WorkProfileBody } from "./WorkView";

const HOURS = ["A few hours a week", "10–20 hours a week", "20–30 hours a week", "Full time", "Weekends only", "Evenings only"];
const LANGS = ["English", "Hausa", "Igbo", "Yoruba", "Pidgin", "French", "Arabic"];
const RATE_UNITS: { id: RateUnit; label: string }[] = [
  { id: "hour", label: "Per hour" }, { id: "day", label: "Per day" }, { id: "project", label: "Per project" }, { id: "negotiable", label: "Depends on the work" }, { id: "unpaid", label: "Happy to help unpaid" },
];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const YEARS = Array.from({ length: 50 }, (_, i) => String(new Date().getFullYear() - i));
const HEADLINE_IDEAS: Record<string, string> = {
  Design: "Product designer for clinics, markets and small businesses",
  Tech: "Backend developer building payment and booking tools in Django",
  Media: "Photographer and video editor for events and brands in Abuja",
  Writing: "Copywriter and researcher turning complicated ideas into plain words",
  "Arts & crafts": "Muralist and adire artist working with walls, cloth and communities",
  Food: "Caterer for weddings, launches and matchdays, 20 to 500 guests",
  "Health & care": "Registered nurse and first-aid trainer",
  Teaching: "Maths tutor and workshop facilitator for teenagers",
  Business: "Marketing lead for small businesses and social enterprises",
  Trades: "Solar installer and electrician serving homes in Abuja",
  Events: "Event planner for community festivals and private parties",
  Community: "Community organiser connecting young people to work and training",
};

/**
 * Building a work profile, step by step, like a freelance or LinkedIn profile: what you do, skills, experience,
 * education, projects, availability, about and CV, then review and publish. Every change saves as you go, so
 * people can stop and come back; each step can also be opened alone from the Work tab to edit it.
 */
export default function Setup() {
  const w = useWorkProfile();
  const pf = usePortfolio();
  const router = useRouter();
  const q = useSearchParams();
  const at = SETUP_STEPS.findIndex((s) => s.id === q.get("step"));
  const [started, setStarted] = useState(at >= 0);
  const step = at >= 0 ? at : 0;
  const go = (i: number) => { setStarted(true); router.replace(`/profile/work?step=${SETUP_STEPS[i].id}`, { scroll: false }); window.scrollTo({ top: 0 }); };

  if (!w.ready) return <div className="kh wk-page" aria-busy="true" />;
  const { wp, patch } = w;
  const id = SETUP_STEPS[step].id;
  const fresh = !wp.field && !wp.headline && pf.pieces.length === 0;

  if (!started && fresh) {
    return (
      <div className="kh wk-page">
        <Link href="/profile" className="co-link">← Your profile</Link>
        <section className="wk-start big">
          <span className="wk-start-ic"><Icon name="cv" size={28} /></span>
          <p className="co-eyebrow">Work profile</p>
          <h1>Show what you do, your way</h1>
          <p>Seven short steps. Developers add repos and live apps, caterers add menus and events, writers add articles, designers add case studies. Everything saves as you go.</p>
          <ol className="wk-start-steps">{SETUP_STEPS.slice(0, 7).map((s) => <li key={s.id}><span><Icon name={s.icon} size={16} /></span><b>{s.label}</b><small>{s.hint}</small></li>)}</ol>
          <div className="wk-row">
            <button type="button" className="kh-btn amber" onClick={() => go(0)}>Let&apos;s start</button>
            {DEMO && <button type="button" className="kh-btn outline" onClick={() => { w.fillExample(); go(SETUP_STEPS.length - 1); }}>Fill with an example</button>}
          </div>
        </section>
      </div>
    );
  }

  const { pct } = completeness(wp, pf.pieces.length);
  const can: Record<string, boolean> = { work: !!wp.field && wp.headline.trim().length >= 10, skills: wp.skills.length >= 1 };
  const last = step === SETUP_STEPS.length - 1;
  // Optional steps with nothing in them yet say "Skip for now" instead of "Continue".
  const empty: Record<string, boolean> = {
    experience: !wp.experience.length && !wp.noExperience, education: !wp.education.length && !wp.certificates.length, projects: !pf.pieces.length,
    availability: !wp.openTo.length && !wp.hours && !wp.rate, about: !wp.about.trim() && !wp.links.length && !wp.cv,
  };

  return (
    <div className="kh wk-page">
      <div className="wk-bar">
        <Link href="/profile" className="co-link">← Save and exit</Link>
        <span className="co-muted" style={{ fontSize: 12.5 }}><Icon name="verified" size={13} /> Saved as you go</span>
      </div>
      <div className="wk-progress">
        <div className="wk-progress-top"><b>Step {step + 1} of {SETUP_STEPS.length}</b><span>{SETUP_STEPS[step].label}</span></div>
        <div className="wk-progress-bar"><i style={{ width: `${((step + 1) / SETUP_STEPS.length) * 100}%` }} /></div>
        <nav className="wk-rail" aria-label="Steps">
          {SETUP_STEPS.map((s, i) => <button key={s.id} type="button" className={i === step ? "on" : i < step ? "done" : undefined} onClick={() => go(i)} aria-current={i === step ? "step" : undefined}><Icon name={s.icon} size={14} />{s.label}</button>)}
        </nav>
      </div>

      <div className={`wk-layout${last ? " full" : ""}`}>
        <div className="wk-panel">
          {id === "work" && <StepWork wp={wp} patch={patch} />}
          {id === "skills" && <StepSkills wp={wp} patch={patch} />}
          {id === "experience" && <StepExperience w={w} />}
          {id === "education" && <StepEducation w={w} />}
          {id === "projects" && <StepProjects />}
          {id === "availability" && <StepAvailability wp={wp} patch={patch} />}
          {id === "about" && <StepAbout wp={wp} patch={patch} />}
          {id === "review" && (
            <>
              <h2>Here&apos;s your work profile</h2>
              <p className="hint">This is how people see it when you apply, and on your profile. {pct < 100 ? `It's ${pct}% complete; you can publish now and add the rest later.` : "Everything's there."}</p>
              <ReviewBody wp={wp} />
            </>
          )}

          <div className="co-flow-foot">
            {step > 0 ? <button type="button" className="kh-btn outline" onClick={() => go(step - 1)}>Back</button> : <span />}
            {!last
              ? <button type="button" className={`kh-btn ${empty[id] ? "outline" : "amber"}`} disabled={can[id] === false} onClick={() => go(step + 1)}>{empty[id] ? "Skip for now" : "Continue"}</button>
              : <button type="button" className="kh-btn amber" disabled={!can.work} onClick={() => { w.publish(); router.push("/profile?published=1"); }}><Icon name="send" size={16} />{wp.publishedAt ? "Save changes" : "Publish my work profile"}</button>}
          </div>
        </div>

        {!last && (
          <aside className="wk-preview" aria-label="Preview">
            <span className="cap">How it looks</span>
            <div className="sheet">
              <PreviewCard wp={wp} projects={pf.pieces} />
            </div>
            <div className="wk-meter static"><span className="bar"><i style={{ width: `${pct}%` }} /></span><span><b>{pct}% complete</b></span></div>
          </aside>
        )}
      </div>
    </div>
  );
}

function ReviewBody({ wp }: { wp: WorkProfile }) {
  const pf = usePortfolio();
  const [open, setOpen] = useState<Piece | null>(null);
  return (
    <>
      <div className="wk-review"><WorkProfileBody wp={wp} projects={pf.pieces} onOpenProject={setOpen} /></div>
      {open && <PieceDetail piece={open} onClose={() => setOpen(null)} />}
    </>
  );
}

function PreviewCard({ wp, projects }: { wp: WorkProfile; projects: Piece[] }) {
  const field = WORK_FIELDS.find((f) => f.id === wp.field);
  return (
    <div className="wk-pv">
      {field && <span className="wk-field-chip"><Icon name={field.icon} size={13} />{field.id}{wp.level ? ` · ${wp.level}` : ""}</span>}
      <b className="h">{wp.headline || <span className="co-muted">Your headline</span>}</b>
      {wp.skills.length > 0 && <div className="wk-tags sm">{wp.skills.slice(0, 6).map((s) => <span key={s}>{s}</span>)}{wp.skills.length > 6 && <span>+{wp.skills.length - 6}</span>}</div>}
      <ul className="wk-pv-counts">
        <li><b>{projects.length}</b> projects</li>
        <li><b>{wp.experience.length}</b> roles</li>
        <li><b>{wp.education.length + wp.certificates.length}</b> qualifications</li>
      </ul>
      {(wp.openTo.length > 0 || wp.rate) && <small className="co-muted">{[wp.openTo.slice(0, 2).join(", "), rateLabel(wp.rate)].filter(Boolean).join(" · ")}</small>}
    </div>
  );
}

type Patch = (p: Partial<WorkProfile>) => void;

function StepWork({ wp, patch }: { wp: WorkProfile; patch: Patch }) {
  return (
    <>
      <h2>What do you do?</h2>
      <p className="hint">Pick the field closest to your work. You can do more than one thing; choose the one you want to be known for.</p>
      <div className="wk-fields" role="radiogroup" aria-label="Field">
        {WORK_FIELDS.map((f) => (
          <button key={f.id} type="button" role="radio" aria-checked={wp.field === f.id} className={wp.field === f.id ? "on" : undefined} onClick={() => patch({ field: f.id })}>
            <span className="ic"><Icon name={f.icon} size={20} /></span><b>{f.id}</b><small>{f.hint}</small>
          </button>
        ))}
      </div>
      <label className="wk-field">
        <span>Your headline <small>{wp.headline.length}/90 · one line people see first</small></span>
        <input value={wp.headline} maxLength={90} onChange={(e) => patch({ headline: e.target.value })} placeholder={HEADLINE_IDEAS[wp.field] ?? "e.g. Caterer for weddings and launches in Abuja"} />
      </label>
      {wp.field && !wp.headline && <button type="button" className="wk-idea" onClick={() => patch({ headline: HEADLINE_IDEAS[wp.field] })}><Icon name="spark" size={14} />Use an example: “{HEADLINE_IDEAS[wp.field]}”</button>}
      <div className="wk-field">
        <span className="l">How experienced are you?</span>
        <div className="co-options" role="radiogroup" aria-label="Experience level">
          {LEVELS.map((l) => <button key={l.id} type="button" role="radio" aria-checked={wp.level === l.id} className={`co-option${wp.level === l.id ? " on" : ""}`} onClick={() => patch({ level: l.id })}><b>{l.id}</b><small>{l.hint}</small></button>)}
        </div>
      </div>
    </>
  );
}

function StepSkills({ wp, patch }: { wp: WorkProfile; patch: Patch }) {
  return (
    <>
      <h2>What are you good at?</h2>
      <p className="hint">Add up to 15 skills. {wp.field ? `Suggestions are for ${wp.field}; search for anything else.` : "Search or type your own."} People and open calls are matched on these.</p>
      <SkillPicker value={wp.skills} onChange={(skills) => patch({ skills })} field={wp.field} />
      {wp.field && SKILLS[wp.field] && wp.skills.length < 3 && <p className="co-muted" style={{ fontSize: 13 }}>Three or more makes your profile easier to find.</p>}
    </>
  );
}

function MonthPicker({ value, onChange, label }: { value?: string; onChange: (v: string) => void; label: string }) {
  const [y, m] = (value ?? "").split("-");
  return (
    <div className="wk-month" role="group" aria-label={label}>
      <select value={m ?? ""} onChange={(e) => onChange(`${y || YEARS[0]}-${e.target.value}`)} aria-label={`${label} month`}>
        <option value="" disabled>Month</option>
        {MONTHS.map((mm, i) => <option key={mm} value={String(i + 1).padStart(2, "0")}>{mm}</option>)}
      </select>
      <select value={y ?? ""} onChange={(e) => onChange(`${e.target.value}-${m || "01"}`)} aria-label={`${label} year`}>
        <option value="" disabled>Year</option>
        {YEARS.map((yy) => <option key={yy} value={yy}>{yy}</option>)}
      </select>
    </div>
  );
}

type W = ReturnType<typeof useWorkProfile>;

function StepExperience({ w }: { w: W }) {
  const { wp } = w;
  const [edit, setEdit] = useState<Partial<Experience> | null>(null);
  const valid = !!edit?.title?.trim() && !!edit?.org?.trim() && !!edit?.from && (edit.current || !!edit.to);
  const save = () => {
    if (!edit || !valid) return;
    const item = { title: edit.title!.trim(), org: edit.org!.trim(), kind: edit.kind ?? "Job", from: edit.from!, to: edit.current ? undefined : edit.to, current: !!edit.current, place: edit.place?.trim() || undefined, summary: edit.summary?.trim() || undefined };
    if (edit.id) w.experience.edit(edit.id, item); else w.experience.add(item);
    w.patch({ noExperience: false });
    setEdit(null);
  };
  return (
    <>
      <h2>Your experience</h2>
      <p className="hint">Jobs count, and so does freelance work, running your own business, volunteering and community roles.</p>
      {wp.experience.length > 0 && (
        <ul className="wk-entries">
          {wp.experience.map((x) => (
            <li key={x.id}>
              <div><b>{x.title}</b><span>{x.org} · {x.kind}</span><small>{monthLabel(x.from)} – {x.current ? "Now" : monthLabel(x.to)}</small></div>
              <button type="button" className="wk-icon" aria-label={`Edit ${x.title}`} onClick={() => setEdit(x)}><Icon name="edit" size={16} /></button>
              <button type="button" className="wk-icon" aria-label={`Remove ${x.title}`} onClick={() => w.experience.remove(x.id)}><Icon name="remove" size={16} /></button>
            </li>
          ))}
        </ul>
      )}
      {edit ? (
        <div className="wk-entry-form">
          <div className="wk-chips" role="radiogroup" aria-label="Kind">{EXPERIENCE_KINDS.map((k) => <button key={k} type="button" role="radio" aria-checked={(edit.kind ?? "Job") === k} className={(edit.kind ?? "Job") === k ? "on" : undefined} onClick={() => setEdit({ ...edit, kind: k })}>{k}</button>)}</div>
          <div className="wk-two even">
            <label className="wk-field"><span>Title</span><input value={edit.title ?? ""} onChange={(e) => setEdit({ ...edit, title: e.target.value })} placeholder="e.g. Head chef, Frontend developer" autoFocus /></label>
            <label className="wk-field"><span>{edit.kind === "Own business" ? "Business name" : "Where"}</span><input value={edit.org ?? ""} onChange={(e) => setEdit({ ...edit, org: e.target.value })} placeholder={edit.kind === "Freelance" ? "Self-employed, or the client" : "Organisation or business"} /></label>
          </div>
          <div className="wk-two even">
            <div className="wk-field"><span className="l">Started</span><MonthPicker value={edit.from} onChange={(from) => setEdit({ ...edit, from })} label="Started" /></div>
            <div className="wk-field"><span className="l">Ended</span>{edit.current ? <p className="co-muted" style={{ margin: "10px 0 0", fontSize: 14 }}>Still doing this</p> : <MonthPicker value={edit.to} onChange={(to) => setEdit({ ...edit, to })} label="Ended" />}</div>
          </div>
          <label className="wk-check"><input type="checkbox" checked={!!edit.current} onChange={(e) => setEdit({ ...edit, current: e.target.checked })} />I still do this</label>
          <label className="wk-field"><span>Place <small>optional</small></span><input value={edit.place ?? ""} onChange={(e) => setEdit({ ...edit, place: e.target.value })} placeholder="e.g. Wuse, Abuja, or Remote" /></label>
          <label className="wk-field"><span>What you did <small>optional</small></span><textarea rows={3} maxLength={400} value={edit.summary ?? ""} onChange={(e) => setEdit({ ...edit, summary: e.target.value })} placeholder="Two lines on what you were responsible for, and anything you're proud of." /></label>
          <div className="wk-row end"><button type="button" className="kh-btn outline" onClick={() => setEdit(null)}>Cancel</button><button type="button" className="kh-btn amber" disabled={!valid} onClick={save}>{edit.id ? "Save" : "Add experience"}</button></div>
        </div>
      ) : (
        <button type="button" className="wk-add-row" onClick={() => setEdit({ kind: "Job" })}><Icon name="upload" size={18} />Add {wp.experience.length ? "another role" : "a role"}</button>
      )}
      {wp.experience.length === 0 && !edit && (
        <label className="wk-check"><input type="checkbox" checked={!!wp.noExperience} onChange={(e) => w.patch({ noExperience: e.target.checked })} />I&apos;m just starting out; my projects show what I can do</label>
      )}
    </>
  );
}

function StepEducation({ w }: { w: W }) {
  const { wp } = w;
  const [edu, setEdu] = useState<Partial<Education> | null>(null);
  const [cert, setCert] = useState<Partial<Certificate> | null>(null);
  return (
    <>
      <h2>Education and certificates</h2>
      <p className="hint">Schools, apprenticeships, courses and certificates. Optional: skip it if your work speaks for itself.</p>
      <h4 className="wk-h4"><Icon name="study" size={16} />Education</h4>
      {wp.education.length > 0 && <ul className="wk-entries">{wp.education.map((e) => <li key={e.id}><div><b>{e.qualification}{e.field ? `, ${e.field}` : ""}</b><span>{e.school}{e.year ? ` · ${e.year}` : ""}</span></div><button type="button" className="wk-icon" aria-label="Remove" onClick={() => w.education.remove(e.id)}><Icon name="remove" size={16} /></button></li>)}</ul>}
      {edu ? (
        <div className="wk-entry-form">
          <label className="wk-field"><span>School, college or programme</span><input value={edu.school ?? ""} onChange={(e) => setEdu({ ...edu, school: e.target.value })} placeholder="e.g. University of Abuja, Yaba Tech, an apprenticeship" autoFocus /></label>
          <div className="wk-two even">
            <label className="wk-field"><span>Qualification</span><input value={edu.qualification ?? ""} onChange={(e) => setEdu({ ...edu, qualification: e.target.value })} placeholder="e.g. BSc, OND, Diploma, WAEC" /></label>
            <label className="wk-field"><span>Subject <small>optional</small></span><input value={edu.field ?? ""} onChange={(e) => setEdu({ ...edu, field: e.target.value })} placeholder="e.g. Computer Science" /></label>
          </div>
          <label className="wk-field" style={{ maxWidth: 160 }}><span>Year finished <small>optional</small></span><input value={edu.year ?? ""} inputMode="numeric" maxLength={4} onChange={(e) => setEdu({ ...edu, year: e.target.value.replace(/\D/g, "") })} /></label>
          <div className="wk-row end"><button type="button" className="kh-btn outline" onClick={() => setEdu(null)}>Cancel</button><button type="button" className="kh-btn amber" disabled={!edu.school?.trim() || !edu.qualification?.trim()} onClick={() => { w.education.add({ school: edu.school!.trim(), qualification: edu.qualification!.trim(), field: edu.field?.trim() || undefined, year: edu.year || undefined }); setEdu(null); }}>Add education</button></div>
        </div>
      ) : <button type="button" className="wk-add-row" onClick={() => setEdu({})}><Icon name="upload" size={18} />Add education</button>}

      <h4 className="wk-h4"><Icon name="verified" size={16} />Certificates and licences</h4>
      {wp.certificates.length > 0 && <ul className="wk-entries">{wp.certificates.map((c) => <li key={c.id}><div><b>{c.name}</b><span>{c.issuer}{c.year ? ` · ${c.year}` : ""}</span></div><button type="button" className="wk-icon" aria-label="Remove" onClick={() => w.certificates.remove(c.id)}><Icon name="remove" size={16} /></button></li>)}</ul>}
      {cert ? (
        <div className="wk-entry-form">
          <div className="wk-two even">
            <label className="wk-field"><span>Name</span><input value={cert.name ?? ""} onChange={(e) => setCert({ ...cert, name: e.target.value })} placeholder="e.g. Food Hygiene Level 2, AWS Cloud Practitioner" autoFocus /></label>
            <label className="wk-field"><span>Issued by</span><input value={cert.issuer ?? ""} onChange={(e) => setCert({ ...cert, issuer: e.target.value })} placeholder="e.g. NAFDAC, Coursera, Red Cross" /></label>
          </div>
          <div className="wk-two">
            <label className="wk-field"><span>Year <small>optional</small></span><input value={cert.year ?? ""} inputMode="numeric" maxLength={4} onChange={(e) => setCert({ ...cert, year: e.target.value.replace(/\D/g, "") })} /></label>
            <label className="wk-field"><span>Link to check it <small>optional</small></span><input value={cert.link ?? ""} inputMode="url" onChange={(e) => setCert({ ...cert, link: e.target.value })} placeholder="A verification link" /></label>
          </div>
          <div className="wk-row end"><button type="button" className="kh-btn outline" onClick={() => setCert(null)}>Cancel</button><button type="button" className="kh-btn amber" disabled={!cert.name?.trim() || !cert.issuer?.trim()} onClick={() => { w.certificates.add({ name: cert.name!.trim(), issuer: cert.issuer!.trim(), year: cert.year || undefined, link: cert.link?.trim() ? (cert.link.startsWith("http") ? cert.link.trim() : `https://${cert.link.trim()}`) : undefined }); setCert(null); }}>Add certificate</button></div>
        </div>
      ) : <button type="button" className="wk-add-row" onClick={() => setCert({})}><Icon name="upload" size={18} />Add a certificate</button>}
    </>
  );
}

function StepProjects() {
  const pf = usePortfolio();
  const [adding, setAdding] = useState(false);
  const [open, setOpen] = useState<Piece | null>(null);
  const [editing, setEditing] = useState<Piece | null>(null);
  return (
    <>
      <h2>Your projects</h2>
      <p className="hint">Work you&apos;ve done, shown the way that suits it: a repo or live app, a case study PDF, a menu, recordings, photos, or a good write-up. Two or three strong ones are enough.</p>
      <div className="wk-grid">
        <button type="button" className="wk-add" onClick={() => setAdding(true)}><span className="ic"><Icon name="upload" size={22} /></span><b>Add a project</b><small>Links, files, photos or a write-up</small></button>
        {pf.pieces.map((p) => <PieceCard key={p.id} piece={p} onOpen={() => setOpen(p)} />)}
      </div>
      {adding && <PieceForm onClose={() => setAdding(false)} />}
      {open && !editing && <PieceDetail piece={open} onClose={() => setOpen(null)} onEdit={() => setEditing(open)} onRemove={() => { pf.remove(open.id); setOpen(null); }} />}
      {editing && <PieceForm piece={editing} onClose={() => { setEditing(null); setOpen(null); }} />}
    </>
  );
}

function Chips({ options, value, onChange, multi }: { options: string[]; value: string[]; onChange: (v: string[]) => void; multi?: boolean }) {
  return (
    <div className="wk-chips" role={multi ? "group" : "radiogroup"}>
      {options.map((o) => {
        const on = value.includes(o);
        return <button key={o} type="button" role={multi ? undefined : "radio"} aria-pressed={multi ? on : undefined} aria-checked={multi ? undefined : on} className={on ? "on" : undefined} onClick={() => onChange(multi ? (on ? value.filter((x) => x !== o) : [...value, o]) : [o])}>{multi && on && "✓ "}{o}</button>;
      })}
    </div>
  );
}

function StepAvailability({ wp, patch }: { wp: WorkProfile; patch: Patch }) {
  const [lang, setLang] = useState("");
  const unit = wp.rate?.unit;
  return (
    <>
      <h2>Availability and rate</h2>
      <p className="hint">So people know what to ask you for. You can change this any time.</p>
      <div className="wk-field"><span className="l">What are you open to?</span><Chips options={OPEN_TO} value={wp.openTo} onChange={(openTo) => patch({ openTo })} multi /></div>
      <div className="wk-field"><span className="l">How much time do you have?</span><Chips options={HOURS} value={wp.hours ? [wp.hours] : []} onChange={([hours]) => patch({ hours })} /></div>
      <div className="wk-two even">
        <div className="wk-field"><span className="l">Where</span><Chips options={["In person", "Remote", "Both"]} value={wp.where ? [wp.where] : []} onChange={([where]) => patch({ where: where as WorkProfile["where"] })} /></div>
        <label className="wk-field"><span>Area <small>optional</small></span><input value={wp.area ?? ""} onChange={(e) => patch({ area: e.target.value })} placeholder="e.g. Wuse, Abuja" /></label>
      </div>
      <div className="wk-field">
        <span className="l">Your rate <small>optional</small></span>
        <div className="wk-chips" role="radiogroup">{RATE_UNITS.map((r) => <button key={r.id} type="button" role="radio" aria-checked={unit === r.id} className={unit === r.id ? "on" : undefined} onClick={() => patch({ rate: { ...wp.rate, unit: r.id } })}>{r.label}</button>)}</div>
        {unit && unit !== "negotiable" && unit !== "unpaid" && (
          <div className="wk-money"><span>₦</span><input value={wp.rate?.amount ? wp.rate.amount.toLocaleString("en-NG") : ""} inputMode="numeric" onChange={(e) => patch({ rate: { unit, amount: Number(e.target.value.replace(/\D/g, "")) || undefined } })} placeholder="0" aria-label="Amount in naira" /><em>per {unit}</em></div>
        )}
      </div>
      <div className="wk-field">
        <span className="l">Languages you work in</span>
        <Chips options={[...new Set([...LANGS, ...wp.languages])]} value={wp.languages} onChange={(languages) => patch({ languages })} multi />
        <div className="co-link-add" style={{ maxWidth: 320 }}><input value={lang} onChange={(e) => setLang(e.target.value)} placeholder="Another language" aria-label="Another language" onKeyDown={(e) => { if (e.key === "Enter" && lang.trim()) { e.preventDefault(); patch({ languages: [...new Set([...wp.languages, lang.trim()])] }); setLang(""); } }} /><button type="button" className="kh-btn outline sm" disabled={!lang.trim()} onClick={() => { patch({ languages: [...new Set([...wp.languages, lang.trim()])] }); setLang(""); }}>Add</button></div>
      </div>
    </>
  );
}

function StepAbout({ wp, patch }: { wp: WorkProfile; patch: Patch }) {
  const [err, setErr] = useState("");
  const pickCv = (fs: File[]) => {
    const f = fs[0];
    if (!f) return;
    if (!accepts(f, ".pdf,.doc,.docx")) return setErr("Send your CV as a PDF or a Word document.");
    if (f.size > MAX_BYTES) return setErr("That file is over 5 MB. A PDF export is usually much smaller.");
    setErr(""); patch({ cv: toProof(f, "cv") });
  };
  return (
    <>
      <h2>About you, links and CV</h2>
      <p className="hint">A short intro in your own words, the places your work lives online, and your CV if you have one.</p>
      <label className="wk-field">
        <span>About you <small>{wp.about.length}/1200</small></span>
        <textarea rows={6} maxLength={1200} value={wp.about} onChange={(e) => patch({ about: e.target.value })} placeholder={"What do you do, and who for?\nHow do you like to work?\nWhat are you looking for on Akines?"} />
      </label>
      <div className="wk-field"><span className="l">Links <small>LinkedIn, GitHub, Behance, Instagram, your website</small></span><LinkAdder links={wp.links} onChange={(links) => patch({ links })} placeholder="Paste a link to your profile or website" /></div>
      <div className="wk-field">
        <span className="l">CV or résumé <small>optional</small></span>
        {wp.cv ? <ul className="co-items"><FileRow f={wp.cv} onRemove={() => patch({ cv: undefined })} /></ul> : <Drop accept=".pdf,.doc,.docx" label="Upload your CV" sub="PDF or Word, up to 5 MB. It's attached for you when you apply." onFiles={pickCv} />}
        {err && <p className="co-err" role="alert">{err}</p>}
      </div>
    </>
  );
}
