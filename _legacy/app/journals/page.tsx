// Covers: C7 (artist journals — sketches, failures, ideas, doubts, wins), C8 (collector journals tied to artwork stories), W1 (gentle path to private expressive journaling), P3 (private "keep me posted", no follower counts), U4 (collector discovers an artist through a journal → story → studio visit)
import { PageHeader } from "@/components/ui/Headers";
import Page from "@/components/ui/Page";
import JournalBoard from "./_components/JournalBoard";

export default function JournalsPage() {
  return (
    <Page>
      <PageHeader
        eyebrow="Living journals"
        title="Witness the work as it happens."
        description="Artists share the sketch, the failure and the doubt — not just the finished piece. Collectors write about what it's like to live with the work. No likes, no counts; just the journey."
      />
      <div className="mt-8">
        <JournalBoard />
      </div>
    </Page>
  );
}
