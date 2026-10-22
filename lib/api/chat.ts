import { api, upload } from "./client";
import type { PostAuthor } from "./community";

/** One chat message as the backend returns it (chat.v1.serializers.MessageSerializer). */
export type ChatMessage = {
  id: number;
  kind: "text" | "image" | "system";
  body: string;
  image: { id: number; url: string } | null;
  sender: PostAuthor | null;
  reply_to: { id: number; kind: string; is_removed: boolean; body: string; sender_name: string } | null;
  client_id: string;
  is_removed: boolean;
  created_at: string;
};

export type ConversationMember = { user: PostAuthor; role: "admin" | "member"; last_read_message_id: number };
export type Conversation = {
  id: string;
  kind: "circle" | "direct" | "group";
  title: string;
  is_closed: boolean;
  member_count: number;
  last_message: ChatMessage | null;
  last_message_at: string | null;
  unread_count: number;
  my_role: "admin" | "member" | null;
  about: { type: "circle"; circle_id: string; community_id: string; community_name: string } | null;
  members?: ConversationMember[];
};

export type MessagePage = { results: ChatMessage[]; has_more: boolean };

/** What the live connection pushes (chat/consumers.py and chat/conversations.py). */
export type LiveEvent =
  | { type: "ready" | "pong" | "session.ended" }
  | { type: "message.new"; conversation_id: string; message: ChatMessage }
  | { type: "message.removed"; conversation_id: string; message_id: number }
  | { type: "message.read"; conversation_id: string; user_id: string; message_id: number }
  | { type: "conversation.read"; conversation_id: string; unread_count: number }
  | { type: "conversation.left" | "conversation.closed"; conversation_id: string }
  | { type: "typing"; conversation_id: string; user: { user_id: string; first_name: string } };

const id = encodeURIComponent;

export const chat = {
  conversations: (page = 1) => api.get<Conversation[]>(`chat/conversations?page=${page}&page_size=30`),
  conversation: (conversationId: string) => api.get<Conversation>(`chat/conversations/${id(conversationId)}`),
  messages: (conversationId: string, opts: { before?: number; after?: number; limit?: number } = {}) => {
    const q = new URLSearchParams();
    if (opts.before) q.set("before", String(opts.before));
    if (opts.after) q.set("after", String(opts.after));
    if (opts.limit) q.set("limit", String(opts.limit));
    return api.get<MessagePage>(`chat/conversations/${id(conversationId)}/messages${q.size ? `?${q}` : ""}`);
  },
  send: (conversationId: string, input: { body?: string; image_id?: number; reply_to?: number; client_id: string }) =>
    api.post<ChatMessage>(`chat/conversations/${id(conversationId)}/messages`, input),
  remove: (conversationId: string, messageId: number) => api.del(`chat/conversations/${id(conversationId)}/messages/${messageId}`),
  read: (conversationId: string, messageId: number) =>
    api.post<{ last_read_message_id: number; unread_count: number }>(`chat/conversations/${id(conversationId)}/read`, { message_id: messageId }),
  uploadImage: (conversationId: string, photo: Blob) => {
    const form = new FormData();
    form.append("photo", photo, "photo.jpg");
    return upload<{ id: number; url: string }>(`chat/conversations/${id(conversationId)}/images`, form);
  },
  unread: () => api.get<{ unread: number }>("chat/unread-count"),
  liveTicket: () => api.post<{ ticket: string; expires_in: number }>("chat/live-ticket"),
};

/** A random id per message, so a resend after a dropped connection doesn't post it twice. */
export function newClientId() {
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);
  return `m-${Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("")}`;
}
