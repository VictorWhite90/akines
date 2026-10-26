"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Pic from "@/components/home/Pic";
import BackLink from "@/components/ui/BackLink";
import Icon from "@/components/ui/Icon";
import { FIELDS, type CallMaterial, type CollabCall, type Field } from "@/lib/collab/types";
import { useCollab } from "@/lib/collab/useCollab";
import type { PhotoKey } from "@/lib/data/images";
import { CallCard } from "./parts";

const STEPS = ["Basics", "Who you need", "Fair terms", "Timeline", "Publish"] as const;
const COVERS: PhotoKey[] = ["talkGroup", "studioBusy", "paintingDancers", "talkCafe", "textileHang", "talkYoung", "journalOpen", "beadsShop"];
const MATERIALS: CallMaterial[] = [
  { id: "works", label: "Up to three pieces of their work", hint: "Chosen from their work on Akines.", required: true },
  { id: "why", label: "Why this, and why them", hint: "A short note written for your call.", required: true },
  { id: "availability", label: "Their availability", hint: "For the dates in your timeline.", required: true },
  { id: "idea", label: "A rough idea or sketch", hint: "Optional.", required: false },
];

/** Posting a structured open call (S2): every field an applicant needs, up front. */
export default function PostCall() {
  const co = useCollab({ engine: true });
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [f, setF] = useState({
    title: "", org: "", orgKind: "Community", city: "Abuja", where: "In person" as CollabCall["where"], fields: [] as Field[], photo: COVERS[0],
    summary: "", about: "", roles: [] as string[], role: "", teamSize: 3, level: "Any level",
    fee: "", rights: "Everyone is credited. You can each show your part anywhere.", selection: "I read every application. Shortlisted people get a 20-minute conversation, and everyone hears back.",
    timeline: [{ label: "Applications close", when: "" }, { label: "Work starts", when: "" }, { label: "Finished", when: "" }],
    materials: MATERIALS.filter((m) => m.required).map((m) => m.id),
  });
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((x) => ({ ...x, [k]: v }));
  const addRole = () => { const r = f.role.trim(); if (r && !f.roles.includes(r)) setF((x) => ({ ...x, roles: [...x.roles, r], role: "" })); };

  const can = [
    f.title.trim().length >= 5 && f.org.trim().length >= 2 && f.summary.trim().length >= 10 && f.fields.length > 0,
    f.roles.length > 0,
    f.fee.trim().length > 0 && f.rights.trim().length > 0,
    f.timeline.every((t) => t.label.trim() && t.when.trim()),
    true,
  ];
  const draft: CollabCall = {
    id: "preview", title: f.title || "Your call's title", host: "amara", org: f.org || "Your organisation", orgKind: f.orgKind, city: f.city, where: f.where, photo: f.photo,
    summary: f.summary || "One line on what you're making.", about: f.about, roles: f.roles.length ? f.roles : ["A role"], fields: f.fields.length ? f.fields : ["Community"],
    level: f.level, fee: f.fee || "Fee", rights: f.rights, selection: f.selection, teamSize: f.teamSize, materials: MATERIALS.filter((m) => f.materials.includes(m.id)),
    timeline: f.timeline, closesInDays: 14, verified: false, postedByMe: true,
  };
  const publish = () => {
    const id = co.postCall({
      title: f.title.trim(), org: f.org.trim(), orgKind: f.orgKind, city: f.city.trim(), where: f.where, photo: f.photo, summary: f.summary.trim(),
      about: f.about.trim() || f.summary.trim(), roles: f.roles, fields: f.fields, level: f.level, fee: f.fee.trim(), rights: f.rights.trim(),
      selection: f.selection.trim(), teamSize: f.teamSize, materials: draft.materials, timeline: f.timeline, closesInDays: 14,
    });
    router.push(`/collaborate/review/${id}?posted=1`);
  };

  return (
    <div className="kh co">
      <BackLink fallback="/collaborate" className="co-link">← Collaborate</BackLink>
      <div className="co-flow">
        <div>
          <nav className="co-steps" style={{ ["--n" as string]: STEPS.length } as React.CSSProperties} aria-label="Steps">
            {STEPS.map((s, i) => <button key={s} className={i === step ? "on" : i < step ? "done" : undefined} disabled={i > step} onClick={() => setStep(i)}>{s}</button>)}
          </nav>
          <div className="co-panel">
            {step === 0 && (
              <>
                <h2>What are you making?</h2>
                <p className="hint">The basics people see first.</p>
                <div className="co-field"><label htmlFor="pc-t">Title</label><input id="pc-t" value={f.title} maxLength={80} onChange={(e) => set("title", e.target.value)} placeholder="e.g. A mural for the Jabi Lake walk" /></div>
                <div className="co-field"><label htmlFor="pc-s">In one line</label><input id="pc-s" value={f.summary} maxLength={140} onChange={(e) => set("summary", e.target.value)} placeholder="What will exist when you're done?" /></div>
                <div className="co-field"><label htmlFor="pc-a">More about it <small>optional</small></label><textarea id="pc-a" value={f.about} maxLength={900} onChange={(e) => set("about", e.target.value)} placeholder="Why it matters, who it's for, what's already in place." /></div>
                <div className="co-two-fields">
                  <div className="co-field"><label htmlFor="pc-o">Posted for</label><input id="pc-o" value={f.org} onChange={(e) => set("org", e.target.value)} placeholder="Your organisation, community or name" /></div>
                  <div className="co-field"><label htmlFor="pc-k">Which is a</label><select id="pc-k" value={f.orgKind} onChange={(e) => set("orgKind", e.target.value)}>{["Community", "Small business", "Non-profit", "School or university", "Company", "Just me"].map((k) => <option key={k}>{k}</option>)}</select></div>
                </div>
                <div className="co-two-fields">
                  <div className="co-field"><label htmlFor="pc-c">City</label><input id="pc-c" value={f.city} onChange={(e) => set("city", e.target.value)} /></div>
                  <div className="co-field"><span className="l">Where the work happens</span><div className="co-filters">{(["In person", "Hybrid", "Remote"] as const).map((w) => <button key={w} type="button" className={f.where === w ? "on" : undefined} onClick={() => set("where", w)}>{w}</button>)}</div></div>
                </div>
                <div className="co-field"><span className="l">Field</span><div className="co-filters" style={{ flexWrap: "wrap" }}>{FIELDS.map((x) => <button key={x} type="button" className={f.fields.includes(x) ? "on" : undefined} aria-pressed={f.fields.includes(x)} onClick={() => set("fields", f.fields.includes(x) ? f.fields.filter((y) => y !== x) : [...f.fields, x])}>{x}</button>)}</div></div>
                <div className="co-field">
                  <span className="l">Cover image</span>
                  <div className="co-works" style={{ gridTemplateColumns: "repeat(4, minmax(0, 1fr))" }}>
                    {COVERS.map((c) => <button key={c} type="button" className={`co-work${f.photo === c ? " on" : ""}`} onClick={() => set("photo", c)} aria-pressed={f.photo === c}><span className="ph"><Pic name={c} sizes="140px" />{f.photo === c && <span className="tick">✓</span>}</span></button>)}
                  </div>
                </div>
              </>
            )}
            {step === 1 && (
              <>
                <h2>Who do you need?</h2>
                <p className="hint">Each role becomes something people can apply for.</p>
                <div className="co-field">
                  <label htmlFor="pc-r">Roles</label>
                  <div className="co-inline-form">
                    <input id="pc-r" value={f.role} onChange={(e) => set("role", e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addRole(); } }} placeholder="e.g. Photographer, Developer, Cook" />
                    <button type="button" className="kh-btn outline sm" onClick={addRole} disabled={!f.role.trim()}>Add</button>
                  </div>
                  {f.roles.length > 0 && <div className="co-tagset" style={{ marginTop: 6 }}>{f.roles.map((r) => <button key={r} type="button" className="on" onClick={() => set("roles", f.roles.filter((x) => x !== r))} aria-label={`Remove ${r}`}>{r} ×</button>)}</div>}
                </div>
                <div className="co-two-fields">
                  <div className="co-field"><label htmlFor="pc-n">Team size, including you</label><input id="pc-n" type="number" min={2} max={20} value={f.teamSize} onChange={(e) => set("teamSize", Math.max(2, Math.min(20, Number(e.target.value) || 2)))} /></div>
                  <div className="co-field"><label htmlFor="pc-l">Experience</label><select id="pc-l" value={f.level} onChange={(e) => set("level", e.target.value)}>{["Any level", "Some experience", "Two or more finished projects", "Experienced professionals"].map((l) => <option key={l}>{l}</option>)}</select></div>
                </div>
              </>
            )}
            {step === 2 && (
              <>
                <h2>Fair terms, up front</h2>
                <p className="hint">People decide whether to apply from these, so be specific. They become the starting point of the project&apos;s charter.</p>
                <div className="co-field"><label htmlFor="pc-f">Fee</label><input id="pc-f" value={f.fee} onChange={(e) => set("fee", e.target.value)} placeholder="e.g. ₦250,000 per person · or Volunteer, transport covered" /></div>
                <div className="co-field"><label htmlFor="pc-g">Rights: what you may use, and what they keep</label><textarea id="pc-g" value={f.rights} onChange={(e) => set("rights", e.target.value)} /></div>
                <div className="co-field"><label htmlFor="pc-h">How you&apos;ll choose</label><textarea id="pc-h" value={f.selection} onChange={(e) => set("selection", e.target.value)} /></div>
              </>
            )}
            {step === 3 && (
              <>
                <h2>Timeline and what to send</h2>
                {f.timeline.map((t, i) => (
                  <div key={i} className="co-two-fields">
                    <div className="co-field"><label htmlFor={`pc-tl${i}`}>Step</label><input id={`pc-tl${i}`} value={t.label} onChange={(e) => set("timeline", f.timeline.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))} /></div>
                    <div className="co-field"><label htmlFor={`pc-tw${i}`}>When</label><input id={`pc-tw${i}`} value={t.when} onChange={(e) => set("timeline", f.timeline.map((x, j) => (j === i ? { ...x, when: e.target.value } : x)))} placeholder="e.g. 20 Nov" /></div>
                  </div>
                ))}
                <button type="button" className="co-link" style={{ border: 0, background: "none", padding: 0, justifySelf: "start" }} onClick={() => set("timeline", [...f.timeline, { label: "", when: "" }])}>+ Add a step</button>
                <div className="co-field">
                  <span className="l">Ask applicants for</span>
                  <ul className="co-checklist">
                    {MATERIALS.map((m) => (
                      <li key={m.id}>
                        <input type="checkbox" checked={f.materials.includes(m.id)} disabled={m.id === "why"} onChange={() => set("materials", f.materials.includes(m.id) ? f.materials.filter((x) => x !== m.id) : [...f.materials, m.id])} style={{ marginTop: 3, accentColor: "var(--co)" }} aria-label={m.label} />
                        <span>{m.label}<small>{m.hint}</small></span>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}
            {step === 4 && (
              <>
                <h2>Ready to publish</h2>
                <p className="hint">Your call appears in Open calls. Applications arrive on your review desk, and you&apos;re notified for each one.</p>
                <ul className="co-checklist">
                  <li><i aria-hidden>✓</i><span><b style={{ fontWeight: 600 }}>{f.roles.length} {f.roles.length === 1 ? "role" : "roles"}</b><small>{f.roles.join(", ")}</small></span></li>
                  <li><i aria-hidden>✓</i><span><b style={{ fontWeight: 600 }}>{f.fee}</b><small>{f.rights}</small></span></li>
                  <li><i aria-hidden>✓</i><span><b style={{ fontWeight: 600 }}>{f.timeline.length} timeline steps</b><small>{f.timeline.map((t) => `${t.label}: ${t.when}`).join(" · ")}</small></span></li>
                </ul>
              </>
            )}
            <div className="co-flow-foot">
              {step > 0 ? <button className="kh-btn outline" onClick={() => setStep(step - 1)}>Back</button> : <span />}
              {step < STEPS.length - 1
                ? <button className="kh-btn amber" disabled={!can[step]} onClick={() => setStep(step + 1)}>Continue</button>
                : <button className="kh-btn amber" onClick={publish}><Icon name="spark" size={16} />Publish the call</button>}
            </div>
          </div>
        </div>
        <aside className="co-preview" aria-label="Preview">
          <span className="cap">How it looks in Open calls</span>
          <div style={{ pointerEvents: "none" }}><CallCard call={draft} /></div>
        </aside>
      </div>
    </div>
  );
}
