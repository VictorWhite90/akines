"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Gallery, Heart, Message, More, Send2 } from "iconsax-reactjs";
import Avatar from "@/components/ui/Avatar";
import { useMe } from "@/components/shell/MemberContext";
import { communities, type Community, type CommunityPost, type PostAuthor, type PostComment } from "@/lib/api/community";
import { shrinkImage } from "@/lib/imageShrink";
import { timeAgo } from "@/components/notifications/NotificationList";

const MAX_IMAGES = 4;
const name = (a: PostAuthor) => [a.first_name, a.last_name].filter(Boolean).join(" ") || (a.username ? `@${a.username}` : "Member");

/** The community's announcements and discussion. Members post; leaders announce, pin and tidy up. */
export default function CommunityPosts({ c, focusPost }: { c: Community; focusPost?: number }) {
  const member = !!c.my_role;
  const [posts, setPosts] = useState<CommunityPost[] | null>(null);
  const [page, setPage] = useState(1);
  const [more, setMore] = useState(false);
  const [filter, setFilter] = useState<"all" | "announcement">("all");
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (p: number, f: typeof filter) => {
    const r = await communities.posts(c.id, p, f === "all" ? undefined : f);
    if (!r.ok) return setError(r.message);
    setError(null);
    setPosts((prev) => (p === 1 || !prev ? r.data : [...prev, ...r.data]));
    setMore(r.data.length === 15);
  }, [c.id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch when the tab opens, pages or filters
    void load(page, filter);
  }, [load, page, filter]);

  const replace = (p: CommunityPost) => setPosts((list) => list?.map((x) => (x.id === p.id ? p : x)) ?? null);
  const drop = (id: number) => setPosts((list) => list?.filter((x) => x.id !== id) ?? null);
  const added = (p: CommunityPost) => setPosts((list) => [p, ...(list ?? [])].sort((a, b) => Number(b.is_pinned) - Number(a.is_pinned)));
  const repin = async (p: CommunityPost) => {
    const r = await communities.pinPost(c.id, p.id);
    if (!r.ok) return setError(r.message);
    setPosts((list) => list ? [...list.map((x) => (x.id === p.id ? r.data : x))].sort((a, b) => Number(b.is_pinned) - Number(a.is_pinned) || +new Date(b.created_at) - +new Date(a.created_at)) : list);
  };

  return (
    <section className="cm-sec cmp">
      {member && <Composer c={c} onPosted={added} />}

      <div className="kh-chips cmp-filter" role="group" aria-label="Show">
        <button className={filter === "all" ? "on" : undefined} onClick={() => { setFilter("all"); setPage(1); }}>All posts</button>
        <button className={filter === "announcement" ? "on" : undefined} onClick={() => { setFilter("announcement"); setPage(1); }}>Announcements</button>
      </div>

      {error && <p className="st-notice bad" role="alert">{error}</p>}
      {posts === null ? (
        <p className="kh-none" aria-busy="true">Loading posts…</p>
      ) : posts.length === 0 ? (
        <div className="cm-blank">
          <h3>{filter === "announcement" ? "No announcements yet" : "Nothing posted yet"}</h3>
          <p>{member ? (c.my_role === "leader" ? "Post a welcome or an announcement so new members know what's coming up." : "Say hello, ask a question or share a photo from your last meet-up.") : "Join the community to post and reply."}</p>
        </div>
      ) : (
        <ul className="cmp-list">
          {posts.map((p) => <PostItem key={p.id} c={c} p={p} focus={p.id === focusPost} onChange={replace} onRemoved={drop} onPin={repin} />)}
        </ul>
      )}
      {more && <button className="kh-btn outline cm-more" onClick={() => setPage((x) => x + 1)}>Show more</button>}
    </section>
  );
}

