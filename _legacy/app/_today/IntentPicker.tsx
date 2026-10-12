"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight } from "iconsax-reactjs";
import { INTENTS, MY_DNA } from "@/lib/data/dna";
import type { IntentId } from "@/lib/types";
import { cn } from "@/lib/cn";

/** What each intent points to first — the session shapes itself around purpose (C1). */
const NEXT_STEP: Record<IntentId, { text: string; href: string; cta: string }> = {
  inspiration: { text: "Two new artwork stories, each told in the artist's own voice.", href: "/stories", cta: "Open stories" },
  collaborator: { text: "Moussa Diallo, a sound artist, is working on the same questions you are.", href: "/introductions", cta: "See why" },
  "discover-artists": { text: "Kwame Mensah paints his street at the size of church murals.", href: "/stories/street-saints", cta: "Read his story" },
  discuss: { text: "“What does home mean in African art?” starts at 18:00 — two seats left.", href: "/rooms/home", cta: "View the room" },
  opportunity: { text: "You're shortlisted for Threads of Return. Pick a conversation slot by Oct 30.", href: "/applications", cta: "Pick a slot" },
  learn: { text: "Ask the Companion about natural indigo, or join Thursday's room on masks.", href: "/companion", cta: "Ask the Companion" },
  reflect: { text: "Two quiet minutes, just for you. Nothing you write is shared.", href: "/wellbeing", cta: "Check in" },
  "less-alone": { text: "The Textiles Circle meets on Wednesday — small, moderated, friendly.", href: "/circles/textiles", cta: "Visit the circle" },
};

export default function IntentPicker() {
  const [intent, setIntent] = useState<IntentId>(MY_DNA.intents[0]);
  const next = NEXT_STEP[intent];

  return (
    <section aria-labelledby="intent-heading">
      <h2 id="intent-heading" className="text-sm text-grey-700">
        What are you here for today?
      </h2>
      <div className="scrollbar-hide -mx-1 mt-3 flex gap-2 overflow-x-auto px-1 pb-1 md:flex-wrap md:overflow-visible">
        {INTENTS.map((option) => (
          <button
            key={option.id}
            type="button"
            aria-pressed={intent === option.id}
            onClick={() => setIntent(option.id)}
            className={cn(
              "shrink-0 cursor-pointer rounded-full border px-4 py-2 text-sm transition-colors",
              intent === option.id ? "border-green-950 bg-green-950 text-white" : "border-sand-300 text-green-950 hover:border-green-950",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
      <p className="mt-4 text-base text-green-950" aria-live="polite">
        {next.text}{" "}
        <Link href={next.href} className="inline-flex items-center gap-1 whitespace-nowrap font-semibold underline underline-offset-4">
          {next.cta} <ArrowRight size={14} color="currentColor" aria-hidden />
        </Link>
      </p>
    </section>
  );
}
