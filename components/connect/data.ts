"use client";

import { faceSrc, photoSrc } from "@/components/kin/home/parts";
import { useAllProducts } from "@/components/shop/useShop";
import { useCollab } from "@/lib/collab/useCollab";
import { EVENTS, eventMeta, eventTag, type ConnectEvent } from "@/lib/connect/events";
import type { Interest } from "@/lib/connect/interests";
import { profilePath } from "@/lib/connect/profiles";
import { CIRCLES, STUDIOS, type Circle } from "@/lib/data/community";
import { allPeople, ME, PEOPLE, type Person, type PersonId } from "@/lib/data/people";
import { sortProducts } from "@/lib/data/shop";
import { STORIES } from "@/lib/data/stories";

/**
 * The cards of Discover and the pages it leads to (the design's connect/discover/data.ts), built from our own people,
 * circles, shop, open calls, studios, stories and events. Links go where the design's do: people to their profile,
 * events to their page, projects to the project, circles to their KinCircle page.
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
  { id: "people", title: "People", text: "Artists, creators and kindred spirits.", image: "/kin/discover/ngozi.jpg", href: "/collaborate/collaborators" },
  { id: "circles", title: "Circles", text: "Communities and shared interests.", image: "/kin/discover/kincircle.jpg", href: "/connect/kincircle" },
  { id: "stores", title: "Artworks & Stores", text: "Original work that's made-to-order.", image: "/kin/discover/explore-stores.jpg", href: "/make-sell" },
  { id: "projects", title: "Projects", text: "Collaborations and creative builds.", image: "/kin/discover/zine.jpg", href: "/collaborate/discover" },
  { id: "events", title: "Events", text: "Talks, workshops and gatherings.", image: "/kin/discover/event-workshop.jpg", href: PATHS.events },
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

export type PersonCard = { kind: "person"; id: string; person: string; name: string; image?: string; identity: string; text: string; href: string };
export type CircleCard = { kind: "circle"; id: string; circle: string; name: string; image: string; meta: string; text: string; href: string };
export type ArtCard = { kind: "artwork"; id: string; tag: string; title: string; maker: PersonId; makerHref: string; price: string; edition: string; image: string; href: string };
export type ItemCard = { kind: "project" | "studio" | "story" | "event"; id: string; tag: string; title: string; text: string; meta: string; image: string; action: string; href?: string };
export type Card = PersonCard | CircleCard | ArtCard | ItemCard;

export const personCard = (p: Person): PersonCard => ({ kind: "person", id: `person-${p.id}`, person: p.id, name: p.name, image: faceSrc(p.id as PersonId, 640) ?? p.photo ?? undefined, identity: [p.role, p.city].filter(Boolean).join(" · "), text: p.about, href: profilePath(p.id) });
export const circleCard = (c: Circle): CircleCard => ({ kind: "circle", id: `circle-${c.id}`, circle: c.id, name: c.name, image: photoSrc(c.photo), meta: `${c.members} members · ${c.active} active`, text: c.blurb, href: "/connect/kincircle" });
export const eventCard = (e: ConnectEvent): ItemCard => ({ kind: "event", id: `event-${e.id}`, tag: eventTag(e), title: e.title, text: e.summary, meta: eventMeta(e), image: photoSrc(e.photo), action: "View event", href: eventPath(e.id) });

/** Every card kind, from our data. */
export function useCardLists() {
  const { calls } = useCollab();
  const products = sortProducts(useAllProducts(), "new");
  const people = allPeople.filter((p) => p.id !== ME.id).map(personCard);
  const circles = CIRCLES.filter((c) => !c.joined).map(circleCard);
  const art: ArtCard[] = products.slice(0, 1).map((p) => ({ kind: "artwork", id: `artwork-${p.id}`, tag: p.category.toUpperCase(), title: p.title, maker: p.seller, makerHref: profilePath(p.seller), price: `$${p.price.toLocaleString()}`, edition: p.unique ? "1 of 1" : `${p.stock} available`, image: photoSrc(p.photos[0]), href: "/make-sell" }));
  const projects: ItemCard[] = calls.filter((c) => !c.postedByMe).map((c) => ({ kind: "project", id: `project-${c.id}`, tag: "PROJECT", title: c.title, text: c.summary, meta: `${PEOPLE[c.host]?.name ?? c.org} · ${c.teamSize} people`, image: photoSrc(c.photo), action: "View project", href: `/collaborate/projects/${c.id}` }));
  const studios: ItemCard[] = STUDIOS.map((v) => ({ kind: "studio", id: `studio-${v.id}`, tag: "STUDIO VISIT", title: `${first(v.artist)}'s studio`, text: v.blurb, meta: `${v.place} · ${v.when}`, image: photoSrc(v.photo), action: "Request a visit", href: "/explore/studio-visits" }));
  const stories: ItemCard[] = STORIES.map((s) => ({ kind: "story", id: `story-${s.id}`, tag: "STORY", title: s.title, text: s.excerpt, meta: `By ${PEOPLE[s.by]?.name ?? "a member"}`, image: photoSrc(s.photo), action: "Read story", href: "/explore/stories" }));
  const events = EVENTS.map(eventCard);
  return { people, circles, art, projects, studios, stories, events, calls };
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
  const people = interest.people.flatMap((id) => l.people.filter((c) => c.person === id));
  const circles = interest.circles.flatMap((id) => CIRCLES.filter((c) => c.id === id).map(circleCard));
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
