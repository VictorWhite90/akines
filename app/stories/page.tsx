// Covers: C6 (every artwork carries its story), P4 (belonging, not buying objects), P2/P3 (finite, unranked — newest first)
import { PageHeader } from "@/components/ui/Headers";
import Page from "@/components/ui/Page";
import StoryIndex from "./_components/StoryIndex";

export const metadata = { title: "Stories" };

export default function StoriesPage() {
  return (
    <Page>
      <PageHeader title="Stories" description="The work, told by the people who made it — newest first, never ranked." />
      <div className="mt-8">
        <StoryIndex />
      </div>
    </Page>
  );
}
