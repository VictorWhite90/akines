// Covers: T1, T2, T3, T4, T5, T6, T7, T8 (also W3 — wellbeing data separation; U1/U3 — verified curators & institutions)
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CloseCircle, Danger, Judge, ShieldTick, TickCircle, Warning2 } from "iconsax-reactjs";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { PageHeader, SectionHeader } from "@/components/ui/Headers";
import Notice from "@/components/ui/Notice";
import Page from "@/components/ui/Page";
import TrustLabel from "@/components/ui/TrustLabel";
import { ME, getCall, getPerson } from "@/lib/data";
import { DATA_PROMISES, EVIDENCE, LABEL_EXAMPLES, MATCH_SIGNALS, MY_VERIFICATION, NEVER_USED, REVIEW_TIMELINE, STANDARDS, WARNING_SIGNS, WHO_IS_VERIFIED } from "./_data";
import { AppealForm, EvidencePackButton, ReportForm } from "./_components/Forms";
import MatchingControls from "./_components/MatchingControls";
import PortfolioProtection from "./_components/PortfolioProtection";

export const metadata: Metadata = { title: "Trust & safety" };

const JUMP = [
  { id: "verification", label: "Verification" },
  { id: "labels", label: "Labels" },
  { id: "matching", label: "Matching" },
  { id: "data", label: "Your data" },
  { id: "portfolio", label: "Portfolio protection" },
  { id: "scams", label: "Scams" },
  { id: "standards", label: "Standards" },
  { id: "appeals", label: "Appeals" },
];

const LABEL_MEANING = {
  verified: "Artelia checked it against documents or records.",
  "self-declared": "The member said it. We haven't checked it.",
  ai: "Suggested by our matching model — with a reason, and yours to dismiss.",
} as const;

