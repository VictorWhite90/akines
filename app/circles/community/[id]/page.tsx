import type { Metadata } from "next";
import CommunityCircleView from "@/components/circles/community/CommunityCircleView";

export const metadata: Metadata = { title: "Community circle · Akines" };

export default async function CommunityCirclePage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ tab?: string; welcome?: string; post?: string }> }) {
  const { id } = await params;
  const { tab, welcome, post } = await searchParams;
  return <CommunityCircleView key={`${id}-${post ?? ""}-${tab ?? ""}`} id={id} startTab={tab} welcome={welcome === "1"} focusPost={post ? Number(post) || undefined : undefined} />;
}
