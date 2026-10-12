"use client";

import { Pause, Play } from "iconsax-reactjs";
import Media from "@/components/ui/Media";
import { formatTime, toSeconds } from "../_data";
import { useSimulatedPlayback } from "./useSimulatedPlayback";

export default function StudioVideo({ poster, duration, caption }: { poster: string; duration: string; caption: string }) {
  const { isPlaying, elapsed, done, toggle, progress } = useSimulatedPlayback(toSeconds(duration));
  const started = elapsed > 0 || isPlaying;

  return (
    <figure className="overflow-hidden rounded-[4px] border border-sand-200 bg-white">
      <Media src={poster} alt={`Studio film still: ${caption}`} ratio="16/9" sizes="(max-width: 1024px) 100vw, 720px">
        <span className={started ? "absolute inset-0 bg-green-950/35" : "absolute inset-0 bg-green-950/20"} aria-hidden />
        <button
          type="button"
          onClick={toggle}
          aria-label={isPlaying ? "Pause studio video" : done ? "Replay studio video" : "Play studio video"}
          className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/95 text-green-950 shadow-lg transition-transform hover:scale-105"
        >
          {isPlaying ? <Pause size={28} variant="Bold" color="currentColor" aria-hidden /> : <Play size={28} variant="Bold" color="currentColor" aria-hidden />}
        </button>
        {started && (
          <div className="absolute inset-x-0 bottom-0 p-3" aria-hidden>
            <div className="h-1 rounded-full bg-white/40">
              <span className="block h-full rounded-full bg-gold-400 transition-[width] duration-1000 ease-linear" style={{ width: `${progress}%` }} />
            </div>
            <p className="mt-1.5 text-xs font-semibold text-white">{formatTime(elapsed)} / {duration}</p>
          </div>
        )}
      </Media>
      <figcaption className="flex flex-wrap items-center justify-between gap-2 p-4 text-sm">
        <span className="text-green-950">{caption}</span>
        <span className="text-xs text-grey-700">{duration} · simulated playback</span>
      </figcaption>
      <p className="sr-only" aria-live="polite">{done ? "Video finished." : isPlaying ? "Playing studio video." : ""}</p>
    </figure>
  );
}
