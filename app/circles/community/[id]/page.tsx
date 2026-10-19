import type { Metadata } from "next";
import CommunityCircleView from "@/components/circles/community/CommunityCircleView";

export const metadata: Metadata = { title: "Community circle · Akines" };

export default async function CommunityCirclePage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ tab?: string; welcome?: string }> }) {
  const { id } = await params;
  const { tab, welcome } = await searchParams;
  return <CommunityCircleView key={id} id={id} startTab={tab} welcome={welcome === "1"} />;
}
