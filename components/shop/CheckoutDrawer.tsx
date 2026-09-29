"use client";

import Link from "next/link";
import { useState } from "react";
import Pic from "@/components/home/Pic";
import { ME, PEOPLE } from "@/lib/data/people";
import { KEY_ORDERS, PAYMENTS, SHIPPING, orderNumber, usd, type Delivery, type Order, type Payment, type Product } from "@/lib/data/shop";
import { newId, useLocal } from "@/lib/useLocal";

/** Mock checkout: shipping details, delivery, a payment selector (nothing is collected), summary and a saved order. */
export default function CheckoutDrawer({ product: p, qty, onClose }: { product: Product; qty: number; onClose: () => void }) {
  const [, setOrders] = useLocal<Order[]>(KEY_ORDERS, []);
  const [f, setF] = useState({ name: ME.name, address: "", city: ME.city, country: "Nigeria" });
  const [delivery, setDelivery] = useState<Delivery>("standard");
  const [payment, setPayment] = useState<Payment>("card");
  const [tried, setTried] = useState(false);
  const [done, setDone] = useState<Order | null>(null);
  const seller = PEOPLE[p.seller];

  const shipping = SHIPPING[delivery].cost;
  const subtotal = p.price * qty;
  const total = subtotal + shipping;
  const missing = (["name", "address", "city", "country"] as const).filter((k) => !f[k].trim());

  const place = () => {
    setTried(true);
    if (missing.length) return;
    const order: Order = {
      id: newId("ord"), number: orderNumber(), productId: p.id, title: p.title, photo: p.photos[0], seller: p.seller, qty, unitPrice: p.price, shipping, total,
      status: "paid", placedAt: Date.now(), delivery, payment, buyer: ME.name, ship: { ...f },
    };
    setOrders((prev) => [order, ...prev]);
    setDone(order);
  };

  const field = (k: keyof typeof f, label: string, ph: string, auto: string) => (
    <label className={tried && !f[k].trim() ? "bad" : ""}>
      <span>{label}</span>
      <input value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} placeholder={ph} autoComplete={auto} />
    </label>
  );

  return (
    <div className="sh-scrim" onClick={onClose}>
      <aside className="sh-drawer" role="dialog" aria-modal="true" aria-label="Checkout" onClick={(e) => e.stopPropagation()}>
        <button className="x" onClick={onClose} aria-label="Close">×</button>
        {done ? (
          <div className="sh-done">
            <div className="tick" aria-hidden>✓</div>
            <h2>Order placed. Thank you.</h2>
            <p>{seller.name.split(" ")[0]} has been told and will pack <b>{done.title}</b> for you. You can follow it in Your purchases.</p>
            <div className="ordno"><small>Order number</small><b>{done.number}</b></div>
            <dl>
              <div><dt>Total</dt><dd>{usd(done.total)}</dd></div>
              <div><dt>Delivery</dt><dd>{SHIPPING[done.delivery].label}, {SHIPPING[done.delivery].note}</dd></div>
              <div><dt>Ships to</dt><dd>{done.ship.city}, {done.ship.country}</dd></div>
            </dl>
            <Link href="/shop?view=orders" className="sh-btn dark">See your purchases</Link>
            <Link href="/shop" className="sh-btn ghost">Keep browsing</Link>
            <p className="proto">Prototype: no payment was taken.</p>
          </div>
        ) : (
          <>
            <h2>Checkout</h2>
            <div className="sh-item">
              <div className="ph"><Pic name={p.photos[0]} sizes="72px" /></div>
              <div><b>{p.title}</b><small>by {seller.name}{qty > 1 ? ` · qty ${qty}` : ""}</small></div>
              <span>{usd(subtotal)}</span>
            </div>

            <h3>1. Where should it go?</h3>
            <div className="sh-form">
              {field("name", "Full name", "Your name", "name")}
              {field("address", "Street address", "House number and street", "street-address")}
              <div className="two">
                {field("city", "City", "City", "address-level2")}
                {field("country", "Country", "Country", "country-name")}
              </div>
            </div>
            {tried && missing.length > 0 && <p className="err">Please fill in your name, address, city and country.</p>}

            <h3>2. Delivery</h3>
            <div className="sh-opts">
              {(Object.keys(SHIPPING) as Delivery[]).map((k) => (
                <button key={k} className={delivery === k ? "on" : ""} onClick={() => setDelivery(k)} aria-pressed={delivery === k}>
                  <b>{SHIPPING[k].label}</b><small>{SHIPPING[k].note}</small><i>{usd(SHIPPING[k].cost)}</i>
                </button>
              ))}
            </div>

            <h3>3. How would you like to pay?</h3>
            <div className="sh-opts three">
              {(Object.keys(PAYMENTS) as Payment[]).map((k) => (
                <button key={k} className={payment === k ? "on" : ""} onClick={() => setPayment(k)} aria-pressed={payment === k}>
                  <b>{PAYMENTS[k].label}</b>
                </button>
              ))}
            </div>
            <p className="sh-note">{PAYMENTS[payment].note} <b>Prototype: no payment is taken.</b></p>

            <div className="sh-sum">
              <div><span>{p.title}{qty > 1 ? ` × ${qty}` : ""}</span><span>{usd(subtotal)}</span></div>
              <div><span>Shipping ({SHIPPING[delivery].label.toLowerCase()})</span><span>{usd(shipping)}</span></div>
              <div className="tot"><span>Total</span><b>{usd(total)}</b></div>
            </div>
            <button className="sh-btn lime big" onClick={place}>Place order · {usd(total)}</button>
          </>
        )}
      </aside>
    </div>
  );
}
