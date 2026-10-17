import type { Metadata } from "next";
import StudiosBoard from "@/components/home/StudiosBoard";
import PageHeader from "@/components/ui/PageHeader";

export const metadata: Metadata = { title: "Open doors · Akines" };

export default function Studios() {
  return (
    <div className="flex flex-col gap-9">
      <PageHeader eyebrow="Open doors" title={<>Step inside <em>someone else&apos;s world.</em></>} sub="Live sessions, classes and tours hosted by people in the community: a cooking class, a coding session, a training ground, a classroom. Six seats, so it stays a real conversation." />
      <StudiosBoard />
    </div>
  );
}
