"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import Button from "@/components/kin/Button";
import { Chip } from "@/components/kin/Chip";
import { toast } from "@/components/kin/Toast";
import { DEMO } from "@/lib/demo/mode";
import { useLocal } from "@/lib/useLocal";
import { soon } from "@/lib/soon";
import {
  ACTIVITY_CARDS, ARRANGEMENTS, BANTER_CARDS, BANTER_JOIN, EXPLORE_CARDS, HEADS, LOADING_MS, PRODUCTS, PROJECT_CARDS, ROOM_CARDS, SHOP_COPY,
  STORY_CARDS, STUDIO_CARDS, TRAITS, TRAIT_LINK, TRAIT_META, WELLBEING, type FeedCard, type FeedKey, type FeedVersion,
} from "./content";
import FeedPosts from "./FeedPosts";
import HomeHero from "./HomeHero";
import HomeRail from "./HomeRail";
import { ErrorPanel, FdAvatar, FdFaces, FdLink, FdPhoto, FeedSkeleton, SkeletonCards } from "./parts";
import "./home.css";
import "./home-mobile.css";
import { useMedia } from "@/components/kin/useMedia";

/*
 * Community Home, mirrored from the product design (classes in home.css): a row of what is happening now, a column
 * with your circles and a match, and a feed of six sections. Like the design, each visit shows
 * one of four feed versions, never the same one twice in a row. All copy and photos are the design's (./content.ts).
 * Phones (below 768): no rail, a short swipe hero and swipe rows of cards (home-mobile.css, scoped to .fd-home because Connect
 * Discover also carries .fd-page).
 */

type SectionName = FeedKey;
const VERSIONS = Object.fromEntries(Object.entries(ARRANGEMENTS).map(([k, v]) => [k, v.sections])) as Record<FeedVersion, FeedKey[]>;
const VERSION_KEY = "ak:feed-version";
const HEAD = HEADS;
const FIRST = "fd-first";

function Cards({ cards }: { cards: FeedCard[] }) {
  return (
    <div className="fd-row fd-row--sub" data-m="stagger">
      {cards.map((c) => (
        <Link key={c.id} className="fd-card fd-card--sub" href={c.href}>
          <FdPhoto src={c.image} className="fd-card__photo" sizes="(max-width: 767px) 264px, (max-width: 1279px) 33vw, 330px" />
          {c.tag ? <p className="fd-card__tag">{c.tag}</p> : null}
          <h3 className="fd-card__title">{c.title}</h3>
          <p className="fd-card__text">{c.text}</p>
          {c.left || c.right ? <div className="fd-card__meta"><span>{c.left}</span>{c.right ? <span>{c.right}</span> : null}</div> : null}
          <span className="fd-card__rule" aria-hidden />
        </Link>
      ))}
    </div>
  );
}

function Wellbeing({ id }: { id?: string }) {
  const [mood, setMood] = useLocal<string | null>("ak:feed-wellbeing", null);
  const reply = WELLBEING.options.find((w) => w.id === mood)?.reply;
  return (
    <section className="fd-section fd-well" id={id} data-feed-section="wellbeing" aria-labelledby="fd-title-wellbeing" data-m="up">
      <div className="fd-well__body">
        <p className="fd-well__eyebrow">{WELLBEING.eyebrow}</p>
        <h2 className="fd-well__title" id="fd-title-wellbeing">{HEAD.wellbeing.title}</h2>
        <p className="fd-well__support">{HEAD.wellbeing.support}</p>
        <div className="fd-well__chips" role="group" aria-label="How is your creative energy today?">
          {WELLBEING.options.map((w) => <Chip key={w.id} selected={mood === w.id} onClick={() => setMood(mood === w.id ? null : w.id)}>{w.label}</Chip>)}
        </div>
        <p className="fd-well__reply" aria-live="polite">{reply ? <span key={mood}>{reply}</span> : null}</p>
        <FdLink href={WELLBEING.link.href}>{WELLBEING.link.label}</FdLink>
      </div>
      <FdPhoto src={WELLBEING.image} className="fd-well__photo" sizes="(max-width: 899px) 100vw, 400px" />
    </section>
  );
}

