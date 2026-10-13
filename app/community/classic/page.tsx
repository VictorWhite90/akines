import { Fragment } from "react";
import Link from "next/link";
import Avatar, { AvatarStack } from "@/components/ui/Avatar";
import Composer from "@/components/feed/Composer";
import HeroCarousel from "@/components/home/HeroCarousel";
import HomeFeed from "@/components/home/HomeFeed";
import Pic from "@/components/home/Pic";
import ShopStrip from "@/components/home/ShopStrip";
import { Introduction, MoodCheckin, ReserveButtons } from "@/components/home/HomeClient";
import { CALLS, CIRCLES, COLLABS, ROOMS, STUDIOS } from "@/lib/data/community";
import { JOURNAL } from "@/lib/data/journals";
import { MATCHES } from "@/lib/data/matches";
import { PEOPLE } from "@/lib/data/people";
import { ARTWORK, STORIES } from "@/lib/data/stories";
import { DNA_SUMMARY, DNA_TITLE } from "@/lib/data/dna";
import type { PhotoKey } from "@/lib/data/images";

const room = ROOMS[0];
const host = PEOPLE[room.host];
const collab = COLLABS[0];
const call = CALLS[0];
const callBy = PEOPLE[call.by];
const match = MATCHES[0];
const today = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" }).replace(/^(\w+),? /, "$1 · ");

function StoryTile({ href, photo, type, voice, by, title, text, left, right }: { href: string; photo: PhotoKey; type: string; voice?: string; by: keyof typeof PEOPLE; title: string; text: string; left: string; right: string }) {
  const p = PEOPLE[by];
  return (
    <Link href={href} className="story">
      <div className="story-img">
        <Pic name={photo} sizes="(max-width: 760px) 80vw, 340px" />
        <span className="type">{type}</span>
        {voice && <span className="voice">▶︎ {voice} in their voice</span>}
      </div>
      <div className="story-body">
        <div className="byline"><Avatar person={p} size={26} />{p.name} · {p.city}</div>
        <h4>{title}</h4>
        <p>{text}</p>
        <div className="react"><span>{left}</span><span>{right}</span></div>
      </div>
    </Link>
  );
}

