import type { Metadata } from "next";
import { OwnStudioPreview } from "@/components/studio/PublicStudio";

export const metadata: Metadata = { title: "My studio, as a visitor · Artelia Connect" };

/** Your own studio, the way visitors see it. `?demo=1` uses seeded sample data. */
export default async function OwnStudio({ searchParams }: { searchParams: Promise<{ demo?: string }> }) {
  const { demo } = await searchParams;
  return <OwnStudioPreview demo={demo} />;
}
