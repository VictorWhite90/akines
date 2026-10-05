"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Avatar from "@/components/ui/Avatar";
import { allPeople, ME, type PersonId } from "@/lib/data/people";
import { newId, useLocal } from "@/lib/useLocal";

export type CircleType = { id: string; label: string; glyph: string; body: string };
export const CIRCLE_TYPES: CircleType[] = [
  { id: "creative", label: "Creative Circle", glyph: "✦", body: "Make art, stories or new ideas together." },
  { id: "friendship", label: "Friendship Circle", glyph: "♡", body: "Create shared experiences that can grow into friendship." },
  { id: "project", label: "Project Circle", glyph: "◇", body: "Bring complementary people around a defined outcome." },
  { id: "mentorship", label: "Mentorship Circle", glyph: "◎", body: "Learn, guide and grow through clear goals." },
  { id: "support", label: "Support Circle", glyph: "◌", body: "Share experience and encouragement safely." },
  { id: "family", label: "Family Circle", glyph: "⌂", body: "Preserve stories, presence and mutual care." },
];

const AGREEMENTS = [
  "We show up as ourselves, not a performance.",
  "What's shared here stays with this circle.",
  "We check in on how this is going, not just what we're making.",
];

const STEPS = [
  { label: "Circle type", hint: "Choose the intention" },
  { label: "Purpose", hint: "Name what matters" },
  { label: "People", hint: "Find complementary humans" },
  { label: "Agreement", hint: "Set expectations" },
  { label: "Preview", hint: "Invite with clarity" },
] as const;

export type KinCircleDraft = {
  type: string;
  name: string;
  purpose: string;
  invitees: PersonId[];
  agreements: string[];
};

export type SavedKinCircle = KinCircleDraft & { id: string; createdAt: string };

const invitable = allPeople.filter((p) => p.id !== ME.id);

