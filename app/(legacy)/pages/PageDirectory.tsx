"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Icon from "@/components/ui/Icon";
import { PAGE_GROUPS } from "./_list";

export default function PageDirectory() {
  const [q, setQ] = useState("");
  const [origin, setOrigin] = useState("");
  const [copied, setCopied] = useState("");
  // eslint-disable-next-line react-hooks/set-state-in-effect -- the site address is only known in the browser
  useEffect(() => setOrigin(location.origin), []);
  const term = q.trim().toLowerCase();
  const groups = PAGE_GROUPS.map((g) => ({ ...g, pages: g.pages.filter((p) => !term || `${g.title} ${p.title} ${p.what} ${p.path}`.toLowerCase().includes(term)) })).filter((g) => g.pages.length);
  const total = PAGE_GROUPS.reduce((n, g) => n + g.pages.length, 0);
  const copy = async (text: string, key: string) => {
    try { await navigator.clipboard.writeText(text); setCopied(key); setTimeout(() => setCopied(""), 1500); } catch { /* clipboard blocked */ }
  };
  const fresh = PAGE_GROUPS.reduce((n, g) => n + g.pages.filter((p) => p.isNew).length, 0);
  const all = PAGE_GROUPS.map((g) => `${g.title}\n${g.pages.map((p) => `- ${p.title}${p.isNew ? " (new)" : ""}: ${origin}${p.path}`).join("\n")}`).join("\n\n");

  return (
    <div className="kh pg">
      <header className="pg-head">
        <p className="pg-eyebrow">Preview</p>
        <h1>All pages</h1>
        <p>{total} pages, grouped the way the app&apos;s menu groups them. Each link opens its page directly, signed in as the demo member. Pages marked <span className="pg-new">New</span> are in this preview but not on the live site yet ({fresh} of them). Nothing here reaches the real Akines; use <b>Reset demo</b> at the top to start over.</p>
        <div className="pg-tools">
          <label className="pg-search"><Icon name="search" size={17} /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Find a page" aria-label="Find a page" /></label>
          <button type="button" className="kh-btn outline sm" onClick={() => copy(all, "all")}><Icon name="share" size={15} />{copied === "all" ? "Copied" : "Copy every link"}</button>
        </div>
        <nav className="pg-jump" aria-label="Sections">{PAGE_GROUPS.map((g) => <a key={g.id} href={`#${g.id}`}>{g.title.split(":")[0]}</a>)}</nav>
      </header>

      {groups.map((g) => (
        <section key={g.id} id={g.id} className="pg-group">
          <div className="pg-group-head"><h2>{g.title}</h2><p>{g.blurb}</p></div>
          <ul>
            {g.pages.map((p) => (
              <li key={p.path}>
                <Link href={p.path} className="pg-row">
                  <span className="t"><b>{p.title}{p.isNew && <span className="pg-new">New</span>}</b><small>{p.what}</small></span>
                  <code>{p.path}</code>
                  <Icon name="more" size={16} />
                </Link>
                <button type="button" className="pg-copy" aria-label={`Copy link to ${p.title}`} onClick={() => copy(`${origin}${p.path}`, p.path)}>{copied === p.path ? "Copied" : "Copy link"}</button>
              </li>
            ))}
          </ul>
        </section>
      ))}
      {!groups.length && <p className="co-muted">No page matches “{q}”.</p>}
    </div>
  );
}
