"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Avatar from "@/components/ui/Avatar";
import { useBanters } from "./useBanters";
import { BANTER_MOODS, toneIssue, softenWording, type Banter, type BanterLifetime, type BanterMood, type BanterNow } from "@/lib/data/banter";
import { CLIQS } from "@/lib/data/cliqs";
import { CIRCLES } from "@/lib/data/community";
import { ME, PEOPLE, allPeople, type PersonId } from "@/lib/data/people";
import { newId, useLocal } from "@/lib/useLocal";

const OTHERS = allPeople.filter((p) => p.id !== ME.id).map((p) => p.id as PersonId);
const AUDIENCES: { id: string; label: string; reach: number; kind: string; people: PersonId[] }[] = [
  ...CLIQS.map((c) => ({ id: `cliq:${c.id}`, label: c.name, reach: c.people.length, kind: "Cliq", people: c.people })),
  ...CIRCLES.filter((c) => c.joined).map((c, k) => ({ id: `circle:${c.id}`, label: c.name, reach: 12, kind: "KinCircle", people: OTHERS.slice(k * 3, k * 3 + 6) })),
  { id: "community", label: "Wider community", reach: 120, kind: "Everyone", people: OTHERS.slice(4, 10) },
];
const IDEAS = ["What's one thing you're proud of this week?", "Be honest: should I take the new job?", "What's the best advice you ignored?", "Where do you go to switch off in your city?"];
const MOODS: BanterMood[] = ["fun", "honest", "debate", "think", "encourage", "celebrate"];
const STEPS = ["How", "Your question", "Who hears it"];

