"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import Pic from "@/components/home/Pic";
import Avatar from "@/components/ui/Avatar";
import { PEOPLE } from "@/lib/data/people";
import { CATEGORIES, SHIPPING, STATUS_LABEL, demoPurchases, matchesQuery, sortProducts, usd, type Category, type Order } from "@/lib/data/shop";
import ProductCard from "./ProductCard";
import { useSaved, useShop } from "./useShop";

type Tab = "browse" | "saved" | "orders";
const PRICES = [
  { id: "any", label: "Any price", test: () => true },
  { id: "u100", label: "Under $100", test: (n: number) => n < 100 },
  { id: "u500", label: "$100 to $500", test: (n: number) => n >= 100 && n <= 500 },
  { id: "u2k", label: "$500 to $2,000", test: (n: number) => n > 500 && n <= 2000 },
  { id: "o2k", label: "Over $2,000", test: (n: number) => n > 2000 },
];
const STEPS = ["paid", "shipped", "delivered"] as const;
const when = (t: number) => new Date(t).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

export function OrderTimeline({ status }: { status: Order["status"] }) {
  const at = STEPS.indexOf(status);
  return (
    <ol className="sh-steps" aria-label={`Order status: ${STATUS_LABEL[status]}`}>
      {STEPS.map((s, i) => (
        <li key={s} className={i <= at ? "done" : ""}><i>{i <= at ? "✓" : i + 1}</i>{STATUS_LABEL[s]}</li>
      ))}
    </ol>
  );
}

