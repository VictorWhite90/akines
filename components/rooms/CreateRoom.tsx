"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Ico } from "@/components/chat/bits";
import Avatar from "@/components/ui/Avatar";
import Pic from "@/components/home/Pic";
import { CIRCLES, type Room } from "@/lib/data/community";
import { PHOTO, type PhotoKey } from "@/lib/data/images";
import { ME, allPeople, type PersonId } from "@/lib/data/people";
import { newId } from "@/lib/useLocal";
import RoomCard from "./RoomCard";
import { useMyRooms } from "./MyRooms";

const COVERS: PhotoKey[] = ["frameWall", "textileHang", "paintingHand", "clayWet", "photoAlbum", "kenteVest", "bronzeHead", "studioDim", "galleryHall", "journalWindow", "beadsRed", "talkGroup"];
const TAGS = ["Identity", "Fashion", "History", "Tradition", "Textiles", "Collecting", "Photography", "Painting", "Sculpture", "Writing", "Music", "Other"];
const VIS = [
  { id: "public", icon: "globe", title: "Anyone in Connect", body: "Shows on the Rooms page. Members request a seat." },
  { id: "circle", icon: "users", title: "One of my circles", body: "Only members of a circle you choose can see and join." },
  { id: "private", icon: "lock", title: "Invite only", body: "Hidden. Chat, photos and calls stay between the people you invite." },
] as const;

function whenLabel(now: boolean, date: string, time: string) {
  if (now) return "Starting now";
  if (!date || !time) return "Pick a time";
  const d = new Date(`${date}T${time}`);
  const day = d.toLocaleDateString([], { weekday: "short" });
  return `${day} · ${time}`;
}

const dayISO = (offset: number) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
};

