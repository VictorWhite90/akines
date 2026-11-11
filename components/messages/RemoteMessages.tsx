"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Check } from "lucide-react";
import type { Plan } from "@/components/community/PlanCall";
import { useMe } from "@/components/shell/MemberContext";
import { chat, newClientId, type ChatMessage, type Conversation, type ConversationMember } from "@/lib/api/chat";
import { person as personOf, type PersonId } from "@/lib/data/people";
import { shrinkImage } from "@/lib/imageShrink";
import { live } from "@/lib/live";
import { ConvoList, EmptyPane, ThreadPane } from "./parts";
import { convoName, convoSub, kindOf, preview, remember, toShown, when, type Live } from "./remote";

/*
 * Messages on the Akines chat API (chat/ in the backend; lib/api/chat.ts):
 * - the list: your conversations newest first, 30 at a time (more as you scroll), with unread counts; kept current
 *   by the live connection (lib/live.ts) and refetched after a reconnect
 * - a conversation: the latest 30 messages, older ones as you scroll up, new ones live (and any missed while
 *   offline); sending shows the message at once and confirms it when saved (a retry reuses its client_id, so it
 *   never posts twice); a photo pasted or dropped in is shrunk, uploaded and sent; reading marks it read
 * - /messages/<id> opens a conversation by its id, or your chat with a member by their user id. A chat with
 *   someone you haven't written to yet is made when you send the first message (POST chat/direct).
 */

const PAGE = 30;
const PHOTO_TYPES = /^image\/(jpeg|png|webp|heic|heif)$/;

function upsert(list: Conversation[], c: Conversation) {
  const rest = list.filter((x) => x.id !== c.id);
  return [c, ...rest].sort((a, b) => (b.last_message_at ?? "").localeCompare(a.last_message_at ?? ""));
}