export default function ShopHome({ demo, view, seller, cat: initialCat }: { demo?: string; view?: string; seller?: string; cat?: string }) {
  const { products, orders: stored, mine, store, ready } = useShop();
  const { saved } = useSaved();
  const [tab, setTab] = useState<Tab>(demo === "orders" || view === "orders" ? "orders" : view === "saved" ? "saved" : "browse");
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<Category | "All">((CATEGORIES as readonly string[]).includes(initialCat ?? "") ? (initialCat as Category) : "All");
  const [sort, setSort] = useState<"new" | "low" | "high">("new");
  const [price, setPrice] = useState("any");
  const [only, setOnly] = useState(seller);

  const orders = demo === "orders" && stored.length === 0 ? demoPurchases() : stored;
  const filtering = q.trim() !== "" || cat !== "All" || price !== "any" || !!only;

  const shown = useMemo(() => {
    const test = PRICES.find((p) => p.id === price)?.test ?? (() => true);
    return sortProducts(
      products.filter((p) => (cat === "All" || p.category === cat) && (!only || p.seller === only) && test(p.price) && matchesQuery(p, q, PEOPLE[p.seller].name)),
      sort,
    );
  }, [products, q, cat, sort, price, only]);

  const featured = useMemo(() => sortProducts(products, "new").slice(0, 5), [products]);
  const savedList = products.filter((p) => saved.includes(p.id));
  const published = mine.filter((p) => p.status === "published").length;

  const clear = () => { setQ(""); setCat("All"); setPrice("any"); setOnly(undefined); };

  return (
    <div className="sh">
      <header className="sh-head">
        <div>
          <p className="eyebrow">Marketplace</p>
          <h1 className="font-display">Buy from people <em>you know.</em></h1>
          <p className="sub">Food, classes, services and things people make, from members of the community. Buy straight from the person.</p>
        </div>
        <Link href="/store" className="sh-sell">
          <span className="ic" aria-hidden>▣</span>
          <span><b>{store ? store.name : "Sell your own work"}</b><small>{store ? `${published} product${published === 1 ? "" : "s"} live · Manage My store` : "Open My store and list your first piece"}</small></span>
          <span className="arr" aria-hidden>→</span>
        </Link>
      </header>

      <nav className="sh-tabs" aria-label="Shop sections">
        <button className={tab === "browse" ? "on" : ""} onClick={() => setTab("browse")}>Browse</button>
        <button className={tab === "saved" ? "on" : ""} onClick={() => setTab("saved")}>Saved{saved.length > 0 && <em>{saved.length}</em>}</button>
        <button className={tab === "orders" ? "on" : ""} onClick={() => setTab("orders")}>Your purchases{orders.length > 0 && <em>{orders.length}</em>}</button>
      </nav>

      {tab === "browse" && (
        <>
          {!filtering && (
            <section aria-label="New from the community">
              <div className="sh-sec"><h2>New from the community</h2><span>Fresh in the shop this week</span></div>
              <div className="sh-feat">
                {featured.map((p, i) => (
                  <Link key={p.id} href={`/shop/${p.id}`} className={i === 0 ? "lead" : ""}>
                    <Pic name={p.photos[0]} sizes={i === 0 ? "420px" : "220px"} />
                    <span className="shade" />
                    <span className="txt"><small>{PEOPLE[p.seller].name}</small><b>{p.title}</b><i>{usd(p.price)}</i></span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          <div className="sh-tools">
            <label className="sh-search">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></svg>
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search food, classes, services or people" aria-label="Search the shop" />
            </label>
            <select value={price} onChange={(e) => setPrice(e.target.value)} aria-label="Price">
              {PRICES.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
            </select>
            <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} aria-label="Sort">
              <option value="new">Newest</option>
              <option value="low">Price: low to high</option>
              <option value="high">Price: high to low</option>
            </select>
          </div>
          <div className="sh-chips" role="tablist" aria-label="Category">
            {(["All", ...CATEGORIES] as const).map((c) => (
              <button key={c} className={cat === c ? "on" : ""} onClick={() => setCat(c)} aria-pressed={cat === c}>{c}</button>
            ))}
          </div>
          {only && (
            <p className="sh-only">Showing work from <b>{only === "amara" && store ? store.name : PEOPLE[only as keyof typeof PEOPLE]?.name ?? only}</b> <button onClick={() => setOnly(undefined)}>Show everyone ×</button></p>
          )}

          <div className="sh-sec"><h2>{filtering ? "Results" : "Everything"}</h2><span>{ready ? `${shown.length} listing${shown.length === 1 ? "" : "s"}` : ""}</span></div>
          {shown.length ? (
            <ul className="sh-grid">{shown.map((p) => <li key={p.id}><ProductCard product={p} /></li>)}</ul>
          ) : (
            <div className="sh-empty"><b>Nothing matches that yet</b><p>Try a different word, or clear your filters to see everything.</p><button className="sh-btn dark" onClick={clear}>Clear filters</button></div>
          )}
        </>
      )}

      {tab === "saved" && (
        <>
          <div className="sh-sec"><h2>Saved</h2><span>Tap the heart on anything to keep it here</span></div>
          {savedList.length ? (
            <ul className="sh-grid">{savedList.map((p) => <li key={p.id}><ProductCard product={p} /></li>)}</ul>
          ) : (
            <div className="sh-empty"><b>Nothing saved yet</b><p>When something catches your eye, tap the heart and it will wait for you here.</p><button className="sh-btn dark" onClick={() => setTab("browse")}>Browse the shop</button></div>
          )}
        </>
      )}

      {tab === "orders" && (
        <>
          <div className="sh-sec"><h2>Your purchases</h2><span>Every order you have placed, and where it is now</span></div>
          {orders.length ? (
            <ul className="sh-orders">
              {orders.map((o) => {
                const s = PEOPLE[o.seller];
                return (
                  <li key={o.id}>
                    <Link href={`/shop/${o.productId}`} className="ph"><Pic name={o.photo} sizes="96px" /></Link>
                    <div className="mid">
                      <p className="no">Order {o.number} · {when(o.placedAt)}</p>
                      <h3>{o.title}{o.qty > 1 ? ` × ${o.qty}` : ""}</h3>
                      <p className="by"><Avatar person={s} size={20} />{s.name}</p>
                      <OrderTimeline status={o.status} />
                    </div>
                    <div className="end">
                      <b>{usd(o.total)}</b>
                      <small>{SHIPPING[o.delivery].label} shipping to {o.ship.city}</small>
                      <Link href={`/shop/${o.productId}`} className="sh-btn ghost sm">View piece</Link>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="sh-empty">
              <b>You have not bought anything yet</b>
              <p>When you buy a piece, your order appears here with its shipping progress. Browse the shop and find something that stays with you.</p>
              <button className="sh-btn dark" onClick={() => setTab("browse")}>Browse the shop</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
