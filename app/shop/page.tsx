import type { Metadata } from "next";
import ShopHome from "@/components/shop/ShopHome";

export const metadata: Metadata = { title: "Shop art · Artelia Connect" };

export default async function ShopPage({ searchParams }: { searchParams: Promise<{ demo?: string; view?: string; seller?: string }> }) {
  const { demo, view, seller } = await searchParams;
  return <ShopHome demo={demo} view={view} seller={seller} />;
}
