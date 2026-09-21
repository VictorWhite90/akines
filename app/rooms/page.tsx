// Covers: C4, P2, P3, U4, T7 — Presence Rooms: capped at six, no audience/livestream/follower counts, mixed roles, finite list.
import type { Metadata } from "next";
import { Eye, Lock1, People, RecordCircle, TickCircle } from "iconsax-reactjs";
import Card from "@/components/ui/Card";
import { PageHeader, SectionHeader } from "@/components/ui/Headers";
import Page from "@/components/ui/Page";
import RoomsBrowser from "./_components/RoomsBrowser";
import StartRoomForm from "./_components/StartRoomForm";

export const metadata: Metadata = { title: "Presence Rooms" };

const PRINCIPLES = [
  { Icon: People, text: "Six seats, always. Nobody watches from the back." },
  { Icon: RecordCircle, text: "Nothing is recorded or streamed. Leave any time." },
  { Icon: Eye, text: "No follower counts or popularity. Rooms are suggested by relevance, not reach." },
];

const MIXES = [
  { a: "Artists", b: "collectors", text: "Hear why someone lives with a work — and what it cost you to make it." },
  { a: "Students", b: "curators", text: "Ask how shows are really selected, with no portfolio on the line." },
  { a: "Collectors", b: "students", text: "Early voices meet long-term patrons before the market does." },
];

export default function RoomsPage() {
  return (
    <Page>
      <PageHeader
        eyebrow="Connect · Presence Rooms"
        title="Small rooms, real conversation"
        description="Facilitated conversations for up to six people — artists beside collectors, students beside curators. Come for forty-five minutes; leave with someone you'll talk to again."
      />

      <Card tone="green" as="section" className="mt-8 p-6 sm:p-8">
        <h2 className="font-playfair text-2xl font-semibold leading-snug text-white md:text-3xl">
          Six seats. No audience. No livestream. No follower counts.
        </h2>
        <ul className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
          {PRINCIPLES.map(({ Icon, text }) => (
            <li key={text} className="flex items-start gap-3 text-sm text-white/90">
              <Icon size={20} variant="Bulk" color="var(--color-gold-400)" className="mt-0.5 shrink-0" aria-hidden />
              {text}
            </li>
          ))}
        </ul>
      </Card>

      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section aria-labelledby="rooms-heading" className="flex min-w-0 flex-col gap-4">
          <SectionHeader
            id="rooms-heading"
            title="Rooms this week"
            description="Every room is listed — there's no ranking and nothing to scroll past. Filter by theme if you like."
          />
          <RoomsBrowser />
          <div className="flex flex-col items-center gap-2 border-t border-sand-200 pt-6 text-center">
            <TickCircle size={24} variant="Bulk" color="var(--color-verified)" aria-hidden />
            <p className="font-playfair text-lg font-semibold text-green-950">That&apos;s every room this week.</p>
            <p className="max-w-md text-sm text-grey-700">New rooms open on Mondays. Or start one yourself — it only takes six people.</p>
          </div>
        </section>

        <aside className="flex flex-col gap-6" aria-label="Start a room and why rooms are mixed">
          <section aria-labelledby="start-heading" className="flex flex-col gap-4">
            <SectionHeader id="start-heading" title="Start a room" description="Anyone can host. You facilitate; we keep it small and safe." />
            <StartRoomForm />
          </section>

          <Card tone="sand" as="section" className="p-5">
            <h2 className="font-playfair text-lg font-semibold text-green-950">Why rooms are mixed on purpose</h2>
            <ul className="mt-3 flex flex-col gap-3">
              {MIXES.map((m) => (
                <li key={m.a + m.b} className="text-sm">
                  <p className="font-semibold text-green-950">{m.a} with {m.b}</p>
                  <p className="text-grey-700">{m.text}</p>
                </li>
              ))}
            </ul>
            <p className="mt-4 flex items-start gap-2 text-xs text-grey-700">
              <Lock1 size={14} color="currentColor" className="mt-0.5 shrink-0" aria-hidden />
              We invite a spread of roles to each room. No one sees who declined.
            </p>
          </Card>
        </aside>
      </div>
    </Page>
  );
}
