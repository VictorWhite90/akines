import type { Metadata } from "next";
import IntentionCanvas from "@/components/atelier/IntentionCanvas";

export const metadata: Metadata = { title: "Today · Akines" };

/** `?i=collaborate` (or witnessed, complementary, uncertainty, small, alone) opens with that intention chosen, for demos. */
export default async function AtelierPage({ searchParams }: { searchParams: Promise<{ i?: string }> }) {
  const { i } = await searchParams;
  return <IntentionCanvas initial={i ?? null} />;
}
