"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Avatar from "@/components/ui/Avatar";
import { ME } from "@/lib/data/people";
import { NAV_GROUPS, isActive } from "./nav";

export function Wordmark() {
  return (
    <Link href="/" className="brand" aria-label="Akines home">
      <Image src="/akines_logo_transparent.png" alt="Akines" width={168} height={45} priority />
    </Link>
  );
}

/** Left rail, styled exactly like the approved design. `open` shows it as a drawer on phones. */
export default function Sidebar({ open = false, onNavigate }: { open?: boolean; onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <aside className={`ac-side${open ? " open" : ""}`} aria-label="Sidebar">
      <Wordmark />
      <nav className="nav" aria-label="Main">
        {NAV_GROUPS.map((group, gi) => (
          <div className="grp" key={group.label ?? gi}>
            {group.label && <p>{group.label}</p>}
            {group.items.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link key={item.href} href={item.href} onClick={onNavigate} className={active ? "active" : undefined} aria-current={active ? "page" : undefined}>
                  <span className="glyph" aria-hidden>{item.glyph}</span>
                  <span>{item.label}</span>
                  {item.badge && <span className="badge">{item.badge}</span>}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
      <div className="mini-profile">
        <Avatar person={ME} size={38} />
        <div>
          <strong>{ME.name}</strong>
          <small>Collector · Lagos</small>
          <Link href="/login?signout=1" className="signout" onClick={onNavigate}>Sign out</Link>
        </div>
      </div>
    </aside>
  );
}
