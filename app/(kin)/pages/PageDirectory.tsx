"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronRight, Copy, Search } from "lucide-react";
import Button from "@/components/kin/Button";
import { Input } from "@/components/kin/Field";
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
  const all = PAGE_GROUPS.map((g) => `${g.title}\n${g.pages.map((p) => `- ${p.title}: ${origin}${p.path}`).join("\n")}`).join("\n\n");

  return (
    <div className="pg">
      <header className="pg-head">
        <p className="pg-eyebrow">Preview</p>
        <h1>All pages</h1>
        <p>{total} pages: every designed page, by section, and the pages still to be designed, which open a Coming soon page. Each link opens its page directly, signed in as the demo member. Nothing here reaches the real Akines.</p>
        <div className="pg-tools">
          <div className="pg-search"><Input shape="pill" iconLeft={<Search size={18} strokeWidth={1.5} />} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Find a page" aria-label="Find a page" /></div>
          <Button variant="secondary" size="sm" icon={<Copy size={16} strokeWidth={1.5} aria-hidden />} onClick={() => copy(all, "all")}>{copied === "all" ? "Copied" : "Copy every link"}</Button>
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
                  <span className="t"><b>{p.title}</b><small>{p.what}</small></span>
                  <code>{p.path}</code>
                  <ChevronRight size={16} strokeWidth={1.5} aria-hidden />
                </Link>
                <button type="button" className="pg-copy" aria-label={`Copy link to ${p.title}`} onClick={() => copy(`${origin}${p.path}`, p.path)}>{copied === p.path ? "Copied" : "Copy link"}</button>
              </li>
            ))}
          </ul>
        </section>
      ))}
      {!groups.length && <p className="pg-none">No page matches “{q}”.</p>}
    </div>
  );
}
