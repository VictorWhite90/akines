"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft2, Calendar, Link21, Location, More, People } from "iconsax-reactjs";
import Avatar from "@/components/ui/Avatar";
import { account, fullName, type MemberProfile, type MyProfile } from "@/lib/api/account";
import { api } from "@/lib/api/client";
import { canGoBack } from "@/lib/navHistory";
import EditProfileModal from "./EditProfileModal";

type MyCommunity = { id: string; name: string; tagline: string; category_label: string; area: string; member_count: number; my_role: string | null; cover_photo: string | null };

/** Everything the page shows, the same shape for you and for another member. */
type Shown = {
  name: string;
  username: string | null;
  bio: string;
  photo: string | null;
  cover: string | null;
  location: string;
  website: string;
  joinedAt: string;
  interests: string[];
  communityCount: number | null;
};

const fromMine = (p: MyProfile, interestNames: Record<string, string>, communities: number | null): Shown => ({
  name: fullName(p), username: p.username, bio: p.bio, photo: p.profile_photo, cover: p.cover_photo, location: p.location,
  website: p.website, joinedAt: p.created_at, interests: p.interests.map((s) => interestNames[s] ?? s), communityCount: communities,
});

const fromMember = (m: MemberProfile): Shown => ({
  name: fullName(m), username: m.username, bio: m.bio, photo: m.profile_photo, cover: m.cover_photo, location: m.location,
  website: m.website, joinedAt: m.joined_at, interests: m.interests.map((i) => i.name), communityCount: m.community_count,
});

