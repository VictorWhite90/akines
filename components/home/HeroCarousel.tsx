"use client";

import { useState } from "react";

/** Full-width, auto-overlaid slides for the Home hero. Prefix: hero-. */
export default function HeroCarousel({ slides }: { slides: React.ReactNode[] }) {
  const [i, setI] = useState(0);
  const n = slides.length;
  const go = (d: number) => setI((cur) => (cur + d + n) % n);

  return (
    <section className="hero hero-carousel">
      <div className="hero-track" style={{ transform: `translateX(-${i * 100}%)` }}>
        {slides.map((s, idx) => (
          <div className="hero-slide" key={idx} aria-hidden={idx !== i}>{s}</div>
        ))}
      </div>
      {n > 1 && (
        <>
          <button type="button" className="hero-arrow prev" onClick={() => go(-1)} aria-label="Previous slide">‹</button>
          <button type="button" className="hero-arrow next" onClick={() => go(1)} aria-label="Next slide">›</button>
          <div className="hero-dots" role="tablist" aria-label="Hero slides">
            {slides.map((_, idx) => (
              <button key={idx} type="button" role="tab" aria-selected={idx === i} className={idx === i ? "on" : undefined} aria-label={`Slide ${idx + 1}`} onClick={() => setI(idx)} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