function SectionBody({ name }: { name: SectionName }) {
  switch (name) {
    case "explore":
      return <Cards cards={EXPLORE_CARDS} />;
    case "kincircle":
      return <FeedPosts />;
    case "banter":
      return (
        <div className="fd-row fd-row--banter" data-m="stagger">
          {BANTER_CARDS.map((b) => (
            <Link key={b.id} className="fd-banter" href={b.href}>
              <p className="fd-banter__tag">{b.tag.endsWith("LIVE") ? <span className="fd-banter__dot" aria-hidden /> : null}{b.tag}</p>
              <h3 className="fd-banter__title">{b.title}</h3>
              <p className="fd-banter__text">{b.text}</p>
              <div className="fd-banter__foot">
                <div className="fd-banter__people"><FdFaces ids={b.faces} /><span>{b.talking}</span></div>
                <span className="fd-link fd-link--static"><span>{BANTER_JOIN.label}</span><ArrowRight size={16} strokeWidth={1.5} aria-hidden /></span>
              </div>
            </Link>
          ))}
        </div>
      );
    case "rooms":
      return <Cards cards={ROOM_CARDS} />;
    case "activities":
      return <Cards cards={ACTIVITY_CARDS} />;
    case "collaborate":
      // The design's "% match" is sample content: shown in preview only.
      return <Cards cards={PROJECT_CARDS.map(({ match, ...c }) => ({ ...c, right: DEMO ? match : undefined }))} />;
    case "shop":
      return (
        <div className="fd-row fd-row--shop" data-m="stagger">
          {PRODUCTS.map((p) => (
            <article key={p.id} className="fd-card fd-product">
              <Link className="fd-product__link" href={p.href}>
                <FdPhoto src={p.image} className="fd-card__photo" sizes="(max-width: 767px) 50vw, (max-width: 1279px) 33vw, 330px" />
                <p className="fd-card__tag">{p.tag}</p>
                <h3 className="fd-card__title fd-product__title">{p.title}</h3>
              </Link>
              <div className="fd-product__maker"><FdAvatar src={p.face} size={24} /><span>{p.maker}</span></div>
              <div className="fd-product__buy">
                <p className="fd-product__price"><span>{p.price}</span>{p.edition ? <span className="fd-product__edition">{p.edition}</span> : null}</p>
                <Button variant="secondary" onClick={() => toast.show({ message: SHOP_COPY.toast })} aria-label={`${SHOP_COPY.buy} ${p.title}`}>{SHOP_COPY.buy}</Button>
              </div>
              <span className="fd-card__rule" aria-hidden />
            </article>
          ))}
        </div>
      );
    case "studios":
      return <Cards cards={STUDIO_CARDS} />;
    case "stories":
      return <Cards cards={STORY_CARDS} />;
    case "dna":
      return (
        <div className="fd-row fd-row--dna" data-m="stagger">
          {TRAITS.map((t) => (
            <article key={t.id} className="fd-trait">
              <p className="fd-trait__eyebrow">{t.eyebrow}</p>
              <h3 className="fd-trait__title">{t.title}</h3>
              <p className="fd-trait__text">{t.text}</p>
              <div className="fd-trait__foot">
                <div className="fd-trait__people"><FdFaces ids={t.faces} /><span>{TRAIT_META}</span></div>
                <FdLink href={soon(TRAIT_LINK.href, t.title)}>{TRAIT_LINK.label}</FdLink>
              </div>
            </article>
          ))}
        </div>
      );
    default:
      return null;
  }
}

