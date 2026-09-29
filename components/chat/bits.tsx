"use client";

import { useEffect, useState } from "react";
import { PEOPLE, type PersonId } from "@/lib/data/people";

/* ---------- tiny icons ---------- */
const P = {
  mic: <><path d="M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3Z" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></>,
  cam: <><rect x="3" y="6" width="13" height="12" rx="2" /><path d="m16 10 5-3v10l-5-3" /></>,
  clip: <path d="m20 11-8.5 8.5a5 5 0 0 1-7-7L13 4a3.5 3.5 0 0 1 5 5l-8.5 8.5a2 2 0 0 1-3-3L14 7" />,
  send: <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7Z" />,
  image: <><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="9" cy="10" r="1.6" /><path d="m21 16-5-5-8 8" /></>,
  leave: <path d="M3 15c5-5 13-5 18 0l-2.5 2.5-3-2v-3a12 12 0 0 0-7 0v3l-3 2L3 15Z" />,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8v.01" /></>,
  trash: <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" />,
  live: <><circle cx="12" cy="12" r="2.2" /><path d="M7.5 7.5a6.4 6.4 0 0 0 0 9M16.5 7.5a6.4 6.4 0 0 1 0 9M4.6 4.6a10.5 10.5 0 0 0 0 14.8M19.4 4.6a10.5 10.5 0 0 1 0 14.8" /></>,
  lock: <><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></>,
  globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" /></>,
  plus: <path d="M12 5v14M5 12h14" />,
  users: <><circle cx="9" cy="8" r="3.2" /><path d="M3 20c0-3.5 2.7-6 6-6s6 2.5 6 6M16 5a3.2 3.2 0 0 1 0 6M18 14c2 .7 3 2.5 3 5" /></>,
  trend: <path d="m3 17 6-6 4 4 8-9M15 6h6v6" />,
  hash: <path d="M5 9h14M4 15h14M10 3 8 21M16 3l-2 18" />,
};
export type IcoName = keyof typeof P;
export function Ico({ n, size = 20, off = false }: { n: IcoName; size?: number; off?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {P[n]}
      {off && <path d="M4 4l16 16" />}
    </svg>
  );
}

export const BARS = [8, 14, 22, 12, 28, 18, 34, 20, 12, 26, 38, 24, 16, 30, 42, 26, 14, 20, 32, 22, 10, 18, 28, 36];
export const secs = (t: string) => Number(t.split(":")[0]) * 60 + Number(t.split(":")[1]);
export const mmss = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
export const clock = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
export const first = (id: PersonId) => PEOPLE[id].name.split(" ")[0];

/** A voice note bubble with simulated playback. */
export function Voice({ length, mine }: { length: string; mine: boolean }) {
  const total = secs(length);
  const [playing, setPlaying] = useState(false);
  const [pos, setPos] = useState(0);
  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => {
      setPos((p) => {
        if (p + 0.25 >= total) {
          setPlaying(false);
          return 0;
        }
        return p + 0.25;
      });
    }, 250);
    return () => window.clearInterval(id);
  }, [playing, total]);
  const done = Math.round((pos / total) * BARS.length);
  return (
    <div className={`voice${mine ? " mine" : ""}`}>
      <button onClick={() => setPlaying((v) => !v)} aria-label={playing ? "Pause voice note" : "Play voice note"}>{playing ? "❚❚" : "▶︎"}</button>
      <div className="wave" aria-hidden>{BARS.map((h, i) => <i key={i} style={{ height: h * 0.55 + 4 }} className={i < done ? "on" : undefined} />)}</div>
      <span>{playing ? mmss(pos) : length}</span>
    </div>
  );
}
