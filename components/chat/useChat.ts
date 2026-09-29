"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ME, type PersonId } from "@/lib/data/people";
import { REPLIES, type Msg } from "@/lib/data/roomChat";
import { clock } from "./bits";

export type NewMsg = Omit<Msg, "id" | "at"> & { at?: string };
export type Chat = {
  msgs: Msg[];
  push: (m: NewMsg) => void;
  typing: PersonId | null;
  simulateReply: () => void;
};

/** Messages for several channels at once (a Circle), plus a simulated member who answers after you write. */
export function useChannelChat<K extends string>(seeds: Record<K, Msg[]>, members: PersonId[]) {
  const [store, setStore] = useState<Record<K, Msg[]>>(seeds);
  const [typing, setTyping] = useState<{ ch: K; who: PersonId } | null>(null);
  const nextId = useRef(1000);
  const timers = useRef<number[]>([]);
  const replyCount = useRef(0);

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  const pushTo = useCallback((ch: K, m: NewMsg) => setStore((cur) => ({ ...cur, [ch]: [...cur[ch], { id: nextId.current++, at: clock(), ...m }] })), []);

  const replyIn = useCallback(
    (ch: K) => {
      const others = members.filter((m) => m !== ME.id);
      if (!others.length) return;
      const n = replyCount.current++;
      const who = others[(n * 3 + 1) % others.length];
      timers.current.push(
        window.setTimeout(() => setTyping({ ch, who }), 900),
        window.setTimeout(() => {
          setTyping(null);
          pushTo(ch, { from: who, kind: "text", text: REPLIES[n % REPLIES.length] });
        }, 3100),
      );
    },
    [members, pushTo],
  );

  const chatFor = (ch: K): Chat => ({
    msgs: store[ch],
    push: (m) => pushTo(ch, m),
    typing: typing?.ch === ch ? typing.who : null,
    simulateReply: () => replyIn(ch),
  });

  return { chatFor };
}

/** One conversation (a Presence Room). */
export function useChat(seed: Msg[], members: PersonId[]): Chat {
  const [initial] = useState(() => ({ main: seed }));
  return useChannelChat(initial, members).chatFor("main");
}
