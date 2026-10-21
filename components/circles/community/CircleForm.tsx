"use client";

import { useState } from "react";
import { CIRCLE_AGREEMENTS, CIRCLE_KINDS, type CircleInput, type SmallCircle } from "@/lib/api/community";
import Sheet from "./Sheet";

/** Start a small circle, or (with `circle`) edit one you host. */
export default function CircleForm({ communityName, circle, onSave, onClose }: {
  communityName: string;
  circle?: SmallCircle;
  onSave: (input: CircleInput) => Promise<{ ok: true } | { ok: false; message: string; field?: string }>;
  onClose: () => void;
}) {
  const [f, setF] = useState<Required<CircleInput>>({
    name: circle?.name ?? "",
    purpose: circle?.purpose ?? "",
    kind: circle?.kind ?? "friendship",
    join_mode: circle?.join_mode ?? "open",
    capacity: circle?.capacity ?? 6,
    agreements: circle?.agreements ?? CIRCLE_AGREEMENTS.slice(0, 2),
  });
  const [own, setOwn] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<{ text: string; field?: string } | null>(null);
  const minSize = Math.max(3, circle?.member_count ?? 1);
  const extra = f.agreements.filter((a) => !CIRCLE_AGREEMENTS.includes(a));

  const toggleAgreement = (line: string) =>
    setF((d) => ({ ...d, agreements: d.agreements.includes(line) ? d.agreements.filter((x) => x !== line) : [...d.agreements, line].slice(0, 5) }));
  const addOwn = () => {
    const line = own.trim();
    if (!line || f.agreements.includes(line) || f.agreements.length >= 5) return;
    setF((d) => ({ ...d, agreements: [...d.agreements, line] }));
    setOwn("");
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (f.name.trim().length < 3) return setError({ text: "Give the circle a name of 3 to 60 characters.", field: "name" });
    setBusy(true);
    setError(null);
    const r = await onSave({ ...f, name: f.name.trim(), purpose: f.purpose.trim() });
    setBusy(false);
    if (!r.ok) setError({ text: r.message, field: r.field });
  };

  return (
    <Sheet title={circle ? "Edit circle" : "Start a small circle"} sub={circle ? undefined : `3 to 8 people from ${communityName}, with one purpose and their own group chat.`} onClose={onClose} wide>
      <form className="cm-form sc-form" onSubmit={submit} noValidate>
        <fieldset className="cm-field">
          <legend>What kind of circle?</legend>
          <div className="sc-kinds">
            {CIRCLE_KINDS.map((k) => (
              <button type="button" key={k.value} className={f.kind === k.value ? "on" : undefined} aria-pressed={f.kind === k.value} onClick={() => setF((d) => ({ ...d, kind: k.value }))}>
                <span aria-hidden>{k.glyph}</span><b>{k.label}</b><small>{k.body}</small>
              </button>
            ))}
          </div>
        </fieldset>

        <div className="cm-field">
          <label htmlFor="sc-name">Name</label>
          <input id="sc-name" value={f.name} maxLength={60} onChange={(e) => setF((d) => ({ ...d, name: e.target.value }))} placeholder="e.g. Sunday Football Five" aria-invalid={error?.field === "name"} autoFocus={!circle} />
        </div>
        <div className="cm-field">
          <label htmlFor="sc-purpose">What&apos;s it for? <small>optional</small></label>
          <textarea id="sc-purpose" rows={3} maxLength={500} value={f.purpose} onChange={(e) => setF((d) => ({ ...d, purpose: e.target.value }))} placeholder="A sentence or two, so people know if it's for them. When you meet, what you'll do." aria-invalid={error?.field === "purpose"} />
        </div>

        <div className="sc-two">
          <div className="cm-field">
            <span className="sc-l" id="sc-size-l">How many people, including you?</span>
            <div className="sc-size" role="radiogroup" aria-labelledby="sc-size-l">
              {[3, 4, 5, 6, 7, 8].map((n) => (
                <button type="button" key={n} role="radio" aria-checked={f.capacity === n} className={f.capacity === n ? "on" : undefined} disabled={n < minSize} onClick={() => setF((d) => ({ ...d, capacity: n }))}>{n}</button>
              ))}
            </div>
            <small>Small on purpose: everyone gets to talk.</small>
          </div>
          <div className="cm-field">
            <span className="sc-l" id="sc-mode-l">Who can join?</span>
            <div className="cm-seg" role="radiogroup" aria-labelledby="sc-mode-l">
              <button type="button" role="radio" aria-checked={f.join_mode === "open"} className={f.join_mode === "open" ? "on" : undefined} onClick={() => setF((d) => ({ ...d, join_mode: "open" }))}>Any member</button>
              <button type="button" role="radio" aria-checked={f.join_mode === "invite"} className={f.join_mode === "invite" ? "on" : undefined} onClick={() => setF((d) => ({ ...d, join_mode: "invite" }))}>Invite only</button>
            </div>
            <small>{f.join_mode === "open" ? `Anyone in ${communityName} can join while there's a seat.` : "Only people someone in the circle invites."}</small>
          </div>
        </div>

        <fieldset className="cm-field">
          <legend>What you agree on <small>shown to everyone before they join</small></legend>
          <div className="sc-agree">
            {[...CIRCLE_AGREEMENTS, ...extra].map((line) => (
              <label key={line}><input type="checkbox" checked={f.agreements.includes(line)} onChange={() => toggleAgreement(line)} /> {line}</label>
            ))}
          </div>
          {f.agreements.length < 5 && (
            <div className="sc-own">
              <input value={own} maxLength={200} onChange={(e) => setOwn(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addOwn(); } }} placeholder="Add your own, e.g. Phones away during the match" aria-label="Add an agreement" />
              <button type="button" className="kh-btn outline sm" onClick={addOwn} disabled={!own.trim()}>Add</button>
            </div>
          )}
        </fieldset>

        {error && <p className="st-notice bad" role="alert">{error.text}</p>}
        <button className="kh-btn amber cm-submit" type="submit" disabled={busy}>{busy ? (circle ? "Saving…" : "Starting…") : circle ? "Save changes" : "Start circle"}</button>
      </form>
    </Sheet>
  );
}
