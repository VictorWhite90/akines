"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import Pic from "@/components/home/Pic";
import Avatar from "@/components/ui/Avatar";
import ChatThread from "@/components/chat/ChatThread";
import { first } from "@/components/chat/bits";
import { useChat } from "@/components/chat/useChat";
import { useKinnections } from "@/components/relationships/useKinnections";
import { threadWith } from "@/lib/data/dms";
import type { PhotoKey } from "@/lib/data/images";
import { ME, PEOPLE, type PersonId } from "@/lib/data/people";
import type { Msg } from "@/lib/data/roomChat";

/** A 1:1 conversation, built on the same ChatThread engine as Rooms and Circles. */
export default function ThreadView({ id }: { id: PersonId }) {
  const p = PEOPLE[id];
  const me = ME.id as PersonId;
  const { has, add, ready } = useKinnections();
  const existing = threadWith(id);

  const seed = useMemo<Msg[]>(
    () => existing?.msgs ?? [{ id: 1, from: id, at: "Just now", kind: "system", text: `This is the start of your conversation with ${p.name}.` }],
    [existing, id, p.name],
  );
  const chat = useChat(seed, [id, me]);
  const [draft, setDraft] = useState("");
  const [lightbox, setLightbox] = useState<PhotoKey | null>(null);
  const input = useRef<HTMLTextAreaElement>(null);

  if (!ready) return null;

  if (!has(id)) {
    return (
      <div className="msg-gate">
        <Avatar person={p} size={56} />
        <h2>You haven&apos;t connected with {first(id)} yet</h2>
        <p>Kinnect keeps messaging for people you&apos;ve chosen to acknowledge. Say hello, and a conversation opens here.</p>
        <button type="button" className="go" onClick={() => add(id)}>Say hello to {first(id)} →</button>
      </div>
    );
  }

  return (
    // .rs is the class the Rooms/Circles chat CSS scopes bubbles, replies and voice notes under
    // (.rs .row, .rs .bubble, .rs .day, .rs .sys); messages.css neutralizes its own grid layout
    // here (.msg-panel .rs{display:contents}) since .msg-panel already provides the flex column.
    <div className="rs">
      <header className="rs-head">
        <Link href="/messages" className="back" aria-label="All conversations">←</Link>
        <Avatar person={p} size={46} />
        <div className="who">
          <h1>{p.name}</h1>
          <p>{chat.typing ? <em>{first(id)} is typing…</em> : `${p.role} · ${p.city}`}</p>
        </div>
      </header>

      <ChatThread chat={chat} draft={draft} setDraft={setDraft} inputRef={input} onOpenPhoto={setLightbox} placeholder={`Message ${first(id)}…`} />

      {lightbox && (
        <div className="rs-modal dark" onClick={() => setLightbox(null)} role="dialog" aria-modal="true" aria-label="Photo">
          <button className="x" onClick={() => setLightbox(null)} aria-label="Close">×</button>
          <div className="big"><Pic name={lightbox} sizes="900px" /></div>
        </div>
      )}
    </div>
  );
}