function Composer({ c, onPosted }: { c: Community; onPosted: (p: CommunityPost) => void }) {
  const { me } = useMe();
  const leader = c.my_role === "leader";
  const [body, setBody] = useState("");
  const [kind, setKind] = useState<"discussion" | "announcement">("discussion");
  const [images, setImages] = useState<{ id?: number; url: string; uploading: boolean }[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const pick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []).slice(0, MAX_IMAGES - images.length);
    e.target.value = "";
    for (const file of files) {
      const blob = await shrinkImage(file, 1600);
      const preview = URL.createObjectURL(blob);
      setImages((list) => [...list, { url: preview, uploading: true }]);
      const r = await communities.uploadPostImage(c.id, blob);
      setImages((list) => list.flatMap((x) => (x.url !== preview ? [x] : r.ok ? [{ id: r.data.id, url: preview, uploading: false }] : [])));
      if (!r.ok) setError(r.message);
    }
  };

  const post = async () => {
    setBusy(true);
    setError(null);
    const r = await communities.createPost(c.id, { body: body.trim(), kind, image_ids: images.flatMap((x) => (x.id ? [x.id] : [])) });
    setBusy(false);
    if (!r.ok) return setError(r.message);
    images.forEach((x) => URL.revokeObjectURL(x.url));
    setBody("");
    setImages([]);
    setKind("discussion");
    onPosted(r.data);
  };

  const uploading = images.some((x) => x.uploading);
  const empty = !body.trim() && !images.some((x) => x.id);

  return (
    <div className="cmp-compose">
      <Avatar person={{ name: me?.name ?? "", photo: me?.photo }} size={40} />
      <div>
        <textarea value={body} onChange={(e) => setBody(e.target.value)} maxLength={3000} rows={body ? Math.min(8, body.split("\n").length + 1) : 2}
          placeholder={kind === "announcement" ? `Announce something to everyone in ${c.name}…` : "Say hello, ask a question, share a photo…"} aria-label="Write a post" />
        {images.length > 0 && (
          <div className={`cmp-thumbs n${images.length}`}>
            {images.map((x) => (
              <span key={x.url} className={x.uploading ? "busy" : undefined}>
                {/* eslint-disable-next-line @next/next/no-img-element -- local preview */}
                <img src={x.url} alt="" />
                {!x.uploading && <button onClick={() => setImages((list) => list.filter((y) => y.url !== x.url))} aria-label="Remove photo">×</button>}
              </span>
            ))}
          </div>
        )}
        {error && <p className="st-notice bad" role="alert">{error}</p>}
        <div className="cmp-compose-foot">
          <button className="cmp-icon" onClick={() => fileInput.current?.click()} disabled={images.length >= MAX_IMAGES} aria-label="Add photos"><Gallery size={20} color="currentColor" /></button>
          <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/*" multiple hidden onChange={pick} />
          {leader && (
            <span className="cm-seg cmp-kind" role="radiogroup" aria-label="Post type">
              <button type="button" role="radio" aria-checked={kind === "discussion"} className={kind === "discussion" ? "on" : undefined} onClick={() => setKind("discussion")}>Post</button>
              <button type="button" role="radio" aria-checked={kind === "announcement"} className={kind === "announcement" ? "on" : undefined} onClick={() => setKind("announcement")}>Announcement</button>
            </span>
          )}
          <span className="cmp-count">{body.length > 2500 ? `${body.length}/3000` : ""}</span>
          <button className="kh-btn primary sm" onClick={post} disabled={busy || uploading || empty}>{busy ? "Posting…" : kind === "announcement" ? "Announce" : "Post"}</button>
        </div>
      </div>
    </div>
  );
}

function PostItem({ c, p, focus, onChange, onRemoved, onPin }: { c: Community; p: CommunityPost; focus: boolean; onChange: (p: CommunityPost) => void; onRemoved: (id: number) => void; onPin: (p: CommunityPost) => void }) {
  const leader = c.my_role === "leader";
  const member = !!c.my_role;
  const [menu, setMenu] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(p.body);
  const [showComments, setShowComments] = useState(focus);
  const ref = useRef<HTMLLIElement>(null);

  useEffect(() => {
    if (focus) ref.current?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [focus]);

  const heart = async () => {
    if (!member) return;
    const on = !p.my_reaction;
    onChange({ ...p, my_reaction: on, reaction_count: p.reaction_count + (on ? 1 : -1) });
    const r = await communities.heart(c.id, p.id, on);
    if (r.ok) onChange({ ...p, my_reaction: r.data.my_reaction, reaction_count: r.data.reaction_count });
  };

  const save = async () => {
    const r = await communities.editPost(c.id, p.id, draft);
    if (r.ok) {
      onChange(r.data);
      setEditing(false);
    }
  };

  const remove = async () => {
    setMenu(false);
    if (!window.confirm("Remove this post?")) return;
    const r = await communities.removePost(c.id, p.id);
    if (r.ok) onRemoved(p.id);
  };

  return (
    <li ref={ref} className={`cmp-post${p.kind === "announcement" ? " announce" : ""}${focus ? " focus" : ""}`}>
      <Link href={p.author.username ? `/u/${p.author.username}` : "#"} className="cmp-ava"><Avatar person={{ name: name(p.author), photo: p.author.profile_photo }} size={40} /></Link>
      <div className="cmp-main">
        <header>
          <span className="cmp-who">
            <b>{name(p.author)}</b>
            {p.author_is_leader && <em className="st-tag">Leader</em>}
            <small>{p.author.username ? `@${p.author.username} · ` : ""}{timeAgo(p.created_at)}{p.edited_at ? " · edited" : ""}</small>
          </span>
          {(p.can_edit || p.can_remove || leader) && (
            <span className="cmp-more">
              <button className="cmp-icon" onClick={() => setMenu((m) => !m)} aria-label="Post options" aria-expanded={menu}><More size={18} color="currentColor" /></button>
              {menu && (
                <span className="mp-menu" role="menu" onMouseLeave={() => setMenu(false)}>
                  {p.can_edit && <button role="menuitem" className="neutral" onClick={() => { setMenu(false); setEditing(true); setDraft(p.body); }}>Edit</button>}
                  {leader && <button role="menuitem" className="neutral" onClick={() => { setMenu(false); onPin(p); }}>{p.is_pinned ? "Unpin" : "Pin to top"}</button>}
                  {p.can_remove && <button role="menuitem" onClick={remove}>Remove post</button>}
                </span>
              )}
            </span>
          )}
        </header>
        {(p.is_pinned || p.kind === "announcement") && (
          <p className="cmp-flags">{p.is_pinned && <span>📌 Pinned</span>}{p.kind === "announcement" && <span className="ann">Announcement</span>}</p>
        )}

        {editing ? (
          <div className="cmp-edit">
            <textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={4} maxLength={3000} aria-label="Edit post" />
            <span className="st-row"><button className="kh-btn primary sm" onClick={save} disabled={!draft.trim()}>Save</button><button className="kh-btn outline sm" onClick={() => setEditing(false)}>Cancel</button></span>
          </div>
        ) : (
          p.body && <p className="cmp-body">{p.body}</p>
        )}

        {p.images.length > 0 && (
          <div className={`cmp-photos n${p.images.length}`}>
            {p.images.map((img) => (
              <a key={img.id} href={img.url} target="_blank" rel="noopener noreferrer">
                {/* eslint-disable-next-line @next/next/no-img-element -- member photo, resized on the server */}
                <img src={img.url} alt="" loading="lazy" />
              </a>
            ))}
          </div>
        )}

        <footer className="cmp-acts">
          <button className={`cmp-act${p.my_reaction ? " on" : ""}`} onClick={heart} disabled={!member} aria-pressed={p.my_reaction} aria-label={p.my_reaction ? "Remove heart" : "Heart"}>
            <Heart size={18} color="currentColor" variant={p.my_reaction ? "Bold" : "Linear"} />{p.reaction_count > 0 && p.reaction_count}
          </button>
          <button className="cmp-act" onClick={() => setShowComments((s) => !s)} aria-expanded={showComments}>
            <Message size={18} color="currentColor" />{p.comment_count > 0 ? p.comment_count : "Reply"}
          </button>
        </footer>
        {showComments && <Comments c={c} p={p} onCount={(n) => onChange({ ...p, comment_count: n })} />}
      </div>
    </li>
  );
}

