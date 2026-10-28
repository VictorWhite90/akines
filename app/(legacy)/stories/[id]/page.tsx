import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import Chip from "@/components/ui/Chip";
import Photo from "@/components/ui/Photo";
import VoiceNote from "@/components/ui/VoiceNote";
import { PEOPLE } from "@/lib/data/people";
import { ARTWORK, STORIES, STORY_BODY } from "@/lib/data/stories";
import BackLink from "@/components/ui/BackLink";
import Icon from "@/components/ui/Icon";

export function generateStaticParams() {
  return STORIES.map((s) => ({ id: s.id }));
}
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const s = STORIES.find((x) => x.id === id);
  return { title: s ? `${s.title} · Akines` : "Story" };
}

export default async function StoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const story = STORIES.find((s) => s.id === id);
  if (!story) notFound();
  const by = PEOPLE[story.by];

  if (id !== ARTWORK.id) {
    const body = STORY_BODY[id] ?? [story.excerpt];
    return (
      <article className="mx-auto max-w-3xl space-y-8">
        <BackLink fallback="/stories" className="text-sm font-semibold text-mute hover:text-ink-900">← Back</BackLink>
        <header><Chip tone="clay">{story.kind}</Chip><h1 className="font-display mt-4 text-[42px] leading-[1.05] font-medium md:text-[56px]">{story.title}</h1><div className="mt-5 flex items-center gap-3"><Avatar person={by} size={44} /><p className="text-sm text-mute"><b className="font-semibold text-ink-900">{by.name}</b> · {by.role}, {by.city} · {story.read} read</p></div></header>
        <Photo name={story.photo} ratio="16/10" sizes="800px" className="rounded-[24px]" />
        {story.voice && <VoiceNote length={story.voice} caption={`${by.name.split(" ")[0]} reading this story`} />}
        <div className="space-y-5 text-[18px] leading-[1.75]">{body.map((p, i) => <p key={i} className={i === 0 ? "first-letter:font-display first-letter:float-left first-letter:mr-3 first-letter:text-[68px] first-letter:leading-[0.85] first-letter:text-clay-500" : ""}>{p}</p>)}</div>
        <p className="border-t border-line pt-5 text-sm text-mute">{story.reflections} reflections from members. Reflections show who wrote them, never how many hearts a story got.</p>
      </article>
    );
  }

  const A = ARTWORK;
  return (
    <article className="space-y-14">
      <BackLink fallback="/stories" className="text-sm font-semibold text-mute hover:text-ink-900">← Back</BackLink>

      <section className="grid gap-8 lg:grid-cols-12">
        <Photo name={A.photo} ratio="4/5" sizes="(max-width: 1024px) 100vw, 480px" priority position="center 15%" className="rounded-[28px] lg:col-span-5" />
        <div className="flex flex-col lg:col-span-7">
          <Chip tone="clay" className="self-start">The full story</Chip>
          <h1 className="font-display mt-4 text-[52px] leading-none font-medium md:text-[72px]">{A.title}</h1>
          <div className="mt-4 flex items-center gap-3"><Avatar person={by} size={44} /><p className="text-[15px]"><b className="font-semibold">{by.name}</b> · {by.role}, {by.city}</p></div>
          <p className="mt-2 text-sm text-mute">{A.medium} · {A.size} · {A.year}</p>
          <div className="mt-6"><VoiceNote length={A.voice.length} caption={A.voice.caption} /></div>
          <div className="mt-6 space-y-5">
            <div><p className="eyebrow text-clay-600">What inspired it</p><p className="font-display mt-1 text-[22px] leading-snug">{A.inspiration}</p></div>
          </div>
          <div className="mt-auto flex flex-wrap items-center gap-4 pt-8"><Button href="/shop/cooking-class" size="lg" variant="clay">Book a cooking class · {A.price}</Button><span className="text-sm text-mute">You'd be part of its story, too.</span></div>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2" aria-label="Challenges and meaning">
        <div className="card p-7"><p className="eyebrow text-clay-600">The challenge</p><p className="mt-2 text-[17px] leading-relaxed">{A.challenges}</p></div>
        <div className="card p-7"><p className="eyebrow text-clay-600">What it means now</p><p className="mt-2 text-[17px] leading-relaxed">{A.meaning}</p></div>
      </section>

      <section aria-label="Evolution" className="pattern-kuba rounded-[28px] border border-line bg-paper-200/70 p-7 md:p-10">
        <p className="eyebrow text-clay-600">How it changed</p>
        <h2 className="font-display mt-1 text-[32px] font-medium">From the start to today, hard years included</h2>
        <div className="mt-7 grid gap-5 md:grid-cols-4">
          {A.evolution.map((e, i) => (
            <figure key={e.step} className="rounded-2xl bg-paper-50 p-3 shadow-soft">
              <Photo name={A.sketches[i % A.sketches.length]} ratio="1/1" sizes="260px" className="rounded-xl" />
              <figcaption className="p-2 pt-3"><p className="text-[11px] font-bold tracking-wide text-clay-600 uppercase">0{i + 1} · {e.step}</p><p className="mt-1 text-sm text-mute">{e.note}</p></figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2" aria-label="Music and poem">
        <div className="pattern-adire on-dark rounded-[24px] bg-ink-900 p-7 text-paper-50"><p className="eyebrow flex items-center gap-2 text-ochre-300"><span aria-hidden><Icon name="music" size={18} /></span>The music that goes with it</p><p className="font-display mt-3 text-[26px] leading-tight">{A.music.title}</p><p className="mt-2 text-paper-100/80">{A.music.note}</p></div>
        <div className="card p-7"><p className="eyebrow flex items-center gap-2 text-clay-600"><span aria-hidden><Icon name="edit" size={18} /></span>The poem behind it</p><p className="font-display mt-3 text-[24px] leading-snug italic">{A.poem.map((l) => <span key={l} className="block">{l}</span>)}</p></div>
      </section>

      <section id="legacy" aria-label="Legacy" className="scroll-mt-28">
        <p className="eyebrow text-clay-600">Legacy</p>
        <h2 className="font-display mt-1 max-w-2xl text-[34px] leading-[1.1] font-medium md:text-[44px]">Who started it, who kept it going, <em>and what they felt.</em></h2>
        <ol className="relative mt-8 space-y-7 border-l-2 border-dashed border-ink-200 pl-8 md:ml-4">
          {A.legacy.map((l, i) => (
            <li key={l.year} className="relative animate-rise" style={{ animationDelay: `${i * 70}ms` }}>
              <span className="absolute top-2 -left-[43px] h-4 w-4 rounded-full border-[3px] border-clay-500 bg-paper-100" />
              <div className="card max-w-2xl p-5">
                <p className="text-[11px] font-bold tracking-wide text-clay-600 uppercase">{l.year}</p>
                <p className="font-display mt-0.5 text-2xl font-medium">{l.title} <span className="text-mute">· {l.place}</span></p>
                <p className="mt-1.5 text-[15px] text-ink-800">{l.note}</p>
                <p className="mt-2 text-xs text-mute">{l.who}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="mt-8 max-w-xl text-[15px] text-mute">Whoever carries it next inherits every chapter above, and can add their own.</p>
      </section>
    </article>
  );
}
