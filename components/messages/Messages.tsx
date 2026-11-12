"use client";

import { useEffect } from "react";
import { Check } from "lucide-react";
import { faceSrc, photoSrc } from "@/components/kin/home/parts";
import { CONVOS, KIND_LABEL, type Convo, type KMsg } from "@/lib/data/kinmessage";
import { ME, PEOPLE, type PersonId } from "@/lib/data/people";
import { DEMO } from "@/lib/demo/mode";
import { newId, useLocal } from "@/lib/useLocal";
import { TIMES_NOW } from "@/components/community/PlanCall";
import { ConvoList, EmptyPane, text, ThreadPane } from "./parts";
import RemoteMessages from "./RemoteMessages";

/*
 * Messages, mirrored from the product design (pieces in ./parts.tsx, classes in components/kin/community.css).
 * - Signed in to Akines: conversations, messages, photos, invitations, read state and live updates come from the
 *   chat API (./RemoteMessages.tsx, lib/api/chat.ts, lib/live.ts).
 * - Demo (NEXT_PUBLIC_DEMO_MODE=1): the sample conversations, with what you write kept in this browser
 *   (localStorage km:convos, km:msgs, km:read), as Collaborate's team chat reads them too.
 */

const ME_ID = ME.id as PersonId;
const now = () => new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

function sub(c: Convo) {
  if (c.kind === "direct") { const p = PEOPLE[c.members[0]]; return p ? `${p.role} · ${p.city}` : ""; }
  return `${KIND_LABEL[c.kind]} · ${c.members.length + 1} members`;
}

const faceOf = (c: Convo, size: number) => (c.kind === "direct" ? faceSrc(c.members[0], size * 2) : c.photo ? photoSrc(c.photo, size * 2) : faceSrc(c.members[0], size * 2));

export default function Messages({ initial }: { initial?: string }) {
  return DEMO ? <LocalMessages initial={initial} /> : <RemoteMessages initial={initial} />;
}

function LocalMessages({ initial }: { initial?: string }) {
  const [extra, setExtra] = useLocal<Convo[]>("km:convos", []);
  const [added, setAdded] = useLocal<Record<string, KMsg[]>>("km:msgs", {});
  const [read, setRead] = useLocal<string[]>("km:read", []);
  const saved = [...extra, ...CONVOS];
  // /messages/<person id> opens your chat with that person, or a fresh one if you have not talked yet.
  const person = initial && initial in PEOPLE && initial !== ME_ID ? (initial as PersonId) : null;
  const existing = initial ? saved.find((x) => x.id === initial) ?? (person ? saved.find((x) => x.kind === "direct" && x.members[0] === person) : undefined) : undefined;
  const fresh: Convo | null = person && !existing ? { id: person, kind: "direct", name: PEOPLE[person].name, members: [person], intent: "checkin", last: "", health: { label: "Growing", value: 10, exchanges: 0, shared: 0, reciprocity: "Just starting", lastMet: "Not yet" }, memories: [], msgs: [] } : null;
  const convos = fresh ? [fresh, ...saved] : saved;
  const open = existing ?? fresh ?? null;

  useEffect(() => {
    if (open && !read.includes(open.id)) setRead([...read, open.id]);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mark read when a conversation opens
  }, [open?.id]);

  const send = (c: Convo, t: string) => {
    if (fresh && c.id === fresh.id && !(added[c.id]?.length)) setExtra([fresh, ...extra]);
    setAdded((cur) => ({ ...cur, [c.id]: [...(cur[c.id] ?? []), { id: newId("m"), from: ME_ID, at: now(), kind: "text", text: t }] }));
  };
  const last = (c: Convo) => { const all = [...c.msgs, ...(added[c.id] ?? [])]; const m = all[all.length - 1]; return m ? text(m) : c.last; };
  const meta = (c: Convo) => { const all = [...c.msgs, ...(added[c.id] ?? [])]; return all[all.length - 1]?.at.split(" · ")[0] ?? ""; };
  // The Quick Catch-up suggests someone you already talk to (the design suggests Folake).
  const friend = saved.find((c) => c.kind === "direct")?.members[0];

  const plan = (c: Convo) => ({
    eyebrow: "Create Call",
    title: c.kind === "direct" ? `Arrange a Create Call with ${c.name.split(" ")[0]}` : `Arrange a Create Call for ${c.name}`,
    lead: c.kind === "direct" ? "Make something together, or pick up where you left off." : `Pick a time to work on ${c.name} together.`,
    people: c.members.slice(0, 3),
    convo: c.id,
    note: "Shall we find time to work on this together?",
    placeholder: "Add what you would like to work on (optional)",
  });

  return (
    <div className="ch-msg" data-view={open ? "thread" : "list"}>
      <ConvoList rows={convos.map((c) => ({ id: c.id, name: c.name, desc: last(c), meta: meta(c), face: faceOf(c, 44) }))} openId={open?.id} />
      {open ? (
        <ThreadPane
          key={open.id}
          name={open.name}
          sub={sub(open)}
          face={faceOf(open, 48)}
          group={open.kind !== "direct"}
          msgs={[...open.msgs, ...(added[open.id] ?? [])]}
          me={ME_ID}
          status={(added[open.id]?.length ?? 0) > 0 ? <p className="ch-sent"><Check size={14} strokeWidth={1.5} aria-hidden /><span>Sent</span></p> : null}
          onSend={(t) => send(open, t)}
          plan={open.kind === "direct" || open.kind === "project" ? plan(open) : undefined}
        />
      ) : (
        <EmptyPane quick={friend ? { eyebrow: "About 15 minutes", title: "Quick Catch-up", lead: "A short, easy conversation with someone from your circle.", people: [friend], peopleText: `Suggested: ${PEOPLE[friend].name.split(" ")[0]}`, times: TIMES_NOW, note: `Hi ${PEOPLE[friend].name.split(" ")[0]}, do you have a few minutes for a quick catch-up?`, image: photoSrc("talkTwo", 1120) } : undefined} />
      )}
    </div>
  );
}