const joined = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
const siteLabel = (url: string) => url.replace(/^https?:\/\//, "").replace(/\/$/, "");

export default function ProfilePage({ username }: { username?: string }) {
  const own = !username;
  const [mine, setMine] = useState<MyProfile | null>(null);
  const [member, setMember] = useState<MemberProfile | null>(null);
  const [communities, setCommunities] = useState<MyCommunity[] | null>(null);
  const [interestNames, setInterestNames] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [tab, setTab] = useState<"communities" | "about">(own ? "communities" : "about");
  const [menu, setMenu] = useState(false);
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    let live = true;
    (async () => {
      if (own) {
        const [p, c, i] = await Promise.all([account.profile(), api.get<MyCommunity[]>("communities/mine"), account.interests()]);
        if (!live) return;
        if (!p.ok) return setError(p.message);
        setMine(p.data);
        setCommunities(c.ok ? c.data : []);
        if (i.ok) setInterestNames(Object.fromEntries(i.data.map((x) => [x.slug, x.name])));
      } else {
        const m = await account.member(username);
        if (!live) return;
        if (!m.ok) return setError(m.status === 404 ? "This account doesn't exist, or isn't available to you." : m.message);
        setMember(m.data);
      }
    })();
    return () => {
      live = false;
    };
  }, [own, username]);

  const shown = own ? (mine ? fromMine(mine, interestNames, communities?.length ?? null) : null) : member ? fromMember(member) : null;

  const block = async () => {
    setMenu(false);
    if (!member?.username || !window.confirm(`Block @${member.username}? They won't be able to see your profile or contact you.`)) return;
    const r = await account.block(member.username);
    if (r.ok) setBlocked(true);
  };

  return (
    <div className="kh mp">
      <header className="mp-bar">
        <button className="mp-back" onClick={() => (canGoBack() ? history.back() : (location.href = "/"))} aria-label="Back"><ArrowLeft2 size={20} color="currentColor" /></button>
        <span><b>{shown?.name ?? "Profile"}</b>{shown?.username && <small>@{shown.username}</small>}</span>
      </header>

      {error ? (
        <div className="mp-missing"><h1>{own ? "We couldn't load your profile" : "This account doesn't exist"}</h1><p>{error}</p></div>
      ) : blocked ? (
        <div className="mp-missing"><h1>You blocked @{member?.username}</h1><p>You can unblock them in Settings, Blocked members.</p><Link href="/settings/blocked" className="kh-btn outline">Blocked members</Link></div>
      ) : !shown ? (
        <div className="mp-skeleton" aria-busy="true"><span className="mp-cover" /><span className="mp-ava-ph" /></div>
      ) : (
        <>
          <div className="mp-cover">
            {/* eslint-disable-next-line @next/next/no-img-element -- member-uploaded banner, already resized on the server */}
            {shown.cover && <img src={shown.cover} alt="" />}
          </div>

          <div className="mp-head">
            <span className="mp-ava"><Avatar person={{ name: shown.name, photo: shown.photo }} size={132} /></span>
            <div className="mp-actions">
              {own ? (
                <button className="kh-btn outline" onClick={() => setEditing(true)}>Edit profile</button>
              ) : (
                <span className="mp-more">
                  <button className="mp-icon" onClick={() => setMenu((m) => !m)} aria-label="More" aria-expanded={menu}><More size={18} color="currentColor" /></button>
                  {menu && <span className="mp-menu" role="menu"><button role="menuitem" onClick={block}>Block @{shown.username}</button></span>}
                </span>
              )}
            </div>
          </div>

          <section className="mp-id">
            <h1>{shown.name}</h1>
            {shown.username ? <p className="mp-handle">@{shown.username}</p> : own && <button className="mp-add" onClick={() => setEditing(true)}>Add a username</button>}
            {shown.bio ? <p className="mp-bio">{shown.bio}</p> : own && <button className="mp-add" onClick={() => setEditing(true)}>Add a bio so people know what you&apos;re about</button>}
            <ul className="mp-meta">
              {shown.location && <li><Location size={16} color="currentColor" />{shown.location}</li>}
              {shown.website && <li><Link21 size={16} color="currentColor" /><a href={shown.website} target="_blank" rel="noopener noreferrer nofollow ugc">{siteLabel(shown.website)}</a></li>}
              <li><Calendar size={16} color="currentColor" />Joined {joined(shown.joinedAt)}</li>
            </ul>
            {shown.communityCount != null && <p className="mp-stats"><b>{shown.communityCount}</b> {shown.communityCount === 1 ? "community" : "communities"}</p>}
          </section>

          <nav className="mp-tabs" role="tablist">
            {own && <button role="tab" aria-selected={tab === "communities"} className={tab === "communities" ? "on" : undefined} onClick={() => setTab("communities")}>Communities</button>}
            <button role="tab" aria-selected={tab === "about"} className={tab === "about" ? "on" : undefined} onClick={() => setTab("about")}>About</button>
          </nav>

          {tab === "communities" && own && (
            <section className="mp-panel">
              {communities && communities.length > 0 ? (
                <ul className="mp-list">
                  {communities.map((c) => (
                    <li key={c.id}>
                      <span className="mp-c-ico"><People size={20} color="currentColor" /></span>
                      <span><b>{c.name}</b><small>{c.category_label} · {c.area} · {c.member_count.toLocaleString()} {c.member_count === 1 ? "member" : "members"}{c.my_role === "leader" ? " · You lead this" : ""}</small></span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="mp-empty">
                  <h2>No communities yet</h2>
                  <p>Communities are where people meet in person: hangouts, book clubs, fellowships. Join one with an invite link, or start your own.</p>
                  <Link href="/circles" className="kh-btn primary">Find communities</Link>
                </div>
              )}
            </section>
          )}

          {tab === "about" && (
            <section className="mp-panel">
              {shown.interests.length > 0 ? (
                <>
                  <h2 className="mp-sub">Into</h2>
                  <p className="mp-chips">{shown.interests.map((i) => <span key={i}>{i}</span>)}</p>
                </>
              ) : (
                <div className="mp-empty">
                  <h2>{own ? "Tell people what you're into" : "Nothing here yet"}</h2>
                  <p>{own ? "Interests help Akines introduce you to people with something in common." : `${shown.name} hasn't added interests yet.`}</p>
                  {own && <button className="kh-btn primary" onClick={() => setEditing(true)}>Add interests</button>}
                </div>
              )}
            </section>
          )}
        </>
      )}

      {editing && mine && <EditProfileModal profile={mine} onClose={() => setEditing(false)} onSaved={(p) => { setMine(p); setEditing(false); }} />}
    </div>
  );
}
