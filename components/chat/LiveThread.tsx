"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Avatar from "@/components/ui/Avatar";
import { useMe } from "@/components/shell/MemberContext";
import { chat, newClientId, type ChatMessage, type ConversationMember } from "@/lib/api/chat";
import type { PostAuthor } from "@/lib/api/community";
import { shrinkImage } from "@/lib/imageShrink";
import { live } from "@/lib/live";
import { Ico } from "./bits";
import Icon from "@/components/ui/Icon";

/** A message on screen: saved ones, plus ones still sending (or that failed) from this device. */
type Shown = ChatMessage & { state?: "sending" | "failed"; localImage?: string; retry?: () => void };

const nameOf = (a: PostAuthor) => [a.first_name, a.last_name].filter(Boolean).join(" ") || (a.username ? `@${a.username}` : "Member");
const firstOf = (a: PostAuthor) => a.first_name || (a.username ? `@${a.username}` : "Member");
const clock = (iso: string) => new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
function dayLabel(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: d.getFullYear() === today.getFullYear() ? undefined : "numeric" });
}

/**
 * A real group chat: loads the latest messages, older ones as you scroll up, and new ones live.
 * Sending shows the message straight away and confirms it when the server has it; a failed send can be retried
 * without posting twice. Reading marks the chat read for your other devices and shows "Seen by" to others.
 */
