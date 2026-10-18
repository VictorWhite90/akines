"use client";

import Link from "next/link";
import { useState } from "react";
import Pic from "@/components/home/Pic";
import { STATUS_LABEL, SHIPPING, usd, type Order, type OrderStatus, type Product } from "@/lib/data/shop";
import ProductForm from "./ProductForm";
import type { StoreData } from "./StoreApp";
import { CategoryChips, CoverPicker } from "./StoreSetup";

type Tab = "products" | "orders" | "settings";
const when = (t: number) => new Date(t).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
const NEXT: Partial<Record<OrderStatus, { to: OrderStatus; label: string }>> = { paid: { to: "shipped", label: "Mark as shipped" }, shipped: { to: "delivered", label: "Mark as delivered" } };

function pill(p: Product) {
  if (p.status === "draft") return { cls: "draft", txt: "Draft" };
  if (p.stock <= 0) return { cls: "sold", txt: "Sold out" };
  return { cls: "live", txt: "Published" };
}

export default function StoreDashboard({ data }: { data: StoreData }) {
  const { store, setStore, products, setProducts, sales, setSales, demo, start } = data;
  const [tab, setTab] = useState<Tab>(start === "orders" ? "orders" : start === "settings" ? "settings" : "products");
  const [form, setForm] = useState<null | "new" | Product>(start === "form" ? "new" : null);
  const [confirm, setConfirm] = useState<string | null>(null);
  const [note, setNote] = useState<{ text: string; href?: string } | null>(null);
  const [draft, setDraft] = useState(store);
  const [saved, setSaved] = useState(false);
  const [resetAsk, setResetAsk] = useState(false);

  const live = products.filter((p) => p.status === "published");
  const toShip = sales.filter((o) => o.status === "paid").length;
  const earnings = sales.reduce((n, o) => n + o.unitPrice * o.qty, 0);
  const samples = sales.some((o) => o.sample);

  const save = (p: Product) => {
    const exists = products.some((x) => x.id === p.id);
    setProducts((prev) => (exists ? prev.map((x) => (x.id === p.id ? p : x)) : [p, ...prev]));
    setForm(null);
    setTab("products");
    setNote(p.status === "published" ? { text: `“${p.title}” is live in the shop.`, href: demo ? undefined : `/shop/${p.id}` } : { text: `“${p.title}” saved as a draft. Publish it when you are ready.` });
  };
  const setStatus = (p: Product, status: Product["status"]) => {
    setProducts((prev) => prev.map((x) => (x.id === p.id ? { ...x, status } : x)));
    setNote({ text: status === "published" ? `“${p.title}” is live in the shop.` : `“${p.title}” is unpublished. Buyers can no longer see it.`, href: status === "published" && !demo ? `/shop/${p.id}` : undefined });
  };
  const remove = (p: Product) => {
    setProducts((prev) => prev.filter((x) => x.id !== p.id));
    setConfirm(null);
    setNote({ text: `“${p.title}” was deleted.` });
  };
  const advance = (o: Order) => {
    const nx = NEXT[o.status];
    if (nx) setSales((prev) => prev.map((x) => (x.id === o.id ? { ...x, status: nx.to } : x)));
  };
  const saveSettings = () => {
    setStore({ ...draft, name: draft.name.trim() || store.name });
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  };
  const reset = () => {
    setProducts([]);
    setSales([]);
    setStore(null);
  };

  return (
    <div className="sh st">
      <section className="st-banner">
        <Pic name={store.cover} sizes="(max-width: 900px) 100vw, 1100px" priority />
        <span className="shade" />
        <div className="txt">
          <p className="eyebrow">My store{demo ? " · demo" : ""}</p>
          <h1 className="font-display">{store.name}</h1>
          {store.tagline && <p className="tg">{store.tagline}</p>}
          <p className="mt">{store.city && `Ships from ${store.city}`}{store.categories.length > 0 && ` · ${store.categories.join(", ")}`}</p>
        </div>
        <div className="acts">
          <Link href="/shop?seller=amara" className="sh-btn glass">View as a buyer</Link>
          <button className="sh-btn lime" onClick={() => setForm("new")}>＋ Add product</button>
        </div>
      </section>

      <div className="st-stats">
        <div><small>Products</small><b>{products.length}</b><span>{live.length} live in the shop</span></div>
        <div><small>Orders</small><b>{sales.length}</b><span>{toShip > 0 ? `${toShip} to ship` : "All shipped"}</span></div>
        <div><small>Earnings</small><b>{usd(earnings)}</b><span>{samples ? "Includes sample orders" : "Before shipping costs"}</span></div>
      </div>

      {note && (
        <p className="st-note" role="status">
          <span>✓ {note.text}</span>
          {note.href && <Link href={note.href}>See it in the shop →</Link>}
          <button onClick={() => setNote(null)} aria-label="Dismiss">×</button>
        </p>
      )}

      <nav className="sh-tabs" aria-label="Store sections">
        <button className={tab === "products" ? "on" : ""} onClick={() => setTab("products")}>Products<em>{products.length}</em></button>
        <button className={tab === "orders" ? "on" : ""} onClick={() => setTab("orders")}>Orders{toShip > 0 && <em className="hot">{toShip}</em>}</button>
        <button className={tab === "settings" ? "on" : ""} onClick={() => setTab("settings")}>Settings</button>
      </nav>

      {tab === "products" && (
        <>
          <div className="sh-sec"><h2>Your products</h2><button className="sh-btn dark sm" onClick={() => setForm("new")}>＋ Add product</button></div>
          {products.length === 0 ? (
            <div className="sh-empty">
              <b>Your shelf is empty, for now</b>
              <p>Add your first product with a photo, a price and its story. Publish it and it shows up in the Marketplace straight away.</p>
              <button className="sh-btn lime" onClick={() => setForm("new")}>＋ Add your first product</button>
            </div>
          ) : (
            <ul className="st-grid">
              {products.map((p) => {
                const s = pill(p);
                return (
                  <li key={p.id} className="st-pcard">
                    <div className="pic">
                      <Pic name={p.photos[0]} sizes="240px" />
                      <span className={`pill ${s.cls}`}>{s.txt}</span>
                    </div>
                    <div className="bd">
                      <p className="cat">{p.category}</p>
                      <h3>{p.title}</h3>
                      <p className="mt"><b>{p.price ? usd(p.price) : "No price"}</b> · {p.unique ? "1 of 1" : `${p.stock} in stock`}</p>
                      {confirm === p.id ? (
                        <div className="ask"><span>Delete this?</span><button className="danger" onClick={() => remove(p)}>Yes, delete</button><button onClick={() => setConfirm(null)}>Keep</button></div>
                      ) : (
                        <div className="row">
                          <button onClick={() => setForm(p)}>Edit</button>
                          {p.status === "published" ? <button onClick={() => setStatus(p, "draft")}>Unpublish</button> : <button className="pub" onClick={() => setStatus(p, "published")}>Publish</button>}
                          <button className="del" onClick={() => setConfirm(p.id)} aria-label={`Delete ${p.title}`}>Delete</button>
                        </div>
                      )}
                      {p.status === "published" && !demo && <Link className="view" href={`/shop/${p.id}`}>View in shop →</Link>}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}

      {tab === "orders" && (
        <>
          <div className="sh-sec"><h2>Orders for your products</h2><span>Paid → Shipped → Delivered</span></div>
          {samples && (
            <p className="st-sample">
              <span>These are <b>sample orders</b> so you can see how selling works. They are not real. Real orders from buyers will land here the same way.</span>
              <button onClick={() => setSales((prev) => prev.filter((o) => !o.sample))}>Clear samples</button>
            </p>
          )}
          {sales.length ? (
            <ul className="st-orders">
              {sales.map((o) => {
                const nx = NEXT[o.status];
                return (
                  <li key={o.id}>
                    <div className="ph"><Pic name={o.photo} sizes="64px" /></div>
                    <div className="who">
                      <b>{o.title}{o.qty > 1 ? ` × ${o.qty}` : ""}</b>
                      <small>{o.number} · {when(o.placedAt)}{o.sample && <i>sample</i>}</small>
                    </div>
                    <div className="to"><b>{o.buyer}</b><small>{o.ship.city}, {o.ship.country}</small></div>
                    <div className="tt"><b>{usd(o.total)}</b><small>{SHIPPING[o.delivery].label}</small></div>
                    <span className={`stat ${o.status}`}>{STATUS_LABEL[o.status]}</span>
                    <div className="go">{nx ? <button className="sh-btn dark sm" onClick={() => advance(o)}>{nx.label}</button> : <span className="fin">✓ Complete</span>}</div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="sh-empty"><b>No orders yet</b><p>When someone buys one of your products, the order shows up here and you can mark it shipped. Publish a product to get started.</p><button className="sh-btn dark" onClick={() => setTab("products")}>Go to products</button></div>
          )}
        </>
      )}

      {tab === "settings" && (
        <>
          <div className="sh-sec"><h2>Store settings</h2><span>What buyers see on your store</span></div>
          <form className="st-form st-settings" onSubmit={(e) => { e.preventDefault(); saveSettings(); }}>
            <label><span>Store name</span><input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} maxLength={40} /></label>
            <label><span>Tagline</span><input value={draft.tagline} onChange={(e) => setDraft({ ...draft, tagline: e.target.value })} maxLength={70} /></label>
            <label><span>Ships from</span><input value={draft.city} onChange={(e) => setDraft({ ...draft, city: e.target.value })} /></label>
            <div className="fld"><span>What you make</span><CategoryChips value={draft.categories} onChange={(categories) => setDraft({ ...draft, categories })} /></div>
            <div className="fld"><span>Cover photo</span><CoverPicker value={draft.cover} onChange={(cover) => setDraft({ ...draft, cover })} /></div>
            <label><span>About</span><textarea rows={3} value={draft.about} onChange={(e) => setDraft({ ...draft, about: e.target.value })} maxLength={280} /></label>
            <div className="st-actions left">
              <button className="sh-btn dark" type="submit">Save changes</button>
              {saved && <span className="ok">✓ Saved</span>}
            </div>
          </form>
          <div className="st-reset">
            {resetAsk ? (
              <><span>This removes your store, products and orders on this device.</span><button className="danger" onClick={reset}>Yes, start over</button><button onClick={() => setResetAsk(false)}>Cancel</button></>
            ) : (
              <button onClick={() => setResetAsk(true)}>Close my store and start over</button>
            )}
          </div>
        </>
      )}

      {form && <ProductForm initial={form === "new" ? undefined : form} onSave={save} onClose={() => setForm(null)} />}
    </div>
  );
}
