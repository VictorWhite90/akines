"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/kin/Field";
import { EVENTS, EVENT_FILTERS, eventsEmptyText, eventsFor, type EventFilter } from "@/lib/connect/events";
import { INTERESTS, interestById } from "@/lib/connect/interests";
import { RECOMMENDATIONS } from "@/lib/connect/discover";
import { ExploreCard, InterestCard, RecCard } from "./cards";
import { EXPLORE, FILTERS, INTEREST_FILTERS, PATHS, countWord, eventCard, useForYouAll, useInterestCards, type Filter, type InterestFilter } from "./data";
import { FilterBlock, ListPage, NoResults } from "./parts";

/**
 * The pages Discover leads to, mirrored from the product design (connect/discover/lists.tsx, frames 11.66 to 11.72):
 * Explore all, For you, All interests, one interest, Events and All suggestions. Each takes the props its state route needs.
 */

/** Explore all (11.66): the search field (plain: the design has no results for it) and the five Explore cards. */
export function ExploreAll() {
  return (
    <ListPage wide title="Explore" support="Find people, circles, work, projects and events.">
      <Input type="search" className="dxl-search" iconLeft={<Search size={20} strokeWidth={1.25} absoluteStrokeWidth aria-hidden focusable={false} />} placeholder="Search people, circles, work and events" aria-label="Search people, circles, work and events" autoComplete="off" enterKeyHint="search" />
      <ul className="dxe-grid" data-m="stagger">
        {EXPLORE.map((c, i) => <li key={c.id} style={{ ["--i" as string]: i } as React.CSSProperties}><ExploreCard c={c} eager={i < 3} priority={i === 0} /></li>)}
      </ul>
    </ListPage>
  );
}

/** For you (11.67): the seven chips and the eighteen cards. `empty` is the No results state route (Studio Visits on). */
export function ForYouAll({ initial = "all", empty }: { initial?: Filter; empty?: boolean }) {
  const cardsFor = useForYouAll();
  const [filter, setFilter] = useState<Filter>(initial);
  const [forced, setForced] = useState(!!empty);
  const label = FILTERS.find((f) => f.key === filter)?.label ?? filter;
  return (
    <ListPage title="For you on Akines" support="A mix of people, circles, projects and stories based on your interests and activity.">
      <FilterBlock
        name="Filter For you on Akines"
        chips={FILTERS}
        value={filter}
        onSelect={(k) => { setForced(false); setFilter(k); }}
        cards={forced ? [] : cardsFor(filter)}
        none={<NoResults text={`No ${label.toLowerCase()} to show right now. Try another filter, or come back soon.`} action={{ label: "Show all of For you", onClick: () => { setForced(false); setFilter("all"); } }} />}
      />
    </ListPage>
  );
}

/** All interests (11.68): the twelve interest cards. */
export function AllInterests() {
  return (
    <ListPage title="Explore by interest" support="Dive into what moves you. Find people, circles and content around the things you love.">
      <ul className="dxi-grid" data-m="stagger">{INTERESTS.map((it) => <li key={it.id}><InterestCard interest={it} /></li>)}</ul>
    </ListPage>
  );
}

/** One interest (11.69): chips All, People, Circles, Projects and Events. `empty` is the No results state route (Projects on). */
export function InterestPage({ id, initial = "all", empty }: { id: string; initial?: InterestFilter; empty?: boolean }) {
  const interest = interestById(id);
  const cardsFor = useInterestCards(interest);
  const [filter, setFilter] = useState<InterestFilter>(initial);
  const [forced, setForced] = useState(!!empty);
  if (!interest) return <ListPage title="Interest not found" support="This interest is not on Akines any more."><NoResults text="Look at every interest instead." action={{ label: "Show all interests", href: PATHS.interests }} /></ListPage>;
  const cards = forced ? [] : cardsFor(filter);
  const label = INTEREST_FILTERS.find((f) => f.key === filter)?.label ?? filter;
  const text = filter === "projects" ? `No projects in ${interest.title} yet. Start one and invite collaborators.` : `No ${filter === "all" ? "people, circles, projects or events" : label.toLowerCase()} in ${interest.title} yet.`;
  return (
    <ListPage title={interest.title} support={interest.text}>
      <FilterBlock
        name={`Filter ${interest.title}`}
        chips={INTEREST_FILTERS}
        value={filter}
        onSelect={(k) => { setForced(false); setFilter(k); }}
        cards={cards}
        none={filter === "projects" ? <NoResults text={text} action={{ label: "Start a project", href: PATHS.startProject }} /> : <NoResults text={text} action={{ label: "Show all interests", href: PATHS.interests }} />}
      />
    </ListPage>
  );
}

/** Events (11.70): every upcoming event; no chip is on at first, pressing the chip that is on turns it off. */
export function EventsPage({ initial = null, empty }: { initial?: EventFilter | null; empty?: boolean }) {
  const [filter, setFilter] = useState<EventFilter | null>(initial);
  const [forced, setForced] = useState(!!empty);
  const cards = forced ? [] : eventsFor(filter).map(eventCard);
  return (
    <ListPage title="Events" support="Talks, workshops and gatherings.">
      <FilterBlock
        name="Filter events"
        chips={EVENT_FILTERS}
        value={filter}
        onSelect={(key) => { setForced(false); setFilter((f) => (f === key ? null : key)); }}
        cards={EVENTS.length ? cards : []}
        none={<NoResults text={filter ? eventsEmptyText(filter) : "No events to show right now."} action={{ label: "Show all events", onClick: () => { setForced(false); setFilter(null); } }} />}
      />
    </ListPage>
  );
}

/** All suggestions (11.72): every Someone to meet card. `empty` is the Empty state route. */
export function Suggestions({ empty }: { empty?: boolean }) {
  const list = empty ? [] : RECOMMENDATIONS;
  return (
    <ListPage title="People whose journeys complement yours" support={`${countWord(RECOMMENDATIONS.length)} people, chosen for what you are working on.`}>
      {list.length === 0 ? (
        <p className="dxs-empty">No suggestions right now. We will add people as your journey grows.</p>
      ) : (
        <div className="dxr-cards"><ul className="dxr-grid">{list.map((m, i) => <RecCard key={m.id} rec={m} index={i} />)}</ul></div>
      )}
    </ListPage>
  );
}
