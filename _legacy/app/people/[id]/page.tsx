// Covers: C3, C6, C7, T1, T2, T7, P3
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Eye, Global, Location, MagicStar } from "iconsax-reactjs";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import { SectionHeader } from "@/components/ui/Headers";
import Media from "@/components/ui/Media";
import Notice from "@/components/ui/Notice";
import Page from "@/components/ui/Page";
import TrustLabel from "@/components/ui/TrustLabel";
import { CIRCLES, INTRODUCTIONS, JOURNAL, ME, PEOPLE, PROJECTS, PROJECT_STAGES, ROOMS, STORIES, STUDIO_VISITS, getPerson } from "@/lib/data";
import type { Person } from "@/lib/types";
import ProfileActions from "./_components/ProfileActions";

const AVAILABILITY: Record<Person["availability"], { label: string; tone: "green" | "gold" | "neutral" }> = {
  open: { label: "Open to new connections", tone: "green" },
  limited: { label: "Limited availability", tone: "gold" },
  closed: { label: "Not taking introductions", tone: "neutral" },
};
const READINESS: Record<Person["readiness"], string> = { emerging: "Emerging", "mid-career": "Mid-career", established: "Established" };
const JOURNAL_KIND: Record<string, string> = { sketch: "Sketch", failure: "Failed attempt", idea: "New idea", doubt: "Doubt", win: "Win", collector: "Collector note" };

function findPerson(id: string) {
  return PEOPLE.find((p) => p.id === id);
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return { title: findPerson(id)?.name ?? "Member not found" };
}

/** Overlap between the signed-in member and this person — the basis for "Why you might connect". */
function connectionReasons(person: Person): string[] {
  const lower = (xs: string[]) => xs.map((x) => x.toLowerCase());
  const myThemes = lower(ME.themes);
  const sharedThemes = person.themes.filter((t) => myThemes.some((m) => m === t.toLowerCase() || m.includes(t.toLowerCase()) || t.toLowerCase().includes(m)));
  const sharedPractices = person.practices.filter((p) => lower(ME.practices).includes(p.toLowerCase()));
  const reasons: string[] = [];
  if (sharedThemes.length) reasons.push(`You both return to ${sharedThemes.join(" and ")} in your work.`);
  if (sharedPractices.length) reasons.push(`You share a practice: ${sharedPractices.join(", ")} — useful for swapping process, sources and critique.`);
  if (!sharedPractices.length && sharedThemes.length)
    reasons.push(`Different disciplines (${person.practices.join(", ")} and your ${ME.practices.join(", ").toLowerCase()}) meeting on the same theme — a productive difference.`);
  const sharedLang = person.languages.filter((l) => ME.languages.includes(l));
  if (reasons.length && sharedLang.length) reasons.push(`You can talk in ${sharedLang.join(" or ")}.`);
  return reasons;
}

