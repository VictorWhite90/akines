"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import ChatThread from "@/components/chat/ChatThread";
import { Ico } from "@/components/chat/bits";
import { useChannelChat } from "@/components/chat/useChat";
import Pic from "@/components/home/Pic";
import MyRooms, { useMyRooms } from "@/components/rooms/MyRooms";
import RoomCard from "@/components/rooms/RoomCard";
import Avatar, { AvatarStack } from "@/components/ui/Avatar";
import { AiTag } from "@/components/ui/Chip";
import { circleActivities } from "@/lib/data/circleActivities";
import { ROOMS, type Circle, type Room } from "@/lib/data/community";
import { CHANNELS, circleMembers, seedChannels, type ChannelId } from "@/lib/data/circleChat";
import type { PhotoKey } from "@/lib/data/images";
import { ME, PEOPLE, type PersonId } from "@/lib/data/people";
import { TRENDS, type Region, type Trend } from "@/lib/data/trends";
import { newId, useLocal } from "@/lib/useLocal";
import { useJoined } from "./useJoined";

type Tab = "chat" | "trends" | "rooms" | "activities";

/** Which seeded Presence Room best fits each circle. */
const ROOM_FOR: Record<string, string[]> = {
  "african-fashion": ["women-fashion"],
  photography: ["photography-memory"],
  "digital-art": ["home"],
  textiles: ["indigo-memory"],
  ceramics: ["collecting"],
  collectors: ["collecting"],
  curators: ["collecting", "home"],
  diaspora: ["home"],
  "young-artists": ["home", "photography-memory"],
  "traditional-arts": ["masks", "benin-bronze"],
};

const REGIONS: ("All" | Region)[] = ["All", "Africa", "Europe", "Americas", "Asia", "Worldwide"];

function TrendCard({ t, onDiscuss }: { t: Trend; onDiscuss: (t: Trend) => void }) {
  const [saved, setSaved] = useState(false);
  return (
    <article className="cs-trend">
      <div className="ph"><Pic name={t.photo} sizes="360px" /><span className="reg">{t.region}</span></div>
      <div className="bd">
        <p className="meta"><b>{t.tag}</b> · {t.when}</p>
        <h3>{t.title}</h3>
        <p className="sum">{t.summary}</p>
        <div className="ft">
          <span className="src">{t.source === "AI summary" ? <AiTag /> : t.source}</span>
          <span className="btns">
            <button onClick={() => setSaved((v) => !v)} className={saved ? "on" : ""} aria-pressed={saved}>{saved ? "Saved" : "Save"}</button>
            <button className="pri" onClick={() => onDiscuss(t)}>Discuss in chat</button>
          </span>
        </div>
      </div>
    </article>
  );
}

