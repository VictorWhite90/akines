// Covers: S2, S9, T1, T2, T6, U1, U3
// S2 every standard field in one definition list + structured apply flow (works + tailored statement)
// S9 timeline and post-submit status stages · T1/T2 organiser trust panel with verified vs self-declared labels
// T6 flagged calls block applying and offer Report · U1/U3 artist side of a curator call and an institutional commission
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CloseCircle, TickCircle, Warning2 } from "iconsax-reactjs";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { PageHeader, SectionHeader } from "@/components/ui/Headers";
import Media from "@/components/ui/Media";
import Notice from "@/components/ui/Notice";
import Page from "@/components/ui/Page";
import TrustLabel from "@/components/ui/TrustLabel";
import { ME, MY_APPLICATIONS, OPEN_CALLS, getCall, getPerson } from "@/lib/data";
import { cn } from "@/lib/cn";
import ApplyFlow from "../_components/ApplyFlow";
import MatchReasons from "../_components/MatchReasons";
import ReportCall from "../_components/ReportCall";
import { MY_ELIGIBILITY, MY_WORKS, ORGANISER_TYPE, STATUS, maxWorks, statementLimit } from "../_data";

export function generateStaticParams() {
  return OPEN_CALLS.map((call) => ({ id: call.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  return { title: getCall(id)?.title ?? "Open call" };
}

const STAGE_LABEL: Record<string, string> = {
  submitted: "Submitted",
  eligibility: "Eligibility checked",
  review: "In review",
  longlist: "Longlisted",
  shortlist: "Shortlisted",
  selected: "Selected",
  "not-selected": "Not selected",
};

function Check({ ok, label }: { ok: boolean; label: string }) {
  return (
    <li className="flex items-start gap-2 text-sm">
      {ok ? (
        <TickCircle size={18} variant="Bold" color="var(--color-verified)" className="mt-0.5 shrink-0" aria-hidden />
      ) : (
        <CloseCircle size={18} variant="Bold" color="var(--color-alert)" className="mt-0.5 shrink-0" aria-hidden />
      )}
      <span className={ok ? "text-grey-800" : "font-semibold text-alert"}>
        <span className="sr-only">{ok ? "Yes: " : "No: "}</span>
        {label}
      </span>
    </li>
  );
}

export default async function CallPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const call = getCall(id);
  if (!call) notFound();

  const flagged = Boolean(call.flags?.length);
  const status = STATUS[call.status];
  const organiser = call.organiserId ? getPerson(call.organiserId) : null;
  const eligibility = MY_ELIGIBILITY[call.id] ?? [];
  const passes = eligibility.filter((e) => e.pass).length;
  const existing = MY_APPLICATIONS.find((a) => a.callId === call.id);
  const rightsStated = call.rightsRequested !== "Not stated";

  const fields: { term: string; value: string | string[]; missing?: boolean }[] = [
    { term: "Commissioning organisation", value: call.organisation },
    { term: "Theme", value: call.theme },
    { term: "Eligible media", value: call.eligibleMedia.join(", ") },
    { term: "Geography", value: call.geography },
    { term: "Experience level", value: call.experienceLevel },
    { term: "Number of works", value: call.numberOfWorks },
    { term: "Budget or fee", value: call.budget ?? "Not disclosed", missing: !call.budget },
    { term: "Rights requested", value: call.rightsRequested, missing: !rightsStated },
    { term: "Selection process", value: call.selectionProcess, missing: call.selectionProcess === "Not stated" },
    { term: "Required materials", value: call.requiredMaterials },
  ];

  return (
    <Page>
      <Link href="/opportunities" className="inline-flex items-center gap-1.5 text-sm font-semibold text-green-950 hover:underline">
        <ArrowLeft size={16} color="currentColor" aria-hidden /> All open calls
      </Link>

      {flagged && (
        <div role="alert" className="mt-6 flex flex-col gap-3 rounded-[4px] border border-alert/30 bg-alert-bg p-5 sm:flex-row sm:items-start">
          <Warning2 size={28} variant="Bold" color="var(--color-alert)" className="shrink-0" aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-alert">This call failed our trust checks. Don&apos;t send money or personal documents.</p>
            <ul className="mt-2 grid gap-1 text-sm text-grey-800 sm:grid-cols-2">
              {call.flags!.map((f) => <li key={f}>• {f}</li>)}
            </ul>
          </div>
        </div>
      )}

      <PageHeader
        className="mt-6"
        eyebrow={`Open call · ${ORGANISER_TYPE[call.organiserType]}`}
        title={call.title}
        description={call.summary}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={flagged ? "alert" : status.tone}>{flagged ? "Flagged" : status.label}</Badge>
            <span className="text-sm text-grey-800">Deadline: <span className="font-semibold text-green-950">{call.deadline}</span></span>
          </div>
        }
      />

      {!flagged && (
        <Media src={call.image} alt="" ratio="21/8" priority sizes="(max-width: 1152px) 100vw, 1100px" className="mt-8 rounded-[4px]" />
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex min-w-0 flex-col gap-10">
          <section aria-labelledby="fields-heading">
            <SectionHeader id="fields-heading" title="The call, in full" description="The same standard fields every call on Artelia must complete." />
            <dl className="mt-4 divide-y divide-sand-200 rounded-[4px] border border-sand-200 bg-white">
              {fields.map((f) => (
                <div key={f.term} className="grid gap-1 p-4 sm:grid-cols-[200px_minmax(0,1fr)] sm:gap-4">
                  <dt className="text-sm font-semibold text-grey-700">{f.term}</dt>
                  <dd className={cn("text-sm", f.missing ? "font-semibold text-alert" : "text-green-950")}>
                    {Array.isArray(f.value) ? (
                      <ul className="flex flex-col gap-1">
                        {f.value.map((v) => <li key={v}>• {v}</li>)}
                      </ul>
                    ) : (
                      f.value
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          <section aria-labelledby="timeline-heading">
            <SectionHeader id="timeline-heading" title="Timeline" description="Dates the organiser has committed to. You'll be told at each one, whatever the outcome." />
            <ol className="mt-4 flex flex-col gap-0 border-l-2 border-sand-300 pl-5">
              {call.timeline.map((t) => (
                <li key={t.label} className="relative pb-4 last:pb-0">
                  <span aria-hidden className={cn("absolute -left-[27px] top-1 h-3 w-3 rounded-full border-2 border-white", t.label === "Deadline" ? "bg-gold-400" : "bg-green-950")} />
                  <p className="text-sm font-semibold text-green-950">{t.label}</p>
                  <p className="text-sm text-grey-700">{t.date}</p>
                </li>
              ))}
            </ol>
          </section>

          <section aria-labelledby="apply-heading" className="scroll-mt-24" id="apply">
            <SectionHeader id="apply-heading" title="Apply" />
            <Card className="mt-4 p-5 sm:p-6">
              {flagged ? (
                <div className="flex flex-col gap-4">
                  <p className="text-sm text-grey-800">
                    Applying is switched off for this call. It asks for a fee before selection and we couldn&apos;t verify who runs it. If it&apos;s genuine, the organiser can complete verification and disclose a budget; a person on our trust team will then review it again.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <ReportCall callTitle={call.title} size="md" />
                    <Button href="/trust" variant="ghost">How we check calls</Button>
                  </div>
                </div>
              ) : existing ? (
                <div className="flex flex-col gap-3">
                  <p className="text-sm text-grey-800">
                    You applied on {existing.submitted} with {existing.selectedWorks.join(" and ")}. Current stage:{" "}
                    <span className="font-semibold text-green-950">{STAGE_LABEL[existing.stage]}</span>.
                  </p>
                  <p className="text-sm text-grey-700">{existing.history.at(-1)?.note ?? existing.feedback}</p>
                  <Button href="/applications" className="self-start">Open my application</Button>
                </div>
              ) : call.status === "closed" ? (
                <p className="text-sm text-grey-800">
                  This call closed on {call.deadline}. Every applicant received a decision. <Link href="/opportunities" className="font-semibold text-green-950 underline underline-offset-2">See calls that are open now</Link>.
                </p>
              ) : (
                <ApplyFlow
                  call={call}
                  works={MY_WORKS}
                  maxWorks={maxWorks(call)}
                  wordLimit={statementLimit(call)}
                  eligibilityGaps={eligibility.filter((e) => !e.pass).map((e) => e.rule.split(":")[0].toLowerCase())}
                />
              )}
            </Card>
          </section>
        </div>

        <aside className="flex flex-col gap-4" aria-label="Trust and eligibility">
          <Card className="p-5">
            <h2 className="font-playfair text-lg font-semibold text-green-950">About the organiser</h2>
            <div className="mt-3 flex items-center gap-3">
              <Avatar name={organiser?.name ?? call.organisation} size="md" verified={call.organiserVerified} />
              <div className="min-w-0">
                {organiser ? (
                  <Link href={`/people/${organiser.id}`} className="font-semibold text-green-950 hover:underline">{organiser.name}</Link>
                ) : (
                  <p className="font-semibold text-green-950">{call.organisation}</p>
                )}
                <p className="text-xs text-grey-700">{organiser ? `${organiser.title} · ${organiser.city}` : ORGANISER_TYPE[call.organiserType]}</p>
              </div>
            </div>
            <ul className="mt-4 flex flex-col gap-2.5">
              <li className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <span className="text-grey-800">Identity & organisation</span>
                {call.organiserVerified ? <TrustLabel source="verified" /> : <Badge tone="alert">Not verified</Badge>}
              </li>
              <Check ok={Boolean(call.budget)} label={call.budget ? "Budget or fee disclosed" : "No budget or fee disclosed"} />
              <Check ok={rightsStated} label={rightsStated ? "Rights stated in plain language" : "Rights not stated"} />
              <Check ok={!call.requiredMaterials.some((m) => /fee/i.test(m))} label={call.requiredMaterials.some((m) => /fee/i.test(m)) ? "Charges artists to apply" : "Free to apply"} />
            </ul>
            <div className="mt-4 rounded-[4px] bg-sand-100 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-grey-700">Commissioner history</p>
              <p className="mt-1 text-sm text-green-950">{call.commissionerHistory}</p>
              <TrustLabel source={call.organiserVerified ? "verified" : "self-declared"} compact className="mt-2" />
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="font-playfair text-lg font-semibold text-green-950">Do I qualify?</h2>
            <p className="mt-1 text-xs text-grey-700">
              {flagged ? "Checked against Artelia's trust rules." : `Checked against your profile, ${ME.name.split(" ")[0]}. ${passes} of ${eligibility.length} rules met.`}
            </p>
            <ul className="mt-4 flex flex-col gap-3">
              {eligibility.map((e) => (
                <li key={e.rule} className="flex items-start gap-2">
                  {e.pass ? (
                    <TickCircle size={18} variant="Bold" color="var(--color-verified)" className="mt-0.5 shrink-0" aria-hidden />
                  ) : (
                    <CloseCircle size={18} variant="Bold" color="var(--color-alert)" className="mt-0.5 shrink-0" aria-hidden />
                  )}
                  <div className="min-w-0 text-sm">
                    <p className="font-semibold text-green-950"><span className="sr-only">{e.pass ? "Met: " : "Not met: "}</span>{e.rule}</p>
                    <p className="mt-0.5 text-grey-700">{e.why}</p>
                    <TrustLabel source={e.source} compact className="mt-1.5" />
                  </div>
                </li>
              ))}
            </ul>
            {!flagged && (
              <Link href="/dna" className="mt-4 inline-block text-xs font-semibold text-green-950 underline underline-offset-2">Something wrong? Update your profile</Link>
            )}
          </Card>

          {call.matchReasons && <MatchReasons reasons={call.matchReasons} callTitle={call.title} />}

          {!flagged && (
            <Notice tone="trust" title="If something feels off">
              Organisers on Artelia never ask for fees, bank details or ID over chat. <Link href="/trust" className="font-semibold underline underline-offset-2">See how we protect applicants</Link>.
            </Notice>
          )}
        </aside>
      </div>
    </Page>
  );
}
