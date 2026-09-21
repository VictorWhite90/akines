// Covers: C6 (voice note, studio video, evolution, materials, influences, failures, meaning), C8 (collector journal + add reflection), C9 (Art Legacy record future owners inherit), C10 (visit the studio / talk to the artist / buy), T2 (verified vs self-declared on every legacy fact), U4 (story → journal → studio visit → patron), P1 (Buy on Artelia = Discover pillar)
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Brush2, Home2, Messages2, ShoppingBag, Video } from "iconsax-reactjs";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import { PageHeader, SectionHeader } from "@/components/ui/Headers";
import Media from "@/components/ui/Media";
import Notice from "@/components/ui/Notice";
import Page from "@/components/ui/Page";
import TrustLabel from "@/components/ui/TrustLabel";
import { ME, getPerson } from "@/lib/data";
import { ALL_STORIES, getAnyStory, mediumOf } from "../_data";
import { INFLUENCE, LEGACY } from "../_components/icons";
import ReflectionForm from "../_components/ReflectionForm";
import StudioVideo from "../_components/StudioVideo";
import VoiceNotePlayer from "../_components/VoiceNotePlayer";

export function generateStaticParams() {
  return ALL_STORIES.map((story) => ({ id: story.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const story = getAnyStory(id);
  return { title: story ? `${story.title} · Stories` : "Story not found" };
}

const SECTIONS = [
  { id: "meaning", label: "Meaning" },
  { id: "voice", label: "Voice note" },
  { id: "studio", label: "Studio video" },
  { id: "evolution", label: "Evolution" },
  { id: "materials", label: "Materials & influences" },
  { id: "wrong", label: "What went wrong" },
  { id: "legacy", label: "Art Legacy" },
  { id: "collectors", label: "Collector journal" },
];

export default async function StoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const story = getAnyStory(id);
  if (!story) notFound();

  const artist = getPerson(story.artistId);
  const firstName = artist.name.split(" ")[0];
  const isMine = artist.id === ME.id;
  const recordVerified = story.legacy.some((e) => e.kind === "created" && e.source === "verified");

  return (
    <Page>
      <Link href="/stories" className="inline-flex items-center gap-1.5 text-sm font-semibold text-green-950 hover:underline">
        <ArrowLeft size={16} color="currentColor" aria-hidden /> All stories
      </Link>

      {/* Hero */}
      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:items-start">
        <Media src={story.image} alt={`${story.title} by ${artist.name}`} ratio="4/3" priority sizes="(max-width: 1024px) 100vw, 600px" className="rounded-[4px]" />
        <div className="flex min-w-0 flex-col gap-6">
          <PageHeader eyebrow={`${mediumOf(story)} · Artwork story`} title={story.title} />
          <div className="-mt-2 flex items-center gap-3">
            <Avatar name={artist.name} size="md" verified={artist.verified} />
            <div className="min-w-0">
              <Link href={`/people/${artist.id}`} className="font-semibold text-green-950 hover:underline">{artist.name}</Link>
              <p className="text-sm text-grey-700">{artist.title} · {artist.city}, {artist.country}</p>
            </div>
            {isMine && <Badge tone="gold">Your work</Badge>}
          </div>

          <dl className="grid grid-cols-2 gap-x-6 gap-y-4 border-y border-sand-200 py-5 text-sm">
            <div><dt className="text-xs font-semibold uppercase tracking-[0.08em] text-grey-700">Year</dt><dd className="mt-1 text-green-950">{story.year}</dd></div>
            <div><dt className="text-xs font-semibold uppercase tracking-[0.08em] text-grey-700">Dimensions</dt><dd className="mt-1 text-green-950">{story.dimensions}</dd></div>
            <div className="col-span-2"><dt className="text-xs font-semibold uppercase tracking-[0.08em] text-grey-700">Medium</dt><dd className="mt-1 text-green-950">{story.medium}</dd></div>
            <div className="col-span-2 flex flex-wrap items-end justify-between gap-2">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.08em] text-grey-700">Price</dt>
                <dd className="mt-1 font-playfair text-2xl font-bold text-green-950">{story.price ?? "Not currently for sale"}</dd>
              </div>
              <TrustLabel source={recordVerified ? "verified" : "self-declared"} />
            </div>
          </dl>

          <div className="flex flex-wrap gap-3">
            <Button href="https://artelia.art" icon={<ShoppingBag size={18} color="currentColor" aria-hidden />}>
              {story.price ? "Buy on Artelia" : "Enquire on Artelia"}
            </Button>
            <Button href="/studio-visits" variant="outline" icon={<Video size={18} color="currentColor" aria-hidden />}>Visit the studio</Button>
            <Button href={`/people/${artist.id}`} variant="ghost" icon={<Messages2 size={18} color="currentColor" aria-hidden />}>Talk to the artist</Button>
          </div>
          <p className="text-xs text-grey-700">
            Purchases happen on Artelia Discover, our marketplace — with authenticity, shipping and payment protection. This story travels with the work.
          </p>
        </div>
      </div>

      <div className="mt-12 grid gap-10 lg:grid-cols-[200px_minmax(0,1fr)]">
        <nav aria-label="In this story" className="hidden lg:block">
          <ol className="sticky top-24 flex flex-col gap-2 border-l border-sand-200 pl-4 text-sm">
            {SECTIONS.map((s) => (
              <li key={s.id}><a href={`#${s.id}`} className="text-grey-800 hover:text-green-950 hover:underline">{s.label}</a></li>
            ))}
          </ol>
        </nav>

        <div className="flex min-w-0 flex-col gap-12">
          <section aria-labelledby="meaning">
            <SectionHeader id="meaning" title="What it means" eyebrow="In the artist's words" />
            <blockquote className="mt-4 border-l-4 border-gold-400 pl-5 font-playfair text-2xl leading-snug text-green-950 md:text-[28px]">
              “{story.meaning}”
            </blockquote>
            <p className="mt-3 flex items-center gap-2 text-sm text-grey-700">— {artist.name} <TrustLabel source="self-declared" compact /></p>
          </section>

          <section aria-labelledby="voice">
            <SectionHeader id="voice" title="Hear it from the artist" description={`${firstName} recorded this in the studio. Listen, or read along.`} />
            <div className="mt-4">
              <VoiceNotePlayer artistName={artist.name} duration={story.voiceNote.duration} transcript={story.voiceNote.transcript} />
            </div>
          </section>

          <section aria-labelledby="studio">
            <SectionHeader id="studio" title="Inside the studio" description="Unedited footage from the making. For a live visit, book a studio session." action={<Button href="/studio-visits" variant="ghost" size="sm">Studio visits</Button>} />
            <div className="mt-4">
              <StudioVideo poster={story.studioVideo.poster} duration={story.studioVideo.duration} caption={story.studioVideo.caption} />
            </div>
          </section>

          <section aria-labelledby="evolution">
            <SectionHeader id="evolution" title="How it evolved" description="From the first sketch to the finished work — including what didn't work." />
            <ol className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {story.evolution.map((step, i) => {
                const isFailure = /fail|crack|collapse|green/i.test(`${step.stage} ${step.note}`);
                return (
                  <li key={step.stage} className="relative rounded-[4px] border border-sand-200 bg-white p-4">
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sand-100 text-xs font-bold text-green-950" aria-hidden>{i + 1}</span>
                      <span className="text-xs text-grey-700">{step.date}</span>
                    </div>
                    <p className="mt-3 font-semibold text-green-950">{step.stage}</p>
                    {isFailure && <Badge tone="ruby" className="mt-2">Didn&apos;t go to plan</Badge>}
                    <p className="mt-2 text-sm text-grey-800">{step.note || (i === story.evolution.length - 1 ? "Finished and signed." : "")}</p>
                  </li>
                );
              })}
            </ol>
          </section>

          <section aria-labelledby="materials" className="grid gap-6 md:grid-cols-2">
            <Card className="p-5">
              <h2 id="materials" className="font-playfair text-xl font-semibold text-green-950">Materials</h2>
              <ul className="mt-4 flex flex-col gap-3">
                {story.materials.map((m) => (
                  <li key={m} className="flex items-start gap-2 text-sm text-grey-800">
                    <Brush2 size={16} color="currentColor" className="mt-0.5 shrink-0 text-ruby-600" aria-hidden /> {m}
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-xs text-grey-700">Curious about a material? <Link href="/companion" className="font-semibold text-green-950 underline underline-offset-4">Ask the Creative Companion</Link></p>
            </Card>
            <Card className="p-5">
              <h2 className="font-playfair text-xl font-semibold text-green-950">Influences</h2>
              <ul className="mt-4 flex flex-col gap-3">
                {story.influences.map((inf) => {
                  const { Icon, label } = INFLUENCE[inf.kind];
                  return (
                    <li key={inf.text} className="flex items-start gap-3 text-sm">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold-300/50 text-ruby-800"><Icon size={16} variant="Bulk" color="currentColor" aria-hidden /></span>
                      <span><span className="block text-xs font-semibold uppercase tracking-[0.08em] text-grey-700">{label}</span><span className="text-green-950">{inf.text}</span></span>
                    </li>
                  );
                })}
              </ul>
            </Card>
          </section>

          <section aria-labelledby="wrong">
            <SectionHeader id="wrong" title="What went wrong" description="Every work has a moment it nearly didn't happen." />
            <Card tone="sand" className="mt-4 p-5">
              <p className="font-playfair text-lg leading-relaxed text-green-950">{story.challenges}</p>
              <p className="mt-3 text-sm text-grey-700">— {firstName}. More of this in <Link href="/journals" className="font-semibold text-green-950 underline underline-offset-4">{firstName}&apos;s journal</Link>.</p>
            </Card>
          </section>

          <section aria-labelledby="legacy">
            <SectionHeader id="legacy" eyebrow="Art Legacy" title="The life of this work" description="Every place it has been, everyone who has lived with it, every memory added. Future owners inherit this history." />
            <ol className="mt-6 flex flex-col">
              {story.legacy.map((event, i) => {
                const { Icon, label } = LEGACY[event.kind];
                const person = event.personId ? getPerson(event.personId) : null;
                const last = i === story.legacy.length - 1;
                return (
                  <li key={`${event.date}-${event.kind}-${i}`} className="relative flex gap-4 pb-6">
                    {!last && <span aria-hidden className="absolute left-5 top-11 bottom-0 w-px bg-sand-300" />}
                    <span className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-sand-200 bg-white text-green-950">
                      <Icon size={18} variant="Bulk" color="currentColor" aria-hidden />
                    </span>
                    <div className="min-w-0 flex-1 rounded-[4px] border border-sand-200 bg-white p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-semibold uppercase tracking-[0.08em] text-ruby-600">{label}</span>
                        <span className="text-xs text-grey-700">{event.date}{event.place ? ` · ${event.place}` : ""}</span>
                        <TrustLabel source={event.source} compact className="ml-auto" />
                      </div>
                      <p className="mt-2 text-sm text-green-950">{event.text}</p>
                      {person && (
                        <Link href={`/people/${person.id}`} className="mt-2 inline-flex items-center gap-2 text-xs font-semibold text-green-950 hover:underline">
                          <Avatar name={person.name} size="xs" verified={person.verified} /> {person.name}
                        </Link>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
            <Notice tone="trust" title="Future owners inherit this history.">
              When the work changes hands, this record goes with it. Verified entries were checked by Artelia against invoices, shipping or exhibition records; self-declared entries are the words of the person who added them.
            </Notice>
          </section>

          <section aria-labelledby="collectors">
            <SectionHeader id="collectors" eyebrow="Collector journal" title="Living with it" description="Why people bought it, where it hangs, what changed." />
            <div className="mt-4 flex flex-col gap-4">
              {story.collectorEntries.length === 0 ? (
                <EmptyState icon={<Home2 size={28} variant="Bulk" color="var(--color-calm)" aria-hidden />} title="No collector has written yet" description="The first owner's words will begin this work's life outside the studio." />
              ) : (
                story.collectorEntries.map((entry) => {
                  const collector = getPerson(entry.personId);
                  return (
                    <Card as="article" key={`${entry.personId}-${entry.date}`} className="p-5">
                      <div className="flex flex-wrap items-center gap-3">
                        <Avatar name={collector.name} size="sm" verified={collector.verified} />
                        <p className="text-sm">
                          <Link href={`/people/${collector.id}`} className="font-semibold text-green-950 hover:underline">{collector.name}</Link>
                          <span className="text-grey-700"> · {collector.city} · {entry.date}</span>
                        </p>
                        <TrustLabel source="self-declared" compact />
                      </div>
                      <p className="mt-3 font-playfair text-lg leading-relaxed text-green-950">“{entry.text}”</p>
                      {entry.livesIn && (
                        <p className="mt-3 flex items-center gap-1.5 text-xs text-grey-700"><Home2 size={14} color="currentColor" aria-hidden /> Lives in: {entry.livesIn}</p>
                      )}
                    </Card>
                  );
                })
              )}
              <ReflectionForm storyTitle={story.title} />
            </div>
          </section>

          <Card tone="green" className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-playfair text-xl font-semibold">Meet {firstName} before you decide.</p>
              <p className="mt-1 text-sm text-white/80">Sit in on a studio visit or a small Presence Room — no pressure to buy.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button href="/studio-visits" variant="secondary">Visit the studio</Button>
              <Link href="/rooms" className="inline-flex h-11 items-center rounded-[2px] border border-white/60 px-5 text-sm font-semibold text-white hover:bg-white/10">Find a room</Link>
            </div>
          </Card>
        </div>
      </div>
    </Page>
  );
}
