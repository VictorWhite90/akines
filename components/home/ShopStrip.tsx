"use client";

import Link from "next/link";
import ProductCard from "@/components/shop/ProductCard";
import { useAllProducts } from "@/components/shop/useShop";
import { sortProducts } from "@/lib/data/shop";

/** The newest published products, giving the marketplace a place on the home feed. */
export default function ShopStrip() {
  const items = sortProducts(useAllProducts(), "new").slice(0, 3);
  return (
    <>
      <div className="hs-strip-head market-head">
        <div><h3>Fresh from the market</h3><p>New work and useful finds from people in your community.</p></div>
        <Link href="/shop">Shop all →</Link>
      </div>
      <ul className="sh-grid home-shop">
        {items.map((p) => <li key={p.id}><ProductCard product={p} /></li>)}
      </ul>
    </>
  );
}
