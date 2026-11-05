"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import Button from "@/components/kin/Button";
import { Chip } from "@/components/kin/Chip";
import { allActivities, dayDistance } from "@/components/activities/activities";
import { useBanters } from "@/components/banter/useBanters";
import { useJoined } from "@/components/circles/useJoined";
import { useAllProducts } from "@/components/shop/useShop";
import { useCollab } from "@/lib/collab/useCollab";
import { CIRCLES, ROOMS, STUDIOS } from "@/lib/data/community";
import { COLLECTOR_TYPES } from "@/lib/data/dna";
import { JOURNAL } from "@/lib/data/journals";
import { PEOPLE, type PersonId } from "@/lib/data/people";
import { sortProducts } from "@/lib/data/shop";
import { STORIES } from "@/lib/data/stories";
import { useLocal } from "@/lib/useLocal";
import FeedPosts from "./FeedPosts";
import HomeHero from "./HomeHero";
import HomeRail from "./HomeRail";
import { FdAvatar, FdFaces, FdLink, FdPhoto, photoSrc } from "./parts";
import "./home.css";

/*
 * Community Home, mirrored from the product design (classes in home.css): a row of what is happening now, a column
 * with your circles and a match, and a feed of six sections. Like the design, each visit shows
 * one of four feed versions, never the same one twice in a row. Every section reads our own data.
 */

type SectionName = "explore" | "kincircle" | "banter" | "rooms" | "activities" | "collaborate" | "shop" | "studios" | "stories" | "wellbeing" | "dna";
const VERSIONS: Record<"a" | "b" | "c" | "d", SectionName[]> = {
  a: ["explore", "kincircle", "banter", "stories", "studios", "shop"],
  b: ["kincircle", "rooms", "collaborate", "activities", "wellbeing", "explore"],
  c: ["collaborate", "dna", "rooms", "studios", "banter", "shop"],
  d: ["stories", "studios", "wellbeing", "shop", "dna", "activities"],
};
const VERSION_KEY = "ak:feed-version";
const HEAD: Record<SectionName, { title: string; support: string; link?: { label: string; href: string } }> = {
  explore: { title: "These might resonate with you.", support: "Discover stories, ideas, and conversations worth your time.", link: { label: "Explore all", href: "/stories" } },
  kincircle: { title: "Your circles' feed.", support: "What people are sharing in the circles you've joined.", link: { label: "Explore all", href: "/circles" } },
  banter: { title: "Conversations worth joining.", support: "Open conversations happening across Akines right now.", link: { label: "Open Banter", href: "/banter" } },
  rooms: { title: "Rooms open now.", support: "Drop in, listen, or speak when you are ready.", link: { label: "See all rooms", href: "/rooms" } },
  activities: { title: "Things to do together.", support: "Small, easy ways to meet people through making.", link: { label: "See all activities", href: "/activities" } },
  collaborate: { title: "Projects looking for you.", support: "Open projects that match your interests and skills.", link: { label: "Discover projects", href: "/collaborate" } },
  shop: { title: "Fresh from the makers.", support: "Original work and made-to-order pieces, sold by the people who made them.", link: { label: "Shop all", href: "/shop" } },
  studios: { title: "Step inside the studio.", support: "Live, virtual, 360° or VR. Talk to the maker directly.", link: { label: "Visit studios", href: "/studios" } },
  stories: { title: "Witness the journey.", support: "Living journals and the legacy every artwork carries.", link: { label: "Open journals", href: "/journal" } },
  wellbeing: { title: "A quiet moment.", support: "How is your creative energy today? Only you can see your answer." },
  dna: { title: "Your creative DNA.", support: "Traits that shape how you make, and the people who share them.", link: { label: "See your full DNA", href: "/dna" } },
};
const FIRST = "fd-first";
const first = (id: PersonId) => PEOPLE[id]?.name.split(" ")[0] ?? "";

