import type { Metadata } from "next";
import JoinByCode from "@/components/circles/community/JoinByCode";

export const metadata: Metadata = { title: "Join a community · Akines" };

export default async function JoinPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  return <JoinByCode code={decodeURIComponent(code)} />;
}
