"use client";

import { CONVOS, type Convo, type KMsg } from "@/lib/data/kinmessage";
import { PEOPLE, type PersonId } from "@/lib/data/people";
import { newId, useLocal } from "@/lib/useLocal";

/**
 * Adds a message to a conversation from outside Messages (an invitation from a plan, say), in the same browser
 * stores Messages and Collaborate read (km:convos, km:msgs). A direct chat that doesn't exist yet is started.
 */
export function useSendMessage() {
  const [extra, setExtra] = useLocal<Convo[]>("km:convos", []);
  const [, setMsgs] = useLocal<Record<string, KMsg[]>>("km:msgs", {});
  /** `to` is a conversation id, or a person to message directly. Returns the conversation id. */
  return (to: string, msg: Omit<KMsg, "id" | "at">) => {
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
