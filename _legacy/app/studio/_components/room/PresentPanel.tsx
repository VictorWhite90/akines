import Link from "next/link";
import { Clock, Eye, Shop, TickCircle } from "iconsax-reactjs";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Media from "@/components/ui/Media";
import { ME_ID, getPerson } from "@/lib/data";
import type { Project } from "@/lib/types";
import { cn } from "@/lib/cn";
import { firstName, joinNames, launchPlan } from "../../_data";
import { PanelHeading } from "./shared";

export default function PresentPanel({
  project,
  canAct,
  listed,
  onList,
  showStory = true,
}: {
  project: Project;
  canAct: boolean;
  listed: boolean;
  onList: () => void;
  showStory?: boolean;
}) {
  const plan = launchPlan(project);
  const roles = new Map(project.charter.roles.map((r) => [r.personId, r.role]));
  const credit = project.charter.credit || joinNames(project.memberIds.map((id) => getPerson(id).name));

  return (
    <div className="flex flex-col gap-10">
      {showStory && (
        <section aria-label="Public story page preview" className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <PanelHeading description="One shared page for the work — the story, the makers and how it was made.">Public story page</PanelHeading>
            <Badge icon={<Eye size={12} color="currentColor" aria-hidden />}>Preview</Badge>
          </div>
          <Card className="overflow-hidden p-0">
            <div className="flex items-center gap-2 border-b border-sand-200 bg-sand-100 px-4 py-2 text-xs text-grey-700">
              <span className="flex gap-1" aria-hidden>
                <span className="h-2 w-2 rounded-full bg-sand-300" />
                <span className="h-2 w-2 rounded-full bg-sand-300" />
                <span className="h-2 w-2 rounded-full bg-sand-300" />
              </span>
              <span className="truncate">artelia.art/made/{project.id}</span>
            </div>
            <div className="grid md:grid-cols-2">
              <Media src={project.image} alt={`${project.title}, preview image`} ratio="4/3" sizes="(max-width: 768px) 100vw, 480px" className="md:h-full" />
              <div className="flex flex-col gap-4 p-5 sm:p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ruby-600">Made on Artelia</p>
                <p className="font-playfair text-2xl font-semibold leading-tight text-green-950">{project.title}</p>
                <p className="text-sm text-grey-800">{project.summary}</p>
                <p className="text-sm text-green-950">{credit}</p>
                <ul className="flex flex-col gap-1.5 text-sm">
                  {project.memberIds.map((id) => (
                    <li key={id}>
                      <Link href={`/people/${id}`} className="font-semibold text-green-950 hover:underline">{getPerson(id).name}</Link>
                      <span className="text-grey-700"> · {roles.get(id) ?? getPerson(id).title}</span>
                    </li>
                  ))}
                </ul>
                {project.idea.prompt && <p className="border-l-2 border-gold-400 pl-3 font-playfair italic text-green-950">“{project.idea.prompt}”</p>}
              </div>
            </div>
          </Card>
        </section>
      )}

      <section aria-label="Launch plan" className="flex flex-col gap-3">
        <PanelHeading description="How the work reaches people — in order, with dates everyone agreed.">Launch plan</PanelHeading>
        <ol className="flex flex-col gap-2">
          {plan.map((step) => (
            <li key={step.label} className="flex items-start gap-3 rounded-[4px] border border-sand-200 bg-white p-4">
              <span
                className={cn(
                  "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
                  step.status === "done" && "bg-green-950 text-white",
                  step.status === "next" && "bg-gold-400 text-green-950",
                  step.status === "later" && "border border-sand-300 text-grey-600",
                )}
              >
                {step.status === "done" ? <TickCircle size={14} variant="Bold" color="currentColor" aria-hidden /> : <Clock size={14} color="currentColor" aria-hidden />}
              </span>
              <div className="min-w-0 flex-1 text-sm">
                <p className="text-green-950">{step.label}</p>
                <p className="text-xs text-grey-700">
                  {step.date} · {step.status === "done" ? "Done" : step.status === "next" ? "Next" : "Planned"}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {canAct && (
        <Card tone="sand" className="flex flex-col gap-3 p-5 sm:p-6">
          <div className="flex items-center gap-2 text-green-950">
            <Shop size={20} variant="Bulk" color="currentColor" aria-hidden />
            <p className="font-semibold">List on Artelia</p>
          </div>
          <p className="text-sm text-grey-800">
            Put the finished work on Artelia Discover, the marketplace, with its story attached. You set the price together; the listing goes live only when every member approves, and sales follow the charter&apos;s split.
          </p>
          <div className="flex flex-wrap items-center gap-3" aria-live="polite">
            {listed ? (
              <p className="flex items-center gap-2 text-sm font-semibold text-verified">
                <TickCircle size={18} variant="Bold" color="currentColor" aria-hidden />
                Listing drafted. Waiting for {joinNames(project.memberIds.filter((id) => id !== ME_ID).map(firstName))} to approve the price and story.
              </p>
            ) : (
              <Button onClick={onList} icon={<Shop size={16} color="currentColor" aria-hidden />}>List on Artelia</Button>
            )}
          </div>
        </Card>
      )}
      {!canAct && (
        <p className="flex items-start gap-2 rounded-[4px] bg-sand-100 p-4 text-sm text-grey-800">
          <Shop size={18} color="currentColor" aria-hidden className="mt-0.5 shrink-0" />
          Only the makers decide whether this work is listed on Artelia Discover, and every one of them must approve the listing.
        </p>
      )}
    </div>
  );
}
