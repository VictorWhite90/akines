"use client";

import Link from "next/link";
import { useId, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, DocumentUpload, TickCircle } from "iconsax-reactjs";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Media from "@/components/ui/Media";
import Notice from "@/components/ui/Notice";
import StageTracker from "@/components/ui/StageTracker";
import { cn } from "@/lib/cn";
import type { OpenCall } from "@/lib/types";
import type { PortfolioWork } from "../_data";

const STEPS = [
  { id: "works", label: "Works" },
  { id: "statement", label: "Statement" },
  { id: "materials", label: "Materials" },
  { id: "rights", label: "Rights" },
  { id: "review", label: "Review" },
];

const STAGES = [
  { id: "submitted", label: "Submitted" },
  { id: "eligibility", label: "Eligibility" },
  { id: "review", label: "Review" },
  { id: "longlist", label: "Longlist" },
  { id: "shortlist", label: "Shortlist" },
  { id: "selected", label: "Decision" },
];

/** Materials the earlier steps already cover. */
function coveredBy(material: string): "works" | "statement" | null {
  const m = material.toLowerCase();
  if (m.includes("image") || m.includes("past public works") || m.includes("portfolio")) return "works";
  if (m.includes("statement") || m.includes("proposal") || m.includes("concept")) return "statement";
  return null;
}

const countWords = (text: string) => (text.trim() ? text.trim().split(/\s+/).length : 0);

