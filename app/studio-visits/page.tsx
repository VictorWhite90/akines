// Covers: C10, U4, B2, P1, P3 — virtual studio visits grouped by format (live, 360°, VR, recorded), booking,
// a 360° viewer, ask-the-artist, buy from the studio via Artelia Discover, collector-member early access.
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Calendar, Crown1, Shop } from "iconsax-reactjs";
import Avatar from "@/components/ui/Avatar";
import Badge, { type BadgeTone } from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { PageHeader, SectionHeader } from "@/components/ui/Headers";
import Media from "@/components/ui/Media";
import Page from "@/components/ui/Page";
import TrustLabel from "@/components/ui/TrustLabel";
import { ME, getPerson } from "@/lib/data";
import type { StudioVisit } from "@/lib/types";
import AskArtist from "./_components/AskArtist";
import Viewer360 from "./_components/Viewer360";
import VisitAction from "./_components/VisitAction";
import { FORMAT_GROUPS, VISITS } from "./_data";

export const metadata: Metadata = { title: "Studio Visits" };

const FORMAT_TONE: Record<StudioVisit["format"], BadgeTone> = { live: "ruby", "360": "calm", vr: "ai", recorded: "neutral" };

const U4_PATH = [
  { label: "Read a journal", href: "/journals" },
  { label: "Sit in a Presence Room", href: "/rooms" },
  { label: "Visit the studio", href: "#live-heading" },
  { label: "Become a patron", href: "/membership" },
];

function VisitCard({ visit }: { visit: StudioVisit }) {
  const artist = getPerson(visit.artistId);
  const group = FORMAT_GROUPS.find((g) => g.format === visit.format)!;
  const mine = artist.id === ME.id;
  return (
    <Card as="li" className="flex flex-col overflow-hidden p-0">
      <Media src={visit.image} alt="" ratio="16/10" sizes="(max-width: 768px) 100vw, 540px">
        <Badge tone={FORMAT_TONE[visit.format]} className="absolute left-3 top-3">{group.label}</Badge>
      </Media>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <h3 className="font-playfair text-xl font-semibold leading-snug text-green-950">{visit.title}</h3>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <Avatar name={artist.name} size="sm" verified={artist.verified} />
          <Link href={`/people/${artist.id}`} className="font-semibold text-green-950 hover:underline">{mine ? `${artist.name} (you)` : artist.name}</Link>
          <span className="text-grey-700">{artist.title} · {artist.city}</span>
          <TrustLabel source={artist.verified ? "verified" : "self-declared"} compact />
        </div>
        <p className="text-sm text-grey-800">{visit.description}</p>
        <p className="flex items-center gap-2 text-xs text-grey-700">
          <Calendar size={14} color="currentColor" aria-hidden /> {visit.when}
        </p>
        <div className="mt-auto border-t border-sand-200 pt-3">
          {mine ? (
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="gold">You&apos;re hosting</Badge>
              <span className="text-xs text-grey-700">{visit.seatsLeft} of {visit.seats} seats still open</span>
              <Button href="/studio" size="sm" variant="ghost">Prepare in your studio</Button>
            </div>
          ) : (
            <VisitAction visit={visit} artistFirstName={artist.name.split(" ")[0]} />
          )}
        </div>
      </div>
    </Card>
  );
}

