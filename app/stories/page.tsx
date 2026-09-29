import type { Metadata } from "next";
import Link from "next/link";
import StoriesBoard from "@/components/home/StoriesBoard";
import Avatar from "@/components/ui/Avatar";
import Photo from "@/components/ui/Photo";
import VoiceNote from "@/components/ui/VoiceNote";
import { PEOPLE } from "@/lib/data/people";
import { ARTWORK, STORIES } from "@/lib/data/stories";

export const metadata: Metadata = { title: "Stories & legacy · Kinnect" };

const WAVE = [10, 18, 28, 14, 34, 22, 40, 26, 14, 30, 42, 20, 12, 28, 36, 18, 10, 24, 32, 16, 12, 26, 38, 22, 14, 30, 20, 34, 16, 10, 24, 18, 28, 12, 20, 32];

export default function Stories() {
  const a = PEOPLE[ARTWORK.artist];
  const listen = STORIES.filter((s) => s.voice);
  return (
    <div className="space-y-20">
      {/* Header */}
      <header className="max-w-3xl">
        <p className="ac-eyebrow">The story behind the work</p>
        <h1 className="font-display mt-2 text-[44px] leading-[1.04] md:text-[56px]">People buy stories, <em>not objects.</em></h1>
        <p className="mt-4 max-w-xl text-[16px] leading-relaxed text-mute">Every artwork carries a voice note, the studio, what inspired it, what went wrong, and everyone who has owned it since.</p>
      </header>

      {/* The wall: one artwork, framed, with its museum label */}
      <section aria-label="Featured artwork" className="relative overflow-hidden rounded-[30px] border border-[#d8d0c0] bg-[#e7dfcf] px-6 py-10 md:px-12 md:py-14">
        <span aria-hidden className="pointer-events-none absolute -top-10 -right-6 font-display text-[280px] leading-none text-night/[0.04] select-none">“</span>
        <div className="relative grid items-center gap-12 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)] lg:gap-16">
          <Link href={`/stories/${ARTWORK.id}`} className="group relative mx-auto block w-full max-w-[420px] pb-8 lg:mx-0">
            <div className="rounded-[6px] bg-night p-3 shadow-lift">
              <div className="bg-paper-50 p-4">
                <Photo name={ARTWORK.photo} ratio="4/5" sizes="420px" position="center 20%" className="[&_img]:transition-transform [&_img]:duration-700 [&_img]:group-hover:scale-[1.03]" />
              </div>
            </div>
            <div className="absolute right-[-10px] bottom-0 w-[210px] rotate-[1.5deg] rounded-[4px] border border-line bg-white p-3.5 shadow-lift md:right-[-28px]">
              <p className="font-display text-[15px] leading-tight">{ARTWORK.title}</p>
              <p className="mt-1 text-[10px] tracking-wide text-mute uppercase">{a.name}, {a.city} · {ARTWORK.year}</p>
              <p className="mt-2 border-t border-line pt-2 text-[10px] leading-snug text-mute">{ARTWORK.medium}<br />{ARTWORK.size}</p>
            </div>
          </Link>

          <div>
            <p className="ac-eyebrow" style={{ color: "#ad5633" }}>Featured artwork story</p>
            <h2 className="font-display mt-2 text-[40px] leading-[1.05] md:text-[52px]">{ARTWORK.title}</h2>
            <blockquote className="font-display mt-5 max-w-lg border-l-[3px] border-clay-500 pl-5 text-[22px] leading-snug text-[#39443f] italic">“{ARTWORK.challenges.split(". ")[0]}.”</blockquote>
            <p className="mt-3 flex items-center gap-2.5 text-[13px] text-mute"><Avatar person={a} size={28} />{a.name}, on the day it nearly went under paint</p>
            <div className="mt-6 max-w-lg"><VoiceNote length={ARTWORK.voice.length} caption={ARTWORK.voice.caption} /></div>

            <ol aria-label="Where it has been" className="relative mt-8 grid max-w-xl grid-cols-5 gap-2">
              <span aria-hidden className="absolute top-[7px] right-[10%] left-[10%] border-t-2 border-dashed border-night/25" />
              {ARTWORK.legacy.map((l, i) => (
                <li key={l.year} className="relative text-center">
                  <span className={`mx-auto block h-[15px] w-[15px] rounded-full border-[3px] ${i === ARTWORK.legacy.length - 1 ? "border-clay-500 bg-clay-500" : "border-night bg-[#e7dfcf]"}`} />
                  <p className="mt-2 text-[10px] leading-tight font-bold tracking-wide text-night uppercase">{l.title}</p>
                  <p className="mt-0.5 text-[10px] leading-tight text-mute">{l.year}</p>
                </li>
              ))}
            </ol>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href={`/stories/${ARTWORK.id}`} className="rounded-full bg-night px-6 py-3 text-[14px] font-semibold text-white hover:bg-ink-900">Read the whole story →</Link>
              <Link href={`/stories/${ARTWORK.id}#legacy`} className="rounded-full border border-night/25 px-6 py-3 text-[14px] font-semibold hover:bg-night/5">Follow it home</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Listen: audio-first rail */}
      <section aria-label="Listen">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="ac-eyebrow">In their own voice</p>
            <h2 className="font-display mt-1 text-[30px] leading-tight">Listen</h2>
          </div>
          <p className="hidden max-w-xs text-right text-[13px] text-mute md:block">Two minutes each. Best with the studio light on.</p>
        </div>
        <ul className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {listen.map((s, i) => {
            const by = PEOPLE[s.by];
            return (
              <li key={s.id}>
                <Link href={`/stories/${s.id}`} className="group relative flex h-full flex-col overflow-hidden rounded-[22px] bg-ink-900 p-5 text-paper-50 transition-transform duration-300 hover:-translate-y-1">
                  <span aria-hidden className="pointer-events-none absolute -right-2 -bottom-8 text-[120px] text-lime/10">✦</span>
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-lime text-night transition-transform group-hover:scale-110"><span aria-hidden>▶︎</span></span>
                    <span className="text-[12px] tracking-wide text-ink-200">{s.voice} · {by.name.split(" ")[0]}'s voice</span>
                  </div>
                  <div aria-hidden className="mt-5 flex h-11 items-center justify-between">
                    {WAVE.map((h, k) => <span key={k} className="w-[3px] rounded-full bg-lime/70" style={{ height: Math.min(44, h * (0.6 + ((i + k) % 3) * 0.2)) }} />)}
                  </div>
                  <h3 className="font-display mt-5 text-[22px] leading-[1.15]">{s.title}</h3>
                  <p className="mt-2 flex-1 text-[13px] leading-relaxed text-[#c9d4d0]">{s.excerpt}</p>
                  <p className="mt-4 flex items-center gap-2 text-[12px] text-ink-200"><Avatar person={by} size={24} />{by.name}</p>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      {/* The wall of stories */}
      <section aria-label="All stories">
        <div className="mb-6">
          <p className="ac-eyebrow">Read</p>
          <h2 className="font-display mt-1 text-[30px] leading-tight">The story wall</h2>
        </div>
        <StoriesBoard />
      </section>

      {/* Provenance strip */}
      <section aria-label="Art legacy" className="on-dark rounded-[30px] bg-ink-900 px-6 py-10 text-paper-50 md:px-12">
        <p className="ac-eyebrow" style={{ color: "var(--lime)" }}>Art Legacy</p>
        <h2 className="font-display mt-2 max-w-2xl text-[32px] leading-[1.1] md:text-[40px]">Every owner adds a chapter. <em>Nothing is lost when it changes hands.</em></h2>
        <ol className="scroll-x relative mt-9 flex snap-x gap-4 overflow-x-auto pb-3">
          {ARTWORK.legacy.map((l) => (
            <li key={l.year} className="relative w-[250px] shrink-0 snap-start rounded-[18px] border border-paper-50/15 bg-paper-50/[0.06] p-5">
              <p className="text-[10px] font-bold tracking-[0.14em] text-lime uppercase">{l.year}</p>
              <p className="font-display mt-1.5 text-[22px] leading-tight">{l.title}</p>
              <p className="mt-0.5 text-[12px] text-ink-200">{l.place}</p>
              <p className="mt-3 text-[13px] leading-relaxed text-[#c9d4d0]">{l.note}</p>
              <p className="mt-3 border-t border-paper-50/15 pt-2.5 text-[11px] text-ink-300">{l.who}</p>
            </li>
          ))}
        </ol>
        <Link href={`/stories/${ARTWORK.id}#legacy`} className="mt-4 inline-block rounded-full bg-lime px-5 py-2.5 text-[13px] font-bold text-night">See {ARTWORK.title}'s full legacy →</Link>
      </section>
    </div>
  );
}
