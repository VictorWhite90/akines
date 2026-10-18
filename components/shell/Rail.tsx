"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Avatar from "@/components/ui/Avatar";
import { ME } from "@/lib/data/people";
import { isActive } from "./nav";
import { RAIL, activeGroup } from "./railGroups";

/** Slim night rail. Hovering (or focusing) a place reveals its pages. */
export default function Rail() {
  const pathname = usePathname();
  const current = activeGroup(pathname);

  return (
    <aside className="nx-rail" aria-label="Main">
      <Link href="/" className="nx-mark" aria-label="Akines, your sky">
        <Image src="/akines/mark.png" alt="" width={30} height={30} priority />
      </Link>
      <nav aria-label="Places" style={{ display: "contents" }}>
        {RAIL.map((g) => (
          <div key={g.id} className="nx-rail-item">
            <Link href={g.href} className={`nx-rail-btn${current.id === g.id ? " on" : ""}`} aria-label={g.label} aria-current={current.id === g.id ? "true" : undefined}>
              <g.Icon size={24} color="currentColor" variant={current.id === g.id ? "Bold" : "Linear"} />
              {g.dot && current.id !== g.id && <span className="nx-rail-dot" aria-hidden />}
            </Link>
            {g.items.length > 1 && <div className="nx-fly">
              <p>{g.label}</p>
              {g.items.map((i) => {
                const on = i.href === "/" ? pathname === "/" : isActive(pathname, i.href);
                return (
                  <Link key={i.href} href={i.href} className={on ? "on" : undefined}>
                    <span className="g" aria-hidden>{i.glyph}</span>
                    {i.label}
                    {i.badge && <span className="b">{i.badge}</span>}
                  </Link>
                );
              })}
            </div>}
          </div>
        ))}
      </nav>
      <span className="nx-rail-spacer" />
      <div className="nx-rail-item">
        <Link href="/dna" className="nx-rail-me" aria-label="Your Creative DNA and profile">
          <Avatar person={ME} size={42} />
        </Link>
        <div className="nx-fly" style={{ top: "auto", bottom: 0 }}>
          <p>{ME.name}</p>
          <Link href="/dna"><span className="g">◐</span>Creative DNA</Link>
          <Link href="/studio"><span className="g">✦</span>My studio</Link>
          <Link href="/about"><span className="g">ⓘ</span>About Akines</Link>
          <Link href="/login?signout=1"><span className="g">↩</span>Sign out</Link>
        </div>
      </div>
    </aside>
  );
}
