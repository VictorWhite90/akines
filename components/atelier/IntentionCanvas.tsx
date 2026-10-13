"use client";

import Link from "next/link";
import { useState } from "react";
import Avatar from "@/components/ui/Avatar";
import Photo from "@/components/ui/Photo";
import type { PhotoKey } from "@/lib/data/images";
import { ME, PEOPLE, type PersonId } from "@/lib/data/people";
import { useLocal } from "@/lib/useLocal";

/** Private mood. It only tints the paper and shapes suggestions; nobody else sees it. */
const MOODS = [
  { id: "heavy", label: "Heavy", swatch: "#3d4a94", a: "rgba(38,48,107,.30)", b: "rgba(70,62,110,.22)" },
  { id: "unsure", label: "Unsure", swatch: "#7c86b8", a: "rgba(80,96,160,.22)", b: "rgba(194,96,63,.10)" },
  { id: "steady", label: "Steady", swatch: "#c9973a", a: "rgba(38,48,107,.16)", b: "rgba(201,151,58,.20)" },
  { id: "open", label: "Open", swatch: "#d98a4e", a: "rgba(194,96,63,.20)", b: "rgba(201,151,58,.22)" },
  { id: "bright", label: "Bright", swatch: "#c2603f", a: "rgba(194,96,63,.28)", b: "rgba(240,190,90,.26)" },
];

type Status = "cliq" | "intro" | "open" | "circle";
type Item = { kind: string; title: string; why: string; status: Status; href: string; person?: PersonId; photo?: PhotoKey; size?: "big" | "small"; far?: boolean };

const STATUS: Record<Status, { label: string; color: string }> = {
  cliq: { label: "In your Cliq", color: "#c9973a" },
  intro: { label: "Introduction · needs both yeses", color: "#3d4a94" },
  open: { label: "Open seat", color: "#5e7d52" },
  circle: { label: "Your KinCircle", color: "#c2603f" },
};

const INTENTIONS: { id: string; label: string; items: Item[] }[] = [
  {
    id: "collaborate",
    label: "Collaborate on something real",
    items: [
      { kind: "Person", person: "wanjiru", title: "Wanjiru Kamau", why: "Her disappearing-markets project needs a collector who knows Lagos. You'd bring the eye; she brings the lens.", status: "circle", href: "/atelier/introduction", size: "big" },
      { kind: "KinCircle", photo: "talkGroup", title: "West African Markets", why: "Week 4 of 8. The group is choosing which stories to exhibit.", status: "circle", href: "/circles" },
      { kind: "Introduction", person: "leila", title: "Leila Benali", why: "A collector in Casablanca who argues well. Complementary, not similar.", status: "intro", href: "/atelier/introduction", size: "small" },
      { kind: "Studio", photo: "studioEasel", title: "Open a Collaboration Studio", why: "Roles, credit and ownership agreed before anyone makes anything.", status: "open", href: "/collaborate" },
      { kind: "Person", person: "efua", title: "Efua Boateng", why: "Oral-history notes from Kejetia market. Quiet lately; this might be a warm way back.", status: "circle", href: "/atelier/introduction", size: "small", far: true },
    ],
  },
  {
    id: "witnessed",
    label: "Be witnessed",
    items: [
      { kind: "Presence Room", photo: "talkMugs", title: "What does home remember?", why: "Six seats, two left. Everyone speaks once before anyone replies.", status: "open", href: "/atelier/room", size: "big" },
      { kind: "Person", person: "kwame", title: "Kwame Mensah", why: "He shared something unfinished with you this morning. You could return the trust.", status: "cliq", href: "/banter/unfinished" },
      { kind: "Banter", photo: "paintingWoman", title: "Show us something unfinished you're afraid to share", why: "Today's Banter, only to your Makers' Cliq.", status: "cliq", href: "/banter#compose", size: "small" },
      { kind: "Journal", photo: "journalWindow", title: "Write a page, keep it private", why: "Not everything needs an audience. Some days the page is enough.", status: "open", href: "/journal", far: true },
    ],
  },
  {
    id: "complementary",
    label: "Find a complementary voice",
    items: [
      { kind: "Introduction", person: "leila", title: "Leila Benali", why: "You collect for story; she collects to argue. Same love, different questions.", status: "intro", href: "/atelier/introduction", size: "big" },
      { kind: "Introduction", person: "chidi", title: "Chidi Eze", why: "A student learning to look. You could be the collector he learns from.", status: "intro", href: "/atelier/introduction" },
      { kind: "Person", person: "zuri", title: "Zuri Nwosu", why: "Curates the diaspora conversations you keep returning to.", status: "cliq", href: "/atelier/introduction", size: "small" },
      { kind: "Creative DNA", photo: "notebookWhite", title: "Show what you'd like to be found for", why: "Your DNA is yours to edit. Akines only uses what you choose to reveal.", status: "open", href: "/dna", far: true },
    ],
  },
  {
    id: "uncertainty",
    label: "Sit with uncertainty",
    items: [
      { kind: "Presence Room", photo: "calmBench", title: "Creating through uncertainty", why: "A quiet room. Nobody has to perform certainty here.", status: "open", href: "/atelier/room", size: "big" },
      { kind: "Person", person: "nandi", title: "Nandi Moyo", why: "Hosts the gentlest rooms on Akines. She's hosting tonight.", status: "circle", href: "/atelier/room" },
      { kind: "Wellbeing", photo: "calmWater", title: "A two-minute breathing pause", why: "Private. Nothing is shared.", status: "open", href: "/wellbeing", size: "small" },
      { kind: "Game", photo: "calmSilhouette", title: "Choose a colour for today", why: "A slow game with Thandi. Skipping is always fine.", status: "cliq", href: "/play/colour-today", far: true },
    ],
  },
  {
    id: "small",
    label: "Make something small",
    items: [
      { kind: "Game", photo: "studioEasel", title: "Complete this unfinished artwork", why: "One line each. Ayo and Thandi are playing at six.", status: "cliq", href: "/play/unfinished-artwork", size: "big" },
      { kind: "Person", person: "ayo", title: "Ayo Balogun", why: "Dyeing panel 7 right now. Ask what the vat taught them today.", status: "cliq", href: "/banter#compose" },
      { kind: "Studio", photo: "clayBowl", title: "Post a sketch to your studio", why: "Three people visited this week. A small update keeps them close.", status: "open", href: "/studio", size: "small" },
    ],
  },
  {
    id: "alone",
    label: "Feel less alone",
    items: [
      { kind: "Banter Now", photo: "talkLaugh", title: "Is AI helping or damaging African art?", why: "Live now with Tunde, Kwame and Zuri. Join to listen first.", status: "cliq", href: "/banter/now/ai-art", size: "big" },
      { kind: "Person", person: "thandi", title: "Thandi Dlamini", why: "Her bowls live on your table. A voice note would land well.", status: "cliq", href: "/banter#compose" },
      { kind: "Game", photo: "photoAlbum", title: "How Well Do We Remember?", why: "Kwame's university game night, 20:00. You were invited for a reason.", status: "circle", href: "/play/session/uni-night", size: "small" },
      { kind: "Wellbeing", photo: "calmBench", title: "Talk to someone trained", why: "Verified art therapists, when you'd like more than a friend.", status: "open", href: "/wellbeing", far: true },
    ],
  },
];

