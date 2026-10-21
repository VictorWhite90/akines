"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Camera, Location, People, ShieldTick } from "iconsax-reactjs";
import Avatar from "@/components/ui/Avatar";
import BackLink from "@/components/ui/BackLink";
import { fullName } from "@/lib/api/account";
import { AREAS, CATEGORIES, communities, type Community, type CommunityMember } from "@/lib/api/community";
import { shrinkImage } from "@/lib/imageShrink";
import InviteSheet from "./InviteSheet";

type Tab = "about" | "members" | "manage";

export default function CommunityCircleView({ id, startTab, welcome }: { id: string; startTab?: string; welcome?: boolean }) {
  const router = useRouter();
  const [c, setC] = useState<Community | null>(null);
  const [missing, setMissing] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>((["about", "members", "manage"] as Tab[]).includes(startTab as Tab) ? (startTab as Tab) : "about");
  const [invite, setInvite] = useState(false);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ text: string; tone: "ok" | "bad" } | null>(null);
  const [welcomed] = useState(!!welcome); // keeps the banner for this visit after the address is tidied

  const load = useCallback(async () => {
    const r = await communities.get(id);
    if (r.ok) setC(r.data);
    else setMissing(r.status === 404 ? "It may have been closed, or the link is incomplete." : r.message);
  }, [id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch the community when the page opens
    void load();
  }, [load]);

  // A leader arriving from "Create" gets the invite sheet once; the address drops ?welcome so a refresh doesn't repeat it.
  useEffect(() => {
    if (!welcome || c?.my_role !== "leader") return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- open once, when the new community has loaded
    setInvite(true);
    router.replace(`/circles/community/${id}`, { scroll: false });
  }, [welcome, c?.my_role, router, id]);

  if (missing) {
    return (
      <div className="kh cm-empty">
        <h1>We couldn&apos;t find that community</h1>
        <p>{missing}</p>
        <Link href="/circles" className="kh-btn amber">Browse communities</Link>
      </div>
    );
  }
  if (!c) return <div className="kh cm cm-loading" aria-busy="true"><span className="cm-hero-ph" /></div>;

  const leader = c.my_role === "leader";
  const member = !!c.my_role;
  const openJoin = c.is_verified && c.join_policy === "open";

  const join = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setBusy(true);
    const r = await communities.join(c.id, code.trim());
    setBusy(false);
    if (!r.ok) return setNotice({ text: r.message, tone: "bad" });
    setC(r.data);
    setNotice({ text: `Welcome to ${r.data.name}!`, tone: "ok" });
  };

  const leave = async () => {
    if (!window.confirm(`Leave ${c.name}?`)) return;
    const r = await communities.leave(c.id);
    if (!r.ok) return setNotice({ text: r.message, tone: "bad" });
    if (typeof r.data === "object" && r.data) setC(r.data as Community);
    else router.push("/circles");
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: "about", label: "About" },
    ...(member ? [{ id: "members" as Tab, label: `Members (${c.member_count.toLocaleString()})` }] : []),
    ...(leader ? [{ id: "manage" as Tab, label: "Manage" }] : []),
  ];

  return (
    <div className="kh cm">
      <BackLink fallback="/circles" className="cm-back">← Back</BackLink>

      <section className={`cm-hero${c.cover_photo ? "" : " no-photo"}`}>
        {/* eslint-disable-next-line @next/next/no-img-element -- leader-uploaded cover, resized on the server */}
        {c.cover_photo && <img src={c.cover_photo} alt="" className="cm-hero-img" />}
        <div className="cm-hero-shade" />
        <div className="cm-hero-tx">
          <span className="kh-badge"><i aria-hidden><b /></i>Community circle · {c.category_label}</span>
          <h1>{c.name}{c.is_verified && <ShieldTick size={26} color="#f4a63a" variant="Bold" aria-label="Verified by Akines" />}</h1>
          {c.tagline && <p>{c.tagline}</p>}
          <div className="cm-hero-meta">
            <span><People size={16} color="currentColor" /> {c.member_count.toLocaleString()} {c.member_count === 1 ? "member" : "members"}</span>
            <span><Location size={16} color="currentColor" /> {c.area}, {c.city}</span>
          </div>
          <div className="cm-hero-acts">
            {member ? (
              <>
                <span className="kh-btn glass">✓ {leader ? "You lead this community" : "You're a member"}</span>
                <button className="kh-btn amber" onClick={() => setInvite(true)}>Invite people</button>
                <button className="cm-leave" onClick={leave}>Leave</button>
              </>
            ) : openJoin ? (
              <button className="kh-btn amber" onClick={() => join()} disabled={busy}>{busy ? "Joining…" : "Join community"}</button>
            ) : (
              <form className="cm-code-form" onSubmit={join}>
                <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="Invite code" aria-label="Invite code" maxLength={12} autoCapitalize="characters" />
                <button className="kh-btn amber" type="submit" disabled={busy || code.trim().length < 4}>{busy ? "Joining…" : "Join"}</button>
              </form>
            )}
          </div>
        </div>
      </section>

      {welcomed && leader && (
        <div className="cm-welcome" role="status">
          <b>Your community is live.</b> Share your invite link with your members so they can join.
          {!c.is_verified && <span> Verification by the Akines team is pending.</span>}
        </div>
      )}
      {notice && <p className={`st-notice ${notice.tone}`} role={notice.tone === "bad" ? "alert" : "status"}>{notice.text}</p>}
      {!member && !openJoin && <p className="cm-small cm-gate">This community is invite-only. Ask a leader for the invite link or code.</p>}

      <nav className="cm-tabs" role="tablist" aria-label="Community sections">
        {tabs.map((t) => <button key={t.id} role="tab" aria-selected={tab === t.id} className={tab === t.id ? "on" : undefined} onClick={() => setTab(t.id)}>{t.label}</button>)}
      </nav>

      {tab === "about" && <About c={c} />}
      {tab === "members" && member && <Members c={c} onChange={load} />}
      {tab === "manage" && leader && <Manage c={c} onSaved={setC} onInvite={() => setInvite(true)} />}

      {invite && c.invite_code && <InviteSheet name={c.name} inviteCode={c.invite_code} leader={leader} onRotate={async () => {
        const r = await communities.rotateInvite(c.id);
        if (r.ok) setC({ ...c, invite_code: r.data.invite_code });
        return r.ok;
      }} onClose={() => setInvite(false)} />}
    </div>
  );
}

