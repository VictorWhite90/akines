"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import Icon from "@/components/ui/Icon";

const BARS = [8, 14, 22, 12, 28, 18, 34, 20, 12, 26, 38, 24, 16, 30, 42, 26, 14, 20, 32, 22, 10, 18, 28, 36, 20, 12, 24, 16, 30, 18, 10, 22, 14, 8];

function toSeconds(t: string) {
  const [m, s] = t.split(":").map(Number);
  return m * 60 + s;
}
const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

/** A voice note in the maker's own voice (simulated playback, no audio yet). */
export default function VoiceNote({ length, caption, tone = "light" }: { length: string; caption: string; tone?: "light" | "dark" }) {
  const total = toSeconds(length);
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

  const dark = tone === "dark";
  const done = Math.round((pos / total) * BARS.length);
  return (
    <div className={cn("flex items-center gap-4 rounded-2xl p-3.5 pr-5", dark ? "bg-paper-50/10" : "border border-line bg-paper-100")}>
      <button onClick={() => setPlaying((v) => !v)} aria-label={playing ? "Pause voice note" : "Play voice note"} className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-clay-500 text-paper-50 hover:bg-clay-600">
        <Icon name={playing ? "pause" : "play-media"} size={14} />
      </button>
      <div className="min-w-0 flex-1">
        <div className="flex h-10 items-center gap-[3px]" aria-hidden>
          {BARS.map((h, i) => (
            <span key={i} className={cn("w-[3px] shrink-0 rounded-full transition-colors", i < done ? "bg-clay-500" : dark ? "bg-paper-50/35" : "bg-ink-900/25")} style={{ height: h }} />
          ))}
        </div>
        <p className={cn("mt-1 truncate text-xs", dark ? "text-ink-200" : "text-mute")}>{caption}</p>
      </div>
      <span className={cn("text-sm tabular-nums", dark ? "text-ink-100" : "text-ink-800")}>{fmt(pos)} / {length}</span>
    </div>
  );
}