function Comments({ c, p, onCount }: { c: Community; p: CommunityPost; onCount: (n: number) => void }) {
  const { me } = useMe();
  const [list, setList] = useState<PostComment[] | null>(null);
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const member = !!c.my_role;

  useEffect(() => {
    void communities.comments(c.id, p.id).then((r) => (r.ok ? setList(r.data) : setError(r.message)));
  }, [c.id, p.id]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;
    setBusy(true);
    const r = await communities.comment(c.id, p.id, body.trim());
    setBusy(false);
    if (!r.ok) return setError(r.message);
    const next = [...(list ?? []), r.data];
    setList(next);
    setBody("");
    onCount(next.length);
  };

  const remove = async (cm: PostComment) => {
    const r = await communities.removeComment(c.id, p.id, cm.id);
    if (!r.ok) return setError(r.message);
    const next = (list ?? []).filter((x) => x.id !== cm.id);
    setList(next);
    onCount(next.length);
  };

  return (
    <div className="cmp-comments">
      {error && <p className="st-notice bad" role="alert">{error}</p>}
      {list === null ? <p className="kh-none">Loading…</p> : (
        <ul>
          {list.map((cm) => (
            <li key={cm.id}>
              <Avatar person={{ name: name(cm.author), photo: cm.author.profile_photo }} size={28} />
              <span className="cmp-bubble">
                <b>{name(cm.author)}{cm.author_is_leader && <em className="st-tag">Leader</em>}</b>
                <span>{cm.body}</span>
                <small>{timeAgo(cm.created_at)}{cm.can_remove && <> · <button onClick={() => remove(cm)}>Remove</button></>}</small>
              </span>
            </li>
          ))}
        </ul>
      )}
      {member && (
        <form className="cmp-reply" onSubmit={send}>
          <Avatar person={{ name: me?.name ?? "", photo: me?.photo }} size={28} />
          <input value={body} onChange={(e) => setBody(e.target.value)} placeholder="Write a reply…" maxLength={1000} aria-label="Write a reply" />
          <button className="cmp-icon" type="submit" disabled={busy || !body.trim()} aria-label="Send reply"><Send2 size={18} color="currentColor" /></button>
        </form>
      )}
    </div>
  );
}
