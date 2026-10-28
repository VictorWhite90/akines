import type { Metadata } from "next";
import { Suspense } from "react";
import ReviewDesk from "@/components/collab/ReviewDesk";
import { SEED_CALLS } from "@/lib/collab/seed";

export const metadata: Metadata = { title: "Review applications · Akines" };

export function generateStaticParams() {
  return SEED_CALLS.filter((c) => c.postedByMe).map((c) => ({ id: c.id }));
}

export default async function ReviewCallPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <Suspense><ReviewDesk key={id} id={id} /></Suspense>;
}
