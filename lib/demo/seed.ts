/** A design community avatar: /kin/design/home/community/av-<name>.jpg */
const AV = (name: string) => `/kin/design/home/community/av-${name}.jpg`;

/** Everything the demo backend knows. Saved in the browser (localStorage) so a demo survives a refresh. */
export type DemoUser = {
  user_id: string; username: string | null; first_name: string; last_name: string; profile_photo: string | null;
  email: string; phone_number: string; bio: string; location: string; website: string; cover_photo: string | null;
  date_of_birth: string | null; interests: string[]; message_permission: "everyone" | "circles" | "nobody";
  show_in_search: boolean; is_2fa_set: boolean; created_at: string;
  /** Settings, Continue with Google: the linked Google email (demo only pretends). */
  google_email?: string | null;
};
export type DemoCommunity = {
  id: string; slug: string; name: string; tagline: string; about: string; category: string; area: string; city: string;
  cover_photo: string | null; instagram: string; whatsapp: string; guidelines: string[]; visibility: "public" | "private";
  is_verified: boolean; invite_code: string; created_at: string; closed: boolean;
};
export type DemoMembership = { community: string; user: string; role: "leader" | "member"; joined_at: string };
export type DemoRequest = { id: number; community: string; user: string; message: string; requested_at: string; status: "pending" | "approved" | "declined" };
export type DemoInvite = { id: number; community: string; inviter: string; invitee: string; status: "pending" | "accepted" | "declined" };
export type DemoPost = {
  id: number; community: string; author: string; kind: "announcement" | "discussion"; body: string; images: { id: number; url: string }[];
  is_pinned: boolean; edited_at: string | null; created_at: string; removed: boolean; hearts: string[];
};
export type DemoComment = { id: number; post: number; author: string; body: string; created_at: string; removed: boolean };
export type DemoNotice = {
  id: number; recipient: string; kind: string; text: string; link: string; target_type: string; target_id: string;
  actor: string | null; read: boolean; created_at: string;
};
export type DemoCircle = {
  id: string; community: string; name: string; purpose: string; kind: string; join_mode: "open" | "invite"; capacity: number;
  agreements: string[]; conversation: string; created_at: string; closed: boolean;
};
export type DemoCircleMember = { circle: string; user: string; role: "host" | "member"; joined_at: string };
export type DemoCircleInvite = { id: number; circle: string; inviter: string; invitee: string; status: "pending" | "accepted" | "declined" };
export type DemoConversation = { id: string; kind: "circle"; title: string; closed: boolean };
export type DemoConvMember = { conversation: string; user: string; role: "admin" | "member"; last_read: number };
export type DemoMessage = {
  id: number; conversation: string; sender: string | null; kind: "text" | "image" | "system"; body: string;
  image: { id: number; url: string } | null; reply_to: number | null; client_id: string; removed: boolean; created_at: string;
};

export type DemoState = {
  v: 1;
  seq: number;
  /** Signed-in member (always ME_ID in the demo), or null when signed out. */
  session: string | null;
  /** Details typed on the sign-up form, applied to the demo member once the code is "verified". */
  pending: Partial<DemoUser> | null;
  users: Record<string, DemoUser>;
  communities: DemoCommunity[];
  memberships: DemoMembership[];
  requests: DemoRequest[];
  invites: DemoInvite[];
  posts: DemoPost[];
  comments: DemoComment[];
  notices: DemoNotice[];
  circles: DemoCircle[];
  circleMembers: DemoCircleMember[];
  circleInvites: DemoCircleInvite[];
  conversations: DemoConversation[];
  convMembers: DemoConvMember[];
  messages: DemoMessage[];
  /** user_ids the demo member has blocked */
  blocks: string[];
};

export const ME_ID = "demo-me";
const MIN = 60_000, HOUR = 60 * MIN, DAY = 24 * HOUR;

function person(id: string, first: string, last: string, username: string, face: string | null, bio: string, location: string, daysAgo: number): DemoUser {
  return {
    user_id: id, username, first_name: first, last_name: last, profile_photo: face, email: `${username}@example.com`,
    phone_number: "+2348030000000", bio, location, website: "", cover_photo: null, date_of_birth: null, interests: [],
    message_permission: "everyone", show_in_search: true, is_2fa_set: false, created_at: new Date(Date.now() - daysAgo * DAY).toISOString(),
  };
}

