import type { Metadata } from "next";
import CircleRoom from "@/components/circles/community/CircleRoom";

export const metadata: Metadata = { title: "Small circle · Akines" };

/** /circles/community/<community id>/circles/<circle id>; ?invite=1 opens the invite sheet (after starting a circle). */
export default async function SmallCirclePage({ params, searchParams }: { params: Promise<{ id: string; circleId: string }>; searchParams: Promise<{ invite?: string }> }) {
  const { id, circleId } = await params;
  const { invite } = await searchParams;
  return <CircleRoom key={circleId} communityId={id} circleId={circleId} openInvite={invite === "1"} />;
}
