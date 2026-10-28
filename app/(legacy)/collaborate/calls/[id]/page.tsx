import type { Metadata } from "next";
import CallDetail from "@/components/collab/CallDetail";
import { SEED_CALLS } from "@/lib/collab/seed";

export const metadata: Metadata = { title: "Open call · Akines" };

/** Prebuilt for the sample calls (served from the CDN); calls a member posts render on first visit. */
export function generateStaticParams() {
  return SEED_CALLS.map((c) => ({ id: c.id }));
}

export default async function CallPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CallDetail key={id} id={id} />;
}
