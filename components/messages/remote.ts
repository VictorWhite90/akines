import type { ChatCard, ChatMessage, Conversation } from "@/lib/api/chat";
import type { PostAuthor } from "@/lib/api/community";
import type { PhotoKey } from "@/lib/data/images";
import { KIND_LABEL, type ConvoKind, type KMsg } from "@/lib/data/kinmessage";
import { PEOPLE, person, registerPerson, type PersonId } from "@/lib/data/people";
import type { Shown } from "./parts";

/*
 * Turning the chat API's shapes (lib/api/chat.ts) into what the Messages screens draw (./parts.tsx).
 * - Kinds: a one-to-one chat is "direct", a small circle's chat is "circle", and a group chat is a project
 *   team's (collab workspaces are the only group chats the backend makes).
 * - Invitations travel as a message `card` (kind "card"); everything else is text, a photo or an Akines line.
 */

/** A message on screen: saved ones, plus ones still sending (or that failed) from this device. */
export type Live = ChatMessage & { state?: "sending" | "failed"; localImage?: string; retry?: () => void };

export const kindOf = (c: Conversation): ConvoKind => (c.kind === "direct" ? "direct" : c.kind === "circle" ? "circle" : "project");

export const fullName = (a: PostAuthor) => [a.first_name, a.last_name].filter(Boolean).join(" ") || (a.username ? `@${a.username}` : "A member");

/** Puts a member in the people registry, so the screens (and the Create Call invitation) show their name. */
export function remember(a: PostAuthor | null | undefined) {
  if (!a) return;
  const cur = person(a.user_id as PersonId);
  registerPerson({ ...cur, id: a.user_id, name: fullName(a), photo: a.profile_photo ?? cur.photo ?? null });
}

export const convoName = (c: Conversation) =>
  c.kind === "direct" ? (c.peer ? fullName(c.peer) : "Former member") : c.title || KIND_LABEL[kindOf(c)];

export function convoSub(c: Conversation) {
  if (c.kind === "direct") {
    if (!c.peer) return c.is_closed ? "Closed" : "";
    const p = PEOPLE[c.peer.user_id as PersonId];
    return [p?.role, p?.city].filter(Boolean).join(" · ") || (c.peer.username ? `@${c.peer.username}` : "");
  }
  return `${KIND_LABEL[kindOf(c)]} · ${c.member_count} members${c.is_closed ? " · Closed" : ""}`;
}

const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();
const clock = (d: Date) => d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

/** The list's time: today's clock time, a weekday this week, or a date. */
export function when(iso: string | null | undefined) {
  if (!iso) return "";
  const d = new Date(iso), now = new Date();
  if (sameDay(d, now)) return clock(d);
  if (now.getTime() - d.getTime() < 6 * 86_400_000) return d.toLocaleDateString("en-GB", { weekday: "short" });
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: d.getFullYear() === now.getFullYear() ? undefined : "numeric" });
}

/** A message's time as the screens group it: a clock time for today (grouped under "Today"), else the day. */
function stamp(iso: string) {
  const d = new Date(iso), now = new Date(), yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);
  if (sameDay(d, now)) return clock(d);
  if (sameDay(d, yesterday)) return "Yesterday";
  return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: d.getFullYear() === now.getFullYear() ? undefined : "numeric" });
}

export function preview(m: ChatMessage | null | undefined) {
  if (!m) return "";
  if (m.is_removed) return "Message removed";
  if (m.kind === "card" && m.card) return m.card.title;
  if (m.kind === "image") return m.body || "Photo";
  return m.body;
}

export function toShown(m: Live): Shown {
  const id = m.client_id || `s${m.id}`;
  const from = (m.sender?.user_id ?? "akines") as PersonId;
  const at = stamp(m.created_at);
  if (m.kind === "system") return { id, from, at, kind: "system", text: m.body };
  if (m.is_removed) return { id, from, at, kind: "removed", text: "" };
  if (m.kind === "card" && m.card) return { id, from, at, kind: "invite", invite: m.card.invite, title: m.card.title, detail: m.card.detail, href: m.card.href || undefined };
  const img = m.localImage || m.image?.url;
  if (img) return { id, from, at, kind: "photo", photo: img as PhotoKey, text: m.body || undefined };
  return { id, from, at, kind: "text", text: m.body };
}

/** Same rule as the backend (chat.v1.serializers.CARD_HREF_PATTERN): a page of this app, never another site. */
const HREF = /^\/(?![/\\])[A-Za-z0-9\-._~/?=&%#+]*$/;

/** An invitation from the screens as the card the API takes (cut to the backend's lengths). */
export function cardFrom(m: Extract<KMsg, { kind: "invite" }>): ChatCard {
  const href = m.href && m.href.length <= 200 && HREF.test(m.href) ? m.href : "";
  return { type: "invite", invite: m.invite, title: m.title.trim().slice(0, 120) || "Invitation", detail: (m.detail ?? "").trim().slice(0, 300), href };
}
