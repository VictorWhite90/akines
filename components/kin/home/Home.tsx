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
  ACTIVITY_CARDS, ARRANGEMENTS, BANTER_CARDS, BANTER_JOIN, EXPLORE_CARDS, HEADS, LOADING_MS, MORE_POSTS, PRODUCTS, PROJECT_CARDS, ROOM_CARDS, SHOP_COPY,
  STORY_CARDS, STUDIO_CARDS, TRAITS, TRAIT_LINK, TRAIT_META, WELLBEING, type FeedCard, type FeedKey, type FeedPost, type FeedVersion,
} from "./content";
import FeedPosts from "./FeedPosts";
import { HOME_REFRESH, takeHomeRefresh } from "@/lib/homeRefresh";
import HomeHero from "./HomeHero";
import HomeRail from "./HomeRail";
import { FeedSkeletonDesktop, HomeSide, SectionPost } from "./HomeDesktop";
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

function MobilePreviewCard({ title, text, image, href, tag, left, right }: { title: string; text: string; image: string; href: string; tag?: string; left?: string; right?: string }) {
  return (
    <div className="fd-row fd-row--sub" data-m="stagger">
      <Link className="fd-card fd-card--sub" href={href}>
        <FdPhoto src={image} className="fd-card__photo" sizes="(max-width: 767px) 264px, (max-width: 1279px) 33vw, 330px" />
        {tag ? <p className="fd-card__tag">{tag}</p> : null}
        <h3 className="fd-card__title">{title}</h3>
        <p className="fd-card__text">{text}</p>
        {left || right ? <div className="fd-card__meta"><span>{left}</span>{right ? <span>{right}</span> : null}</div> : null}
        <span className="fd-card__rule" aria-hidden />
      </Link>
    </div>
  );
}

