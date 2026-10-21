import { api, upload } from "./client";

/** The signed-in member's own profile (backend: GET/PUT /api/v1/profile/). */
export type MyProfile = {
  user_id: string;
  first_name: string;
  last_name: string;
  username: string | null;
  email: string;
  phone_number: string;
  bio: string;
  date_of_birth: string | null;
  interests: string[];
  message_permission: "everyone" | "circles" | "nobody";
  show_in_search: boolean;
  is_2fa_set: boolean;
  profile_photo: string | null;
  cover_photo: string | null;
  location: string;
  website: string;
  created_at: string;
};

export type Interest = { slug: string; name: string };

export type Device = { device_id: string; device: string; ip_address: string | null; created_at: string; last_seen_at: string; is_current: boolean };

export type PublicMember = { user_id: string; username: string | null; first_name: string; last_name: string; profile_photo: string | null };

/** Another member's public profile (backend: GET /api/v1/profile/members/<username>). */
export type MemberProfile = PublicMember & {
  bio: string;
  cover_photo: string | null;
  location: string;
  website: string;
  interests: Interest[];
  joined_at: string;
  community_count: number | null;
};

export const account = {
  profile: () => api.get<MyProfile>("profile/"),
  updateProfile: (changes: Partial<MyProfile>) => api.put<MyProfile>("profile/", changes),
  interests: () => api.get<Interest[]>("profile/interests"),
  usernameAvailable: (username: string) =>
    api.get<{ username: string; available: boolean; reason: string | null }>(`profile/username-available?username=${encodeURIComponent(username)}`),

  devices: () => api.get<Device[]>("profile/devices"),
  signOutDevice: (deviceId: string) => api.del(`profile/devices/${encodeURIComponent(deviceId)}`),
  signOutOtherDevices: () => api.post<{ signed_out: number }>("profile/devices/sign-out-others"),

  blocks: () => api.get<PublicMember[]>("profile/blocks"),
  unblock: (username: string) => api.del(`profile/blocks/${encodeURIComponent(username)}`),

  changePassword: (old_password: string, new_password: string) => api.post("profile/settings/password", { old_password, new_password }),
  sendTwoStepCode: () => api.post("profile/settings/2fa", { status: true }),
  toggleTwoStep: (otp: string) => api.put<{ is_2fa_set: boolean }>("profile/settings/2fa", { otp }),

  uploadPhoto: (photo: Blob) => {
    const form = new FormData();
    form.append("photo", photo, "photo.jpg");
    return upload<{ profile_photo: string }>("profile/photo", form);
  },
  removePhoto: () => api.del("profile/photo"),
  uploadCover: (photo: Blob) => {
    const form = new FormData();
    form.append("photo", photo, "cover.jpg");
    return upload<{ cover_photo: string }>("profile/cover", form);
  },
  removeCover: () => api.del("profile/cover"),
  member: (username: string) => api.get<MemberProfile>(`profile/members/${encodeURIComponent(username)}`),
  block: (username: string) => api.post("profile/blocks", { username }),

  exportData: () => api.get<Record<string, unknown>>("profile/export"),
  deleteAccount: (password: string) => api.post("profile/delete-account", { password }),
};

export function fullName(m: { first_name?: string; last_name?: string; username?: string | null }) {
  return [m.first_name, m.last_name].filter(Boolean).join(" ") || (m.username ? `@${m.username}` : "Member");
}
