"use client";

import Link from "next/link";
import { useState } from "react";
import { Diagram, Microphone2, Routing2, VideoPlay } from "iconsax-reactjs";
import Avatar from "@/components/ui/Avatar";
import Card from "@/components/ui/Card";
import Chip from "@/components/ui/Chip";
import Media from "@/components/ui/Media";
import { getPerson } from "@/lib/data";
import { ALL_STORIES, mediumOf, type StoryMedium } from "../_data";

const MEDIA: StoryMedium[] = ["Textiles", "Ceramics", "Painting", "Photography", "Fashion"];

export default function StoryIndex() {
  const [medium, setMedium] = useState<StoryMedium | "all">("all");
  const stories = medium === "all" ? ALL_STORIES : ALL_STORIES.filter((s) => mediumOf(s) === medium);

  return (
    <div className="flex flex-col gap-6">
      <div role="group" aria-label="Filter stories by medium" className="flex flex-wrap gap-2">
        <Chip selected={medium === "all"} onToggle={() => setMedium("all")}>All media</Chip>
        {MEDIA.map((m) => (
          <Chip key={m} selected={medium === m} onToggle={() => setMedium(medium === m ? "all" : m)}>
            {m}
          </Chip>
        ))}
      </div>

      <p className="text-sm text-grey-700" aria-live="polite">
        {medium === "all" ? `${stories.length} stories` : `${stories.length} ${stories.length === 1 ? "story" : "stories"} in ${medium.toLowerCase()}`}
      </p>

      <ul className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {stories.map((story) => {
          const artist = getPerson(story.artistId);
          return (
            <Card as="li" key={story.id} className="flex flex-col overflow-hidden">
              <Media src={story.image} alt="" ratio="4/3" sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 360px">
                <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-green-950">{mediumOf(story)}</span>
              </Media>
              <div className="flex flex-1 flex-col gap-4 p-5">
                <div>
                  <h3 className="font-playfair text-xl font-semibold text-green-950">
                    <Link href={`/stories/${story.id}`} className="hover:underline">{story.title}</Link>
                  </h3>
                  <p className="mt-1 flex items-center gap-2 text-sm text-grey-700">
                    <Avatar name={artist.name} size="xs" verified={artist.verified} />
                    <Link href={`/people/${artist.id}`} className="font-semibold text-green-950 hover:underline">{artist.name}</Link>
                    <span aria-hidden>·</span>
                    <span>{artist.city}, {story.year}</span>
                  </p>
                </div>
                <blockquote className="border-l-2 border-gold-400 pl-3 font-playfair text-base italic leading-snug text-green-950">
                  “{story.meaning}”
                </blockquote>
                <ul aria-label="What this story contains" className="mt-auto flex flex-wrap gap-x-4 gap-y-2 text-xs text-grey-800">
                  <li className="flex items-center gap-1.5"><Microphone2 size={15} color="currentColor" aria-hidden /> Voice note {story.voiceNote.duration}</li>
                  <li className="flex items-center gap-1.5"><VideoPlay size={15} color="currentColor" aria-hidden /> Studio video</li>
                  <li className="flex items-center gap-1.5"><Diagram size={15} color="currentColor" aria-hidden /> {story.evolution.length}-step evolution</li>
                  <li className="flex items-center gap-1.5"><Routing2 size={15} color="currentColor" aria-hidden /> Legacy record · {story.legacy.length}</li>
                </ul>
                <Link href={`/stories/${story.id}`} className="self-start text-sm font-semibold text-green-950 underline underline-offset-4">
                  Read the story<span className="sr-only">: {story.title}</span>
                </Link>
              </div>
            </Card>
          );
        })}
      </ul>

      <p className="border-t border-sand-200 pt-6 text-center text-sm text-grey-700">
        That&apos;s every story for now. New ones arrive when artists finish work — not on a schedule.
      </p>
    </div>
  );
}
