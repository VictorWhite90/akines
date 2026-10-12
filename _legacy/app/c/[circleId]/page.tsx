import { notFound, redirect } from "next/navigation";
import { CIRCLES } from "@/lib/data";

export default async function CirclePage({ params }: { params: Promise<{ circleId: string }> }) {
  const { circleId } = await params;
  if (!CIRCLES.some((c) => c.id === circleId)) notFound();
  redirect(`/c/${circleId}/general`);
}
