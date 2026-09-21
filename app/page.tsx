// Covers: C1 (intent at session start), C3 (explained introduction), C4 (room tonight), S9 (application status), S6 (milestone approval), W1/W3 (private check-in), P2 (finite — ends when done)
import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, Lovely, Messages2, People, TaskSquare, TickCircle } from "iconsax-reactjs";
import Page from "@/components/ui/Page";
import { INTRODUCTIONS, ME, MY_APPLICATIONS, ROOMS, getCall, getPerson, getProject } from "@/lib/data";
import IntentPicker from "./_today/IntentPicker";

function TodayItem({ icon, title, detail, href, action }: { icon: ReactNode; title: string; detail: string; href: string; action: string }) {
  return (
    <li className="flex flex-col gap-3 border-b border-sand-200 py-6 last:border-0 sm:flex-row sm:items-center sm:gap-5">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sand-100 text-green-950">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-green-950">{title}</p>
        <p className="mt-1 text-sm text-grey-700">{detail}</p>
      </div>
      <Link href={href} className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-green-950 underline-offset-4 hover:underline">
        {action} <ArrowRight size={16} color="currentColor" aria-hidden />
      </Link>
    </li>
  );
}

export default function TodayPage() {
  const intro = INTRODUCTIONS[0];
  const person = getPerson(intro.personId);
  const application = MY_APPLICATIONS[0];
  const call = getCall(application.callId)!;
  const project = getProject("salt-water-memory")!;
  const milestone = project.milestones.find((m) => m.status === "current")!;
  const room = ROOMS[0];
  const seatsLeft = room.capacity - room.participantIds.length;

  return (
    <Page className="max-w-3xl">
      <h1 className="font-playfair text-[34px] font-bold leading-tight text-green-950 md:text-[48px]">Good evening, {ME.name.split(" ")[0]}.</h1>
      <p className="mt-3 text-base text-grey-700">Four things worth your time today.</p>

      <div className="mt-10">
        <IntentPicker />
      </div>

      <section aria-labelledby="today-heading" className="mt-12">
        <h2 id="today-heading" className="sr-only">Today</h2>
        <ol className="border-t border-sand-200">
          <TodayItem
            icon={<People size={20} color="currentColor" aria-hidden />}
            title={`Meet ${person.name}`}
            detail={`${person.title} in ${person.city} — you both explore migration and memory.`}
            href="/introductions"
            action="See why"
          />
          <TodayItem
            icon={<TaskSquare size={20} color="currentColor" aria-hidden />}
            title={`You're shortlisted for ${call.title}`}
            detail="Pick a time for a short video conversation by Oct 30."
            href="/applications"
            action="Pick a slot"
          />
          <TodayItem
            icon={<TickCircle size={20} color="currentColor" aria-hidden />}
            title={`Approve “${milestone.title}”`}
            detail={`${project.title} · Moussa has approved. Yours releases the next payment.`}
            href={`/studio/${project.id}`}
            action="Review"
          />
          <TodayItem
            icon={<Messages2 size={20} color="currentColor" aria-hidden />}
            title={room.title}
            detail={`${room.when} · ${seatsLeft} of 6 seats open · small, not recorded`}
            href={`/rooms/${room.id}`}
            action="Take a seat"
          />
        </ol>
      </section>

      <Link href="/wellbeing" className="mt-10 flex items-center gap-4 rounded-[6px] bg-calm-bg px-5 py-4 text-calm transition-colors hover:bg-calm-bg/70">
        <Lovely size={22} variant="Bulk" color="currentColor" aria-hidden />
        <span className="flex-1 text-sm">
          <span className="font-semibold">Two quiet minutes for yourself.</span> A private check-in — never shared, never used for matching.
        </span>
        <ArrowRight size={16} color="currentColor" aria-hidden />
      </Link>

      <p className="mt-12 text-center text-sm text-grey-600">That&apos;s everything for today.</p>
    </Page>
  );
}
