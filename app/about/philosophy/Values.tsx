"use client";

import Link from "next/link";
import { useState } from "react";

const VALUES = ["Trust", "Belonging", "Conversation", "Reciprocity", "Contribution", "Continuity"];

/** Community values: tap a value to bring it forward (the first is selected, as in Figma). */
export default function Values() {
  const [on, setOn] = useState(0);
  return (
    <section className="cp-values" aria-label="Community values">
      <div className="cp-values-media">
        {/* eslint-disable-next-line @next/next/no-img-element -- static brand photo */}
        <img src="/akines/philosophy/trust.jpg" alt="Friends greeting each other with a handshake outside" loading="lazy" />
        <Link href="/login" className="cp-btn dark">Find Your People</Link>
      </div>
      <ul className="cp-values-list">
        {VALUES.map((v, i) => (
          <li key={v}><button className={i === on ? "on" : undefined} aria-pressed={i === on} onClick={() => setOn(i)}>{v.toUpperCase()}</button></li>
        ))}
      </ul>
    </section>
  );
}
