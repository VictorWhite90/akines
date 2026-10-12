// Covers: S1, S4, S5, S6, S7, S8, T2, B2, U2, U3
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Lock1 } from "iconsax-reactjs";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/Headers";
import Media from "@/components/ui/Media";
import Page from "@/components/ui/Page";
import StageTracker from "@/components/ui/StageTracker";
import { PROJECT_STAGES, getPerson, getProject } from "@/lib/data";
import ProjectRoom from "../_components/ProjectRoom";
import { KIND_LABEL, defaultTab, isMember, joinNames, stageIndex, stageLabel } from "../_data";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = getProject(id);
  if (!project) return { title: "Project not found · Artelia Connect" };
  const hidden = !isMember(project) && project.stage === "imagine";
  return { title: `${hidden ? "Private canvas" : project.title} · Collaboration Studio` };
}

export default async function ProjectRoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = getProject(id);
  if (!project) notFound();

  const member = isMember(project);
  const privateCanvas = !member && project.stage === "imagine";
  const roles = new Map(project.charter.roles.map((r) => [r.personId, r.role]));
  const memberNames = joinNames(project.memberIds.map((pid) => getPerson(pid).name));

  return (
    <Page>
      <Link href="/studio" className="inline-flex items-center gap-1.5 text-sm font-semibold text-green-950 hover:underline">
        <ArrowLeft size={16} color="currentColor" aria-hidden /> Collaboration Studio
      </Link>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end">
        <PageHeader
          eyebrow={`${KIND_LABEL[project.kind]} · ${member ? "Your project room" : privateCanvas ? "Private canvas" : "Shared by its makers"}`}
          title={project.title}
          description={privateCanvas ? `A private idea canvas between ${memberNames}. Only invited people can see what's inside.` : project.summary}
        />
        <Media src={project.image} alt="" ratio="16/10" sizes="(max-width: 1024px) 100vw, 320px" priority className="rounded-[4px]" />
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <Badge>{KIND_LABEL[project.kind]}</Badge>
        <Badge tone="gold">Stage {stageIndex(project.stage) + 1} of 7 · {stageLabel(project.stage)}</Badge>
        {privateCanvas && <Badge tone="calm" icon={<Lock1 size={12} color="currentColor" aria-hidden />}>Private — only invited people can see this</Badge>}
      </div>

      <section aria-labelledby="members-heading" className="mt-6">
        <h2 id="members-heading" className="sr-only">Members</h2>
        <ul className="flex flex-wrap gap-3">
          {project.memberIds.map((pid) => {
            const person = getPerson(pid);
            return (
              <li key={pid}>
                <Link href={`/people/${pid}`} className="flex items-center gap-3 rounded-[4px] border border-sand-200 bg-white py-2 pl-2 pr-4 hover:border-green-950">
                  <Avatar name={person.name} size="sm" verified={person.verified} />
                  <span className="text-sm">
                    <span className="block font-semibold text-green-950">{person.name}</span>
                    <span className="block text-xs text-grey-700">{roles.get(pid) ?? person.title} · {person.city}</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <Card className="mt-6 p-5">
        <StageTracker
          steps={PROJECT_STAGES.map(({ id: sid, label }) => ({ id: sid, label }))}
          current={stageIndex(project.stage)}
          label={`${project.title}: collaboration stages`}
        />
        <p className="mt-4 text-center text-sm text-grey-700">
          {PROJECT_STAGES[stageIndex(project.stage)].outcome}
        </p>
      </Card>

      <ProjectRoom project={project} initialTab={defaultTab(project.stage)} member={member} />
    </Page>
  );
}
