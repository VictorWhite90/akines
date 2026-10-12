import Link from "next/link";
import Avatar from "@/components/ui/Avatar";
import Photo from "@/components/ui/Photo";
import { BANTER_LIFETIMES, BANTER_MOODS, type Banter } from "@/lib/data/banter";
import { PEOPLE } from "@/lib/data/people";

/** A compact Banter in the list: who asked, the mood, who can see it and when it ends. */
export default function BanterCard({ banter, extraReplies = 0 }: { banter: Banter; extraReplies?: number }) {
  const by = PEOPLE[banter.by];
  const mood = BANTER_MOODS.find((m) => m.id === banter.mood)!;
  const life = BANTER_LIFETIMES.find((l) => l.id === banter.lifetime)!;
  const replies = banter.replies.length + extraReplies;
  const reactions = Object.values(banter.reactions).reduce((a, b) => a + b, 0);

  return (
    <Link href={`/banter/${banter.id}`} className="group flex gap-4 rounded-[18px] border border-line bg-paper-50 p-4 transition-all hover:-translate-y-0.5 hover:shadow-lift">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2 text-[11.5px] text-mute">
          <Avatar person={by} size={24} />
          <span className="font-semibold text-ink-900">{banter.mine ? "You" : by.name}</span>
          <span>· {banter.audienceLabel}</span>
          <span>· {banter.ago}</span>
        </div>
        <p className="mt-2.5 text-[16px] leading-snug font-semibold text-ink-950">{banter.prompt}</p>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px]">
          <span className={`rounded-full px-2.5 py-1 font-semibold ${mood.tone}`}>{mood.label}</span>
          <span className="rounded-full border border-line px-2.5 py-1 text-mute">{banter.closed ? "Closed" : life.short}</span>
          <span className="ml-auto text-mute">{replies} {replies === 1 ? "reply" : "replies"} · {reactions} reactions</span>
        </div>
        {banter.spark && !banter.closed && (
          <p className="mt-3 flex items-center gap-2 rounded-xl bg-ai/10 px-3 py-2 text-[12px] text-ink-800">
            <span aria-hidden>✦</span> A shared intention is forming here
          </p>
        )}
      </div>
      {banter.photo && <Photo name={banter.photo} sizes="96px" className="hidden h-24 w-24 flex-none rounded-xl sm:block" />}
    </Link>
  );
}
