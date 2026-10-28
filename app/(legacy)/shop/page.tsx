import type { Metadata } from "next";
import ShopHome from "@/components/shop/ShopHome";

export const metadata: Metadata = { title: "Marketplace · Akines" };

export default async function ShopPage({ searchParams }: { searchParams: Promise<{ demo?: string; view?: string; seller?: string; cat?: string }> }) {
  const { demo, view, seller, cat } = await searchParams;
  return <ShopHome demo={demo} view={view} seller={seller} cat={cat} />;
}
