// Covers: C5, U6, P2, P3, T1 — Creative Circles directory: your circles vs explore, moderated & small, verified moderators, no member counts.
import type { Metadata } from "next";
import Link from "next/link";
import { Calendar, ShieldTick, TickCircle } from "iconsax-reactjs";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { PageHeader, SectionHeader } from "@/components/ui/Headers";
import Media from "@/components/ui/Media";
import Notice from "@/components/ui/Notice";
import Page from "@/components/ui/Page";
import TrustLabel from "@/components/ui/TrustLabel";
import { CIRCLES, getPerson } from "@/lib/data";
import type { Circle } from "@/lib/types";

export const metadata: Metadata = { title: "Creative Circles" };

function CircleCard({ circle }: { circle: Circle }) {
  const moderators = circle.moderatorIds.map(getPerson);
  return (
    <Card as="li" className="flex flex-col overflow-hidden p-0">
      <Media src={circle.image} alt="" ratio="16/9" sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 360px" />
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="gold">{circle.practice}</Badge>
          {circle.isMember && <Badge tone="green" icon={<TickCircle size={12} variant="Bold" color="currentColor" aria-hidden />}>Member</Badge>}
          {circle.id === "young" && <Badge tone="calm">First five years</Badge>}
        </div>
        <h3 className="font-playfair text-xl font-semibold text-green-950">
          <Link href={`/circles/${circle.id}`} className="hover:underline">{circle.name}</Link>
        </h3>
        <p className="text-sm text-grey-800">{circle.description}</p>
        <div className="flex flex-col gap-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-grey-700">Moderated by</p>
          <ul className="flex flex-col gap-2">
            {moderators.map((m) => (
              <li key={m.id} className="flex flex-wrap items-center gap-2 text-sm">
                <Avatar name={m.name} size="xs" />
                <Link href={`/people/${m.id}`} className="font-semibold text-green-950 hover:underline">{m.name}</Link>
                <TrustLabel source={m.verified ? "verified" : "self-declared"} compact />
              </li>
            ))}
          </ul>
        </div>
        <p className="mt-auto flex items-center gap-2 border-t border-sand-200 pt-3 text-sm text-grey-800">
          <Calendar size={16} color="currentColor" className="shrink-0" aria-hidden />
          <span><span className="font-semibold text-green-950">Next:</span> {circle.nextGathering}</span>
        </p>
        <Button href={`/circles/${circle.id}`} variant={circle.isMember ? "primary" : "outline"} size="sm" className="self-start">
          {circle.isMember ? "Open circle" : "Visit circle"}
        </Button>
      </div>
    </Card>
  );
}

export default function CirclesPage() {
  const mine = CIRCLES.filter((c) => c.isMember);
  const explore = CIRCLES.filter((c) => !c.isMember);
  const young = CIRCLES.find((c) => c.id === "young");

  return (
    <Page wide>
      <PageHeader
        eyebrow="Connect · Creative Circles"
        title="Circles that stay with you"
        description="Small, moderated communities around a practice or a shared experience — for peer support, honest portfolio feedback and mentorship that lasts longer than a conversation."
      />

      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        <Notice tone="trust" title="Kept small on purpose">
          Circles cap their size so people know each other by name. When one grows, it splits — it doesn&apos;t get louder.
        </Notice>
        <Notice tone="info" title="Always moderated">
          Every circle has named moderators, and you can see which are identity-checked. Standards on harassment, plagiarism and appropriation apply everywhere.
        </Notice>
        <Notice tone="private" title="No counts, no rankings">
          We don&apos;t show member numbers or popularity. Choose a circle for its people and purpose.
        </Notice>
      </div>

      {young && (
        <Card tone="sand" className="mt-8 flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <ShieldTick size={24} variant="Bulk" color="var(--color-verified)" className="mt-0.5 shrink-0" aria-hidden />
            <div>
              <p className="font-semibold text-green-950">Starting out and working alone?</p>
              <p className="text-sm text-grey-700">The Young Artists circle is a gentle way in: peer support first, then portfolio feedback, then opportunities we&apos;ve verified.</p>
            </div>
          </div>
          <Button href="/circles/young" size="sm">Meet the Young Artists circle</Button>
        </Card>
      )}

      <section aria-labelledby="mine-heading" className="mt-10">
        <SectionHeader id="mine-heading" title="Your circles" description="Where you already belong." />
        <ul className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {mine.map((c) => <CircleCard key={c.id} circle={c} />)}
        </ul>
      </section>

      <section aria-labelledby="explore-heading" className="mt-12">
        <SectionHeader id="explore-heading" title="Explore circles" description="Listed alphabetically — never by size or activity." />
        <ul className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {[...explore].sort((a, b) => a.name.localeCompare(b.name)).map((c) => <CircleCard key={c.id} circle={c} />)}
        </ul>
      </section>

      <div className="mt-12 flex flex-col items-center gap-2 border-t border-sand-200 pt-8 text-center">
        <TickCircle size={28} variant="Bulk" color="var(--color-verified)" aria-hidden />
        <p className="font-playfair text-lg font-semibold text-green-950">That&apos;s every circle.</p>
        <p className="max-w-md text-sm text-grey-700">
          Missing one? Moderators can propose a new circle — or start with a <Link href="/rooms" className="font-semibold text-green-950 underline underline-offset-4">Presence Room</Link> and see who comes.
        </p>
      </div>
    </Page>
  );
}