export default function LiveThread({
  conversationId,
  members,
  hostIds = [],
  closed,
  placeholder = "Write a message…",
  onMembersChanged,
}: {
  conversationId: string;
  members: ConversationMember[];
  hostIds?: string[];
  closed?: boolean;
  placeholder?: string;
  /** Someone joined or left (a system line arrived): the parent may want to refresh its member list. */
  onMembersChanged?: () => void;
}) {
  const { me } = useMe();
  const [msgs, setMsgs] = useState<Shown[] | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [replyTo, setReplyTo] = useState<Shown | null>(null);
  const [typing, setTyping] = useState<Record<string, { name: string; until: number }>>({});
  const [reads, setReads] = useState<Record<string, number>>({});
  const [connection, setConnection] = useState(live.status);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  /** On phones (no hover), tapping a message shows its actions. */
  const [picked, setPicked] = useState<string | null>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLTextAreaElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const stickToBottom = useRef(true);
  const keepOffset = useRef<number | null>(null);
  const lastTypingSent = useRef(0);
  const lastReadSent = useRef(0);
  const msgsRef = useRef<Shown[] | null>(null);
  useEffect(() => {
    msgsRef.current = msgs;
  }, [msgs]);

  // Read positions of the others, for "Seen by".
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- seed from the member list the parent loaded
    setReads(Object.fromEntries(members.map((m) => [m.user.user_id, m.last_read_message_id])));
  }, [members]);

  const lastSavedId = () => {
    const list = msgsRef.current ?? [];
    for (let i = list.length - 1; i >= 0; i--) if (!list[i].state) return list[i].id;
    return 0;
  };

  const merge = useCallback((incoming: ChatMessage[]) => {
    setMsgs((cur) => {
      const list = [...(cur ?? [])];
      for (const m of incoming) {
        const at = list.findIndex((x) => x.id === m.id || (!!m.client_id && x.client_id === m.client_id));
        if (at >= 0) list[at] = { ...m, localImage: list[at].localImage };
        else list.push(m);
      }
      return list.sort((a, b) => (a.state ? 1 : 0) - (b.state ? 1 : 0) || a.id - b.id);
    });
  }, []);

  // First page.
  useEffect(() => {
    let gone = false;
    (async () => {
      const r = await chat.messages(conversationId);
      if (gone) return;
      if (!r.ok) return setError(r.message);
      stickToBottom.current = true;
      setMsgs(r.data.results);
      setHasMore(r.data.has_more);
    })();
    return () => {
      gone = true;
    };
  }, [conversationId]);

  // Live: new messages, removals, read receipts and typing. After a reconnect, fetch what was missed.
  useEffect(() => {
    const done = live.use();
    const offEvents = live.on((e) => {
      if (!("conversation_id" in e) || e.conversation_id !== conversationId) return;
      if (e.type === "message.new") {
        const el = scroller.current;
        stickToBottom.current = !el || el.scrollHeight - el.scrollTop - el.clientHeight < 120 || e.message.sender?.user_id === me?.id;
        merge([e.message]);
        const sender = e.message.sender?.user_id;
        if (sender) setTyping((cur) => Object.fromEntries(Object.entries(cur).filter(([who]) => who !== sender)));
        if (e.message.kind === "system") onMembersChanged?.();
      } else if (e.type === "message.removed") {
        setMsgs((cur) => cur?.map((m) => (m.id === e.message_id ? { ...m, is_removed: true, body: "", image: null } : m)) ?? cur);
      } else if (e.type === "message.read") {
        setReads((cur) => ({ ...cur, [e.user_id]: Math.max(cur[e.user_id] ?? 0, e.message_id) }));
      } else if (e.type === "typing" && e.user.user_id !== me?.id) {
        setTyping((cur) => ({ ...cur, [e.user.user_id]: { name: e.user.first_name || "Someone", until: Date.now() + 5000 } }));
      } else if (e.type === "conversation.closed" || e.type === "conversation.left") {
        onMembersChanged?.();
      }
    });
    const offStatus = live.onStatus(async (s, reconnected) => {
      setConnection(s);
      if (s !== "open" || !reconnected) return;
      const after = lastSavedId();
      if (!after) return;
      const r = await chat.messages(conversationId, { after, limit: 100 });
      if (r.ok) merge(r.data.results);
    });
    return () => {
      offEvents();
      offStatus();
      done();
    };
  }, [conversationId, me?.id, merge, onMembersChanged]);

  // Typing lines fade after a few seconds without news.
  useEffect(() => {
    if (!Object.keys(typing).length) return;
    const t = setInterval(() => setTyping((cur) => Object.fromEntries(Object.entries(cur).filter(([, v]) => v.until > Date.now()))), 1000);
    return () => clearInterval(t);
  }, [typing]);

  // Scroll: stay at the bottom for new messages; keep your place when older ones load above.
  useLayoutEffect(() => {
    const el = scroller.current;
    if (!el) return;
    if (keepOffset.current !== null) {
      el.scrollTop = el.scrollHeight - keepOffset.current;
      keepOffset.current = null;
    } else if (stickToBottom.current) {
      el.scrollTop = el.scrollHeight;
    }
  }, [msgs, typing]);

  // Mark read when the newest message is on screen and the tab is in front.
  useEffect(() => {
    const newest = lastSavedId();
    if (!newest || newest <= lastReadSent.current || !stickToBottom.current) return;
    const mark = () => {
      if (document.visibilityState !== "visible") return;
      lastReadSent.current = newest;
      void chat.read(conversationId, newest);
    };
    const t = setTimeout(mark, 400);
    document.addEventListener("visibilitychange", mark);
    return () => {
      clearTimeout(t);
      document.removeEventListener("visibilitychange", mark);
    };
  }, [msgs, conversationId]);

  const loadOlder = async () => {
    const oldest = msgs?.find((m) => !m.state)?.id;
    if (!oldest || loadingOlder) return;
    setLoadingOlder(true);
    const r = await chat.messages(conversationId, { before: oldest });
    setLoadingOlder(false);
    if (!r.ok) return setNotice(r.message);
    const el = scroller.current;
    keepOffset.current = el ? el.scrollHeight - el.scrollTop : null;
    stickToBottom.current = false;
    setHasMore(r.data.has_more);
    merge(r.data.results);
  };

  const onScroll = () => {
    const el = scroller.current;
    if (!el) return;
    stickToBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
    if (el.scrollTop < 80 && hasMore && !loadingOlder) void loadOlder();
  };

  // ── Sending ──────────────────────────────────────────────────────

  const deliver = useCallback(async (pending: Shown, imageFile?: Blob) => {
    setMsgs((cur) => cur?.map((m) => (m.client_id === pending.client_id ? { ...m, state: "sending" } : m)) ?? cur);
    let imageId = pending.image?.id;
    if (imageFile && !imageId) {
      const up = await chat.uploadImage(conversationId, imageFile);
      if (!up.ok) {
        setNotice(up.message);
        setMsgs((cur) => cur?.map((m) => (m.client_id === pending.client_id ? { ...m, state: "failed" } : m)) ?? cur);
        return;
      }
      imageId = up.data.id;
      setMsgs((cur) => cur?.map((m) => (m.client_id === pending.client_id ? { ...m, image: up.data } : m)) ?? cur);
    }
    const r = await chat.send(conversationId, { body: pending.body || undefined, image_id: imageId, reply_to: pending.reply_to?.id, client_id: pending.client_id });
    if (r.ok) {
      merge([r.data]);
      return;
    }
    if (r.status && r.status < 500 && r.status !== 429) setNotice(r.message);
    setMsgs((cur) => cur?.map((m) => (m.client_id === pending.client_id ? { ...m, state: "failed" } : m)) ?? cur);
  }, [conversationId, merge]);

  const queue = (body: string, imageFile?: Blob) => {
    if (!me) return;
    const pending: Shown = {
      id: Number.MAX_SAFE_INTEGER - Date.now(),
      kind: imageFile ? "image" : "text",
      body,
      image: null,
      sender: { user_id: me.id, username: me.username, first_name: me.firstName, last_name: "", profile_photo: me.photo },
      reply_to: replyTo ? { id: replyTo.id, kind: replyTo.kind, is_removed: replyTo.is_removed, body: replyTo.body.slice(0, 160), sender_name: replyTo.sender ? firstOf(replyTo.sender) : "" } : null,
      client_id: newClientId(),
      is_removed: false,
      created_at: new Date().toISOString(),
      state: "sending",
      localImage: imageFile ? URL.createObjectURL(imageFile) : undefined,
    };
    pending.retry = () => void deliver(pending, imageFile);
    stickToBottom.current = true;
    setMsgs((cur) => [...(cur ?? []), pending]);
    setReplyTo(null);
    void deliver(pending, imageFile);
  };

  const sendText = () => {
    const text = draft.trim();
    if (!text) return;
    if (text.length > 2000) return setNotice("Keep messages under 2,000 characters.");
    setDraft("");
    queue(text);
    input.current?.focus();
  };

  const pickPhoto = async (file: File | undefined) => {
    if (!file) return;
    if (!/^image\/(jpeg|png|webp|heic|heif)$/.test(file.type)) return setNotice("Choose a JPG, PNG or WebP photo.");
    const small = await shrinkImage(file, 1600).catch(() => file);
    const caption = draft.trim();
    setDraft("");
    queue(caption, small);
  };

  const remove = async (m: Shown) => {
    if (m.state) return setMsgs((cur) => cur?.filter((x) => x.client_id !== m.client_id) ?? cur);
    if (!window.confirm("Remove this message for everyone?")) return;
    const r = await chat.remove(conversationId, m.id);
    if (!r.ok) return setNotice(r.message);
    setMsgs((cur) => cur?.map((x) => (x.id === m.id ? { ...x, is_removed: true, body: "", image: null } : x)) ?? cur);
  };

  const onType = (value: string) => {
    setDraft(value);
    if (value && Date.now() - lastTypingSent.current > 2500) {
      lastTypingSent.current = Date.now();
      live.typing(conversationId);
    }
  };

  // ── Rendering ────────────────────────────────────────────────────

  const amHost = !!me && hostIds.includes(me.id);
  const lastMine = useMemo(() => [...(msgs ?? [])].reverse().find((m) => !m.state && m.sender?.user_id === me?.id && !m.is_removed), [msgs, me?.id]);
  const seenBy = lastMine ? members.filter((x) => x.user.user_id !== me?.id && (reads[x.user.user_id] ?? 0) >= lastMine.id) : [];
  const typers = Object.values(typing).map((t) => t.name);

  if (error) return <div className="rs-msgs lt-state"><p>{error}</p></div>;

  let lastDay = "";
  return (
    <>
      {connection !== "open" && msgs && <p className="lt-conn" role="status">{connection === "connecting" ? "Connecting…" : "Offline. Messages will send when you're back."}</p>}
      <div className="rs-msgs" ref={scroller} onScroll={onScroll} aria-live="polite">
        {msgs === null && <p className="lt-state" aria-busy="true">Loading messages…</p>}
        {hasMore && <button className="lt-older" onClick={loadOlder} disabled={loadingOlder}>{loadingOlder ? "Loading…" : "Show earlier messages"}</button>}
        {msgs?.length === 0 && <p className="lt-state">No messages yet. Say hello.</p>}
        {msgs?.map((m, i) => {
          const day = dayLabel(m.created_at);
          const showDay = day !== lastDay;
          lastDay = day;
          const dayLine = showDay ? <div className="day" key={`d-${m.client_id || m.id}`}><span>{day}</span></div> : null;
          if (m.kind === "system") return [dayLine, <div className="sys" key={m.id}><span>{m.body}</span></div>];

          const mine = m.sender?.user_id === me?.id;
          const prev = msgs[i - 1];
          const firstInRun = showDay || !prev || prev.kind === "system" || prev.sender?.user_id !== m.sender?.user_id;
          const canRemove = !m.is_removed && (mine || amHost);
          const img = m.localImage || m.image?.url;
          const key = m.client_id || String(m.id);
          const canReply = !m.is_removed && !m.state && !closed;
          const startReply = () => { setReplyTo(m); setPicked(null); input.current?.focus(); };
          return [dayLine, (
            <div className={`row${mine ? " mine" : ""}${firstInRun ? "" : " lt-cont"}${m.state ? ` lt-${m.state}` : ""}`} key={m.client_id || m.id}>
              {!mine && (firstInRun && m.sender ? <Avatar person={{ name: nameOf(m.sender), photo: m.sender.profile_photo }} size={32} /> : <span className="lt-gap" aria-hidden />)}
              <div className="bubble" onClick={(e) => { if (!(e.target as HTMLElement).closest("button") && (canReply || canRemove)) setPicked((cur) => (cur === key ? null : key)); }}>
                {!mine && firstInRun && m.sender && <b className="name">{nameOf(m.sender)}{hostIds.includes(m.sender.user_id) && <em>Host</em>}</b>}
                {m.reply_to && <div className="quote"><b>{m.reply_to.sender_name || "Message"}</b>{m.reply_to.is_removed ? "Removed message" : m.reply_to.body || (m.reply_to.kind === "image" ? "Photo" : "")}</div>}
                {m.is_removed ? (
                  <p className="lt-removed">This message was removed</p>
                ) : (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element -- member photo, resized on the server */}
                    {img && <button className="img lt-img" onClick={() => setLightbox(img)} aria-label="Open photo"><img src={img} alt="" /></button>}
                    {m.body && <p>{m.body}</p>}
                  </>
                )}
                <span className="meta">
                  {m.state === "sending" ? "Sending…" : m.state === "failed" ? <button className="lt-retry" onClick={m.retry}>Not sent · Retry</button> : clock(m.created_at)}
                </span>
                {canReply && <button className="reply" onClick={startReply} aria-label="Reply"><Icon name="reply" size={14} /></button>}
                {(canRemove || m.state === "failed") && <button className="lt-del" onClick={() => remove(m)} aria-label={m.state ? "Discard" : "Remove message"}><Ico n="trash" size={13} /></button>}
                {picked === key && (canReply || canRemove) && (
                  <span className="lt-acts">
                    {canReply && <button onClick={startReply}>Reply</button>}
                    {canRemove && <button onClick={() => { setPicked(null); void remove(m); }}>Remove</button>}
                  </span>
                )}
              </div>
            </div>
          )];
        })}
        {lastMine && seenBy.length > 0 && <p className="lt-seen">Seen by {seenBy.length === members.length - 1 ? "everyone" : seenBy.map((x) => firstOf(x.user)).join(", ")}</p>}
        {typers.length > 0 && <p className="lt-typing" aria-live="polite"><span className="bubble typing"><i /><i /><i /></span>{typers.join(", ")} {typers.length === 1 ? "is" : "are"} typing…</p>}
      </div>

      {closed ? (
        <footer className="rs-comp ro"><p>This circle has closed. You can still read the chat.</p></footer>
      ) : (
        <footer className="rs-comp">
          {notice && <p className="lt-notice" role="alert">{notice} <button onClick={() => setNotice(null)} aria-label="Dismiss">×</button></p>}
          {replyTo && (
            <div className="replying">
              <div><b>Replying to {replyTo.sender?.user_id === me?.id ? "yourself" : replyTo.sender ? firstOf(replyTo.sender) : "message"}</b>{replyTo.body || (replyTo.kind === "image" ? "Photo" : "")}</div>
              <button onClick={() => setReplyTo(null)} aria-label="Cancel reply">×</button>
            </div>
          )}
          <div className="bar">
            <button className="ic" onClick={() => fileInput.current?.click()} aria-label="Send a photo"><Ico n="image" /></button>
            <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif" hidden onChange={(e) => { void pickPhoto(e.target.files?.[0]); e.target.value = ""; }} />
            <textarea
              ref={input}
              rows={1}
              value={draft}
              maxLength={2100}
              placeholder={placeholder}
              aria-label="Message"
              onChange={(e) => onType(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                  e.preventDefault();
                  sendText();
                }
              }}
            />
            <button className="send" onClick={sendText} disabled={!draft.trim()} aria-label="Send"><Ico n="send" /></button>
          </div>
        </footer>
      )}

      {lightbox && (
        <div className="rs-modal dark" onClick={() => setLightbox(null)} role="dialog" aria-modal="true" aria-label="Photo">
          <button className="x" onClick={() => setLightbox(null)} aria-label="Close">×</button>
          {/* eslint-disable-next-line @next/next/no-img-element -- member photo */}
          <img src={lightbox} alt="" className="lt-big" />
        </div>
      )}
    </>
  );
}
