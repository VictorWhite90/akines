import type { Metadata } from "next";
import JournalBoard from "@/components/home/JournalBoard";
import PageHeader from "@/components/ui/PageHeader";

export const metadata: Metadata = { title: "Journals · Akines" };

export default async function Journal({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab } = await searchParams;
  const initialTab = tab === "life" ? "life" : tab === "work" ? "work" : "all";
  return (
    <div className="space-y-10">
      <PageHeader eyebrow="Living journals" title={<>Witness the <em>journey.</em></>} sub="Write about the work you do and the life you live: the first try, the mistake, the doubt and the small win. Keep it private, or share it with your circles." />
      <JournalBoard initialTab={initialTab} />
    </div>
  );
}
