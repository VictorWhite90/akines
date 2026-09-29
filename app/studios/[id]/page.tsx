import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PublicStudioView from "@/components/studio/PublicStudio";
import { SEEDED_IDS, seededStudio } from "@/lib/data/studio";

export const dynamicParams = false;
export function generateStaticParams() {
  return SEEDED_IDS.map((id) => ({ id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const s = seededStudio(id);
  return { title: s ? `${s.name} · Kinnect` : "Studio · Kinnect" };
}

export default async function StudioPublic({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const studio = seededStudio(id);
  if (!studio) notFound();
  return <PublicStudioView studio={studio} />;
}
