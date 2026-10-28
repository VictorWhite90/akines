"use client";

import Link from "next/link";
import { useState } from "react";
import { TickCircle } from "iconsax-reactjs";

const EXPERIENCES = [
  {
    tab: "KinCircle",
    tag: "Small group · 4 weeks",
    visualTitle: "Build a KinCircle",
    visualBody: "A consistent group that grows through shared rituals, not random drop-ins.",
    title: "Your people, with a reason to return",
    body: "Bring together up to eight people around a shared intention—from launching a small business to settling into a new city.",
    benefits: ["Choose a clear purpose and duration", "Meet on a rhythm that suits everyone", "Grow trust through shared rituals"],
    cta: { label: "Create a KinCircle", href: "/circles/new" },
    tint: "#c27a2b",
  },
  {
    tab: "Banter",
    tag: "Live · 20 minutes",
    visualTitle: "Start a Banter",
    visualBody: "Light, hosted conversation with people who share your curiosity.",
    title: "Easy conversation, no performance",
    body: "Drop into a short chat built around one good prompt, so talking to someone new feels natural rather than forced.",
    benefits: ["Pick a prompt that interests you", "Talk in small groups, never to a crowd", "Leave whenever you like, no pressure"],
    cta: { label: "Start a Banter", href: "/banter" },
    tint: "#2f8fa8",
  },
  {
    tab: "Collaborate",
    tag: "Project · open-ended",
    visualTitle: "Open a Collaboration Studio",
    visualBody: "A shared space to plan, make and finish something together.",
    title: "Make something worth sharing",
    body: "Find collaborators whose skills complement yours, agree on what you are making, and keep the work moving in one place.",
    benefits: ["Agree roles and goals up front", "Share drafts, files and feedback", "Credit everyone who contributed"],
    cta: { label: "Start a collaboration", href: "/collaborate" },
    tint: "#7a5ad0",
  },
  {
    tab: "Play Together",
    tag: "Activity · 30 minutes",
    visualTitle: "Play Together",
    visualBody: "Games and creative challenges that break the ice for you.",
    title: "Connection that starts with fun",
    body: "Short, playful activities give people something to do side by side, so friendships form without anyone having to try too hard.",
    benefits: ["Choose a game or creative challenge", "Play with friends or meet new people", "Turn a good round into a next meetup"],
    cta: { label: "Play together", href: "/play" },
    tint: "#d4a020",
  },
  {
    tab: "My Store",
    tag: "Your shop · always open",
    visualTitle: "Open My Store",
    visualBody: "Sell your work to people who already know your story.",
    title: "Support that feels personal",
    body: "Share your work with a community that has watched it take shape, and let relationships, not algorithms, bring you buyers.",
    benefits: ["List work in a few minutes", "Tell the story behind every piece", "Get paid securely by people who care"],
    cta: { label: "Open my store", href: "/store" },
    tint: "#d0603a",
  },
];

export default function Experiences() {
  const [active, setActive] = useState(0);
  const x = EXPERIENCES[active];

  return (
    <div className="ak-exp">
      <div className="ak-exp-tabs" role="tablist" aria-label="Akines experiences">
        {EXPERIENCES.map((e, i) => (
          <button
            key={e.tab}
            type="button"
            role="tab"
            id={`ak-exp-tab-${i}`}
            aria-selected={i === active}
            aria-controls="ak-exp-panel"
            className={`ak-exp-tab${i === active ? " is-active" : ""}`}
            onClick={() => setActive(i)}
          >
            {e.tab}
          </button>
        ))}
      </div>

      <div className="ak-exp-card" role="tabpanel" id="ak-exp-panel" aria-labelledby={`ak-exp-tab-${active}`}>
        <div className="ak-exp-visual" style={{ "--tint": x.tint } as React.CSSProperties}>
          <img className="ak-exp-orbit" src="/akines/kincircle-orbit.svg" alt="" width={434} height={434} />
          <div className="ak-exp-visual-copy">
            <p className="ak-exp-tag">{x.tag}</p>
            <h3>{x.visualTitle}</h3>
            <p>{x.visualBody}</p>
          </div>
        </div>

        <div className="ak-exp-content">
          <div className="ak-exp-intro">
            <h3>{x.title}</h3>
            <p>{x.body}</p>
          </div>
          <ul className="ak-exp-benefits">
            {x.benefits.map((b) => (
              <li key={b}>
                <TickCircle size={32} color="#f4a63a" aria-hidden />
                <span>{b}</span>
              </li>
            ))}
          </ul>
          <Link href="/login" className="ak-btn ak-exp-cta">{x.cta.label}</Link>
        </div>
      </div>
    </div>
  );
}