export default function ApplyFlow({
  call,
  works,
  maxWorks,
  wordLimit,
  eligibilityGaps,
}: {
  call: OpenCall;
  works: PortfolioWork[];
  maxWorks: number;
  wordLimit: number;
  eligibilityGaps: string[];
}) {
  const id = useId();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [started, setStarted] = useState(false);
  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState<string[]>([]);
  const [statement, setStatement] = useState("");
  const [attached, setAttached] = useState<Record<string, string>>({});
  const [rightsOk, setRightsOk] = useState(false);
  const [ownWork, setOwnWork] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const words = countWords(statement);
  const extraMaterials = call.requiredMaterials.filter((m) => !coveredBy(m));

  const problem = (s: number): string | null => {
    if (s === 0 && picked.length === 0) return "Choose at least one work to send.";
    if (s === 1 && words < 30) return "Write at least 30 words so the panel knows why this call, and why you.";
    if (s === 1 && words > wordLimit) return `Your statement is ${words - wordLimit} words over the ${wordLimit}-word limit.`;
    if (s === 2 && extraMaterials.some((m) => !attached[m])) return "Attach every required material before you continue.";
    if (s === 3 && (!rightsOk || !ownWork)) return "Please confirm both statements about rights.";
    return null;
  };

  const go = (next: number) => {
    if (next > step) {
      const p = problem(step);
      if (p) {
        setError(p);
        return;
      }
    }
    setError(null);
    setStep(next);
    requestAnimationFrame(() => headingRef.current?.focus());
  };

  if (!started) {
    return (
      <div className="flex flex-col gap-3">
        {eligibilityGaps.length > 0 && (
          <Notice tone="info" title="You can still apply">
            You don&apos;t meet {eligibilityGaps.length === 1 ? "one rule" : `${eligibilityGaps.length} rules`} ({eligibilityGaps.join("; ")}). A person screens eligibility, not an algorithm — explain your case in your statement.
          </Notice>
        )}
        <Button size="lg" onClick={() => { setStarted(true); requestAnimationFrame(() => headingRef.current?.focus()); }} icon={<ArrowRight size={18} color="currentColor" aria-hidden />}>
          Start application
        </Button>
        <p className="text-xs text-grey-700">Five short steps, about 15 minutes. Your draft is kept on this device until you submit. Applying is always free.</p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div aria-live="polite" className="flex flex-col gap-5">
        <div className="flex items-start gap-3 rounded-[4px] bg-verified-bg p-4 text-verified">
          <TickCircle size={24} variant="Bold" color="currentColor" className="shrink-0" aria-hidden />
          <div>
            <p className="font-semibold">Application sent to {call.organisation}</p>
            <p className="mt-1 text-sm text-grey-800">Reference APP-{call.id.slice(0, 4).toUpperCase()}-0921 · a copy is in your inbox and on your Applications page.</p>
          </div>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-green-950">What happens now</h3>
          <StageTracker steps={STAGES} current={0} label="Application stages" className="mt-4" />
          <ul className="mt-5 flex flex-col gap-2 text-sm text-grey-800">
            <li><span className="font-semibold text-green-950">Eligibility</span> — a person checks the rules within a few days. You&apos;ll hear either way.</li>
            <li><span className="font-semibold text-green-950">Review</span> — {call.selectionProcess}.</li>
            <li><span className="font-semibold text-green-950">Decision</span> — every applicant gets a decision, with written feedback on request.</li>
          </ul>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button href="/applications" icon={<ArrowRight size={18} color="currentColor" aria-hidden />}>Track it in My applications</Button>
          <Button href="/opportunities" variant="ghost">Back to open calls</Button>
        </div>
      </div>
    );
  }

  const inputCls = "w-full rounded-[4px] border border-sand-300 bg-white p-3 text-sm text-green-950";

  return (
    <div className="flex flex-col gap-5">
      <StageTracker steps={STEPS} current={step} label="Application steps" />

      <h3 ref={headingRef} tabIndex={-1} className="font-playfair text-lg font-semibold text-green-950 outline-none">
        Step {step + 1} of {STEPS.length}: {["Choose your works", "Tailor your statement", "Required materials", "Rights", "Review and submit"][step]}
      </h3>

      {step === 0 && (
        <fieldset>
          <legend className="text-sm text-grey-800">Pick up to {maxWorks}. Selected works travel with their stories, so the panel sees process, not just images.</legend>
          <ul className="mt-3 grid gap-3 sm:grid-cols-2">
            {works.map((work) => {
              const checked = picked.includes(work.id);
              const full = !checked && picked.length >= maxWorks;
              return (
                <li key={work.id}>
                  <label className={cn("flex h-full cursor-pointer gap-3 rounded-[4px] border p-2.5 transition-colors", checked ? "border-green-950 bg-sand-100" : "border-sand-200 bg-white", full && "cursor-not-allowed opacity-50")}>
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={full}
                      onChange={() => setPicked((prev) => (checked ? prev.filter((x) => x !== work.id) : [...prev, work.id]))}
                      className="mt-1 accent-green-950"
                    />
                    <span className="block w-16 shrink-0 overflow-hidden rounded-[2px]"><Media src={work.image} alt="" ratio="1/1" sizes="64px" /></span>
                    <span className="min-w-0 text-sm">
                      <span className="block font-semibold text-green-950">{work.title}</span>
                      <span className="block text-xs text-grey-700">{work.detail}</span>
                      {work.storyId && <Badge tone="gold" className="mt-1">Has a story</Badge>}
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
          <p className="mt-2 text-xs text-grey-700" aria-live="polite">{picked.length} of {maxWorks} selected</p>
        </fieldset>
      )}

      {step === 1 && (
        <div>
          <label htmlFor={`${id}-statement`} className="text-sm text-grey-800">
            Why this call, and why this work now? Speak to the theme: <span className="font-semibold text-green-950">{call.theme}</span>.
          </label>
          <textarea
            id={`${id}-statement`}
            rows={9}
            value={statement}
            onChange={(e) => setStatement(e.target.value)}
            aria-describedby={`${id}-count`}
            className={cn(inputCls, "mt-3")}
            placeholder="Start with the work, not your CV. What does it ask of the space and the people in it?"
          />
          <p id={`${id}-count`} aria-live="polite" className={cn("mt-1 text-right text-xs font-semibold", words > wordLimit ? "text-alert" : words > wordLimit * 0.9 ? "text-ruby-700" : "text-grey-700")}>
            {words} / {wordLimit} words{words > wordLimit ? ` · ${words - wordLimit} over` : ""}
          </p>
        </div>
      )}

      {step === 2 && (
        <ul className="flex flex-col gap-2">
          {call.requiredMaterials.map((material) => {
            const from = coveredBy(material);
            const file = attached[material];
            const done = Boolean(from) || Boolean(file);
            return (
              <li key={material} className="flex flex-wrap items-center gap-3 rounded-[4px] border border-sand-200 bg-white p-3">
                <TickCircle size={20} variant={done ? "Bold" : "Linear"} color={done ? "var(--color-verified)" : "var(--color-grey-600)"} aria-hidden />
                <span className="min-w-0 flex-1 text-sm">
                  <span className="font-semibold text-green-950">{material}</span>
                  <span className="block text-xs text-grey-700">
                    {from === "works" && `Covered by your ${picked.length} selected work${picked.length === 1 ? "" : "s"}.`}
                    {from === "statement" && `Covered by your ${words}-word statement.`}
                    {!from && (file ? `Attached: ${file}` : "Not attached yet")}
                  </span>
                </span>
                {!from && (
                  <Button
                    variant={file ? "ghost" : "outline"}
                    size="sm"
                    icon={<DocumentUpload size={16} color="currentColor" aria-hidden />}
                    onClick={() => setAttached((prev) => ({ ...prev, [material]: file ? "" : `${material.split(" ")[0].toLowerCase()}-adaeze-nwosu.pdf` }))}
                  >
                    {file ? "Remove" : `Attach ${material.split(" (")[0].toLowerCase()}`}
                  </Button>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {step === 3 && (
        <div className="flex flex-col gap-3">
          <div className="rounded-[4px] bg-sand-100 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-grey-700">Rights requested by {call.organisation}</p>
            <p className="mt-1 text-sm text-green-950">{call.rightsRequested}</p>
          </div>
          <label className="flex items-start gap-2 text-sm text-grey-800">
            <input type="checkbox" checked={rightsOk} onChange={(e) => setRightsOk(e.target.checked)} className="mt-1 accent-green-950" />
            I&apos;ve read the rights above and agree to them if I&apos;m selected. Nothing is transferred by applying.
          </label>
          <label className="flex items-start gap-2 text-sm text-grey-800">
            <input type="checkbox" checked={ownWork} onChange={(e) => setOwnWork(e.target.checked)} className="mt-1 accent-green-950" />
            These works are mine, or my collaborators have agreed to them being submitted.
          </label>
          <p className="text-xs text-grey-700">Unsure what a clause means? <Link href="/companion" className="font-semibold text-green-950 underline underline-offset-2">Ask the Creative Companion</Link> — for anything complex, we recommend professional advice.</p>
        </div>
      )}

      {step === 4 && (
        <dl className="flex flex-col divide-y divide-sand-200 rounded-[4px] border border-sand-200 bg-white text-sm">
          <div className="p-3">
            <dt className="text-xs font-semibold text-grey-700">Works ({picked.length})</dt>
            <dd className="mt-1 text-green-950">{works.filter((w) => picked.includes(w.id)).map((w) => w.title).join(", ")}</dd>
          </div>
          <div className="p-3">
            <dt className="text-xs font-semibold text-grey-700">Statement ({words} / {wordLimit} words)</dt>
            <dd className="mt-1 line-clamp-4 whitespace-pre-line text-green-950">{statement}</dd>
          </div>
          <div className="p-3">
            <dt className="text-xs font-semibold text-grey-700">Materials</dt>
            <dd className="mt-1 text-green-950">{call.requiredMaterials.join(" · ")} — all included</dd>
          </div>
          <div className="p-3">
            <dt className="text-xs font-semibold text-grey-700">Rights</dt>
            <dd className="mt-1 text-green-950">Acknowledged</dd>
          </div>
        </dl>
      )}

      {error && <p role="alert" className="text-sm font-semibold text-alert">{error}</p>}

      <div className="flex flex-wrap justify-between gap-2">
        <Button variant="ghost" onClick={() => (step === 0 ? setStarted(false) : go(step - 1))} icon={<ArrowLeft size={16} color="currentColor" aria-hidden />}>
          {step === 0 ? "Cancel" : "Back"}
        </Button>
        {step < STEPS.length - 1 ? (
          <Button onClick={() => go(step + 1)}>Continue</Button>
        ) : (
          <Button onClick={() => setSubmitted(true)} icon={<TickCircle size={18} color="currentColor" aria-hidden />}>Submit application</Button>
        )}
      </div>
    </div>
  );
}
