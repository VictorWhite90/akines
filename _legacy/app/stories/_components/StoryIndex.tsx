"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Microphone2 } from "iconsax-reactjs";
import Avatar from "@/components/ui/Avatar";
import Media from "@/components/ui/Media";
import { getPerson } from "@/lib/data";
import type { ArtworkStory } from "@/lib/types";
import { cn } from "@/lib/cn";
import { ALL_STORIES, mediumOf, type StoryMedium } from "../_data";

const FILTERS: ("All" | StoryMedium)[] = ["All", "Textiles", "Ceramics", "Painting", "Photography", "Fashion"];

function Byline({ story }: { story: ArtworkStory }) {
  const artist = getPerson(story.artistId);
  return (
    <p className="flex items-center gap-2 text-sm text-grey-700">
      <Avatar name={artist.name} size="xs" />
      <span>
        <span className="text-green-950">{artist.name}</span> · {artist.city}, {story.year}
      </span>
    </p>
  );
}

function FeaturedStory({ story }: { story: ArtworkStory }) {
  return (
    <Link href={`/stories/${story.id}`} className="group grid gap-6 md:grid-cols-[3fr_2fr] md:items-center md:gap-10">
      <Media src={story.image} alt={story.title} ratio="3/2" sizes="(max-width: 768px) 100vw, 640px" priority className="rounded-[6px]" />
      <div>
        <p className="text-sm text-grey-700">{mediumOf(story)}</p>
        <h2 className="mt-2 font-playfair text-3xl font-semibold leading-tight text-green-950 group-hover:underline md:text-4xl">{story.title}</h2>
        <p className="mt-4 font-playfair text-lg italic leading-relaxed text-grey-800">“{story.meaning}”</p>
        <div className="mt-5">
          <Byline story={story} />
        </div>
        <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-green-950">
          Read the story <ArrowRight size={16} color="currentColor" aria-hidden />
        </span>
      </div>
    </Link>
  );
}

function StoryCard({ story }: { story: ArtworkStory }) {
  return (
    <Link href={`/stories/${story.id}`} className="group block">
      <Media src={story.image} alt={story.title} ratio="3/2" sizes="(max-width: 768px) 100vw, 540px" className="rounded-[6px]" />
      <h3 className="mt-4 font-playfair text-2xl font-semibold text-green-950 group-hover:underline">{story.title}</h3>
      <div className="mt-2">
        <Byline story={story} />
      </div>
      <p className="mt-3 flex items-center gap-1.5 text-sm text-grey-700">
        <Microphone2 size={15} color="currentColor" aria-hidden /> Told by the artist · {story.voiceNote.duration}
      </p>
    </Link>
  );
}

export default function StoryIndex() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const stories = filter === "All" ? ALL_STORIES : ALL_STORIES.filter((s) => mediumOf(s) === filter);
  const [featured, ...rest] = stories;
  const showFeatured = filter === "All" && featured;
  const grid = showFeatured ? rest : stories;

  return (
    <div>
      <div role="group" aria-label="Filter by medium" className="scrollbar-hide -mx-1 flex gap-1 overflow-x-auto px-1">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            aria-pressed={filter === f}
            onClick={() => setFilter(f)}
            className={cn(
              "shrink-0 cursor-pointer rounded-full px-4 py-2 text-sm transition-colors",
              filter === f ? "bg-green-950 text-white" : "text-grey-800 hover:bg-sand-100",
            )}
          >
            {f}
          </button>
        ))}
      </div>

      <p className="sr-only" aria-live="polite">{stories.length} stories</p>

      {showFeatured && (
        <div className="mt-10">
          <FeaturedStory story={featured} />
        </div>
      )}

      {grid.length > 0 && (
        <div className={cn("grid gap-x-10 gap-y-14 md:grid-cols-2", showFeatured ? "mt-16" : "mt-10")}>
          {grid.map((story) => (
            <StoryCard key={story.id} story={story} />
          ))}
        </div>
      )}

      {stories.length === 0 && <p className="mt-10 text-grey-700">No {filter.toLowerCase()} stories yet.</p>}
    </div>
  );
}