export default function RemoteMessages({ initial }: { initial?: string }) {
  const { me } = useMe();
  const meId = me?.id ?? "";
  const [convos, setConvos] = useState<Conversation[] | null>(null);
  const [paging, setPaging] = useState({ next: 2, more: false, busy: false });
  /** What /messages/<initial> turned out to be when it isn't in the loaded list: a conversation, or a person. */
  const [lookup, setLookup] = useState<{ id: string; convo?: Conversation; person?: boolean } | null>(null);
  const convosRef = useRef<Conversation[] | null>(null);
  const openRef = useRef<string | undefined>(undefined);
  useEffect(() => { convosRef.current = convos; }, [convos]);

  const loadFirst = useCallback(async () => {
    const r = await chat.conversations(1);
    if (!r.ok) { setConvos((cur) => cur ?? []); return; }
    r.data.forEach((c) => remember(c.peer));
    setConvos((cur) => r.data.reduce((list, c) => upsert(list, c), cur ?? []));
    setPaging((p) => ({ ...p, more: p.next > 2 ? p.more : r.data.length >= PAGE }));
  }, []);

  const loadMore = useCallback(async () => {
    if (paging.busy || !paging.more) return;
    setPaging((p) => ({ ...p, busy: true }));
    const r = await chat.conversations(paging.next);
    if (r.ok) {
      r.data.forEach((c) => remember(c.peer));
      setConvos((cur) => r.data.reduce((list, c) => upsert(list, c), cur ?? []));
    }
    setPaging((p) => ({ next: r.ok ? p.next + 1 : p.next, more: r.ok ? r.data.length >= PAGE : p.more, busy: false }));
  }, [paging]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the first page of conversations
    void loadFirst();
  }, [loadFirst]);

  // Live: new messages move a conversation to the top and count as unread unless it's open; reads, removals,
  // closing and leaving update the list. After a reconnect, the first page is fetched again.
  useEffect(() => {
    const done = live.use();
    const off = live.on((e) => {
      if (!("conversation_id" in e)) return;
      const id = e.conversation_id;
      if (e.type === "message.new") {
        if (!convosRef.current?.some((c) => c.id === id)) { void loadFirst(); return; }
        remember(e.message.sender);
        const counts = e.message.sender && e.message.sender.user_id !== meId && openRef.current !== id;
        setConvos((cur) => {
          const c = cur?.find((x) => x.id === id);
          return c && cur ? upsert(cur, { ...c, last_message: e.message, last_message_at: e.message.created_at, unread_count: c.unread_count + (counts ? 1 : 0) }) : cur;
        });
      } else if (e.type === "conversation.read") {
        setConvos((cur) => cur?.map((c) => (c.id === id ? { ...c, unread_count: e.unread_count } : c)) ?? cur);
      } else if (e.type === "message.removed") {
        setConvos((cur) => cur?.map((c) => (c.id === id && c.last_message?.id === e.message_id ? { ...c, last_message: { ...c.last_message, is_removed: true, body: "", image: null, card: null } } : c)) ?? cur);
      } else if (e.type === "conversation.closed") {
        setConvos((cur) => cur?.map((c) => (c.id === id ? { ...c, is_closed: true } : c)) ?? cur);
      } else if (e.type === "conversation.left") {
        setConvos((cur) => cur?.filter((c) => c.id !== id) ?? cur);
      }
    });
    const offStatus = live.onStatus((s, reconnected) => { if (s === "open" && reconnected) void loadFirst(); });
    return () => { off(); offStatus(); done(); };
  }, [loadFirst, meId]);

  const list = useMemo(() => convos ?? [], [convos]);
  const found = initial ? list.find((c) => c.id === initial) ?? list.find((c) => c.kind === "direct" && c.peer?.user_id === initial) : undefined;
  const looked = lookup && lookup.id === initial ? lookup : null;
  const open = found ?? looked?.convo;
  const person = !open && looked?.person && initial && initial !== meId ? initial : undefined;
  useEffect(() => { openRef.current = open?.id; }, [open?.id]);

  // A link to something that isn't in the loaded pages: a conversation further down, or a member's user id.
  useEffect(() => {
    if (!initial || convos === null || found || lookup?.id === initial) return;
    let gone = false;
    void chat.conversation(initial).then((r) => {
      if (gone) return;
      if (r.ok) remember(r.data.peer);
      setLookup(r.ok ? { id: initial, convo: r.data } : { id: initial, person: r.status === 404 });
    });
    return () => { gone = true; };
  }, [initial, convos, found, lookup?.id]);

  const onConversation = useCallback((c: Conversation) => {
    remember(c.peer);
    setConvos((cur) => upsert(cur ?? [], c));
  }, []);
  const onRead = useCallback((id: string, unread: number) => {
    setConvos((cur) => cur?.map((c) => (c.id === id ? { ...c, unread_count: unread } : c)) ?? cur);
  }, []);
  const onSent = useCallback((id: string, m: ChatMessage) => {
    setConvos((cur) => {
      const c = cur?.find((x) => x.id === id);
      return c && cur && (c.last_message?.id ?? 0) < m.id ? upsert(cur, { ...c, last_message: m, last_message_at: m.created_at }) : cur;
    });
  }, []);

  const rows = useMemo(() => {
    const shown = list.map((c) => ({
      id: c.id,
      name: convoName(c),
      desc: preview(c.last_message),
      meta: c.unread_count > 0 && c.id !== open?.id ? `${c.unread_count} new` : when(c.last_message_at),
      face: c.kind === "direct" ? c.peer?.profile_photo : null,
      label: c.unread_count > 0 ? `${convoName(c)}, ${c.unread_count} unread` : undefined,
    }));
    if (open && !list.some((c) => c.id === open.id)) shown.unshift({ id: open.id, name: convoName(open), desc: preview(open.last_message), meta: when(open.last_message_at), face: open.peer?.profile_photo, label: undefined });
    if (person) shown.unshift({ id: person, name: personOf(person as PersonId).name, desc: "", meta: "", face: personOf(person as PersonId).photo, label: undefined });
    return shown;
  }, [list, open, person]);

  const waiting = !!initial && !open && !person && !(looked && !looked.person);
  return (
    <div className="ch-msg" data-view={initial ? "thread" : "list"}>
      <ConvoList rows={rows} openId={open?.id ?? person} onEnd={paging.more ? () => void loadMore() : undefined} />
      {open || person ? (
        <RemoteThread key={initial} convo={open ?? null} personId={person} meId={meId} me={me} onConversation={onConversation} onRead={onRead} onSent={onSent} />
      ) : waiting ? (
        <div className="ch-msg__main" aria-busy="true" />
      ) : (
        <EmptyPane />
      )}
    </div>
  );
}

type MeShape = ReturnType<typeof useMe>["me"];

