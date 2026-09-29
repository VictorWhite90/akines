import type { Metadata } from "next";
import StudioApp from "@/components/studio/StudioApp";

export const metadata: Metadata = { title: "My studio · Artelia Connect" };

/**
 * `?demo=1` shows a seeded studio without touching storage; `?demo=live` opens the live view;
 * `?demo=wizard1|wizard2|wizard3` shows that step of "Open your studio".
 */
export default async function StudioPage({ searchParams }: { searchParams: Promise<{ demo?: string }> }) {
  const { demo } = await searchParams;
  return <StudioApp demo={demo} />;
}
