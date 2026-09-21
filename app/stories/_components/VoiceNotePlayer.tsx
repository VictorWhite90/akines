"use client";

import { useState } from "react";
import { DocumentText1, Microphone2, Pause, Play } from "iconsax-reactjs";
import { formatTime, toSeconds } from "../_data";
import { useSimulatedPlayback } from "./useSimulatedPlayback";

export default function VoiceNotePlayer({ artistName, duration, transcript }: { artistName: string; duration: string; transcript: string }) {
  const total = toSeconds(duration);
  const { isPlaying, elapsed, done, toggle, progress } = useSimulatedPlayback(total);
  const [showTranscript, setShowTranscript] = useState(false);
  const firstName = artistName.split(" ")[0];

  return (
    <div className="rounded-[4px] border border-sand-200 bg-white p-5">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={toggle}
          aria-label={isPlaying ? `Pause ${firstName}'s voice note` : `Play ${firstName}'s voice note`}
          className="flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center rounded-full bg-green-950 text-white transition-colors hover:bg-green-900"
        >
          {isPlaying ? <Pause size={22} variant="Bold" color="currentColor" aria-hidden /> : <Play size={22} variant="Bold" color="currentColor" aria-hidden />}
        </button>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 text-sm font-semibold text-green-950">
            <Microphone2 size={16} color="currentColor" aria-hidden /> {firstName}, in their own voice
          </p>
          <div className="relative mt-2 h-1.5 rounded-full bg-sand-200" aria-hidden>
            <span className="absolute inset-y-0 left-0 rounded-full bg-gold-500 transition-[width] duration-1000 ease-linear" style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-1.5 flex justify-between text-xs text-grey-700">
            <span>
              <span className="sr-only">Played </span>
              {formatTime(elapsed)}
            </span>
            <span>
              <span className="sr-only">of </span>
              {duration}
            </span>
          </p>
        </div>
      </div>
      <p className="sr-only" aria-live="polite">
        {done ? "Voice note finished." : isPlaying ? "Playing voice note." : elapsed > 0 ? "Paused." : ""}
      </p>
      <button
        type="button"
        onClick={() => setShowTranscript((v) => !v)}
        aria-expanded={showTranscript}
        aria-controls="voice-transcript"
        className="mt-4 inline-flex cursor-pointer items-center gap-1.5 text-sm font-semibold text-green-950 underline underline-offset-4"
      >
        <DocumentText1 size={16} color="currentColor" aria-hidden />
        {showTranscript ? "Hide transcript" : "Read the transcript"}
      </button>
      {showTranscript && (
        <p id="voice-transcript" className="mt-3 rounded-[4px] bg-sand-100 p-4 text-sm leading-relaxed text-grey-800">
          {transcript}
        </p>
      )}
      <p className="mt-3 text-xs text-grey-700">Prototype: playback is simulated — no audio is streamed.</p>
    </div>
  );
}
