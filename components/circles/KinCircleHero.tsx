"use client";

import { useState } from "react";
import Image from "next/image";
import { PHOTO } from "@/lib/data/images";

const STEPS: { n: string; title: string; body: string }[] = [
  { n: "01", title: "Set your purpose", body: "Name the thread that brings you together: a craft, a cause, a shared way of seeing." },
  { n: "02", title: "Invite with intention", body: "Bring in people you trust, or let KinCircle suggest kindred creatives." },
  { n: "03", title: "Arrive as yourself", body: "No performance, no follower count. Just honest introductions." },
  { n: "04", title: "Support one another", body: "Share drafts, ask for feedback, show up when someone's stuck." },
  { n: "05", title: "Make something together", body: "Turn conversation into a show, a zine, a collection, a room of your own." },
  { n: "06", title: "Carry it forward", body: "Your circle's story becomes part of its legacy, not lost in a feed." },
];

const PANELS = 3; // intro, how-it-works (1-3), how-it-works (4-6)

export default function KinCircleHero() {
  const [stage, setStage] = useState(0);
  const photo = PHOTO.kincircleHero;

  return (
    <section className="relative overflow-hidden rounded-[28px] shadow-[var(--shadow-lift)]">
      <div className="relative h-[560px] sm:h-[480px]">
        <Image src={photo.src} alt={photo.alt} fill priority sizes="100vw" className="object-cover" style={{ objectPosition: "center 32%" }} />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/92 via-ink-950/55 to-ink-950/15 sm:bg-gradient-to-r sm:from-ink-950/92 sm:via-ink-950/58 sm:to-ink-950/10" />

        <div className="absolute inset-0 overflow-hidden">
          <div className="flex h-full transition-transform duration-500 ease-[cubic-bezier(.2,.7,.2,1)]" style={{ transform: `translateX(-${stage * 100}%)` }}>
            {/* Stage 0: intro */}
            <div className="flex h-full w-full flex-none flex-col justify-end gap-4 px-7 pb-9 sm:justify-center sm:px-16 sm:py-10">
              <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/15 px-3 py-1.5 text-[11px] text-white backdrop-blur-sm">
                <span className="h-[7px] w-[7px] rounded-full bg-ochre-400" /> KinCircle
              </span>
              <h2 className="font-display max-w-xl text-[32px] leading-[1.08] font-semibold text-white sm:text-[42px]">
                Bring together the right people around a shared purpose.
              </h2>
              <p className="max-w-md text-[14px] leading-relaxed text-white/80">
                Build trust, support one another and create something meaningful—without the noise of another group chat.
              </p>
              <div className="mt-1 flex flex-wrap gap-3">
                <a href="#find-a-circle" className="rounded-full bg-ochre-400 px-5 py-3 text-[14px] font-bold text-ink-950">Start a KinCircle</a>
                <button type="button" onClick={() => setStage(1)} className="rounded-full border border-white/30 bg-white/10 px-5 py-3 text-[14px] text-white backdrop-blur-sm">See how it works</button>
              </div>
            </div>

            {/* Stage 1: how it works, steps 1-3 */}
            <HowItWorks steps={STEPS.slice(0, 3)} onBack={() => setStage(0)} onNext={() => setStage(2)} nextLabel="The last three →" page={1} />

            {/* Stage 2: how it works, steps 4-6 */}
            <HowItWorks steps={STEPS.slice(3, 6)} onBack={() => setStage(1)} page={2}>
              <a href="#find-a-circle" className="rounded-full bg-ochre-400 px-5 py-3 text-[14px] font-bold text-ink-950">Start your KinCircle</a>
            </HowItWorks>
          </div>
        </div>

        {stage > 0 && (
          <button type="button" onClick={() => setStage((s) => s - 1)} aria-label="Back" className="absolute left-4 top-1/2 z-10 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-white/35 bg-ink-950/40 text-white backdrop-blur-sm">‹</button>
        )}
        <div className="absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
          {Array.from({ length: PANELS }).map((_, i) => (
            <button key={i} type="button" aria-label={`Go to panel ${i + 1}`} onClick={() => setStage(i)} className={`h-[7px] rounded-full transition-all ${i === stage ? "w-[18px] bg-white" : "w-[7px] bg-white/40"}`} />
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks({ steps, onBack, onNext, nextLabel, page, children }: { steps: typeof STEPS; onBack: () => void; onNext?: () => void; nextLabel?: string; page: 1 | 2; children?: React.ReactNode }) {
  return (
    <div className="h-full w-full flex-none overflow-y-auto py-8 pr-7 pl-14 sm:px-16 sm:py-10">
      <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/15 px-3 py-1.5 text-[11px] text-white backdrop-blur-sm">
        <span className="h-[7px] w-[7px] rounded-full bg-ochre-400" /> How KinCircle works · {page} of 2
      </span>
      <h2 className="font-display mt-4 max-w-xl text-[26px] leading-[1.1] font-semibold text-white sm:text-[32px]">More than a group. A shared journey.</h2>
      <div className="mt-6 flex max-w-xl flex-col gap-4">
        {steps.map((s) => (
          <div key={s.n} className="flex gap-4 border-t border-white/15 pt-4 first:border-t-0 first:pt-0">
            <span className="font-display text-[20px] font-semibold text-ochre-300">{s.n}</span>
            <div>
              <h3 className="text-[15px] font-semibold text-white">{s.title}</h3>
              <p className="mt-0.5 text-[13px] leading-relaxed text-white/75">{s.body}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        <button type="button" onClick={onBack} className="rounded-full border border-white/30 bg-white/10 px-5 py-2.5 text-[13.5px] text-white backdrop-blur-sm">Back</button>
        {onNext && <button type="button" onClick={onNext} className="rounded-full bg-ochre-400 px-5 py-2.5 text-[13.5px] font-bold text-ink-950">{nextLabel}</button>}
        {children}
      </div>
    </div>
  );
}
