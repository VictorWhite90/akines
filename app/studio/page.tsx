// Covers: S1, S4, U2, U5, P1, P2, P3, T2, T3, B1, B2
import Link from "next/link";
import { ArrowRight, Lock1, Music, TickCircle } from "iconsax-reactjs";
import { AvatarStack } from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { PageHeader, SectionHeader } from "@/components/ui/Headers";
import Media from "@/components/ui/Media";
import Page from "@/components/ui/Page";
import StageTracker from "@/components/ui/StageTracker";
import { PROJECTS, PROJECT_STAGES, getCall, getPerson } from "@/lib/data";
import MatchingAndCanvas from "./_components/MatchingAndCanvas";
import { KIND_LABEL, isMember, isPublic, nextNeeded, stageIndex, stageLabel } from "./_data";

export const metadata = { title: "Collaboration Studio · Artelia Connect" };

export default function StudioPage() {
  const mine = PROJECTS.filter(isMember);
  const madeOnArtelia = PROJECTS.filter((p) => !isMember(p) && isPublic(p));
  const call = getCall("sound-space");
  const steps = PROJECT_STAGES.map(({ id, label }) => ({ id, label }));

  return (
    <Page>
      <PageHeader
        eyebrow="Create · Collaboration Studio"
        title="Make something together, fairly"
        description="From a first private idea to a finished work with everyone credited. Seven stages, one room, and nothing public until you're ready."
        actions={
          <>
            <Button href="#new-canvas" icon={<Lock1 size={16} color="currentColor" aria-hidden />}>Start a private canvas</Button>
          </>
        }
      />

      <section aria-labelledby="stages-heading" className="mt-10">
        <SectionHeader id="stages-heading" title="How a collaboration moves" description="Every project on Artelia follows the same seven stages, so everyone knows what has been agreed and what comes next." />
        <ol className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-7">
          {PROJECT_STAGES.map((stage, i) => (
            <li key={stage.id} className="flex gap-3 rounded-[4px] border border-sand-200 bg-white p-4 lg:flex-col lg:gap-2">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-950 text-xs font-bold text-white" aria-hidden>
                {i + 1}
              </span>
              <div className="min-w-0">
                <p className="font-semibold text-green-950">
                  <span className="sr-only">Stage {i + 1}: </span>
                  {stage.label}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-grey-700">{stage.outcome}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="flex min-w-0 flex-col gap-12">
          <section aria-labelledby="mine-heading">
            <SectionHeader id="mine-heading" title="Your projects" description="Only members see a project room. Here's where each one stands and what it needs next." />
            <ul className="mt-4 flex flex-col gap-4">
              {mine.map((project) => {
                const next = nextNeeded(project);
                return (
                  <Card as="li" key={project.id} className="overflow-hidden p-0">
                    <div className="grid md:grid-cols-[220px_minmax(0,1fr)]">
                      <Media src={project.image} alt="" ratio="4/3" sizes="(max-width: 768px) 100vw, 220px" className="md:h-full" />
                      <div className="flex min-w-0 flex-col gap-4 p-5">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge>{KIND_LABEL[project.kind]}</Badge>
                          <Badge tone="gold">Now: {stageLabel(project.stage)}</Badge>
                        </div>
                        <div>
                          <h3 className="font-playfair text-xl font-semibold text-green-950">
                            <Link href={`/studio/${project.id}`} className="hover:underline">{project.title}</Link>
                          </h3>
                          <p className="mt-1 text-sm text-grey-800">{project.summary}</p>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-grey-700">
                          <AvatarStack names={project.memberIds.map((id) => getPerson(id).name)} />
                          <span>{project.memberIds.map((id) => getPerson(id).name.split(" ")[0]).join(", ")}</span>
                        </div>
                        <StageTracker steps={steps} current={stageIndex(project.stage)} label={`${project.title} stage`} />
                        <div className="flex flex-col gap-3 rounded-[4px] bg-sand-100 p-3 sm:flex-row sm:items-center sm:justify-between">
                          <p className="text-sm text-green-950">
                            <span className="font-semibold">{next.forMe ? "Waiting on you: " : "Next: "}</span>
                            {next.text}
                          </p>
                          <Button href={`/studio/${project.id}`} size="sm" variant={next.forMe ? "primary" : "outline"} icon={<ArrowRight size={16} color="currentColor" aria-hidden />}>
                            Open room
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </ul>
          </section>

          <MatchingAndCanvas />

          <section aria-labelledby="made-heading">
            <SectionHeader
              id="made-heading"
              title="Made on Artelia"
              description="Finished collaborations their makers chose to share. Private canvases and works in progress never appear here."
            />
            <ul className="mt-4 grid gap-4 sm:grid-cols-2">
              {madeOnArtelia.map((project) => (
                <Card as="li" key={project.id} className="flex flex-col overflow-hidden p-0">
                  <Media src={project.image} alt="" ratio="3/2" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 380px" />
                  <div className="flex flex-1 flex-col gap-3 p-5">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge>{KIND_LABEL[project.kind]}</Badge>
                      <Badge tone="green" icon={<TickCircle size={12} color="currentColor" aria-hidden />}>{stageLabel(project.stage)}</Badge>
                    </div>
                    <h3 className="font-playfair text-lg font-semibold text-green-950">{project.title}</h3>
                    <p className="text-sm text-grey-800">{project.summary}</p>
                    <p className="text-xs text-grey-700">
                      By{" "}
                      {project.memberIds.map((id, i) => (
                        <span key={id}>
                          {i > 0 && (i === project.memberIds.length - 1 ? " & " : ", ")}
                          <Link href={`/people/${id}`} className="font-semibold text-green-950 hover:underline">{getPerson(id).name}</Link>
                        </span>
                      ))}
                    </p>
                    <Button href={`/studio/${project.id}`} size="sm" variant="outline" className="mt-auto self-start">See how it was made</Button>
                  </div>
                </Card>
              ))}
            </ul>
          </section>

          <div className="flex flex-col items-center gap-2 border-t border-sand-200 pt-8 text-center">
            <TickCircle size={28} variant="Bulk" color="var(--color-verified)" aria-hidden />
            <p className="font-playfair text-lg font-semibold text-green-950">That&apos;s everything in your studio.</p>
            <p className="max-w-md text-sm text-grey-700">No feed to scroll. Open a room, answer a canvas, or go and make the thing.</p>
          </div>
        </div>

        <aside className="flex flex-col gap-4" aria-label="Studio notes">
          {call && (
            <Card tone="green" className="flex flex-col gap-3 p-5">
              <div className="flex items-center gap-2 text-gold-400">
                <Music size={20} variant="Bulk" color="currentColor" aria-hidden />
                <p className="text-xs font-semibold uppercase tracking-[0.12em]">Open call · pairs only</p>
              </div>
              <p className="font-playfair text-lg font-semibold">{call.title}</p>
              <p className="text-sm text-white/85">{call.summary}</p>
              <p className="text-xs text-white/75">{call.budget} · Deadline {call.deadline}</p>
              <p className="text-xs text-white/75">Asks for a collaboration charter draft — which the Agree stage gives you.</p>
              <Button href={`/opportunities/${call.id}`} variant="secondary" size="sm" className="self-start">Read the call</Button>
            </Card>
          )}

          <Card className="p-5">
            <p className="text-sm font-semibold text-green-950">Fair by default</p>
            <p className="mt-2 text-sm text-grey-700">
              Before production starts, everyone agrees contributions, rights, credit, money and how to leave — in plain language, from templates you can change.
            </p>
          </Card>

          <Card tone="sand" className="p-5">
            <p className="text-sm font-semibold text-green-950">What this costs</p>
            <ul className="mt-2 flex flex-col gap-2 text-sm text-grey-800">
              <li>Canvases, charters and project rooms are free for artists.</li>
              <li>A 5% facilitation fee applies only when a collaboration earns money — paid by the buyer or commissioner, shown on every project.</li>
              <li>Optional project protection: escrow and rights records for commissions.</li>
            </ul>
          </Card>
        </aside>
      </div>
    </Page>
  );
}
