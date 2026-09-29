import type { Metadata } from "next";
import ProductDetail from "@/components/shop/ProductDetail";
import { SEED_PRODUCTS } from "@/lib/data/shop";

export function generateStaticParams() {
  return SEED_PRODUCTS.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const p = SEED_PRODUCTS.find((x) => x.id === id);
  return { title: p ? `${p.title} · Shop art` : "Shop art · Kinnect" };
}

export default async function ProductPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ demo?: string }> }) {
  const { id } = await params;
  const { demo } = await searchParams;
  return <ProductDetail id={id} demo={demo} />;
}
