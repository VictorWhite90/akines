// Covers: every requirement — this page maps docs/concept-requirements.md to the screens that satisfy it.
import Link from "next/link";
import { ArrowRight, TickCircle } from "iconsax-reactjs";
import Card from "@/components/ui/Card";
import { PageHeader, SectionHeader } from "@/components/ui/Headers";
import Notice from "@/components/ui/Notice";
import Page from "@/components/ui/Page";
import { GROUPS, USE_CASES } from "./_coverage";

export const metadata = { title: "Concept coverage" };

export default function ConceptPage() {
  const total = GROUPS.reduce((n, g) => n + g.items.length, 0);

  return (
    <Page>
      <PageHeader
        eyebrow="About this prototype"
        title="Concept coverage"
        description={`Every requirement in the Artelia Connect concept note, and where it lives in this prototype — ${total} requirements and ${USE_CASES.length} use cases.`}
      />

      <Notice tone="trust" title="The test every screen was held to" className="mt-8">
        Does it help people form a meaningful creative relationship or produce a credible creative outcome? If it mainly increases
        screen time, it doesn&apos;t sit at the centre of Artelia Connect.
      </Notice>

      <section aria-labelledby="usecases-heading" className="mt-12">
        <SectionHeader id="usecases-heading" title="Walk the use cases" description="Each path follows one of the concept note's six initial use cases, screen by screen." />
        <ol className="mt-5 grid gap-4 md:grid-cols-2">
          {USE_CASES.map((uc) => (
            <Card as="li" key={uc.id} className="p-5">
              <p className="text-xs font-bold text-ruby-600">{uc.id}</p>
              <p className="mt-1 font-playfair text-lg font-semibold leading-snug text-green-950">{uc.title}</p>
              <ol className="mt-4 flex flex-col gap-2">
                {uc.steps.map((step, i) => (
                  <li key={`${step.href}-${i}`} className="flex items-center gap-3 text-sm">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sand-100 text-[11px] font-bold text-green-950">{i + 1}</span>
                    <Link href={step.href} className="text-green-950 underline-offset-4 hover:underline">
                      {step.label}
                    </Link>
                  </li>
                ))}
              </ol>
            </Card>
          ))}
        </ol>
      </section>

      {GROUPS.map((group) => (
        <section key={group.id} aria-labelledby={`group-${group.id}`} className="mt-12">
          <SectionHeader id={`group-${group.id}`} eyebrow={group.id} title={group.title} />
          <div className="mt-4 overflow-x-auto rounded-[4px] border border-sand-200 bg-white">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-sand-200 bg-sand-100 text-xs uppercase tracking-[0.08em] text-grey-700">
                <tr>
                  <th scope="col" className="w-16 px-4 py-3">ID</th>
                  <th scope="col" className="px-4 py-3">Requirement</th>
                  <th scope="col" className="px-4 py-3">Where to see it</th>
                </tr>
              </thead>
              <tbody>
                {group.items.map((req) => (
                  <tr key={req.id} className="border-b border-sand-200 last:border-0 align-top">
                    <th scope="row" className="px-4 py-4 font-bold text-green-950">
                      <span className="inline-flex items-center gap-1.5">
                        <TickCircle size={16} variant="Bold" color="var(--color-verified)" aria-hidden />
                        {req.id}
                      </span>
                    </th>
                    <td className="px-4 py-4">
                      <p className="font-semibold text-green-950">{req.title}</p>
                      <p className="mt-0.5 text-grey-700">{req.detail}</p>
                    </td>
                    <td className="px-4 py-4">
                      <ul className="flex flex-col gap-1.5">
                        {req.screens.map((screen) => (
                          <li key={`${req.id}-${screen.href}-${screen.label}`}>
                            <Link href={screen.href} className="inline-flex items-center gap-1 text-green-950 underline-offset-4 hover:underline">
                              {screen.label} <ArrowRight size={14} color="currentColor" aria-hidden />
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </Page>
  );
}
