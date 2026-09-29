"use client";

import Link from "next/link";
import Pic from "@/components/home/Pic";
import Avatar from "@/components/ui/Avatar";
import { PEOPLE } from "@/lib/data/people";
import { stockLeft, usd, type Product } from "@/lib/data/shop";
import { useShop, useSaved } from "./useShop";

export function Heart({ on, size = 16 }: { on: boolean; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={on ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z" />
    </svg>
  );
}

export function sellerName(p: Pick<Product, "seller">) {
  return PEOPLE[p.seller].name;
}

/** Compact product card used by the shop, the home page and the detail page. */
export default function ProductCard({ product: p, sizes = "(max-width: 760px) 50vw, 260px" }: { product: Product; sizes?: string }) {
  const { orders, store } = useShop();
  const { has, toggle } = useSaved();
  const seller = PEOPLE[p.seller];
  const mine = p.seller === "amara";
  const left = mine ? p.stock : stockLeft(p, orders);
  const sold = left <= 0;
  return (
    <article className="sh-card">
      <Link href={`/shop/${p.id}`} className="pic" aria-label={p.title}>
        <Pic name={p.photos[0]} sizes={sizes} />
        {p.unique && !sold && <span className="badge">1 of 1</span>}
        {sold && <span className="badge sold">Sold</span>}
        {p.status === "draft" && <span className="badge draft">Draft</span>}
      </Link>
      <button className={`heart${has(p.id) ? " on" : ""}`} onClick={() => toggle(p.id)} aria-pressed={has(p.id)} aria-label={has(p.id) ? "Remove from saved" : "Save"}>
        <Heart on={has(p.id)} />
      </button>
      <div className="body">
        <p className="cat">{p.category}</p>
        <h3><Link href={`/shop/${p.id}`}>{p.title}</Link></h3>
        <p className="by"><Avatar person={seller} size={20} /><span>{mine && store ? store.name : seller.name}</span>{mine && <i>you</i>}</p>
        <div className="foot">
          <b>{usd(p.price)}</b>
          <Link href={`/shop/${p.id}`} className="go">{sold ? "View" : "Buy"}</Link>
        </div>
      </div>
    </article>
  );
}
