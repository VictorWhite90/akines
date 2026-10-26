/**
 * A pretend Akines backend that runs in the browser, for demo mode only (see lib/demo/mode.ts).
 * It answers the same paths with the same shapes as the Django API, so every screen works without a server.
 * State lives in localStorage; "Reset demo" (or clearing site data) starts again from the sample data.
 */
import type { ApiResult, Member } from "@/lib/api/client";
import type { ChatMessage, Conversation, LiveEvent } from "@/lib/api/chat";
import { CATEGORIES, CIRCLE_KINDS } from "@/lib/api/community";
import { demoBus } from "./bus";
import { DEMO_COOKIE } from "./mode";
import { ME_ID, seed, type DemoCircle, type DemoCommunity, type DemoMessage, type DemoPost, type DemoState, type DemoUser } from "./seed";

const KEY = "ak:demo:v1";
let state: DemoState | null = null;

function load(): DemoState {
  if (state) return state;
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) ?? "null");
    state = saved?.v === 1 ? saved : seed();
  } catch {
    state = seed();
  }
  return state!;
}
function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Storage full (photos are big): keep going in memory for this visit.
  }
}
/** Back to the sample data, signed out. */
export function resetDemo() {
  state = seed();
  document.cookie = `${DEMO_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
  save();
}

const nextId = () => ++load().seq;
const now = () => new Date().toISOString();
const ok = <T>(data: T, message: string | null = null): ApiResult<T> => ({ ok: true, data, message });
const fail = (status: number, message: string, field?: string): ApiResult<never> => ({ ok: false, status, message, field });
const pause = (ms = 180 + Math.random() * 220) => new Promise((r) => setTimeout(r, ms));
const page = <T>(list: T[], q: URLSearchParams, size = 20) => {
  const p = Math.max(1, Number(q.get("page") || 1));
  const n = Math.min(100, Math.max(1, Number(q.get("page_size") || size)));
  return list.slice((p - 1) * n, p * n);
};

// ── People ─────────────────────────────────────────────────────

const user = (id: string | null) => (id ? load().users[id] : undefined);
const pub = (id: string) => {
  const u = user(id)!;
  return { user_id: u.user_id, username: u.username, first_name: u.first_name, last_name: u.last_name, profile_photo: u.profile_photo };
};
const name = (id: string) => [user(id)?.first_name, user(id)?.last_name].filter(Boolean).join(" ") || "Someone";
const first = (id: string) => user(id)?.first_name || "Someone";
const me = () => load().session;
const memberShape = (u: DemoUser): Member => ({ id: u.user_id, email: u.email, first_name: u.first_name, last_name: u.last_name, profile_photo: u.profile_photo, roles: [], permissions: [] });
const profileShape = (u: DemoUser) => ({
  user_id: u.user_id, first_name: u.first_name, last_name: u.last_name, username: u.username, email: u.email, phone_number: u.phone_number,
  bio: u.bio, date_of_birth: u.date_of_birth, interests: u.interests, message_permission: u.message_permission, show_in_search: u.show_in_search,
  is_2fa_set: u.is_2fa_set, profile_photo: u.profile_photo, cover_photo: u.cover_photo, location: u.location, website: u.website, created_at: u.created_at,
});

function setSignedIn(on: boolean) {
  load().session = on ? ME_ID : null;
  document.cookie = on ? `${DEMO_COOKIE}=1; Path=/; Max-Age=864000; SameSite=Lax` : `${DEMO_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
  save();
}

function notify(recipient: string, kind: string, text: string, link: string, actor: string | null, target_type = "", target_id: string | number = "") {
  if (recipient === actor) return;
  load().notices.unshift({ id: nextId(), recipient, kind, text, link, target_type, target_id: String(target_id), actor, read: false, created_at: now() });
}
/** Lets sample-data features (collaboration) put a line in the demo member's 🔔 bell. */
export function demoNotice(kind: string, text: string, link: string) {
  if (!load().session) return;
  notify(ME_ID, kind, text, link, null);
  save();
}
function resolve(target_type: string, target_id: string | number) {
  for (const n of load().notices) if (n.target_type === target_type && n.target_id === String(target_id)) n.read = true;
}

// ── Communities ────────────────────────────────────────────────

const findCommunity = (id: string) => load().communities.find((c) => (c.id === id || c.slug === id) && !c.closed);
const membership = (community: string, u = me()) => load().memberships.find((m) => m.community === community && m.user === u);
const isLeader = (community: string, u = me()) => membership(community, u)?.role === "leader";
const memberCount = (community: string) => load().memberships.filter((m) => m.community === community).length;

function communityShape(c: DemoCommunity) {
  const s = load();
  const mine = membership(c.id);
  return {
    id: c.id, slug: c.slug, name: c.name, tagline: c.tagline, about: c.about, category: c.category,
    category_label: CATEGORIES.find((x) => x.value === c.category)?.label ?? c.category, area: c.area, city: c.city,
    cover_photo: c.cover_photo, instagram: c.instagram, whatsapp: mine ? c.whatsapp : "", guidelines: c.guidelines, visibility: c.visibility,
    is_verified: c.is_verified, member_count: memberCount(c.id),
    leaders: s.memberships.filter((m) => m.community === c.id && m.role === "leader").map((m) => pub(m.user)),
    my_role: mine?.role ?? null,
    my_request: s.requests.some((r) => r.community === c.id && r.user === me() && r.status === "pending") ? "pending" : null,
    my_invitation: s.invites.find((i) => i.community === c.id && i.invitee === me() && i.status === "pending")?.id ?? null,
    invite_code: mine ? c.invite_code : null, created_at: c.created_at,
  };
}

function join(c: DemoCommunity, u: string) {
  const s = load();
  if (membership(c.id, u)) return;
  s.memberships.push({ community: c.id, user: u, role: "member", joined_at: now() });
  for (const r of s.requests) if (r.community === c.id && r.user === u && r.status === "pending") r.status = "approved";
  for (const i of s.invites) if (i.community === c.id && i.invitee === u && i.status === "pending") i.status = "accepted";
}

function leaveCircles(community: string, u: string) {
  for (const cm of [...load().circleMembers]) {
    const circle = load().circles.find((x) => x.id === cm.circle);
    if (circle?.community === community && cm.user === u) leaveCircle(circle, u, "left");
  }
}

// ── Posts ──────────────────────────────────────────────────────

function postShape(p: DemoPost) {
  const s = load();
  return {
    id: p.id, kind: p.kind, body: p.body, images: p.images, author: pub(p.author), author_is_leader: isLeader(p.community, p.author),
    is_pinned: p.is_pinned, edited_at: p.edited_at, created_at: p.created_at,
    comment_count: s.comments.filter((c) => c.post === p.id && !c.removed).length, reaction_count: p.hearts.length,
    my_reaction: p.hearts.includes(me() ?? ""), can_edit: p.author === me(), can_remove: p.author === me() || isLeader(p.community),
  };
}

// ── Circles and chat ───────────────────────────────────────────

const circleMembers = (circle: string) => load().circleMembers.filter((m) => m.circle === circle);
function circleShape(c: DemoCircle) {
  const s = load();
  const members = circleMembers(c.id).sort((a, b) => (a.role === b.role ? a.joined_at.localeCompare(b.joined_at) : a.role === "host" ? -1 : 1));
  const mine = members.find((m) => m.user === me());
  const community = s.communities.find((x) => x.id === c.community)!;
  return {
    id: c.id, community_id: c.community, community_name: community.name, name: c.name, purpose: c.purpose, kind: c.kind,
    kind_label: CIRCLE_KINDS.find((k) => k.value === c.kind)?.label ?? "Circle", join_mode: c.join_mode, capacity: c.capacity,
    member_count: members.length, is_full: members.length >= c.capacity, agreements: c.agreements,
    members: members.map((m) => ({ user: pub(m.user), role: m.role, joined_at: m.joined_at })),
    my_role: mine?.role ?? null, my_invitation: s.circleInvites.find((i) => i.circle === c.id && i.invitee === me() && i.status === "pending")?.id ?? null,
    conversation_id: mine ? c.conversation : null, can_close: mine?.role === "host" || isLeader(c.community), created_at: c.created_at,
  };
}

function messageShape(m: DemoMessage): ChatMessage {
  const quoted = m.reply_to ? load().messages.find((x) => x.id === m.reply_to) : undefined;
  return {
    id: m.id, kind: m.kind, body: m.removed ? "" : m.body, image: m.removed ? null : m.image, sender: m.sender ? pub(m.sender) : null,
    reply_to: quoted ? { id: quoted.id, kind: quoted.kind, is_removed: quoted.removed, body: quoted.removed ? "" : quoted.body.slice(0, 160), sender_name: quoted.sender ? first(quoted.sender) : "" } : null,
    client_id: m.client_id, is_removed: m.removed, created_at: m.created_at,
  };
}

function postMessage(conversation: string, sender: string | null, body: string, extra: Partial<DemoMessage> = {}) {
  const m: DemoMessage = { id: nextId(), conversation, sender, kind: sender ? "text" : "system", body, image: null, reply_to: null, client_id: "", removed: false, created_at: now(), ...extra };
  load().messages.push(m);
  if (sender) for (const cm of load().convMembers) if (cm.conversation === conversation && cm.user === sender) cm.last_read = m.id;
  const event: LiveEvent = { type: "message.new", conversation_id: conversation, message: messageShape(m) };
  setTimeout(() => demoBus.emit(event), 0);
  return m;
}

function addToCircle(c: DemoCircle, u: string) {
  const s = load();
  if (circleMembers(c.id).some((m) => m.user === u)) return null;
  if (circleMembers(c.id).length >= c.capacity) return fail(400, "This circle is full.");
  s.circleMembers.push({ circle: c.id, user: u, role: "member", joined_at: now() });
  const latest = s.messages.filter((m) => m.conversation === c.conversation).at(-1)?.id ?? 0;
  s.convMembers.push({ conversation: c.conversation, user: u, role: "member", last_read: latest });
  for (const i of s.circleInvites) if (i.circle === c.id && i.invitee === u && i.status === "pending") { i.status = "accepted"; resolve("circle_invite", i.id); }
  postMessage(c.conversation, null, `${first(u)} joined the circle.`);
  return null;
}

function leaveCircle(c: DemoCircle, u: string, how: "left" | "removed") {
  const s = load();
  const leaving = s.circleMembers.find((m) => m.circle === c.id && m.user === u);
  if (!leaving) return false;
  s.circleMembers = s.circleMembers.filter((m) => m !== leaving);
  s.convMembers = s.convMembers.filter((m) => !(m.conversation === c.conversation && m.user === u));
  postMessage(c.conversation, null, how === "left" ? `${first(u)} left the circle.` : `${first(u)} is no longer in the circle.`);
  const rest = circleMembers(c.id).sort((a, b) => a.joined_at.localeCompare(b.joined_at));
  if (!rest.length) {
    c.closed = true;
    s.conversations.find((x) => x.id === c.conversation)!.closed = true;
    return true;
  }
  if (leaving.role === "host" && !rest.some((m) => m.role === "host")) {
    rest[0].role = "host";
    const cm = s.convMembers.find((m) => m.conversation === c.conversation && m.user === rest[0].user);
    if (cm) cm.role = "admin";
    postMessage(c.conversation, null, `${first(rest[0].user)} is now the host.`);
  }
  return false;
}

const REPLIES = ["Love this 🙌", "I'm in. What time should we start?", "Good idea, let me check my Saturday.", "Haha, same here.", "Can someone share the link?", "Count me in!"];
/** In the demo, someone in the circle answers after you write, so the live chat feels alive. */
function simulateReply(conversation: string) {
  const others = load().convMembers.filter((m) => m.conversation === conversation && m.user !== me());
  if (!others.length) return;
  const who = others[Math.floor(Math.random() * others.length)].user;
  setTimeout(() => demoBus.emit({ type: "typing", conversation_id: conversation, user: { user_id: who, first_name: first(who) } }), 900);
  setTimeout(() => {
    if (load().conversations.find((c) => c.id === conversation)?.closed) return;
    postMessage(conversation, who, REPLIES[Math.floor(Math.random() * REPLIES.length)]);
    save();
    // The demo member is looking at the chat, so others "read" it too.
    setTimeout(() => demoBus.emit({ type: "message.read", conversation_id: conversation, user_id: who, message_id: load().seq }), 400);
  }, 3200);
}

function conversationShape(id: string, withMembers = false): Conversation {
  const s = load();
  const conv = s.conversations.find((c) => c.id === id)!;
  const msgs = s.messages.filter((m) => m.conversation === id);
  const mine = s.convMembers.find((m) => m.conversation === id && m.user === me());
  const circle = s.circles.find((c) => c.conversation === id);
  const unread = msgs.filter((m) => m.id > (mine?.last_read ?? 0) && m.sender && m.sender !== me()).length;
  return {
    id, kind: conv.kind, title: conv.title, is_closed: conv.closed, member_count: s.convMembers.filter((m) => m.conversation === id).length,
    last_message: msgs.length ? messageShape(msgs[msgs.length - 1]) : null, last_message_at: msgs.at(-1)?.created_at ?? null,
    unread_count: unread, my_role: mine?.role ?? null,
    about: circle ? { type: "circle", circle_id: circle.id, community_id: circle.community, community_name: s.communities.find((c) => c.id === circle.community)?.name ?? "" } : null,
    ...(withMembers ? { members: s.convMembers.filter((m) => m.conversation === id).map((m) => ({ user: pub(m.user), role: m.role, last_read_message_id: m.last_read })) } : {}),
  };
}

// ── Router ─────────────────────────────────────────────────────

type Body = Record<string, unknown>;
type Handler = (m: RegExpMatchArray, q: URLSearchParams, body: Body) => ApiResult<unknown> | Promise<ApiResult<unknown>>;
const routes: [string, RegExp, Handler][] = [];
const route = (method: string, pattern: string, h: Handler) => routes.push([method, new RegExp(`^${pattern.replace(/:(\w+)/g, "([^/]+)")}/?$`), h]);
const signedInOnly = () => (me() ? null : fail(401, "Please log in."));

// Profile
route("GET", "profile", () => ok(profileShape(user(me())!)));
route("PUT", "profile", (_m, _q, b) => {
  const u = user(me())!;
  if (typeof b.username === "string" && Object.values(load().users).some((x) => x.user_id !== u.user_id && x.username?.toLowerCase() === (b.username as string).toLowerCase()))
    return fail(422, "That username is taken. Try another.", "username");
  Object.assign(u, Object.fromEntries(Object.entries(b).filter(([k]) => k in u && !["user_id", "email", "created_at"].includes(k))));
  return ok(profileShape(u), "Update Successful.");
});
route("GET", "profile/interests", () => ok(["Tech", "Football", "Books", "Food", "Music", "Faith", "Fitness", "Art", "Business", "Games", "Volunteering", "Photography"].map((n) => ({ slug: n.toLowerCase(), name: n }))));
route("GET", "profile/username-available", (_m, q) => {
  const name = (q.get("username") ?? "").trim();
  const taken = Object.values(load().users).some((u) => u.user_id !== me() && u.username?.toLowerCase() === name.toLowerCase());
  const valid = /^[A-Za-z0-9_]{3,30}$/.test(name);
  return ok({ username: name, available: valid && !taken, reason: !valid ? "Use 3 to 30 letters, numbers or underscores." : taken ? "That username is taken." : null });
});
route("GET", "profile/devices", () => ok([{ device_id: "this-device", device: "This browser (demo)", ip_address: null, created_at: now(), last_seen_at: now(), is_current: true }]));
route("POST", "profile/devices/sign-out-others", () => ok({ signed_out: 0 }));
route("DELETE", "profile/devices/:id", () => fail(400, "To sign out of this device, log out."));
route("GET", "profile/blocks", () => ok(load().blocks.map(pub)));
route("POST", "profile/blocks", (_m, _q, b) => {
  const u = Object.values(load().users).find((x) => x.username === b.username);
  if (!u) return fail(404, "Member not found.");
  if (!load().blocks.includes(u.user_id)) load().blocks.push(u.user_id);
  return ok("Blocked. They can no longer see your profile or contact you.");
});
route("DELETE", "profile/blocks/:username", (m) => {
  const s = load();
  s.blocks = s.blocks.filter((id) => user(id)?.username !== decodeURIComponent(m[1]));
  return ok("Unblocked.");
});
route("POST", "profile/settings/password", () => ok("Password changed successfully."));
route("POST", "profile/settings/2fa", () => ok("A code has been sent to your email. (Demo: any 6 digits.)"));
route("PUT", "profile/settings/2fa", () => {
  const u = user(me())!;
  u.is_2fa_set = !u.is_2fa_set;
  return ok({ is_2fa_set: u.is_2fa_set });
});
route("DELETE", "profile/photo", () => { user(me())!.profile_photo = null; return ok("Profile photo removed."); });
route("DELETE", "profile/cover", () => { user(me())!.cover_photo = null; return ok("Cover removed."); });
route("GET", "profile/members/:username", (m) => {
  const u = Object.values(load().users).find((x) => x.username === decodeURIComponent(m[1]));
  if (!u) return fail(404, "We couldn't find that member.");
  return ok({ ...pub(u.user_id), bio: u.bio, cover_photo: u.cover_photo, location: u.location, website: u.website, interests: u.interests.map((i) => ({ slug: i, name: i[0].toUpperCase() + i.slice(1) })), joined_at: u.created_at, community_count: load().memberships.filter((x) => x.user === u.user_id).length });
});
route("GET", "profile/export", () => ok({ note: "Demo data", profile: profileShape(user(me())!) }));
route("POST", "profile/delete-account", () => { resetDemo(); setSignedIn(false); return ok("Your account has been deleted."); });

// Communities
route("GET", "communities", (_m, q) => {
  const term = (q.get("search") ?? "").toLowerCase();
  const list = load().communities.filter((c) => !c.closed && (!term || c.name.toLowerCase().includes(term) || c.tagline.toLowerCase().includes(term))
    && (!q.get("category") || c.category === q.get("category")) && (!q.get("area") || c.area === q.get("area")))
    .sort((a, b) => Number(b.is_verified) - Number(a.is_verified) || memberCount(b.id) - memberCount(a.id));
  return ok(page(list, q, 12).map(communityShape));
});
route("POST", "communities", (_m, _q, b) => {
  const s = load();
  const n = String(b.name ?? "").trim();
  if (n.length < 3) return fail(422, "Give your community a name of 3 to 60 characters.", "name");
  const slug = n.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "community";
  const id = s.communities.some((c) => c.id === slug) ? `${slug}-${nextId()}` : slug;
  const c: DemoCommunity = {
    id, slug: id, name: n, tagline: String(b.tagline ?? ""), about: String(b.about ?? ""), category: String(b.category ?? "social_hangouts"), area: String(b.area ?? "Wuse 2"),
    city: "Abuja", cover_photo: null, instagram: String(b.instagram ?? "").replace(/^.*instagram\.com\//, "").replace(/[/@]/g, ""), whatsapp: String(b.whatsapp ?? ""),
    guidelines: (b.guidelines as string[]) ?? ["Be kind and specific.", "What's shared here stays here."], visibility: (b.visibility as "public" | "private") ?? "public",
    is_verified: false, invite_code: Math.random().toString(36).slice(2, 8).toUpperCase(), created_at: now(), closed: false,
  };
  s.communities.unshift(c);
  s.memberships.push({ community: c.id, user: me()!, role: "leader", joined_at: now() });
  return ok(communityShape(c), "Your community is live.");
});
route("GET", "communities/mine", () => ok(load().communities.filter((c) => !c.closed && membership(c.id)).sort((a, b) => (isLeader(a.id) ? 0 : 1) - (isLeader(b.id) ? 0 : 1)).map(communityShape)));
route("GET", "communities/invitations", () => ok([]));
route("POST", "communities/invitations/:id", (m, _q, b) => {
  const s = load();
  const inv = s.invites.find((i) => i.id === Number(m[1]) && i.invitee === me() && i.status === "pending");
  if (!inv) return fail(404, "That invite isn't available any more.");
  resolve("community_invite", inv.id);
  if (b.decision !== "accept") { inv.status = "declined"; return ok("Invite declined."); }
  const c = findCommunity(inv.community)!;
  join(c, me()!);
  notify(inv.inviter, "invite_accepted", `${name(me()!)} accepted your invite to ${c.name}.`, `/circles/community/${c.id}?tab=members`, me());
  return ok(communityShape(c));
});
route("GET", "communities/invites/:code", (m) => {
  const c = load().communities.find((x) => x.invite_code === decodeURIComponent(m[1]).toUpperCase() && !x.closed);
  if (!c) return fail(404, "That invite link isn't valid any more. Ask a leader for a new one.");
  const full = communityShape(c);
  return ok({ id: full.id, slug: full.slug, name: full.name, tagline: full.tagline, category_label: full.category_label, area: full.area, city: full.city, cover_photo: full.cover_photo, is_verified: full.is_verified, member_count: full.member_count, visibility: full.visibility });
});
route("POST", "communities/invites/:code", (m) => {
  const c = load().communities.find((x) => x.invite_code === decodeURIComponent(m[1]).toUpperCase() && !x.closed);
  if (!c) return fail(404, "That invite link isn't valid any more. Ask a leader for a new one.");
  join(c, me()!);
  return ok(communityShape(c), "Welcome! You've joined the community.");
});
route("POST", "communities/circle-invitations/:id", (m, _q, b) => {
  const s = load();
  const inv = s.circleInvites.find((i) => i.id === Number(m[1]) && i.invitee === me() && i.status === "pending");
  const circle = inv && s.circles.find((c) => c.id === inv.circle && !c.closed);
  if (!inv || !circle) return fail(404, "That invite isn't available any more.");
  if (b.decision !== "accept") { inv.status = "declined"; resolve("circle_invite", inv.id); return ok("Invite declined."); }
  if (!membership(circle.community)) join(findCommunity(circle.community)!, me()!);
  const error = addToCircle(circle, me()!);
  if (error) return error;
  return ok(circleShape(circle));
});

const withCommunity = (h: (c: DemoCommunity, m: RegExpMatchArray, q: URLSearchParams, b: Body) => ApiResult<unknown>): Handler => (m, q, b) => {
  const c = findCommunity(decodeURIComponent(m[1]));
  return c ? h(c, m, q, b) : fail(404, "We couldn't find that community.");
};
const leadersOnly = (c: DemoCommunity) => (isLeader(c.id) ? null : fail(403, "Only the community's leaders can do that."));
const canRead = (c: DemoCommunity) => (c.visibility === "public" || membership(c.id) ? null : fail(403, "Only members can see this."));

route("GET", "communities/:id", withCommunity((c) => ok(communityShape(c))));
route("PUT", "communities/:id", withCommunity((c, _m, _q, b) => leadersOnly(c) ?? (Object.assign(c, Object.fromEntries(Object.entries(b).filter(([k]) => k in c && !["id", "slug", "invite_code"].includes(k)))), ok(communityShape(c), "Update Successful."))));
route("POST", "communities/:id/join", withCommunity((c, _m, _q, b) => {
  const s = load();
  if (membership(c.id)) return ok(communityShape(c));
  const code = String(b.code ?? "").trim().toUpperCase();
  if (code && code !== c.invite_code) return fail(403, "That invite link isn't valid any more. Ask a leader for a new one.");
  if (c.visibility === "private" && !code) {
    if (!s.requests.some((r) => r.community === c.id && r.user === me() && r.status === "pending")) {
      const r = { id: nextId(), community: c.id, user: me()!, message: String(b.message ?? ""), requested_at: now(), status: "pending" as const };
      s.requests.push(r);
      for (const l of s.memberships.filter((x) => x.community === c.id && x.role === "leader")) notify(l.user, "join_request", `${name(me()!)} asked to join ${c.name}.`, `/circles/community/${c.id}?tab=requests`, me(), "join_request", r.id);
    }
    return ok(communityShape(c));
  }
  join(c, me()!);
  return ok(communityShape(c), "Welcome! You've joined the community.");
}));
route("DELETE", "communities/:id/join", withCommunity((c) => {
  const s = load();
  s.requests = s.requests.filter((r) => !(r.community === c.id && r.user === me() && r.status === "pending"));
  return ok(communityShape(c));
}));
route("POST", "communities/:id/leave", withCommunity((c) => {
  const s = load();
  const mine = membership(c.id);
  if (!mine) return ok(communityShape(c));
  if (mine.role === "leader" && s.memberships.filter((x) => x.community === c.id && x.role === "leader").length === 1 && memberCount(c.id) > 1)
    return fail(400, "You're the only leader. Make someone else a leader before you leave.");
  leaveCircles(c.id, me()!);
  s.memberships = s.memberships.filter((x) => x !== mine);
  if (!memberCount(c.id)) { c.closed = true; return ok("You've left, and the community has closed because no one else was in it."); }
  return ok(communityShape(c));
}));
route("POST", "communities/:id/invite-code", withCommunity((c) => leadersOnly(c) ?? (c.invite_code = Math.random().toString(36).slice(2, 8).toUpperCase(), ok({ invite_code: c.invite_code }, "New invite link created. The old one no longer works."))));
route("GET", "communities/:id/members", withCommunity((c, _m, q) => canRead(c) ?? ok(page(load().memberships.filter((x) => x.community === c.id).sort((a, b) => (a.role === b.role ? a.joined_at.localeCompare(b.joined_at) : a.role === "leader" ? -1 : 1)).map((x) => ({ user: pub(x.user), role: x.role, joined_at: x.joined_at })), q, 50))));
route("PUT", "communities/:id/members/:uid", withCommunity((c, m, _q, b) => {
  const blocked = leadersOnly(c);
  if (blocked) return blocked;
  const target = membership(c.id, decodeURIComponent(m[2]));
  if (!target) return fail(404, "That person isn't a member.");
  if (target.role === "leader" && b.role === "member" && load().memberships.filter((x) => x.community === c.id && x.role === "leader").length === 1) return fail(400, "A community needs at least one leader.");
  if (target.role !== "leader" && b.role === "leader") notify(target.user, "made_leader", `You're now a leader of ${c.name}.`, `/circles/community/${c.id}?tab=manage`, me());
  target.role = b.role as "leader" | "member";
  return ok({ user_id: target.user, role: target.role });
}));
route("DELETE", "communities/:id/members/:uid", withCommunity((c, m) => {
  const blocked = leadersOnly(c);
  if (blocked) return blocked;
  const target = membership(c.id, decodeURIComponent(m[2]));
  if (!target) return fail(404, "That person isn't a member.");
  if (target.role === "leader") return fail(400, "Make them a member first, then remove them.");
  leaveCircles(c.id, target.user);
  load().memberships = load().memberships.filter((x) => x !== target);
  return ok("Member removed.");
}));
route("GET", "communities/:id/requests", withCommunity((c) => leadersOnly(c) ?? ok(load().requests.filter((r) => r.community === c.id && r.status === "pending").map((r) => ({ id: r.id, user: pub(r.user), message: r.message, requested_at: r.requested_at })))));
route("POST", "communities/:id/requests/:rid", withCommunity((c, m, _q, b) => {
  const blocked = leadersOnly(c);
  if (blocked) return blocked;
  const r = load().requests.find((x) => x.id === Number(m[2]) && x.community === c.id && x.status === "pending");
  if (!r) return fail(404, "That request was already answered.");
  resolve("join_request", r.id);
  if (b.decision === "approve") {
    join(c, r.user);
    notify(r.user, "request_approved", `You're in! Your request to join ${c.name} was approved.`, `/circles/community/${c.id}`, me());
    return ok("Approved. They're now a member.");
  }
  r.status = "declined";
  return ok("Request declined.");
}));
route("GET", "communities/:id/invite-suggestions", withCommunity((c, _m, q) => {
  const s = load();
  const term = (q.get("search") ?? "").replace(/^@/, "").toLowerCase();
  const people = Object.values(s.users).filter((u) => u.user_id !== me() && !membership(c.id, u.user_id) && (!term || `${u.first_name} ${u.last_name} ${u.username}`.toLowerCase().includes(term)));
  return ok(people.map((u) => ({ ...pub(u.user_id), invited: s.invites.some((i) => i.community === c.id && i.invitee === u.user_id && i.status === "pending") })));
}));
route("POST", "communities/:id/invitations", withCommunity((c, _m, _q, b) => {
  const s = load();
  const results = ((b.user_ids as string[]) ?? []).map((id) => {
    if (!user(id)) return { user_id: id, status: "not_allowed" as const };
    if (membership(c.id, id)) return { user_id: id, status: "already_member" as const };
    if (s.invites.some((i) => i.community === c.id && i.invitee === id && i.status === "pending")) return { user_id: id, status: "already_invited" as const };
    s.invites.push({ id: nextId(), community: c.id, inviter: me()!, invitee: id, status: "pending" });
    return { user_id: id, status: "invited" as const };
  });
  return ok({ results, invited: results.filter((r) => r.status === "invited").length });
}));
route("DELETE", "communities/:id/cover", withCommunity((c) => leadersOnly(c) ?? (c.cover_photo = null, ok(communityShape(c)))));

// Posts
route("GET", "communities/:id/posts", withCommunity((c, _m, q) => {
  const kind = q.get("kind");
  const list = load().posts.filter((p) => p.community === c.id && !p.removed && (!kind || p.kind === kind))
    .sort((a, b) => Number(b.is_pinned) - Number(a.is_pinned) || b.created_at.localeCompare(a.created_at));
  return canRead(c) ?? ok(page(list, q, 15).map(postShape));
}));
route("POST", "communities/:id/posts", withCommunity((c, _m, _q, b) => {
  if (!membership(c.id)) return fail(403, "Only members can see this.");
  const kind = b.kind === "announcement" ? "announcement" : "discussion";
  if (kind === "announcement" && !isLeader(c.id)) return fail(403, "Only the community's leaders can do that.");
  const images = ((b.image_ids as number[]) ?? []).map((id) => uploads.get(id)).filter(Boolean) as { id: number; url: string }[];
  const body = String(b.body ?? "").trim();
  if (!body && !images.length) return fail(400, "Write something or add a photo.");
  const p: DemoPost = { id: nextId(), community: c.id, author: me()!, kind, body, images, is_pinned: false, edited_at: null, created_at: now(), removed: false, hearts: [] };
  load().posts.push(p);
  return ok(postShape(p));
}));
const withPost = (h: (c: DemoCommunity, p: DemoPost, m: RegExpMatchArray, q: URLSearchParams, b: Body) => ApiResult<unknown>): Handler =>
  withCommunity((c, m, q, b) => {
    const p = load().posts.find((x) => x.id === Number(m[2]) && x.community === c.id && !x.removed);
    return p ? h(c, p, m, q, b) : fail(404, "That post isn't available any more.");
  });
route("PUT", "communities/:id/posts/:pid", withPost((_c, p, _m, _q, b) => (p.author !== me() ? fail(403, "Only the person who wrote it can do that.") : (p.body = String(b.body ?? p.body), p.edited_at = now(), ok(postShape(p))))));
route("DELETE", "communities/:id/posts/:pid", withPost((c, p) => (p.author !== me() && !isLeader(c.id) ? fail(403, "Only the person who wrote it can do that.") : (p.removed = true, p.is_pinned = false, ok("Post removed.")))));
route("POST", "communities/:id/posts/:pid/pin", withPost((c, p) => {
  if (!isLeader(c.id)) return fail(403, "Only the community's leaders can do that.");
  if (!p.is_pinned && load().posts.filter((x) => x.community === c.id && x.is_pinned && !x.removed).length >= 3) return fail(400, "You can pin up to 3 posts. Unpin one first.");
  p.is_pinned = !p.is_pinned;
  return ok(postShape(p));
}));
route("POST", "communities/:id/posts/:pid/reaction", withPost((_c, p) => { if (!p.hearts.includes(me()!)) p.hearts.push(me()!); return ok({ reaction_count: p.hearts.length, my_reaction: true }); }));
route("DELETE", "communities/:id/posts/:pid/reaction", withPost((_c, p) => { p.hearts = p.hearts.filter((x) => x !== me()); return ok({ reaction_count: p.hearts.length, my_reaction: false }); }));
route("GET", "communities/:id/posts/:pid/comments", withPost((c, p, _m, q) => ok(page(load().comments.filter((x) => x.post === p.id && !x.removed).sort((a, b) => a.created_at.localeCompare(b.created_at)), q, 50)
  .map((x) => ({ id: x.id, body: x.body, author: pub(x.author), author_is_leader: isLeader(c.id, x.author), created_at: x.created_at, can_remove: x.author === me() || isLeader(c.id) })))));
route("POST", "communities/:id/posts/:pid/comments", withPost((c, p, _m, _q, b) => {
  if (!membership(c.id)) return fail(403, "Only members can see this.");
  const x = { id: nextId(), post: p.id, author: me()!, body: String(b.body ?? "").trim(), created_at: now(), removed: false };
  if (!x.body) return fail(422, "Write a reply first.", "body");
  load().comments.push(x);
  notify(p.author, "post_comment", `${name(me()!)} commented on your post in ${c.name}.`, `/circles/community/${c.id}?post=${p.id}`, me(), "community_post", p.id);
  return ok({ id: x.id, body: x.body, author: pub(x.author), author_is_leader: isLeader(c.id), created_at: x.created_at, can_remove: true });
}));
route("DELETE", "communities/:id/posts/:pid/comments/:cid", withPost((c, _p, m) => {
  const x = load().comments.find((y) => y.id === Number(m[3]));
  if (!x || (x.author !== me() && !isLeader(c.id))) return fail(403, "Only the person who wrote it can do that.");
  x.removed = true;
  return ok("Comment removed.");
}));

// Small circles
const withCircle = (h: (c: DemoCommunity, s: DemoCircle, m: RegExpMatchArray, q: URLSearchParams, b: Body) => ApiResult<unknown>): Handler =>
  withCommunity((c, m, q, b) => {
    const circle = load().circles.find((x) => x.id === decodeURIComponent(m[2]) && x.community === c.id && !x.closed);
    return circle ? (canRead(c) ?? h(c, circle, m, q, b)) : fail(404, "This circle isn't available. It may have closed.");
  });
route("GET", "communities/:id/circles", withCommunity((c, _m, q) => {
  const rank = (s: DemoCircle) => (circleMembers(s.id).some((x) => x.user === me()) ? 0 : s.join_mode === "open" && circleMembers(s.id).length < s.capacity ? 1 : 2);
  const list = load().circles.filter((s) => s.community === c.id && !s.closed).sort((a, b) => rank(a) - rank(b) || b.created_at.localeCompare(a.created_at));
  return canRead(c) ?? ok(page(list, q).map(circleShape));
}));
route("POST", "communities/:id/circles", withCommunity((c, _m, _q, b) => {
  if (!membership(c.id)) return fail(403, "Join the community first, then you can join its circles.");
  const n = String(b.name ?? "").trim();
  if (n.length < 3) return fail(422, "Give the circle a name of 3 to 60 characters.", "name");
  const s = load();
  const id = `${n.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-${nextId()}`;
  const conversation = `conv-${id}`;
  const circle: DemoCircle = { id, community: c.id, name: n, purpose: String(b.purpose ?? ""), kind: String(b.kind ?? "friendship"), join_mode: (b.join_mode as "open" | "invite") ?? "open",
    capacity: Number(b.capacity ?? 6), agreements: ((b.agreements as string[]) ?? []).filter(Boolean), conversation, created_at: now(), closed: false };
  s.circles.unshift(circle);
  s.conversations.push({ id: conversation, kind: "circle", title: n, closed: false });
  s.circleMembers.push({ circle: id, user: me()!, role: "host", joined_at: now() });
  s.convMembers.push({ conversation, user: me()!, role: "admin", last_read: 0 });
  postMessage(conversation, null, `${first(me()!)} started ${n}.`);
  return ok(circleShape(circle));
}));
route("GET", "communities/:id/circles/:cid", withCircle((_c, s) => ok(circleShape(s))));
route("PUT", "communities/:id/circles/:cid", withCircle((_c, s, _m, _q, b) => {
  if (circleShape(s).my_role !== "host") return fail(403, "Only the circle's host can do that.");
  for (const k of ["name", "purpose", "kind", "join_mode", "capacity", "agreements"] as const) if (k in b) (s as Record<string, unknown>)[k] = b[k];
  load().conversations.find((x) => x.id === s.conversation)!.title = s.name;
  return ok(circleShape(s), "Update Successful.");
}));
route("DELETE", "communities/:id/circles/:cid", withCircle((c, s) => {
  if (!circleShape(s).can_close) return fail(403, "Only the circle's host can do that.");
  postMessage(s.conversation, null, `${first(me()!)} closed the circle.`);
  s.closed = true;
  load().conversations.find((x) => x.id === s.conversation)!.closed = true;
  void c;
  return ok("Circle closed.");
}));
route("POST", "communities/:id/circles/:cid/join", withCircle((c, s) => {
  if (!membership(c.id)) return fail(403, "Join the community first, then you can join its circles.");
  const shape = circleShape(s);
  if (shape.my_role) return ok(shape);
  if (s.join_mode === "invite" && !shape.my_invitation) return fail(403, "This circle is invite only. Ask someone in it to invite you.");
  return addToCircle(s, me()!) ?? ok(circleShape(s));
}));
route("POST", "communities/:id/circles/:cid/leave", withCircle((_c, s) => (leaveCircle(s, me()!, "left") ? ok("You've left, and the circle has closed because no one else was in it.") : ok("You've left the circle."))));
route("DELETE", "communities/:id/circles/:cid/members/:uid", withCircle((_c, s, m) => {
  if (circleShape(s).my_role !== "host") return fail(403, "Only the circle's host can do that.");
  leaveCircle(s, decodeURIComponent(m[3]), "removed");
  return ok("Member removed.");
}));
route("GET", "communities/:id/circles/:cid/invite-suggestions", withCircle((c, s, _m, q) => {
  const term = (q.get("search") ?? "").replace(/^@/, "").toLowerCase();
  const inCircle = new Set(circleMembers(s.id).map((x) => x.user));
  return ok(load().memberships.filter((x) => x.community === c.id && !inCircle.has(x.user) && x.user !== me())
    .map((x) => user(x.user)!).filter((u) => !term || `${u.first_name} ${u.last_name} ${u.username}`.toLowerCase().includes(term))
    .map((u) => ({ ...pub(u.user_id), invited: load().circleInvites.some((i) => i.circle === s.id && i.invitee === u.user_id && i.status === "pending") })));
}));
route("POST", "communities/:id/circles/:cid/invitations", withCircle((c, s, _m, _q, b) => {
  const st = load();
  const results = ((b.user_ids as string[]) ?? []).map((id) => {
    if (!membership(c.id, id)) return { user_id: id, status: "not_allowed" as const };
    if (circleMembers(s.id).some((x) => x.user === id)) return { user_id: id, status: "already_member" as const };
    const inv = { id: nextId(), circle: s.id, inviter: me()!, invitee: id, status: "pending" as const };
    st.circleInvites.push(inv);
    // In the demo, invited people accept a moment later so the circle fills up on screen.
    setTimeout(() => { if (inv.status === "pending" && !s.closed) { addToCircle(s, id); save(); } }, 4000 + Math.random() * 3000);
    return { user_id: id, status: "invited" as const };
  });
  return ok({ results, invited: results.filter((r) => r.status === "invited").length });
}));

// Notifications
route("GET", "notifications", (_m, q) => ok(page(load().notices.filter((n) => n.recipient === me()), q).map((n) => ({
  id: n.id, kind: n.kind, text: n.text, link: n.link, target_type: n.target_type, target_id: n.target_id, actor: n.actor ? pub(n.actor) : null, is_read: n.read, created_at: n.created_at,
}))));
route("GET", "notifications/unread-count", () => ok({ unread: load().notices.filter((n) => n.recipient === me() && !n.read).length }));
route("POST", "notifications/read", (_m, _q, b) => {
  const ids = b.ids as number[] | undefined;
  for (const n of load().notices) if (n.recipient === me() && (!ids || ids.includes(n.id))) n.read = true;
  return ok("Update Successful.");
});

// Chat
const inConversation = (id: string) => load().convMembers.some((m) => m.conversation === id && m.user === me());
route("GET", "chat/conversations", (_m, q) => ok(page(load().conversations.filter((c) => inConversation(c.id)).map((c) => conversationShape(c.id)).sort((a, b) => (b.last_message_at ?? "").localeCompare(a.last_message_at ?? "")), q, 30)));
route("GET", "chat/unread-count", () => ok({ unread: load().conversations.filter((c) => inConversation(c.id)).reduce((n, c) => n + conversationShape(c.id).unread_count, 0) }));
route("POST", "chat/live-ticket", () => ok({ ticket: "demo", expires_in: 60 }));
route("GET", "chat/conversations/:id", (m) => (inConversation(m[1]) ? ok(conversationShape(m[1], true)) : fail(404, "This chat isn't available. You may have left it.")));
route("GET", "chat/conversations/:id/messages", (m, q) => {
  if (!inConversation(m[1])) return fail(404, "This chat isn't available. You may have left it.");
  const limit = Math.min(100, Number(q.get("limit") || 30));
  const before = Number(q.get("before") || 0), after = Number(q.get("after") || 0);
  let list = load().messages.filter((x) => x.conversation === m[1]);
  if (after) list = list.filter((x) => x.id > after);
  else if (before) list = list.filter((x) => x.id < before);
  const rows = after ? list.slice(0, limit) : list.slice(-limit);
  return ok({ results: rows.map(messageShape), has_more: list.length > rows.length });
});
route("POST", "chat/conversations/:id/messages", (m, _q, b) => {
  const conv = load().conversations.find((c) => c.id === m[1]);
  if (!conv || !inConversation(conv.id)) return fail(404, "This chat isn't available. You may have left it.");
  if (conv.closed) return fail(403, "This chat has closed. You can read it, but not send new messages.");
  const existing = b.client_id ? load().messages.find((x) => x.client_id === b.client_id && x.sender === me()) : undefined;
  if (existing) return ok(messageShape(existing));
  const image = b.image_id ? uploads.get(Number(b.image_id)) ?? null : null;
  const body = String(b.body ?? "").trim();
  if (!body && !image) return fail(400, "Write a message or add a photo.");
  const msg = postMessage(conv.id, me(), body, { kind: image ? "image" : "text", image, reply_to: (b.reply_to as number) ?? null, client_id: String(b.client_id ?? "") });
  simulateReply(conv.id);
  return ok(messageShape(msg));
});
route("DELETE", "chat/conversations/:id/messages/:mid", (m) => {
  const msg = load().messages.find((x) => x.id === Number(m[2]) && x.conversation === m[1]);
  const admin = load().convMembers.find((x) => x.conversation === m[1] && x.user === me())?.role === "admin";
  if (!msg || (msg.sender !== me() && !admin)) return fail(403, "Only the person who sent it can remove that message.");
  msg.removed = true;
  return ok("Message removed.");
});
route("POST", "chat/conversations/:id/read", (m, _q, b) => {
  const cm = load().convMembers.find((x) => x.conversation === m[1] && x.user === me());
  if (cm) cm.last_read = Math.max(cm.last_read, Number(b.message_id ?? 0));
  return ok({ last_read_message_id: cm?.last_read ?? 0, unread_count: conversationShape(m[1]).unread_count });
});

// ── Uploads (photos become data URLs kept with the demo) ───────

const uploads = new Map<number, { id: number; url: string }>();
const readFile = (file: Blob) => new Promise<string>((res, rej) => { const r = new FileReader(); r.onload = () => res(String(r.result)); r.onerror = rej; r.readAsDataURL(file); });

export async function demoUpload<T>(path: string, form: FormData): Promise<ApiResult<T>> {
  await pause(500);
  const file = form.get("photo");
  if (!(file instanceof Blob)) return fail(422, "Choose a photo.") as ApiResult<T>;
  const url = await readFile(file);
  const clean = path.replace(/^\/+|\/+$/g, "");
  const media = { id: nextId(), url };
  uploads.set(media.id, media);
  let result: ApiResult<unknown>;
  if (clean === "profile/photo") { user(me())!.profile_photo = url; result = ok({ profile_photo: url }, "Profile photo updated."); }
  else if (clean === "profile/cover") { user(me())!.cover_photo = url; result = ok({ cover_photo: url }); }
  else if (/^communities\/[^/]+\/cover$/.test(clean)) {
    const c = findCommunity(decodeURIComponent(clean.split("/")[1]));
    if (!c || !isLeader(c.id)) result = fail(403, "Only the community's leaders can do that.");
    else { c.cover_photo = url; result = ok(communityShape(c)); }
  } else result = ok(media);
  save();
  return result as ApiResult<T>;
}

// ── Entry points used by lib/api/client.ts ─────────────────────

export async function demoCall<T>(method: string, url: string, body?: unknown): Promise<ApiResult<T>> {
  await pause();
  const [rawPath, query = ""] = url.replace(/^\/api\/v1\//, "").split("?");
  const path = rawPath.replace(/\/+$/, "");
  const q = new URLSearchParams(query);
  const gate = signedInOnly();
  if (gate) return gate as ApiResult<T>;
  for (const [m, re, h] of routes) {
    const match = m === method ? path.match(re) : null;
    if (!match) continue;
    const result = await h(match, q, (body ?? {}) as Body);
    if (method !== "GET") save();
    return result as ApiResult<T>;
  }
  return fail(404, "This part of the demo isn't wired up yet.") as ApiResult<T>;
}

export async function demoAuth<T>(action: string, body: Record<string, unknown> = {}): Promise<ApiResult<T>> {
  await pause(450);
  const s = load();
  const u = user(ME_ID)!;
  const signIn = () => {
    if (s.pending) { Object.assign(u, s.pending); s.pending = null; }
    setSignedIn(true);
    return ok({ user: memberShape(u) }, "Login Successful") as ApiResult<T>;
  };
  switch (action) {
    case "login": {
      if (!String(body.email ?? "").includes("@") || !String(body.password ?? "")) return fail(400, "Enter your email and password.") as ApiResult<T>;
      return signIn();
    }
    case "guest":
      return signIn();
    case "register": {
      const { email, first_name, last_name, phone_number, date_of_birth } = body as Record<string, string>;
      s.pending = { email, first_name, last_name, phone_number, date_of_birth };
      save();
      return ok(null, "We sent a 6-digit code to your email. (Demo: any 6 digits work.)") as ApiResult<T>;
    }
    case "verify-email":
    case "verify-2fa":
      return /^\d{6}$/.test(String(body.otp ?? "")) ? signIn() : (fail(400, "Enter the 6-digit code.", "otp") as ApiResult<T>);
    case "logout":
      setSignedIn(false);
      return ok(null, "Signed out.") as ApiResult<T>;
    default:
      // resend codes, forgot / verify-reset / reset password: always fine in the demo
      return ok(null, "Done. (Demo: any 6-digit code works.)") as ApiResult<T>;
  }
}
