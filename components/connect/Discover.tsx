"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { IconButton } from "@/components/kin/Button";
import { INTERESTS } from "@/lib/connect/interests";
import { RECOMMENDATIONS } from "@/lib/connect/discover";
import { AssistantMark, CardView, ExploreCard, InterestCard, RecCard, reduced, revealFocused } from "./cards";
import { EXPLORE, FILTERS, PATHS, useForYou, type Filter } from "./data";
import { DiscoverRail, Section } from "./parts";
import { CardsSkeleton, DiscoverSkeleton, EmptyText, LOADING_MS, RETRY_MS, SectionError, STATE_COPY } from "./States";

/*
 * Connect, Discover, mirrored from the product design (classes in discover.css, with Community Home's in home.css):
 * a row of places to explore, a filterable mix of what suits you, interests, people to meet, and the same rail as
 * Community Home. Every card shows the design's people, circles, artwork, projects, studios, stories and events, and leads
 * to the pages the design wires (Explore all, For you, interests, events, suggestions and profiles).
 */

function Explore() {
  const row = useRef<HTMLUListElement>(null);
  const go = (to: "previous" | "next") => { const s = row.current; if (s) s.scrollTo({ left: to === "next" ? s.scrollWidth - s.clientWidth : 0, behavior: reduced() ? "auto" : "smooth" }); };
  return (
    <section className="fd-section dx-section" id="dx-explore" aria-labelledby="dx-title-explore" data-dx-section="explore">
      <header className="dxe-head" data-m="up">
        {/* The header row leads to Explore all: the title is the link, stretched over the row; the arrows sit above it */}
        <h2 className="fd-head__title" id="dx-title-explore"><Link className="dxe-headlink" href={PATHS.explore}>Explore</Link></h2>
        <div className="dxe-arrows">
          <IconButton variant="ghost" className="fd-arrow" label="Previous categories" tooltip={false} aria-controls="dx-explore-cards" onClick={() => go("previous")}><ChevronLeft size={24} strokeWidth={1.5} /></IconButton>
          <IconButton variant="ghost" className="fd-arrow" label="Next categories" tooltip={false} aria-controls="dx-explore-cards" onClick={() => go("next")}><ChevronRight size={24} strokeWidth={1.5} /></IconButton>
        </div>
      </header>
      <ul className="dxe-scroller" id="dx-explore-cards" ref={row} onFocus={revealFocused}>
        {EXPLORE.map((c, i) => <li key={c.id} className="dxe-item" style={{ ["--i" as string]: i } as React.CSSProperties}><ExploreCard c={c} eager={i < 4} priority={i === 0} /></li>)}
      </ul>
    </section>
  );
}

function ForYou({ filter, setFilter }: { filter: Filter; setFilter: (f: Filter) => void }) {
  const cards = useForYou();
  // Set while rendering: once the filter changed, the page reveal is over and a polite status says what the grid shows now.
  const [shown, setShown] = useState(filter);
  const [swapped, setSwapped] = useState(false);
  const [status, setStatus] = useState("");
  if (shown !== filter) {
    setShown(filter);
    setSwapped(true);
    setStatus(`Showing ${FILTERS.find((x) => x.key === filter)?.label ?? filter}, ${cards[filter].length} cards.`);
  }
  return (
    <Section id="for-you" title="For you on Akines" support="A mix of people, circles, projects and stories based on your interests and activity." link={{ label: "Explore all", href: PATHS.forYou }}>
      <div className="dxf">
        <div className="dxf-filters" role="group" aria-label="Filter For you on Akines" data-m="up">
          {FILTERS.map((f) => <button key={f.key} type="button" className="dxf-chip" aria-pressed={filter === f.key} onClick={() => setFilter(f.key)}>{f.label}</button>)}
        </div>
        <p className="sr-only" role="status">{status}</p>
        {/* A new filter swaps the grid in place; only the first grid plays the scroll reveal. */}
        <ul key={filter} className={swapped ? "dxf-grid dxf-grid--swap" : "dxf-grid"} role="list" data-m={swapped ? undefined : "stagger"}>
          {cards[filter].map((c) => <li key={c.id} className="dxf-cell"><CardView card={c} reveal={!swapped} /></li>)}
        </ul>
      </div>
    </Section>
  );
}

