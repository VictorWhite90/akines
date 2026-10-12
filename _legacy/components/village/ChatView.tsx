"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { MagicStar, People, Send2, ShieldTick } from "iconsax-reactjs";
import { AvatarStack } from "@/components/ui/Avatar";
import { getPerson } from "@/lib/data/people";
import { COMPANION_ID, RESPONSES, type ChannelKind, type Message, type ResponseKind } from "@/lib/data/village";
import { ME_ID } from "@/lib/data/people";
import { cn } from "@/lib/cn";
import AttachmentView from "./Attachments";
import { PresenceAvatar } from "./Presence";

function authorName(id: string) {
  return id === COMPANION_ID ? "Companion" : getPerson(id).name;
}

function Responses({ message, onToggle }: { message: Message; onToggle: (kind: ResponseKind) => void }) {
  const [picking, setPicking] = useState(false);
  const existing = message.responses ?? [];
  return (
    <div className="mt-2 flex flex-wrap items-center gap-1.5">
      {existing.map((r) => {
        const mine = r.personIds.includes(ME_ID);
        return (
          <button
            key={r.kind}
            type="button"
            onClick={() => onToggle(r.kind)}
            aria-pressed={mine}
            title={r.personIds.map(authorName).join(", ")}
            className={cn(
              "inline-flex cursor-pointer items-center gap-1.5 rounded-full border py-0.5 pl-2 pr-1 text-xs transition-colors",
              mine ? "border-green-950 bg-green-950 text-white" : "border-sand-200 bg-white text-green-950 hover:border-sand-300",
            )}
          >
            <span aria-hidden>{RESPONSES[r.kind].mark}</span>
            {RESPONSES[r.kind].label}
            <AvatarStack names={r.personIds.map(authorName)} size="xs" max={3} />
          </button>
        );
      })}
      {picking ? (
        <span className="inline-flex flex-wrap gap-1">
          {(Object.keys(RESPONSES) as ResponseKind[]).map((kind) => (
            <button
              key={kind}
              type="button"
              onClick={() => {
                onToggle(kind);
                setPicking(false);
              }}
              className="cursor-pointer rounded-full border border-sand-300 bg-white px-2.5 py-0.5 text-xs text-green-950 hover:border-green-950"
            >
              {RESPONSES[kind].mark} {RESPONSES[kind].label}
            </button>
          ))}
        </span>
      ) : (
        <button type="button" onClick={() => setPicking(true)} className="cursor-pointer rounded-full px-2 py-0.5 text-xs text-grey-600 opacity-0 transition-opacity hover:text-green-950 focus:opacity-100 group-hover:opacity-100">
          + Respond
        </button>
      )}
    </div>
  );
}

function MessageItem({ message, compact, roleTag, onToggle }: { message: Message; compact: boolean; roleTag?: string; onToggle: (kind: ResponseKind) => void }) {
  const isCompanion = message.authorId === COMPANION_ID;
  const person = isCompanion ? null : getPerson(message.authorId);
  return (
    <li className={cn("group flex gap-3 px-4 hover:bg-sand-100/60 sm:px-6", compact ? "py-1" : "pt-4 pb-1")}>
      <div className="w-10 shrink-0">
        {!compact &&
          (isCompanion ? (
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-ai-bg text-ai">
              <MagicStar size={20} variant="Bold" color="currentColor" aria-hidden />
            </span>
          ) : (
            <Link href={`/people/${person!.id}`} aria-label={person!.name}>
              <PresenceAvatar personId={person!.id} name={person!.name} size="md" ring="ring-sand-50" />
            </Link>
          ))}
      </div>
      <div className="min-w-0 flex-1">
        {!compact && (
          <p className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            {isCompanion ? (
              <span className="font-semibold text-ai">Companion</span>
            ) : (
              <Link href={`/people/${person!.id}`} className="font-semibold text-green-950 hover:underline">
                {person!.name}
              </Link>
            )}
            {isCompanion && <span className="rounded bg-ai-bg px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-ai">AI</span>}
            {person?.verified && <ShieldTick size={14} variant="Bold" color="var(--color-verified)" aria-label="Verified" />}
            {roleTag && <span className="text-xs text-grey-600">{roleTag}</span>}
            <span className="text-xs text-grey-600">{message.time}</span>
          </p>
        )}
        {message.body && <p className="mt-0.5 whitespace-pre-line text-[15px] leading-relaxed text-grey-1000">{message.body}</p>}
        {message.attachment && <AttachmentView attachment={message.attachment} />}
        {!isCompanion && <Responses message={message} onToggle={onToggle} />}
      </div>
    </li>
  );
}

const COMPANION_REPLY =
  "Here's a thought to start from: pair the question with one concrete constraint — a material, a place or a date. I'm an AI, so treat this as a prompt, not an answer; the people in this space know more than I do.";