/** "Create a room": a form on the left and a live preview of the card everyone will see on the right. */
export default function CreateRoom({ circle: circleParam }: { circle?: string }) {
  const router = useRouter();
  const [, setRooms] = useMyRooms();
  const startCircle = CIRCLES.find((c) => c.id === circleParam);

  const [title, setTitle] = useState("");
  const [about, setAbout] = useState("");
  const [tag, setTag] = useState("Identity");
  const [photo, setPhoto] = useState<PhotoKey>("frameWall");
  const [now, setNow] = useState(true);
  const [date, setDate] = useState(() => dayISO(1));
  const [time, setTime] = useState("19:00");
  const [vis, setVis] = useState<"public" | "circle" | "private">(startCircle ? "circle" : "public");
  const [circle, setCircle] = useState(startCircle?.id ?? CIRCLES.find((c) => c.joined)?.id ?? CIRCLES[0].id);
  const [invited, setInvited] = useState<PersonId[]>([]);
  const [prompts, setPrompts] = useState<string[]>(["", ""]);
  const [approve, setApprove] = useState(false);
  const [tried, setTried] = useState(false);

  const others = allPeople.filter((p) => p.id !== ME.id);
  const toggleInvite = (id: PersonId) => setInvited((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : cur.length >= 5 ? cur : [...cur, id]));
  const valid = title.trim().length >= 4;

  const draft: Room = {
    id: "preview",
    title: title.trim() || "Your room's name",
    host: ME.id as PersonId,
    when: whenLabel(now, date, time),
    status: "soon",
    blurb: about.trim() || "A few words on what you'd like to talk about, so people know what they're sitting down to.",
    seated: [ME.id as PersonId, ...invited],
    photo,
    tag,
    mine: true,
    visibility: vis,
    circle: vis === "circle" ? circle : undefined,
  };

  const create = () => {
    setTried(true);
    if (!valid) return;
    const room: Room = {
      ...draft,
      id: newId("room"),
      blurb: about.trim() || `A room for ${title.trim()}. Come as you are.`,
      prompts: prompts.map((p) => p.trim()).filter(Boolean),
      approve,
    };
    setRooms((cur) => [room, ...cur]);
    router.push(`/rooms/${room.id}${now ? "?demo=start" : ""}`);
  };

  return (
    <div className="flex flex-col gap-7">
      <div>
        <Link href="/rooms" className="text-[13px] font-semibold text-mute hover:text-night">← All rooms</Link>
        <p className="ac-eyebrow mt-4">Host a room</p>
        <h1 className="font-display mt-1 text-[38px] leading-[1.05] md:text-[46px]">Open a room. <em>Six chairs, your rules.</em></h1>
        <p className="mt-3 max-w-2xl text-[16px] leading-relaxed text-mute">Chat, share photos and voice notes, and go live together. Choose who can come in, and we&apos;ll tell them.</p>
      </div>

      <div className="cr">
        <div className="cr-form">
          <section className="cr-step">
            <h2><i>1</i>What&apos;s the room about?</h2>
            <p>A clear name and a line or two helps the right people take a seat.</p>
            <label className="l" htmlFor="rt">Room name <span className="cnt">{title.length}/70</span></label>
            <input id="rt" type="text" maxLength={70} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Reading Ben Okri&apos;s indigo essays together" />
            {tried && !valid && <p className="cr-err">Give your room a name (at least 4 letters).</p>}
            <label className="l" htmlFor="ra">Description</label>
            <textarea id="ra" value={about} onChange={(e) => setAbout(e.target.value)} placeholder="What will you talk about? Who is it for? What should people bring?" />
            <label className="l">Topic</label>
            <div className="cr-tags">{TAGS.map((t) => <button key={t} type="button" className={tag === t ? "on" : ""} onClick={() => setTag(t)}>{t}</button>)}</div>
            <label className="l">Ways in <span className="cnt">optional: prompts people can tap in the chat</span></label>
            <div style={{ display: "grid", gap: 8 }}>
              {prompts.map((p, i) => (
                <input key={i} type="text" value={p} onChange={(e) => setPrompts((cur) => cur.map((x, j) => (j === i ? e.target.value : x)))} placeholder={i === 0 ? "e.g. A cloth you keep, and who gave it to you." : "Another way into the conversation"} />
              ))}
            </div>
          </section>

          <section className="cr-step">
            <h2><i>2</i>Pick a cover</h2>
            <p>The picture on your room&apos;s card. Choose one that says what the room is about.</p>
            <div className="cr-covers">
              {COVERS.map((k) => (
                <button key={k} type="button" className={photo === k ? "on" : ""} onClick={() => setPhoto(k)} aria-label={PHOTO[k].alt} aria-pressed={photo === k}><Pic name={k} sizes="120px" /></button>
              ))}
            </div>
          </section>

          <section className="cr-step">
            <h2><i>3</i>When?</h2>
            <p>Go live right away, or pick a time and everyone invited gets a reminder.</p>
            <div className="cr-seg" role="radiogroup" aria-label="When">
              <button type="button" className={now ? "on" : ""} onClick={() => setNow(true)}>Go live now</button>
              <button type="button" className={!now ? "on" : ""} onClick={() => setNow(false)}>Schedule for later</button>
            </div>
            {!now && (
              <div className="cr-when">
                <div><label className="l" htmlFor="rd">Date</label><input id="rd" type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
                <div><label className="l" htmlFor="rm">Time</label><input id="rm" type="time" value={time} onChange={(e) => setTime(e.target.value)} /></div>
              </div>
            )}
          </section>

          <section className="cr-step">
            <h2><i>4</i>Who can come in?</h2>
            <p>You can change this later from the room.</p>
            <div className="cr-opts" role="radiogroup" aria-label="Who can join">
              {VIS.map((v) => (
                <button key={v.id} type="button" role="radio" aria-checked={vis === v.id} className={`cr-opt${vis === v.id ? " on" : ""}`} onClick={() => setVis(v.id)}>
                  <b><Ico n={v.icon} size={16} />{v.title}</b>
                  <small>{v.body}</small>
                </button>
              ))}
            </div>

            {vis === "circle" && (
              <>
                <label className="l">Which circle?</label>
                <div className="cr-tags">{CIRCLES.map((c) => <button key={c.id} type="button" className={circle === c.id ? "on" : ""} onClick={() => setCircle(c.id)}>{c.name}</button>)}</div>
              </>
            )}

            <label className="l">{vis === "private" ? "Invite people" : "Invite people (optional)"} <span className="cnt">{invited.length}/5 seats</span></label>
            <div className="cr-people">
              {others.map((p) => {
                const on = invited.includes(p.id as PersonId);
                return (
                  <button key={p.id} type="button" className={on ? "on" : ""} onClick={() => toggleInvite(p.id as PersonId)} aria-pressed={on}>
                    <Avatar person={p} size={30} />
                    <span><b>{p.name}</b><small>{p.role} · {p.city}</small></span>
                    <span className="ck">{on ? "✓" : ""}</span>
                  </button>
                );
              })}
            </div>

            <div style={{ marginTop: 14 }}>
              <div className="cr-toggle">
                <span>Approve who takes a seat<small>Requests wait for you. Recommended for public rooms.</small></span>
                <button type="button" className={`cr-sw${approve ? " on" : ""}`} role="switch" aria-checked={approve} aria-label="Approve who takes a seat" onClick={() => setApprove((v) => !v)} />
              </div>
            </div>
          </section>
        </div>

        <aside className="cr-side">
          <p className="lab">Preview <span>What others see</span></p>
          <RoomCard room={draft} preview />
          <p className="cr-note"><b>Six chairs.</b> Up to six people can sit in the live call at once. Everyone else in the room can still chat and share photos and voice notes. Nothing is recorded.</p>
          <button className="cr-go" onClick={create} disabled={tried && !valid}>{now ? "Create and go live →" : "Create room →"}</button>
        </aside>
      </div>
    </div>
  );
}
