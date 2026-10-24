"use client";

import Link from "next/link";
import { useState } from "react";
import Avatar, { AvatarStack } from "@/components/ui/Avatar";
import Photo from "@/components/ui/Photo";
import { PEOPLE, type PersonId } from "@/lib/data/people";
import { STORIES, type StoryKind } from "@/lib/data/stories";
import { cn } from "@/lib/cn";
import Icon from "@/components/ui/Icon";

const FILTERS: ("All" | StoryKind)[] = ["All", "Life story", "Work story", "How I did it", "Community note"];
const TAPE: Record<StoryKind, string> = {
  "Life story": "bg-lime text-night",
  "Work story": "bg-clay-400 text-white",
  "Community note": "bg-ink-900 text-paper-50",
  "How I did it": "bg-paper-50 text-night border border-line",
};
/** Who replied to a story: reflections show people, never a tally of likes. */
const REFLECTORS: PersonId[][] = [["ayo", "leila", "zuri"], ["kwame", "efua"], ["nandi", "thandi", "fatou", "amara"], ["tunde", "wanjiru"], ["chidi", "efua", "leila"], ["zuri", "nandi"], ["amara", "kwame", "thandi"]];

/** A filterable, masonry "story wall". Each card is tagged with a coloured strip for its kind. */
export default function StoriesBoard() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const shown = STORIES.filter((s) => filter === "All" || s.kind === filter);

  return (
    <div>
      <div role="tablist" aria-label="Filter stories" className="scroll-x flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <button key={f} role="tab" aria-selected={filter === f} onClick={() => setFilter(f)} className={cn("shrink-0 rounded-full border px-4 py-2 text-[13px] font-semibold transition-colors", filter === f ? "border-night bg-night text-paper-50" : "border-line bg-paper-50 hover:bg-paper-200")}>
            {f}
          </button>
        ))}
      </div>

      <ul className="mt-5 grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {shown.map((s, i) => {
          const by = PEOPLE[s.by];
          return (
            <li key={s.id}>
              <Link href={`/stories/${s.id}`} className="group flex h-full flex-col overflow-hidden rounded-[18px] border border-line bg-paper-50 transition-all duration-300 hover:-translate-y-[3px] hover:shadow-lift">
                <div className="relative h-[136px] overflow-hidden bg-paper-200">
                  <Photo name={s.photo} sizes="(max-width: 768px) 100vw, 320px" className="absolute inset-0 h-full [&_img]:transition-transform [&_img]:duration-700 [&_img]:group-hover:scale-105" />
                  <span className={cn("absolute top-3 left-0 z-10 rounded-r-full py-1 pr-3 pl-2.5 text-[9px] font-bold tracking-[0.1em] uppercase", TAPE[s.kind])}>{s.kind}</span>
                  {s.voice && <span className="absolute right-2.5 bottom-2.5 z-10 flex items-center gap-1 rounded-full bg-clay-500 py-1 pr-2.5 pl-2 text-[10px] font-bold text-white"><span aria-hidden><Icon name="play-media" size={18} /></span>{s.voice}</span>}
                </div>
                <div className="flex flex-1 flex-col p-3.5">
                  <h3 className="font-display text-[16px] leading-[1.22]">{s.title}</h3>
                  <p className="mt-1.5 line-clamp-2 text-[11.5px] leading-[1.45] text-mute">{s.excerpt}</p>
                  <div className="mt-auto flex items-center gap-2 pt-3 text-[11px] text-mute"><Avatar person={by} size={22} /><span className="truncate">{by.name} · {by.city}</span></div>
                  <div className="mt-2.5 flex items-center justify-between border-t border-line pt-2.5 text-[10px] text-mute">
                    <span className="flex items-center gap-1.5"><AvatarStack people={REFLECTORS[i % REFLECTORS.length].map((id) => PEOPLE[id])} size={18} max={3} /> reflected</span>
                    <span>{s.read} read</span>
                  </div>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