export default function Courtyard() {
  const joinedCircles = CIRCLES.filter((c) => c.joined);
  const journals = JOURNAL.filter((j) => j.photo).slice(0, 2);
  const circleFaces = ["ayo", "zuri", "thandi"].map((id) => PEOPLE[id as keyof typeof PEOPLE]);
  const circleMembers = joinedCircles.reduce((sum, c) => sum + c.members, 0);

  const kincircleSlide = (
    <Fragment key="kincircle">
      <Pic name="kincircleHero" sizes="(max-width: 1060px) 100vw, 900px" priority position="center 32%" />
      <div className="hero-copy">
        <span className="pill"><span className="live-dot" /> KinCircle</span>
        <h2>Bring together the right people around a shared purpose.</h2>
        <p>Build trust, support one another and create something meaningful—without the noise of another group chat.</p>
        <div className="hero-actions">
          <Link className="join" href="/circles/new">Start a KinCircle</Link>
          <Link className="ghost" href="/circles">See how it works</Link>
        </div>
      </div>
      <div className="attendees">
        <AvatarStack people={circleFaces} size={32} max={3} ringClass="ring-white" />
        <span className="count">{joinedCircles.length} circles · {circleMembers} creatives</span>
      </div>
    </Fragment>
  );

  const roomSlide = (
    <Fragment key="room">
      <Pic name="heroStudio" sizes="(max-width: 1060px) 100vw, 900px" position="center 30%" />
      <div className="hero-copy">
        <span className="pill"><span className="live-dot" /> Presence Room · {room.when}</span>
        <h2>{room.title}</h2>
        <p>{room.blurb} Hosted by {host.role.toLowerCase()} {host.name}. No audience, not recorded, no performance. Just presence.</p>
        <ReserveButtons roomId={room.id} />
      </div>
      <div className="attendees">
        {room.seated.slice(0, 3).map((id) => <span className="avatar-wrap" key={id}><Avatar person={PEOPLE[id]} size={32} /></span>)}
        <span className="count">{room.seated.length} of 6 joined</span>
      </div>
    </Fragment>
  );

  return (
    <>
      <div className="welcome">
        <div>
          <div className="ac-eyebrow">Your creative community</div>
          <h1>Welcome back, <em>Amara.</em></h1>
        </div>
        <div className="date">{today}</div>
      </div>

      <div className="home-hero"><HeroCarousel slides={[kincircleSlide, roomSlide]} /></div>

      <div className="home-grid">
        <div>

          <section className="collab-hub">
            <div className="collab-intro">
              <div>
                <div className="ac-eyebrow">Akines Collaboration Studio</div>
                <h2>Make something <em>neither of you could make alone.</em></h2>
                <p>Find complementary creative voices, answer curated open calls, and build together in a protected project room, from first spark to exhibition and shared revenue.</p>
              </div>
              <Link href="/collaborate" className="launch-collab">Explore collaborations <span>↗</span></Link>
            </div>
            <div className="collab-strip">
              <Link href={`/collaborate/${collab.id}`} className="project-card featured-project">
                <div className="project-visual">
                  <Pic name="collabArt" sizes="(max-width: 760px) 100vw, 300px" />
                  <span className="project-tag">Featured collaboration</span>
                  <div className="project-people">
                    {collab.makers.map((m) => <span className="avatar-wrap" key={m}><Avatar person={PEOPLE[m]} size={31} /></span>)}
                    <b>＋</b>
                  </div>
                </div>
                <div className="project-copy">
                  <div className="project-meta">{collab.route.replace(" × ", " × ")} · {collab.medium}</div>
                  <h3>{collab.title}</h3>
                  <p>{collab.blurb}</p>
                  <div className="progress-line"><i style={{ width: `${collab.progress}%` }} /></div>
                  <div className="progress-label"><span>Making</span><span>{collab.progress}% · {collab.next.toLowerCase()}</span></div>
                </div>
              </Link>
              <article className="open-call">
                <div className="call-top"><span className="call-type">Curator open call</span><span className="deadline">{call.days} days left</span></div>
                <h3>{call.title}</h3>
                <p>{call.blurb}</p>
                <div className="criteria">{call.tags.map((t) => <span key={t}>{t}</span>)}</div>
                <div className="curator-row">
                  <Avatar person={callBy} size={35} />
                  <div><b>{callBy.name}</b><small>Verified curator · {call.city}</small></div>
                  <Link href={`/collaborate/calls/${call.id}`}>View call</Link>
                </div>
              </article>
            </div>
            <div className="collab-values">
              <span><b>01</b> Portfolio-first applications</span>
              <span><b>02</b> Roles &amp; rights agreed upfront</span>
              <span><b>03</b> Shared milestones</span>
              <span><b>04</b> Permanent creator credits</span>
            </div>
          </section>

          <div className="home-gap"><Composer /></div>

          <section className="home-section">
            <div className="section-title">
              <div><h2>Stories with a pulse</h2><p>Not a feed. A few moments a week, chosen for what they say.</p></div>
              <Link href="/stories">Explore all →</Link>
            </div>
            <div className="cards">
              {STORIES.slice(0, 3).map((s, i) => (
                <StoryTile key={s.id} href={`/stories/${s.id}`} photo={s.photo} type={s.kind} voice={s.voice} by={s.by} title={s.title} text={s.excerpt} left={["♡ 128 felt this", "♡ 96 felt this", "♡ 211 felt this"][i]} right={`${s.reflections} reflections`} />
              ))}
            </div>
          </section>

          <div className="section-title">
            <div><h2>Your circles&rsquo; feed</h2><p>What people are sharing in the circles you&rsquo;ve joined.</p></div>
          </div>
          <HomeFeed circleIds={joinedCircles.map((c) => c.id)} />

          <section className="home-section">
            <div className="section-title">
              <div><h2>Witness the journey</h2><p>Living journals and the legacy every artwork carries.</p></div>
              <Link href="/journal">Open journals →</Link>
            </div>
            <div className="cards">
              {journals.map((j) => (
                <StoryTile key={j.id} href="/journal" photo={j.photo!} type={j.kind === "artist" ? "Artist journal" : "Collector journal"} by={j.by} title={j.title} text={j.text.split(". ")[0] + "."} left={j.mood ?? ""} right={j.date} />
              ))}
              <StoryTile href={`/stories/${ARTWORK.id}#legacy`} photo={ARTWORK.photo} type="Art Legacy" by={ARTWORK.artist} title="This painting has had three homes." text="Made in Accra, acquired in Casablanca, and now asked about every morning." left="5 chapters" right="Read its story →" />
            </div>
          </section>

          <section className="home-section">
            <div className="section-title">
              <div><h2>Step inside the studio</h2><p>Live, virtual, 360° or VR. Talk to the maker directly.</p></div>
              <Link href="/studios">All visits →</Link>
            </div>
            <div className="cards">
              {STUDIOS.slice(0, 3).map((v) => {
                const a = PEOPLE[v.artist];
                return <StoryTile key={v.id} href="/studios" photo={v.photo} type={v.mode} by={v.artist} title={`${a.name}'s studio`} text={v.blurb} left={v.when} right={v.place} />;
              })}
            </div>
          </section>

          <ShopStrip />
        </div>

        <div className="side-stack">
          <Introduction id={match.id} reason={match.reason} signals={match.signals} opener={match.opener} />
          <MoodCheckin />
          <section className="panel">
            <div className="panel-head"><h3>Your circles</h3><Link href="/circles">See all</Link></div>
            <div className="circle-list">
              {joinedCircles.map((c) => (
                <Link key={c.id} href={`/circles/${c.id}`} className="circle">
                  <div className="circle-thumb"><Pic name={c.photo} sizes="48px" /></div>
                  <div><h4>{c.name}</h4><small>{c.members} members · {c.active} active</small></div>
                  <span className="open">Open</span>
                </Link>
              ))}
            </div>
          </section>
          <section className="panel insight">
            <div className="ac-eyebrow">Your Creative DNA</div>
            <h3>{DNA_TITLE}.</h3>
            <p>{DNA_SUMMARY}</p>
            <Link href="/dna">Explore my Creative DNA →</Link>
          </section>
        </div>
      </div>
    </>
  );
}