function About({ c }: { c: Community }) {
  return (
    <section className="cm-sec cm-about">
      <div className="kh-card">
        <h2>About</h2>
        {c.about ? <p className="cm-pre">{c.about}</p> : <p className="kh-none">No description yet.</p>}
        <div className="cm-links">
          {c.instagram && <a href={`https://instagram.com/${encodeURIComponent(c.instagram)}`} target="_blank" rel="noopener noreferrer nofollow">Instagram @{c.instagram}</a>}
          {c.whatsapp && c.my_role && <span>WhatsApp {c.whatsapp}</span>}
        </div>
      </div>
      <div className="kh-card">
        <h2>Leaders</h2>
        <ul className="cm-leaders">
          {c.leaders.map((l) => (
            <li key={l.user_id}>
              <Link href={l.username ? `/u/${l.username}` : "#"} className="kh-person"><Avatar person={{ name: fullName(l), photo: l.profile_photo }} size={40} /><span><span>{fullName(l)}</span><small>{l.username ? `@${l.username}` : "Leader"}</small></span></Link>
            </li>
          ))}
        </ul>
      </div>
      <div className="kh-card"><h2>Community guidelines</h2><ul>{c.guidelines.map((g) => <li key={g}>{g}</li>)}</ul></div>
    </section>
  );
}