export default function IntentionCanvas({ initial = null }: { initial?: string | null }) {
  const [mood, setMood] = useLocal<string>("ak:atelier-mood", "steady");
  const [intent, setIntent] = useState<string | null>(initial);
  const [own, setOwn] = useState("");
  const m = MOODS.find((x) => x.id === mood) ?? MOODS[2];
  const chosen = INTENTIONS.find((i) => i.id === intent);
  const hour = new Date().getHours();
  const greet = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="at">
      <span className="at-wash" style={{ width: 620, height: 620, left: -160, top: -120, background: m.a }} aria-hidden />
      <span className="at-wash" style={{ width: 540, height: 540, right: -140, top: 260, background: m.b, animationDelay: "-9s" }} aria-hidden />

      <div className="at-moods" role="radiogroup" aria-label="How you're arriving, privately">
        <span className="at-mono" style={{ marginRight: 4 }}>Arriving · private</span>
        {MOODS.map((x) => (
          <button key={x.id} role="radio" aria-checked={mood === x.id} aria-label={x.label} title={x.label} className={`at-mood${mood === x.id ? " on" : ""}`} style={{ background: x.swatch }} onClick={() => setMood(x.id)} />
        ))}
      </div>

      <div className="at-canvas">
        <div className="at-prompt">
          <p className="at-mono">{greet}, {ME.name.split(" ")[0]} · {m.label.toLowerCase()} today</p>
          <h1 className="at-serif">What are you <em>hoping for</em> today?</h1>
          <div className="at-chips" role="radiogroup" aria-label="Your intention">
            {INTENTIONS.map((i) => (
              <button key={i.id} role="radio" aria-checked={intent === i.id} className={`at-chip${intent === i.id ? " on" : ""}`} onClick={() => setIntent(intent === i.id ? null : i.id)}>{i.label}</button>
            ))}
          </div>
          <div className="at-or">
            <input value={own} onChange={(e) => setOwn(e.target.value)} onKeyDown={(e) => e.key === "Enter" && own.trim() && setIntent("collaborate")} placeholder="…or say it in your own words" aria-label="Your intention in your own words" />
          </div>
        </div>

        {!chosen ? (
          <p className="at-empty">Nothing is shown until you choose. Your people and spaces arrive when there&apos;s a reason for them to.</p>
        ) : (
          <div key={chosen.id} className="at-field">
            {chosen.items.map((it) => (
              <div key={it.title} className={`at-orb${it.size ? ` ${it.size}` : ""}${it.far ? " far" : ""}`}>
                <Link href={it.href} className="at-card torn">
                  {it.photo && <Photo name={it.photo} sizes="420px" className={`${it.size === "big" ? "h-48" : "h-32"} mb-4 rounded-[14px]`} />}
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    {it.person && <Avatar person={PEOPLE[it.person]} size={it.size === "big" ? 64 : 48} />}
                    <div style={{ minWidth: 0 }}>
                      <p className="at-mono" style={{ margin: 0 }}>{it.kind}</p>
                      <p className="at-serif" style={{ margin: "2px 0 0", fontSize: it.size === "big" ? 26 : 20, lineHeight: 1.15 }}>{it.title}</p>
                    </div>
                  </div>
                  <p className="at-why">{it.why}</p>
                  <span className="at-status" style={{ marginTop: 6 }}><i style={{ background: STATUS[it.status].color }} />{STATUS[it.status].label}</span>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