function RemoteThread({
  convo, personId, meId, me, onConversation, onRead, onSent,
}: {
  convo: Conversation | null;
  personId?: string;
  meId: string;
  me: MeShape;
  onConversation: (c: Conversation) => void;
  onRead: (id: string, unread: number) => void;
  onSent: (id: string, m: ChatMessage) => void;
}) {
  const cid = convo?.id;
  const [msgs, setMsgs] = useState<Live[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [members, setMembers] = useState<ConversationMember[]>([]);
  const [reads, setReads] = useState<Record<string, number>>({});
  const [notice, setNotice] = useState<string | null>(null);
  const msgsRef = useRef<Live[]>([]);
  const cidRef = useRef(cid);
  const olderBusy = useRef(false);
  const lastReadSent = useRef(0);
  const lastTyping = useRef(0);
  useEffect(() => { msgsRef.current = msgs; }, [msgs]);
  useEffect(() => { cidRef.current = cid; }, [cid]);

  const merge = useCallback((incoming: ChatMessage[]) => {
    incoming.forEach((m) => remember(m.sender));
    setMsgs((cur) => {
      const list = [...cur];
      for (const m of incoming) {
        const at = list.findIndex((x) => x.id === m.id || (!!m.client_id && x.client_id === m.client_id));
        if (at >= 0) list[at] = { ...m, localImage: list[at].localImage };
        else list.push(m);
      }
      return list.sort((a, b) => (a.state ? 1 : 0) - (b.state ? 1 : 0) || a.id - b.id);
    });
  }, []);
  const lastSavedId = () => {
    const list = msgsRef.current;
    for (let i = list.length - 1; i >= 0; i--) if (!list[i].state) return list[i].id;
    return 0;
  };

  // The latest page, and the members (for "Seen" and the Create Call invitation).
  useEffect(() => {
    if (!cid) return;
    let gone = false;
    void Promise.all([chat.messages(cid), chat.conversation(cid)]).then(([page, detail]) => {
      if (gone) return;
      if (page.ok) { merge(page.data.results); setHasMore(page.data.has_more); } else setNotice(page.message);
      if (detail.ok && detail.data.members) {
        detail.data.members.forEach((m) => remember(m.user));
        setMembers(detail.data.members);
        setReads(Object.fromEntries(detail.data.members.map((m) => [m.user.user_id, m.last_read_message_id])));
      }
    });
    return () => { gone = true; };
  }, [cid, merge]);

  // Live: new messages, removals and read receipts here; after a reconnect, what was missed.
  useEffect(() => {
    if (!cid) return;
    const done = live.use();
    const off = live.on((e) => {
      if (!("conversation_id" in e) || e.conversation_id !== cid) return;
      if (e.type === "message.new") merge([e.message]);
      else if (e.type === "message.removed") setMsgs((cur) => cur.map((m) => (m.id === e.message_id ? { ...m, is_removed: true, body: "", image: null, card: null } : m)));
      else if (e.type === "message.read") setReads((cur) => ({ ...cur, [e.user_id]: Math.max(cur[e.user_id] ?? 0, e.message_id) }));
    });
    const offStatus = live.onStatus(async (s, reconnected) => {
      if (s !== "open" || !reconnected) return;
      const after = lastSavedId();
      if (!after) return;
      const r = await chat.messages(cid, { after, limit: 100 });
      if (r.ok) merge(r.data.results);
    });
    return () => { off(); offStatus(); done(); };
  }, [cid, merge]);

  // Read: once the newest message is on screen and the tab is in front.
  const newest = msgs.reduce((n, m) => (m.state ? n : Math.max(n, m.id)), 0);
  useEffect(() => {
    if (!cid || !newest || newest <= lastReadSent.current) return;
    const mark = () => {
      if (document.visibilityState !== "visible") return;
      lastReadSent.current = newest;
      void chat.read(cid, newest).then((r) => { if (r.ok) onRead(cid, r.data.unread_count); });
    };
    const t = setTimeout(mark, 400);
    document.addEventListener("visibilitychange", mark);
    return () => { clearTimeout(t); document.removeEventListener("visibilitychange", mark); };
  }, [cid, newest, onRead]);

  const loadOlder = async () => {
    const oldest = msgs.find((m) => !m.state)?.id;
    if (!cid || !hasMore || !oldest || olderBusy.current) return;
    olderBusy.current = true;
    const r = await chat.messages(cid, { before: oldest });
    olderBusy.current = false;
    if (!r.ok) return setNotice(r.message);
    setHasMore(r.data.has_more);
    merge(r.data.results);
  };

  // ── Sending ──────────────────────────────────────────────────────

  /** The conversation to send to: this one, or your new chat with the person (made on the first message). */
  const ensure = async (): Promise<string | null> => {
    if (cidRef.current) return cidRef.current;
    if (!personId) return null;
    const r = await chat.direct(personId);
    if (!r.ok) { setNotice(r.message); return null; }
    cidRef.current = r.data.id;
    onConversation(r.data);
    return r.data.id;
  };

  const setState = (clientId: string, patch: Partial<Live>) => setMsgs((cur) => cur.map((m) => (m.client_id === clientId ? { ...m, ...patch } : m)));

  const deliver = async (pending: Live, file?: Blob) => {
    setState(pending.client_id, { state: "sending" });
    setNotice(null);
    const id = await ensure();
    if (!id) return setState(pending.client_id, { state: "failed" });
    let imageId = pending.image?.id;
    if (file && !imageId) {
      const up = await chat.uploadImage(id, file);
      if (!up.ok) { setNotice(up.message); return setState(pending.client_id, { state: "failed" }); }
      imageId = up.data.id;
      pending.image = up.data;
      setState(pending.client_id, { image: up.data });
    }
    const r = await chat.send(id, { body: pending.body || undefined, image_id: imageId, client_id: pending.client_id });
    if (r.ok) { merge([r.data]); onSent(id, r.data); return; }
    if (r.status && r.status < 500) setNotice(r.message);
    setState(pending.client_id, { state: "failed" });
  };

  const queue = (body: string, file?: Blob) => {
    const pending: Live = {
      id: Number.MAX_SAFE_INTEGER - Date.now(),
      kind: file ? "image" : "text",
      body,
      image: null,
      card: null,
      sender: { user_id: meId, username: me?.username ?? null, first_name: me?.firstName ?? "", last_name: "", profile_photo: me?.photo ?? null },
      reply_to: null,
      client_id: newClientId(),
      is_removed: false,
      created_at: new Date().toISOString(),
      state: "sending",
      localImage: file ? URL.createObjectURL(file) : undefined,
    };
    pending.retry = () => void deliver(pending, file);
    setMsgs((cur) => [...cur, pending]);
    void deliver(pending, file);
  };

  const onPhoto = async (file: File) => {
    if (!PHOTO_TYPES.test(file.type)) return setNotice("Choose a JPG, PNG or WebP photo.");
    queue("", await shrinkImage(file, 1600).catch(() => file));
  };

  const onDraft = (value: string) => {
    if (cid && value && Date.now() - lastTyping.current > 2500) { lastTyping.current = Date.now(); live.typing(cid); }
  };

  // ── What the screen shows ────────────────────────────────────────

  const shown = useMemo(() => msgs.map(toShown), [msgs]);
  const last = msgs[msgs.length - 1];
  const failed = msgs.filter((m) => m.state === "failed");
  const others = members.filter((m) => m.user.user_id !== meId);
  const seen = !!last && !last.state && last.sender?.user_id === meId && others.length > 0 && others.every((m) => (reads[m.user.user_id] ?? 0) >= last.id);
  let status: React.ReactNode = null;
  if (notice) status = <p className="ch-sent" role="alert"><span>{notice}</span>{failed.length ? <> <button type="button" className="ch-tlink" onClick={() => failed.forEach((m) => m.retry?.())}>Try again</button></> : null}</p>;
  else if (failed.length) status = <p className="ch-sent" role="alert"><span>Not sent.</span> <button type="button" className="ch-tlink" onClick={() => failed.forEach((m) => m.retry?.())}>Try again</button></p>;
  else if (last?.state === "sending") status = <p className="ch-sent"><span>Sending…</span></p>;
  else if (last && last.sender?.user_id === meId && last.kind !== "system") status = <p className="ch-sent"><Check size={14} strokeWidth={1.5} aria-hidden /><span>{seen ? "Seen" : "Sent"}</span></p>;

  const kind = convo ? kindOf(convo) : "direct";
  const name = convo ? convoName(convo) : personOf(personId as PersonId).name;
  const people = (convo?.kind === "direct" ? (convo.peer ? [convo.peer.user_id] : []) : convo ? others.map((m) => m.user.user_id) : personId ? [personId] : []) as PersonId[];
  const plan: Plan | undefined = (kind === "direct" || kind === "project") && people.length ? {
    eyebrow: "Create Call",
    title: kind === "direct" ? `Arrange a Create Call with ${name.split(" ")[0]}` : `Arrange a Create Call for ${name}`,
    lead: kind === "direct" ? "Make something together, or pick up where you left off." : `Pick a time to work on ${name} together.`,
    people: people.slice(0, 3),
    convo: cid,
    note: "Shall we find time to work on this together?",
    placeholder: "Add what you would like to work on (optional)",
  } : undefined;

  return (
    <ThreadPane
      name={name}
      sub={convo ? convoSub(convo) : ""}
      face={convo ? (convo.kind === "direct" ? convo.peer?.profile_photo : null) : personOf(personId as PersonId).photo}
      group={kind !== "direct"}
      msgs={shown}
      me={meId}
      status={status}
      onSend={(t) => queue(t)}
      plan={plan}
      closed={convo?.is_closed}
      onTop={hasMore ? () => void loadOlder() : undefined}
      onPhoto={(f) => void onPhoto(f)}
      onDraft={onDraft}
    />
  );
}