function Members({ c, onChange }: { c: Community; onChange: () => void }) {
  const [list, setList] = useState<CommunityMember[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const leader = c.my_role === "leader";

  const load = useCallback(async () => {
    const r = await communities.members(c.id);
    if (r.ok) setList(r.data);
    else setError(r.message);
  }, [c.id]);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch members when the tab opens
    void load();
  }, [load]);

  const act = async (m: CommunityMember, what: "promote" | "demote" | "remove") => {
    if (what === "remove" && !window.confirm(`Remove ${fullName(m.user)} from ${c.name}?`)) return;
    const r = what === "remove" ? await communities.removeMember(c.id, m.user.user_id) : await communities.setRole(c.id, m.user.user_id, what === "promote" ? "leader" : "member");
    if (!r.ok) return setError(r.message);
    setError(null);
    await load();
    onChange();
  };

  if (!list) return <section className="cm-sec">{error ? <p className="kh-none" role="alert">{error}</p> : <p className="kh-none" aria-busy="true">Loading members…</p>}</section>;

  return (
    <section className="cm-sec">
      {error && <p className="st-notice bad" role="alert">{error}</p>}
      <ul className="st-list cm-members">
        {list.map((m) => (
          <li key={m.user.user_id}>
            <Avatar person={{ name: fullName(m.user), photo: m.user.profile_photo }} size={40} />
            <span>
              <b>{m.user.username ? <Link href={`/u/${m.user.username}`}>{fullName(m.user)}</Link> : fullName(m.user)}{m.role === "leader" && <em className="st-tag">Leader</em>}</b>
              <small>{m.user.username ? `@${m.user.username} · ` : ""}Joined {new Date(m.joined_at).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}</small>
            </span>
            {leader && (
              <span className="st-row">
                {m.role === "member" ? <button className="kh-btn outline sm" onClick={() => act(m, "promote")}>Make leader</button> : <button className="kh-btn outline sm" onClick={() => act(m, "demote")}>Make member</button>}
                {m.role === "member" && <button className="kh-btn outline sm st-danger-btn" onClick={() => act(m, "remove")}>Remove</button>}
              </span>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

function Manage({ c, onSaved, onInvite }: { c: Community; onSaved: (c: Community) => void; onInvite: () => void }) {
  const [f, setF] = useState({ name: c.name, tagline: c.tagline, about: c.about, category: c.category, area: c.area, instagram: c.instagram, whatsapp: c.whatsapp, join_policy: c.join_policy });
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ text: string; tone: "ok" | "bad"; field?: string } | null>(null);
  const coverInput = useRef<HTMLInputElement>(null);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setF((x) => ({ ...x, [k]: e.target.value }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const r = await communities.update(c.id, f);
    setBusy(false);
    if (!r.ok) return setNotice({ text: r.message, tone: "bad", field: r.field });
    onSaved(r.data);
    setNotice({ text: "Saved.", tone: "ok" });
  };

  const cover = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true);
    const r = await communities.uploadCover(c.id, await shrinkImage(file, 2000));
    setBusy(false);
    if (!r.ok) return setNotice({ text: r.message, tone: "bad" });
    onSaved(r.data);
    setNotice({ text: "Cover photo updated.", tone: "ok" });
  };

  const removeCover = async () => {
    const r = await communities.removeCover(c.id);
    if (r.ok) onSaved(r.data);
  };

  const bad = (k: string) => (notice?.field === k ? true : undefined);

  return (
    <section className="cm-sec">
      <div className="cm-stats">
        <div className="kh-card"><small>Members</small><b>{c.member_count.toLocaleString()}</b></div>
        <div className="kh-card"><small>Status</small><b>{c.is_verified ? "Verified" : "Awaiting verification"}</b></div>
        <div className="kh-card"><small>Joining</small><b>{c.join_policy === "open" ? "Open to all" : "Invite only"}</b></div>
      </div>

      <div className="st-row cm-manage-acts">
        <button className="kh-btn amber sm" onClick={onInvite}>Invite link and QR code</button>
        <button className="kh-btn outline sm" onClick={() => coverInput.current?.click()} disabled={busy}><Camera size={16} color="currentColor" /> {c.cover_photo ? "Change cover" : "Add cover photo"}</button>
        {c.cover_photo && <button className="kh-btn outline sm" onClick={removeCover}>Remove cover</button>}
        <input ref={coverInput} type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/*" hidden onChange={cover} />
      </div>

      <form className="cm-form kh-card" onSubmit={save} noValidate>
        <h2>Community details</h2>
        <div className="cm-field"><label htmlFor="mg-name">Name</label><input id="mg-name" value={f.name} onChange={set("name")} maxLength={60} aria-invalid={bad("name")} /></div>
        <div className="cm-field"><label htmlFor="mg-tag">Tagline</label><input id="mg-tag" value={f.tagline} onChange={set("tagline")} maxLength={140} /></div>
        <div className="cm-field"><label htmlFor="mg-about">About</label><textarea id="mg-about" rows={5} value={f.about} onChange={set("about")} maxLength={2000} /></div>
        <div className="cm-two">
          <div className="cm-field"><label htmlFor="mg-cat">Category</label><select id="mg-cat" value={f.category} onChange={set("category")}>{CATEGORIES.map((x) => <option key={x.value} value={x.value}>{x.label}</option>)}</select></div>
          <div className="cm-field"><label htmlFor="mg-area">Area</label><select id="mg-area" value={f.area} onChange={set("area")}>{AREAS.map((a) => <option key={a}>{a}</option>)}</select></div>
        </div>
        <div className="cm-two">
          <div className="cm-field"><label htmlFor="mg-ig">Instagram</label><input id="mg-ig" value={f.instagram} onChange={set("instagram")} aria-invalid={bad("instagram")} /></div>
          <div className="cm-field"><label htmlFor="mg-wa">WhatsApp <small>shown to members</small></label><input id="mg-wa" value={f.whatsapp} onChange={set("whatsapp")} inputMode="tel" aria-invalid={bad("whatsapp")} /></div>
        </div>
        <div className="cm-field">
          <span className="cm-l">Who can join</span>
          <div className="cm-seg" role="radiogroup" aria-label="Who can join">
            <button type="button" role="radio" aria-checked={f.join_policy === "invite_only"} className={f.join_policy === "invite_only" ? "on" : undefined} onClick={() => setF((x) => ({ ...x, join_policy: "invite_only" }))}>Invite link only</button>
            <button type="button" role="radio" aria-checked={f.join_policy === "open"} className={f.join_policy === "open" ? "on" : undefined} onClick={() => setF((x) => ({ ...x, join_policy: "open" }))} disabled={!c.is_verified}>Anyone on Akines</button>
          </div>
          {!c.is_verified && <span className="cm-small">Open joining unlocks once Akines has verified your community.</span>}
        </div>
        {notice && <p className={`st-notice ${notice.tone}`} role={notice.tone === "bad" ? "alert" : "status"}>{notice.text}</p>}
        <button className="kh-btn amber cm-submit" type="submit" disabled={busy}>{busy ? "Saving…" : "Save changes"}</button>
      </form>
    </section>
  );
}
