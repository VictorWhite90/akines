// Covers: C6 (every artwork carries its story — voice, studio, evolution, legacy), P4 (belonging to African creativity, not buying objects), P2/P3 (finite list, no popularity signals)
import Link from "next/link";
import { PageHeader } from "@/components/ui/Headers";
import Notice from "@/components/ui/Notice";
import Page from "@/components/ui/Page";
import StoryIndex from "./_components/StoryIndex";

export default function StoriesPage() {
  return (
    <Page>
      <PageHeader
        eyebrow="Stories"
        title="People buy stories, not objects."
        description="Every work here comes with the artist's voice, the studio it was made in, the attempts that failed and the lives it has touched since. Start with a story; the price comes last."
      />
      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="min-w-0">
          <StoryIndex />
        </div>
        <aside className="flex flex-col gap-4" aria-label="About stories">
          <Notice title="Sorted by nothing but time">
            No bestseller lists, no view counts, no &ldquo;trending&rdquo;. Stories appear in the order artists finished the work.
          </Notice>
          <Notice tone="trust" title="Every story has a legacy record">
            Creation, exhibitions, owners and travel are recorded with their source — verified by Artelia or declared by the person who added them.
          </Notice>
          <div className="rounded-[4px] border border-sand-200 bg-white p-5 text-sm">
            <p className="font-semibold text-green-950">Want to see the work being made?</p>
            <p className="mt-1 text-grey-700">Artists open their studios on set days — live, 360° or in VR.</p>
            <Link href="/studio-visits" className="mt-3 inline-block font-semibold text-green-950 underline underline-offset-4">Studio visits</Link>
            <p className="mt-4 font-semibold text-green-950">Follow a practice as it happens</p>
            <p className="mt-1 text-grey-700">Sketches, failures and doubts, in the artists&apos; own journals.</p>
            <Link href="/journals" className="mt-3 inline-block font-semibold text-green-950 underline underline-offset-4">Living journals</Link>
          </div>
        </aside>
      </div>
    </Page>
  );
}