/** A Creative Circle as a community: channel chat, what's happening worldwide, and rooms for calls and private chat. */
export default function CircleSpace({ circle, startTab }: { circle: Circle; startTab?: string }) {
  const router = useRouter();
  const { has, toggle } = useJoined();
  const joined = has(circle.id);
  const members = useMemo(() => circleMembers(circle), [circle]);
  const cc = useChannelChat(useMemo(() => seedChannels(circle), [circle]), members);
  const trends = TRENDS[circle.id];
  const [, setRooms] = useMyRooms();
  const [rsvp, setRsvp] = useLocal<Record<string, boolean>>("cs:rsvp", {});

  const [tab, setTab] = useState<Tab>(startTab === "trends" || startTab === "rooms" || startTab === "activities" ? startTab : "chat");
  const [channel, setChannel] = useState<ChannelId>("general");
  const [draft, setDraft] = useState("");
  const [lightbox, setLightbox] = useState<PhotoKey | null>(null);
  const [info, setInfo] = useState(false);
  const [region, setRegion] = useState<"All" | Region>("All");
  const [reminded, setReminded] = useState<string[]>([]);
  const input = useRef<HTMLTextAreaElement>(null);
  const me = ME.id as PersonId;
  const host = members[0];

  const shownStories = trends.stories.filter((s) => region === "All" || s.region === region);
  const roomIds = ROOM_FOR[circle.id] ?? ["home"];
  const liveRooms = roomIds.map((id) => ROOMS.find((r) => r.id === id)).filter((r): r is Room => Boolean(r));
  const activities = useMemo(() => circleActivities(circle), [circle]);

  const discuss = (t: Trend) => {
    cc.chatFor("general").push({ from: me, kind: "text", text: `Sharing from Trends: “${t.title}” (${t.region}). What do you make of it?` });
    cc.chatFor("general").simulateReply();
    setChannel("general");
    setTab("chat");
  };
  const talkAbout = (topic: string) => {
    setDraft(`Let's talk about: ${topic}. `);
    setChannel("general");
    setTab("chat");
    window.setTimeout(() => input.current?.focus(), 50);
  };

  const makeRoom = (quick: boolean) => {
    if (!quick) return router.push(`/rooms/new?circle=${circle.id}`);
    const room: Room = {
      id: newId("room"),
      title: `${circle.name} huddle`,
      host: me,
      when: "Starting now",
      status: "soon",
      blurb: `A private huddle for ${circle.name} members. Chat, share photos and go live.`,
      seated: [me],
      photo: circle.photo,
      tag: circle.name,
      mine: true,
      visibility: "private",
      circle: circle.id,
    };
    setRooms((cur) => [room, ...cur]);
    router.push(`/rooms/${room.id}?demo=start`);
  };

  return (
    <div className="rs cs">
      <section className="rs-main">
        <header className="rs-head">
          <Link href="/circles" className="back" aria-label="All circles">←</Link>
          <div className="thumb"><Pic name={circle.photo} sizes="48px" /></div>
          <div className="who">
            <h1>{circle.name}</h1>
            <p>{circle.members} members · <span className="cs-on">{circle.active} active now</span></p>
          </div>
          <div className="acts">
            <button className="go" onClick={() => makeRoom(true)}><Ico n="live" size={17} /> Quick huddle</button>
            <button className="ic show-sm" onClick={() => setInfo((v) => !v)} aria-label="Circle info"><Ico n="info" /></button>
          </div>
        </header>

        <nav className="cs-tabs" aria-label="Circle sections">
          <button className={tab === "chat" ? "on" : ""} onClick={() => setTab("chat")}><Ico n="hash" size={16} /> Chat</button>
          <button className={tab === "trends" ? "on" : ""} onClick={() => setTab("trends")}><Ico n="trend" size={16} /> Trends</button>
          <button className={tab === "rooms" ? "on" : ""} onClick={() => setTab("rooms")}><Ico n="users" size={16} /> Rooms</button>
          <button className={tab === "activities" ? "on" : ""} onClick={() => setTab("activities")}><Ico n="globe" size={16} /> Activities</button>
        </nav>

        {tab === "chat" && (
          <>
            <div className="cs-chan" role="tablist" aria-label="Channels">
              {CHANNELS.map((c) => (
                <button key={c.id} role="tab" aria-selected={channel === c.id} className={channel === c.id ? "on" : ""} onClick={() => setChannel(c.id)} title={c.blurb}># {c.label}</button>
              ))}
            </div>
            <ChatThread
              key={channel}
              chat={cc.chatFor(channel)}
              hostId={host}
              placeholder={`Message #${CHANNELS.find((c) => c.id === channel)?.label}`}
              draft={draft}
              setDraft={setDraft}
              inputRef={input}
              onOpenPhoto={setLightbox}
              readOnly={joined ? undefined : { text: `Join ${circle.name} to write, share photos and send voice notes.`, cta: "Join circle", onCta: () => toggle(circle.id) }}
            />
          </>
        )}

        {tab === "trends" && (
          <div className="cs-scroll">
            <div className="cs-sec">
              <p className="ac-eyebrow">Around the world</p>
              <h2>What&apos;s moving in {circle.name}</h2>
              <p className="sub">Short summaries of what members and the circle&apos;s curators are noticing. Tap one to talk it through with the circle.</p>
              <div className="cs-topics">
                {trends.topics.map((t) => <button key={t} onClick={() => talkAbout(t)}><Ico n="trend" size={13} /> {t}</button>)}
              </div>
            </div>

            <div className="cs-regions" role="group" aria-label="Region">
              {REGIONS.map((r) => <button key={r} className={region === r ? "on" : ""} onClick={() => setRegion(r)}>{r}</button>)}
            </div>

            <div className="cs-trends">
              {shownStories.map((t) => <TrendCard key={t.id} t={t} onDiscuss={discuss} />)}
              {shownStories.length === 0 && <p className="cs-empty">Nothing from {region} this week. Try another region.</p>}
            </div>

            <div className="cs-sec">
              <h2 className="sm">Coming up</h2>
              <ul className="cs-events">
                {trends.events.map((ev) => {
                  const on = reminded.includes(ev.title);
                  return (
                    <li key={ev.title}>
                      <span className="k">{ev.kind}</span>
                      <div><b>{ev.title}</b><small>{ev.place} · {ev.when}</small></div>
                      <button className={on ? "on" : ""} onClick={() => setReminded((cur) => (on ? cur.filter((x) => x !== ev.title) : [...cur, ev.title]))}>{on ? "Reminder set" : "Remind me"}</button>
                    </li>
                  );
                })}
              </ul>
              <p className="cs-fine">Prototype: these summaries are sample content, not live news.</p>
            </div>
          </div>
        )}

        {tab === "rooms" && (
          <div className="cs-scroll">
            <div className="cs-sec">
              <p className="ac-eyebrow">Talk, live</p>
              <h2>Rooms for {circle.name}</h2>
              <p className="sub">Open a private room for a smaller conversation. You get chat, photos, voice notes and a live call, and only the people you invite can come in.</p>
              <div className="cs-actions">
                <button className="pri" onClick={() => makeRoom(false)}>＋ Create a room</button>
                <button onClick={() => makeRoom(true)}><Ico n="lock" size={14} /> Quick private huddle</button>
              </div>
            </div>
            <MyRooms circle={circle.id} />
            <div className="cs-sec">
              <h2 className="sm">Open rooms this circle likes</h2>
              <div className="cs-roomgrid">{liveRooms.map((r) => <RoomCard key={r.id} room={r} />)}</div>
            </div>
          </div>
        )}

        {tab === "activities" && (
          <div className="cs-scroll">
            <div className="cs-sec">
              <p className="ac-eyebrow">Do something together</p>
              <h2>Activities for {circle.name}</h2>
              <p className="sub">People bond more effectively when they do something together, not just talk. A few things members here are planning.</p>
            </div>
            <div className="cs-activities">
              {activities.map((a) => {
                const going = rsvp[a.id] ?? false;
                const goingPeople = a.going.map((id) => PEOPLE[id]);
                return (
                  <article key={a.id} className="cs-activity">
                    <div className="ph"><Pic name={a.photo} sizes="320px" /><span className="mode">{a.mode}</span></div>
                    <div className="bd">
                      <p className="meta">{a.when} · {a.where}</p>
                      <h3>{a.title}</h3>
                      <p className="sum">{a.blurb}</p>
                      <div className="ft">
                        <span className="who">
                          {goingPeople.length > 0 && <AvatarStack people={goingPeople} size={24} max={4} />}
                          {goingPeople.length + (going ? 1 : 0)} going
                        </span>
                        <button className={going ? "on" : ""} onClick={() => setRsvp((cur) => ({ ...cur, [a.id]: !going }))}>{going ? "You're going" : "RSVP"}</button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        )}
      </section>

      <aside className={`rs-side${info ? " open" : ""}`}>
        <button className="close show-sm" onClick={() => setInfo(false)} aria-label="Close">×</button>
        <div className="about">
          <div className="banner"><Pic name={circle.photo} sizes="360px" /><span>Creative circle</span></div>
          <h2>{circle.name}</h2>
          <p className="blurb">{circle.blurb}</p>
          <div className="invite">
            <span>{joined ? "You're in this circle" : "You're not in this circle yet"}</span>
            <button onClick={() => toggle(circle.id)}>{joined ? "Leave" : "Join"}</button>
          </div>
        </div>

        <div className="blk">
          <h3>Pinned</h3>
          <div className="cs-pin"><b>Today&apos;s starter</b><p>{circle.starter}</p></div>
        </div>

        <div className="blk">
          <h3>Members <small>{circle.members} in total</small></h3>
          <ul className="people">
            {members.map((id, i) => {
              const p = PEOPLE[id];
              const away = p.presence === "quiet" || p.presence === "studio";
              return (
                <li key={id}>
                  <Avatar person={p} size={34} />
                  <div><b>{id === me ? `${p.name} (you)` : p.name}</b><small>{p.role} · {p.city}</small></div>
                  {i === 0 && <em className="tag">Host</em>}
                  <span className={`st ${away ? "away" : "on"}`}>{away ? "Away" : "Online"}</span>
                </li>
              );
            })}
          </ul>
        </div>

        <p className="promise">Kind, curious and specific. Critique uses three lines: what&apos;s working, what&apos;s unclear, try this.</p>
      </aside>
      {info && <div className="rs-scrim show-sm" onClick={() => setInfo(false)} aria-hidden />}

      {lightbox && (
        <div className="rs-modal dark" onClick={() => setLightbox(null)} role="dialog" aria-modal="true" aria-label="Photo">
          <button className="x" onClick={() => setLightbox(null)} aria-label="Close">×</button>
          <div className="big"><Pic name={lightbox} sizes="900px" /></div>
        </div>
      )}
    </div>
  );
}