export default function ChatView({
  title,
  topic,
  icon,
  initialMessages,
  channelKind = "text",
  roleTags = {},
  placeholder,
  members,
  pinned,
}: {
  title: string;
  topic?: string;
  icon: ReactNode;
  initialMessages: Message[];
  channelKind?: ChannelKind;
  roleTags?: Record<string, string>;
  placeholder: string;
  members?: ReactNode;
  pinned?: ReactNode;
}) {
  const [messages, setMessages] = useState(initialMessages);
  const [draft, setDraft] = useState("");
  const [showMembers, setShowMembers] = useState(true);
  const endRef = useRef<HTMLDivElement>(null);
  const readOnly = channelKind === "announce";

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  const toggle = (id: string, kind: ResponseKind) =>
    setMessages((all) =>
      all.map((m) => {
        if (m.id !== id) return m;
        const responses = [...(m.responses ?? [])];
        const i = responses.findIndex((r) => r.kind === kind);
        if (i === -1) responses.push({ kind, personIds: [ME_ID] });
        else {
          const has = responses[i].personIds.includes(ME_ID);
          const personIds = has ? responses[i].personIds.filter((p) => p !== ME_ID) : [...responses[i].personIds, ME_ID];
          if (personIds.length) responses[i] = { kind, personIds };
          else responses.splice(i, 1);
        }
        return { ...m, responses };
      }),
    );

  const send = () => {
    const body = draft.trim();
    if (!body) return;
    const mine: Message = { id: `me-${Date.now()}`, authorId: ME_ID, time: "Just now", body };
    setMessages((all) => [...all, mine]);
    setDraft("");
    if (/@companion/i.test(body)) {
      window.setTimeout(() => setMessages((all) => [...all, { id: `ai-${Date.now()}`, authorId: COMPANION_ID, time: "Just now", body: COMPANION_REPLY }]), 700);
    }
  };

  return (
    <div className="flex h-full min-h-0">
      <section className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-sand-200 bg-sand-50 px-4 sm:px-6">
          <span className="text-grey-600">{icon}</span>
          <h1 className="font-semibold text-green-950">{title}</h1>
          {topic && <p className="hidden truncate border-l border-sand-300 pl-3 text-sm text-grey-700 md:block">{topic}</p>}
          {members && (
            <button
              type="button"
              onClick={() => setShowMembers((v) => !v)}
              aria-pressed={showMembers}
              aria-label="Show who's here"
              className="ml-auto hidden cursor-pointer rounded-full p-2 text-grey-700 hover:bg-sand-100 xl:inline-flex"
            >
              <People size={20} color="currentColor" aria-hidden />
            </button>
          )}
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto pb-4">
          {pinned}
          <ol aria-label={`Messages in ${title}`}>
            {messages.map((m, i) => (
              <MessageItem
                key={m.id}
                message={m}
                compact={i > 0 && messages[i - 1].authorId === m.authorId && !m.attachment && m.time === messages[i - 1].time}
                roleTag={roleTags[m.authorId]}
                onToggle={(kind) => toggle(m.id, kind)}
              />
            ))}
          </ol>
          <div ref={endRef} />
        </div>

        <div className="shrink-0 border-t border-sand-200 bg-sand-50 px-4 py-3 sm:px-6">
          {readOnly ? (
            <p className="py-2 text-center text-sm text-grey-700">Only moderators post in #welcome. Say hello in #general.</p>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send();
              }}
              className="flex items-end gap-2 rounded-[10px] border border-sand-300 bg-white px-3 py-2 focus-within:border-green-950"
            >
              {channelKind === "feedback" && !draft && (
                <button
                  type="button"
                  onClick={() => setDraft("Asking for critique:\n— What's working?\n— What's unclear?\n— What would you try?")}
                  className="shrink-0 cursor-pointer rounded-full bg-sand-100 px-3 py-1.5 text-xs font-semibold text-green-950 hover:bg-sand-200"
                >
                  Ask for critique
                </button>
              )}
              <label htmlFor="composer" className="sr-only">
                {placeholder}
              </label>
              <textarea
                id="composer"
                rows={draft.includes("\n") ? 4 : 1}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                placeholder={placeholder}
                className="max-h-40 min-w-0 flex-1 resize-none bg-transparent py-1.5 text-[15px] text-grey-1000 outline-none placeholder:text-grey-600"
              />
              <button type="submit" disabled={!draft.trim()} aria-label="Send" className="shrink-0 cursor-pointer rounded-full bg-green-950 p-2 text-white disabled:cursor-not-allowed disabled:opacity-30">
                <Send2 size={16} variant="Bold" color="currentColor" aria-hidden />
              </button>
            </form>
          )}
          {!readOnly && <p className="mt-1.5 hidden text-[11px] text-grey-600 sm:block">Type @companion to ask the AI. Responses show who, never how many.</p>}
        </div>
      </section>

      {members && showMembers && <aside className="hidden w-64 shrink-0 overflow-y-auto border-l border-sand-200 bg-sand-50 xl:block">{members}</aside>}
    </div>
  );
}
