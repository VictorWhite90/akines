"use client";

import { useEffect, useState } from "react";

/** Fake playback clock: advances one second per second until `total`. */
export function useSimulatedPlayback(total: number) {
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const done = elapsed >= total;

  useEffect(() => {
    if (!playing || done) return;
    const timer = setInterval(() => setElapsed((prev) => Math.min(prev + 1, total)), 1000);
    return () => clearInterval(timer);
  }, [playing, done, total]);

  function toggle() {
    if (done) {
      setElapsed(0);
      setPlaying(true);
      return;
    }
    setPlaying((p) => !p);
  }

  return { isPlaying: playing && !done, elapsed, done, toggle, progress: total ? (elapsed / total) * 100 : 0, seek: setElapsed };
}
