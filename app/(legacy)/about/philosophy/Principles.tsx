"use client";

import { useRef } from "react";
import { ArrowLeft, ArrowRight, Layer, People, RecordCircle, Share } from "iconsax-reactjs";

const ICON = { people: People, layer: Layer, record: RecordCircle, share: Share } as const;
const LIST: { icon: keyof typeof ICON; title: string; body: string }[] = [
  { icon: "people", title: "People before content", body: "The person, not the post, is the centre." },
  { icon: "layer", title: "Depth before popularity", body: "Five dependable relationships beat 50,000 followers." },
  { icon: "record", title: "Intention before interaction", body: "Members say why they connect before anyone is matched." },
  { icon: "people", title: "Shared activity, less pressure", body: "Games, projects and meals give people a natural way in." },
  { icon: "people", title: "A human rhythm", body: "Arrive, understand, do, reflect, continue." },
  { icon: "people", title: "Continuity builds bonds", body: "Circles, projects and reminders grow relationships." },
  { icon: "people", title: "Everyone can contribute", body: "No influencers or audiences, just people with something to offer." },
  { icon: "people", title: "Difference connects", body: "Match on what people share and what each can bring." },
  { icon: "people", title: "Wellbeing by design", body: "Quiet check-ins and a path to professional help." },
  { icon: "people", title: "Commerce for community", body: "My Store lets members trade skills and products they trust." },
  { icon: "people", title: "AI supports, never replaces", body: "AI works in the background. Members control it." },
  { icon: "share", title: "Safety, consent, dignity", body: "Say no, pause or leave anytime, without penalty." },
];

/** Our Principles: twelve 424px cards in a row you scroll with the arrows or a swipe. */
export default function Principles() {
  const row = useRef<HTMLDivElement>(null);
  const go = (d: number) => row.current?.scrollBy({ left: d * 448, behavior: "smooth" });
  return (
    <section className="cp-principles" aria-labelledby="cp-pr">
      <header>
        <div>
          <h2 id="cp-pr">Our Principles</h2>
          <p>Twelve principles for meaningful, intentional and enduring human connection.</p>
        </div>
        <div className="cp-nav">
          <button onClick={() => go(-1)} aria-label="Previous principles"><ArrowLeft size={24} color="currentColor" /></button>
          <button onClick={() => go(1)} aria-label="Next principles"><ArrowRight size={24} color="currentColor" /></button>
        </div>
      </header>
      <div className="cp-row" ref={row}>
        {LIST.map((p) => {
          const I = ICON[p.icon];
          return (
            <article key={p.title} className="cp-pcard">
              <I size={52} color="var(--ak-icon-akines-secondary, #f4a63a)" />
              <div><h3>{p.title}</h3><p>{p.body}</p></div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
