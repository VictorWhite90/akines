import { ArrowLeft, ArrowRight, Clock, DocumentText, Gallery, Music, TickCircle, VideoPlay } from "iconsax-reactjs";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { ME_ID, getPerson } from "@/lib/data";
import type { Project } from "@/lib/types";
import { cn } from "@/lib/cn";
import { money } from "../../_data";
import { PanelHeading, Quiet } from "./shared";

export type Task = Project["tasks"][number];
export type Milestone = Project["milestones"][number];
type TaskStatus = Task["status"];

const COLUMNS: { id: TaskStatus; label: string }[] = [
  { id: "todo", label: "To do" },
  { id: "doing", label: "Doing" },
  { id: "done", label: "Done" },
];

const FILE_ICON = { image: Gallery, audio: Music, doc: DocumentText, video: VideoPlay } as const;
const FILE_LABEL = { image: "Image", audio: "Audio", doc: "Document", video: "Video" } as const;

/** Escrowed budget released per approved milestone. */
export function trancheFor(project: Project) {
  const total = project.payments.reduce((sum, p) => sum + p.amount, 0);
  return project.milestones.length ? Math.round(total / project.milestones.length) : 0;
}

export default function CreatePanel({
  project,
  tasks,
  milestones,
  canAct,
  onMove,
  onApprove,
}: {
  project: Project;
  tasks: Task[];
  milestones: Milestone[];
  canAct: boolean;
  onMove: (taskId: string, to: TaskStatus) => void;
  onApprove: (milestoneId: string) => void;
}) {
  const tranche = trancheFor(project);
  const empty = tasks.length === 0 && milestones.length === 0 && project.files.length === 0;

  if (empty) {
    return (
      <div className="flex flex-col gap-4">
        <PanelHeading>Project room</PanelHeading>
        <Quiet>
          {project.kind === "institutional-commission"
            ? "This commission's production was tracked through the commissioner's own milestone approvals before project rooms existed. Payment and legacy records are in Share value and Preserve."
            : "No tasks, milestones or files were kept in this room. The contribution ledger in Preserve records who did what."}
        </Quiet>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10">
      <section aria-label="Task board" className="flex flex-col gap-3">
        <PanelHeading description="Everyone sees the same board. Move a task when it changes.">Task board</PanelHeading>
        <div className="grid gap-4 md:grid-cols-3">
          {COLUMNS.map((col, ci) => {
            const items = tasks.filter((t) => t.status === col.id);
            return (
              <div key={col.id} className="flex flex-col gap-3 rounded-[4px] bg-sand-100 p-3">
                <p className="flex items-center justify-between px-1 text-sm font-semibold text-green-950">
                  {col.label} <span className="text-xs font-normal text-grey-700">{items.length}</span>
                </p>
                {items.length === 0 && <p className="px-1 pb-2 text-xs text-grey-700">Nothing here.</p>}
                <ul className="flex flex-col gap-2">
                  {items.map((task) => {
                    const person = getPerson(task.assigneeId);
                    const prev = COLUMNS[ci - 1];
                    const next = COLUMNS[ci + 1];
                    return (
                      <li key={task.id} className="flex flex-col gap-3 rounded-[4px] border border-sand-200 bg-white p-3">
                        <p className={cn("text-sm text-green-950", task.status === "done" && "text-grey-700 line-through")}>{task.title}</p>
                        <div className="flex items-center gap-2 text-xs text-grey-700">
                          <Avatar name={person.name} size="xs" />
                          <span>{task.assigneeId === ME_ID ? "You" : person.name.split(" ")[0]} · due {task.due}</span>
                        </div>
                        {canAct && (
                          <div className="flex flex-wrap gap-1">
                            {prev && (
                              <Button size="sm" variant="ghost" className="h-8 px-2" onClick={() => onMove(task.id, prev.id)} icon={<ArrowLeft size={14} color="currentColor" aria-hidden />}>
                                <span className="sr-only">Move “{task.title}” to </span>{prev.label}
                              </Button>
                            )}
                            {next && (
                              <Button size="sm" variant="ghost" className="ml-auto h-8 px-2" onClick={() => onMove(task.id, next.id)}>
                                <span className="sr-only">Move “{task.title}” to </span>{next.label}
                                <ArrowRight size={14} color="currentColor" aria-hidden />
                              </Button>
                            )}
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      <section aria-label="Milestones" className="flex flex-col gap-3">
        <PanelHeading description="A milestone is done when every member approves it. Approvals release the next escrowed budget tranche.">Milestones & approvals</PanelHeading>
        {milestones.length ? (
          <ol className="flex flex-col gap-3">
            {milestones.map((m) => {
              const myApproval = m.approvals.find((a) => a.personId === ME_ID);
              const canApprove = canAct && m.status === "current" && myApproval && !myApproval.approved;
              return (
                <Card as="li" key={m.id} className={cn("flex flex-col gap-3 p-4 sm:p-5", m.status === "current" && "border-gold-400 ring-1 ring-gold-400")}>
                  <div className="flex flex-wrap items-center gap-2">
                    {m.status === "done" && <Badge tone="green" icon={<TickCircle size={12} color="currentColor" aria-hidden />}>Approved</Badge>}
                    {m.status === "current" && <Badge tone="gold" icon={<Clock size={12} color="currentColor" aria-hidden />}>Awaiting approval</Badge>}
                    {m.status === "upcoming" && <Badge>Upcoming</Badge>}
                    <p className="font-semibold text-green-950">{m.title}</p>
                    <span className="text-sm text-grey-700">· {m.date}</span>
                  </div>
                  {m.approvals.length > 0 ? (
                    <ul className="flex flex-wrap gap-2">
                      {m.approvals.map((a) => (
                        <li key={a.personId} className={cn("inline-flex items-center gap-2 rounded-full py-1 pl-1 pr-3 text-xs", a.approved ? "bg-verified-bg text-verified" : "bg-sand-100 text-grey-800")}>
                          <Avatar name={getPerson(a.personId).name} size="xs" />
                          {a.personId === ME_ID ? "You" : getPerson(a.personId).name.split(" ")[0]} · {a.approved ? "approved" : "not yet"}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-grey-700">Approvals open when this milestone becomes current.</p>
                  )}
                  {m.status === "current" && tranche > 0 && (
                    <p className="text-sm text-grey-800">
                      When everyone approves, the next budget tranche of <span className="font-semibold text-green-950">{money(tranche, project.currency)}</span> is released from escrow, split as the charter says.
                    </p>
                  )}
                  {canApprove && (
                    <Button size="sm" className="self-start" onClick={() => onApprove(m.id)} icon={<TickCircle size={16} color="currentColor" aria-hidden />}>
                      Approve “{m.title}”
                    </Button>
                  )}
                </Card>
              );
            })}
          </ol>
        ) : (
          <Quiet>No milestones set yet.</Quiet>
        )}
      </section>

      <section aria-label="Files" className="flex flex-col gap-3">
        <PanelHeading description="Every file shows who added it — part of the record of contribution.">Files</PanelHeading>
        {project.files.length ? (
          <ul className="flex flex-col divide-y divide-sand-200 rounded-[4px] border border-sand-200 bg-white">
            {project.files.map((f) => {
              const Icon = FILE_ICON[f.kind];
              return (
                <li key={f.name} className="flex items-center gap-3 p-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[4px] bg-sand-100 text-green-950">
                    <Icon size={20} variant="Bulk" color="currentColor" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-green-950">{f.name}</p>
                    <p className="text-xs text-grey-700">
                      {FILE_LABEL[f.kind]} · {f.by === ME_ID ? "You" : getPerson(f.by).name} · {f.date}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <Quiet>No files yet.</Quiet>
        )}
      </section>
    </div>
  );
}
