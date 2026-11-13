"use client";

import { photoSrc } from "@/components/kin/home/parts";
import { useCollab } from "@/lib/collab/useCollab";
import { circleAccess, type CircleAccess } from "@/lib/connect/circles";
import { DISCOVER_ARTWORK, DISCOVER_CIRCLES, DISCOVER_PEOPLE, DISCOVER_PROJECTS, DISCOVER_STORIES, DISCOVER_STUDIOS, FOR_YOU_PEOPLE, designImg, type DiscoverCircle, type DiscoverItem, type DiscoverPerson } from "@/lib/connect/discover";
import { EVENTS, eventMeta, eventTag, type ConnectEvent } from "@/lib/connect/events";
import type { Interest } from "@/lib/connect/interests";
import { profilePath } from "@/lib/connect/profiles";
import { DEMO } from "@/lib/demo/mode";
import { PEOPLE, type PersonId } from "@/lib/data/people";
import { SOON, soon } from "@/lib/soon";

/**
 * The cards of Discover and the pages it leads to (the design's connect/discover/data.ts), with the design's people, circles,
 * artwork, projects, studio visits, stories and events (lib/connect/discover, events). Links go where the design's do: people to
 * their profile, events to their page, A Better Way to Learn to its project. Outside preview, projects are the open calls of the
 * backend, and the sample "N Kin connections" counts are left out.
 */
export const PATHS = {
  discover: "/connect",
  explore: "/connect/explore",
  forYou: "/connect/for-you",
  interests: "/connect/interests",
  events: "/connect/events",
  suggestions: "/connect/discover/suggestions",
  startProject: "/collaborate/start",
} as const;
export const interestPath = (id: string) => `/connect/interests/${id}`;
export const eventPath = (id: string) => `/connect/events/${id}`;

export const first = (id: string) => PEOPLE[id as PersonId]?.name.split(" ")[0] ?? "";

export const EXPLORE: { id: string; title: string; text: string; image: string; href?: string }[] = [
  { id: "people", title: "People", text: "Artists, creators and kindred spirits.", image: designImg("community/av-ngozi"), href: PATHS.suggestions },
  { id: "circles", title: "Circles", text: "Communities and shared interests.", image: designImg("community/av-kincircle"), href: SOON.kincircle },
  { id: "stores", title: "Artworks & Stores", text: "Original work that's made-to-order.", image: designImg("discover/explore-stores"), href: SOON.shop },
  { id: "projects", title: "Projects", text: "Collaborations and creative builds.", image: designImg("community/zine"), href: "/collaborate/discover" },
  { id: "events", title: "Events", text: "Talks, workshops and gatherings.", image: designImg("discover/event-workshop"), href: PATHS.events },
];

export const FILTERS = [
  { key: "all", label: "All" },
  { key: "people", label: "People" },
  { key: "circles", label: "Circles" },
  { key: "projects", label: "Projects" },
  { key: "studio-visits", label: "Studio Visits" },
  { key: "stories", label: "Stories" },
  { key: "events", label: "Events" },
] as const;
export type Filter = (typeof FILTERS)[number]["key"];

export type PersonCard = { kind: "person"; id: string; person: string; name: string; image?: string; identity: string; text: string; href: string; connections?: string };
export type CircleCard = { kind: "circle"; id: string; circle: string; name: string; image: string; meta: string; text: string; href: string; access: CircleAccess };
export type ArtCard = { kind: "artwork"; id: string; tag: string; title: string; maker: PersonId; makerHref: string; price: string; edition: string; image: string; href: string };
export type ItemCard = { kind: "project" | "studio" | "story" | "event"; id: string; tag: string; title: string; text: string; meta: string; image: string; action: string; href?: string };
export type Card = PersonCard | CircleCard | ArtCard | ItemCard;

export const personCard = (d: DiscoverPerson): PersonCard => {
  const p = PEOPLE[d.person];
  return { kind: "person", id: `person-${d.person}`, person: d.person, name: p.name, image: d.image, identity: [p.role, p.city].filter(Boolean).join(" · "), text: d.text, href: profilePath(d.person), connections: DEMO ? d.connections : undefined };
};
export const circleCard = (c: DiscoverCircle): CircleCard => ({ kind: "circle", id: `circle-${c.id}`, circle: c.id, name: c.name, image: c.image, meta: `${c.members} members · ${c.active} active`, text: c.text, href: soon(SOON.kincircle, c.name), access: circleAccess(c.id) });
export const eventCard = (e: ConnectEvent): ItemCard => ({ kind: "event", id: `event-${e.id}`, tag: eventTag(e), title: e.title, text: e.summary, meta: eventMeta(e), image: photoSrc(e.photo), action: "View event", href: eventPath(e.id) });
const item = (kind: ItemCard["kind"], tag: string, action: string) => (d: DiscoverItem): ItemCard => ({ kind, id: `${kind}-${d.id}`, tag, title: d.title, text: d.text, meta: d.meta, image: d.image, action, href: d.href });

