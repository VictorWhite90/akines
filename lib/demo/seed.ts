import { FACE, PHOTO } from "@/lib/data/images";

/** Everything the demo backend knows. Saved in the browser (localStorage) so a demo survives a refresh. */
export type DemoUser = {
  user_id: string; username: string | null; first_name: string; last_name: string; profile_photo: string | null;
  email: string; phone_number: string; bio: string; location: string; website: string; cover_photo: string | null;
  date_of_birth: string | null; interests: string[]; message_permission: "everyone" | "circles" | "nobody";
  show_in_search: boolean; is_2fa_set: boolean; created_at: string;
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
    [ME_ID]: { ...person(ME_ID, "Demo", "Member", "demo", null, "", "Abuja", 30), email: "demo@akines.test", phone_number: "+2348031234567", date_of_birth: "1996-04-12", interests: ["tech", "football"] },
    amaka: person("amaka", "Amaka", "Obi", "amakaobi", FACE.w5.src, "Product designer. Sunday runs and long lunches.", "Wuse 2, Abuja", 120),
    tunde: person("tunde", "Tunde", "Bello", "tundeb", FACE.m1.src, "Backend engineer. Five-a-side every Saturday.", "Jabi, Abuja", 90),
    zainab: person("zainab", "Zainab", "Musa", "zainabm", FACE.w8.src, "Writer and teacher. Always reading something.", "Maitama, Abuja", 200),
    chidi: person("chidi", "Chidi", "Eze", "chidieze", FACE.m2.src, "Photographer. Ask me about film cameras.", "Garki, Abuja", 60),
    ngozi: person("ngozi", "Ngozi", "Okafor", "ngozio", FACE.w9.src, "Runs the Come Alone Club meet-ups.", "Wuse 2, Abuja", 300),
    ifeanyi: person("ifeanyi", "Ifeanyi", "Nwosu", "ifeanyin", FACE.maleFace.src, "Accountant by day, board games by night.", "Gwarinpa, Abuja", 45),
    hauwa: person("hauwa", "Hauwa", "Abubakar", "hauwaa", FACE.w10.src, "Nurse. Learning to code on weekends.", "Kubwa, Abuja", 75),
  };

  const community = (c: Partial<DemoCommunity> & Pick<DemoCommunity, "id" | "name" | "category" | "area">): DemoCommunity => ({
    slug: c.id, tagline: "", about: "", city: "Abuja", cover_photo: null, instagram: "", whatsapp: "", visibility: "public", is_verified: false,
    guidelines: ["Be kind and specific.", "No selling without a leader's OK.", "What's shared here stays here."], invite_code: c.id.slice(0, 6).toUpperCase().padEnd(6, "X"),
    created_at: at(60 * DAY), closed: false, ...c,
  });
  const communities = [
    community({ id: "come-alone-club", name: "Come Alone Club Abuja", tagline: "Come alone, leave with friends.", about: "Monthly meet-ups for people new to Abuja or just new to making friends as an adult. Show up alone; we make sure nobody stays alone.", category: "social_hangouts", area: "Wuse 2", cover_photo: PHOTO.talkLaugh.src, instagram: "comealoneclub.abj", whatsapp: "+2348030001111", is_verified: true, invite_code: "CAC7MQ" }),
    community({ id: "wuse-tech-hangout", name: "Wuse Tech Hangout", tagline: "Builders, designers and the tech-curious.", about: "Weekly co-working, monthly demo nights and small study circles for anyone building with tech in Abuja.", category: "careers_business", area: "Wuse 2", cover_photo: PHOTO.kincircleHero.src, visibility: "private", invite_code: "WTH4K2" }),
    community({ id: "abuja-writers-room", name: "Abuja Writers Room", tagline: "Write together, read out loud.", about: "A private room for writers: monthly readings, feedback circles and accountability.", category: "books_writing", area: "Jabi", cover_photo: PHOTO.journalOpen.src, visibility: "private", invite_code: "AWR9PZ" }),
    community({ id: "jabi-lake-runners", name: "Jabi Lake Runners", tagline: "Saturday 6:30am, all paces welcome.", about: "We run (or walk) around Jabi Lake every Saturday morning, then breakfast.", category: "sports_fitness", area: "Jabi", cover_photo: PHOTO.calmWater.src, is_verified: true, invite_code: "JLR3TT" }),
    community({ id: "sunday-table", name: "Sunday Table", tagline: "Long lunches and real conversation.", about: "A table for eight, a different home each Sunday.", category: "food_conversation", area: "Maitama", cover_photo: PHOTO.talkCafe.src, invite_code: "STB5LN" }),
    community({ id: "gwarinpa-board-games", name: "Gwarinpa Board Games", tagline: "Catan, Ayo and everything between.", category: "games", area: "Gwarinpa", cover_photo: PHOTO.talkMugs.src, invite_code: "GBG8WE" }),
  ];

  const m = (community: string, user: string, role: "leader" | "member", ago: number): DemoMembership => ({ community, user, role, joined_at: at(ago) });
  const memberships = [
    m("come-alone-club", "ngozi", "leader", 60 * DAY), m("come-alone-club", "amaka", "member", 50 * DAY), m("come-alone-club", "zainab", "member", 40 * DAY),
    m("come-alone-club", "chidi", "member", 30 * DAY), m("come-alone-club", ME_ID, "member", 20 * DAY), m("come-alone-club", "hauwa", "member", 10 * DAY),
    m("wuse-tech-hangout", ME_ID, "leader", 25 * DAY), m("wuse-tech-hangout", "tunde", "leader", 25 * DAY), m("wuse-tech-hangout", "amaka", "member", 20 * DAY),
    m("wuse-tech-hangout", "hauwa", "member", 12 * DAY), m("wuse-tech-hangout", "ifeanyi", "member", 5 * DAY),
    m("abuja-writers-room", "zainab", "leader", 55 * DAY), m("abuja-writers-room", "chidi", "member", 30 * DAY),
    m("jabi-lake-runners", "tunde", "leader", 45 * DAY), m("jabi-lake-runners", "ngozi", "member", 40 * DAY), m("jabi-lake-runners", "amaka", "member", 20 * DAY),
    m("sunday-table", "amaka", "leader", 35 * DAY), m("sunday-table", "zainab", "member", 30 * DAY),
    m("gwarinpa-board-games", "ifeanyi", "leader", 15 * DAY), m("gwarinpa-board-games", "chidi", "member", 9 * DAY),
  ];

  const posts: DemoPost[] = [
    { id: 1, community: "come-alone-club", author: "ngozi", kind: "announcement", body: "October meet-up: Saturday 26th, 4pm at Jabi Lake Mall. We'll have name tags and a few icebreakers, so come alone and we'll take it from there.", images: [{ id: 1, url: PHOTO.talkGroup.src }], is_pinned: true, edited_at: null, created_at: at(2 * DAY), removed: false, hearts: ["amaka", "zainab", "chidi", ME_ID] },
    { id: 2, community: "come-alone-club", author: "amaka", kind: "discussion", body: "First time coming on Saturday. Anyone else nervous? Would love to say hi before so I know at least one face.", images: [], is_pinned: false, edited_at: null, created_at: at(20 * HOUR), removed: false, hearts: ["hauwa"] },
    { id: 3, community: "come-alone-club", author: "chidi", kind: "discussion", body: "Photos from last month's picnic. Thanks for letting me shoot, everyone.", images: [{ id: 2, url: PHOTO.talkYoung.src }, { id: 3, url: PHOTO.talkTwo.src }], is_pinned: false, edited_at: null, created_at: at(4 * DAY), removed: false, hearts: ["ngozi", "amaka", "zainab"] },
    { id: 4, community: "wuse-tech-hangout", author: ME_ID, kind: "announcement", body: "Welcome to Wuse Tech Hangout! Co-working is every Wednesday from 10am at the hub on Aminu Kano Crescent. Demo night is the last Friday of the month.", images: [], is_pinned: true, edited_at: null, created_at: at(6 * DAY), removed: false, hearts: ["tunde", "amaka", "hauwa"] },
    { id: 5, community: "wuse-tech-hangout", author: "hauwa", kind: "discussion", body: "Any recommendations for learning JavaScript properly? I've done a few YouTube courses but want something structured.", images: [], is_pinned: false, edited_at: null, created_at: at(9 * HOUR), removed: false, hearts: [] },
    { id: 6, community: "jabi-lake-runners", author: "tunde", kind: "announcement", body: "This Saturday we start at 6:30am sharp at the boat club gate. 5km route, walkers welcome.", images: [{ id: 4, url: PHOTO.calmBench.src }], is_pinned: true, edited_at: null, created_at: at(1 * DAY), removed: false, hearts: ["ngozi"] },
  ];
  const comments: DemoComment[] = [
    { id: 1, post: 2, author: "zainab", body: "Not nervous at all now that I know you're coming! I'll be the one in the yellow headwrap.", created_at: at(18 * HOUR), removed: false },
    { id: 2, post: 2, author: ME_ID, body: "Same here, first one for me too. See you there.", created_at: at(16 * HOUR), removed: false },
    { id: 3, post: 5, author: "tunde", body: "The Odin Project is free and very structured. Happy to pair on Wednesdays.", created_at: at(7 * HOUR), removed: false },
    { id: 4, post: 4, author: "amaka", body: "Can't wait for demo night!", created_at: at(5 * DAY), removed: false },
  ];

  const conversations = [{ id: "conv-code-club", kind: "circle" as const, title: "Saturday Code Club", closed: false }];
  const circles: DemoCircle[] = [
    { id: "saturday-code-club", community: "wuse-tech-hangout", name: "Saturday Code Club", purpose: "We build one small project every Saturday morning at the hub. Bring a laptop.", kind: "study", join_mode: "open", capacity: 6, agreements: ["We show up as ourselves, not a performance.", "Laptops open, phones down."], conversation: "conv-code-club", created_at: at(10 * DAY), closed: false },
    { id: "demo-night-crew", community: "wuse-tech-hangout", name: "Demo Night Crew", purpose: "Planning the monthly demo night: venue, speakers, snacks.", kind: "project", join_mode: "invite", capacity: 4, agreements: ["We let the circle know if we can't make it."], conversation: "conv-demo-night", created_at: at(3 * DAY), closed: false },
    { id: "first-timers", community: "come-alone-club", name: "First-timers Five", purpose: "For anyone coming to their first meet-up. We'll find each other at the door.", kind: "friendship", join_mode: "open", capacity: 5, agreements: ["We show up as ourselves, not a performance."], conversation: "conv-first-timers", created_at: at(1 * DAY), closed: false },
  ];
  conversations.push({ id: "conv-demo-night", kind: "circle", title: "Demo Night Crew", closed: false }, { id: "conv-first-timers", kind: "circle", title: "First-timers Five", closed: false });
  const circleMembers: DemoCircleMember[] = [
    { circle: "saturday-code-club", user: ME_ID, role: "host", joined_at: at(10 * DAY) }, { circle: "saturday-code-club", user: "tunde", role: "member", joined_at: at(9 * DAY) },
    { circle: "saturday-code-club", user: "hauwa", role: "member", joined_at: at(8 * DAY) }, { circle: "saturday-code-club", user: "amaka", role: "member", joined_at: at(6 * DAY) },
    { circle: "demo-night-crew", user: "tunde", role: "host", joined_at: at(3 * DAY) }, { circle: "demo-night-crew", user: "ifeanyi", role: "member", joined_at: at(2 * DAY) },
    { circle: "first-timers", user: "amaka", role: "host", joined_at: at(1 * DAY) }, { circle: "first-timers", user: "hauwa", role: "member", joined_at: at(20 * HOUR) },
  ];
  const convMembers: DemoConvMember[] = circleMembers.map((x) => ({
    conversation: circles.find((c) => c.id === x.circle)!.conversation, user: x.user, role: x.role === "host" ? "admin" : "member", last_read: 0,
  }));
  let mid = 0;
  const msg = (conversation: string, sender: string | null, body: string, ago: number, kind: DemoMessage["kind"] = "text"): DemoMessage =>
    ({ id: ++mid, conversation, sender, kind: sender ? kind : "system", body, image: null, reply_to: null, client_id: "", removed: false, created_at: at(ago) });
  const messages: DemoMessage[] = [
    msg("conv-code-club", null, "Demo started Saturday Code Club.", 10 * DAY),
    msg("conv-code-club", null, "Tunde joined the circle.", 9 * DAY),
    msg("conv-code-club", null, "Hauwa joined the circle.", 8 * DAY),
    msg("conv-code-club", ME_ID, "Welcome both! This Saturday: a tiny to-do app, start to finish.", 8 * DAY - HOUR),
    msg("conv-code-club", null, "Amaka joined the circle.", 6 * DAY),
    msg("conv-code-club", "tunde", "I'll bring the extension cable this time 😅", 2 * DAY),
    msg("conv-code-club", "hauwa", "Can we do something with an API this week? I want to understand fetch properly.", 5 * HOUR),
    msg("conv-code-club", "amaka", "Yes please. I can design the screens if someone builds it.", 3 * HOUR),
    msg("conv-demo-night", null, "Tunde started Demo Night Crew.", 3 * DAY),
    msg("conv-first-timers", null, "Amaka started First-timers Five.", DAY),
  ];
  // Everyone has read everything except the demo member, who has two unread in the code club.
  for (const cm of convMembers) {
    const inConv = messages.filter((x) => x.conversation === cm.conversation);
    cm.last_read = cm.user === ME_ID ? inConv[inConv.length - 3]?.id ?? 0 : inConv[inConv.length - 1]?.id ?? 0;
  }

  const notices: DemoNotice[] = [
    { id: 1, recipient: ME_ID, kind: "community_invite", text: "Tunde Bello invited you to join Jabi Lake Runners.", link: "/circles/community/jabi-lake-runners", target_type: "community_invite", target_id: "1", actor: "tunde", read: false, created_at: at(3 * HOUR) },
    { id: 2, recipient: ME_ID, kind: "announcement", text: "Ngozi Okafor posted an announcement in Come Alone Club Abuja.", link: "/circles/community/come-alone-club?post=1", target_type: "community_post", target_id: "1", actor: "ngozi", read: false, created_at: at(2 * DAY) },
    { id: 3, recipient: ME_ID, kind: "circle_invite", text: "Tunde invited you to the circle Demo Night Crew in Wuse Tech Hangout.", link: "/circles/community/wuse-tech-hangout/circles/demo-night-crew", target_type: "circle_invite", target_id: "1", actor: "tunde", read: false, created_at: at(5 * HOUR) },
    { id: 4, recipient: ME_ID, kind: "post_comment", text: "Amaka Obi commented on your post in Wuse Tech Hangout.", link: "/circles/community/wuse-tech-hangout?post=4", target_type: "community_post", target_id: "4", actor: "amaka", read: true, created_at: at(5 * DAY) },
  ];

  return {
    v: 1, seq: 1000, session: null, pending: null, users, communities, memberships,
    requests: [{ id: 1, community: "wuse-tech-hangout", user: "chidi", message: "I shoot product photos for startups, would love to join.", requested_at: at(6 * HOUR), status: "pending" }],
    invites: [{ id: 1, community: "jabi-lake-runners", inviter: "tunde", invitee: ME_ID, status: "pending" }],
    posts, comments, notices, circles, circleMembers,
    circleInvites: [{ id: 1, circle: "demo-night-crew", inviter: "tunde", invitee: ME_ID, status: "pending" }],
    conversations, convMembers, messages, blocks: [],
  };
}
