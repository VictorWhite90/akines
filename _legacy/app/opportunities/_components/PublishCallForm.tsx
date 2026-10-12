"use client";

import Link from "next/link";
import { useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Clock, ShieldTick, TickCircle, Warning2 } from "iconsax-reactjs";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Chip from "@/components/ui/Chip";
import Media from "@/components/ui/Media";
import Notice from "@/components/ui/Notice";
import TrustLabel from "@/components/ui/TrustLabel";
import { IMG } from "@/lib/data";
import { cn } from "@/lib/cn";

const MEDIA = ["Painting", "Drawing", "Photography", "Textiles", "Fibre", "Sculpture", "Ceramics", "Installation", "Sound", "Digital", "Performance"];
const EXPERIENCE = ["Emerging (under 5 years exhibiting)", "Mid-career (5+ years exhibiting)", "Established", "Any"];
const RIGHTS = [
  { id: "exhibition", label: "Exhibition only", text: "Non-exclusive exhibition and catalogue reproduction for 12 months. Artist keeps copyright and ownership." },
  { id: "commission", label: "Commission, artist keeps copyright", text: "Artist keeps copyright and ownership. Commissioner may use images for exhibition and press only." },
  { id: "acquisition", label: "Acquisition", text: "Commissioner acquires the physical work; artist keeps copyright and receives credit in perpetuity." },
  { id: "custom", label: "Custom terms", text: "" },
];
const SELECTION = ["Eligibility screen → curator longlist → studio conversation → final selection", "Jury review → final selection", "Concept proposals → paid concept development → panel selection"];
const MATERIALS = ["Artwork images", "Statement", "CV", "Proposal", "Sketch or model", "Budget outline"];

type Organiser = "halima" | "new";

interface Form {
  title: string;
  organisation: string;
  theme: string;
  media: string[];
  geography: string;
  experience: string;
  works: string;
  budgetAmount: string;
  currency: string;
  budgetCovers: string;
  noEntryFee: boolean;
  rights: string;
  customRights: string;
  selection: string;
  materials: string[];
  wordLimit: string;
  opens: string;
  deadline: string;
  decision: string;
}

const INITIAL: Form = {
  title: "",
  organisation: "Halima Sani (independent curator)",
  theme: "",
  media: [],
  geography: "",
  experience: "",
  works: "",
  budgetAmount: "",
  currency: "NGN",
  budgetCovers: "",
  noEntryFee: false,
  rights: "",
  customRights: "",
  selection: "",
  materials: [],
  wordLimit: "300",
  opens: "",
  deadline: "",
  decision: "",
};

const inputCls = "mt-1.5 w-full rounded-[2px] border border-sand-300 bg-white px-3 py-2.5 text-sm text-green-950";

function Field({ id, label, hint, error, children }: { id: string; label: string; hint?: string; error?: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-semibold text-green-950">
        {label} <span className="text-alert" aria-hidden>*</span>
      </label>
      {hint && <p className="text-xs text-grey-700">{hint}</p>}
      {children}
      {error && <p id={`${id}-error`} className="mt-1 text-xs font-semibold text-alert">{error}</p>}
    </div>
  );
}

