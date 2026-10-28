// Covers: M1, M2, P2 (also P3 — no vanity metrics; B1 — zero artists charged)
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CloseCircle, Location, MessageQuestion } from "iconsax-reactjs";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import { PageHeader, SectionHeader } from "@/components/ui/Headers";
import Notice from "@/components/ui/Notice";
import Page from "@/components/ui/Page";
import Stat from "@/components/ui/Stat";
import TrustLabel from "@/components/ui/TrustLabel";
import { COHORTS, COMMITMENTS, HUBS, INTERVIEW_QUESTIONS, MEASURES, NOT_OPTIMISED, PILOT } from "./_data";
import Progress from "./_components/Progress";

export const metadata: Metadata = { title: "Pilot" };

export default function PilotPage() {
  const weekPct = Math.round((PILOT.week / PILOT.of) * 100);
  const hubTotal = HUBS.reduce((sum, h) => sum + h.members, 0);

  return (
    <Page wide>
      <PageHeader
        eyebrow={`Pilot · week ${PILOT.week} of ${PILOT.of}`}
        title="Is Connect creating real creative outcomes?"
        description="Twelve weeks, a small cohort and honest measures. We count relationships, opportunities, collaborations and income — not screen time."
        actions={
          <Link href="/concept" className="inline-flex items-center gap-1.5 text-sm font-semibold text-green-950 underline underline-offset-4">
            Requirements map <ArrowRight size={16} color="currentColor" aria-hidden />
          </Link>
        }
      />

      <Card className="mt-8 p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="text-sm font-semibold text-green-950">
            Week {PILOT.week} of {PILOT.of}
          </p>
          <p className="text-xs text-grey-700">
            {PILOT.started} – {PILOT.ends} · Nigeria plus selected African and diaspora hubs
          </p>
        </div>
        <ol className="mt-3 grid grid-cols-12 gap-1" aria-label="Pilot weeks">
          {Array.from({ length: PILOT.of }, (_, i) => (
            <li
              key={i}
              aria-current={i + 1 === PILOT.week ? "step" : undefined}
              className={i + 1 < PILOT.week ? "h-2.5 rounded-full bg-green-950" : i + 1 === PILOT.week ? "h-2.5 rounded-full bg-gold-400" : "h-2.5 rounded-full bg-sand-200"}
            >
              <span className="sr-only">
                Week {i + 1}
                {i + 1 < PILOT.week ? ", done" : i + 1 === PILOT.week ? ", this week" : ""}
              </span>
            </li>
          ))}
        </ol>
        <p className="mt-2 text-xs text-grey-700">{weekPct}% through · participant interviews run in weeks 6–8 and 11–12.</p>
      </Card>

      <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <section aria-labelledby="cohort-heading">
          <SectionHeader id="cohort-heading" title="Cohort" description="Target ranges from the concept note. The dark tick marks where each range begins." />
          <Card className="mt-4 flex flex-col gap-5 p-5">
            {COHORTS.map((c) => {
              const target = c.min === c.max ? `${c.max}` : `${c.min}–${c.max}`;
              const inRange = c.current >= c.min;
              return (
                <div key={c.label}>
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="text-sm font-semibold text-green-950">{c.label}</p>
                    <p className="text-sm text-grey-800">
                      <span className="font-playfair text-xl font-bold text-green-950">{c.current}</span> <span className="text-grey-700">/ target {target}</span>
                    </p>
                  </div>
                  <Progress label={c.label} current={c.current} min={c.min} max={c.max} valueText={`${c.current}, target ${target}`} className="mt-2" />
                  <p className="mt-1 text-xs text-grey-700">
                    {inRange ? "In range" : `${c.min - c.current} to go — recruiting through the Lagos and London collector salons`}
                  </p>
                </div>
              );
            })}
          </Card>
        </section>

        <section aria-labelledby="hubs-heading">
          <SectionHeader id="hubs-heading" title="Hubs" description={`${hubTotal} active members across seven hubs.`} />
          <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-2">
            {HUBS.map((h) => (
              <Card as="li" key={h.city} className="flex flex-col gap-1 p-4">
                <div className="flex items-center gap-1.5 text-grey-700">
                  <Location size={14} variant="Bulk" color="currentColor" aria-hidden />
                  <span className="text-xs">{h.country}</span>
                </div>
                <p className="font-playfair text-lg font-semibold text-green-950">{h.city}</p>
                <p className="text-sm text-grey-800">
                  {h.members} members {h.lead && <Badge tone="gold" className="ml-1">Lead hub</Badge>}
                </p>
              </Card>
            ))}
          </ul>
        </section>
      </div>

      <section aria-labelledby="commit-heading" className="mt-12">
        <SectionHeader id="commit-heading" title="Pilot commitments" description="What we promised to make happen in twelve weeks." />
        <ul className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {COMMITMENTS.map((c) => {
            const min = c.min ?? c.target;
            return (
              <Card as="li" key={c.label} className="flex flex-col gap-3 p-5">
                <p className="text-sm font-semibold text-green-950">{c.label}</p>
                <p>
                  <span className="font-playfair text-3xl font-bold text-green-950">{c.current}</span>
                  <span className="text-sm text-grey-700"> of {c.targetLabel}</span>
                </p>
                <Progress label={c.label} current={c.current} min={min} max={c.target} valueText={`${c.current} of ${c.targetLabel}`} />
                <p className="text-sm text-grey-800">{c.note}</p>
                <Link href={c.href} className="mt-auto text-sm font-semibold text-green-950 underline underline-offset-4">
                  See them
                </Link>
              </Card>
            );
          })}
        </ul>
      </section>

      <section aria-labelledby="measures-heading" className="mt-12">
        <SectionHeader
          id="measures-heading"
          title="Success measures"
          description="Seven outcome areas. Figures are from platform records unless marked as survey results (self-declared by participants)."
        />
        <div className="mt-6 flex flex-col gap-8">
          {MEASURES.map((m, i) => (
            <div key={m.area} className="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
              <div>
                <p className="text-xs font-semibold text-ruby-600">{String(i + 1).padStart(2, "0")}</p>
                <h3 className="font-playfair text-xl font-semibold text-green-950">{m.area}</h3>
                <p className="mt-1 text-sm text-grey-700">{m.question}</p>
              </div>
              <ul className={`grid gap-3 sm:grid-cols-2 ${m.indicators.length === 4 ? "xl:grid-cols-4" : "xl:grid-cols-3"}`}>
                {m.indicators.map((ind) => (
                  <li key={ind.label}>
                    <Stat
                      label={ind.label}
                      value={ind.value}
                      hint={
                        /survey|pulse/.test(ind.hint) ? (
                          <span className="flex flex-wrap items-center gap-1.5">
                            {ind.hint} <TrustLabel source="self-declared" compact />
                          </span>
                        ) : (
                          ind.hint
                        )
                      }
                      className="h-full"
                    />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="interviews-heading" className="mt-12">
        <SectionHeader id="interviews-heading" title="What we're asking in interviews" description="Numbers don't tell us whether it felt right. Forty-seven interviews so far; early answers below." />
        <ul className="mt-4 grid gap-4 md:grid-cols-2">
          {INTERVIEW_QUESTIONS.map((q) => (
            <Card as="li" key={q.q} className="flex flex-col gap-3 p-5">
              <div className="flex items-start gap-3">
                <MessageQuestion size={22} variant="Bulk" color="var(--color-ruby-600)" className="mt-0.5 shrink-0" aria-hidden />
                <div>
                  <h3 className="font-playfair text-lg font-semibold text-green-950">{q.q}</h3>
                  <p className="text-xs text-grey-700">
                    {q.who} · {q.done} interviewed
                  </p>
                </div>
              </div>
              <blockquote className="border-l-2 border-gold-400 pl-3 text-sm italic text-grey-800">“{q.quote}”</blockquote>
              <TrustLabel source="self-declared" compact className="self-start" />
            </Card>
          ))}
        </ul>
      </section>

      <section aria-labelledby="not-heading" className="mt-12 rounded-[4px] border-2 border-dashed border-sand-300 bg-sand-100 p-6 sm:p-8">
        <SectionHeader
          id="not-heading"
          eyebrow="Deliberately not measured as success"
          title="What we don't optimise"
          description="If a feature mainly increases screen time, it doesn't belong at the centre of Connect. These numbers are not on any team's dashboard."
        />
        <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {NOT_OPTIMISED.map((n) => (
            <li key={n.label} className="flex items-start gap-3 rounded-[4px] bg-white p-4">
              <CloseCircle size={22} variant="Bulk" color="var(--color-grey-700)" className="mt-0.5 shrink-0" aria-hidden />
              <div>
                <p className="font-semibold text-green-950 line-through decoration-grey-600">{n.label}</p>
                <p className="mt-1 text-sm text-grey-800">{n.why}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <Notice tone="info" className="mt-8">
        Simulated data for the prototype: figures show a plausible week 7 so the founder can see how the pilot would be read, not real results.
      </Notice>
    </Page>
  );
}