export default async function PersonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const person = findPerson(id);
  if (!person) notFound();

  const isMe = person.id === ME.id;
  const firstName = person.name.split(" ")[0];
  const reasons = isMe ? [] : connectionReasons(person);
  const intro = INTRODUCTIONS.find((i) => i.personId === person.id);
  const stories = STORIES.filter((s) => s.artistId === person.id);
  const journal = JOURNAL.filter((j) => j.authorId === person.id && j.visibility === "public");
  const rooms = ROOMS.filter((r) => r.facilitatorId === person.id || r.participantIds.includes(person.id));
  const circles = CIRCLES.filter((c) => c.moderatorIds.includes(person.id));
  // Projects in the private "imagine" stage are only visible to their own members.
  const projects = PROJECTS.filter((p) => p.memberIds.includes(person.id) && (p.stage !== "imagine" || p.memberIds.includes(ME.id)));
  const visits = STUDIO_VISITS.filter((v) => v.artistId === person.id);
  const availability = AVAILABILITY[person.availability];

  return (
    <Page wide>
      {isMe && (
        <Notice tone="info" title="This is how others see you" className="mb-6">
          Your private journal entries, wellbeing check-ins and anything in the “imagine” stage never appear here.{" "}
          <Link href="/dna" className="font-semibold text-green-950 underline underline-offset-4">
            Edit your Creative DNA and visibility
          </Link>
        </Notice>
      )}

      <header className="flex flex-col gap-6 rounded-[4px] border border-sand-200 bg-white p-5 sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <Avatar name={person.name} size="xl" verified={person.verified} />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ruby-600">{person.title}</p>
            <h1 className="mt-1 font-playfair text-[32px] font-bold leading-tight text-green-950 md:text-[40px]">{person.name}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-grey-700">
              <span className="inline-flex items-center gap-1.5">
                <Location size={16} color="currentColor" aria-hidden /> {person.city}, {person.country}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Global size={16} color="currentColor" aria-hidden /> {person.languages.join(", ")}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge tone={availability.tone}>{availability.label}</Badge>
              <Badge tone="neutral">{READINESS[person.readiness]}</Badge>
              {person.verified ? (
                <span className="inline-flex items-center gap-1.5 text-xs text-grey-700">
                  <TrustLabel source="verified" /> Identity{person.role === "artist" || person.role === "creative" ? "" : " & professional role"} checked by Artelia
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs text-grey-700">
                  <TrustLabel source="self-declared" /> Not yet verified — details below are as stated
                </span>
              )}
            </div>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-grey-800">{person.bio}</p>
          </div>
        </div>
        {isMe ? (
          <div className="flex flex-wrap gap-2">
            <Button href="/dna" icon={<Eye size={16} color="currentColor" aria-hidden />}>
              Edit my Creative DNA
            </Button>
            <Button href="/journals" variant="outline">
              Write in my journal
            </Button>
          </div>
        ) : (
          <ProfileActions personId={person.id} firstName={firstName} hasStudioVisit={visits.length > 0} />
        )}
      </header>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex min-w-0 flex-col gap-10">
          {!isMe && (
            <section aria-labelledby="why-heading">
              <Card tone="sand" className="p-5 sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 id="why-heading" className="font-playfair text-xl font-semibold text-green-950">
                    Why you might connect
                  </h2>
                  <TrustLabel source="ai" />
                </div>
                {reasons.length > 0 || intro ? (
                  <ul className="mt-3 flex flex-col gap-2">
                    {(reasons.length ? reasons : intro!.reasons.map((r) => r.text)).map((r) => (
                      <li key={r} className="flex items-start gap-2 text-sm text-grey-800">
                        <MagicStar size={16} variant="Bulk" color="var(--color-ai)" className="mt-0.5 shrink-0" aria-hidden />
                        {r}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-3 text-sm text-grey-800">
                    We don&apos;t see much overlap between your declared themes and {firstName}&apos;s yet — which can be a good reason to meet, or none at all. Your call.
                  </p>
                )}
                <p className="mt-4 text-xs leading-relaxed text-grey-700">
                  Worked out by comparing the themes, practices and languages you both declared. Not based on popularity, sales or who follows whom — there are no followers here.{" "}
                  {intro && (
                    <Link href="/introductions" className="font-semibold text-green-950 underline underline-offset-4">
                      {firstName} is in your introductions this week
                    </Link>
                  )}
                </p>
              </Card>
            </section>
          )}

          <section aria-labelledby="stories-heading">
            <SectionHeader id="stories-heading" title="Stories behind the work" description="Each artwork with its voice note, process, failures and meaning." />
            {stories.length ? (
              <ul className="mt-4 grid gap-4 sm:grid-cols-2">
                {stories.map((s) => (
                  <Card as="li" key={s.id} className="overflow-hidden p-0">
                    <Link href={`/stories/${s.id}`} className="group block">
                      <Media src={s.image} alt={`${s.title}, ${s.medium}`} sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px" />
                      <div className="p-4">
                        <p className="font-playfair text-lg font-semibold text-green-950 group-hover:underline">{s.title}</p>
                        <p className="text-xs text-grey-700">
                          {s.year} · {s.medium}
                        </p>
                        <p className="mt-2 line-clamp-2 text-sm text-grey-800">{s.meaning}</p>
                      </div>
                    </Link>
                  </Card>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-grey-700">{isMe ? "You haven't" : `${firstName} hasn't`} published an artwork story yet.</p>
            )}
          </section>

          <section aria-labelledby="journal-heading">
            <SectionHeader
              id="journal-heading"
              title="From the journal"
              description="Public entries only — sketches, doubts, failures and wins."
              action={
                <Button href="/journals" variant="ghost" size="sm" icon={<ArrowRight size={16} color="currentColor" aria-hidden />}>
                  All journals
                </Button>
              }
            />
            {journal.length ? (
              <ul className="mt-4 flex flex-col gap-3">
                {journal.map((j) => (
                  <Card as="li" key={j.id} className="flex flex-col gap-2 p-4">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-grey-700">
                      <Badge tone={j.kind === "failure" || j.kind === "doubt" ? "calm" : "neutral"}>{JOURNAL_KIND[j.kind]}</Badge>
                      {j.date}
                    </div>
                    <p className="text-sm leading-relaxed text-green-950">{j.text}</p>
                    {j.storyId && (
                      <Link href={`/stories/${j.storyId}`} className="text-xs font-semibold text-green-950 underline underline-offset-4">
                        Part of the story of {STORIES.find((s) => s.id === j.storyId)?.title}
                      </Link>
                    )}
                  </Card>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-grey-700">No public journal entries yet.</p>
            )}
          </section>

          <section aria-labelledby="credits-heading">
            <SectionHeader id="credits-heading" title="Collaboration credits" description="Projects with every contributor credited by role." />
            {projects.length ? (
              <ul className="mt-4 flex flex-col gap-3">
                {projects.map((p) => {
                  const role = p.charter.roles.find((r) => r.personId === person.id);
                  const others = p.memberIds.filter((m) => m !== person.id).map((m) => getPerson(m));
                  return (
                    <Card as="li" key={p.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <Link href={`/studio/${p.id}`} className="font-semibold text-green-950 hover:underline">
                          {p.title}
                        </Link>
                        <p className="text-sm text-grey-700">
                          {role ? `${role.role} · ` : ""}with{" "}
                          {others.map((o, i) => (
                            <span key={o.id}>
                              {i > 0 && ", "}
                              <Link href={`/people/${o.id}`} className="underline underline-offset-2 hover:text-green-950">
                                {o.name}
                              </Link>
                            </span>
                          ))}
                        </p>
                      </div>
                      <Badge tone={p.stage === "preserve" ? "green" : "neutral"}>{PROJECT_STAGES.find((s) => s.id === p.stage)?.label}</Badge>
                    </Card>
                  );
                })}
              </ul>
            ) : (
              <EmptyState title="No shared projects yet" description="Collaborations appear here once a charter is agreed. Early ideas stay private." />
            )}
          </section>
        </div>

        <aside className="flex flex-col gap-4" aria-label={`More about ${firstName}`}>
          <Card className="p-5">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold text-green-950">Practices & themes</h2>
              <TrustLabel source="self-declared" compact />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {person.practices.map((p) => (
                <Badge key={p} tone="green">
                  {p}
                </Badge>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {person.themes.map((t) => (
                <Badge key={t} tone="neutral">
                  {t}
                </Badge>
              ))}
            </div>
          </Card>

          {visits.length > 0 && (
            <Card className="p-5">
              <h2 className="text-sm font-semibold text-green-950">Studio visits</h2>
              <ul className="mt-3 flex flex-col gap-3">
                {visits.map((v) => (
                  <li key={v.id} className="text-sm">
                    <Link href="/studio-visits" className="font-semibold text-green-950 hover:underline">
                      {v.title}
                    </Link>
                    <p className="text-grey-700">
                      {v.when} · {v.format === "360" ? "360°" : v.format === "vr" ? "VR" : v.format === "live" ? `Live · ${v.seatsLeft} seats left` : "Recorded"}
                    </p>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          <Card className="p-5">
            <h2 className="text-sm font-semibold text-green-950">Presence Rooms</h2>
            {rooms.length ? (
              <ul className="mt-3 flex flex-col gap-3">
                {rooms.map((r) => (
                  <li key={r.id} className="text-sm">
                    <Link href={`/rooms/${r.id}`} className="font-semibold text-green-950 hover:underline">
                      {r.title}
                    </Link>
                    <p className="text-grey-700">
                      {r.facilitatorId === person.id ? "Facilitating · " : ""}
                      {r.when}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-grey-700">Not in any rooms this week.</p>
            )}
          </Card>

          {circles.length > 0 && (
            <Card className="p-5">
              <h2 className="text-sm font-semibold text-green-950">Moderates</h2>
              <ul className="mt-3 flex flex-col gap-2 text-sm">
                {circles.map((c) => (
                  <li key={c.id}>
                    <Link href={`/circles/${c.id}`} className="font-semibold text-green-950 hover:underline">
                      {c.name} Circle
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          <p className="px-1 text-xs leading-relaxed text-grey-700">
            Artelia Connect doesn&apos;t show follower counts, likes or rankings. People are here to make things together, not to be measured.
          </p>
        </aside>
      </div>
    </Page>
  );
}
