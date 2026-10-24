import type { Metadata } from "next";
import { redirect } from "next/navigation";
import CreateCommunity from "@/components/circles/community/CreateCommunity";
import PickCommunity from "@/components/circles/community/PickCommunity";
import SizeChooser from "@/components/circles/community/SizeChooser";

export const metadata: Metadata = { title: "Start a KinCircle · Akines" };

/** /circles/new → choose small or community; ?size=small picks the community the circle goes in; ?size=community starts one; ?in=<community id> jumps straight to it. */
export default async function NewKinCirclePage({ searchParams }: { searchParams: Promise<{ size?: string; in?: string }> }) {
  const { size, in: parent } = await searchParams;
  if (parent) redirect(`/circles/community/${encodeURIComponent(parent)}?tab=circles&start=circle`);
  if (size === "community") return <CreateCommunity />;
  if (size === "small") return <PickCommunity />;
  return <SizeChooser />;
}
