"use client";

import Link from "next/link";
import { useRef, useState, type FormEvent } from "react";
import { Add, ArrowRight, CloseCircle, Lock1, MagicStar, People, Trash } from "iconsax-reactjs";
import Avatar, { AvatarStack } from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Chip from "@/components/ui/Chip";
import { SectionHeader } from "@/components/ui/Headers";
import Notice from "@/components/ui/Notice";
import TrustLabel from "@/components/ui/TrustLabel";
import { ME_ID, PEOPLE, getPerson, getProject } from "@/lib/data";
import { STUDIO_MATCHES, joinNames, type StudioMatch } from "../_data";

type Draft = { id: string; question: string; invited: string[]; references: string[] };

/** People you can invite: makers, not buyers or institutions. */
const INVITABLE = PEOPLE.filter((p) => p.id !== ME_ID && (p.role === "artist" || p.role === "creative" || p.role === "researcher"));

export default function MatchingAndCanvas() {
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [question, setQuestion] = useState("");
  const [invited, setInvited] = useState<string[]>([]);
  const [refInput, setRefInput] = useState("");
  const [references, setReferences] = useState<string[]>([]);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const questionRef = useRef<HTMLTextAreaElement>(null);
  const formRef = useRef<HTMLElement>(null);

  const visible = STUDIO_MATCHES.filter((m) => !dismissed.includes(m.id));

  function startFrom(match: StudioMatch) {
    setQuestion(match.prompt);
    setInvited(match.personIds);
    setError("");
    setStatus(`Started a canvas with ${joinNames(match.personIds.map((id) => getPerson(id).name))}. Edit the question, then open it.`);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    questionRef.current?.focus({ preventScroll: true });
  }

  function addReference() {
    const value = refInput.trim();
    if (!value) return;
    setReferences((r) => [...r, value]);
    setRefInput("");
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!question.trim()) {
      setError("Write the question you want to explore — even one line is enough.");
      questionRef.current?.focus();
      return;
    }
    if (invited.length === 0) {
      setError("Invite at least one person. A canvas is for exploring together.");
      return;
    }
    const draft: Draft = { id: `draft-${Date.now()}`, question: question.trim(), invited, references };
    setDrafts((d) => [draft, ...d]);
    setStatus(`Private canvas opened. Invitations sent to ${joinNames(invited.map((id) => getPerson(id).name.split(" ")[0]))} — only they can see it.`);
    setError("");
    setQuestion("");
    setInvited([]);
    setReferences([]);
  }

  return (
    <>
      <section aria-labelledby="matching-heading">
        <SectionHeader
          id="matching-heading"
          eyebrow="Collaboration matching"
          title="People to make something with"
          description="Matched on what you share and on how your practices differ in useful ways. Every suggestion explains itself — dismiss any that miss."
          action={
            <Link href="/dna" className="text-sm font-semibold text-green-950 underline underline-offset-4">
              Adjust what matching uses
            </Link>
          }
        />
        <ul className="mt-4 grid gap-4 md:grid-cols-2">
          {visible.map((match) => {
            const people = match.personIds.map(getPerson);
            const existing = match.existingProjectId ? getProject(match.existingProjectId) : undefined;
            return (
              <Card as="li" key={match.id} className="flex flex-col gap-4 p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Badge tone={match.example ? "neutral" : "gold"}>{match.pairing}</Badge>
                  <TrustLabel source="ai" />
                </div>
                <div className="flex items-center gap-3">
                  {people.length > 1 ? <AvatarStack names={people.map((p) => p.name)} size="md" /> : <Avatar name={people[0].name} size="md" verified={people[0].verified} />}
                  <div className="min-w-0 text-sm">
                    {people.map((p, i) => (
                      <span key={p.id}>
                        {i > 0 && <span className="text-grey-700"> & </span>}
                        <Link href={`/people/${p.id}`} className="font-semibold text-green-950 hover:underline">{p.name}</Link>
                      </span>
                    ))}
                    <p className="text-grey-700">{people.map((p) => `${p.title}, ${p.city}`).join(" · ")}</p>
                  </div>
                </div>
                <p className="font-playfair text-lg leading-snug text-green-950">{match.headline}</p>
                <div className="grid gap-3 text-sm">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-grey-700">What you share</p>
                    <ul className="mt-1.5 flex flex-col gap-1.5">
                      {match.similarity.map((r) => (
                        <li key={r.text} className="flex items-start gap-2 text-grey-800">
                          <TrustLabel source={r.source} compact className="mt-0.5 shrink-0" />
                          <span>{r.text}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-grey-700">Productive difference</p>
                    <ul className="mt-1.5 flex flex-col gap-1.5">
                      {match.difference.map((r) => (
                        <li key={r.text} className="flex items-start gap-2 text-grey-800">
                          <TrustLabel source={r.source} compact className="mt-0.5 shrink-0" />
                          <span>{r.text}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {match.example ? (
                  <p className="mt-auto rounded-[4px] bg-sand-100 p-3 text-xs text-grey-800">
                    <Lock1 size={14} color="currentColor" aria-hidden className="mr-1 inline" />
                    An example from the pilot: Fatima and Sipho are now testing an idea on a private canvas. Only the two of them can see it.
                  </p>
                ) : (
                  <div className="mt-auto flex flex-col gap-3">
                    {existing && (
                      <p className="text-xs text-grey-700">
                        Already making together:{" "}
                        <Link href={`/studio/${existing.id}`} className="font-semibold text-green-950 underline underline-offset-4">{existing.title}</Link>
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" onClick={() => startFrom(match)} icon={<Lock1 size={16} color="currentColor" aria-hidden />}>
                        Open a private idea canvas
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setDismissed((d) => [...d, match.id])} icon={<CloseCircle size={16} color="currentColor" aria-hidden />}>
                        Not for me
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </ul>
        {dismissed.length > 0 && (
          <p className="mt-3 text-sm text-grey-700" aria-live="polite">
            {dismissed.length} suggestion{dismissed.length > 1 ? "s" : ""} dismissed — we won&apos;t suggest {dismissed.length > 1 ? "them" : "it"} again this season.{" "}
            <button type="button" className="cursor-pointer font-semibold text-green-950 underline underline-offset-4" onClick={() => setDismissed([])}>
              Undo
            </button>
          </p>
        )}
        <p className="mt-3 flex items-start gap-2 text-xs text-grey-700">
          <MagicStar size={14} color="currentColor" aria-hidden className="mt-0.5 shrink-0" />
          Matching uses your declared practices and themes, availability, languages and verification — never follower counts or sales. The AI suggests; you decide.
        </p>
      </section>

      <section ref={formRef} id="new-canvas" aria-labelledby="canvas-heading" className="scroll-mt-6">
        <SectionHeader
          id="canvas-heading"
          eyebrow="Imagine"
          title="Start a private idea canvas"
          description="Test an idea with the people you invite before anyone commits to a project, a charter or money."
        />
        <Card className="mt-4 p-5 sm:p-6">
          <form onSubmit={submit} className="flex flex-col gap-5" noValidate>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="canvas-question" className="text-sm font-semibold text-green-950">The question you want to explore</label>
              <textarea
                id="canvas-question"
                ref={questionRef}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                rows={2}
                aria-describedby="canvas-question-hint"
                aria-invalid={!!error && !question.trim()}
                placeholder="e.g. What would a wrapper remember if it were danced in before it was hung?"
                className="rounded-[4px] border border-sand-300 bg-white px-3 py-2 text-sm text-green-950 placeholder:text-grey-600"
              />
              <p id="canvas-question-hint" className="text-xs text-grey-700">A question, not a plan. Your collaborators will answer it in their own words.</p>
            </div>

            <fieldset className="flex flex-col gap-2">
              <legend className="text-sm font-semibold text-green-950">Invite collaborators</legend>
              <p className="text-xs text-grey-700">Only the people you invite will ever see this canvas.</p>
              <div className="mt-1 flex flex-wrap gap-2">
                {INVITABLE.map((p) => (
                  <Chip
                    key={p.id}
                    selected={invited.includes(p.id)}
                    onToggle={() => setInvited((list) => (list.includes(p.id) ? list.filter((x) => x !== p.id) : [...list, p.id]))}
                  >
                    {p.name.split(" ")[0]} <span className="text-xs opacity-75">· {p.title}</span>
                  </Chip>
                ))}
              </div>
            </fieldset>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="canvas-ref" className="text-sm font-semibold text-green-950">References</label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  id="canvas-ref"
                  value={refInput}
                  onChange={(e) => setRefInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addReference();
                    }
                  }}
                  placeholder="A memory, a place, a recording, an object…"
                  className="h-11 min-w-0 flex-1 rounded-[4px] border border-sand-300 bg-white px-3 text-sm text-green-950 placeholder:text-grey-600"
                />
                <Button variant="outline" onClick={addReference} icon={<Add size={16} color="currentColor" aria-hidden />}>Add reference</Button>
              </div>
              {references.length > 0 && (
                <ul className="mt-2 flex flex-wrap gap-2">
                  {references.map((ref, i) => (
                    <li key={`${ref}-${i}`} className="inline-flex items-center gap-1.5 rounded-full bg-sand-100 py-1 pl-3 pr-1 text-sm text-green-950">
                      {ref}
                      <button
                        type="button"
                        onClick={() => setReferences((r) => r.filter((_, j) => j !== i))}
                        className="cursor-pointer rounded-full p-1 text-grey-700 hover:bg-sand-200"
                        aria-label={`Remove reference: ${ref}`}
                      >
                        <Trash size={14} color="currentColor" aria-hidden />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <Notice tone="private" title="Private by default">
              No charter, no money, no public page. You can close the canvas at any time, and nothing in it is used for matching or shown on your profile.
            </Notice>

            <div className="flex flex-wrap items-center gap-3">
              <Button type="submit" icon={<Lock1 size={16} color="currentColor" aria-hidden />}>Open the private canvas</Button>
              <p className="text-sm" aria-live="polite">
                {error ? <span className="text-alert">{error}</span> : <span className="text-grey-800">{status}</span>}
              </p>
            </div>
          </form>
        </Card>

        {drafts.length > 0 && (
          <ul className="mt-4 flex flex-col gap-3" aria-label="Your new canvases">
            {drafts.map((d) => (
              <Card as="li" key={d.id} tone="sand" className="flex flex-col gap-3 p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone="calm" icon={<Lock1 size={12} color="currentColor" aria-hidden />}>Private — only invited people can see this</Badge>
                  <Badge>Draft canvas · Imagine</Badge>
                </div>
                <p className="font-playfair text-lg leading-snug text-green-950">“{d.question}”</p>
                <div className="flex flex-wrap items-center gap-3 text-sm text-grey-800">
                  <People size={16} color="currentColor" aria-hidden />
                  <AvatarStack names={[getPerson(ME_ID).name, ...d.invited.map((id) => getPerson(id).name)]} size="xs" />
                  <span>You + {joinNames(d.invited.map((id) => getPerson(id).name.split(" ")[0]))} · invitations pending</span>
                </div>
                {d.references.length > 0 && <p className="text-xs text-grey-700">References: {d.references.join(" · ")}</p>}
                <p className="flex items-center gap-1 text-xs text-grey-700">
                  Next: each person answers the compatibility questions <ArrowRight size={14} color="currentColor" aria-hidden />
                </p>
              </Card>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
