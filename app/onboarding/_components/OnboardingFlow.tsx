"use client";

import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Calendar, Messages2, People, TickCircle, TaskSquare } from "iconsax-reactjs";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Chip from "@/components/ui/Chip";
import Notice from "@/components/ui/Notice";
import Spectrum from "@/components/ui/Spectrum";
import StageTracker from "@/components/ui/StageTracker";
import TrustLabel from "@/components/ui/TrustLabel";
import { COLLECTOR_TYPES, INTENTS, MY_DNA } from "@/lib/data";
import type { CollectorType, CreativeDna, IntentId, Role } from "@/lib/types";
import { cn } from "@/lib/cn";
import ConsentToggle from "@/app/dna/_components/ConsentToggle";
import { PRIVACY_OPTIONS, type PrivacyKey } from "@/app/dna/_data";

const STEPS = [
  { id: "why", label: "Why you're here" },
  { id: "who", label: "Who you are" },
  { id: "dna", label: "Creative DNA" },
  { id: "consent", label: "Privacy" },
  { id: "result", label: "Your DNA" },
];

const ROLES: { id: Role; label: string; hint: string }[] = [
  { id: "artist", label: "Artist", hint: "You make work — any medium, any stage." },
  { id: "collector", label: "Collector", hint: "You live with art, or want to start." },
  { id: "curator", label: "Curator", hint: "You shape shows, calls or collections." },
  { id: "gallery", label: "Gallery", hint: "You represent or exhibit artists." },
  { id: "institution", label: "Institution", hint: "Foundation, museum, brand or school." },
  { id: "creative", label: "Creative professional", hint: "Designer, architect, musician, writer…" },
  { id: "researcher", label: "Researcher", hint: "You study, write about or teach art." },
];

const PRACTICES = [
  "Textiles",
  "Painting",
  "Photography",
  "Sculpture",
  "Ceramics",
  "Sound",
  "Fashion",
  "Digital",
  "Installation",
  "Performance",
  "Architecture",
  "Writing",
  "Curation",
  "Collecting",
];
const THEMES = [
  "Migration",
  "Memory",
  "Identity",
  "Home & belonging",
  "Heritage & restitution",
  "Women's archives",
  "Spirituality",
  "Urban life",
  "Water & land",
  "Diaspora",
  "Craft lineages",
  "Healing",
];

/** The five dimensions asked at onboarding; the rest are learned (with consent) or added later on /dna. */
const CALIBRATE = ["curiosity", "tradition", "form", "collaboration", "voice"];

type Privacy = CreativeDna["privacy"];

