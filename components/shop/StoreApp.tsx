"use client";

import { useState } from "react";
import { DEMO_PRODUCTS, DEMO_STORE, KEY_PRODUCTS, KEY_SALES, KEY_STORE, sampleSales, type Order, type Product, type StoreProfile } from "@/lib/data/shop";
import { useLocal } from "@/lib/useLocal";
import StoreDashboard from "./StoreDashboard";
import StoreSetup from "./StoreSetup";

type Setter<T> = (next: T | ((prev: T) => T)) => void;
export type StoreData = {
  store: StoreProfile;
  setStore: Setter<StoreProfile | null>;
  products: Product[];
  setProducts: Setter<Product[]>;
  sales: Order[];
  setSales: Setter<Order[]>;
  demo: boolean;
  /** Which screen a ?demo= value opens first. */
  start?: string;
};

/** My store: setup for a new seller, dashboard once it exists. `?demo=1` shows a seeded store without touching storage. */
export default function StoreApp({ demo }: { demo?: string }) {
  const isDemo = !!demo;
  const [lStore, setLStore, ready] = useLocal<StoreProfile | null>(KEY_STORE, null);
  const [lProducts, setLProducts] = useLocal<Product[]>(KEY_PRODUCTS, []);
  const [lSales, setLSales] = useLocal<Order[]>(KEY_SALES, []);
  const [dStore, setDStore] = useState<StoreProfile | null>(DEMO_STORE);
  const [dProducts, setDProducts] = useState<Product[]>(DEMO_PRODUCTS);
  const [dSales, setDSales] = useState<Order[]>(() => sampleSales(DEMO_PRODUCTS[0]));

  const store = isDemo ? dStore : lStore;
  const setStore = isDemo ? setDStore : setLStore;
  const setProducts = isDemo ? setDProducts : setLProducts;
  const setSales = isDemo ? setDSales : setLSales;

  if (!isDemo && !ready) return <div className="sh"><div className="sh-skel" /></div>;

  if (!store) {
    return (
      <StoreSetup
        onCreate={(profile) => {
          setStore(profile);
          setSales((prev) => (prev.length ? prev : sampleSales()));
        }}
      />
    );
  }

  return (
    <StoreDashboard
      data={{ store, setStore, products: isDemo ? dProducts : lProducts, setProducts, sales: isDemo ? dSales : lSales, setSales, demo: isDemo, start: demo }}
    />
  );
}
