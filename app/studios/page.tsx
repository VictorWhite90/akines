import type { Metadata } from "next";
import StudiosBoard from "@/components/home/StudiosBoard";
import PageHeader from "@/components/ui/PageHeader";

export const metadata: Metadata = { title: "Studio visits · Akines" };

export default function Studios() {
  return (
    <div className="flex flex-col gap-9">
      <PageHeader eyebrow="Studio visits" title={<>Meet artists <em>inside their studios.</em></>} sub="Live, virtual, 360° or VR. Talk to the maker directly, and if something follows you home, buy it there and then." />
      <StudiosBoard />
    </div>
  );
}
