"use client";

import { useState } from "react";
import Pic from "@/components/home/Pic";
import { CATEGORIES, PRODUCT_PHOTOS, nowStamp, type Category, type Product } from "@/lib/data/shop";
import { newId } from "@/lib/useLocal";
import type { PhotoKey } from "@/lib/data/images";

/** Add or edit a product. Publishing makes it appear in Shop art straight away. */
export default function ProductForm({ initial, onSave, onClose }: { initial?: Product; onSave: (p: Product) => void; onClose: () => void }) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [category, setCategory] = useState<Category>(initial?.category ?? "Painting");
  const [price, setPrice] = useState(initial ? String(initial.price) : "");
  const [unique, setUnique] = useState(initial?.unique ?? true);
  const [stock, setStock] = useState(initial && !initial.unique ? String(initial.stock) : "5");
  const [medium, setMedium] = useState(initial?.medium ?? "");
  const [size, setSize] = useState(initial?.size ?? "");
  const [year, setYear] = useState(String(initial?.year ?? new Date().getFullYear()));
  const [story, setStory] = useState(initial?.story ?? "");
  const [photos, setPhotos] = useState<PhotoKey[]>(initial?.photos ?? []);
  const [shipping, setShipping] = useState(initial?.shipping ?? "");
  const [errors, setErrors] = useState<string[]>([]);

  const pick = (k: PhotoKey) => setPhotos((prev) => (prev.includes(k) ? prev.filter((x) => x !== k) : prev.length >= 4 ? prev : [...prev, k]));

  const submit = (status: Product["status"]) => {
    const errs: string[] = [];
    const n = Number(price);
    if (!title.trim()) errs.push("Add a title.");
    if (status === "published") {
      if (!(n > 0)) errs.push("Set a price above $0.");
      if (photos.length === 0) errs.push("Pick at least one photo.");
    }
    setErrors(errs);
    if (errs.length) return;
    const qty = unique ? 1 : Math.max(1, Math.floor(Number(stock) || 1));
    onSave({
      id: initial?.id ?? newId("prod"), title: title.trim(), category, price: n > 0 ? n : 0, medium: medium.trim() || "Not stated", size: size.trim() || "Not stated",
      year: Number(year) || new Date().getFullYear(), story: story.trim(), photos: photos.length ? photos : ["galleryTwo"], seller: "amara", stock: initial && initial.unique === unique && unique ? initial.stock : qty,
      unique, tags: initial?.tags ?? [category.toLowerCase()], status, shipping: shipping.trim() || undefined, createdAt: initial?.createdAt ?? nowStamp(),
    });
  };

  return (
    <div className="rs-modal st-modal" onClick={onClose}>
      <div className="card" role="dialog" aria-modal="true" aria-label={initial ? "Edit product" : "Add product"} onClick={(e) => e.stopPropagation()}>
        <button className="x" onClick={onClose} aria-label="Close">×</button>
        <h2>{initial ? "Edit product" : "Add a product"}</h2>
        <p className="lead">Fill in what you can. Publish when you are happy, or save a draft and come back.</p>

        <div className="st-form">
          <label><span>Title</span><input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What is it called?" maxLength={60} /></label>

          <div className="fld">
            <span>Category</span>
            <div className="st-chips">
              {CATEGORIES.map((c) => <button type="button" key={c} className={category === c ? "on" : ""} aria-pressed={category === c} onClick={() => setCategory(c)}>{c}</button>)}
            </div>
          </div>

          <div className="two">
            <label><span>Price (USD)</span><div className="money"><i>$</i><input inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value.replace(/[^0-9.]/g, ""))} placeholder="0" /></div></label>
            <div className="fld">
              <span>Stock</span>
              <div className="seg">
                <button type="button" className={unique ? "on" : ""} onClick={() => setUnique(true)}>Unique original</button>
                <button type="button" className={!unique ? "on" : ""} onClick={() => setUnique(false)}>Several</button>
              </div>
              {!unique && <input className="qtyin" inputMode="numeric" value={stock} onChange={(e) => setStock(e.target.value.replace(/\D/g, ""))} aria-label="Quantity in stock" placeholder="How many?" />}
            </div>
          </div>

          <div className="three">
            <label><span>Medium</span><input value={medium} onChange={(e) => setMedium(e.target.value)} placeholder="Oil on canvas" /></label>
            <label><span>Size</span><input value={size} onChange={(e) => setSize(e.target.value)} placeholder="40 × 50 cm" /></label>
            <label><span>Year</span><input inputMode="numeric" value={year} onChange={(e) => setYear(e.target.value.replace(/\D/g, "").slice(0, 4))} /></label>
          </div>

          <label><span>The story behind it</span><textarea rows={3} value={story} onChange={(e) => setStory(e.target.value)} placeholder="What inspired it? How was it made? Buyers love this part." /></label>

          <div className="fld">
            <span>Photos <small>{photos.length} of 4 picked · the first is the cover</small></span>
            <div className="st-photos">
              {PRODUCT_PHOTOS.map((k) => {
                const at = photos.indexOf(k);
                return (
                  <button type="button" key={k} className={at >= 0 ? "on" : ""} onClick={() => pick(k)} aria-pressed={at >= 0} aria-label={`Photo ${k}`} disabled={at < 0 && photos.length >= 4}>
                    <Pic name={k} sizes="90px" />
                    {at >= 0 && <i>{at + 1}</i>}
                  </button>
                );
              })}
            </div>
            <small className="hint">Prototype: photos come from the Kinnect library instead of an upload.</small>
          </div>

          <label><span>Shipping note <small>optional</small></span><input value={shipping} onChange={(e) => setShipping(e.target.value)} placeholder="For example: Ships from Lagos in 3 to 5 days" /></label>
        </div>

        {errors.length > 0 && <ul className="st-errs">{errors.map((e) => <li key={e}>{e}</li>)}</ul>}
        <div className="st-actions">
          <button className="sh-btn ghost" onClick={() => submit("draft")}>Save draft</button>
          <button className="sh-btn lime" onClick={() => submit("published")}>{initial?.status === "published" ? "Save and keep published" : "Publish now"}</button>
        </div>
      </div>
    </div>
  );
}
