"use client";

import Link from "next/link";
import { ArrowRight, CalendarDays, Check, CircleCheck } from "lucide-react";
import Button from "@/components/kin/Button";
import { faceSrc } from "@/components/kin/home/parts";
import type { BanterNow } from "@/lib/data/banter";
import { PEOPLE } from "@/lib/data/people";
import { useLocal } from "@/lib/useLocal";

/** The product design's Banter page (Community Home, /community/banter) (classes in components/kin/community.css): what it is, who is there, then join. */
export default function BanterIntro({ session }: { session: BanterNow }) {
  const [reminded, setReminded] = useLocal<string[]>("ak:banter-reminders", []);
  const host = PEOPLE[session.host];
  const others = session.people.filter((p) => p !== session.host);
  const named = others.slice(0, 2).map((p) => PEOPLE[p].name.split(" ")[0]);
  const rest = others.length - named.length;
  const withText = named.length ? `, with ${named.join(rest > 0 ? ", " : " and ")}${rest > 0 ? ` and ${rest} other${rest > 1 ? "s" : ""}` : ""}` : "";
  const on = reminded.includes(session.id);
  return (
    <div className="ch-page">
      <div className="ch-split">
        <div className="ch-split__main">
          <Link href="/" className="ch-tlink">Back to Community Home</Link>
          <p className="ch-label">Banter · {session.context}</p>
          <h1 className="ch-split__title" data-m="words">{session.topic}</h1>
          <p className="ch-split__desc">An open conversation. Listen first, or join in when you feel like it.</p>
          <p className="ch-when"><CalendarDays size={20} strokeWidth={1.25} aria-hidden /><span>{session.live ? "Live now" : `Starts ${session.startsIn ?? "soon"}`} · {session.minutes} minutes</span></p>
          <div className="ch-ppl">
            <span className="ch-avs" style={{ "--ch-av-gap": "-10px" } as React.CSSProperties}>
              {session.people.slice(0, 3).map((p) => {
                const src = faceSrc(p, 80);
                // eslint-disable-next-line @next/next/no-img-element -- member face
                return <span key={p} className="ch-av ch-av--light" style={{ width: 40, height: 40 }}>{src ? <img src={src} alt="" /> : null}</span>;
              })}
            </span>
            <span className="ch-ppl__text">Hosted by {host.name.split(" ")[0]}{withText}</span>
          </div>
          <p className="ch-label">How it works</p>
          <ul className="ch-bullets">
            {["A short prompt from the host", "Open conversation, with no pressure to speak", "A quiet minute to close"].map((t) => <li key={t}><Check size={16} strokeWidth={1.5} aria-hidden /><span>{t}</span></li>)}
          </ul>
          <div className="ch-acts ch-acts--col">
            {on ? (
              <>
                <p className="ch-confirm" aria-live="polite"><CircleCheck size={20} strokeWidth={1.5} aria-hidden /><span>{session.live ? "You are in. The conversation is open now." : "You are in. We will remind you before it starts."}</span></p>
                <button type="button" className="ch-tlink" onClick={() => setReminded(reminded.filter((x) => x !== session.id))}>Leave Banter</button>
              </>
            ) : (
              <Button iconRight={<ArrowRight strokeWidth={1.5} aria-hidden />} onClick={() => setReminded([...reminded, session.id])}>Join Banter</Button>
            )}
          </div>
        </div>
        <div className="ch-split__photo">
          <div className="ch-photo ch-photo--fill" data-m="frame">
            {/* eslint-disable-next-line @next/next/no-img-element -- the design's Banter photo */}
            <img className="cover" src="/kin/banter/friends.jpg" alt="" loading="eager" decoding="async" />
          </div>
        </div>
      </div>
    </div>
  );
}
