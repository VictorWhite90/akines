"use client";

import { CircleAlert } from "lucide-react";
import Button from "@/components/kin/Button";

/**
 * Loading, empty and error parts of Discover, mirrored from the product design (connect/discover/states.tsx; classes dxs- in discover.css).
 *  - Loading: DiscoverSkeleton stands in for For you, Explore by interest and the recommendations (Explore and the rail stay live).
 *    There is no visible note, so the status is announced to assistive technology only.
 *  - Error: SectionError, the Community Home error panel with the Discover message.
 *  - Empty: EmptyText (Section Empty), EmptyCircles and EmptyMatch (rail).
 */

export const LOADING_NOTE = "Getting things ready";
/** The loading state route shows the skeletons for this long and then continues to the live sections. */
export const LOADING_MS = 1500;
/** How long "Try again" shows the skeleton before the recommendations come back. */
export const RETRY_MS = 900;

export const STATE_COPY = {
  circlesEmpty: { title: "Your circles", text: "Your circles will appear here when you join one.", link: "Find circles" },
  matchEmpty: "We're finding people who may be relevant to you.",
  interestsEmpty: "There isn't anything to show here yet.",
  recommendationsEmpty: "We're finding people who may be relevant to you.",
  sectionError: { title: "We could not load this section.", text: "Check your connection and try again. The rest of this page is still here.", retry: "Try again" },
};

/* ---------------------------------------------------------------- loading */
function HeaderSkeleton() {
  return (
    <div className="dxs-head">
      <span className="dxs-bar dxs-head__title" />
      <span className="dxs-bar dxs-head__support" />
    </div>
  );
}

function DiscoverCardSkeleton() {
  return (
    <div className="dxs-dcard">
      <span className="dxs-dcard__photo dxs-pulse" />
      <div className="dxs-dcard__text">
        <span className="dxs-dcard__name dxs-pulse" />
        <span className="dxs-dcard__line dxs-pulse" />
        <span className="dxs-dcard__line dxs-dcard__line--short dxs-pulse" />
      </div>
      <div className="dxs-dcard__foot">
        <span className="dxs-dcard__bar dxs-pulse" />
      </div>
    </div>
  );
}

function InterestCardSkeleton() {
  return (
    <div className="dxs-icard">
      <span className="dxs-icard__title" />
      <span />
      <span />
      <span className="dxs-icard__short" />
      <div className="dxs-icard__action"><span /></div>
    </div>
  );
}

function RecommendationCardSkeleton() {
  return (
    <div className="dxs-rcard">
      <div className="dxs-rcard__top">
        <span className="dxs-rcard__eyebrow" />
        <span className="dxs-rcard__match" />
      </div>
      <div className="dxs-rcard__who">
        <span className="dxs-rcard__photo" />
        <div className="dxs-rcard__id">
          <span className="dxs-rcard__name" />
          <span className="dxs-rcard__role" />
        </div>
      </div>
      <div className="dxs-rcard__tags">
        <span style={{ width: 76 }} />
        <span style={{ width: 126 }} />
        <span style={{ width: 146 }} />
      </div>
      <div className="dxs-rcard__reason">
        <span />
        <span style={{ width: 300, maxWidth: "70%" }} />
      </div>
      <div className="dxs-rcard__acts">
        <span />
        <span />
      </div>
    </div>
  );
}

/** The recommendation cards only (2 x 2), while "Try again" reloads the section under its heading. */
export function CardsSkeleton({ cards = 4 }: { cards?: number }) {
  return (
    <div className="dxs-rcards" role="status" aria-busy="true">
      <p className="sr-only">{LOADING_NOTE}</p>
      <div className="dxs-rgrid" aria-hidden="true">
        {Array.from({ length: cards }, (_, i) => <RecommendationCardSkeleton key={i} />)}
      </div>
    </div>
  );
}

function SectionSkeleton({ kind }: { kind: "for-you" | "interests" | "recommendations" }) {
  return (
    <div className="dxs-section" aria-hidden="true">
      <HeaderSkeleton />
      {kind === "for-you" ? (
        <div className="dxs-dgrid">{Array.from({ length: 6 }, (_, i) => <DiscoverCardSkeleton key={i} />)}</div>
      ) : kind === "interests" ? (
        <div className="dxs-igrid">{Array.from({ length: 4 }, (_, i) => <InterestCardSkeleton key={i} />)}</div>
      ) : (
        <div className="dxs-rcards"><div className="dxs-rgrid">{Array.from({ length: 4 }, (_, i) => <RecommendationCardSkeleton key={i} />)}</div></div>
      )}
    </div>
  );
}

/** For you on Akines (3 x 2), Explore by interest (4) and the recommendations (2 x 2), with one status for assistive technology. */
export function DiscoverSkeleton() {
  return (
    <div className="dxs-sk" role="status" aria-busy="true">
      <p className="sr-only">{LOADING_NOTE}</p>
      <SectionSkeleton kind="for-you" />
      <SectionSkeleton kind="interests" />
      <SectionSkeleton kind="recommendations" />
    </div>
  );
}

/* ---------------------------------------------------------------- empty */
export function EmptyText({ children }: { children: React.ReactNode }) {
  return <p className="dxs-empty">{children}</p>;
}

/** Rail, Your circles, when the member has joined none. */
export function EmptyCircles({ onFind }: { onFind?: () => void }) {
  const c = STATE_COPY.circlesEmpty;
  return (
    <section className="fd-box dxs-rail-empty" aria-labelledby="fd-circles-title">
      <h2 className="fd-box__title" id="fd-circles-title">{c.title}</h2>
      <p className="dxs-rail-empty__text">{c.text}</p>
      <button type="button" className="fd-link" onClick={onFind}>{c.link}</button>
    </section>
  );
}

/** Rail, You two would get along, when there is nothing to suggest. */
export function EmptyMatch() {
  return (
    <section className="fd-box dxs-rail-empty" aria-labelledby="fd-match-title">
      <h2 className="fd-box__title" id="fd-match-title">You two would get along</h2>
      <p className="dxs-rail-empty__text">{STATE_COPY.matchEmpty}</p>
    </section>
  );
}

/* ---------------------------------------------------------------- error */
export function SectionError({ onRetry }: { onRetry: () => void }) {
  const c = STATE_COPY.sectionError;
  return (
    <div className="dxs-error" role="alert">
      <div className="dxs-error__head">
        <CircleAlert className="dxs-error__icon" size={24} strokeWidth={1.5} absoluteStrokeWidth aria-hidden="true" focusable="false" />
        <h3 className="dxs-error__title">{c.title}</h3>
      </div>
      <p className="dxs-error__text">{c.text}</p>
      <div className="dxs-error__actions">
        <Button variant="secondary" onClick={onRetry}>{c.retry}</Button>
      </div>
    </div>
  );
}
