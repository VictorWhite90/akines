"use client";

import Link from "next/link";
import { useState } from "react";
import Badge from "@/components/ui/Badge";
import { INTENTS, MY_DNA } from "@/lib/data";
import ConsentToggle from "@/app/dna/_components/ConsentToggle";

/** "Why am I seeing these?" — explains matching and hands the controls back to the member (T3). */
export default function MatchingControls() {
  const [paused, setPaused] = useState(false);
  const [visibleToMatches, setVisibleToMatches] = useState(MY_DNA.privacy.visibleToMatches);
  const [inferFromBehaviour, setInferFromBehaviour] = useState(MY_DNA.privacy.inferFromBehaviour);

  return (
    <aside aria-labelledby="why-heading" className="flex flex-col gap-5 rounded-[4px] border border-sand-200 bg-sand-100 p-5">
      <div>
        <h2 id="why-heading" className="font-playfair text-lg font-semibold text-green-950">
          Why am I seeing these?
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-grey-800">
          We match on what you&apos;ve <strong>told us</strong> (your intents, practices and themes) and, only because you allowed it, on what you <strong>do</strong> here (rooms
          you join, stories you open).
        </p>
        <p className="mt-2 text-sm leading-relaxed text-grey-800">
          We also weigh availability, geography, language and readiness. We never use popularity, sales, follower counts — or anything from your private wellbeing space.
        </p>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-grey-700">Driven by your intents</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {MY_DNA.intents.map((id) => (
            <Badge key={id} tone="green">
              {INTENTS.find((i) => i.id === id)?.label}
            </Badge>
          ))}
        </div>
        <Link href="/dna" className="mt-3 inline-block text-sm font-semibold text-green-950 underline underline-offset-4">
          Change intents in My Creative DNA
        </Link>
      </div>

      <div className="flex flex-col gap-4 border-t border-sand-300 pt-4">
        <ConsentToggle
          label="Pause introductions"
          description={paused ? "Paused. No new introductions until you turn this back on. The ones below stay." : "Take a break any time — nobody is told."}
          checked={paused}
          onChange={setPaused}
        />
        <ConsentToggle
          label="Learn from my activity"
          description={inferFromBehaviour ? "Rooms and stories you engage with can shape matches." : "Only your declared answers shape matches."}
          checked={inferFromBehaviour}
          onChange={setInferFromBehaviour}
        />
        <ConsentToggle
          label="Let others be introduced to me"
          description={visibleToMatches ? "You can appear in other members' weekly introductions." : "You won't appear in anyone's introductions. You can still request your own."}
          checked={visibleToMatches}
          onChange={setVisibleToMatches}
        />
        <p className="text-xs text-grey-700" aria-live="polite">
          {paused ? "Introductions paused." : "Introductions on · up to 5 a week."}
        </p>
      </div>
    </aside>
  );
}