export default function TrustPage() {
  const prize = getCall("unverified-prize");

  return (
    <Page>
      <PageHeader
        eyebrow="Trust & safety"
        title="Knowing who and what to trust"
        description="How we verify people, label information, protect your work, catch scams and make decisions — with a person, not an algorithm, having the final word."
      />

      <nav aria-label="On this page" className="mt-6">
        <ul className="flex flex-wrap gap-2">
          {JUMP.map((j) => (
            <li key={j.id}>
              <a href={`#${j.id}`} className="inline-flex rounded-full border border-sand-300 bg-white px-3 py-1.5 text-xs font-semibold text-green-950 hover:border-green-950">
                {j.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-10 flex flex-col gap-14">
        {/* T1 */}
        <section aria-labelledby="verification" className="scroll-mt-24">
          <SectionHeader id="verification" eyebrow="T1 · Verification" title="Your verification" description="Verification is free for artists. It helps curators and collectors trust you, and it's what lets you apply to calls from institutions." />
          <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
            <Card className="p-5">
              <div className="flex items-center gap-3">
                <Avatar name={ME.name} size="lg" verified={ME.verified} />
                <div>
                  <p className="font-semibold text-green-950">{ME.name}</p>
                  <p className="text-sm text-grey-700">
                    {ME.title} · {ME.city}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge tone="green" icon={<ShieldTick size={12} variant="Bold" color="currentColor" aria-hidden />}>
                  Identity verified
                </Badge>
                <Badge tone="green" icon={<ShieldTick size={12} variant="Bold" color="currentColor" aria-hidden />}>
                  Professional verified
                </Badge>
              </div>
              <ul className="mt-4 flex flex-col gap-3">
                {MY_VERIFICATION.map((v) => (
                  <li key={v.label} className="flex items-start gap-3 text-sm">
                    <TickCircle size={18} variant="Bold" color="var(--color-verified)" className="mt-0.5 shrink-0" aria-hidden />
                    <div>
                      <p className="font-semibold text-green-950">{v.label}</p>
                      <p className="text-grey-800">{v.detail}</p>
                      <p className="text-xs text-grey-700">{v.date}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-xs text-grey-700">We keep the check result, not your documents — ID images are deleted within 30 days.</p>
            </Card>
            <div>
              <p className="text-sm font-semibold text-green-950">What verification means for the people who approach you</p>
              <ul className="mt-3 grid gap-3 sm:grid-cols-2">
                {WHO_IS_VERIFIED.map((w) => {
                  const person = w.personId ? getPerson(w.personId) : null;
                  return (
                    <Card as="li" key={w.who} className="flex flex-col gap-2 p-4">
                      <p className="font-playfair text-lg font-semibold text-green-950">{w.who}</p>
                      <ul className="flex flex-col gap-1 text-sm text-grey-800">
                        {w.checks.map((c) => (
                          <li key={c} className="flex gap-2">
                            <ShieldTick size={14} variant="Bulk" color="var(--color-verified)" className="mt-1 shrink-0" aria-hidden />
                            {c}
                          </li>
                        ))}
                      </ul>
                      <p className="text-xs text-grey-700">{w.why}</p>
                      {person && (
                        <Link href={`/people/${person.id}`} className="mt-auto flex items-center gap-2 pt-1 text-sm text-green-950 hover:underline">
                          <Avatar name={person.name} size="xs" verified={person.verified} />
                          <span>e.g. {person.name}</span>
                        </Link>
                      )}
                    </Card>
                  );
                })}
              </ul>
            </div>
          </div>
        </section>

        {/* T2 */}
        <section aria-labelledby="labels" className="scroll-mt-24">
          <SectionHeader id="labels" eyebrow="T2 · Labels" title="Three labels, everywhere" description="Wherever a fact or recommendation appears, it tells you where it came from." />
          <ul className="mt-4 grid gap-4 md:grid-cols-3">
            {LABEL_EXAMPLES.map((l) => (
              <Card as="li" key={l.source} className="flex flex-col gap-3 p-5">
                <TrustLabel source={l.source} className="self-start" />
                <p className="text-sm font-semibold text-green-950">{LABEL_MEANING[l.source]}</p>
                <p className="rounded-[4px] bg-sand-100 p-3 text-sm text-grey-800">{l.example}</p>
              </Card>
            ))}
          </ul>
        </section>

        {/* T3 */}
        <section aria-labelledby="matching" className="scroll-mt-24">
          <SectionHeader id="matching" eyebrow="T3 · Matching" title="How matching works — and your controls" description="Introductions are about complementarity, not popularity. Every one explains itself, and you can say no." />
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <Card className="p-5">
              <h3 className="font-playfair text-lg font-semibold text-green-950">What we look at</h3>
              <ul className="mt-3 flex flex-col gap-2 text-sm text-grey-800">
                {MATCH_SIGNALS.map((s) => (
                  <li key={s} className="flex gap-2">
                    <TickCircle size={16} variant="Bulk" color="var(--color-verified)" className="mt-0.5 shrink-0" aria-hidden />
                    {s}
                  </li>
                ))}
              </ul>
              <h3 className="mt-5 font-playfair text-lg font-semibold text-green-950">What we never use</h3>
              <ul className="mt-3 flex flex-col gap-2 text-sm text-grey-800">
                {NEVER_USED.map((s) => (
                  <li key={s} className="flex gap-2">
                    <CloseCircle size={16} variant="Bulk" color="var(--color-alert)" className="mt-0.5 shrink-0" aria-hidden />
                    {s}
                  </li>
                ))}
              </ul>
              <div className="mt-5 rounded-[4px] bg-ai-bg p-3 text-sm text-grey-800">
                <TrustLabel source="ai" compact className="mr-2" />
                Example explanation: “You both work with migration and memory; Moussa&apos;s sound practice complements your textiles.”
              </div>
            </Card>
            <Card className="p-5">
              <h3 className="font-playfair text-lg font-semibold text-green-950">Your controls</h3>
              <div className="mt-4">
                <MatchingControls />
              </div>
              <div className="mt-2 flex flex-wrap gap-3 border-t border-sand-200 pt-4">
                <Button href="/dna" variant="outline" size="sm">
                  Edit my Creative DNA
                </Button>
                <Button href="/introductions" variant="ghost" size="sm" icon={<ArrowRight size={16} color="currentColor" aria-hidden />}>
                  Review or decline introductions
                </Button>
              </div>
            </Card>
          </div>
        </section>

        {/* T4 */}
        <section aria-labelledby="data" className="scroll-mt-24">
          <SectionHeader id="data" eyebrow="T4 · Data promises" title="What we promise about your data" />
          <Notice tone="private" title="Wellbeing data is in a separate, locked room" className="mt-4">
            Mood canvases, check-ins and reflections are never sold, never used for advertising, and never used to rank you for introductions or opportunities. They
            are not visible to Artelia staff, and they can be deleted instantly from{" "}
            <Link href="/wellbeing" className="font-semibold text-green-950 underline underline-offset-4">
              Creative Wellbeing
            </Link>
            .
          </Notice>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {DATA_PROMISES.map((p) => (
              <Card as="li" key={p.title} className="p-4">
                <p className="font-semibold text-green-950">{p.title}</p>
                <p className="mt-1 text-sm text-grey-800">{p.body}</p>
              </Card>
            ))}
            <Card as="li" tone="sand" className="flex flex-col justify-between gap-3 p-4">
              <p className="text-sm text-grey-800">Want a copy of everything Artelia holds about you?</p>
              <Button href="/dna" variant="outline" size="sm" className="self-start">
                Privacy settings
              </Button>
            </Card>
          </ul>
        </section>

        {/* T5 */}
        <section aria-labelledby="portfolio" className="scroll-mt-24">
          <SectionHeader id="portfolio" eyebrow="T5 · Portfolio protection" title="Protecting your work" description="Watermarks and download protection deter copying. Timestamped evidence helps if it happens anyway." />
          <Card className="mt-4 p-5">
            <PortfolioProtection />
          </Card>
          <Card className="mt-4 p-5">
            <h3 className="font-playfair text-lg font-semibold text-green-950">Timestamped evidence of your work and contributions</h3>
            <p className="mt-1 text-sm text-grey-700">Recorded automatically when you upload, apply or sign. Fingerprints prove a file existed at that moment, unchanged.</p>
            <ol className="mt-4 flex flex-col gap-3">
              {EVIDENCE.map((e) => (
                <li key={e.item} className="flex flex-col gap-1 border-l-2 border-verified/40 pl-4 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                  <div className="min-w-0">
                    <p className="text-xs text-grey-700">{e.date}</p>
                    <Link href={e.href} className="text-sm font-semibold text-green-950 hover:underline">
                      {e.item}
                    </Link>
                  </div>
                  <span className="flex shrink-0 items-center gap-2">
                    <TrustLabel source="verified" compact />
                    <span className="font-mono text-xs text-grey-800">{e.proof}</span>
                  </span>
                </li>
              ))}
            </ol>
            <div className="mt-5">
              <EvidencePackButton />
            </div>
          </Card>
        </section>

        {/* T6 */}
        <section aria-labelledby="scams" className="scroll-mt-24">
          <SectionHeader id="scams" eyebrow="T6 · Scam & impersonation monitoring" title="Spotting a scam before it costs you" description="We watch open calls, payment requests and unsolicited opportunities — and we flag what we find, in plain sight." />
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div className="flex flex-col gap-4">
              <Card className="p-5">
                <h3 className="font-playfair text-lg font-semibold text-green-950">Warning signs</h3>
                <ul className="mt-3 flex flex-col gap-2 text-sm text-grey-800">
                  {WARNING_SIGNS.map((w) => (
                    <li key={w} className="flex gap-2">
                      <Warning2 size={16} variant="Bulk" color="var(--color-alert)" className="mt-0.5 shrink-0" aria-hidden />
                      {w}
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-sm font-semibold text-green-950">A verified Artelia call will never ask you to pay to apply.</p>
              </Card>
              {prize && (
                <Card className="border-alert/30 p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone="alert" icon={<Danger size={12} variant="Bold" color="currentColor" aria-hidden />}>
                      Flagged by monitoring
                    </Badge>
                    <TrustLabel source="self-declared" compact />
                  </div>
                  <h3 className="mt-3 font-playfair text-lg font-semibold text-green-950">{prize.title}</h3>
                  <p className="mt-1 text-sm text-grey-800">{prize.summary}</p>
                  <ul className="mt-3 flex flex-col gap-1.5 text-sm">
                    {prize.flags?.map((f) => (
                      <li key={f} className="flex gap-2 text-alert">
                        <Warning2 size={16} variant="Bold" color="currentColor" className="mt-0.5 shrink-0" aria-hidden />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button href={`/opportunities/${prize.id}`} variant="outline" size="sm" className="mt-4">
                    See how it&apos;s flagged
                  </Button>
                </Card>
              )}
            </div>
            <Card className="p-5">
              <h3 className="font-playfair text-lg font-semibold text-green-950">Report something</h3>
              <p className="mt-1 mb-4 text-sm text-grey-700">Scams, impersonation, payment requests or stolen work.</p>
              <ReportForm />
            </Card>
          </div>
        </section>

        {/* T7 */}
        <section aria-labelledby="standards" className="scroll-mt-24">
          <SectionHeader id="standards" eyebrow="T7 · Community standards" title="How we treat each other" description="Written with artists, curators and collectors in the pilot. They apply in every room, circle, message and project." />
          <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {STANDARDS.map((s) => (
              <Card as="li" key={s.title} className="flex flex-col gap-2 p-5">
                <h3 className="font-playfair text-lg font-semibold text-green-950">{s.title}</h3>
                <p className="text-sm text-grey-800">{s.body}</p>
                <p className="mt-auto rounded-[4px] bg-sand-100 p-3 text-xs text-grey-800">
                  <span className="font-semibold text-green-950">For example: </span>
                  {s.examples}
                </p>
              </Card>
            ))}
            <Card as="li" tone="green" className="flex flex-col gap-2 p-5">
              <h3 className="font-playfair text-lg font-semibold">What happens when a standard is broken</h3>
              <p className="text-sm text-white/85">
                A reviewer looks at the context. Most cases end with a conversation or a warning; repeated or serious harm can mean removal. You always get reasons and a
                way to appeal.
              </p>
            </Card>
          </ul>
        </section>

        {/* T8 */}
        <section aria-labelledby="appeals" className="scroll-mt-24">
          <SectionHeader id="appeals" eyebrow="T8 · Human review & appeals" title="People make the decisions that matter" description="Restricting an account, removing a call, declining verification or removing someone from a circle is always decided by a person." />
          <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
            <Card className="p-5">
              <h3 className="flex items-center gap-2 font-playfair text-lg font-semibold text-green-950">
                <Judge size={20} variant="Bulk" color="currentColor" aria-hidden /> How a decision is made
              </h3>
              <ol className="mt-4 flex flex-col">
                {REVIEW_TIMELINE.map((t, i) => (
                  <li key={t.step} className="relative flex gap-4 pb-5 last:pb-0">
                    {i < REVIEW_TIMELINE.length - 1 && <span aria-hidden className="absolute left-3 top-7 h-[calc(100%-1.5rem)] w-px bg-sand-300" />}
                    <span className="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-950 text-[11px] font-bold text-white">{i + 1}</span>
                    <div>
                      <p className="text-sm font-semibold text-green-950">
                        {t.step} <span className="font-normal text-grey-700">· {t.time}</span>
                      </p>
                      <p className="mt-0.5 text-sm text-grey-800">{t.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
              <div className="mt-5 rounded-[4px] bg-sand-100 p-3 text-sm text-grey-800">
                <p className="font-semibold text-green-950">Your cases</p>
                <p className="mt-1">
                  TS-2391 · You reported an impersonator using your name on another platform. <Badge tone="green">Resolved · 14 Sep</Badge>
                </p>
              </div>
            </Card>
            <Card className="p-5">
              <h3 className="font-playfair text-lg font-semibold text-green-950">Open an appeal</h3>
              <p className="mt-1 mb-4 text-sm text-grey-700">Think we got something wrong? Tell us — appeals are read by someone new.</p>
              <AppealForm />
            </Card>
          </div>
        </section>
      </div>
    </Page>
  );
}