type Card = { id: string; href: string; image: string; tag?: string; title: string; text: string; left?: string; right?: string };
function Cards({ cards }: { cards: Card[] }) {
  return (
    <div className="fd-row fd-row--sub" data-m="stagger">
      {cards.map((c) => (
        <Link key={c.id} className="fd-card fd-card--sub" href={c.href}>
          <FdPhoto src={c.image} className="fd-card__photo" />
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

const WELL = [
  { id: "full", label: "Full", reply: "Lovely. Let it carry something small into the world." },
  { id: "steady", label: "Steady", reply: "Steady is a good place to make from." },
  { id: "low", label: "Low", reply: "Then be gentle. A walk or ten quiet minutes can be enough." },
  { id: "empty", label: "Running on empty", reply: "Thank you for saying so. Rest counts as part of the work." },
];
function Wellbeing({ id }: { id?: string }) {
  const [mood, setMood] = useLocal<string | null>("ak:feed-wellbeing", null);
  const reply = WELL.find((w) => w.id === mood)?.reply;
  return (
    <section className="fd-section fd-well" id={id} data-feed-section="wellbeing" aria-labelledby="fd-title-wellbeing" data-m="up">
      <div className="fd-well__body">
        <p className="fd-well__eyebrow">CREATIVE WELLBEING</p>
        <h2 className="fd-well__title" id="fd-title-wellbeing">{HEAD.wellbeing.title}</h2>
        <p className="fd-well__support">{HEAD.wellbeing.support}</p>
        <div className="fd-well__chips" role="group" aria-label="How is your creative energy today?">
          {WELL.map((w) => <Chip key={w.id} selected={mood === w.id} onClick={() => setMood(mood === w.id ? null : w.id)}>{w.label}</Chip>)}
        </div>
        <p className="fd-well__reply" aria-live="polite">{reply ? <span key={mood}>{reply}</span> : null}</p>
        <FdLink href="/wellbeing/reflect">Reflect privately</FdLink>
      </div>
      <FdPhoto src="/kin/home/quiet.jpg" className="fd-well__photo" />
    </section>
  );
}

function SectionBody({ name }: { name: SectionName }) {
  const { calls } = useCollab();
  const { all: banters } = useBanters();
  const products = sortProducts(useAllProducts(), "new").slice(0, 3);
  switch (name) {
    case "explore":
      return <Cards cards={STORIES.slice(0, 3).map((s) => ({ id: s.id, href: `/stories/${s.id}`, image: photoSrc(s.photo), title: s.title, text: s.excerpt, left: `${s.reflections} felt this`, right: s.voice ? `Voice ${s.voice}` : `${s.read} read` }))} />;
    case "kincircle":
      return <FeedPosts />;
    case "banter":
      return (
        <div className="fd-row" data-m="stagger">
          {banters.slice(0, 3).map((b) => {
            const people = [b.by, ...b.replies.map((r) => r.by)].filter((v, i, a) => a.indexOf(v) === i).slice(0, 3) as PersonId[];
            const live = !b.closed;
            return (
              <Link key={b.id} className="fd-banter" href={`/banter/${b.id}`}>
                <p className="fd-banter__tag">{live ? <span className="fd-banter__dot" aria-hidden /> : null}{live ? "BANTER · LIVE" : "BANTER · OPEN"}</p>
                <h3 className="fd-banter__title">{b.prompt}</h3>
                <p className="fd-banter__text">{b.replies[0]?.text ?? b.audienceLabel}</p>
                <div className="fd-banter__foot">
                  <div className="fd-banter__people"><FdFaces ids={people} /><span>{b.replies.length + 1} people talking</span></div>
                  <span className="fd-link fd-link--static"><span>Join the conversation</span><ArrowRight size={16} strokeWidth={1.5} aria-hidden /></span>
                </div>
              </Link>
            );
          })}
        </div>
      );
    case "rooms":
      return <Cards cards={[...ROOMS].sort((a, b) => (a.status === "live" ? -1 : b.status === "live" ? 1 : 0)).slice(0, 3).map((r) => ({ id: r.id, href: `/rooms/${r.id}`, image: photoSrc(r.photo), tag: r.status === "live" ? "LIVE NOW" : r.when.toUpperCase(), title: r.title, text: r.blurb, left: `${r.seated.length} ${r.status === "live" ? "in the room" : "going"}`, right: `Hosted by ${first(r.host)}` }))} />;
    case "activities":
      return <Cards cards={allActivities().sort((a, b) => dayDistance(a.when) - dayDistance(b.when)).slice(0, 3).map((a) => ({ id: a.circleId + a.id, href: "/activities", image: photoSrc(a.photo), tag: a.when.toUpperCase(), title: a.title, text: a.blurb, left: a.where, right: `${a.going.length} going` }))} />;
    case "collaborate":
      return <Cards cards={calls.filter((c) => !c.postedByMe).slice(0, 3).map((c) => ({ id: c.id, href: `/collaborate/calls/${c.id}`, image: photoSrc(c.photo), tag: `LOOKING FOR: ${c.roles[0]?.toUpperCase() ?? "COLLABORATORS"}`, title: c.title, text: c.summary, left: `${c.teamSize} collaborators`, right: c.closesInDays <= 0 ? "Closing today" : `Closes in ${c.closesInDays} days` }))} />;
    case "shop":
      return (
        <div className="fd-row" data-m="stagger">
          {products.map((p) => (
            <article key={p.id} className="fd-card fd-product">
              <Link className="fd-product__link" href={`/shop/${p.id}`}>
                <FdPhoto src={photoSrc(p.photos[0])} className="fd-card__photo" />
                <p className="fd-card__tag">{p.category.toUpperCase()}</p>
                <h3 className="fd-card__title fd-product__title">{p.title}</h3>
              </Link>
              <div className="fd-product__maker"><FdAvatar id={p.seller} size={24} /><span>{PEOPLE[p.seller]?.name ?? "A member"}</span></div>
              <div className="fd-product__buy">
                <p className="fd-product__price"><span>${p.price.toLocaleString()}</span></p>
                <Button variant="secondary" href={`/shop/${p.id}`} aria-label={`Buy ${p.title}`}>Buy</Button>
              </div>
              <span className="fd-card__rule" aria-hidden />
            </article>
          ))}
        </div>
      );
    case "studios":
      return <Cards cards={STUDIOS.slice(0, 3).map((v) => ({ id: v.id, href: `/studios/${v.id}`, image: photoSrc(v.photo), tag: v.mode.toUpperCase(), title: `${PEOPLE[v.artist].name}'s studio`, text: v.blurb, left: v.place }))} />;
    case "stories":
      return <Cards cards={JOURNAL.filter((j) => j.photo).slice(0, 3).map((j) => ({ id: j.id, href: `/profile/${j.by}`, image: photoSrc(j.photo!), tag: j.kind === "work" ? "WORK JOURNAL" : "LIFE JOURNAL", title: j.title, text: j.text, left: `By ${first(j.by)}`, right: j.date }))} />;
    case "dna": {
      const faces: PersonId[][] = [["amara", "kwame", "leila"], ["efua", "ayo", "amara"], ["kwame", "leila", "efua"]];
      return (
        <div className="fd-row" data-m="stagger">
          {COLLECTOR_TYPES.slice(0, 3).map((t, i) => (
            <article key={t.key} className="fd-trait">
              <p className="fd-trait__eyebrow">TRAIT {String(i + 1).padStart(2, "0")}</p>
              <h3 className="fd-trait__title">{t.label}</h3>
              <p className="fd-trait__text">{t.blurb}</p>
              <div className="fd-trait__foot">
                <div className="fd-trait__people"><FdFaces ids={faces[i]} /><span>{t.value}% of your DNA</span></div>
                <FdLink href="/dna">See who shares it</FdLink>
              </div>
            </article>
          ))}
        </div>
      );
    }
    default:
      return null;
  }
}

function Section({ name, isFirst }: { name: SectionName; isFirst: boolean }) {
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
      <SectionBody name={name} />
    </section>
  );
}

/** One of the four feed versions, a different one from last visit. */
function useVersion() {
  const [v, setV] = useState<keyof typeof VERSIONS | null>(null);
  const picked = useRef(false);
  useEffect(() => {
    if (picked.current) return;
    picked.current = true;
    let last: string | null = null;
    try { last = localStorage.getItem(VERSION_KEY); } catch {}
    const asked = new URLSearchParams(window.location.search).get("feed");
    const options = (Object.keys(VERSIONS) as (keyof typeof VERSIONS)[]).filter((k) => k !== last);
    // ?feed=a|b|c|d shows one version on purpose, as the design's review links do.
    const next = asked && asked in VERSIONS ? (asked as keyof typeof VERSIONS) : options[Math.floor(Math.random() * options.length)];
    try { localStorage.setItem(VERSION_KEY, next); } catch {}
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the version is chosen in the browser, once
    setV(next);
  }, []);
  return v;
}

export default function Home() {
  const v = useVersion();
  const { ids } = useJoined();
  const joined = CIRCLES.filter((c) => ids.includes(c.id));
  const sections = v ? VERSIONS[v] : null;
  return (
    <div className="fd-page" data-feed-version={v ?? undefined}>
      <HomeHero />
      <div className="fd-layout">
        <HomeRail circles={joined} />
        <div className="fd-feed">
          {sections ? sections.map((s, i) => <Section key={s} name={s} isFirst={i === 0} />) : <div className="fd-feed__sk" aria-busy="true" aria-label="Loading your feed" role="status" />}
        </div>
      </div>
    </div>
  );
}
