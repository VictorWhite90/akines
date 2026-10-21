import type { Metadata } from "next";
import CreateKinCircle from "@/components/circles/CreateKinCircle";
import CreateCommunity from "@/components/circles/community/CreateCommunity";
import NewSmallInCommunity from "@/components/circles/community/NewSmallInCommunity";
import SizeChooser from "@/components/circles/community/SizeChooser";
import { FEATURES } from "@/lib/features";

export const metadata: Metadata = { title: "Start a KinCircle · Akines" };

/** /circles/new → choose small or community; ?size=small|community; ?in=<community id> for a small circle inside one. */
export default async function NewKinCirclePage({ searchParams }: { searchParams: Promise<{ size?: string; in?: string }> }) {
  const { size, in: parent } = await searchParams;
  if (parent && FEATURES.smallCirclesInCommunity) return <NewSmallInCommunity parentId={parent} />;
  if (size === "community") return <CreateCommunity />;
  if (size === "small") return <CreateKinCircle />;
  return <SizeChooser />;
}
