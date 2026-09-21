// Covers: C4, T7, T8, U4, P3 — six-seat map with roles, facilitator, prompts, house rules, join/leave, in-room preview with safety strip.
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft2, Calendar, Clock, LanguageSquare, Messages2, ShieldTick } from "iconsax-reactjs";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { PageHeader, SectionHeader } from "@/components/ui/Headers";
import Notice from "@/components/ui/Notice";
import Page from "@/components/ui/Page";
import TrustLabel from "@/components/ui/TrustLabel";
import { getPerson } from "@/lib/data";
import RoomPreview from "../_components/RoomPreview";
import RoomSeatMap from "../_components/RoomSeatMap";
import { ALL_ROOMS, DEFAULT_BRING, FORMAT_LABEL, HOUSE_RULES, ROLE_LABEL, WHAT_TO_BRING, circleName, findRoom, roleMix, roomPeople } from "../_data";

export function generateStaticParams() {
  return ALL_ROOMS.map((room) => ({ id: room.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const room = findRoom(id);
  return { title: room ? room.title : "Room not found" };
}

export default async function RoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const room = findRoom(id);
  if (!room) notFound();

  const facilitator = getPerson(room.facilitatorId);
  const circle = circleName(room.circleId);
  const bring = WHAT_TO_BRING[room.id] ?? DEFAULT_BRING;
  const others = ALL_ROOMS.filter((r) => r.id !== room.id && r.theme === room.theme).slice(0, 2);

  return (
    <Page>
      <Link href="/rooms" className="inline-flex items-center gap-1 text-sm font-semibold text-green-950 hover:underline">
        <ArrowLeft2 size={16} color="currentColor" aria-hidden /> All Presence Rooms
      </Link>

      <PageHeader
        className="mt-4"
        eyebrow={`Presence Room · ${room.theme}`}
        title={room.title}
        description={
          <span className="flex flex-wrap gap-x-4 gap-y-1">
            <span className="inline-flex items-center gap-1.5"><Calendar size={16} color="currentColor" aria-hidden />{room.when}</span>
            <span className="inline-flex items-center gap-1.5"><Clock size={16} color="currentColor" aria-hidden />{room.durationMin} min</span>
            <span className="inline-flex items-center gap-1.5"><Messages2 size={16} color="currentColor" aria-hidden />{FORMAT_LABEL[room.format]}</span>
            <span className="inline-flex items-center gap-1.5"><LanguageSquare size={16} color="currentColor" aria-hidden />{room.language}</span>
          </span>
        }
      />

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex min-w-0 flex-col gap-10">
          <section aria-labelledby="seats-heading" className="flex flex-col gap-4">
            <SectionHeader
              id="seats-heading"
              title="Who's in the room"
              description={`Six seats, no audience. This room brings together ${roleMix(roomPeople(room))}.`}
            />
            <RoomSeatMap room={room} />
          </section>

          <section aria-labelledby="prompts-heading" className="flex flex-col gap-4">
            <SectionHeader id="prompts-heading" title="Conversation prompts" description="The facilitator moves through these at the room's pace. You can always pass." />
            <ol className="flex flex-col gap-3">
              {room.prompts.map((prompt, i) => (
                <Card as="li" key={prompt} className="flex items-start gap-4 p-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold-300/60 text-sm font-semibold text-ruby-800">{i + 1}</span>
                  <p className="font-playfair text-lg leading-snug text-green-950">{prompt}</p>
                </Card>
              ))}
            </ol>
          </section>

          <section aria-labelledby="bring-heading" className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-3">
              <h2 id="bring-heading" className="font-playfair text-xl font-semibold text-green-950 md:text-2xl">What to bring</h2>
              <ul className="flex list-disc flex-col gap-2 pl-5 text-sm text-grey-800">
                {bring.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>
            <div className="flex flex-col gap-3">
              <h2 className="font-playfair text-xl font-semibold text-green-950 md:text-2xl">House rules</h2>
              <ul className="flex flex-col gap-3">
                {HOUSE_RULES.map((rule) => (
                  <li key={rule.title} className="flex items-start gap-2 text-sm">
                    <ShieldTick size={18} variant="Bulk" color="var(--color-verified)" className="mt-0.5 shrink-0" aria-hidden />
                    <span><strong className="text-green-950">{rule.title}</strong> <span className="text-grey-800">{rule.text}</span></span>
                  </li>
                ))}
              </ul>
              <Link href="/trust" className="text-sm font-semibold text-green-950 underline underline-offset-4">Community standards &amp; appeals</Link>
            </div>
          </section>

          <section aria-labelledby="preview-heading" className="flex flex-col gap-4">
            <SectionHeader
              id="preview-heading"
              title="What the room looks like"
              description="A preview of the in-room screen. Initials instead of video until someone chooses to turn a camera on. Try the controls."
            />
            <RoomPreview room={room} />
          </section>
        </div>

        <aside className="flex flex-col gap-4" aria-label="About this room">
          <Card className="p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-grey-700">Facilitator</p>
            <div className="mt-3 flex items-center gap-3">
              <Avatar name={facilitator.name} size="lg" verified={facilitator.verified} />
              <div className="min-w-0">
                <Link href={`/people/${facilitator.id}`} className="font-semibold text-green-950 hover:underline">{facilitator.name}</Link>
                <p className="text-sm text-grey-700">{facilitator.title} · {facilitator.city}</p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge tone="neutral">{ROLE_LABEL[facilitator.role]}</Badge>
              <TrustLabel source={facilitator.verified ? "verified" : "self-declared"} />
            </div>
            <p className="mt-3 text-sm text-grey-800">{facilitator.bio}</p>
            <p className="mt-3 text-xs text-grey-700">Trained in Artelia&apos;s facilitation guidelines. Keeps time, makes space for quiet voices, calls a moderator if needed.</p>
          </Card>

          {circle && room.circleId && (
            <Card tone="sand" className="p-5">
              <p className="text-sm font-semibold text-green-950">Part of the {circle} circle</p>
              <p className="mt-1 text-sm text-grey-700">Keep the conversation going afterwards in a small, moderated circle.</p>
              <Button href={`/circles/${room.circleId}`} variant="outline" size="sm" className="mt-3">Visit the circle</Button>
            </Card>
          )}

          <Notice tone="private" title="Not recorded, ever">
            No recording, transcript or livestream. Artelia keeps only who attended, so you can find each other again.
          </Notice>

          <Card className="p-5">
            <p className="text-sm font-semibold text-green-950">After the room</p>
            <p className="mt-1 text-sm text-grey-700">
              Collectors often book a <Link href="/studio-visits" className="font-semibold text-green-950 underline underline-offset-4">studio visit</Link> with
              an artist they met here. Artists sometimes find a <Link href="/introductions" className="font-semibold text-green-950 underline underline-offset-4">collaborator</Link>.
            </p>
          </Card>

          {others.length > 0 && (
            <Card className="p-5">
              <p className="text-sm font-semibold text-green-950">Also on {room.theme.toLowerCase()}</p>
              <ul className="mt-2 flex flex-col gap-2 text-sm">
                {others.map((r) => (
                  <li key={r.id}>
                    <Link href={`/rooms/${r.id}`} className="font-semibold text-green-950 hover:underline">{r.title}</Link>
                    <p className="text-grey-700">{r.when}</p>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </aside>
      </div>
    </Page>
  );
}