export default function OnboardingFlow() {
  const [step, setStep] = useState(0);
  const [intents, setIntents] = useState<IntentId[]>([]);
  const [ownWords, setOwnWords] = useState("");
  const [role, setRole] = useState<Role | null>(null);
  const [practices, setPractices] = useState<string[]>([]);
  const [themes, setThemes] = useState<string[]>([]);
  const [values, setValues] = useState<Record<string, number>>(() => Object.fromEntries(CALIBRATE.map((id) => [id, 50])));
  const [collectorTypes, setCollectorTypes] = useState<CollectorType[]>([]);
  const [privacy, setPrivacy] = useState<Privacy>({ inferFromBehaviour: false, useJournalThemes: false, visibleToMatches: true, visibleToCurators: false });
  const headingRef = useRef<HTMLHeadingElement>(null);

  const dims = MY_DNA.dimensions.filter((d) => CALIBRATE.includes(d.id));
  const canContinue = step === 0 ? intents.length > 0 || ownWords.trim().length > 0 : step === 1 ? role !== null : true;
  const blockedHint = step === 0 ? "Pick at least one reason, or write your own." : "Choose the role that fits you best.";

  function go(next: number) {
    setStep(next);
    requestAnimationFrame(() => headingRef.current?.focus());
  }

  function toggle<T>(list: T[], item: T, set: (next: T[]) => void) {
    set(list.includes(item) ? list.filter((x) => x !== item) : [...list, item]);
  }

  const heading = ["Why are you here?", "Tell us a little about you", "Calibrate your Creative DNA", "You decide what we use", "Your Creative DNA is ready"][step];

  return (
    <Card className="mt-8 p-5 sm:p-8">
      <StageTracker steps={STEPS} current={step} label="Onboarding progress" />
      <p className="mt-6 text-xs font-semibold uppercase tracking-[0.12em] text-grey-700">
        Step {step + 1} of {STEPS.length}
      </p>
      <h2 ref={headingRef} tabIndex={-1} className="mt-1 font-playfair text-2xl font-semibold text-green-950 outline-none md:text-3xl">
        {heading}
      </h2>

      {step === 0 && (
        <div className="mt-2">
          <p className="max-w-2xl text-sm text-grey-800">
            Not “what art do you like” — what are you hoping Artelia Connect does for you? Choose as many as are true. You&apos;ll be asked again, lightly, at the start of each
            visit.
          </p>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {INTENTS.map((intent) => {
              const selected = intents.includes(intent.id);
              return (
                <li key={intent.id}>
                  <button
                    type="button"
                    aria-pressed={selected}
                    onClick={() => toggle(intents, intent.id, setIntents)}
                    className={cn(
                      "flex h-full w-full cursor-pointer items-start gap-3 rounded-[4px] border p-4 text-left transition-colors",
                      selected ? "border-green-950 bg-green-50" : "border-sand-200 bg-white hover:border-green-950",
                    )}
                  >
                    <span
                      aria-hidden
                      className={cn(
                        "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
                        selected ? "border-green-950 bg-green-950 text-white" : "border-sand-300 bg-white",
                      )}
                    >
                      {selected && <TickCircle size={14} variant="Bold" color="currentColor" />}
                    </span>
                    <span>
                      <span className="block font-semibold text-green-950">{intent.label}</span>
                      <span className="mt-1 block text-sm italic text-grey-700">{intent.example}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          <div className="mt-6">
            <label htmlFor="own-words" className="text-sm font-semibold text-green-950">
              In your own words <span className="font-normal text-grey-700">(optional)</span>
            </label>
            <textarea
              id="own-words"
              value={ownWords}
              onChange={(e) => setOwnWords(e.target.value)}
              rows={3}
              placeholder="e.g. “I feel creatively blocked” or “I'm searching for my African identity”"
              className="mt-2 w-full rounded-[4px] border border-sand-300 bg-white p-3 text-sm text-green-950 placeholder:text-grey-600"
              aria-describedby="own-words-hint"
            />
            <p id="own-words-hint" className="mt-1 text-xs text-grey-700">
              Only used to shape your introductions and suggestions. Never shown on your profile.
            </p>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="mt-2 flex flex-col gap-8">
          <p className="max-w-2xl text-sm text-grey-800">Everything here is self-declared — it appears on your profile with that label, and you can change it any time.</p>
          <fieldset>
            <legend className="text-sm font-semibold text-green-950">Which best describes you?</legend>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {ROLES.map((r) => (
                <label
                  key={r.id}
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-[4px] border p-3 transition-colors",
                    role === r.id ? "border-green-950 bg-green-50" : "border-sand-200 hover:border-green-950",
                  )}
                >
                  <input type="radio" name="role" value={r.id} checked={role === r.id} onChange={() => setRole(r.id)} className="mt-1 accent-green-950" />
                  <span>
                    <span className="block text-sm font-semibold text-green-950">{r.label}</span>
                    <span className="block text-xs text-grey-700">{r.hint}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend className="text-sm font-semibold text-green-950">Practices and media</legend>
            <p className="mt-1 text-xs text-grey-700">What you make, or what you&apos;re drawn to.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {PRACTICES.map((p) => (
                <Chip key={p} selected={practices.includes(p)} onToggle={() => toggle(practices, p, setPractices)}>
                  {p}
                </Chip>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend className="text-sm font-semibold text-green-950">Themes you care about</legend>
            <p className="mt-1 text-xs text-grey-700">Shared themes are the strongest signal for meaningful introductions.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {THEMES.map((t) => (
                <Chip key={t} selected={themes.includes(t)} onToggle={() => toggle(themes, t, setThemes)}>
                  {t}
                </Chip>
              ))}
            </div>
          </fieldset>
        </div>
      )}

      {step === 2 && (
        <div className="mt-2 flex flex-col gap-8">
          <p className="max-w-2xl text-sm text-grey-800">
            There are no right answers. Slide each one to where you sit today — these are your own words, so they&apos;re labelled self-declared. You can add the rest of your
            dimensions later.
          </p>
          <div className="grid gap-6 md:grid-cols-2">
            {dims.map((d) => (
              <Spectrum
                key={d.id}
                label={d.label}
                left={d.left}
                right={d.right}
                value={values[d.id]}
                source="self-declared"
                onChange={(v) => setValues((prev) => ({ ...prev, [d.id]: v }))}
              />
            ))}
          </div>
          {role === "collector" && (
            <fieldset>
              <legend className="text-sm font-semibold text-green-950">What moves you to collect?</legend>
              <p className="mt-1 text-xs text-grey-700">Pick any that fit. This helps us introduce you to artists who want the kind of relationship you offer.</p>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {COLLECTOR_TYPES.map((c) => {
                  const selected = collectorTypes.includes(c.id);
                  return (
                    <li key={c.id}>
                      <button
                        type="button"
                        aria-pressed={selected}
                        onClick={() => toggle(collectorTypes, c.id, setCollectorTypes)}
                        className={cn(
                          "h-full w-full cursor-pointer rounded-[4px] border p-3 text-left transition-colors",
                          selected ? "border-green-950 bg-green-50" : "border-sand-200 hover:border-green-950",
                        )}
                      >
                        <span className="block text-sm font-semibold text-green-950">{c.id}</span>
                        <span className="block text-xs text-grey-700">{c.description}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </fieldset>
          )}
        </div>
      )}

      {step === 3 && (
        <div className="mt-2 flex flex-col gap-6">
          <p className="max-w-2xl text-sm text-grey-800">
            We start with the most private settings that still let introductions work. Nothing here is permanent — change it any time from My Creative DNA.
          </p>
          <div className="flex flex-col divide-y divide-sand-200 rounded-[4px] border border-sand-200">
            {PRIVACY_OPTIONS.map((opt) => (
              <ConsentToggle
                key={opt.key}
                className="p-4"
                label={opt.label}
                description={privacy[opt.key] ? opt.on : opt.off}
                checked={privacy[opt.key]}
                onChange={(next) => setPrivacy((prev) => ({ ...prev, [opt.key as PrivacyKey]: next }))}
              />
            ))}
          </div>
          <Notice tone="private" title="Your wellbeing is never part of your Creative DNA">
            Private check-ins, mood canvases and anything you share in the wellbeing space are never used for matching, ranking, advertising or opportunities — whatever you choose
            above.
          </Notice>
        </div>
      )}

      {step === 4 && (
        <div className="mt-2 flex flex-col gap-8" aria-live="polite">
          <p className="max-w-2xl text-sm text-grey-800">Here&apos;s what you told us. It&apos;s a starting point — it grows as you do, and you stay in charge of it.</p>
          <div className="grid gap-6 lg:grid-cols-2">
            <Card tone="sand" className="flex flex-col gap-4 p-5">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-playfair text-lg font-semibold text-green-950">You&apos;re here to</h3>
                <TrustLabel source="self-declared" compact />
              </div>
              <div className="flex flex-wrap gap-2">
                {intents.map((id) => (
                  <Badge key={id} tone="green">
                    {INTENTS.find((i) => i.id === id)?.label}
                  </Badge>
                ))}
                {intents.length === 0 && <span className="text-sm text-grey-700">In your own words only</span>}
              </div>
              {ownWords.trim() && <p className="text-sm italic text-grey-800">“{ownWords.trim()}”</p>}
              <dl className="grid gap-2 text-sm">
                <div className="flex gap-2">
                  <dt className="text-grey-700">Role:</dt>
                  <dd className="font-semibold text-green-950">{ROLES.find((r) => r.id === role)?.label}</dd>
                </div>
                {practices.length > 0 && (
                  <div className="flex gap-2">
                    <dt className="shrink-0 text-grey-700">Practices:</dt>
                    <dd className="text-green-950">{practices.join(", ")}</dd>
                  </div>
                )}
                {themes.length > 0 && (
                  <div className="flex gap-2">
                    <dt className="shrink-0 text-grey-700">Themes:</dt>
                    <dd className="text-green-950">{themes.join(", ")}</dd>
                  </div>
                )}
                {collectorTypes.length > 0 && (
                  <div className="flex gap-2">
                    <dt className="shrink-0 text-grey-700">As a collector:</dt>
                    <dd className="text-green-950">{collectorTypes.join(", ")}</dd>
                  </div>
                )}
              </dl>
            </Card>
            <Card className="flex flex-col gap-5 p-5">
              <h3 className="font-playfair text-lg font-semibold text-green-950">Your Creative DNA</h3>
              {dims.map((d) => (
                <Spectrum key={d.id} label={d.label} left={d.left} right={d.right} value={values[d.id]} source="self-declared" />
              ))}
            </Card>
          </div>

          <section aria-labelledby="next-heading">
            <h3 id="next-heading" className="font-playfair text-lg font-semibold text-green-950">
              What happens next
            </h3>
            <ul className="mt-3 grid gap-3 md:grid-cols-3">
              <li className="flex gap-3 rounded-[4px] border border-sand-200 p-4">
                <People size={22} variant="Bulk" color="var(--color-green-900)" className="shrink-0" aria-hidden />
                <p className="text-sm text-grey-800">
                  <span className="font-semibold text-green-950">A few introductions a week</span> — at most five, each explaining why. Accept, decline or tell us we got it wrong.
                </p>
              </li>
              <li className="flex gap-3 rounded-[4px] border border-sand-200 p-4">
                <Messages2 size={22} variant="Bulk" color="var(--color-green-900)" className="shrink-0" aria-hidden />
                <p className="text-sm text-grey-800">
                  <span className="font-semibold text-green-950">A small room to try</span> — six seats, no audience. We&apos;ll suggest one that fits why you&apos;re here.
                </p>
              </li>
              <li className="flex gap-3 rounded-[4px] border border-sand-200 p-4">
                <TaskSquare size={22} variant="Bulk" color="var(--color-green-900)" className="shrink-0" aria-hidden />
                <p className="text-sm text-grey-800">
                  <span className="font-semibold text-green-950">Calls that fit</span> — open calls from verified organisers that match your practice, with the fee shown up front.
                </p>
              </li>
            </ul>
          </section>

          <Notice tone="info">
            You&apos;re not joining an audience. There are no followers or likes here — just people who might matter to your work, and a place to belong to African creativity.
          </Notice>

          <div className="flex flex-wrap gap-3">
            <Button href="/introductions" icon={<ArrowRight size={16} color="currentColor" aria-hidden />}>
              See my first introductions
            </Button>
            <Button href="/dna" variant="outline">
              Fine-tune my Creative DNA
            </Button>
            <Button href="/" variant="ghost" icon={<Calendar size={16} color="currentColor" aria-hidden />}>
              Go to Today
            </Button>
          </div>
        </div>
      )}

      {step < 4 && (
        <div className="mt-8 flex flex-col-reverse gap-3 border-t border-sand-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
          {step > 0 ? (
            <Button variant="ghost" onClick={() => go(step - 1)} icon={<ArrowLeft size={16} color="currentColor" aria-hidden />}>
              Back
            </Button>
          ) : (
            <span className="text-xs text-grey-700">Takes about three minutes.</span>
          )}
          <div className="flex flex-col items-stretch gap-2 sm:items-end">
            <Button onClick={() => go(step + 1)} disabled={!canContinue} aria-describedby={!canContinue ? "continue-hint" : undefined}>
              {step === 3 ? "Build my Creative DNA" : "Continue"}
            </Button>
            {!canContinue && (
              <p id="continue-hint" className="text-xs text-grey-700">
                {blockedHint}
              </p>
            )}
          </div>
        </div>
      )}
      {step === 4 && (
        <div className="mt-8 border-t border-sand-200 pt-6">
          <Button variant="ghost" onClick={() => go(3)} icon={<ArrowLeft size={16} color="currentColor" aria-hidden />}>
            Back to privacy
          </Button>
        </div>
      )}
    </Card>
  );
}
