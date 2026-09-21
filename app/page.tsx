import Link from "next/link";
import { ArrowRight, Calendar, Lovely, Messages2, TaskSquare, TickCircle } from "iconsax-reactjs";
import Avatar, { AvatarStack } from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/Headers";
import Media from "@/components/ui/Media";
import Page from "@/components/ui/Page";
import TrustLabel from "@/components/ui/TrustLabel";
import { INTRODUCTIONS, ME, ROOMS, getPerson, getProject, getCall, MY_APPLICATIONS } from "@/lib/data";
import IntentPicker from "./_today/IntentPicker";

export default function TodayPage() {
  const intros = INTRODUCTIONS.slice(0, 2);
  const room = ROOMS[0];
  const project = getProject("salt-water-memory")!;
  const pendingMilestone = project.milestones.find((m) => m.status === "current")!;
  const application = MY_APPLICATIONS[0];
  const call = getCall(application.callId)!;
  const seatsLeft = room.capacity - room.participantIds.length;

  return (
    <Page>
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ruby-600">Today · Monday</p>
        <h1 className="font-playfair text-[32px] font-bold leading-tight text-green-950 md:text-[44px]">
          Good evening, {ME.name.split(" ")[0]}.
        </h1>
        <p className="max-w-2xl text-sm text-grey-800 md:text-base">
          Five things worth your time — chosen for why you&apos;re here, not for how long you&apos;ll stay.
        </p>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex min-w-0 flex-col gap-8">
          <IntentPicker />

          <section aria-labelledby="intros-heading">
            <SectionHeader
              id="intros-heading"
              title="People worth meeting"
              description="Every introduction says why. Accept, decline or tell us we got it wrong."
              action={<Button href="/introductions" variant="ghost" size="sm" icon={<ArrowRight size={16} color="currentColor" aria-hidden />}>All introductions</Button>}
            />
            <ul className="mt-4 grid gap-4 md:grid-cols-2">
              {intros.map((intro) => {
                const person = getPerson(intro.personId);
                return (
                  <Card as="li" key={intro.id} className="flex flex-col gap-4 p-5">
                    <div className="flex items-center gap-3">
                      <Avatar name={person.name} size="lg" verified={person.verified} />
                      <div className="min-w-0">
                        <p className="font-semibold text-green-950">{person.name}</p>
                        <p className="text-sm text-grey-700">{person.title} · {person.city}</p>
                      </div>
                    </div>
                    <p className="font-playfair text-lg leading-snug text-green-950">{intro.headline}</p>
                    <ul className="flex flex-col gap-2">
                      {intro.reasons.slice(0, 2).map((reason) => (
                        <li key={reason.text} className="flex items-start gap-2 text-sm text-grey-800">
                          <TrustLabel source={reason.source} compact className="mt-0.5 shrink-0" />
                          <span>{reason.text}</span>
                        </li>
                      ))}
                    </ul>
                    <Button href="/introductions" variant="outline" size="sm" className="mt-auto self-start">
                      See the full introduction
                    </Button>
                  </Card>
                );
              })}
            </ul>
          </section>

          <section aria-labelledby="happening-heading">
            <SectionHeader id="happening-heading" title="Waiting on you" />
            <ul className="mt-4 flex flex-col gap-3">
              <Card as="li" className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold-300/60 text-ruby-800"><TaskSquare size={22} variant="Bulk" color="currentColor" aria-hidden /></span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-green-950">Shortlisted: {call.title}</p>
                    <Badge tone="green">Shortlist</Badge>
                  </div>
                  <p className="mt-1 text-sm text-grey-700">{application.history.at(-1)?.note}</p>
                </div>
                <Button href="/applications" size="sm">Pick a slot</Button>
              </Card>
              <Card as="li" className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-900"><TickCircle size={22} variant="Bulk" color="currentColor" aria-hidden /></span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-green-950">Approve milestone: {pendingMilestone.title}</p>
                  <p className="mt-1 text-sm text-grey-700">{project.title} · Moussa has approved. Your approval releases the next budget tranche.</p>
                </div>
                <Button href={`/studio/${project.id}`} size="sm" variant="outline">Review</Button>
              </Card>
            </ul>
          </section>

          <section aria-labelledby="room-heading">
            <SectionHeader id="room-heading" title="A small room tonight" description="Six seats. No audience, no recording, no follower counts." />
            <Card className="mt-4 overflow-hidden p-0">
              <div className="grid md:grid-cols-[240px_minmax(0,1fr)]">
                <Media src="https://res.cloudinary.com/dxgw4sl2o/image/upload/v1789471420/culturaldepth.jpg_msdwfl.jpg" alt="" ratio="4/3" sizes="(max-width: 768px) 100vw, 240px" className="md:h-full" />
                <div className="flex flex-col gap-3 p-5">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-grey-700">
                    <Calendar size={14} color="currentColor" aria-hidden /> {room.when} · {room.durationMin} min · {room.format}
                  </div>
                  <p className="font-playfair text-xl font-semibold text-green-950">{room.title}</p>
                  <p className="text-sm text-grey-800">Bring: “{room.prompts[0]}”</p>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <AvatarStack names={room.participantIds.map((id) => getPerson(id).name)} />
                      <span className="text-sm text-grey-700">{seatsLeft} of 6 seats open</span>
                    </div>
                    <Button href={`/rooms/${room.id}`} size="sm" icon={<Messages2 size={16} color="currentColor" aria-hidden />}>Take a seat</Button>
                  </div>
                </div>
              </div>
            </Card>
          </section>

          <div className="flex flex-col items-center gap-2 border-t border-sand-200 pt-8 text-center">
            <TickCircle size={28} variant="Bulk" color="var(--color-verified)" aria-hidden />
            <p className="font-playfair text-lg font-semibold text-green-950">You&apos;re all caught up.</p>
            <p className="max-w-md text-sm text-grey-700">Artelia Connect doesn&apos;t do endless feeds. Go make something — we&apos;ll be here.</p>
          </div>
        </div>

        <aside className="flex flex-col gap-4" aria-label="For you">
          <Card tone="sand" className="p-5">
            <div className="flex items-center gap-2 text-calm">
              <Lovely size={20} variant="Bulk" color="currentColor" aria-hidden />
              <p className="text-sm font-semibold">Private check-in</p>
            </div>
            <p className="mt-3 font-playfair text-lg text-green-950">How is your creative energy this week?</p>
            <p className="mt-1 text-xs text-grey-700">Only you can see this. It never affects matching, ranking or opportunities.</p>
            <Button href="/wellbeing" variant="outline" size="sm" className="mt-4">Two quiet minutes</Button>
          </Card>

          <Card className="p-5">
            <p className="text-sm font-semibold text-green-950">Your circles this week</p>
            <ul className="mt-3 flex flex-col gap-3 text-sm">
              <li><Link href="/circles/textiles" className="font-semibold text-green-950 hover:underline">Textiles</Link><p className="text-grey-700">Portfolio review · Wed 18:00 WAT</p></li>
              <li><Link href="/circles/diaspora" className="font-semibold text-green-950 hover:underline">Diaspora</Link><p className="text-grey-700">Presence Room · Today 18:00 WAT</p></li>
            </ul>
          </Card>

          <Card className="p-5">
            <p className="text-sm font-semibold text-green-950">Why you&apos;re seeing this</p>
            <p className="mt-2 text-sm text-grey-700">
              You told us you&apos;re here to meet collaborators, find opportunities and feel less alone.
            </p>
            <Link href="/onboarding" className="mt-3 inline-block text-sm font-semibold text-green-950 underline underline-offset-4">Update what you&apos;re here for</Link>
          </Card>
        </aside>
      </div>
    </Page>
  );
}
