import type { Metadata } from "next";
import BanterNowRoom from "@/components/banter/BanterNowRoom";

export const metadata: Metadata = { title: "Banter Now · Akines" };

export default async function BanterNowPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <BanterNowRoom id={id} />;
}
