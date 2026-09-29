"use client";

import { useState } from "react";
import Link from "next/link";
import Photo from "@/components/ui/Photo";
import Button from "@/components/ui/Button";
import { INTENTS } from "@/lib/data/community";
import { cn } from "@/lib/cn";

/** The Connection Intent Engine: ask *why* someone is here, then answer it. */
export default function IntentPanel({ initial = "heals" }: { initial?: string }) {
  const [id, setId] = useState(initial);
  const intent = INTENTS.find((i) => i.id === id) ?? INTENTS[0];

  return (
    <section className="card overflow-hidden" aria-labelledby="intent-title">
      <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
        <div className="flex flex-col p-6 md:p-8">
          <p className="eyebrow text-clay-600">Why are you here today?</p>
          <h2 id="intent-title" className="font-display mt-2 text-[30px] leading-[1.08] font-medium md:text-[34px]">
            Tell us your reason, and the courtyard <em>rearranges itself.</em>
          </h2>
          <div role="radiogroup" aria-label="Your reason for being here" className="mt-6 flex flex-wrap gap-2">
            {INTENTS.map((i) => {
              const on = i.id === id;
              return (
                <button
                  key={i.id}
                  role="radio"
                  aria-checked={on}
                  onClick={() => setId(i.id)}
                  className={cn("rounded-full border px-4 py-2 text-left text-[13.5px] leading-snug font-medium transition-all", on ? "border-ink-900 bg-ink-900 text-paper-50 shadow-soft" : "border-line bg-paper-100 hover:border-ink-300 hover:bg-paper-200")}
                >
                  {i.label}
                </button>
              );
            })}
          </div>
          <p className="mt-auto pt-6 text-xs text-mute">Your intent shapes suggestions only. You can change it anytime, and it's never shown on your profile.</p>
        </div>

        <div key={intent.id} className="animate-rise relative min-h-[380px] text-paper-50">
          <Photo name={intent.photo} sizes="(max-width: 1024px) 100vw, 560px" className="absolute inset-0 h-full" position="center 30%" />
          <div className="absolute inset-0 bg-linear-to-t from-ink-950/92 via-ink-950/50 to-ink-950/5" />
          <div className="relative flex h-full min-h-[380px] flex-col justify-end p-6 md:p-8">
            <span className="eyebrow mb-3 text-ochre-300">For you today</span>
            <h3 className="font-display text-[30px] leading-[1.08] font-medium md:text-[36px]">{intent.headline}</h3>
            <p className="mt-3 max-w-md text-[15px] leading-relaxed text-paper-100/90">{intent.body}</p>
            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3">
              <Button href={intent.cta.href} variant="gold">
                {intent.cta.label} <span aria-hidden>→</span>
              </Button>
              <Link href={intent.also.href} className="text-sm font-semibold text-paper-50 underline decoration-ochre-300 decoration-2 underline-offset-4">
                {intent.also.label}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