/** Start a Banter: three short steps in a modal, so nobody has to read a long form. */
export default function BanterCreate({ open, onClose, initialShape = "chat" }: { open: boolean; onClose: () => void; initialShape?: "chat" | "live" }) {
  const router = useRouter();
  const { add } = useBanters();
  const [, setSessions] = useLocal<BanterNow[]>("ak:banter-now", []);
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState(0);
  const [shape, setShape] = useState<"chat" | "live">(initialShape);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- follow the choice made in the Create menu
  useEffect(() => { if (open) { setShape(initialShape); setStep(0); } }, [open, initialShape]);
  const [q, setQ] = useState("");
  const [mood, setMood] = useState<BanterMood>("fun");
  const [aud, setAud] = useState(AUDIENCES[0].id);
  const [life, setLife] = useState<BanterLifetime>("3d");
  const [minutes, setMinutes] = useState(20);
  const [ack, setAck] = useState(false);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- the portal needs document.body, which only exists after mount
  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", k);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open || !mounted) return null;

  const audience = AUDIENCES.find((a) => a.id === aud)!;
  const issue = ack ? null : toneIssue(q);
  const canNext = step === 0 || (step === 1 && q.trim().length >= 5 && !issue) || step === 2;

  const start = () => {
    if (shape === "live") {
      const s: BanterNow = { id: newId("now"), topic: q.trim(), host: ME.id as PersonId, people: [ME.id as PersonId, ...audience.people.slice(0, 7)], minutes, context: audience.label, live: true };
      setSessions((cur) => [s, ...cur]);
      onClose();
      router.push(`/banter/now/${s.id}`);
      return;
    }
    const b: Banter = {
      id: newId("banter"), by: ME.id as PersonId, format: "ask", type: "everyday", mood,
      audience: aud === "community" ? "community" : aud.startsWith("circle") ? "circle" : "selected",
      audienceLabel: audience.label, lifetime: life, prompt: q.trim(), ago: "now", reactions: {}, replies: [], resonance: [], reach: audience.reach, mine: true,
    };
    add(b);
    onClose();
    router.push(`/banter/${b.id}`);
  };

  return createPortal(
    <div className="bc-scrim" onClick={(e) => e.target === e.currentTarget && onClose()} role="dialog" aria-modal="true" aria-label="Start a Banter">
      <div className="bc">
        <header className="bc-head">
          <div>
            <small>Start a Banter</small>
            <h2>{step === 0 ? "How should people join in?" : step === 1 ? "What do you want to ask?" : "Who should hear it?"}</h2>
          </div>
          <button onClick={onClose} aria-label="Close">×</button>
        </header>
        <ol className="bc-steps" aria-label={`Step ${step + 1} of 3`}>
          {STEPS.map((s, i) => <li key={s} className={i < step ? "done" : i === step ? "on" : undefined}><i>{i < step ? "✓" : i + 1}</i>{s}</li>)}
        </ol>

        <div className="bc-body">
          {step === 0 && (
            <div className="bc-shapes" role="radiogroup">
              {([
                { id: "chat", t: "Banter chat", d: "People reply in their own time. It stays open for a few days, then fades.", g: "💬" },
                { id: "live", t: "Live Banter", d: "A voice chat right now, for 2–8 people. Nothing is recorded.", g: "◉" },
              ] as const).map((o) => (
                <button key={o.id} role="radio" aria-checked={shape === o.id} className={shape === o.id ? "on" : undefined} onClick={() => setShape(o.id)}>
                  <span className="g">{o.g}</span><b>{o.t}</b><small>{o.d}</small>
                </button>
              ))}
            </div>
          )}

          {step === 1 && (
            <>
              <textarea autoFocus value={q} onChange={(e) => { setQ(e.target.value); setAck(false); }} rows={3} placeholder="Ask one honest question…" maxLength={180} />
              <p className="bc-count">{q.length}/180</p>
              {issue && (
                <div className="bc-warn">
                  <b>{issue === "harsh" ? "This could sound personal rather than playful." : "This reads as a judgement about a whole group."}</b>
                  <div>
                    {issue === "harsh" && <button onClick={() => setQ(softenWording(q))}>Use calmer wording</button>}
                    <button onClick={() => setAck(true)}>Keep mine</button>
                  </div>
                </div>
              )}
              <p className="bc-l">Need an idea?</p>
              <div className="bc-chips">{IDEAS.map((x) => <button key={x} onClick={() => setQ(x)}>{x}</button>)}</div>
              <p className="bc-l">How should people answer?</p>
              <div className="bc-chips">{MOODS.map((m) => <button key={m} className={mood === m ? "on" : undefined} onClick={() => setMood(m)}>{BANTER_MOODS.find((x) => x.id === m)!.label}</button>)}</div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="bc-aud">
                {AUDIENCES.map((a) => (
                  <button key={a.id} className={aud === a.id ? "on" : undefined} aria-pressed={aud === a.id} onClick={() => setAud(a.id)}>
                    <span className="bc-faces">{a.people.slice(0, 3).map((id) => <Avatar key={id} person={PEOPLE[id]} size={22} />)}</span>
                    <span><b>{a.label}</b><small>{a.kind} · {a.reach} people</small></span>
                  </button>
                ))}
              </div>
              <p className="bc-l">{shape === "live" ? "How long you'll talk" : "How long it stays open"}</p>
              <div className="bc-chips">
                {shape === "live"
                  ? [10, 20, 30].map((m) => <button key={m} className={minutes === m ? "on" : undefined} onClick={() => setMinutes(m)}>{m} min</button>)
                  : ([["24h", "Tonight"], ["3d", "3 days"], ["1w", "A week"]] as const).map(([id, l]) => <button key={id} className={life === id ? "on" : undefined} onClick={() => setLife(id)}>{l}</button>)}
              </div>
              <div className="bc-preview">
                <small>{shape === "live" ? "Live Banter" : "Banter chat"} · {audience.label}</small>
                <b>“{q.trim()}”</b>
              </div>
            </>
          )}
        </div>

        <footer className="bc-foot">
          {step > 0 ? <button className="bc-back" onClick={() => setStep(step - 1)}>Back</button> : <span />}
          {step < 2
            ? <button className="bc-next" disabled={!canNext} onClick={() => setStep(step + 1)}>Continue</button>
            : <button className="bc-next" onClick={start}>{shape === "live" ? "◉ Go live now" : "Start the Banter"}</button>}
        </footer>
      </div>
    </div>,
    document.body,
  );
}
