// Covers: C3, S4, T2, T3, P3, U2, U4, U5
import Badge from "@/components/ui/Badge";
import { PageHeader } from "@/components/ui/Headers";
import Notice from "@/components/ui/Notice";
import Page from "@/components/ui/Page";
import { INTRODUCTIONS, getPerson } from "@/lib/data";
import IntroductionList from "./_components/IntroductionList";
import MatchingControls from "./_components/MatchingControls";

export const metadata = { title: "Introductions" };

export default function IntroductionsPage() {
  const items = INTRODUCTIONS.map((intro) => ({ intro, person: getPerson(intro.personId) }));

  return (
    <Page wide>
      <PageHeader
        eyebrow="Meaningful matching"
        title="People worth meeting this week"
        description="Chosen because your creative journeys complement each other — sometimes by working on the same questions, sometimes by coming at them from somewhere completely different. Every introduction says why."
        actions={<Badge tone="gold">Up to 5 a week — quality over quantity</Badge>}
      />

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0">
          <Notice tone="info" className="mb-6">
            <span className="font-semibold text-green-950">Similar practice</span> means you share a medium or theme.{" "}
            <span className="font-semibold text-green-950">Productive difference</span> means different disciplines meeting around the same question — textile and sound, clay and
            architecture.
          </Notice>
          <IntroductionList items={items} />
        </div>
        <div className="lg:sticky lg:top-6 lg:self-start">
          <MatchingControls />
        </div>
      </div>
    </Page>
  );
}
