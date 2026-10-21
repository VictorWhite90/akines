import type { Metadata } from "next";
import { redirect } from "next/navigation";
import CreateKinCircle from "@/components/circles/CreateKinCircle";
import CreateCommunity from "@/components/circles/community/CreateCommunity";
import SizeChooser from "@/components/circles/community/SizeChooser";

export const metadata: Metadata = { title: "Start a KinCircle · Akines" };

/** /circles/new → choose small or community; ?size=small|community; ?in=<community id> for a small circle inside one. */
export default async function NewKinCirclePage({ searchParams }: { searchParams: Promise<{ size?: string; in?: string }> }) {
  const { size, in: parent } = await searchParams;
  if (parent) redirect(`/circles/community/${encodeURIComponent(parent)}?tab=circles&start=circle`);
  if (size === "community") return <CreateCommunity />;
  if (size === "small") return <CreateKinCircle />;
  return <SizeChooser />;
}
