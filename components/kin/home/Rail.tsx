"use client";

import Link from "next/link";
import { useState } from "react";
import Avatar, { Faces, Tie } from "@/components/kin/Avatar";
import Button from "@/components/kin/Button";
import { Media } from "@/components/kin/Card";
import { useJoined } from "@/components/circles/useJoined";
import { useAllProducts } from "@/components/shop/useShop";
import { sortProducts } from "@/lib/data/shop";
import { CIRCLES, STUDIOS } from "@/lib/data/community";
import { GAME_SESSIONS } from "@/lib/data/games";
import type { PhotoKey } from "@/lib/data/images";
import { MATCHES } from "@/lib/data/matches";
import { ME, PEOPLE, type PersonId } from "@/lib/data/people";
import { useLocal } from "@/lib/useLocal";

const GAME_PHOTO: Record<string, PhotoKey> = { remember: "photoAlbum", "two-truths": "talkLaugh", "city-eyes": "galleryViewer" };

/** Beside the feed on desktop, after it on phones: someone to meet, your circles, tonight, and the rest of Akines. */
export default function Rail() {
  const { ids } = useJoined();
  const joined = CIRCLES.filter((c) => ids.includes(c.id));
  const [hello, setHello] = useLocal<string[]>("ak:home-hellos", []);
  const [justNow, setJustNow] = useState(false);
  const match = MATCHES[0];
  const person = PEOPLE[match.id as PersonId];
  const said = hello.includes(match.id);
  const products = sortProducts(useAllProducts(), "new").slice(0, 2);
  const tonight = GAME_SESSIONS.filter((g) => g.live || g.when.startsWith("Tonight")).slice(0, 2);

  return (
    <aside className="h-rail" aria-label="Around you">
      <section aria-labelledby="h-meet">
        <div className="h-rail-head"><h2 id="h-meet">Someone to meet</h2><Link href="/kindred">More</Link></div>
        <div className="h-meet">
          <div className="h-meet-top">
            <Tie a={ME} b={person} size={44} dotted={!said} draw={justNow} />
            <div><b>{person.name}</b><small>{person.role} · {person.city}</small></div>
          </div>
          <p>{match.reason}</p>
          {said ? <p className="t-small c-3">You said hello. {person.name.split(" ")[0]} will see it in their notifications.</p> : (
            <div className="k-row"><Button variant="primary" size="sm" onClick={() => { setHello([...hello, match.id]); setJustNow(true); }}>Say hello</Button><Button variant="ghost" size="sm" href="/kindred">Why this match</Button></div>
          )}
        </div>
      </section>

      <section aria-labelledby="h-circles">
        <div className="h-rail-head"><h2 id="h-circles">Your circles</h2><Link href="/circles">See all</Link></div>
        <div className="h-rows">
          {joined.map((c) => (
            <Link key={c.id} href={`/circles/${c.id}`} className="h-row">
              <Media photo={c.photo} ratio="1" sizes="88px" />
              <span className="tx"><b>{c.name}</b><small>{c.members} members · {c.active} active</small></span>
            </Link>
          ))}
        </div>
        <div><Button variant="ghost" size="sm" href="/circles/new">Start a KinCircle</Button></div>
      </section>

      {tonight.length > 0 && (
        <section aria-labelledby="h-tonight">
          <div className="h-rail-head"><h2 id="h-tonight">Tonight</h2><Link href="/play">All games</Link></div>
          <div className="h-rows">
            {tonight.map((g) => (
              <Link key={g.id} href={`/play/session/${g.id}`} className="h-row">
                <Media photo={GAME_PHOTO[g.game] ?? "talkLaugh"} ratio="1" sizes="88px" />
                <span className="tx"><b>{g.title}</b><small>{g.when} · {PEOPLE[g.host].name.split(" ")[0]} is hosting</small></span>
                <Faces people={g.players.slice(0, 3).map((id) => PEOPLE[id])} size={24} max={3} />
              </Link>
            ))}
          </div>
        </section>
      )}

      <section aria-labelledby="h-week">
        <div className="h-rail-head"><h2 id="h-week">Also this week</h2></div>
        <div className="h-rows">
          {STUDIOS.slice(0, 2).map((v) => (
            <Link key={v.id} href={`/studios/${v.id}`} className="h-row">
              <Avatar person={PEOPLE[v.artist]} size={44} />
              <span className="tx"><b>Inside {PEOPLE[v.artist].name.split(" ")[0]}&apos;s studio</b><small>{v.place} · {v.when}</small></span>
            </Link>
          ))}
          {products.map((p) => (
            <Link key={p.id} href={`/shop/${p.id}`} className="h-row">
              <Media photo={p.photos[0]} ratio="1" sizes="88px" />
              <span className="tx"><b>{p.title}</b><small>{PEOPLE[p.seller]?.name ?? "A member"} · from the market</small></span>
              <span className="price">${p.price}</span>
            </Link>
          ))}
        </div>
        <div className="k-row"><Link href="/studios" className="t-small c-3">All studios</Link><Link href="/shop" className="t-small c-3">The market</Link></div>
      </section>
    </aside>
  );
}