/** Every card kind. */
export function useCardLists() {
  const { calls } = useCollab();
  const all = DISCOVER_PEOPLE.map(personCard);
  const people = all.slice(0, FOR_YOU_PEOPLE);
  const circles = DISCOVER_CIRCLES.map(circleCard);
  const a = DISCOVER_ARTWORK;
  const art: ArtCard[] = [{ kind: "artwork", id: `artwork-${a.id}`, tag: a.tag, title: a.title, maker: a.maker, makerHref: profilePath(a.maker), price: a.price, edition: a.edition, image: a.image, href: a.href }];
  const projects: ItemCard[] = DEMO
    ? DISCOVER_PROJECTS.map(item("project", "PROJECT", "View project"))
    : calls.filter((c) => !c.postedByMe).map((c) => ({ kind: "project", id: `project-${c.id}`, tag: "PROJECT", title: c.title, text: c.summary, meta: `${PEOPLE[c.host]?.name ?? c.org} · ${c.teamSize} people`, image: photoSrc(c.photo), action: "View project", href: `/collaborate/projects/${c.id}` }));
  const studios = DISCOVER_STUDIOS.map(item("studio", "STUDIO VISIT", "Request a visit"));
  const stories = DISCOVER_STORIES.map(item("story", "STORY", "Read story"));
  const events = EVENTS.map(eventCard);
  return { all, people, circles, art, projects, studios, stories, events, calls };
}

const pick = <T,>(list: T[], i: number) => list[i];
const KIND: Record<Exclude<Filter, "all">, Card["kind"]> = { people: "person", circles: "circle", projects: "project", "studio-visits": "studio", stories: "story", events: "event" };

/** The Discover block: nine cards for All (two people and two circles around one of everything else), three or six for a kind. */
export function useForYou(): Record<Filter, Card[]> {
  const l = useCardLists();
  const all = [l.people[0], l.circles[0], l.art[0], l.projects[0], l.studios[0], l.stories[0], l.events[0], l.people[1], l.circles[1]].filter(Boolean);
  return { all, people: l.people.slice(0, 6), circles: l.circles.slice(0, 6), projects: l.projects.slice(0, 3), "studio-visits": l.studios.slice(0, 3), stories: l.stories.slice(0, 3), events: l.events.slice(0, 3) };
}

/** For you, all (11.67): the design's eighteen cards in its order, three columns of six rows; a chip keeps its kind. */
export function useForYouAll(): (filter: Filter) => Card[] {
  const l = useCardLists();
  const all = [
    pick(l.people, 0), pick(l.circles, 0), pick(l.art, 0),
    pick(l.projects, 0), pick(l.studios, 0), pick(l.stories, 0),
    pick(l.events, 0), pick(l.people, 1), pick(l.circles, 1),
    pick(l.projects, 1), pick(l.people, 2), pick(l.stories, 1),
    pick(l.studios, 1), pick(l.events, 1), pick(l.circles, 2),
    pick(l.people, 3), pick(l.events, 2), pick(l.circles, 3),
  ].filter(Boolean) as Card[];
  return (filter) => (filter === "all" ? all : all.filter((c) => c.kind === KIND[filter]));
}

export const INTEREST_FILTERS = [
  { key: "all", label: "All" },
  { key: "people", label: "People" },
  { key: "circles", label: "Circles" },
  { key: "projects", label: "Projects" },
  { key: "events", label: "Events" },
] as const;
export type InterestFilter = (typeof INTEREST_FILTERS)[number]["key"];

/** The cards filed under an interest, interleaved as the design draws them (a person, a circle, a project, an event, again). */
export function useInterestCards(interest: Interest | undefined): (filter: InterestFilter) => Card[] {
  const l = useCardLists();
  if (!interest) return () => [];
  const people = interest.people.flatMap((id) => l.all.filter((c) => c.person === id));
  const circles = interest.circles.flatMap((id) => l.circles.filter((c) => c.circle === id));
  const projects = interest.projects.flatMap((id) => l.projects.filter((c) => c.id === `project-${id}`));
  const events = interest.events.flatMap((id) => l.events.filter((c) => c.id === `event-${id}`));
  const lists: Card[][] = [people, circles, projects, events];
  const all: Card[] = [];
  for (let i = 0; i < Math.max(...lists.map((x) => x.length)); i++) lists.forEach((x) => { if (x[i]) all.push(x[i]); });
  const by: Record<InterestFilter, Card[]> = { all, people, circles, projects, events };
  return (filter) => by[filter];
}

const WORDS = ["No", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve"];
export const countWord = (n: number) => WORDS[n] ?? String(n);
