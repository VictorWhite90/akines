"use client";

import { useEffect, useRef, useState } from "react";

const AUTO_ROTATE_MS = 6000;

/** Full-width, auto-overlaid slides for the Home hero. Auto-rotates, pauses on hover/focus. Prefix: hero-. */
export default function HeroCarousel({ slides }: { slides: React.ReactNode[] }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const n = slides.length;

  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (n <= 1 || paused) return;
    timer.current = setInterval(() => setI((cur) => (cur + 1) % n), AUTO_ROTATE_MS);
    return () => { if (timer.current) clearInterval(timer.current); };
  }, [n, paused]);

  const jump = (next: number) => { setI(next); setPaused(true); };

  return (
    <section className="hero hero-carousel" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}>
      <div className="hero-track" style={{ transform: `translateX(-${i * 100}%)` }}>
        {slides.map((s, idx) => (
          <div className="hero-slide" key={idx} aria-hidden={idx !== i}>{s}</div>
        ))}
      </div>
      {n > 1 && (
        <>
          <button type="button" className="hero-arrow prev" onClick={() => jump((i - 1 + n) % n)} aria-label="Previous slide">‹</button>
          <button type="button" className="hero-arrow next" onClick={() => jump((i + 1) % n)} aria-label="Next slide">›</button>
          <div className="hero-dots" role="tablist" aria-label="Hero slides">
            {slides.map((_, idx) => (
              <button key={idx} type="button" role="tab" aria-selected={idx === i} className={idx === i ? "on" : undefined} aria-label={`Slide ${idx + 1}`} onClick={() => jump(idx)} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
