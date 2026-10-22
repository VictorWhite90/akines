"use client";

import { useState } from "react";
import { CIRCLE_AGREEMENTS, CIRCLE_KINDS, type CircleInput, type SmallCircle } from "@/lib/api/community";
import Sheet from "./Sheet";
import KindIcon from "./KindIcon";

const STEPS = ["Kind", "Name", "People", "Agree"] as const;

/** Start a small circle in four short steps, or (with `circle`) edit one you host, jumping to any step. */
export default function CircleForm({ communityName, circle, onSave, onClose }: {
  communityName: string;
  circle?: SmallCircle;
  onSave: (input: CircleInput) => Promise<{ ok: true } | { ok: false; message: string; field?: string }>;
  onClose: () => void;
}) {
  const editing = !!circle;
  const [step, setStep] = useState(editing ? 1 : 0);
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
  const kind = CIRCLE_KINDS.find((k) => k.value === f.kind)!;
  const extra = f.agreements.filter((a) => !CIRCLE_AGREEMENTS.includes(a));
  const nameOk = f.name.trim().length >= 3;
  const last = step === STEPS.length - 1;

  const toggleAgreement = (line: string) =>
    setF((d) => ({ ...d, agreements: d.agreements.includes(line) ? d.agreements.filter((x) => x !== line) : [...d.agreements, line].slice(0, 5) }));
  const addOwn = () => {
    const line = own.trim();
    if (!line || f.agreements.includes(line) || f.agreements.length >= 5) return;
    setF((d) => ({ ...d, agreements: [...d.agreements, line] }));
    setOwn("");
  };

  const go = (to: number) => {
    if (to > 1 && !nameOk) {
      setStep(1);
      return setError({ text: "Give the circle a name of 3 to 60 characters.", field: "name" });
    }
    setError(null);
    setStep(to);
  };

  const save = async () => {
    if (!nameOk) return go(2);
    setBusy(true);
    setError(null);
    const r = await onSave({ ...f, name: f.name.trim(), purpose: f.purpose.trim() });
    setBusy(false);
    if (!r.ok) {
      setError({ text: r.message, field: r.field });
      if (r.field === "name" || r.field === "purpose") setStep(1);
    }
  };

  return (
    <Sheet title={editing ? "Edit circle" : "Start a small circle"} sub={editing ? undefined : `Inside ${communityName}`} onClose={onClose}>
      <div className="sc-wiz">
        <ol className="sc-steps" aria-label="Steps">
          {STEPS.map((label, i) => (
            <li key={label} className={i === step ? "on" : i < step ? "done" : undefined}>
              <button type="button" onClick={() => (editing || i < step) && go(i)} disabled={!editing && i > step} aria-current={i === step ? "step" : undefined}>
                <i>{i < step && !editing ? "✓" : i + 1}</i><span>{label}</span>
              </button>
            </li>
          ))}
        </ol>

        <form className="sc-step" onSubmit={(e) => { e.preventDefault(); if (last || editing) void save(); else go(step + 1); }} noValidate>
          {step === 0 && (
            <>
              <h3>What brings this circle together?</h3>
              <div className="sc-kinds" role="radiogroup" aria-label="Kind of circle">
                {CIRCLE_KINDS.map((k) => (
                  <button type="button" role="radio" aria-checked={f.kind === k.value} key={k.value} className={f.kind === k.value ? "on" : undefined} onClick={() => setF((d) => ({ ...d, kind: k.value }))}>
                    <span aria-hidden><KindIcon kind={k.value} size={16} /></span>
                    <b>{k.label.replace(" circle", "")}</b>
                    <small>{k.body}</small>
                  </button>
                ))}
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <h3>Name your {kind.label.toLowerCase()}</h3>
              <div className="cm-field">
                <label htmlFor="sc-name">Name</label>
                <input id="sc-name" value={f.name} maxLength={60} onChange={(e) => setF((d) => ({ ...d, name: e.target.value }))} placeholder="e.g. Sunday Football Five" aria-invalid={error?.field === "name"} autoFocus />
              </div>
              <div className="cm-field">
                <label htmlFor="sc-purpose">What&apos;s it for? <small>optional</small></label>
                <textarea id="sc-purpose" rows={3} maxLength={500} value={f.purpose} onChange={(e) => setF((d) => ({ ...d, purpose: e.target.value }))} placeholder="When you meet and what you'll do, so people know if it's for them." aria-invalid={error?.field === "purpose"} />
                <small className="sc-count">{f.purpose.length}/500</small>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h3>How big, and who can join?</h3>
              <div className="cm-field">
                <span className="sc-l" id="sc-size-l">People, including you</span>
                <div className="sc-size" role="radiogroup" aria-labelledby="sc-size-l">
                  {[3, 4, 5, 6, 7, 8].map((n) => (
                    <button type="button" key={n} role="radio" aria-checked={f.capacity === n} className={f.capacity === n ? "on" : undefined} disabled={n < minSize} onClick={() => setF((d) => ({ ...d, capacity: n }))}>{n}</button>
                  ))}
                </div>
                <small>Small on purpose, so everyone gets to talk.</small>
              </div>
              <div className="sc-modes" role="radiogroup" aria-label="Who can join">
                <button type="button" role="radio" aria-checked={f.join_mode === "open"} className={f.join_mode === "open" ? "on" : undefined} onClick={() => setF((d) => ({ ...d, join_mode: "open" }))}>
                  <b>Any member</b><small>Anyone in {communityName} can join while there&apos;s a seat.</small>
                </button>
                <button type="button" role="radio" aria-checked={f.join_mode === "invite"} className={f.join_mode === "invite" ? "on" : undefined} onClick={() => setF((d) => ({ ...d, join_mode: "invite" }))}>
                  <b>Invite only</b><small>Only people someone in the circle invites.</small>
                </button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h3>What will you agree on?</h3>
              <p className="sc-hint">People see these before they join. Pick up to 5.</p>
              <div className="sc-agree">
                {[...CIRCLE_AGREEMENTS, ...extra].map((line) => (
                  <label key={line} className={f.agreements.includes(line) ? "on" : undefined}>
                    <input type="checkbox" checked={f.agreements.includes(line)} onChange={() => toggleAgreement(line)} /> <span>{line}</span>
                  </label>
                ))}
              </div>
              {f.agreements.length < 5 && (
                <div className="sc-own">
                  <input value={own} maxLength={200} onChange={(e) => setOwn(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addOwn(); } }} placeholder="Add your own" aria-label="Add an agreement" />
                  <button type="button" className="kh-btn outline sm" onClick={addOwn} disabled={!own.trim()}>Add</button>
                </div>
              )}
              {!editing && (
                <div className="sc-review">
                  <span className="sc-kind"><KindIcon kind={kind.value} size={14} />{kind.label}</span>
                  <b>{f.name.trim() || "Untitled circle"}</b>
                  <small>{f.capacity} people · {f.join_mode === "open" ? "any member can join" : "invite only"}</small>
                </div>
              )}
            </>
          )}

          {error && <p className="st-notice bad" role="alert">{error.text}</p>}

          <footer className="sc-foot">
            {editing ? (
              <>
                <button type="button" className="kh-btn outline" onClick={onClose}>Cancel</button>
                <button type="submit" className="kh-btn amber" disabled={busy}>{busy ? "Saving…" : "Save changes"}</button>
              </>
            ) : (
              <>
                {step > 0 ? <button type="button" className="kh-btn outline" onClick={() => go(step - 1)}>Back</button> : <span />}
                <button type="submit" className="kh-btn amber" disabled={busy || (step === 1 && !nameOk)}>{last ? (busy ? "Starting…" : "Start circle") : "Continue"}</button>
              </>
            )}
          </footer>
        </form>
      </div>
    </Sheet>
  );
}
