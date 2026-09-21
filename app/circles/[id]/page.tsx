// Covers: C5, T6, T7, T8, T2, T3, U6 — circle detail: moderators, standards, next gathering → room, threads by kind,
// portfolio feedback + mentorship requests, "is this opportunity legit?" checklist; Young Artists shows the U6 path.
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft2, ArrowRight, Calendar, Danger, Messages2, ShieldTick, TickCircle } from "iconsax-reactjs";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/Headers";
import Media from "@/components/ui/Media";
import Notice from "@/components/ui/Notice";
import Page from "@/components/ui/Page";
import TrustLabel from "@/components/ui/TrustLabel";
import { CIRCLES, ME, OPEN_CALLS, getCircle, getPerson } from "@/lib/data";
import { roomsForCircle } from "../../rooms/_data";
import CircleThreads from "../_components/CircleThreads";
import FeedbackRequestForm from "../_components/FeedbackRequestForm";
import JoinCircle from "../_components/JoinCircle";
import MentorshipRequest from "../_components/MentorshipRequest";
import { COMMUNITY_STANDARDS, EXTRA_THREADS, LEGIT_CHECKLIST } from "../_data";

const MENTOR_SUGGESTION: Record<string, { personId: string; why: string }> = {
  young: { personId: "halima", why: "Halima runs a verified call for emerging painters that includes mentoring, and says she's open to first-five-year artists." },
  textiles: { personId: "nomvula", why: "Nomvula commissions one textile or installation work a year and offered to mentor fibre artists preparing proposals." },
  photography: { personId: "wanjiru", why: "Wanjiru moderates this circle, works across photography and cloth, and marked herself open to mentoring." },
};

