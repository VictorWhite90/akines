"use client";

import { useMemo } from "react";
import { useLocal } from "@/lib/useLocal";
import { KEY_ORDERS, KEY_PRODUCTS, KEY_SAVED, KEY_STORE, SEED_PRODUCTS, type Order, type Product, type StoreProfile } from "@/lib/data/shop";

/** Everything the buyer side needs: seeded catalogue merged with what the member published. */
export function useShop() {
  const [mine, , ready] = useLocal<Product[]>(KEY_PRODUCTS, []);
  const [orders] = useLocal<Order[]>(KEY_ORDERS, []);
  const [store] = useLocal<StoreProfile | null>(KEY_STORE, null);
  const all = useMemo(() => [...mine, ...SEED_PRODUCTS], [mine]);
  const products = useMemo(() => all.filter((p) => p.status === "published"), [all]);
  return { mine, all, products, orders, store, ready };
}

/** Published products, newest first: the member's own work joins the seeded catalogue. */
export function useAllProducts(): Product[] {
  return useShop().products;
}

/** Product ids the member has saved (the heart). */
export function useSaved() {
  const [saved, setSaved] = useLocal<string[]>(KEY_SAVED, []);
  const toggle = (id: string) => setSaved((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  return { saved, toggle, has: (id: string) => saved.includes(id) };
}
