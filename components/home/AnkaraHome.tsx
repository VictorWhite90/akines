"use client";

import Link from "next/link";
import { Fragment } from "react";
import Avatar, { AvatarStack } from "@/components/ui/Avatar";
import Photo from "@/components/ui/Photo";
import HeroCarousel from "@/components/home/HeroCarousel";
import Pic from "@/components/home/Pic";
import { ReserveButtons } from "@/components/home/HomeClient";
import { useResonance } from "@/components/banter/useBanters";
import { BANTERS, BANTER_MOODS } from "@/lib/data/banter";
import { CALLS, CIRCLES, COLLABS, ROOMS, STAGES, STUDIOS } from "@/lib/data/community";
import { GAME_SESSIONS, GAMES, PLAY_MODES } from "@/lib/data/games";
import { MATCHES } from "@/lib/data/matches";
import { ME, PEOPLE, type PersonId } from "@/lib/data/people";
import { STORIES } from "@/lib/data/stories";
import { useLocal } from "@/lib/useLocal";

const C = { saffron: "#ffb000", fuchsia: "#e5007e", emerald: "#00a86b", royal: "#2547d0", tangerine: "#ff6b1a", violet: "#7b2ff7", ink: "#14121a" };
const cvar = (c: string) => ({ ["--c" as string]: c }) as React.CSSProperties;

function Faces({ ids, size = 24 }: { ids: PersonId[]; size?: number }) {
  return <span className="ap-faces">{ids.map((id) => <span key={id}><Avatar person={PEOPLE[id]} size={size} ring /></span>)}</span>;
}

function Block({ color, on = "#14121a", pattern, glyph, title, body, stat, cta, href, more }: { color: string; on?: string; pattern: string; glyph: string; title: string; body: string; stat: string; cta: string; href: string; more?: { label: string; href: string } }) {
  return (
    <div className={`ap-block ${pattern}`} style={{ ["--c" as string]: color, ["--on" as string]: on } as React.CSSProperties}>
      <span className="ap-glyph" aria-hidden>{glyph}</span>
      <h2>{title}</h2>
      <p>{body}</p>
      <span className="ap-stat">{stat}</span>
      <Link href={href} className="ap-cta">{cta}</Link>
      {more && <Link href={more.href} className="ap-more">{more.label}</Link>}
    </div>
  );
}

