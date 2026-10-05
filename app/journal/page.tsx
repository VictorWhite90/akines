import type { Metadata } from "next";
import JournalBoard from "@/components/home/JournalBoard";
import PageHeader from "@/components/ui/PageHeader";

export const metadata: Metadata = { title: "Journals · Akines" };

export default async function Journal({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab } = await searchParams;
  const initialTab = tab === "collectors" ? "collector" : tab === "artists" ? "artist" : "all";
  return (
    <div className="space-y-10">
      <PageHeader eyebrow="Living journals" title={<>Witness the <em>journey.</em></>} sub="Artists share the sketch, the failed panel and the doubt. Collectors write why they bought, what changed and where it lives. Together they become the artwork's living history." />
      <JournalBoard initialTab={initialTab} />
    </div>
  );
}