function SectionBody({ name, mobile }: { name: SectionName; mobile: boolean }) {
  if (mobile) {
    switch (name) {
      case "explore":
        return <MobilePreviewCard title={EXPLORE_CARDS[0].title} text={EXPLORE_CARDS[0].text} image={EXPLORE_CARDS[0].image} href={EXPLORE_CARDS[0].href} tag={EXPLORE_CARDS[0].tag} left={EXPLORE_CARDS[0].left} right={EXPLORE_CARDS[0].right} />;
      case "kincircle":
        return <FeedPosts limit={mobile ? 1 : undefined} />;
      case "banter": {
        const b = BANTER_CARDS[0];
        return (
          <div className="fd-row fd-row--banter" data-m="stagger">
            <Link className="fd-banter" href={b.href}>
              <p className="fd-banter__tag">{b.tag.endsWith("LIVE") ? <span className="fd-banter__dot" aria-hidden /> : null}{b.tag}</p>
              <h3 className="fd-banter__title">{b.title}</h3>
              <p className="fd-banter__text">{b.text}</p>
              <div className="fd-banter__foot">
                <div className="fd-banter__people"><FdFaces ids={b.faces} /><span>{b.talking}</span></div>
                <span className="fd-link fd-link--static"><span>{BANTER_JOIN.label}</span><ArrowRight size={16} strokeWidth={1.5} aria-hidden /></span>
              </div>
            </Link>
          </div>
        );
      }
      case "rooms":
        return <MobilePreviewCard title={ROOM_CARDS[0].title} text={ROOM_CARDS[0].text} image={ROOM_CARDS[0].image} href={ROOM_CARDS[0].href} tag={ROOM_CARDS[0].tag} left={ROOM_CARDS[0].left} right={ROOM_CARDS[0].right} />;
      case "activities":
        return <MobilePreviewCard title={ACTIVITY_CARDS[0].title} text={ACTIVITY_CARDS[0].text} image={ACTIVITY_CARDS[0].image} href={ACTIVITY_CARDS[0].href} tag={ACTIVITY_CARDS[0].tag} left={ACTIVITY_CARDS[0].left} right={ACTIVITY_CARDS[0].right} />;
      case "collaborate": {
        const c = PROJECT_CARDS[0];
        return <MobilePreviewCard title={c.title} text={c.text} image={c.image} href={c.href} tag={c.tag} left={c.left} right={DEMO ? c.match : undefined} />;
      }
      case "shop": {
        return (
          <div className="fd-row fd-row--shop" data-m="stagger">
            {PRODUCTS.slice(0, 2).map((p) => (
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
      }
      case "studios":
        return <MobilePreviewCard title={STUDIO_CARDS[0].title} text={STUDIO_CARDS[0].text} image={STUDIO_CARDS[0].image} href={STUDIO_CARDS[0].href} tag={STUDIO_CARDS[0].tag} left={STUDIO_CARDS[0].left} />;
      case "stories":
        return <MobilePreviewCard title={STORY_CARDS[0].title} text={STORY_CARDS[0].text} image={STORY_CARDS[0].image} href={STORY_CARDS[0].href} tag={STORY_CARDS[0].tag} left={STORY_CARDS[0].left} right={STORY_CARDS[0].right} />;
      case "dna": {
        const t = TRAITS[0];
        return (
          <div className="fd-row fd-row--dna" data-m="stagger">
            <article className="fd-trait">
              <p className="fd-trait__eyebrow">{t.eyebrow}</p>
              <h3 className="fd-trait__title">{t.title}</h3>
              <p className="fd-trait__text">{t.text}</p>
              <div className="fd-trait__foot">
                <div className="fd-trait__people"><FdFaces ids={t.faces} /><span>{TRAIT_META}</span></div>
                <FdLink href={soon(TRAIT_LINK.href, t.title)}>{TRAIT_LINK.label}</FdLink>
              </div>
            </article>
          </div>
        );
      }
      default:
        return null;
    }
  }

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
function Section({ name, isFirst, failing, mobile }: { name: SectionName; isFirst: boolean; failing?: boolean; mobile: boolean }) {
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
      {phase === "error" ? <ErrorPanel onRetry={() => setPhase("loading")} /> : phase === "loading" ? <SkeletonCards /> : <SectionBody name={name} mobile={mobile} />}
    </section>
  );
}

type FeedState = "loading" | "error" | "empty";
const STATES: Record<string, FeedState> = { "state-loading": "loading", "state-error": "error", "state-empty": "empty" };

/**
 * One of the four feed versions, a different one from last time. Like the design's review links, ?feed=a|b|c|d shows one
 * version and ?feed=state-loading|state-error|state-empty one state (on version A); neither touches the rotation.
 *
 * The arrangement is kept in module state, which survives moving around the app, so coming back to Community Home by a
 * link or the back button shows the same feed. A browser refresh loads the module again and picks anew, and so does a
 * tap on the Home icon or the logo (lib/homeRefresh, as on X): the feed scrolls to the top and loads a new arrangement.
 */
let thisLoad: keyof typeof VERSIONS | null = null;
const REFRESH_MS = 600;

function pickNew(): keyof typeof VERSIONS {
  let last: string | null = thisLoad;
  if (!last) try { last = localStorage.getItem(VERSION_KEY); } catch {}
  const options = (Object.keys(VERSIONS) as (keyof typeof VERSIONS)[]).filter((k) => k !== last);
  const v = options[Math.floor(Math.random() * options.length)];
  try { localStorage.setItem(VERSION_KEY, v); } catch {}
  thisLoad = v;
  return v;
}

function useVersion() {
  const [view, setView] = useState<{ v: keyof typeof VERSIONS; state?: FeedState; refreshing?: boolean } | null>(null);
  const picked = useRef(false);
  useEffect(() => {
    if (picked.current) return;
    picked.current = true;
    const asked = new URLSearchParams(window.location.search).get("feed") ?? "";
    const tapped = takeHomeRefresh();
    let next: { v: keyof typeof VERSIONS; state?: FeedState };
    if (asked in VERSIONS) next = { v: asked as keyof typeof VERSIONS };
    else if (asked in STATES) next = { v: "a", state: STATES[asked] };
    else if (thisLoad && !tapped) next = { v: thisLoad };
    else next = { v: pickNew() };
    setView(next);
  }, []);
  // A Home tap while already on Community Home: back to the top, a moment of loading, then the new arrangement.
  useEffect(() => {
    let t = 0;
    const onTap = () => {
      takeHomeRefresh();
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
      const v = pickNew();
      setView({ v, refreshing: true });
      window.clearTimeout(t);
      t = window.setTimeout(() => setView({ v }), REFRESH_MS);
      if (new URLSearchParams(window.location.search).has("feed")) window.history.replaceState(null, "", "/");
    };
    window.addEventListener(HOME_REFRESH, onTap);
    return () => { window.removeEventListener(HOME_REFRESH, onTap); window.clearTimeout(t); };
  }, []);
  return view;
}

/**
 * The long feed (every layout): this load's arrangement first (so a refresh still changes what leads), then every other
 * section from the other arrangements, with a member post after every second section.
 */
type DesktopItem = { kind: "section"; name: FeedKey } | { kind: "post"; post: FeedPost };
const ALL_SECTIONS = [...new Set(Object.values(VERSIONS).flat())];
function desktopFeed(lead: FeedKey[]): DesktopItem[] {
  const order = [...lead, ...ALL_SECTIONS.filter((s) => !lead.includes(s))];
  const out: DesktopItem[] = [];
  let p = 0;
  order.forEach((name, i) => {
    out.push({ kind: "section", name });
    if (i % 2 === 1 && p < MORE_POSTS.length) out.push({ kind: "post", post: MORE_POSTS[p++] });
  });
  return out;
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
  const ready = sections && !view?.refreshing && (state !== "loading" || settled);
  const mobile = useMedia("(max-width: 767px)");
  // Phones show no rail (Your circles and the match card); tablet keeps them above the feed, desktop at the side.
  const rail = !mobile;
  // Desktop (1280 and up): the feed as Instagram-style posts in a centred column, with the right column beside it (HomeDesktop.tsx).
  const desktop = useMedia("(min-width: 1280px)");
  return (
    <div className="fd-page fd-home" data-feed-version={v ?? undefined} data-feed-state={state}>
      <HomeHero />
      {desktop ? (
        <div className="ig-layout">
          <div className="ig-feed">
            {ready ? desktopFeed(sections).map((x, i) => x.kind === "section"
              ? <SectionPost key={x.name} name={x.name} isFirst={i === 0} failing={state === "error" && x.name === "banter"} />
              : <FeedPosts key={x.post.id} variant="post" posts={[x.post]} />) : <FeedSkeletonDesktop note={state === "loading"} />}
          </div>
          <HomeSide empty={state === "empty"} />
        </div>
      ) : (
      <div className="fd-layout">
        {rail ? <HomeRail empty={state === "empty"} /> : null}
        <div className="fd-feed">
          {ready ? desktopFeed(sections).map((x, i) => x.kind === "section"
            ? <Section key={x.name} name={x.name} isFirst={i === 0} failing={state === "error" && x.name === "banter"} mobile={mobile} />
            : <section key={x.post.id} className="fd-section fd-section--post" aria-label={`Post by ${x.post.name}`}><FeedPosts posts={[x.post]} /></section>) : <FeedSkeleton note={state === "loading"} />}
        </div>
      </div>
      )}
    </div>
  );
}
