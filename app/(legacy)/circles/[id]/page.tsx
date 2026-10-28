import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CircleSpace from "@/components/circles/CircleSpace";
import { CIRCLES } from "@/lib/data/community";

export function generateStaticParams() {
  return CIRCLES.map((c) => ({ id: c.id }));
}
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const c = CIRCLES.find((x) => x.id === id);
  return { title: c ? `${c.name} · Creative Circle` : "Creative Circle" };
}

export default async function CirclePage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ tab?: string }> }) {
  const { id } = await params;
  const { tab } = await searchParams;
  const circle = CIRCLES.find((c) => c.id === id);
  if (!circle) notFound();
  return <CircleSpace circle={circle} startTab={tab} />;
}
