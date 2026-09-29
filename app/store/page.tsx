import type { Metadata } from "next";
import StoreApp from "@/components/shop/StoreApp";

export const metadata: Metadata = { title: "My store · Kinnect" };

export default async function StorePage({ searchParams }: { searchParams: Promise<{ demo?: string }> }) {
  const { demo } = await searchParams;
  return <StoreApp demo={demo} />;
}
