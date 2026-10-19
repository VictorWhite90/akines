"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Photo from "@/components/ui/Photo";
import type { PhotoKey } from "@/lib/data/images";
import { ABUJA_AREAS, COMMUNITY_CATEGORIES, DEFAULT_GUIDELINES, inviteCode, type AbujaArea, type CommunityCategory } from "@/lib/data/communityCircles";
import { useCommunities } from "../useCommunities";

const COVERS: PhotoKey[] = ["talkLaugh", "talkGroup", "talkCafe", "talkMugs", "journalCoffee", "kincircleHero", "talkYoung", "calmBench"];

/** One page form for a community circle. The leader is the creator; verification is reviewed by the Akines team. */
export default function CreateCommunity() {
  const router = useRouter();
  const { create } = useCommunities();
  const [f, setF] = useState({ name: "", tagline: "", about: "", category: "Social hangouts" as CommunityCategory, area: "Wuse 2" as AbujaArea, photo: "talkLaugh" as PhotoKey, members: "", instagram: "", whatsapp: "" });
  const [tried, setTried] = useState(false);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setF((x) => ({ ...x, [k]: e.target.value }));
  const errors = { name: f.name.trim().length < 3 ? "Give your community a name (at least 3 letters)." : "", about: f.about.trim().length < 20 ? "Tell people what you do in a sentence or two." : "" };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setTried(true);
    if (errors.name || errors.about) return;
    const c = create({ name: f.name.trim(), tagline: f.tagline.trim() || "A community on Akines.", about: f.about.trim(), category: f.category, area: f.area, photo: f.photo, members: Math.max(0, parseInt(f.members || "0", 10) || 0), instagram: f.instagram.replace(/^@/, "").trim() || undefined, whatsapp: f.whatsapp.trim() || undefined, inviteCode: inviteCode(f.name), guidelines: DEFAULT_GUIDELINES });
    router.push(`/circles/community/${c.id}?welcome=1`);
  };

  return (
    <div className="kh cm-create">
      <Link href="/circles/new" className="cm-back">← Back</Link>
      <header>
        <p className="cm-over">Community circle</p>
        <h1>Bring your community to Akines</h1>
        <p>For clubs, hangouts, faith groups, book clubs and any community that meets in person. You'll be the leader and can add co-leaders later.</p>
      </header>

      <form className="cm-form" onSubmit={submit} noValidate>
        <div className="cm-field">
          <label htmlFor="cc-name">Community name</label>
          <input id="cc-name" value={f.name} onChange={set("name")} placeholder="e.g. Sunday Table Abuja" aria-invalid={tried && !!errors.name} />
          {tried && errors.name && <span className="cm-err">{errors.name}</span>}
        </div>
        <div className="cm-field">
          <label htmlFor="cc-tag">One-line tagline <small>optional</small></label>
          <input id="cc-tag" value={f.tagline} onChange={set("tagline")} placeholder="e.g. Come alone, leave with friends." maxLength={70} />
        </div>
        <div className="cm-field">
          <label htmlFor="cc-about">What does your community do?</label>
          <textarea id="cc-about" value={f.about} onChange={set("about")} rows={4} placeholder="Who it's for, what happens at your events, how often you meet." aria-invalid={tried && !!errors.about} />
          {tried && errors.about && <span className="cm-err">{errors.about}</span>}
        </div>
        <div className="cm-two">
          <div className="cm-field">
            <label htmlFor="cc-cat">Category</label>
            <select id="cc-cat" value={f.category} onChange={set("category")}>{COMMUNITY_CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select>
          </div>
          <div className="cm-field">
            <label htmlFor="cc-area">Main area in Abuja</label>
            <select id="cc-area" value={f.area} onChange={set("area")}>{ABUJA_AREAS.map((a) => <option key={a}>{a}</option>)}</select>
          </div>
        </div>
        <div className="cm-field">
          <span className="cm-l">Cover photo</span>
          <div className="cm-covers" role="radiogroup" aria-label="Cover photo">
            {COVERS.map((p) => (
              <button type="button" key={p} role="radio" aria-checked={f.photo === p} className={f.photo === p ? "on" : undefined} onClick={() => setF((x) => ({ ...x, photo: p }))}>
                <Photo name={p} sizes="120px" className="cm-cover" />
              </button>
            ))}
          </div>
        </div>
        <div className="cm-two">
          <div className="cm-field">
            <label htmlFor="cc-ig">Instagram <small>optional</small></label>
            <input id="cc-ig" value={f.instagram} onChange={set("instagram")} placeholder="@yourcommunity" />
          </div>
          <div className="cm-field">
            <label htmlFor="cc-wa">WhatsApp contact <small>optional</small></label>
            <input id="cc-wa" value={f.whatsapp} onChange={set("whatsapp")} placeholder="+234…" inputMode="tel" />
          </div>
        </div>
        <div className="cm-field">
          <label htmlFor="cc-mem">How many members do you have today? <small>optional</small></label>
          <input id="cc-mem" value={f.members} onChange={set("members")} inputMode="numeric" placeholder="e.g. 450" />
        </div>
        <p className="cm-small">New communities get a "Verified" badge after the Akines team checks them, usually within two days.</p>
        <button className="kh-btn amber cm-submit" type="submit">Create community circle</button>
      </form>
    </div>
  );
}
