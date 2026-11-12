import { api } from "./client";
import type { ImageSource } from "@/lib/images";

export type Notice = {
  id: number;
  kind: "community_invite" | "invite_accepted" | "join_request" | "request_approved" | "made_leader" | "announcement" | "post_comment" | "circle_invite" | "circle_joined"
    | "collab_application" | "collab_update" | "collab_proposal" | "community_report";
  text: string;
  link: string;
  target_type: string;
  target_id: string;
  actor: { user_id: string; username: string | null; first_name: string; last_name: string; profile_photo: string | null; profile_photo_image?: ImageSource | null } | null;
  is_read: boolean;
  created_at: string;
};

export const notifications = {
  list: (page = 1) => api.get<Notice[]>(`notifications/?page=${page}&page_size=20`),
  unread: () => api.get<{ unread: number }>("notifications/unread-count"),
  markRead: (ids?: number[]) => api.post("notifications/read", ids ? { ids } : {}),
};