export default function StudioVisitsPage() {
  const threeSixty = VISITS.find((v) => v.format === "360");
  const askOptions = VISITS.filter((v) => v.artistId !== ME.id).map((v) => ({
    id: v.id,
    label: `${getPerson(v.artistId).name} — ${v.title}`,
    artistFirstName: getPerson(v.artistId).name.split(" ")[0],
  }));

  return (
    <Page wide>
      <PageHeader
        eyebrow="Connect · Studio Visits"
        title="Step inside the studio"
        description="Meet artists where the work is made — live with a small group, at your own pace in 360°, in VR, or on film. Talk to them directly, and buy from the studio if something stays with you."
        actions={<Button href="/membership" variant="secondary" size="sm" icon={<Crown1 size={16} color="currentColor" aria-hidden />}>Collector membership</Button>}
      />

      <Card tone="sand" className="mt-8 flex flex-col gap-3 p-5 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3">
          <Crown1 size={22} variant="Bulk" color="var(--color-ruby-600)" className="mt-0.5 shrink-0" aria-hidden />
          <p className="text-sm text-grey-800">
            <span className="font-semibold text-green-950">Collector members book live visits 48 hours early.</span> Everyone else can book after that;
            360°, VR and recorded visits are always open to all. Artists never pay to host.
          </p>
        </div>
        <Link href="/membership" className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-green-950 underline underline-offset-4">
          What membership includes <ArrowRight size={14} color="currentColor" aria-hidden />
        </Link>
      </Card>

      <nav aria-label="How collectors often find their artists" className="mt-6">
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-2 text-xs">
          {U4_PATH.map((step, i) => (
            <li key={step.label} className="flex items-center gap-2">
              <Link href={step.href} className="rounded-full border border-sand-300 bg-white px-3 py-1.5 font-semibold text-green-950 hover:border-green-950">
                {i + 1}. {step.label}
              </Link>
              {i < U4_PATH.length - 1 && <ArrowRight size={14} color="var(--color-grey-700)" aria-hidden />}
            </li>
          ))}
        </ol>
      </nav>

      <div className="mt-10 flex flex-col gap-12">
        {FORMAT_GROUPS.map((group) => {
          const visits = VISITS.filter((v) => v.format === group.format);
          if (visits.length === 0) return null;
          return (
            <section key={group.format} aria-labelledby={`${group.format}-heading`} className="flex flex-col gap-4">
              <SectionHeader
                id={`${group.format}-heading`}
                eyebrow={group.label}
                title={group.title}
                description={group.description}
              />
              <ul className="grid grid-cols-1 gap-5 md:grid-cols-2">
                {visits.map((v) => <VisitCard key={v.id} visit={v} />)}
              </ul>

              {group.format === "360" && threeSixty && (
                <Card className="p-5 sm:p-6">
                  <h3 id="viewer-heading" className="font-playfair text-xl font-semibold text-green-950">
                    Look around: {getPerson(threeSixty.artistId).name.split(" ")[0]}&apos;s kiln yard
                  </h3>
                  <p className="mt-1 text-sm text-grey-700">Drag the image, use the arrow keys, or the buttons below. Tap a place to hear the artist&apos;s note about it.</p>
                  <div className="mt-4">
                    <Viewer360 src={threeSixty.image} title={threeSixty.title} />
                  </div>
                </Card>
              )}
            </section>
          );
        })}
      </div>

      <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
        <section aria-labelledby="ask-heading" className="flex flex-col gap-4">
          <SectionHeader id="ask-heading" title="Ask the artist a question" description="Directly, without a gallery in between. Artists choose which questions to answer." />
          <AskArtist options={askOptions} />
        </section>

        <aside aria-labelledby="buy-heading" className="flex flex-col gap-4">
          <Card tone="green" className="flex flex-col gap-4 p-6">
            <Shop size={28} variant="Bulk" color="var(--color-gold-400)" aria-hidden />
            <h2 id="buy-heading" className="font-playfair text-2xl font-semibold text-white">Buy from the studio on Artelia</h2>
            <p className="text-sm text-white/85">
              Saw something on a visit? Every work shown is available through Artelia&apos;s marketplace — the Discover pillar — with
              its story, provenance and the artist paid directly.
            </p>
            <Button href="https://artelia.art" variant="secondary" className="self-start" icon={<ArrowRight size={16} color="currentColor" aria-hidden />}>
              Browse on Artelia
            </Button>
            <p className="text-xs text-white/70">Opens artelia.art. Connect never pushes a sale during a visit.</p>
          </Card>
          <Card className="p-5">
            <p className="text-sm font-semibold text-green-950">After a visit</p>
            <p className="mt-1 text-sm text-grey-700">
              Keep a <Link href="/journals" className="font-semibold text-green-950 underline underline-offset-4">collector journal</Link> about
              what you saw, or read the <Link href="/stories" className="font-semibold text-green-950 underline underline-offset-4">stories</Link> behind the works.
            </p>
          </Card>
        </aside>
      </div>

      <p className="mt-12 border-t border-sand-200 pt-6 text-center text-sm text-grey-700">That&apos;s every studio open this week. New visits are added on Mondays.</p>
    </Page>
  );
}
