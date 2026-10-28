import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PostCard from "@/components/feed/PostCard";
import ProductCard from "@/components/shop/ProductCard";
import Avatar from "@/components/ui/Avatar";
import { POSTS } from "@/lib/data/feed";
import { MORE_POSTS } from "@/lib/data/feedMore";
import { JOURNAL } from "@/lib/data/journals";
import { ME, PEOPLE, PRESENCE, type Person, type PersonId } from "@/lib/data/people";
import { SEED_PRODUCTS } from "@/lib/data/shop";
import { STORIES } from "@/lib/data/stories";
import { seededStudio } from "@/lib/data/studio";

export function generateStaticParams() {
  return Object.keys(PEOPLE).map((id) => ({ id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const p = PEOPLE[id as PersonId];
  return { title: p ? `${p.name} · Akines` : "Profile · Akines" };
}

const DOT: Record<string, string> = { studio: "#e09a00", room: "#e5007e", quiet: "#9a96a3", open: "#00a86b" };

/** A member's profile: who they are, what they're up to, and the ways to reach them. */
export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p: Person | undefined = PEOPLE[id as PersonId];
  if (!p) notFound();
  const me = p.id === ME.id;
  const studio = seededStudio(p.id);
  const products = SEED_PRODUCTS.filter((x) => x.seller === p.id && x.status !== "draft");
  const stories = STORIES.filter((s) => s.by === p.id);
  const journal = JOURNAL.filter((j) => j.by === p.id);
  const posts = [...POSTS, ...MORE_POSTS].filter((x) => x.by === p.id).slice(0, 4);
  const presence = PRESENCE[p.presence];

  return (
    <div className="pf">
      <header className="pf-head">
        <Avatar person={p} size={104} className="pf-ava" />
        <div className="pf-who">
          <h1>{p.name}</h1>
          <p className="pf-role">{p.role} · {p.city}</p>
          <p className="pf-presence"><i style={{ background: DOT[p.presence] }} />{p.note ?? presence.label}</p>
          <p className="pf-about">{p.about}</p>
          <div className="pf-acts">
            {me ? (
              <>
                <Link href="/dna" className="ap-cta">Edit your profile</Link>
                <Link href="/studio" className="ap-btn">Your space</Link>
              </>
            ) : (
              <>
                <Link href={`/messages/${p.id}`} className="ap-cta">Message {p.name.split(" ")[0]}</Link>
                <Link href="/banter?new=chat" className="ap-btn">Start a Banter</Link>
                {studio && <Link href={`/studios/${p.id}`} className="ap-btn">Visit their space</Link>}
              </>
            )}
          </div>
        </div>
      </header>

      {products.length > 0 && (
        <section className="pf-sec" aria-label="What they offer">
          <div className="pf-sec-head"><h2>{me ? "What you offer" : "What they offer"}</h2><Link href={`/shop?seller=${p.id}`}>See all →</Link></div>
          <div className="pf-products">{products.slice(0, 4).map((x) => <ProductCard key={x.id} product={x} />)}</div>
        </section>
      )}

      {posts.length > 0 && (
        <section className="pf-sec" aria-label="Recent posts">
          <div className="pf-sec-head"><h2>Recent posts</h2></div>
          <div className="pf-posts">{posts.map((x) => <PostCard key={x.id} post={x} />)}</div>
        </section>
      )}

      {(stories.length > 0 || journal.length > 0) && (
        <section className="pf-sec" aria-label="Stories and journal">
          <div className="pf-sec-head"><h2>Stories &amp; journal</h2></div>
          <ul className="pf-list">
            {stories.map((s) => <li key={s.id}><Link href={`/stories/${s.id}`}><small>{s.kind} · {s.read} read</small><b>{s.title}</b><span>{s.excerpt}</span></Link></li>)}
            {journal.map((j) => <li key={j.id}><Link href="/journal"><small>{j.kind === "work" ? "Work journal" : "Life journal"} · {j.date}</small><b>{j.title}</b><span>{j.text}</span></Link></li>)}
          </ul>
        </section>
      )}
    </div>
  );
}