function fmtDate(value: string) {
  if (!value) return "—";
  const d = new Date(`${value}T00:00:00`);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default function PublishCallForm() {
  const id = useId();
  const [form, setForm] = useState<Form>(INITIAL);
  const [organiser, setOrganiser] = useState<Organiser>("halima");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);
  const summaryRef = useRef<HTMLDivElement>(null);
  const doneRef = useRef<HTMLHeadingElement>(null);

  const clearError = (key: string) =>
    setErrors((prev) => {
      if (!(key in prev)) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  const set = <K extends keyof Form>(key: K, value: Form[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    clearError(key);
  };
  const toggle = (key: "media" | "materials", value: string) => {
    setForm((f) => ({ ...f, [key]: f[key].includes(value) ? f[key].filter((v) => v !== value) : [...f[key], value] }));
    clearError(key);
  };

  const rightsText = form.rights === "custom" ? form.customRights : RIGHTS.find((r) => r.id === form.rights)?.text ?? "";
  const budget = form.budgetAmount ? `${form.currency === "NGN" ? "₦" : "US$"}${Number(form.budgetAmount).toLocaleString("en-GB")}${form.budgetCovers ? ` ${form.budgetCovers}` : ""}` : "";

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = "Give the call a title.";
    if (!form.organisation.trim()) e.organisation = "Name the commissioning organisation.";
    if (!form.theme.trim()) e.theme = "Describe the theme in a sentence.";
    if (form.media.length === 0) e.media = "Choose at least one eligible medium.";
    if (!form.geography.trim()) e.geography = "Say where applicants must be born or based.";
    if (!form.experience) e.experience = "Choose an experience level.";
    if (!form.works.trim()) e.works = "Say how many works you're asking for.";
    if (!form.budgetAmount || Number(form.budgetAmount) <= 0) e.budgetAmount = "Calls without a disclosed budget are not published.";
    if (!form.budgetCovers.trim()) e.budgetCovers = "Say what the budget covers (fee, production, shipping…).";
    if (!form.noEntryFee) e.noEntryFee = "Artists can't be charged to apply on Artelia.";
    if (!form.rights) e.rights = "Choose the rights you're requesting.";
    if (form.rights === "custom" && !form.customRights.trim()) e.customRights = "Describe your custom rights in plain language.";
    if (!form.selection) e.selection = "Explain how you'll choose.";
    if (form.materials.length === 0) e.materials = "Choose what applicants should send.";
    if (!form.wordLimit || Number(form.wordLimit) < 50) e.wordLimit = "Set a statement limit of at least 50 words.";
    if (!form.opens) e.opens = "Choose an opening date.";
    if (!form.deadline) e.deadline = "Choose a deadline.";
    if (!form.decision) e.decision = "Commit to a decision date.";
    if (form.opens && form.deadline && form.deadline <= form.opens) e.deadline = "The deadline must come after the call opens.";
    if (form.deadline && form.decision && form.decision <= form.deadline) e.decision = "Decisions must come after the deadline.";
    return e;
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) {
      requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }
    setSent(true);
    requestAnimationFrame(() => doneRef.current?.focus());
  };

  const err = (key: string) => errors[key];
  const described = (key: string) => (errors[key] ? { "aria-invalid": true as const, "aria-describedby": `${id}-${key}-error` } : {});
  const fid = (key: string) => `${id}-${key}`;
  const errorCount = Object.keys(errors).length;

  if (sent) {
    return (
      <Card className="p-6 sm:p-8" as="section">
        <div aria-live="polite" className="flex flex-col gap-5">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-verified-bg text-verified">
            <Clock size={26} variant="Bulk" color="currentColor" aria-hidden />
          </span>
          <h2 ref={doneRef} tabIndex={-1} className="font-playfair text-2xl font-semibold text-green-950 outline-none">Sent for review</h2>
          <p className="max-w-2xl text-sm text-grey-800">
            “{form.title}” is with our opportunities team. A person — not an algorithm — reads every call before it goes live. We&apos;ll reply within two working days.
          </p>
          <ol className="flex max-w-2xl flex-col gap-3 text-sm text-grey-800">
            <li className="flex gap-3"><Badge tone="green">1</Badge> We confirm {organiser === "halima" ? "your verified curator status is current" : "your identity and your organisation's registration"}.</li>
            <li className="flex gap-3"><Badge tone="green">2</Badge> We check the budget ({budget}) is realistic for the work asked and that nothing is charged to artists.</li>
            <li className="flex gap-3"><Badge tone="green">3</Badge> We read the rights and selection process for clarity and fairness to artists.</li>
            <li className="flex gap-3"><Badge tone="green">4</Badge> The call goes live on {fmtDate(form.opens)}, and applications arrive in your Curator Desk.</li>
          </ol>
          <Notice tone="info">
            If we ask for changes you&apos;ll see exactly why. You can reply, fix and resubmit, or ask for a second reviewer if you disagree with a decision.
          </Notice>
          <div className="flex flex-wrap gap-2">
            <Button href="/curator">Open Curator Desk</Button>
            <Button href="/opportunities" variant="ghost">Back to open calls</Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
      <form onSubmit={submit} noValidate className="flex min-w-0 flex-col gap-8">
        {errorCount > 0 && (
          <div ref={summaryRef} tabIndex={-1} role="alert" className="rounded-[4px] border border-alert/30 bg-alert-bg p-4 text-sm outline-none">
            <p className="font-semibold text-alert">{errorCount} {errorCount === 1 ? "thing needs" : "things need"} attention before this can be reviewed</p>
            <ul className="mt-2 flex flex-col gap-1 text-grey-800">
              {Object.entries(errors).map(([k, v]) => <li key={k}>• <a href={`#${fid(k)}`} className="underline underline-offset-2">{v}</a></li>)}
            </ul>
          </div>
        )}

        <Card as="section" className="flex flex-col gap-4 p-5">
          <h2 className="font-playfair text-lg font-semibold text-green-950">Who is publishing</h2>
          <fieldset>
            <legend className="sr-only">Publishing as</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {([
                { id: "halima", title: "Halima Sani", sub: "Independent curator · Abuja" },
                { id: "new", title: "A new organisation", sub: "Not yet verified on Artelia" },
              ] as const).map((o) => (
                <label key={o.id} className={cn("flex cursor-pointer items-start gap-3 rounded-[4px] border p-3", organiser === o.id ? "border-green-950 bg-sand-100" : "border-sand-200")}>
                  <input type="radio" name={`${id}-org`} checked={organiser === o.id} onChange={() => { setOrganiser(o.id); set("organisation", o.id === "halima" ? INITIAL.organisation : ""); }} className="mt-1 accent-green-950" />
                  <span className="text-sm">
                    <span className="block font-semibold text-green-950">{o.title}</span>
                    <span className="block text-xs text-grey-700">{o.sub}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
          {organiser === "halima" ? (
            <div className="flex flex-wrap items-center gap-2 text-sm text-grey-800">
              <TrustLabel source="verified" /> Identity and curatorial record verified on Mar 4, 2026. Your call can go live after a content review.
            </div>
          ) : (
            <Notice tone="trust" title="Verification comes first">
              Curators, galleries, institutions and high-value commissioners are verified before a call is published. We&apos;ll ask for ID and, for organisations, a registration certificate. It usually takes two working days and you can keep drafting meanwhile.
            </Notice>
          )}
          <Field id={fid("organisation")} label="Commissioning organisation" error={err("organisation")}>
            <input id={fid("organisation")} value={form.organisation} onChange={(e) => set("organisation", e.target.value)} className={inputCls} {...described("organisation")} />
          </Field>
        </Card>

        <Card as="section" className="flex flex-col gap-4 p-5">
          <h2 className="font-playfair text-lg font-semibold text-green-950">The call</h2>
          <Field id={fid("title")} label="Title" error={err("title")}>
            <input id={fid("title")} value={form.title} onChange={(e) => set("title", e.target.value)} className={inputCls} placeholder="e.g. Figure & Ground: Emerging West African Figurative Painters" {...described("title")} />
          </Field>
          <Field id={fid("theme")} label="Theme" hint="One sentence artists can respond to." error={err("theme")}>
            <input id={fid("theme")} value={form.theme} onChange={(e) => set("theme", e.target.value)} className={inputCls} placeholder="e.g. The figure in domestic space" {...described("theme")} />
          </Field>
          <fieldset id={fid("media")} {...described("media")}>
            <legend className="text-sm font-semibold text-green-950">Eligible media <span className="text-alert" aria-hidden>*</span></legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {MEDIA.map((m) => <Chip key={m} selected={form.media.includes(m)} onToggle={() => toggle("media", m)}>{m}</Chip>)}
            </div>
            {err("media") && <p id={`${fid("media")}-error`} className="mt-1 text-xs font-semibold text-alert">{err("media")}</p>}
          </fieldset>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id={fid("geography")} label="Geography" error={err("geography")}>
              <input id={fid("geography")} value={form.geography} onChange={(e) => set("geography", e.target.value)} className={inputCls} placeholder="e.g. West Africa (resident)" {...described("geography")} />
            </Field>
            <Field id={fid("experience")} label="Experience level" error={err("experience")}>
              <select id={fid("experience")} value={form.experience} onChange={(e) => set("experience", e.target.value)} className={inputCls} {...described("experience")}>
                <option value="">Choose…</option>
                {EXPERIENCE.map((x) => <option key={x}>{x}</option>)}
              </select>
            </Field>
          </div>
          <Field id={fid("works")} label="Number of works" error={err("works")}>
            <input id={fid("works")} value={form.works} onChange={(e) => set("works", e.target.value)} className={inputCls} placeholder="e.g. Up to 3 works" {...described("works")} />
          </Field>
        </Card>

        <Card as="section" className="flex flex-col gap-4 p-5">
          <h2 className="font-playfair text-lg font-semibold text-green-950">Budget and rights</h2>
          <p className="-mt-2 text-sm text-grey-700">Calls without a disclosed budget are not published. Artists decide faster, and more fairly, when they know the money.</p>
          <div className="grid gap-4 sm:grid-cols-[120px_minmax(0,1fr)]">
            <div>
              <label htmlFor={fid("currency")} className="text-sm font-semibold text-green-950">Currency</label>
              <select id={fid("currency")} value={form.currency} onChange={(e) => set("currency", e.target.value)} className={inputCls}>
                <option value="NGN">₦ NGN</option>
                <option value="USD">US$ USD</option>
              </select>
            </div>
            <Field id={fid("budgetAmount")} label="Budget or fee" error={err("budgetAmount")}>
              <input id={fid("budgetAmount")} inputMode="numeric" value={form.budgetAmount} onChange={(e) => set("budgetAmount", e.target.value.replace(/[^\d]/g, ""))} className={inputCls} placeholder="500000" {...described("budgetAmount")} />
            </Field>
          </div>
          <Field id={fid("budgetCovers")} label="What the budget covers" error={err("budgetCovers")}>
            <input id={fid("budgetCovers")} value={form.budgetCovers} onChange={(e) => set("budgetCovers", e.target.value)} className={inputCls} placeholder="e.g. artist fee + shipping covered" {...described("budgetCovers")} />
          </Field>
          <div>
            <label className="flex items-start gap-2 text-sm text-grey-800">
              <input id={fid("noEntryFee")} type="checkbox" checked={form.noEntryFee} onChange={(e) => set("noEntryFee", e.target.checked)} className="mt-1 accent-green-950" {...described("noEntryFee")} />
              I confirm artists will not be charged anything to apply or to be selected.
            </label>
            {err("noEntryFee") && <p id={`${fid("noEntryFee")}-error`} className="mt-1 text-xs font-semibold text-alert">{err("noEntryFee")}</p>}
          </div>
          <fieldset id={fid("rights")} {...described("rights")}>
            <legend className="text-sm font-semibold text-green-950">Rights requested <span className="text-alert" aria-hidden>*</span></legend>
            <p className="text-xs text-grey-700">Plain-language templates. Choose custom only if you must — we&apos;ll review it closely.</p>
            <div className="mt-2 flex flex-col gap-2">
              {RIGHTS.map((r) => (
                <label key={r.id} className={cn("flex cursor-pointer items-start gap-3 rounded-[4px] border p-3 text-sm", form.rights === r.id ? "border-green-950 bg-sand-100" : "border-sand-200")}>
                  <input type="radio" name={`${id}-rights`} checked={form.rights === r.id} onChange={() => set("rights", r.id)} className="mt-1 accent-green-950" />
                  <span>
                    <span className="block font-semibold text-green-950">{r.label}</span>
                    {r.text && <span className="block text-grey-700">{r.text}</span>}
                  </span>
                </label>
              ))}
            </div>
            {err("rights") && <p id={`${fid("rights")}-error`} className="mt-1 text-xs font-semibold text-alert">{err("rights")}</p>}
          </fieldset>
          {form.rights === "custom" && (
            <Field id={fid("customRights")} label="Your rights terms" error={err("customRights")}>
              <textarea id={fid("customRights")} rows={3} value={form.customRights} onChange={(e) => set("customRights", e.target.value)} className={inputCls} {...described("customRights")} />
            </Field>
          )}
        </Card>

        <Card as="section" className="flex flex-col gap-4 p-5">
          <h2 className="font-playfair text-lg font-semibold text-green-950">Selection and materials</h2>
          <Field id={fid("selection")} label="Selection process" error={err("selection")}>
            <select id={fid("selection")} value={form.selection} onChange={(e) => set("selection", e.target.value)} className={inputCls} {...described("selection")}>
              <option value="">Choose…</option>
              {SELECTION.map((s) => <option key={s}>{s}</option>)}
            </select>
          </Field>
          <fieldset id={fid("materials")} {...described("materials")}>
            <legend className="text-sm font-semibold text-green-950">Required portfolio materials <span className="text-alert" aria-hidden>*</span></legend>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {MATERIALS.map((m) => (
                <label key={m} className="flex items-center gap-2 text-sm text-grey-800">
                  <input type="checkbox" checked={form.materials.includes(m)} onChange={() => toggle("materials", m)} className="accent-green-950" />
                  {m}
                </label>
              ))}
            </div>
            {err("materials") && <p id={`${fid("materials")}-error`} className="mt-1 text-xs font-semibold text-alert">{err("materials")}</p>}
          </fieldset>
          <Field id={fid("wordLimit")} label="Statement word limit" hint="Artists see a live word count against this." error={err("wordLimit")}>
            <input id={fid("wordLimit")} inputMode="numeric" value={form.wordLimit} onChange={(e) => set("wordLimit", e.target.value.replace(/[^\d]/g, ""))} className={cn(inputCls, "max-w-[160px]")} {...described("wordLimit")} />
          </Field>
        </Card>

        <Card as="section" className="flex flex-col gap-4 p-5">
          <h2 className="font-playfair text-lg font-semibold text-green-950">Timetable</h2>
          <p className="-mt-2 text-sm text-grey-700">Applicants are told at every date, whatever the outcome.</p>
          <div className="grid gap-4 sm:grid-cols-3">
            {([["opens", "Call opens"], ["deadline", "Deadline"], ["decision", "Decisions sent"]] as const).map(([k, label]) => (
              <Field key={k} id={fid(k)} label={label} error={err(k)}>
                <input id={fid(k)} type="date" value={form[k]} onChange={(e) => set(k, e.target.value)} className={inputCls} {...described(k)} />
              </Field>
            ))}
          </div>
        </Card>

        <div className="flex flex-col gap-3 border-t border-sand-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-grey-700">Every field marked <span className="text-alert">*</span> is required. A person reviews your call before it goes live.</p>
          <Button type="submit" size="lg" icon={<ShieldTick size={18} color="currentColor" aria-hidden />}>Send for review</Button>
        </div>
      </form>

      <aside className="flex flex-col gap-4 lg:sticky lg:top-6 lg:self-start" aria-label="Preview and pricing">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-grey-700">Live preview</p>
          <Card className="mt-2 overflow-hidden" as="article">
            <Media src={IMG.paintingStudio} alt="" ratio="16/7" sizes="360px" />
            <div className="flex flex-col gap-3 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="neutral">Draft</Badge>
                {organiser === "halima" ? <TrustLabel source="verified" compact /> : <Badge tone="alert">Verification pending</Badge>}
              </div>
              <p className="font-playfair text-lg font-semibold leading-snug text-green-950">{form.title || "Your call title"}</p>
              <p className="text-sm text-grey-800">{form.organisation || "Organisation"}</p>
              <p className="text-sm text-grey-700">{form.theme || "Theme"}</p>
              <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
                {[
                  ["Media", form.media.join(", ")],
                  ["Geography", form.geography],
                  ["Experience", form.experience],
                  ["Budget / fee", budget],
                  ["Rights", RIGHTS.find((r) => r.id === form.rights)?.label ?? ""],
                  ["Deadline", form.deadline ? fmtDate(form.deadline) : ""],
                ].map(([label, value]) => (
                  <div key={label} className="min-w-0">
                    <dt className="font-semibold uppercase tracking-[0.06em] text-grey-700">{label}</dt>
                    <dd className={cn("mt-0.5 line-clamp-2", value ? "text-green-950" : "italic text-grey-600")}>
                      {value || (label === "Budget / fee" ? "Required" : "—")}
                    </dd>
                  </div>
                ))}
              </dl>
              {rightsText && <p className="rounded-[2px] bg-sand-100 p-2 text-xs text-grey-800">{rightsText}</p>}
            </div>
          </Card>
          {!form.budgetAmount && (
            <p className="mt-2 flex items-start gap-1.5 text-xs text-alert">
              <Warning2 size={14} color="currentColor" className="mt-0.5 shrink-0" aria-hidden /> Without a budget this call can&apos;t be published.
            </p>
          )}
        </div>

        <Card tone="sand" className="p-5">
          <h2 className="text-sm font-semibold text-green-950">Pricing for professional open calls</h2>
          <ul className="mt-3 flex flex-col gap-2 text-sm text-grey-800">
            <li className="flex gap-2"><TickCircle size={16} variant="Bold" color="var(--color-verified)" className="mt-0.5 shrink-0" aria-hidden /> Artists never pay to apply.</li>
            <li className="flex gap-2"><TickCircle size={16} variant="Bold" color="var(--color-verified)" className="mt-0.5 shrink-0" aria-hidden /> Independent curators: first call free during the pilot, then US$120 per call.</li>
            <li className="flex gap-2"><TickCircle size={16} variant="Bold" color="var(--color-verified)" className="mt-0.5 shrink-0" aria-hidden /> Galleries and institutions: from US$450 per call, including the Curator Desk.</li>
            <li className="flex gap-2"><TickCircle size={16} variant="Bold" color="var(--color-verified)" className="mt-0.5 shrink-0" aria-hidden /> White-labelled calls and programmes for partners on request.</li>
          </ul>
          <Link href="/membership" className="mt-3 inline-block text-sm font-semibold text-green-950 underline underline-offset-4">Compare workspace plans</Link>
        </Card>
      </aside>
    </div>
  );
}
