"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SearchNormal1, ShieldTick } from "iconsax-reactjs";
import { CATEGORIES, communities, type Community } from "@/lib/api/community";

const PAGE = 12;

function Card({ c }: { c: Community }) {
  return (
    <Link href={`/circles/community/${c.id}`} className="cm-card">
      <span className={`cm-card-img${c.cover_photo ? "" : " no-photo"}`}>
        {/* eslint-disable-next-line @next/next/no-img-element -- leader-uploaded cover, resized on the server */}
        {c.cover_photo ? <img src={c.cover_photo} alt="" loading="lazy" /> : <b aria-hidden>{c.name.charAt(0)}</b>}
      </span>
      <div className="cm-card-tx">
        <small>{c.category_label} · {c.area}</small>
        <b>{c.name}{c.is_verified && <ShieldTick size={16} color="#f4a63a" variant="Bold" aria-label="Verified" />}</b>
        {c.tagline && <p>{c.tagline}</p>}
        <span className="cm-card-foot">
          <span>{c.member_count.toLocaleString()} {c.member_count === 1 ? "member" : "members"}</span>
          {c.my_role ? <span className="cm-chip ok">{c.my_role === "leader" ? "Leader" : "Member"}</span> : <span className="cm-chip">{c.my_request === "pending" ? "Requested" : c.visibility === "public" ? "Public" : "Private"}</span>}
        </span>
      </div>
    </Link>
  );
}

/** Community circles on real data: the ones you're in, then everything in Abuja with search, categories and paging. */
export default function CommunityDirectory() {
  const [mine, setMine] = useState<Community[] | null>(null);
  const [list, setList] = useState<Community[] | null>(null);
  const [page, setPage] = useState(1);
  const [more, setMore] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void communities.mine().then((r) => setMine(r.ok ? r.data : []));
  }, []);

  // Search waits a moment after typing; changing filters starts again from page 1.
  useEffect(() => {
    const t = setTimeout(async () => {
      const r = await communities.list({ search: search.trim(), category, page, pageSize: PAGE });
      if (!r.ok) return setError(r.message);
      setError(null);
      setList((prev) => (page === 1 || !prev ? r.data : [...prev, ...r.data]));
      setMore(r.data.length === PAGE);
    }, search ? 300 : 0);
    return () => clearTimeout(t);
  }, [search, category, page]);

  const filtering = !!search.trim() || !!category;
  const nothingAtAll = list !== null && list.length === 0 && !filtering;

  return (
    <section id="communities" className="kc-section kh cm-list">
      <div className="kh-sec">
        <div><h2>Community circles</h2><p>Clubs and communities that meet in person around Abuja.</p></div>
        <Link href="/circles/new?size=community" className="kh-btn amber sm">＋ Start a community</Link>
      </div>

      {mine && mine.length > 0 && (
        <>
          <h3 className="cm-subhead">Your communities</h3>
          <div className="cm-cards">{mine.map((c) => <Card key={c.id} c={c} />)}</div>
          <h3 className="cm-subhead">Discover</h3>
        </>
      )}

      {nothingAtAll ? (
        <div className="cm-blank">
          <h3>No communities here yet</h3>
          <p>Akines is just opening in Abuja. If you run a club, hangout, book club or fellowship, bring it here and invite your members with one link.</p>
          <span className="st-row">
            <Link href="/circles/new?size=community" className="kh-btn amber">Start a community</Link>
            <Link href="/circles/join/code" className="kh-btn outline">I have an invite code</Link>
          </span>
        </div>
      ) : (
        <>
          <div className="cm-filters">
            <label className="cm-searchbox"><SearchNormal1 size={16} color="currentColor" /><input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search communities" aria-label="Search communities" /></label>
            <div className="kh-chips cm-cats" role="group" aria-label="Category">
              <button className={!category ? "on" : undefined} onClick={() => { setCategory(""); setPage(1); }}>All</button>
              {CATEGORIES.map((x) => <button key={x.value} className={category === x.value ? "on" : undefined} onClick={() => { setCategory(x.value); setPage(1); }}>{x.label}</button>)}
            </div>
          </div>

          {error && <p className="st-notice bad" role="alert">{error}</p>}
          {list === null ? (
            <p className="kh-none" aria-busy="true">Loading communities…</p>
          ) : list.length === 0 ? (
            <p className="kh-none">No communities match that. Try another word or category.</p>
          ) : (
            <div className="cm-cards">{list.map((c) => <Card key={c.id} c={c} />)}</div>
          )}
          {more && <button className="kh-btn outline cm-more" onClick={() => setPage((p) => p + 1)}>Show more</button>}
          <p className="cm-small cm-code-link"><Link href="/circles/join/code" className="kh-link">Have an invite code?</Link></p>
        </>
      )}
    </section>
  );
}
