"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight } from "iconsax-reactjs";
import Chip from "@/components/ui/Chip";
import { INTENTS, MY_DNA } from "@/lib/data/dna";
import type { IntentId } from "@/lib/types";

/** What each intent points to first — the session shapes itself around purpose. */
const NEXT_STEP: Record<IntentId, { text: string; href: string; cta: string }> = {
  inspiration: { text: "Moussa's harbour recordings and two new artwork stories are waiting.", href: "/stories", cta: "Open stories" },
  collaborator: { text: "Moussa Diallo is a strong complementary match for you — here's why.", href: "/introductions", cta: "See introductions" },
  "discover-artists": { text: "Kwame Mensah paints his street at mural scale — start with his story.", href: "/stories/street-saints", cta: "Read the story" },
  discuss: { text: "“What does home mean in African art?” starts at 18:00 with two seats left.", href: "/rooms/home", cta: "View the room" },
  opportunity: { text: "You're shortlisted for Threads of Return — pick a conversation slot by Oct 30.", href: "/applications", cta: "Open application" },
  learn: { text: "Ask the Creative Companion about natural indigo chemistry, or join the masks room on Thursday.", href: "/companion", cta: "Ask the Companion" },
  reflect: { text: "Take two quiet minutes with a private check-in. Nothing you write is shared or used for ranking.", href: "/wellbeing", cta: "Start a check-in" },
  "less-alone": { text: "The Textiles Circle meets on Wednesday — small, moderated, and you already know two members.", href: "/circles/textiles", cta: "Visit the circle" },
};

export default function IntentPicker() {
  const [intent, setIntent] = useState<IntentId>(MY_DNA.intents[0]);
  const next = NEXT_STEP[intent];

  return (
    <section aria-labelledby="intent-heading" className="rounded-[4px] border border-sand-200 bg-white p-5 sm:p-6">
      <h2 id="intent-heading" className="font-playfair text-xl font-semibold text-green-950 sm:text-2xl">
        What would feel meaningful today?
      </h2>
      <p className="mt-1 text-sm text-grey-700">Your answer shapes this session. Change it any time.</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {INTENTS.map((option) => (
          <Chip key={option.id} selected={intent === option.id} onToggle={() => setIntent(option.id)}>
            {option.label}
          </Chip>
        ))}
      </div>
      <div className="mt-5 flex flex-col gap-3 rounded-[4px] bg-sand-100 p-4 sm:flex-row sm:items-center sm:justify-between" aria-live="polite">
        <p className="text-sm text-green-950">{next.text}</p>
        <Link href={next.href} className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-green-950 underline underline-offset-4">
          {next.cta} <ArrowRight size={16} color="currentColor" aria-hidden />
        </Link>
      </div>
    </section>
  );
}
