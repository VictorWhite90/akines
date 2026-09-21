"use client";

import Link from "next/link";
import { useId, useState } from "react";
import Button from "@/components/ui/Button";
import TrustLabel from "@/components/ui/TrustLabel";
import { cn } from "@/lib/cn";
import { BURNOUT_OPTIONS, BURNOUT_QUESTIONS, hasCrisisLanguage, type BurnoutAnswer } from "../_data";
import SafetyPanel from "./SafetyPanel";

type Answers = Record<string, BurnoutAnswer | undefined>;

/** Turns answers into observations + suggestions. Deliberately no number, level or label. */
function buildReflection(a: Answers) {
  const noticed: string[] = [];
  const suggestions: { text: string; href?: string; linkLabel?: string }[] = [];
  if (a.joy === "Often") {
    noticed.push("The studio has been feeling more like an obligation than a choice lately.");
    suggestions.push({ text: "Make one thing this week that is not for sale, not for a call and not for anyone." });
  }
  if (a.rest === "Rarely") {
    noticed.push("Rest has been hard to take without guilt.");
    suggestions.push({ text: "Schedule rest like a studio appointment — an afternoon that belongs to nobody." });
  }
  if (a.compare === "Often") {
    noticed.push("Other people's visibility has been taking up room in your head.");
    suggestions.push({ text: "Artelia Connect shows no follower counts on purpose. Try a week of making without looking at anyone's numbers." });
  }
  if (a.body === "Often") {
    noticed.push("Your body has been asking you to slow down.");
    suggestions.push({ text: "Two minutes of slow breathing between tasks can help.", href: "#breathe", linkLabel: "Breathe now" });
  }
  if (a.people === "Rarely") {
    noticed.push("You haven't had many chances to talk about your work with people who get it.");
    suggestions.push({ text: "A small, moderated peer circle can help.", href: "/circles", linkLabel: "Browse circles" });
  }
  if (noticed.length === 0) noticed.push("From your answers, your practice seems to have some breathing room right now. That's worth protecting.");
  if (noticed.length >= 3)
    suggestions.push({ text: "If this has been going on for a while, talking with a licensed professional can really help.", href: "#therapists", linkLabel: "See the therapist directory" });
  return { noticed, suggestions };
}

/** Creative Burnout reflection (W1) — a reflection with suggestions, never a score or diagnosis (W3). */
export default function BurnoutReflection() {
  const [answers, setAnswers] = useState<Answers>({});
  const [extra, setExtra] = useState("");
  const [result, setResult] = useState<ReturnType<typeof buildReflection> | null>(null);
  const [crisis, setCrisis] = useState(false);
  const extraId = useId();
  const baseId = useId();
  const answered = BURNOUT_QUESTIONS.filter((q) => answers[q.id]).length;

  function submit() {
    if (hasCrisisLanguage(extra)) {
      setCrisis(true);
      setResult(null);
      return;
    }
    setCrisis(false);
    setResult(buildReflection(answers));
  }

  return (
    <div className="flex flex-col gap-5">
      {BURNOUT_QUESTIONS.map((q, i) => (
        <fieldset key={q.id}>
          <legend className="text-sm text-green-950">
            <span className="font-semibold">{i + 1}.</span> {q.q}
          </legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {BURNOUT_OPTIONS.map((opt) => {
              const id = `${baseId}-${q.id}-${opt}`;
              const checked = answers[q.id] === opt;
              return (
                <label
                  key={opt}
                  htmlFor={id}
                  className={cn(
                    "cursor-pointer rounded-full border px-4 py-2 text-sm transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-green-950",
                    checked ? "border-calm bg-calm text-white" : "border-sand-300 bg-white text-green-950 hover:border-calm",
                  )}
                >
                  <input id={id} type="radio" name={`${baseId}-${q.id}`} value={opt} checked={checked} onChange={() => setAnswers((a) => ({ ...a, [q.id]: opt }))} className="sr-only" />
                  {opt}
                </label>
              );
            })}
          </div>
        </fieldset>
      ))}
      <div>
        <label htmlFor={extraId} className="text-sm font-semibold text-green-950">
          Anything else you want to put into words? <span className="font-normal text-grey-700">(optional, private)</span>
        </label>
        <textarea id={extraId} value={extra} onChange={(e) => setExtra(e.target.value)} rows={3} className="mt-2 w-full rounded-[2px] border border-sand-300 bg-white p-3 text-sm text-green-950" />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={submit} variant="outline" disabled={answered < 3}>
          See my reflection
        </Button>
        <span className="text-xs text-grey-700">{answered < 3 ? `Answer at least 3 questions (${answered} so far).` : "Ready when you are."}</span>
      </div>
      <div aria-live="polite">
        {crisis && <SafetyPanel onClose={() => setCrisis(false)} closeLabel="Back to my reflection" />}
        {result && (
          <div className="rounded-[4px] border border-calm/30 bg-calm-bg p-5">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-playfair text-lg font-semibold text-green-950">A reflection, not a result</p>
              <TrustLabel source="ai" compact />
            </div>
            <p className="mt-1 text-xs text-grey-700">Written from your answers only. There is no score and nothing here is a diagnosis.</p>
            <p className="mt-4 text-sm font-semibold text-green-950">What you might be noticing</p>
            <ul className="mt-2 flex list-disc flex-col gap-1 pl-5 text-sm text-grey-800">
              {result.noticed.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
            {result.suggestions.length > 0 && (
              <>
                <p className="mt-4 text-sm font-semibold text-green-950">Gentle suggestions — take what helps</p>
                <ul className="mt-2 flex flex-col gap-2 text-sm text-grey-800">
                  {result.suggestions.map((s) => (
                    <li key={s.text} className="rounded-[4px] bg-white px-3 py-2">
                      {s.text}{" "}
                      {s.href && (
                        <Link href={s.href} className="font-semibold text-green-950 underline underline-offset-4">
                          {s.linkLabel}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </>
            )}
            <button type="button" onClick={() => setResult(null)} className="mt-4 cursor-pointer text-sm font-semibold text-green-950 underline underline-offset-4">
              Dismiss this reflection
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
