"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Button from "@/components/ui/Button";

const PHASES = [
  { label: "Breathe in", seconds: 4, scale: 1 },
  { label: "Hold", seconds: 4, scale: 1 },
  { label: "Breathe out", seconds: 6, scale: 0.55 },
] as const;
const CYCLE = PHASES.reduce((sum, p) => sum + p.seconds, 0);
const ROUNDS = 4;

const QUERY = "(prefers-reduced-motion: reduce)";
function subscribe(cb: () => void) {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}
function useReducedMotion() {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false,
  );
}

function phaseAt(tick: number) {
  let t = tick % CYCLE;
  for (const phase of PHASES) {
    if (t < phase.seconds) return { phase, remaining: phase.seconds - t };
    t -= phase.seconds;
  }
  return { phase: PHASES[0], remaining: PHASES[0].seconds };
}

/**
 * Breathing exercise (W1): an expanding circle paced 4-4-6. With
 * prefers-reduced-motion it becomes a text-only guide with no animation.
 */
export default function Breathing() {
  const reduced = useReducedMotion();
  const [running, setRunning] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      setTick((t) => {
        if (t + 1 >= CYCLE * ROUNDS) {
          setRunning(false);
          return CYCLE * ROUNDS;
        }
        return t + 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [running]);

  const finished = tick >= CYCLE * ROUNDS;
  const { phase, remaining } = phaseAt(tick);
  const round = Math.min(Math.floor(tick / CYCLE) + 1, ROUNDS);
  const status = finished ? "Well done. Notice how you feel now." : running ? phase.label : "Ready when you are";

  return (
    <div className="flex flex-col items-center gap-5 text-center">
      {reduced ? (
        <div className="flex min-h-[200px] w-full flex-col items-center justify-center gap-2 rounded-[4px] bg-calm-bg p-6">
          <p className="font-playfair text-3xl font-semibold text-green-950">{status}</p>
          {running && <p className="text-sm text-grey-800">{remaining} seconds</p>}
          <p className="mt-2 text-xs text-grey-700">Animation is off because your device asks for reduced motion.</p>
        </div>
      ) : (
        <div className="relative flex h-[220px] w-[220px] items-center justify-center" aria-hidden>
          <span className="absolute inset-0 rounded-full border border-calm/30" />
          <span
            className="absolute inset-0 rounded-full bg-calm/25 ease-in-out"
            style={{
              transform: `scale(${running ? phase.scale : 0.55})`,
              transitionProperty: "transform",
              transitionDuration: running ? `${phase.seconds}s` : "0.6s",
            }}
          />
          <span className="relative font-playfair text-xl font-semibold text-green-950">{status}</span>
        </div>
      )}
      <p className="sr-only" aria-live="polite">
        {running ? `${phase.label}, ${phase.seconds} seconds` : status}
      </p>
      <p className="text-sm text-grey-700">
        In for 4 · hold for 4 · out for 6{running && !finished ? ` · round ${round} of ${ROUNDS}` : ""}
      </p>
      <div className="flex gap-3">
        {running ? (
          <Button variant="outline" onClick={() => setRunning(false)}>
            Pause
          </Button>
        ) : (
          <Button
            variant="outline"
            onClick={() => {
              if (finished) setTick(0);
              setRunning(true);
            }}
          >
            {finished ? "Again" : tick > 0 ? "Resume" : "Begin"}
          </Button>
        )}
        {tick > 0 && !running && (
          <Button variant="ghost" onClick={() => setTick(0)}>
            Reset
          </Button>
        )}
      </div>
    </div>
  );
}
