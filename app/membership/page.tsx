// Covers: B1, B2 (also T4 — no ads or data sales; P3 — no paid visibility)
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Coin1, EyeSlash, Heart, TickCircle } from "iconsax-reactjs";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import { PageHeader, SectionHeader } from "@/components/ui/Headers";
import Media from "@/components/ui/Media";
import Notice from "@/components/ui/Notice";
import Page from "@/components/ui/Page";
import { IMG } from "@/lib/data";
import { ARTIST_FREE } from "./_data";
import PlanExplorer from "./_components/PlanExplorer";

export const metadata: Metadata = { title: "Membership" };

const PRINCIPLES = [
  { Icon: Heart, title: "Artists are the community, not the customer", body: "No subscription on artists. More artists joining makes Connect better for everyone." },
  { Icon: Coin1, title: "We earn when outcomes happen", body: "Commission on a sale, a fee on a funded project, a fee on a verified call — not on attention." },
  { Icon: EyeSlash, title: "Nobody can pay to be seen", body: "No boosted profiles, no sponsored ranking, no ads — and we never sell data." },
];

export default function MembershipPage() {
  return (
    <Page>
      <PageHeader
        eyebrow="Membership"
        title="Who pays, and for what"
        description="Artelia Connect is paid for by the people who get professional value from it — collectors, curators, galleries and institutions — and by the successful outcomes it creates."
      />

      <Card tone="green" as="section" className="mt-8 overflow-hidden p-0">
        <div className="grid md:grid-cols-[minmax(0,1fr)_300px]">
          <div className="p-6 sm:p-8">
            <Badge tone="gold">Artists · free, always</Badge>
            <h2 className="mt-4 font-playfair text-3xl font-bold leading-tight md:text-4xl">Artists never pay to be discovered.</h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/85 md:text-base">
              Everything an artist needs to be found, connect, apply and collaborate is free. There is no premium artist tier and no way to buy a higher place.
            </p>
            <ul className="mt-6 grid gap-2 sm:grid-cols-2">
              {ARTIST_FREE.map((f) => (
                <li key={f.label}>
                  <Link href={f.href} className="flex items-start gap-2 text-sm text-white hover:underline">
                    <TickCircle size={18} variant="Bold" color="var(--color-gold-400)" className="mt-px shrink-0" aria-hidden />
                    {f.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <Media src={IMG.studioWide} alt="" ratio="3/4" sizes="(max-width: 768px) 100vw, 300px" className="hidden md:block md:h-full" />
        </div>
      </Card>

      <ul className="mt-6 grid gap-4 md:grid-cols-3">
        {PRINCIPLES.map(({ Icon, title, body }) => (
          <Card as="li" key={title} className="flex gap-3 p-5">
            <Icon size={22} variant="Bulk" color="var(--color-ruby-600)" className="mt-0.5 shrink-0" aria-hidden />
            <div>
              <p className="font-semibold text-green-950">{title}</p>
              <p className="mt-1 text-sm text-grey-800">{body}</p>
            </div>
          </Card>
        ))}
      </ul>

      <section aria-labelledby="streams-heading" className="mt-14">
        <SectionHeader
          id="streams-heading"
          title="What people pay for"
          description="Eight ways Connect sustains itself. Filter by who you are to see what's relevant to you."
        />
        <Notice tone="info" title="Illustrative prices" className="mt-4">
          All prices on this page are illustrative, for discussion during the 12-week pilot. Final pricing will be set with pilot participants and localised by
          market.
        </Notice>
        <div className="mt-6">
          <PlanExplorer />
        </div>
      </section>

      <section aria-labelledby="example-heading" className="mt-14">
        <SectionHeader id="example-heading" title="One project, followed through" description="An illustrative walk-through, modelled on Salt Water Memory — Adaeze and Moussa's installation. Neither artist is charged." />
        <ol className="mt-4 grid gap-3 md:grid-cols-4">
          {[
            { who: "Adaeze & Moussa", what: "Met through a curated introduction, tested the idea privately, signed a 50:50 charter.", pays: "Nothing" },
            { who: "A commissioning gallery", what: "Publishes a verified call, selects the pair and funds the work as a protected project.", pays: "Call fee + project protection" },
            { who: "The funded budget", what: "5% facilitation is added on top — each artist's share stays whole.", pays: "Facilitation fee" },
            { who: "A collector", what: "Buys one panel after a private studio visit.", pays: "Marketplace commission" },
          ].map((s, i) => (
            <Card as="li" key={s.who} className="flex flex-col gap-2 p-4">
              <span className="text-xs font-semibold text-ruby-600">Step {i + 1}</span>
              <p className="font-semibold text-green-950">{s.who}</p>
              <p className="text-sm text-grey-800">{s.what}</p>
              <p className="mt-auto pt-2 text-xs">
                <span className="text-grey-700">Pays: </span>
                <span className="font-semibold text-green-950">{s.pays}</span>
              </p>
            </Card>
          ))}
        </ol>
        <Link href="/studio/salt-water-memory" className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-green-950 underline underline-offset-4">
          Open the project room <ArrowRight size={16} color="currentColor" aria-hidden />
        </Link>
      </section>

      <div className="mt-12 flex flex-col items-center gap-2 border-t border-sand-200 pt-8 text-center">
        <p className="font-playfair text-lg font-semibold text-green-950">No ads. No data sales. No paid ranking.</p>
        <p className="max-w-md text-sm text-grey-700">
          That&apos;s the whole business model.{" "}
          <Link href="/trust#data" className="font-semibold text-green-950 underline underline-offset-4">
            Read our data promises
          </Link>
          .
        </p>
      </div>
    </Page>
  );
}
