import { useState, type FormEvent } from "react";
import { Gallery, Location, Lock1, MessageText, Music } from "iconsax-reactjs";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Notice from "@/components/ui/Notice";
import { ME_ID, getPerson } from "@/lib/data";
import type { Project } from "@/lib/types";
import { PanelHeading, Quiet } from "./shared";

export type Question = Project["idea"]["questions"][number];
export type Note = { personId: string; text: string; date: string };

/** Used when a canvas was opened without its own questions. */
export const DEFAULT_QUESTIONS: Question[] = [
  { q: "What is non-negotiable for you in this project?", answers: [] },
  { q: "How do you like to make decisions?", answers: [] },
  { q: "What would make this worth it, even if it never sells?", answers: [] },
];

function refIcon(ref: string) {
  if (/record|sound|audio|song|harbour at/i.test(ref)) return Music;
  if (/market|riad|cape town|kano|abeokuta|gikomba|lagos|dakar|marina/i.test(ref)) return Location;
  return Gallery;
}

export default function ImaginePanel({
  project,
  questions,
  notes,
  canAct,
  onAnswer,
  onNote,
}: {
  project: Project;
  questions: Question[];
  notes: Note[];
  canAct: boolean;
  onAnswer: (index: number, text: string) => void;
  onNote: (text: string) => void;
}) {
  const [draftAnswers, setDraftAnswers] = useState<Record<number, string>>({});
  const [note, setNote] = useState("");

  function submitNote(e: FormEvent) {
    e.preventDefault();
    if (!note.trim()) return;
    onNote(note.trim());
    setNote("");
  }

  if (!project.idea.prompt && project.idea.references.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <PanelHeading>The idea canvas</PanelHeading>
        <Quiet>
          This project began from an open call rather than a private canvas, so there is no idea board to show. Its brief lived in the call itself; everything since is recorded in the later stages.
        </Quiet>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <Notice tone="private" title="Private idea canvas">
        Only {project.memberIds.map((id) => getPerson(id).name.split(" ")[0]).join(" and ")} can see this canvas. Nothing here is public, used for matching or shown on anyone&apos;s profile.
      </Notice>

      <Card tone="green" className="p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gold-400">The question we&apos;re exploring</p>
        <p className="mt-3 font-playfair text-2xl leading-snug sm:text-3xl">“{project.idea.prompt || "Still finding the question"}”</p>
      </Card>

      <section className="flex flex-col gap-3" aria-label="References board">
        <PanelHeading description="Places, memories, objects and sounds the idea grew from.">References board</PanelHeading>
        {project.idea.references.length ? (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {project.idea.references.map((ref, i) => {
              const Icon = refIcon(ref);
              return (
                <li key={ref} className={`flex min-h-28 flex-col justify-between gap-3 rounded-[4px] border border-sand-200 p-4 ${i % 3 === 1 ? "bg-sand-100" : "bg-white"}`}>
                  <Icon size={22} variant="Bulk" color="var(--color-ruby-600)" aria-hidden />
                  <p className="font-playfair text-base text-green-950">{ref}</p>
                </li>
              );
            })}
          </ul>
        ) : (
          <Quiet>No references pinned yet. Add a memory, a place or a recording as a note below.</Quiet>
        )}
      </section>

      <section className="flex flex-col gap-3" aria-label="Compatibility questions">
        <PanelHeading description="Honest answers now save hard conversations later. Everyone answers in their own words.">Compatibility questions</PanelHeading>
        <ul className="flex flex-col gap-3">
          {questions.map((question, qi) => {
            const mineAnswered = question.answers.some((a) => a.personId === ME_ID);
            return (
              <Card as="li" key={question.q} className="flex flex-col gap-3 p-5">
                <p className="font-semibold text-green-950">{question.q}</p>
                <ul className="flex flex-col gap-3">
                  {project.memberIds.map((pid) => {
                    const person = getPerson(pid);
                    const answer = question.answers.find((a) => a.personId === pid);
                    return (
                      <li key={pid} className="flex items-start gap-3">
                        <Avatar name={person.name} size="sm" />
                        <div className="min-w-0 text-sm">
                          <p className="font-semibold text-green-950">{pid === ME_ID ? "You" : person.name.split(" ")[0]}</p>
                          {answer ? <p className="text-grey-800">{answer.text}</p> : <p className="italic text-grey-600">Hasn&apos;t answered yet</p>}
                        </div>
                      </li>
                    );
                  })}
                </ul>
                {canAct && project.memberIds.includes(ME_ID) && !mineAnswered && (
                  <form
                    className="flex flex-col gap-2 sm:flex-row"
                    onSubmit={(e) => {
                      e.preventDefault();
                      const text = draftAnswers[qi]?.trim();
                      if (!text) return;
                      onAnswer(qi, text);
                      setDraftAnswers((d) => ({ ...d, [qi]: "" }));
                    }}
                  >
                    <label htmlFor={`answer-${qi}`} className="sr-only">Your answer to: {question.q}</label>
                    <input
                      id={`answer-${qi}`}
                      value={draftAnswers[qi] ?? ""}
                      onChange={(e) => setDraftAnswers((d) => ({ ...d, [qi]: e.target.value }))}
                      placeholder="Your answer"
                      className="h-11 min-w-0 flex-1 rounded-[4px] border border-sand-300 bg-white px-3 text-sm text-green-950 placeholder:text-grey-600"
                    />
                    <Button type="submit" variant="outline">Answer</Button>
                  </form>
                )}
              </Card>
            );
          })}
        </ul>
      </section>

      <section className="flex flex-col gap-3" aria-label="Notes">
        <PanelHeading description="Loose thoughts, links, doubts. Notes stay on the canvas.">Notes</PanelHeading>
        {notes.length > 0 ? (
          <ul className="flex flex-col gap-3">
            {notes.map((n, i) => (
              <li key={`${n.date}-${i}`} className="flex items-start gap-3 rounded-[4px] border border-sand-200 bg-white p-4">
                <MessageText size={18} color="var(--color-grey-700)" aria-hidden className="mt-0.5 shrink-0" />
                <div className="min-w-0 text-sm">
                  <p className="text-grey-800">{n.text}</p>
                  <p className="mt-1 text-xs text-grey-700">{n.personId === ME_ID ? "You" : getPerson(n.personId).name} · {n.date}</p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <Quiet>No notes yet.</Quiet>
        )}
        {canAct && (
          <form onSubmit={submitNote} className="flex flex-col gap-2">
            <label htmlFor="canvas-note" className="text-sm font-semibold text-green-950">Add a note</label>
            <textarea
              id="canvas-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="e.g. What if the panels hang low enough that people have to brush past them?"
              className="rounded-[4px] border border-sand-300 bg-white px-3 py-2 text-sm text-green-950 placeholder:text-grey-600"
            />
            <Button type="submit" size="sm" className="self-start" icon={<Lock1 size={16} color="currentColor" aria-hidden />} disabled={!note.trim()}>
              Add to the private canvas
            </Button>
          </form>
        )}
      </section>
    </div>
  );
}
