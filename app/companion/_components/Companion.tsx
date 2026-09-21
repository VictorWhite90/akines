"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Call, Dislike, Like1, MagicStar, MessageQuestion, Send2, ShieldTick, TickCircle } from "iconsax-reactjs";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import TrustLabel from "@/components/ui/TrustLabel";
import { ME } from "@/lib/data";
import { cn } from "@/lib/cn";
import { DOMAINS, EMERGENCY_NUMBERS, isCrisis, matchAnswer, type CompanionAnswer } from "../_data";

type Message =
  | { id: number; role: "user"; text: string }
  | { id: number; role: "ai"; answer: CompanionAnswer | null; question: string }
  | { id: number; role: "safety" };

let nextId = 1;

export default function Companion() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [thinking, setThinking] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (messages.length) endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages, thinking]);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  function ask(text: string) {
    const question = text.trim();
    if (!question || thinking) return;
    setDraft("");
    setMessages((prev) => [...prev, { id: nextId++, role: "user", text: question }]);
    // Crisis language never gets a normal answer — go straight to safety.
    if (isCrisis(question)) {
      setMessages((prev) => [...prev, { id: nextId++, role: "safety" }]);
      return;
    }
    setThinking(true);
    timer.current = setTimeout(() => {
      setMessages((prev) => [...prev, { id: nextId++, role: "ai", answer: matchAnswer(question), question }]);
      setThinking(false);
    }, 700);
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    ask(draft);
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
      <section aria-labelledby="chat-heading" className="flex min-w-0 flex-col rounded-[4px] border border-sand-200 bg-white">
        <header className="flex flex-wrap items-center gap-3 border-b border-sand-200 p-4 sm:p-5">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-ai-bg text-ai">
            <MagicStar size={20} variant="Bulk" color="currentColor" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <h2 id="chat-heading" className="font-playfair text-lg font-semibold text-green-950">Creative Companion</h2>
            <p className="text-xs text-grey-700">An AI assistant trained on Artelia&apos;s curated knowledge of African art. Not a person.</p>
          </div>
          <Badge tone="ai" icon={<MagicStar size={12} variant="Bold" color="currentColor" aria-hidden />}>AI</Badge>
        </header>

        <div className="flex flex-col gap-5 p-4 sm:p-5" aria-live="polite" aria-relevant="additions">
          {messages.length === 0 && (
            <div className="rounded-[4px] bg-sand-100 p-5">
              <p className="font-playfair text-lg text-green-950">Hello {ME.name.split(" ")[0]}. What are you working through today?</p>
              <p className="mt-1 text-sm text-grey-800">
                I know about African art history, materials and techniques, symbolism, exhibitions, pricing, collecting and creative wellbeing. I&apos;ll always tell you where an answer comes from.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {[DOMAINS[1].prompts[0], DOMAINS[4].prompts[0], DOMAINS[2].prompts[0]].map((p) => (
                  <button key={p} type="button" onClick={() => ask(p)} className="cursor-pointer rounded-full border border-sand-300 bg-white px-3 py-1.5 text-left text-sm text-green-950 hover:border-green-950">
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m) => {
            if (m.role === "user") {
              return (
                <div key={m.id} className="flex justify-end gap-2">
                  <p className="max-w-[85%] rounded-[4px] bg-green-950 px-4 py-3 text-sm text-white">
                    <span className="sr-only">You said: </span>
                    {m.text}
                  </p>
                  <Avatar name={ME.name} size="sm" />
                </div>
              );
            }
            if (m.role === "safety") return <SafetyPanel key={m.id} />;
            return <AnswerCard key={m.id} answer={m.answer} question={m.question} />;
          })}

          {thinking && (
            <p className="flex items-center gap-2 text-sm text-ai">
              <MagicStar size={16} variant="Bulk" color="currentColor" className="animate-pulse" aria-hidden /> The Companion is looking through Artelia&apos;s knowledge…
            </p>
          )}
          <div ref={endRef} />
        </div>

        <form onSubmit={submit} className="mt-auto flex flex-col gap-2 border-t border-sand-200 p-4 sm:flex-row sm:items-end sm:p-5">
          <div className="min-w-0 flex-1">
            <label htmlFor="companion-input" className="text-sm font-semibold text-green-950">Ask the Companion</label>
            <textarea
              id="companion-input"
              rows={2}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  ask(draft);
                }
              }}
              placeholder="e.g. How do I keep an indigo vat alive in harmattan?"
              className="mt-2 w-full resize-none rounded-[2px] border border-sand-300 p-3 text-sm text-green-950 placeholder:text-grey-700"
            />
          </div>
          <Button type="submit" disabled={!draft.trim() || thinking} icon={<Send2 size={18} color="currentColor" aria-hidden />}>Ask</Button>
        </form>
      </section>

      <aside className="flex flex-col gap-4" aria-label="Suggested questions and limits">
        <div className="rounded-[4px] border border-sand-200 bg-white p-5">
          <h2 className="font-playfair text-lg font-semibold text-green-950">Try asking about</h2>
          <div className="mt-3 flex flex-col gap-4">
            {DOMAINS.map((d) => (
              <div key={d.id}>
                <h3 className="text-xs font-semibold uppercase tracking-[0.08em] text-ruby-600">{d.label}</h3>
                <ul className="mt-1.5 flex flex-col gap-1">
                  {d.prompts.map((p) => (
                    <li key={p}>
                      <button type="button" onClick={() => ask(p)} disabled={thinking} className="cursor-pointer text-left text-sm text-green-950 underline-offset-4 hover:underline disabled:cursor-not-allowed disabled:opacity-60">
                        {p}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}

function AnswerCard({ answer, question }: { answer: CompanionAnswer | null; question: string }) {
  const [feedback, setFeedback] = useState<"up" | "down" | null>(null);
  const [escalated, setEscalated] = useState(false);

  return (
    <article className="flex gap-2" aria-label="Companion answer">
      <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ai-bg text-ai">
        <MagicStar size={16} variant="Bulk" color="currentColor" aria-hidden />
      </span>
      <div className="min-w-0 flex-1 rounded-[4px] border border-ai/15 bg-white p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-2">
          <TrustLabel source="ai" />
          {answer && <span className="text-xs text-grey-700">{answer.domain}</span>}
        </div>

        {answer ? (
          <>
            <h3 className="mt-3 font-playfair text-lg font-semibold text-green-950">{answer.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-grey-800">{answer.intro}</p>
            <ul className="mt-3 flex list-disc flex-col gap-2 pl-5 text-sm leading-relaxed text-grey-800 marker:text-gold-500">
              {answer.points.map((p) => <li key={p}>{p}</li>)}
            </ul>
            {answer.close && <p className="mt-3 text-sm text-grey-800">{answer.close}</p>}
            {answer.links && (
              <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                {answer.links.map((l) => (
                  <Link key={l.href} href={l.href} className="font-semibold text-green-950 underline underline-offset-4">{l.label}</Link>
                ))}
              </p>
            )}

            <div className="mt-4 rounded-[4px] bg-sand-100 p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-grey-700">Where this comes from</p>
              <ul className="mt-2 flex flex-col gap-2">
                {answer.sources.map((s) => (
                  <li key={s.label} className="flex flex-col gap-1 text-xs sm:flex-row sm:items-start sm:gap-2">
                    {s.kind === "curated" ? (
                      <span className="inline-flex shrink-0 items-center gap-1 self-start rounded-full bg-verified-bg px-2 py-1 font-semibold text-verified">
                        <ShieldTick size={12} variant="Bold" color="currentColor" aria-hidden /> Artelia curated knowledge (verified)
                      </span>
                    ) : (
                      <span className="inline-flex shrink-0 items-center gap-1 self-start rounded-full bg-ai-bg px-2 py-1 font-semibold text-ai">
                        <MagicStar size={12} variant="Bold" color="currentColor" aria-hidden /> General AI knowledge — please verify
                      </span>
                    )}
                    <span className="text-grey-800">{s.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        ) : (
          <>
            <h3 className="mt-3 font-playfair text-lg font-semibold text-green-950">I don&apos;t have a curated answer for that yet</h3>
            <p className="mt-2 text-sm leading-relaxed text-grey-800">
              I&apos;d rather not guess on “{question}”. I&apos;m strongest on African art history, materials and techniques, symbolism, exhibition planning, pricing guidance, collecting and creative wellbeing — try rephrasing with one of those in mind, or ask a human curator below. They usually reply within two days.
            </p>
            <p className="mt-3 inline-flex items-center gap-1 rounded-full bg-ai-bg px-2 py-1 text-xs font-semibold text-ai">
              <MagicStar size={12} variant="Bold" color="currentColor" aria-hidden /> No sources matched
            </p>
          </>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-sand-200 pt-3">
          {answer && (
            <>
              <span className="text-xs text-grey-700">Was this useful?</span>
              <button type="button" aria-pressed={feedback === "up"} onClick={() => setFeedback("up")} className={cn("inline-flex cursor-pointer items-center gap-1 rounded-full border px-2.5 py-1 text-xs", feedback === "up" ? "border-verified bg-verified-bg text-verified" : "border-sand-300 text-green-950 hover:border-green-950")}>
                <Like1 size={14} color="currentColor" aria-hidden /> Helpful
              </button>
              <button type="button" aria-pressed={feedback === "down"} onClick={() => setFeedback("down")} className={cn("inline-flex cursor-pointer items-center gap-1 rounded-full border px-2.5 py-1 text-xs", feedback === "down" ? "border-alert bg-alert-bg text-alert" : "border-sand-300 text-green-950 hover:border-green-950")}>
                <Dislike size={14} color="currentColor" aria-hidden /> Not helpful
              </button>
            </>
          )}
          {!escalated ? (
            <Button variant={feedback === "down" || !answer ? "outline" : "ghost"} size="sm" className="ml-auto" onClick={() => setEscalated(true)} icon={<MessageQuestion size={16} color="currentColor" aria-hidden />}>
              Ask a human curator
            </Button>
          ) : null}
        </div>
        <div aria-live="polite" className="text-xs">
          {feedback === "up" && <p className="mt-2 text-verified">Thanks — this helps curators keep the knowledge base useful.</p>}
          {feedback === "down" && !escalated && <p className="mt-2 text-grey-800">Thanks for telling us. A human curator can give you a proper answer.</p>}
          {escalated && (
            <p className="mt-2 flex items-start gap-1.5 text-verified">
              <TickCircle size={14} variant="Bold" color="currentColor" className="mt-0.5 shrink-0" aria-hidden />
              Sent to Artelia&apos;s curator team with your question. A verified curator will reply in your messages, usually within two days.
            </p>
          )}
        </div>
      </div>
    </article>
  );
}

function SafetyPanel() {
  return (
    <div role="region" aria-label="Support" className="rounded-[4px] border border-alert/25 bg-alert-bg p-5">
      <p className="font-playfair text-lg font-semibold text-green-950">I&apos;m really glad you told me. You don&apos;t have to go through this alone.</p>
      <p className="mt-2 text-sm leading-relaxed text-grey-800">
        I&apos;m an AI, so I&apos;m not the right support for this — but people are. If you can, reach out to someone you trust right now, or to one of the options below.
      </p>
      <p className="mt-4 flex items-center gap-2 text-sm font-semibold text-alert">
        <Call size={18} variant="Bold" color="currentColor" aria-hidden />
        If you&apos;re in immediate danger, call your local emergency number.
      </p>
      <ul className="mt-3 grid gap-2 sm:grid-cols-2">
        {EMERGENCY_NUMBERS.map((e) => (
          <li key={e.country} className="flex items-center justify-between gap-3 rounded-[2px] bg-white px-3 py-2 text-sm">
            <span className="text-grey-800">{e.country}</span>
            <span className="font-semibold text-green-950">{e.number}</span>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Button href="/wellbeing" size="sm">See support options</Button>
        <span className="text-xs text-grey-700">Licensed therapists, art therapists and helplines near you.</span>
      </div>
      <p className="mt-4 text-xs text-grey-700">
        This conversation is private. It isn&apos;t shared, and it never affects your matches, opportunities or visibility. If I misread you, that&apos;s okay — you can keep asking below.
      </p>
    </div>
  );
}