/** `failing` starts the section in its error state (the error state link); "Try again" shows the skeleton for a moment, then the section. */
function Section({ name, isFirst, failing }: { name: SectionName; isFirst: boolean; failing?: boolean }) {
  const [phase, setPhase] = useState<"error" | "loading" | "live">(failing ? "error" : "live");
  useEffect(() => {
    if (phase !== "loading") return;
    const t = window.setTimeout(() => setPhase("live"), 900);
    return () => window.clearTimeout(t);
  }, [phase]);
  // The wellbeing band has no error or retry variant in the design.
  if (name === "wellbeing") return <Wellbeing id={isFirst ? FIRST : undefined} />;
  const h = HEAD[name], id = `fd-title-${name}`;
  return (
    <section className="fd-section" id={isFirst ? FIRST : undefined} data-feed-section={name} aria-labelledby={id}>
      <header className="fd-head" data-m="up">
        <div className="fd-head__copy">
          <h2 className="fd-head__title" id={id}>{h.title}</h2>
          <p className="fd-head__support">{h.support}</p>
        </div>
        {h.link ? <FdLink href={h.link.href}>{h.link.label}</FdLink> : null}
      </header>
      {phase === "error" ? <ErrorPanel onRetry={() => setPhase("loading")} /> : phase === "loading" ? <SkeletonCards /> : <SectionBody name={name} />}
    </section>
  );
}

type FeedState = "loading" | "error" | "empty";
const STATES: Record<string, FeedState> = { "state-loading": "loading", "state-error": "error", "state-empty": "empty" };

/**
 * One of the four feed versions, a different one from last visit. Like the design's review links, ?feed=a|b|c|d shows one
 * version and ?feed=state-loading|state-error|state-empty one state (on version A); neither touches the rotation.
 */
/**
 * The arrangement chosen for this page load. Module state survives moving around the app (client navigation), so
 * coming back to Community Home shows the same feed; a refresh or a new visit loads the module again and picks anew.
 */
let thisLoad: keyof typeof VERSIONS | null = null;

function useVersion() {
  const [view, setView] = useState<{ v: keyof typeof VERSIONS; state?: FeedState } | null>(null);
  const picked = useRef(false);
  useEffect(() => {
    if (picked.current) return;
    picked.current = true;
    const asked = new URLSearchParams(window.location.search).get("feed") ?? "";
    let next: { v: keyof typeof VERSIONS; state?: FeedState };
    if (asked in VERSIONS) next = { v: asked as keyof typeof VERSIONS };
    else if (asked in STATES) next = { v: "a", state: STATES[asked] };
    else if (thisLoad) next = { v: thisLoad };
    else {
      let last: string | null = null;
      try { last = localStorage.getItem(VERSION_KEY); } catch {}
      const options = (Object.keys(VERSIONS) as (keyof typeof VERSIONS)[]).filter((k) => k !== last);
      next = { v: options[Math.floor(Math.random() * options.length)] };
      try { localStorage.setItem(VERSION_KEY, next.v); } catch {}
      thisLoad = next.v;
    }
    setView(next);
  }, []);
  return view;
}

export default function Home() {
  const view = useVersion();
  const v = view?.v ?? null, state = view?.state;
  const [settled, setSettled] = useState(false);
  useEffect(() => {
    if (state !== "loading") return;
    const t = window.setTimeout(() => setSettled(true), LOADING_MS);
    return () => window.clearTimeout(t);
  }, [state]);
  const sections = v ? VERSIONS[v] : null;
  const ready = sections && (state !== "loading" || settled);
  // Phones show no rail (Your circles and the match card); tablet keeps them above the feed, desktop at the side.
  const rail = !useMedia("(max-width: 767px)");
  return (
    <div className="fd-page fd-home" data-feed-version={v ?? undefined} data-feed-state={state}>
      <HomeHero />
      <div className="fd-layout">
        {rail ? <HomeRail empty={state === "empty"} /> : null}
        <div className="fd-feed">
          {ready ? sections.map((s, i) => <Section key={s} name={s} isFirst={i === 0} failing={state === "error" && s === "banter"} />) : <FeedSkeleton note={state === "loading"} />}
        </div>
      </div>
    </div>
  );
}