export function seed(): DemoState {
  const now = Date.now();
  const at = (ago: number) => new Date(now - ago).toISOString();
  const users: Record<string, DemoUser> = {
    [ME_ID]: { ...person(ME_ID, "Kemi", "Adeyemi", "kemiadeyemi", null, "", "Lagos", 30), email: "kemi.adeyemi@example.com", phone_number: "+234 803 555 0142", date_of_birth: "1996-04-12", interests: ["tech", "football"] },
    // The product design's Community Home cast (its features/community and feed content), ids as lib/data/people.ts.
    "amara-okafor": person("amara-okafor", "Amara", "Okafor", "amaraokafor", AV("amara"), "Visual artist.", "Abuja", 120),
    folake: person("folake", "Folake", "Adeniran", "folakeadeniran", AV("folake"), "Storyteller.", "Lagos", 90),
    "tunde-bakare": person("tunde-bakare", "Tunde", "Bakare", "tundebakare", AV("tunde"), "Community health designer.", "Abuja", 200),
    ngozi: person("ngozi", "Ngozi", "Eze", "ngozieze", AV("ngozi"), "Writer and zine maker.", "Lagos", 60),
    chuka: person("chuka", "Chuka", "Nwosu", "chukanwosu", AV("chuka"), "Founder and maker.", "Port Harcourt", 300),
    "ayo-balogun": person("ayo-balogun", "Ayo", "Balogun", "ayobalogun", "/kin/design/home/feed/avatar-ayo.jpg", "Textile artist.", "Ibadan", 45),
  };

  const community = (c: Partial<DemoCommunity> & Pick<DemoCommunity, "id" | "name" | "category" | "area">): DemoCommunity => ({
    slug: c.id, tagline: "", about: "", city: "Lagos", cover_photo: null, instagram: "", whatsapp: "", visibility: "public", is_verified: false,
    guidelines: ["Be kind and specific.", "No selling without a leader's OK.", "What's shared here stays here."], invite_code: c.id.slice(0, 6).toUpperCase().padEnd(6, "X"),
    created_at: at(60 * DAY), closed: false, ...c,
  });
  // The design's two circles ("Your circles" on Community Home).
  const communities = [
    community({ id: "textiles", name: "Textiles & Adire", tagline: "Makers working with cloth, dye and pattern.", about: "Makers working with cloth, dye and pattern.", category: "arts_crafts", area: "Yaba", cover_photo: "/kin/design/home/feed/circle-textiles.jpg", is_verified: true, invite_code: "TXA416" }),
    community({ id: "poetry", name: "Poetry and Wine talk", tagline: "Poems, honest conversations and a glass of wine.", about: "Poems, honest conversations and a glass of wine.", category: "books_writing", area: "Abuja", city: "Abuja", cover_photo: "/kin/design/home/feed/circle-poetry.jpg", invite_code: "PWT020" }),
  ];

  const m = (community: string, user: string, role: "leader" | "member", ago: number): DemoMembership => ({ community, user, role, joined_at: at(ago) });
  const memberships = [
    m("textiles", "ayo-balogun", "leader", 60 * DAY), m("textiles", "folake", "member", 50 * DAY), m("textiles", "chuka", "member", 40 * DAY), m("textiles", ME_ID, "member", 20 * DAY),
    m("poetry", "amara-okafor", "leader", 55 * DAY), m("poetry", "ngozi", "member", 30 * DAY), m("poetry", "tunde-bakare", "member", 25 * DAY), m("poetry", ME_ID, "member", 15 * DAY),
  ];

  // The design's circle posts (Community Home, "Your circles' feed"), word for word.
  const posts: DemoPost[] = [
    { id: 1, community: "textiles", author: "ayo-balogun", kind: "discussion", body: "Seven dye baths in, and the blue finally came out the way I've been chasing all year. Hung it in the yard for an hour just to watch the light change it.", images: [{ id: 1, url: "/kin/design/home/feed/post1-a.jpg" }, { id: 2, url: "/kin/design/home/feed/post1-b.jpg" }], is_pinned: false, edited_at: null, created_at: at(2 * HOUR), removed: false, hearts: ["folake", "chuka"] },
    { id: 2, community: "poetry", author: "amara-okafor", kind: "discussion", body: "There's something about a glass of wine, a room full of honest conversations, and poetry that says the things we struggle to admit out loud. Sometimes, the words of a stranger feel like they were written from the pages of our own lives.\n\nIf we hosted a poetry and wine evening, what poem would you bring to the table, and what story would you tell behind it?", images: [{ id: 3, url: "/kin/design/home/feed/post2-a.jpg" }, { id: 4, url: "/kin/design/home/feed/post2-b.jpg" }, { id: 5, url: "/kin/design/home/feed/post2-c.jpg" }], is_pinned: false, edited_at: null, created_at: at(3 * HOUR), removed: false, hearts: ["ngozi", "tunde-bakare", ME_ID] },
  ];
  const comments: DemoComment[] = [];

  // The design's group conversations in Messages, with their messages.
  const conversations = [
    { id: "food-systems-cliq", kind: "circle" as const, title: "Food Systems Cliq", closed: false },
    { id: "kincircle-reflection", kind: "circle" as const, title: "KinCircle Reflection", closed: false },
    { id: "university-friends", kind: "circle" as const, title: "University friends", closed: false },
  ];
  const circles: DemoCircle[] = [
    { id: "food-systems-cliq", community: "textiles", name: "Food Systems Cliq", purpose: "A working group shaping a shared project plan together.", kind: "project", join_mode: "invite", capacity: 9, agreements: ["We show up as ourselves, not a performance."], conversation: "food-systems-cliq", created_at: at(10 * DAY), closed: false },
    { id: "kincircle-reflection", community: "poetry", name: "KinCircle Reflection", purpose: "A gentle circle to reflect on the week with people you trust.", kind: "friendship", join_mode: "invite", capacity: 6, agreements: ["We show up as ourselves, not a performance."], conversation: "kincircle-reflection", created_at: at(7 * DAY), closed: false },
    { id: "university-friends", community: "textiles", name: "University friends", purpose: "Easy company and a few good games.", kind: "friendship", join_mode: "invite", capacity: 7, agreements: ["We let the circle know if we can't make it."], conversation: "university-friends", created_at: at(30 * DAY), closed: false },
  ];
  const circleMembers: DemoCircleMember[] = [
    { circle: "food-systems-cliq", user: "tunde-bakare", role: "host", joined_at: at(10 * DAY) }, { circle: "food-systems-cliq", user: "ngozi", role: "member", joined_at: at(9 * DAY) },
    { circle: "food-systems-cliq", user: ME_ID, role: "member", joined_at: at(9 * DAY) },
    { circle: "kincircle-reflection", user: "ngozi", role: "host", joined_at: at(7 * DAY) }, { circle: "kincircle-reflection", user: "tunde-bakare", role: "member", joined_at: at(6 * DAY) },
    { circle: "kincircle-reflection", user: ME_ID, role: "member", joined_at: at(6 * DAY) },
    { circle: "university-friends", user: "chuka", role: "host", joined_at: at(30 * DAY) }, { circle: "university-friends", user: "folake", role: "member", joined_at: at(29 * DAY) },
    { circle: "university-friends", user: ME_ID, role: "member", joined_at: at(29 * DAY) },
  ];
  const convMembers: DemoConvMember[] = circleMembers.map((x) => ({
    conversation: circles.find((c) => c.id === x.circle)!.conversation, user: x.user, role: x.role === "host" ? "admin" : "member", last_read: 0,
  }));
  let mid = 0;
  const msg = (conversation: string, sender: string | null, body: string, ago: number, kind: DemoMessage["kind"] = "text"): DemoMessage =>
    ({ id: ++mid, conversation, sender, kind: sender ? kind : "system", body, image: null, reply_to: null, client_id: "", removed: false, created_at: at(ago) });
  const messages: DemoMessage[] = [
    msg("food-systems-cliq", "tunde-bakare", "Notes from the last call are in the shared folder.", 3 * HOUR),
    msg("food-systems-cliq", "ngozi", "I will bring the budget questions to the 2:00 PM call.", 2 * HOUR),
    msg("kincircle-reflection", "ngozi", "Tomorrow we will begin with one thing that went well this week. No preparation needed.", DAY),
    msg("university-friends", "chuka", "Game night on Friday. Bring snacks, not strategy.", 4 * HOUR),
    msg("university-friends", "folake", "I am bringing the Ludo board.", 3 * HOUR),
  ];
  // Everyone has read everything except the demo member, who has three unread (the design's Messages counter).
  const unreadFor = new Set([2, 4, 5]);
  for (const cm of convMembers) {
    const inConv = messages.filter((x) => x.conversation === cm.conversation);
    cm.last_read = cm.user === ME_ID ? inConv.filter((x) => !unreadFor.has(x.id)).pop()?.id ?? 0 : inConv[inConv.length - 1]?.id ?? 0;
  }

  // The design's three notifications (the header bell), newest first.
  const notices: DemoNotice[] = [
    { id: 1, recipient: ME_ID, kind: "collab_update", text: "Amara replied in Community Health Initiative", link: "/messages/amara", target_type: "conversation", target_id: "amara", actor: "amara-okafor", read: false, created_at: at(3 * MIN) },
    { id: 2, recipient: ME_ID, kind: "circle_invite", text: "Two places left: Starting a purpose-driven business", link: "/connect/kincircle?item=Starting%20a%20purpose-driven%20business", target_type: "circle", target_id: "kincircle-reflection", actor: null, read: false, created_at: at(HOUR) },
    { id: 3, recipient: ME_ID, kind: "announcement", text: "Reminder: Project Call with the Food Systems Cliq at 2:00 PM", link: "/messages/food-systems-cliq", target_type: "conversation", target_id: "food-systems-cliq", actor: null, read: false, created_at: at(2 * HOUR) },
  ];

  return {
    v: 1, seq: 1000, session: null, pending: null, users, communities, memberships,
    requests: [],
    invites: [],
    posts, comments, notices, circles, circleMembers,
    circleInvites: [],
    conversations, convMembers, messages, blocks: [],
  };
}