function Interests({ empty }: { empty?: boolean }) {
  return (
    <Section id="interests" title="Explore by interest" support="Dive into what moves you. Find people, circles and content around the things you love." link={{ label: "Explore all", href: PATHS.interests }}>
      {empty ? (
        <p className="dxi-empty">{STATE_COPY.interestsEmpty}</p>
      ) : (
        <ul className="dxi-row" data-m="stagger" onFocus={revealFocused}>
          {INTERESTS.slice(0, 4).map((r) => <li key={r.id} className="dxi-item"><InterestCard interest={r} /></li>)}
        </ul>
      )}
    </Section>
  );
}

function Recommendations({ empty, failing }: { empty?: boolean; failing?: boolean }) {
  const list = empty ? [] : RECOMMENDATIONS.slice(0, 4);
  // The error state: "Try again" shows the cards' skeleton for RETRY_MS, then the live cards; the other sections are untouched.
  const [phase, setPhase] = useState<"error" | "loading" | "live">(failing ? "error" : "live");
  useEffect(() => {
    if (phase !== "loading") return;
    const t = window.setTimeout(() => setPhase("live"), RETRY_MS);
    return () => window.clearTimeout(t);
  }, [phase]);
  return (
    <Section id="recommendations" className="dxr-section" title="People whose journeys complement yours" support="Meet people for a reason, not by chance." link={{ label: "See all", href: PATHS.suggestions }}>
      <p className="dxr-label"><AssistantMark /><span>AI Suggestion</span></p>
      {phase === "error" ? (
        <SectionError onRetry={() => setPhase("loading")} />
      ) : phase === "loading" ? (
        <CardsSkeleton cards={4} />
      ) : list.length === 0 ? (
        <EmptyText>{STATE_COPY.recommendationsEmpty}</EmptyText>
      ) : (
        <div className="dxr-cards">
          <ul className="dxr-grid">{list.map((m, i) => <RecCard key={m.id} rec={m} index={i} />)}</ul>
        </div>
      )}
    </Section>
  );
}

export type DiscoverState = "loading" | "error" | "empty";

/**
 * `state` is one of the design's three state routes (they open with the filter All):
 *  - loading: Explore, the rail and the page chrome are live; the other three sections show their skeletons, then the live sections after LOADING_MS.
 *  - error: People whose journeys complement yours shows the error panel under its heading; "Try again" reloads that section only.
 *  - empty: the empty states of Your circles, You two would get along, Explore by interest and the recommendations.
 */
export default function Discover({ state }: { state?: DiscoverState }) {
  const asked = useSearchParams().get("filter");
  const initial: Filter = FILTERS.some((f) => f.key === asked) ? (asked as Filter) : "all";
  const [filter, setFilter] = useState<Filter>(initial);
  const [entered, setEntered] = useState(initial);
  if (entered !== initial) { setEntered(initial); setFilter(initial); }
  const [settled, setSettled] = useState(state !== "loading");
  useEffect(() => {
    if (state !== "loading") return;
    const t = window.setTimeout(() => setSettled(true), LOADING_MS);
    return () => window.clearTimeout(t);
  }, [state]);
  // "Find circles" in the empty Your circles card: show the Circles filter of For you on Akines and bring that section into view.
  const findCircles = () => {
    setFilter("circles");
    document.getElementById("dx-for-you")?.scrollIntoView({ behavior: reduced() ? "auto" : "smooth", block: "start" });
  };
  return (
    <div className="fd-page dx-feed" data-discover-state={state}>
      <div className="dx-body">
        <div className="dx-column">
          <Explore />
          {settled ? (
            <>
              <ForYou filter={filter} setFilter={setFilter} />
              <Interests empty={state === "empty"} />
              <Recommendations empty={state === "empty"} failing={state === "error"} />
            </>
          ) : (
            <DiscoverSkeleton />
          )}
        </div>
        <DiscoverRail empty={state === "empty"} onFindCircles={findCircles} />
      </div>
    </div>
  );
}