export default function CreateKinCircle() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<KinCircleDraft>({ type: "creative", name: "", purpose: "", invitees: [], agreements: [AGREEMENTS[0], AGREEMENTS[1]] });
  const [, setSaved] = useLocal<SavedKinCircle[]>("ak:kincircles", []);

  const typeInfo = CIRCLE_TYPES.find((t) => t.id === draft.type)!;
  const last = step === STEPS.length - 1;
  const canContinue = step === 1 ? draft.name.trim().length > 0 : true;

  const toggleInvitee = (id: PersonId) =>
    setDraft((d) => ({ ...d, invitees: d.invitees.includes(id) ? d.invitees.filter((x) => x !== id) : [...d.invitees, id] }));
  const toggleAgreement = (line: string) =>
    setDraft((d) => ({ ...d, agreements: d.agreements.includes(line) ? d.agreements.filter((x) => x !== line) : [...d.agreements, line] }));

  const create = () => {
    const circle: SavedKinCircle = { ...draft, id: newId("kc"), createdAt: new Date().toISOString() };
    setSaved((cur) => [circle, ...cur]);
    router.push("/circles#my-kincircles");
  };

  return (
    <div className="flex min-h-screen flex-col bg-paper-100">
      <div className="flex items-center gap-5 px-6 py-5 sm:px-10">
        <Link href="/" className="font-display text-[20px] text-ink-950">Akines</Link>
        <Link href="/circles" className="text-[13px] text-mute hover:text-ink-950">Exit</Link>
      </div>

      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center overflow-hidden px-0 py-6 sm:px-6 sm:py-10">
      <div className="flex w-full flex-col overflow-hidden sm:flex-row sm:rounded-[28px] sm:shadow-[var(--shadow-lift)]">
        {/* Left rail */}
        <aside className="flex-none bg-ink-950 px-6 py-8 sm:w-[300px] sm:px-8 sm:py-10">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-bold tracking-[1.5px] text-ochre-300 uppercase">
            <span className="h-[6px] w-[6px] rounded-full bg-ochre-400" /> New KinCircle
          </span>
          <h1 className="font-display mt-4 text-[26px] leading-[1.1] font-semibold text-white">Create your KinCircle</h1>
          <p className="mt-2 text-[13px] leading-relaxed text-white/60">Five thoughtful choices turn a group into a purposeful relationship journey.</p>

          <ol className="mt-7 flex flex-col gap-1">
            {STEPS.map((s, i) => (
              <li key={s.label} className={`flex items-center gap-3 rounded-xl px-2.5 py-2 ${i === step ? "bg-white/10" : ""}`}>
                <span className={`grid h-6 w-6 flex-none place-items-center rounded-full text-[11px] font-bold ${i === step ? "bg-ochre-400 text-ink-950" : i < step ? "bg-white/25 text-white" : "border border-white/25 text-white/50"}`}>
                  {i < step ? "✓" : i + 1}
                </span>
                <span>
                  <span className={`block text-[13.5px] font-semibold ${i === step ? "text-white" : i < step ? "text-white/80" : "text-white/45"}`}>{s.label}</span>
                  <span className={`block text-[11px] ${i === step ? "text-white/60" : "text-white/35"}`}>{s.hint}</span>
                </span>
              </li>
            ))}
          </ol>

          <p className="mt-7 border-t border-white/10 pt-5 text-[11.5px] leading-relaxed text-white/45">
            ◇ Everyone sees why they were invited and chooses what Akines may remember. Private reflections stay private.
          </p>
        </aside>

        {/* Content */}
        <div className="flex min-h-[560px] flex-1 flex-col bg-paper-50 px-6 py-8 sm:px-12 sm:py-10">
          <div className="h-1 w-full overflow-hidden rounded-full bg-paper-200">
            <div className="h-full rounded-full bg-gradient-to-r from-ochre-400 to-clay-400 transition-all duration-300" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
          </div>

          <div className="mt-8 flex-1">
            {step === 0 && (
              <>
                <h2 className="font-display text-[26px] font-semibold sm:text-[30px]">What kind of circle are you creating?</h2>
                <p className="mt-2 text-[14px] text-mute">Choose the intention that best describes why people should come together.</p>
                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  {CIRCLE_TYPES.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setDraft((d) => ({ ...d, type: t.id }))}
                      className={`flex flex-col items-start gap-2.5 rounded-2xl border p-4 text-left transition ${draft.type === t.id ? "border-ochre-400 bg-ochre-200/25 ring-1 ring-ochre-400" : "border-line bg-white hover:border-ink-300"}`}
                    >
                      <span className="grid h-8 w-8 place-items-center rounded-lg bg-paper-200 text-[15px]">{t.glyph}</span>
                      <span className="text-[14.5px] font-semibold text-ink-950">{t.label}</span>
                      <span className="text-[12.5px] leading-snug text-mute">{t.body}</span>
                    </button>
                  ))}
                </div>
              </>
            )}

            {step === 1 && (
              <>
                <h2 className="font-display text-[26px] font-semibold sm:text-[30px]">Name what matters.</h2>
                <p className="mt-2 text-[14px] text-mute">Give your {typeInfo.label.toLowerCase()} a name and say why it exists.</p>
                <div className="mt-6 flex max-w-lg flex-col gap-5">
                  <label className="flex flex-col gap-1.5">
                    <span className="text-[13px] font-semibold text-ink-950">Circle name</span>
                    <input value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} placeholder="e.g. The Indigo Table" className="rounded-xl border border-line bg-white px-4 py-3 text-[14px] outline-none focus:border-ink-500" />
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className="text-[13px] font-semibold text-ink-950">What&rsquo;s this circle for? <small className="font-normal text-mute">optional</small></span>
                    <textarea value={draft.purpose} onChange={(e) => setDraft((d) => ({ ...d, purpose: e.target.value }))} rows={4} placeholder="A couple of sentences on the purpose you're gathering around." className="resize-none rounded-xl border border-line bg-white px-4 py-3 text-[14px] outline-none focus:border-ink-500" />
                  </label>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <h2 className="font-display text-[26px] font-semibold sm:text-[30px]">Find complementary humans.</h2>
                <p className="mt-2 text-[14px] text-mute">Invite people you trust, or come back to this later. {draft.invitees.length > 0 && `${draft.invitees.length} selected.`}</p>
                <div className="mt-6 grid max-w-2xl gap-2 sm:grid-cols-2">
                  {invitable.map((p) => {
                    const on = draft.invitees.includes(p.id as PersonId);
                    return (
                      <button key={p.id} type="button" onClick={() => toggleInvitee(p.id as PersonId)} className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${on ? "border-ochre-400 bg-ochre-200/25" : "border-line bg-white hover:border-ink-300"}`}>
                        <Avatar person={p} size={36} />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[13.5px] font-semibold text-ink-950">{p.name}</span>
                          <span className="block truncate text-[12px] text-mute">{p.role} · {p.city}</span>
                        </span>
                        <span className={`grid h-5 w-5 flex-none place-items-center rounded-full border text-[10px] ${on ? "border-ochre-400 bg-ochre-400 text-ink-950" : "border-line text-transparent"}`}>✓</span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <h2 className="font-display text-[26px] font-semibold sm:text-[30px]">Set expectations.</h2>
                <p className="mt-2 text-[14px] text-mute">Pick what you want this circle to agree on from the start.</p>
                <div className="mt-6 flex max-w-lg flex-col gap-2.5">
                  {AGREEMENTS.map((line) => {
                    const on = draft.agreements.includes(line);
                    return (
                      <button key={line} type="button" onClick={() => toggleAgreement(line)} className={`flex items-start gap-3 rounded-xl border p-3.5 text-left transition ${on ? "border-ochre-400 bg-ochre-200/25" : "border-line bg-white hover:border-ink-300"}`}>
                        <span className={`mt-0.5 grid h-5 w-5 flex-none place-items-center rounded-md border text-[10px] ${on ? "border-ochre-400 bg-ochre-400 text-ink-950" : "border-line text-transparent"}`}>✓</span>
                        <span className="text-[13.5px] leading-snug text-ink-950">{line}</span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {last && (
              <>
                <h2 className="font-display text-[26px] font-semibold sm:text-[30px]">Invite with clarity.</h2>
                <p className="mt-2 text-[14px] text-mute">Here&rsquo;s what people will see before they say yes.</p>
                <div className="mt-6 max-w-lg rounded-2xl border border-line bg-white p-5">
                  <span className="inline-flex items-center gap-2 rounded-full bg-paper-200 px-3 py-1 text-[11px] font-semibold text-ink-950">{typeInfo.glyph} {typeInfo.label}</span>
                  <h3 className="font-display mt-3 text-[20px] font-semibold text-ink-950">{draft.name || "Untitled circle"}</h3>
                  {draft.purpose && <p className="mt-1.5 text-[13.5px] leading-relaxed text-mute">{draft.purpose}</p>}
                  <div className="mt-4 border-t border-line pt-4">
                    <p className="text-[11px] font-bold tracking-[1px] text-mute uppercase">Invited ({draft.invitees.length})</p>
                    {draft.invitees.length > 0 ? (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {draft.invitees.map((id) => {
                          const p = invitable.find((x) => x.id === id)!;
                          return (
                            <span key={id} className="inline-flex items-center gap-1.5 rounded-full bg-paper-100 py-1 pr-3 pl-1">
                              <Avatar person={p} size={22} /> <span className="text-[12px] font-medium text-ink-950">{p.name.split(" ")[0]}</span>
                            </span>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="mt-1.5 text-[12.5px] text-mute">No one yet—you can invite people after you create this circle.</p>
                    )}
                  </div>
                  {draft.agreements.length > 0 && (
                    <div className="mt-4 border-t border-line pt-4">
                      <p className="text-[11px] font-bold tracking-[1px] text-mute uppercase">Agreed</p>
                      <ul className="mt-2 flex flex-col gap-1">
                        {draft.agreements.map((line) => <li key={line} className="text-[12.5px] leading-snug text-ink-800">✓ {line}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="mt-8 flex justify-between">
            <button type="button" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0} className="rounded-full border border-line bg-white px-5 py-2.5 text-[13.5px] font-semibold text-ink-950 disabled:opacity-0">Back</button>
            {last ? (
              <button type="button" onClick={create} className="rounded-full bg-ink-950 px-6 py-2.5 text-[13.5px] font-bold text-white">Create KinCircle</button>
            ) : (
              <button type="button" disabled={!canContinue} onClick={() => setStep((s) => s + 1)} className="rounded-full bg-ink-950 px-6 py-2.5 text-[13.5px] font-bold text-white disabled:opacity-40">Continue</button>
            )}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
