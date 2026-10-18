"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import Pic from "@/components/home/Pic";
import Avatar from "@/components/ui/Avatar";
import { PEOPLE } from "@/lib/data/people";
import { stockLeft, usd } from "@/lib/data/shop";
import CheckoutDrawer from "./CheckoutDrawer";
import ProductCard, { Heart } from "./ProductCard";
import { useSaved, useShop } from "./useShop";

const Note = ({ g, t, children }: { g: string; t: string; children: React.ReactNode }) => (
  <li><span aria-hidden>{g}</span><div><b>{t}</b><p>{children}</p></div></li>
);

export default function ProductDetail({ id, demo }: { id: string; demo?: string }) {
  const { all, products, orders, store, ready } = useShop();
  const { has, toggle } = useSaved();
  const [img, setImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [buy, setBuy] = useState(demo === "checkout");
  const [msg, setMsg] = useState<null | "open" | "sent">(null);
  const [text, setText] = useState("");

  const p = all.find((x) => x.id === id);
  const others = useMemo(() => (p ? products.filter((x) => x.id !== p.id) : []), [products, p]);

  if (!p) {
    return (
      <div className="sh">
        {ready ? (
          <div className="sh-empty"><b>We could not find that piece</b><p>It may have been unpublished by its maker.</p><Link href="/shop" className="sh-btn dark">Back to the shop</Link></div>
        ) : <div className="sh-skel" />}
      </div>
    );
  }

  const seller = PEOPLE[p.seller];
  const mine = p.seller === "amara";
  const left = mine ? p.stock : stockLeft(p, orders);
  const sold = left <= 0;
  const first = seller.name.split(" ")[0];
  const same = others.filter((x) => x.seller === p.seller).slice(0, 4);
  const like = others.filter((x) => x.seller !== p.seller).sort((a, b) => Number(b.category === p.category) - Number(a.category === p.category)).slice(0, 4);
  const maxQty = Math.min(left, 5);
  const sendMsg = () => setMsg("sent");

  return (
    <div className="sh">
      <nav className="sh-crumbs" aria-label="Breadcrumb">
        <Link href="/shop">Shop</Link><span>/</span><Link href={`/shop?cat=${encodeURIComponent(p.category)}`}>{p.category}</Link><span>/</span><b>{p.title}</b>
      </nav>

      <div className="sh-detail">
        <div className="sh-gal">
          <div className="main">
            <Pic name={p.photos[Math.min(img, p.photos.length - 1)]} sizes="(max-width: 900px) 100vw, 560px" priority />
            {p.unique && !sold && <span className="badge">1 of 1 original</span>}
            {sold && <span className="badge sold">Sold</span>}
          </div>
          {p.photos.length > 1 && (
            <div className="thumbs">
              {p.photos.map((k, i) => (
                <button key={`${k}-${i}`} className={i === img ? "on" : ""} onClick={() => setImg(i)} aria-label={`Photo ${i + 1}`}><Pic name={k} sizes="90px" /></button>
              ))}
            </div>
          )}
        </div>

        <div className="sh-info">
          {p.status === "draft" && <p className="sh-draftbar">Draft preview. Only you can see this until you publish it in <Link href="/store">My store</Link>.</p>}
          <p className="cat">{p.category}</p>
          <h1 className="font-display">{p.title}</h1>

          <div className="sh-seller">
            <Avatar person={seller} size={44} />
            <div>
              <b>{mine && store ? store.name : seller.name}</b>
              <small>{mine ? `${seller.name} · ${store?.city ?? seller.city}` : `${seller.role} · ${seller.city}`}</small>
            </div>
            {mine ? <Link href="/store" className="sh-btn ghost sm">My store</Link> : <Link href={`/studios/${p.seller}`} className="sh-btn ghost sm">Visit {first}&apos;s space</Link>}
          </div>

          <div className="sh-price">
            <b>{usd(p.price)}</b>
            <span>{p.unique ? (sold ? "Sold" : "1 of 1 original") : sold ? "Sold out" : left <= 3 ? `Only ${left} left` : `${left} available`}</span>
          </div>

          {mine ? (
            <div className="sh-own"><b>This is your product.</b> Buyers see this exact page. <Link href="/store">Edit it in My store</Link></div>
          ) : (
            <>
              {!p.unique && !sold && (
                <div className="sh-qty">
                  <span>Quantity</span>
                  <div>
                    <button onClick={() => setQty(Math.max(1, qty - 1))} disabled={qty <= 1} aria-label="Fewer">−</button>
                    <b>{qty}</b>
                    <button onClick={() => setQty(Math.min(maxQty, qty + 1))} disabled={qty >= maxQty} aria-label="More">＋</button>
                  </div>
                </div>
              )}
              <div className="sh-cta">
                <button className="sh-btn lime big" disabled={sold} onClick={() => setBuy(true)}>{sold ? "Sold out" : `Buy now · ${usd(p.price * Math.min(qty, Math.max(1, left)))}`}</button>
                <button className={`sh-icbtn${has(p.id) ? " on" : ""}`} onClick={() => toggle(p.id)} aria-pressed={has(p.id)} aria-label={has(p.id) ? "Saved" : "Save"}><Heart on={has(p.id)} size={20} /></button>
              </div>
              <button className="sh-msgbtn" onClick={() => setMsg(msg ? null : "open")}>✉ Message {first}</button>
              {msg === "open" && (
                <div className="sh-msg">
                  <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} placeholder={`Hi ${first}, I love ${p.title}. Is it still available?`} />
                  <div><button className="sh-btn dark sm" onClick={sendMsg}>Send message</button><button className="sh-btn ghost sm" onClick={() => setMsg(null)}>Cancel</button></div>
                </div>
              )}
              {msg === "sent" && <p className="sh-sent">✓ Message sent. {first} usually replies within a day, and you will see it in your inbox.</p>}
            </>
          )}

          <dl className="sh-facts">
            <div><dt>Medium</dt><dd>{p.medium}</dd></div>
            <div><dt>Size</dt><dd>{p.size}</dd></div>
            <div><dt>Year</dt><dd>{p.year}</dd></div>
            <div><dt>Edition</dt><dd>{p.unique ? "Unique original" : `${left} in stock`}</dd></div>
          </dl>

          {p.story.trim() && (
            <section className="sh-story">
              <h2>The story behind it</h2>
              <p>{p.story}</p>
            </section>
          )}

          <ul className="sh-notes">
            <Note g="✈" t="Shipping">{p.shipping ?? "Packed by the maker and shipped with tracking. Delivery options and cost show at checkout."}</Note>
            <Note g="↺" t="Returns">If it arrives damaged or not as described, tell the maker within 14 days and they will make it right.</Note>
            <Note g="✓" t="Authenticity">Every piece is made and signed by the artist named above. Your order confirmation doubles as a certificate.</Note>
          </ul>
        </div>
      </div>

      {same.length > 0 && (
        <section>
          <div className="sh-sec"><h2>More from {mine && store ? store.name : first}</h2><Link href={`/shop?seller=${p.seller}`}>See all →</Link></div>
          <ul className="sh-grid">{same.map((x) => <li key={x.id}><ProductCard product={x} /></li>)}</ul>
        </section>
      )}
      <section>
        <div className="sh-sec"><h2>You might also like</h2><Link href="/shop">Browse everything →</Link></div>
        <ul className="sh-grid">{like.map((x) => <li key={x.id}><ProductCard product={x} /></li>)}</ul>
      </section>

      {buy && !mine && <CheckoutDrawer product={p} qty={Math.min(qty, Math.max(1, left))} onClose={() => setBuy(false)} />}
    </div>
  );
}
