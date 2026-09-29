"use client";

import Pic from "@/components/home/Pic";
import Avatar from "@/components/ui/Avatar";
import { useState } from "react";
import { ME } from "@/lib/data/people";
import { CATEGORIES, COVER_CHOICES, nowStamp, type Category, type StoreProfile } from "@/lib/data/shop";

export function CoverPicker({ value, onChange }: { value: StoreProfile["cover"]; onChange: (k: StoreProfile["cover"]) => void }) {
  return (
    <div className="st-covers">
      {COVER_CHOICES.map((k) => (
        <button type="button" key={k} className={value === k ? "on" : ""} onClick={() => onChange(k)} aria-pressed={value === k} aria-label={`Cover photo ${k}`}>
          <Pic name={k} sizes="120px" />
          {value === k && <i>✓</i>}
        </button>
      ))}
    </div>
  );
}

export function CategoryChips({ value, onChange }: { value: Category[]; onChange: (c: Category[]) => void }) {
  return (
    <div className="st-chips">
      {CATEGORIES.map((c) => (
        <button type="button" key={c} className={value.includes(c) ? "on" : ""} aria-pressed={value.includes(c)} onClick={() => onChange(value.includes(c) ? value.filter((x) => x !== c) : [...value, c])}>{c}</button>
      ))}
    </div>
  );
}

/** First-visit screen: a few friendly questions and a live preview of the storefront card. */
export default function StoreSetup({ onCreate }: { onCreate: (s: StoreProfile) => void }) {
  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [city, setCity] = useState(ME.city);
  const [cover, setCover] = useState<StoreProfile["cover"]>("studioBusy");
  const [about, setAbout] = useState("");
  const [tried, setTried] = useState(false);

  const create = () => {
    setTried(true);
    if (!name.trim()) return;
    onCreate({ name: name.trim(), tagline: tagline.trim(), categories, city: city.trim(), cover, about: about.trim(), createdAt: nowStamp() });
  };

  return (
    <div className="sh st">
      <header className="sh-head">
        <div>
          <p className="eyebrow">My store</p>
          <h1 className="font-display">Open your store, <em>sell what you make.</em></h1>
          <p className="sub">Set up a small shop in a minute. Once it is open, you add products and other members can find and buy them in Shop art.</p>
        </div>
      </header>

      <ol className="st-how" aria-label="How selling works">
        <li><i>1</i><b>Set up your store</b><small>Name, cover and what you make</small></li>
        <li><i>2</i><b>Add products</b><small>Photos, price and the story</small></li>
        <li><i>3</i><b>Members buy in Shop art</b><small>Your work appears there right away</small></li>
        <li><i>4</i><b>You ship, they receive</b><small>Track each order in My store</small></li>
      </ol>

      <div className="st-setup">
        <form className="st-form" onSubmit={(e) => { e.preventDefault(); create(); }}>
          <label className={tried && !name.trim() ? "bad" : ""}>
            <span>Store name</span>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="For example: Amara's Corner" maxLength={40} />
            {tried && !name.trim() && <em>Give your store a name so people can find it.</em>}
          </label>
          <label>
            <span>Tagline <small>optional</small></span>
            <input value={tagline} onChange={(e) => setTagline(e.target.value)} placeholder="One line about what you make" maxLength={70} />
          </label>
          <div className="fld">
            <span>What do you make?</span>
            <CategoryChips value={categories} onChange={setCategories} />
          </div>
          <label>
            <span>Ships from</span>
            <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" />
          </label>
          <div className="fld">
            <span>Cover photo</span>
            <CoverPicker value={cover} onChange={setCover} />
          </div>
          <label>
            <span>About your store <small>optional</small></span>
            <textarea value={about} onChange={(e) => setAbout(e.target.value)} rows={3} placeholder="Who you are, how you work, what buyers can expect" maxLength={280} />
          </label>
          <button className="sh-btn lime big" type="submit">Open my store</button>
        </form>

        <aside className="st-preview" aria-label="Preview">
          <p className="cap">Live preview: how buyers see you</p>
          <div className="card">
            <div className="cv"><Pic name={cover} sizes="380px" /><span className="shade" /></div>
            <div className="bd">
              <Avatar person={ME} size={46} ring />
              <h3>{name.trim() || "Your store name"}</h3>
              <p className="tg">{tagline.trim() || "Your tagline goes here"}</p>
              <p className="mt">{ME.name} · {city.trim() || "Your city"}</p>
              {categories.length > 0 && <div className="tags">{categories.map((c) => <span key={c}>{c}</span>)}</div>}
              {about.trim() && <p className="ab">{about.trim()}</p>}
            </div>
          </div>
          <p className="fine">You can change all of this later in Settings.</p>
        </aside>
      </div>
    </div>
  );
}
