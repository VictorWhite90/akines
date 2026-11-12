import type { PersonId } from "./people";

/** One suggested person, with the reason for it stated plainly. */
export type Match = { id: PersonId; reason: string; signals: string[]; opener: string; ask?: string };

/**
 * "You two would get along": the design's seven matches (community/feed/content.ts MATCHES), word for word. `reason` is the
 * line on the card; `signals` and `ask` are the tags and conversation prompt Connect Discover gives the same person.
 */
export const MATCHES: Match[] = [
  { id: "ayo-balogun", reason: "You both see textiles as living archives.", signals: ["Textiles", "Cultural heritage", "Visual storytelling"], ask: "Ask about the dye yard in Ibadan: what does it smell like, and who taught her?", opener: "Hello Ayo. I keep thinking about textiles as living archives. What are you dyeing at the moment?" },
  { id: "amara-okafor", reason: "You both believe a poem can host a whole evening.", signals: ["Painting", "Conversation", "Place"], ask: "Ask how a room changes what people say to each other.", opener: "Hello Amara. I believe a poem can host a whole evening too. Which room are you painting at the moment?" },
  { id: "yusuf-umar", reason: "You both want collaboration that challenges an idea without flattening it.", signals: ["Collaboration", "Sound", "Craft"], ask: "Ask what he would build first if the idea could be tested in a day.", opener: "Hello Yusuf. I like collaboration that challenges an idea without flattening it. What are you testing this week?" },
  { id: "ngozi", reason: "You both write to remember the people in your lives.", signals: ["Zines", "Memory", "Cities"], ask: "Ask which neighbourhood she has not written about yet, and why.", opener: "Hello Ngozi. I write to remember people too. Which neighbourhood is your next zine about?" },
  { id: "tunde-bakare", reason: "You both prefer practical, small-group work.", signals: ["Health", "Listening", "Design"], ask: "Ask how he decides which small group to start with.", opener: "Hello Tunde. I prefer practical, small-group work too. Which group are you starting with?" },
  { id: "chuka", reason: "You both like thinking an idea through with one person at a time.", signals: ["Making", "Founders", "Ideas"], ask: "Ask what he would make first if no one were watching.", opener: "Hello Chuka. I like thinking an idea through with one person at a time. What are you building at the moment?" },
  { id: "folake", reason: "You both keep Sunday for slow walks and long talks.", signals: ["Stories", "Walking", "Lagos"], ask: "Ask where her slow Sunday walks usually end up.", opener: "Hello Folake. I keep Sunday for slow walks too. Where did your last one end up?" },
];