export function generateStaticParams() {
  return CIRCLES.map((c) => ({ id: c.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const circle = getCircle(id);
  return { title: circle ? `${circle.name} circle` : "Circle not found" };
}

export default async function CirclePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const circle = getCircle(id);
  if (!circle) notFound();

  const moderators = circle.moderatorIds.map(getPerson);
  const threads = [...circle.threads, ...(EXTRA_THREADS[circle.id] ?? [])];
  const rooms = roomsForCircle(circle.id);
  const isYoung = circle.id === "young";
  const mentorPick = MENTOR_SUGGESTION[circle.id];
  const fallbackMentor = moderators.find((m) => m.id !== ME.id);
  const mentor = mentorPick ? getPerson(mentorPick.personId) : fallbackMentor;
  const mentorWhy = mentorPick?.why ?? `${fallbackMentor?.name.split(" ")[0] ?? "This moderator"} moderates ${circle.name} and has said they're open to mentoring.`;
  const verifiedCalls = OPEN_CALLS.filter((c) => c.organiserVerified && c.status !== "closed" && (isYoung ? /emerging|any/i.test(c.experienceLevel) : true)).slice(0, 3);
  const flaggedCall = OPEN_CALLS.find((c) => !c.organiserVerified);

  return (
    <Page>
      <Link href="/circles" className="inline-flex items-center gap-1 text-sm font-semibold text-green-950 hover:underline">
        <ArrowLeft2 size={16} color="currentColor" aria-hidden /> All circles
      </Link>

      <header className="mt-4 overflow-hidden rounded-[4px] border border-sand-200 bg-white">
        <Media src={circle.image} alt="" ratio="21/7" sizes="(max-width: 1152px) 100vw, 1152px" priority className="max-h-[280px]" />
        <div className="flex flex-col gap-4 p-5 sm:p-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ruby-600">Creative Circle · {circle.practice}</p>
            <h1 className="mt-2 font-playfair text-[32px] font-bold leading-tight text-green-950 md:text-[44px]">{circle.name}</h1>
            <p className="mt-2 text-sm leading-relaxed text-grey-800 md:text-base">{circle.description}</p>
            <p className="mt-2 text-sm text-grey-700">Small and moderated — you&apos;ll get to know people by name.</p>
          </div>
          <JoinCircle circleName={circle.name} isMember={circle.isMember} moderatorName={moderators[0]?.name ?? "A moderator"} />
        </div>
      </header>

      {isYoung && (
        <section aria-labelledby="path-heading" className="mt-8 rounded-[4px] border border-sand-200 bg-sand-100 p-5 sm:p-6">
          <h2 id="path-heading" className="font-playfair text-xl font-semibold text-green-950 md:text-2xl">Your way in, one step at a time</h2>
          <p className="mt-1 text-sm text-grey-700">Working alone is hard. This circle is built to walk with you from here to your first credible opportunity.</p>
          <ol className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
            {[
              { n: 1, title: "Find your peers", text: "Introduce yourself, join the Tuesday portfolio swap, read “How do you keep going?”.", href: "#threads-heading", cta: "See the conversations" },
              { n: 2, title: "Get portfolio feedback", text: "Share two or three works. Peers reply in days; a verified mentor goes deeper.", href: "#feedback-heading", cta: "Request feedback" },
              { n: 3, title: "Apply with confidence", text: "Only calls from verified organisers, with fees disclosed — and a checklist for the rest.", href: "#opps-heading", cta: "See verified calls" },
            ].map((step) => (
              <li key={step.n} className="flex flex-col gap-2 rounded-[4px] border border-sand-200 bg-white p-4">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-950 text-sm font-semibold text-white" aria-hidden>{step.n}</span>
                <p className="font-semibold text-green-950"><span className="sr-only">Step {step.n}: </span>{step.title}</p>
                <p className="text-sm text-grey-700">{step.text}</p>
                <a href={step.href} className="mt-auto inline-flex items-center gap-1 text-sm font-semibold text-green-950 underline underline-offset-4">
                  {step.cta} <ArrowRight size={14} color="currentColor" aria-hidden />
                </a>
              </li>
            ))}
          </ol>
        </section>
      )}

      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex min-w-0 flex-col gap-10">
          <section aria-labelledby="threads-heading" className="flex flex-col gap-4">
            <SectionHeader id="threads-heading" title="Threads" description="Every conversation in this circle. No likes, no leaderboards — just people talking about the work." />
            <CircleThreads threads={threads} circleName={circle.name} />
          </section>

          <section aria-labelledby="feedback-heading" className="flex flex-col gap-4">
            <SectionHeader
              id="feedback-heading"
              title="Request portfolio feedback"
              description="Written, specific and kind. Feedback stays inside the circle and your images are watermarked."
            />
            <FeedbackRequestForm circleName={circle.name} />
          </section>

          <section aria-labelledby="opps-heading" className="flex flex-col gap-4">
            <SectionHeader
              id="opps-heading"
              title="Is this opportunity legit?"
              description="Run any call — shared here or sent to you privately — through this checklist before you apply."
            />
            <Card className="p-5">
              <ul className="flex flex-col gap-2.5">
                {LEGIT_CHECKLIST.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-grey-800">
                    <TickCircle size={18} variant="Bulk" color="var(--color-verified)" className="mt-0.5 shrink-0" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex flex-wrap gap-3">
                <Button href="/opportunities" size="sm">Browse verified opportunities</Button>
                <Button href="/trust" size="sm" variant="outline">How we check organisers</Button>
              </div>
            </Card>

            {isYoung && (
              <>
                <ul className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  {verifiedCalls.map((call) => (
                    <Card as="li" key={call.id} className="flex flex-col gap-2 p-4">
                      <TrustLabel source="verified" className="self-start" />
                      <Link href={`/opportunities/${call.id}`} className="font-semibold text-green-950 hover:underline">{call.title}</Link>
                      <p className="text-xs text-grey-700">{call.organisation}</p>
                      <p className="text-xs text-grey-800"><span className="font-semibold">Fee:</span> {call.budget ?? "Not disclosed"}</p>
                      <p className="mt-auto text-xs text-grey-700">Deadline {call.deadline}</p>
                    </Card>
                  ))}
                </ul>
                {flaggedCall && (
                  <Notice tone="safety" title={`Flagged: ${flaggedCall.title}`}>
                    <p>This one was shared in the circle last week. Our checks found: {flaggedCall.flags?.join(" · ").toLowerCase()}. We&apos;ve hidden it from recommendations.</p>
                    <Link href={`/opportunities/${flaggedCall.id}`} className="mt-2 inline-flex items-center gap-1 font-semibold text-alert underline underline-offset-4">
                      <Danger size={14} color="currentColor" aria-hidden /> See why it&apos;s flagged
                    </Link>
                  </Notice>
                )}
              </>
            )}
          </section>
        </div>

        <aside className="flex flex-col gap-4" aria-label="About this circle">
          <Card className="p-5">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-green-950">
              <Calendar size={16} color="currentColor" aria-hidden /> Next gathering
            </h2>
            <p className="mt-2 font-playfair text-lg text-green-950">{circle.nextGathering}</p>
            {rooms.length > 0 ? (
              <ul className="mt-3 flex flex-col gap-3">
                {rooms.map((room) => (
                  <li key={room.id} className="rounded-[4px] bg-sand-100 p-3">
                    <p className="text-xs text-grey-700">Presence Room · {room.when}</p>
                    <Link href={`/rooms/${room.id}`} className="text-sm font-semibold text-green-950 hover:underline">{room.title}</Link>
                    <p className="mt-1 text-xs text-grey-700">{6 - room.participantIds.length === 0 ? "Full — ask to be told if a seat opens" : `${6 - room.participantIds.length} of 6 seats open`}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-grey-700">Members-only gathering, hosted by the moderators. Join the circle to get the link.</p>
            )}
          </Card>

          <Card className="p-5">
            <h2 className="text-sm font-semibold text-green-950">Moderators</h2>
            <ul className="mt-3 flex flex-col gap-3">
              {moderators.map((m) => (
                <li key={m.id} className="flex items-start gap-3">
                  <Avatar name={m.name} size="md" verified={m.verified} />
                  <div className="min-w-0">
                    <Link href={`/people/${m.id}`} className="text-sm font-semibold text-green-950 hover:underline">{m.id === ME.id ? `${m.name} (you)` : m.name}</Link>
                    <p className="text-xs text-grey-700">{m.title} · {m.city}</p>
                    <TrustLabel source={m.verified ? "verified" : "self-declared"} compact className="mt-1" />
                  </div>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-5">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-green-950">
              <ShieldTick size={16} color="currentColor" aria-hidden /> Community guidelines
            </h2>
            <ul className="mt-3 flex list-disc flex-col gap-1.5 pl-5 text-sm text-grey-800">
              {circle.guidelines.map((g) => <li key={g}>{g}</li>)}
            </ul>
            <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-grey-700">Artelia-wide standards</p>
            <dl className="mt-2 flex flex-col gap-2 text-sm">
              {COMMUNITY_STANDARDS.map((s) => (
                <div key={s.title}>
                  <dt className="font-semibold text-green-950">{s.title}</dt>
                  <dd className="text-grey-700">{s.text}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-xs text-grey-700">
              Removals and bans are reviewed by a person, and you can appeal. <Link href="/trust" className="font-semibold text-green-950 underline underline-offset-4">Trust &amp; safety</Link>
            </p>
          </Card>

          <section aria-labelledby="mentor-heading" className="flex flex-col gap-3">
            <h2 id="mentor-heading" className="flex items-center gap-2 font-playfair text-lg font-semibold text-green-950">
              <Messages2 size={18} color="currentColor" aria-hidden /> Ask for a mentor
            </h2>
            <MentorshipRequest suggested={mentor && mentor.id !== ME.id ? mentor : undefined} why={mentorWhy} />
          </section>

        </aside>
      </div>
    </Page>
  );
}
