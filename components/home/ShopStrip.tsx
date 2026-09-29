"use client";

import Link from "next/link";
import ProductCard from "@/components/shop/ProductCard";
import { useAllProducts } from "@/components/shop/useShop";
import { sortProducts } from "@/lib/data/shop";

/** "Fresh from the makers": the newest published products, so the shop is reachable from home. */
export default function ShopStrip() {
  const items = sortProducts(useAllProducts(), "new").slice(0, 3);
  return (
    <>
      <div className="section-title">
        <div><h2>Fresh from the makers</h2><p>Original work and made-to-order pieces, sold by the people who made them.</p></div>
        <Link href="/shop">Shop all →</Link>
      </div>
      <ul className="sh-grid home-shop">
        {items.map((p) => <li key={p.id}><ProductCard product={p} /></li>)}
      </ul>
    </>
  );
}
