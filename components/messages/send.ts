"use client";

import { useCallback } from "react";
import { chat, newClientId, type ChatCard } from "@/lib/api/chat";
import { CONVOS, type Convo, type KMsg } from "@/lib/data/kinmessage";
import { PEOPLE, type PersonId } from "@/lib/data/people";
import { DEMO } from "@/lib/demo/mode";
import { newId, useLocal } from "@/lib/useLocal";
import { cardFrom } from "./remote";

type Outgoing = Omit<KMsg, "id" | "at">;
/** `to` is a conversation id, or a person to message directly. Returns the conversation id (or the person's id). */
type Send = (to: string, msg: Outgoing) => string | undefined;

/**
 * Adds a message to a conversation from outside Messages (an invitation from a plan, say).
 * - Demo: in the same browser stores Messages and Collaborate read (km:convos, km:msgs). A direct chat that doesn't
 *   exist yet is started.
 * - Signed in: sent through the chat API (an invitation as a card, text as text). A person's id opens your chat with
 *   them first (POST chat/direct). Open screens see it arrive over the live connection.
 */
export const useSendMessage: () => Send = DEMO ? useLocalSend : useRemoteSend;

function useLocalSend(): Send {
  const [extra, setExtra] = useLocal<Convo[]>("km:convos", []);
  const [, setMsgs] = useLocal<Record<string, KMsg[]>>("km:msgs", {});
  return (to, msg) => {
    const all = [...extra, ...CONVOS];
    let id = all.some((c) => c.id === to) ? to : all.find((c) => c.kind === "direct" && c.members[0] === to)?.id;
    if (!id && to in PEOPLE) {
      id = to;
      const fresh: Convo = { id, kind: "direct", name: PEOPLE[to as PersonId].name, members: [to as PersonId], intent: "plan", last: "", health: { label: "Growing", value: 10, exchanges: 0, shared: 0, reciprocity: "Just starting", lastMet: "Not yet" }, memories: [], msgs: [] };
      setExtra((cur) => [fresh, ...cur]);
    }
    if (!id) return undefined;
    const at = new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
    const target = id;
    setMsgs((cur) => ({ ...cur, [target]: [...(cur[target] ?? []), { ...msg, id: newId("m"), at } as KMsg] }));
    return id;
  };
}

const RETRIES = 3;
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Posts one message; a dropped connection or a busy server is retried with the same client_id (never twice). */
async function post(conversationId: string, input: { body?: string; card?: ChatCard; client_id: string }) {
  for (let attempt = 0; ; attempt++) {
    const r = await chat.send(conversationId, input);
    if (r.ok || (r.status > 0 && r.status < 500 && r.status !== 429) || attempt >= RETRIES - 1) return r;
    await wait(1000 * 2 ** attempt);
  }
}

function useRemoteSend(): Send {
  return useCallback((to, msg) => {
    if (!to) return undefined;
    const m = msg as KMsg;
    let input: { body?: string; card?: ChatCard; client_id: string } | null = null;
    if (m.kind === "invite") input = { card: cardFrom(m), client_id: newClientId() };
    else if (m.kind === "text" && m.text.trim()) input = { body: m.text.trim().slice(0, 2000), client_id: newClientId() };
    if (!input) return undefined; // voice notes, polls and sample photos exist only in the demo
    const message = input;
    void (async () => {
      // A conversation id first; if it isn't one of yours, `to` is a member's user id: your chat with them.
      let r = await post(to, message);
      if (!r.ok && r.status === 404) {
        const direct = await chat.direct(to);
        if (direct.ok) r = await post(direct.data.id, message);
      }
      if (!r.ok && typeof console !== "undefined") console.warn("Message not sent:", r.message);
    })();
    return to;
  }, []);
}