export default function AnkaraHome() {
  const { ids: resonated, toggle } = useResonance();
  const [seats, setSeats] = useLocal<string[]>("ak:home-seats", []);
  const [games, setGames] = useLocal<string[]>("ak:home-games", []);
  const [visits, setVisits] = useLocal<string[]>("ak:home-visits", []);
  const [hellos, setHellos] = useLocal<string[]>("ak:home-hellos", []);
  const flip = (list: string[], set: (v: string[]) => void, id: string) => set(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);

  const room = ROOMS[0];
  const host = PEOPLE[room.host];
  const joined = CIRCLES.filter((c) => c.joined);
  const today = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });

  const slides = [
    <Fragment key="kincircle">
      <Pic name="kincircleHero" sizes="(max-width: 1060px) 100vw, 1200px" priority position="center 32%" />
      <div className="hero-copy">
        <span className="pill"><span className="live-dot" /> KinCircle</span>
        <h2>Bring together the right people around a shared purpose.</h2>
        <p>Build trust, support one another and create something meaningful, without the noise of another group chat.</p>
        <div className="hero-actions">
          <Link className="join" href="/circles/new">Start a KinCircle</Link>
          <Link className="ghost" href="/circles">See how it works</Link>
        </div>
      </div>
      <div className="attendees">
        <AvatarStack people={(["ayo", "zuri", "thandi"] as PersonId[]).map((id) => PEOPLE[id])} size={32} max={3} ringClass="ring-white" />
        <span className="count">{joined.length} circles · {joined.reduce((s, c) => s + c.members, 0)} creatives</span>
      </div>
    </Fragment>,
    <Fragment key="room">
      <Pic name="heroStudio" sizes="(max-width: 1060px) 100vw, 1200px" position="center 30%" />
      <div className="hero-copy">
        <span className="pill"><span className="live-dot" /> Presence Room · {room.when}</span>
        <h2>{room.title}</h2>
        <p>{room.blurb} Hosted by {host.name}. No audience, not recorded, no performance. Just presence.</p>
        <ReserveButtons roomId={room.id} />
      </div>
      <div className="attendees">
        {room.seated.slice(0, 3).map((id) => <span className="avatar-wrap" key={id}><Avatar person={PEOPLE[id]} size={32} /></span>)}
        <span className="count">{room.seated.length} of 6 joined</span>
      </div>
    </Fragment>,
    <Fragment key="banter">
      <Pic name="talkLaugh" sizes="(max-width: 1060px) 100vw, 1200px" position="center 40%" />
      <div className="hero-copy">
        <span className="pill"><span className="live-dot" /> Banter</span>
        <h2>One honest question, to the people who matter.</h2>
        <p>Not a feed, not built to go viral. A good Banter can grow into a room, a KinCircle or a collaboration.</p>
        <div className="hero-actions">
          <Link className="join" href="/banter#compose">Start a Banter</Link>
          <Link className="ghost" href="/banter">See what&apos;s being asked</Link>
        </div>
      </div>
    </Fragment>,
    <Fragment key="collab">
      <Pic name="collabArt" sizes="(max-width: 1060px) 100vw, 1200px" position="center 45%" />
      <div className="hero-copy">
        <span className="pill"><span className="live-dot" /> Collaboration Studio</span>
        <h2>Make something neither of you could make alone.</h2>
        <p>Complementary partners, open calls and a protected studio where credit and ownership are agreed up front.</p>
        <div className="hero-actions">
          <Link className="join" href="/collaborate">Explore collaborations</Link>
          <Link className="ghost" href="/collaborate">Answer an open call</Link>
        </div>
      </div>
    </Fragment>,
  ];

  return (
    <div className="ap">
      <div className="ap-hello">
        <div>
          <h1>Welcome back, <span>{ME.name.split(" ")[0]}.</span></h1>
          <p>{today} · here&apos;s what your people are up to</p>
        </div>
        <nav className="ap-now" aria-label="Happening now">
          <Link href="/banter/now/ai-art"><i className="pulse" style={{ background: C.fuchsia }} />Banter Now is live</Link>
          <Link href="/rooms/photography-memory"><i className="pulse" style={{ background: C.emerald }} />A room is live</Link>
          <Link href="/banter/unfinished"><i style={{ background: C.saffron }} />Kwame is waiting on you</Link>
          <Link href="/play/session/uni-night"><i style={{ background: C.tangerine }} />Game night · 20:00</Link>
        </nav>
      </div>

      <div className="home-hero"><HeroCarousel slides={slides} /></div>

      <div className="ap-rows">
        {/* Banter */}
        <section className="ap-row" aria-label="Banter">
          <Block color={C.saffron} pattern="dots" glyph="❝" title="Banter" body="One honest question, shared with the right people. Respond thoughtfully, not with likes." stat="8 Banters for you · 2 forming circles" cta="Start a Banter" href="/banter#compose" more={{ label: "See all Banter", href: "/banter" }} />
          <div className="ap-feed">
            {BANTERS.slice(0, 3).map((b) => {
              const mood = BANTER_MOODS.find((m) => m.id === b.mood)!;
              const on = resonated.includes(b.id);
              const count = (b.resonance?.length ?? 0) + (on ? 1 : 0);
              return (
                <article key={b.id} className="ap-card" style={cvar(C.saffron)}>
                  <div className="ap-card-body">
                    <div className="ap-meta"><Avatar person={PEOPLE[b.by]} size={26} /><b style={{ color: C.ink }}>{PEOPLE[b.by].name.split(" ")[0]}</b> · {b.audienceLabel}</div>
                    <Link href={`/banter/${b.id}`} className="ap-quote" style={{ textDecoration: "none" }}>{b.prompt}</Link>
                    <span><span className="ap-tag">{mood.label}</span></span>
                    {b.replies[0] && (
                      <p style={{ background: "#f7f6fa", borderRadius: 14, padding: "10px 12px", display: "flex", gap: 8 }}>
                        <Avatar person={PEOPLE[b.replies[0].by]} size={22} />
                        <span><b style={{ color: C.ink }}>{PEOPLE[b.replies[0].by].name.split(" ")[0]}:</b> {b.replies[0].kind === "voice" ? `voice note, ${b.replies[0].length}` : b.replies[0].text}</span>
                      </p>
                    )}
                    <div className="ap-foot">
                      <span className="ap-meta">{b.replies.length} replies{count ? ` · ${count} exploring` : ""}</span>
                      <button className={`ap-btn${on ? " on" : ""}`} onClick={() => toggle(b.id)}>✦ {on ? "Exploring" : "Explore"}</button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* Presence Rooms */}
        <section className="ap-row" aria-label="Presence Rooms">
          <Block color={C.fuchsia} on="#fff" pattern="rings" glyph="◉" title="Presence Rooms" body="Six seats, one human question. No stage, no audience, nothing recorded." stat="1 live now · 3 tonight and this week" cta="Find a seat" href="/rooms" more={{ label: "Host a room", href: "/rooms/new" }} />
          <div className="ap-feed">
            {ROOMS.slice(1, 4).map((r) => {
              const mine = seats.includes(r.id);
              const taken = r.seated.length + (mine ? 1 : 0);
              return (
                <article key={r.id} className="ap-card" style={cvar(C.fuchsia)}>
                  <Link href={`/rooms/${r.id}`} className="ap-img"><Photo name={r.photo} sizes="360px" className="absolute inset-0 h-full" /><span className={`ap-tag${r.status === "live" ? " solid" : ""}`}>{r.status === "live" ? "● Live now" : r.when}</span></Link>
                  <div className="ap-card-body">
                    <h3>{r.title}</h3>
                    <div className="ap-meta"><Avatar person={PEOPLE[r.host]} size={22} />Hosted by {PEOPLE[r.host].name.split(" ")[0]}</div>
                    <div className="ap-foot">
                      <span className="ap-seats" aria-label={`${taken} of 6 seats taken`}>{Array.from({ length: 6 }, (_, i) => <i key={i} className={i < taken ? "f" : undefined} />)}</span>
                      <button className={`ap-btn${mine ? " on" : ""}`} onClick={() => flip(seats, setSeats, r.id)} disabled={!mine && taken >= 6}>{mine ? "✓ Seat kept" : taken >= 6 ? "Full" : "Take a seat"}</button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* KinCircles */}
        <section className="ap-row" aria-label="KinCircles">
          <Block color={C.emerald} on="#fff" pattern="chevron" glyph="◎" title="KinCircles" body="Small groups on a journey together: arrive, understand, make, reflect, continue." stat={`You're in ${joined.length} circles · 1 forming near you`} cta="Start a KinCircle" href="/circles/new" more={{ label: "Your circles", href: "/circles" }} />
          <div className="ap-feed">
            <Link href="/circles" className="ap-card" style={cvar(C.emerald)}>
              <div className="ap-img"><Photo name="talkGroup" sizes="360px" className="absolute inset-0 h-full" /><span className="ap-tag solid">Your circle · week 4 of 8</span></div>
              <div className="ap-card-body">
                <h3>West African Markets</h3>
                <div className="ap-bar"><i style={{ width: "50%" }} /></div>
                <div className="ap-stages">{["Arrive", "Understand", "Make", "Reflect", "Continue"].map((s) => (s === "Make" ? <b key={s}>{s}</b> : <span key={s}>{s}</span>))}</div>
                <div className="ap-foot"><Faces ids={["wanjiru", "efua", "fatou", "nandi"]} /><span className="ap-meta">Thursday · 18:00</span></div>
              </div>
            </Link>
            {CIRCLES.filter((c) => !c.joined).slice(0, 2).map((c) => (
              <Link key={c.id} href={`/circles/${c.id}`} className="ap-card" style={cvar(C.emerald)}>
                <div className="ap-img"><Photo name={c.photo} sizes="360px" className="absolute inset-0 h-full" /><span className="ap-tag">{c.active} active today</span></div>
                <div className="ap-card-body">
                  <h3>{c.name}</h3>
                  <p>{c.blurb}</p>
                  <div className="ap-foot"><span className="ap-meta">{c.members} members</span><span className="ap-btn">Ask to join</span></div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Collaboration */}
        <section className="ap-row" aria-label="Collaboration Studio">
          <Block color={C.royal} on="#fff" pattern="diamonds" glyph="⌘" title="Collaborate" body="Make something neither of you could make alone. Roles, credit and ownership agreed first." stat={`${COLLABS.length} in progress · ${CALLS.length} open calls`} cta="Start a collaboration" href="/collaborate" more={{ label: "Browse open calls", href: "/collaborate" }} />
          <div className="ap-feed">
            {COLLABS.slice(0, 2).map((c) => (
              <Link key={c.id} href={`/collaborate/${c.id}`} className="ap-card" style={cvar(C.royal)}>
                <div className="ap-img"><Photo name={c.photo} sizes="360px" className="absolute inset-0 h-full" /><span className="ap-tag solid">{c.route}</span></div>
                <div className="ap-card-body">
                  <h3>{c.title}</h3>
                  <div className="ap-bar"><i style={{ width: `${c.progress}%` }} /></div>
                  <div className="ap-stages">{STAGES.map((s, i) => (i === c.stage ? <b key={s}>{s}</b> : <span key={s}>{s}</span>))}</div>
                  <div className="ap-foot"><Faces ids={c.makers} /><span className="ap-meta">{c.next}</span></div>
                </div>
              </Link>
            ))}
            {CALLS.slice(0, 1).map((c) => (
              <Link key={c.id} href={`/collaborate/calls/${c.id}`} className="ap-card" style={cvar(C.royal)}>
                <div className="ap-card-body">
                  <span><span className="ap-tag">Open call · {c.days} days left</span></span>
                  <h3>{c.title}</h3>
                  <p>{c.blurb}</p>
                  <div className="ap-meta">{c.org} · {c.city}</div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>{c.tags.map((t) => <span key={t} className="ap-tag">{t}</span>)}</div>
                  <div className="ap-foot"><span className="ap-meta"><Avatar person={PEOPLE[c.by]} size={22} />Curated by {PEOPLE[c.by].name.split(" ")[0]}</span><span className="ap-btn">View call</span></div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Play Together */}
        <section className="ap-row" aria-label="Play Together">
          <Block color={C.tangerine} on="#fff" pattern="waves" glyph="☺" title="Play Together" body="Games as a comfortable reason to connect. Live, slow, in person or as a pair." stat={`${GAMES.length} games · ${GAME_SESSIONS.length} invitations for you`} cta="Choose a game" href="/play" more={{ label: "Create your own game", href: "/play/new" }} />
          <div className="ap-feed">
            {GAME_SESSIONS.map((s) => {
              const g = GAMES.find((x) => x.id === s.game)!;
              const inn = games.includes(s.id);
              return (
                <article key={s.id} className="ap-card" style={cvar(C.tangerine)}>
                  <Link href={`/play/session/${s.id}`} className="ap-img"><Photo name={g.photo} sizes="360px" className="absolute inset-0 h-full" /><span className={`ap-tag${s.live ? " solid" : ""}`}>{s.when}</span></Link>
                  <div className="ap-card-body">
                    <h3>{s.title}</h3>
                    <p>{s.why}</p>
                    <div className="ap-foot">
                      <span className="ap-meta"><Faces ids={s.players} size={22} />{PLAY_MODES.find((m) => m.id === s.mode)!.label}</span>
                      <button className={`ap-btn${inn ? " on" : ""}`} onClick={() => flip(games, setGames, s.id)}>{inn ? "✓ I'm in" : "I'm in"}</button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* Studio visits & shop */}
        <section className="ap-row" aria-label="Studio visits">
          <Block color={C.violet} on="#fff" pattern="stripes" glyph="✦" title="Studios & Shop" body="Step inside an artist's studio, live or in 360°, and buy from people whose story you know." stat={`${STUDIOS.length} studios open this month`} cta="Visit a studio" href="/studios" more={{ label: "Shop art", href: "/shop" }} />
          <div className="ap-feed">
            {STUDIOS.slice(0, 3).map((s) => {
              const a = PEOPLE[s.artist];
              const going = visits.includes(s.id);
              return (
                <article key={s.id} className="ap-card" style={cvar(C.violet)}>
                  <Link href={`/studios/${s.id}`} className="ap-img"><Photo name={s.photo} sizes="360px" className="absolute inset-0 h-full" /><span className="ap-tag solid">{s.mode}</span></Link>
                  <div className="ap-card-body">
                    <div className="ap-meta"><Avatar person={a} size={26} /><b style={{ color: C.ink }}>{a.name}</b></div>
                    <p>{s.blurb}</p>
                    <div className="ap-foot">
                      <span className="ap-meta">{s.place} · {s.when}</span>
                      <button className={`ap-btn${going ? " on" : ""}`} onClick={() => flip(visits, setVisits, s.id)}>{going ? "✓ Booked" : "Book"}</button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* Stories & introductions */}
        <section className="ap-row" aria-label="Stories and introductions">
          <Block color={C.ink} on="#fff" pattern="dots" glyph="❖" title="Stories & people" body="The human story behind the work, and people you might be glad to meet." stat="2 introductions waiting for your yes" cta="Read stories" href="/stories" more={{ label: "Discover people", href: "/kindred" }} />
          <div className="ap-feed">
            {STORIES.slice(0, 2).map((s) => (
              <Link key={s.id} href={`/stories/${s.id}`} className="ap-card" style={cvar(C.fuchsia)}>
                <div className="ap-img"><Photo name={s.photo} sizes="360px" className="absolute inset-0 h-full" /><span className="ap-tag solid">{s.kind}</span></div>
                <div className="ap-card-body">
                  <h3>{s.title}</h3>
                  <p>{s.excerpt}</p>
                  <div className="ap-foot"><span className="ap-meta"><Avatar person={PEOPLE[s.by]} size={22} />{PEOPLE[s.by].name}</span><span className="ap-meta">{s.voice ? `▶ ${s.voice}` : s.read}</span></div>
                </div>
              </Link>
            ))}
            {MATCHES.slice(0, 1).map((m) => {
              const p = PEOPLE[m.id as PersonId];
              const said = hellos.includes(m.id);
              return (
                <article key={m.id} className="ap-card" style={cvar(C.emerald)}>
                  <div className="ap-card-body">
                    <span><span className="ap-tag">A meaningful introduction</span></span>
                    <div className="ap-meta"><Avatar person={p} size={44} /><span><b style={{ color: C.ink, fontSize: 15 }}>{p.name}</b><br />{p.role} · {p.city}</span></div>
                    <p style={{ fontStyle: "italic" }}>“{m.reason}”</p>
                    <div className="ap-foot">
                      <span className="ap-meta">{said ? "Waiting for their yes" : "Needs both yeses"}</span>
                      <button className={`ap-btn${said ? " on" : ""}`} onClick={() => flip(hellos, setHellos, m.id)}>{said ? "✓ Said hello" : "Say hello"}</button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
