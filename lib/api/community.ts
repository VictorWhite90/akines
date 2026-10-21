import { api, upload } from "./client";
import type { PublicMember } from "./account";

/** A community as the backend returns it (community.v1.serializers.CommunitySerializer). */
export type Community = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  about: string;
  category: string;
  category_label: string;
  area: string;
  city: string;
  cover_photo: string | null;
  instagram: string;
  whatsapp: string;
  guidelines: string[];
  visibility: "public" | "private";
  is_verified: boolean;
  member_count: number;
  leaders: PublicMember[];
  my_role: "leader" | "member" | null;
  /** "pending" while your request to join this private community waits for a leader. */
  my_request: "pending" | null;
  /** Id of a pending in-app invite to this community for you. */
  my_invitation: number | null;
  invite_code: string | null;
  created_at: string;
};

export type InvitePreview = Pick<Community, "id" | "slug" | "name" | "tagline" | "category_label" | "area" | "city" | "cover_photo" | "is_verified" | "member_count" | "visibility">;
export type InviteCandidate = PublicMember & { invited: boolean };
export type JoinRequest = { id: number; user: PublicMember; message: string; requested_at: string };
export type CommunityMember = { user: PublicMember; role: "leader" | "member"; joined_at: string };
export type Page<T> = T[];

export type CommunityInput = {
  name: string;
  tagline?: string;
  about?: string;
  category: string;
  area: string;
  instagram?: string;
  whatsapp?: string;
  guidelines?: string[];
  visibility?: "public" | "private";
};

// Same lists as the backend (community/models.py).
export const CATEGORIES: { value: string; label: string }[] = [
  { value: "social_hangouts", label: "Social hangouts" },
  { value: "food_conversation", label: "Food & conversation" },
  { value: "books_writing", label: "Books & writing" },
  { value: "faith_fellowship", label: "Faith & fellowship" },
  { value: "wellness", label: "Wellness" },
  { value: "creatives", label: "Creatives" },
  { value: "careers_business", label: "Careers & business" },
  { value: "sports_fitness", label: "Sports & fitness" },
  { value: "games", label: "Games" },
  { value: "volunteering", label: "Volunteering" },
];
export const AREAS = ["Wuse", "Wuse 2", "Maitama", "Asokoro", "Garki", "Jabi", "Utako", "Gwarinpa", "Kubwa", "Lugbe", "Life Camp", "Katampe", "Central Area"];

const id = (x: string) => encodeURIComponent(x);

export const communities = {
  list: (params: { search?: string; category?: string; area?: string; page?: number; pageSize?: number } = {}) => {
    const q = new URLSearchParams();
    if (params.search) q.set("search", params.search);
    if (params.category) q.set("category", params.category);
    if (params.area) q.set("area", params.area);
    q.set("page", String(params.page ?? 1));
    q.set("page_size", String(params.pageSize ?? 12));
    return api.get<Community[]>(`communities/?${q}`);
  },
  mine: () => api.get<Community[]>("communities/mine"),
  get: (communityId: string) => api.get<Community>(`communities/${id(communityId)}`),
  create: (input: CommunityInput) => api.post<Community>("communities/", input),
  update: (communityId: string, input: Partial<CommunityInput>) => api.put<Community>(`communities/${id(communityId)}`, input),
  join: (communityId: string, code?: string, message?: string) => api.post<Community>(`communities/${id(communityId)}/join`, { code: code ?? "", message: message ?? "" }),
  cancelRequest: (communityId: string) => api.del<Community>(`communities/${id(communityId)}/join`),
  requests: (communityId: string) => api.get<JoinRequest[]>(`communities/${id(communityId)}/requests?page_size=50`),
  decide: (communityId: string, requestId: number, decision: "approve" | "decline") => api.post(`communities/${id(communityId)}/requests/${requestId}`, { decision }),
  leave: (communityId: string) => api.post<Community | string>(`communities/${id(communityId)}/leave`),
  invite: (code: string) => api.get<InvitePreview>(`communities/invites/${id(code)}`),
  joinByCode: (code: string) => api.post<Community>(`communities/invites/${id(code)}`),
  rotateInvite: (communityId: string) => api.post<{ invite_code: string }>(`communities/${id(communityId)}/invite-code`),
  members: (communityId: string, page = 1) => api.get<CommunityMember[]>(`communities/${id(communityId)}/members?page=${page}&page_size=50`),
  setRole: (communityId: string, userId: string, role: "leader" | "member") => api.put(`communities/${id(communityId)}/members/${id(userId)}`, { role }),
  removeMember: (communityId: string, userId: string) => api.del(`communities/${id(communityId)}/members/${id(userId)}`),
  inviteSuggestions: (communityId: string, search = "") => api.get<InviteCandidate[]>(`communities/${id(communityId)}/invite-suggestions${search ? `?search=${encodeURIComponent(search)}` : ""}`),
  sendInvites: (communityId: string, userIds: string[]) =>
    api.post<{ invited: number; results: { user_id: string; status: "invited" | "already_member" | "already_invited" | "not_allowed" }[] }>(`communities/${id(communityId)}/invitations`, { user_ids: userIds }),
  respondInvite: (inviteId: number, decision: "accept" | "decline") => api.post<Community | string>(`communities/invitations/${inviteId}`, { decision }),
  uploadCover: (communityId: string, photo: Blob) => {
    const form = new FormData();
    form.append("photo", photo, "cover.jpg");
    return upload<Community>(`communities/${id(communityId)}/cover`, form);
  },
  removeCover: (communityId: string) => api.del<Community>(`communities/${id(communityId)}/cover`),
};
