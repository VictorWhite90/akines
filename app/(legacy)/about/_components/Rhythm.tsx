"use client";

import { useRef, useState } from "react";
import { ArrowLeft2, ArrowRight2, Book1, Brush2, Heart, LampCharge, Profile2User } from "iconsax-reactjs";

const STEPS = [
  {
    title: "Arrive",
    blurb: "Say what you need from this moment.",
    glow: "#2f6bff",
    Icon: LampCharge,
    guideTitle: "Arrive with intention",
    guide: "Choose “I want fresh ideas,” “I need encouragement,” or simply “I want company.” This gives everyone permission to be honest.",
  },
  {
    title: "Understand",
    blurb: "Find the human story behind the profile.",
    glow: "#f29a38",
    Icon: Profile2User,
    guideTitle: "Understand the person",
    guide: "See what someone is making, what they care about and why you were introduced, before you ever say hello.",
  },
  {
    title: "Make",
    blurb: "Create, play or solve something together.",
    glow: "#f4d23c",
    Icon: Brush2,
    guideTitle: "Make something together",
    guide: "A shared prompt, a game or a small project gives the conversation somewhere to go, so nobody has to perform.",
  },
  {
    title: "Reflect",
    blurb: "Create, play or solve something together.",
    glow: "#4fb3c8",
    Icon: Book1,
    guideTitle: "Reflect on what happened",
    guide: "Notice what landed and what you would like more of. Reflections stay private unless you choose to share them.",
  },
  {
    title: "Continue",
    blurb: "Choose the next small act of connection.",
    glow: "#a259f0",
    Icon: Heart,
    guideTitle: "Continue the connection",
    guide: "Suggest a next step that feels natural: another session, a voice note or an invitation to a KinCircle.",
  },
];

export default function Rhythm() {
  const [active, setActive] = useState(0);
  const row = useRef<HTMLOListElement>(null);
  const step = STEPS[active];

  // On narrow screens the cards scroll sideways, so keep the chosen one in view.
  const go = (i: number) => {
    setActive(i);
    row.current?.children[i]?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
  };

  return (
    <div className="ak-steps">
      <ol className="ak-step-row" ref={row}>
        {STEPS.map((s, i) => (
          <li key={s.title}>
            <button
              type="button"
              className={`ak-step${i === active ? " is-active" : ""}`}
              onClick={() => go(i)}
              aria-pressed={i === active}
              style={{ "--glow": s.glow } as React.CSSProperties}
            >
              <span className="ak-step-num">{String(i + 1).padStart(2, "0")}</span>
              <span className="ak-step-body">
                <span className="ak-step-title">{s.title}</span>
                <span className="ak-step-blurb">{s.blurb}</span>
              </span>
            </button>
          </li>
        ))}
      </ol>

      <div className="ak-guide" aria-live="polite">
        <span className="ak-guide-icon" aria-hidden><step.Icon size={28} color="currentColor" variant="Bulk" /></span>
        <div className="ak-guide-copy">
          <h3>{step.guideTitle}</h3>
          <p>{step.guide}</p>
        </div>
        <div className="ak-guide-nav">
          <button type="button" aria-label="Previous step" disabled={active === 0} onClick={() => go(active - 1)}>
            <ArrowLeft2 size={20} color="currentColor" />
          </button>
          <button type="button" aria-label="Next step" disabled={active === STEPS.length - 1} onClick={() => go(active + 1)}>
            <ArrowRight2 size={20} color="currentColor" />
          </button>
        </div>
      </div>
    </div>
  );
}
