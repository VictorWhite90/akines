"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Avatar from "@/components/ui/Avatar";
import { useMe } from "./MemberContext";
import { isActive } from "./nav";
import { RAIL, activeGroup } from "./railGroups";
import { ColorSwatch, InfoCircle, LogoutCurve, ProfileCircle, Setting2 } from "iconsax-reactjs";
import Icon, { Glyph } from "@/components/ui/Icon";

/** Slim night rail. Hovering (or focusing) a place reveals its pages. */
export default function Rail() {
  const pathname = usePathname();
  const current = activeGroup(pathname);
  const { me } = useMe();

  return (
    <aside className="nx-rail" aria-label="Main">
      <Link href="/" className="nx-mark" aria-label="Akines, your sky">
        <Image src="/akines/mark.svg" alt="" width={30} height={30} priority />
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
                    <Glyph g={i.glyph} size={18} className="g" />
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
        <Link href="/profile" className="nx-rail-me" aria-label="Your profile">
          <Avatar person={{ name: me?.name ?? "", photo: me?.photo }} size={42} />
        </Link>
        <div className="nx-fly" style={{ top: "auto", bottom: 0 }}>
          <p>{me?.name ?? ""}{me?.username && <small className="nx-fly-handle">@{me.username}</small>}</p>
          <Link href="/dna"><ColorSwatch size={18} color="currentColor" className="g" />Creative DNA</Link>
          <Link href="/studio"><Icon name="studio" className="g" />My studio</Link>
          <Link href="/profile"><ProfileCircle size={18} color="currentColor" className="g" />Your profile</Link>
          <Link href="/settings"><Setting2 size={18} color="currentColor" className="g" />Settings</Link>
          <Link href="/about"><InfoCircle size={18} color="currentColor" className="g" />About Akines</Link>
          <Link href="/login?signout=1"><LogoutCurve size={18} color="currentColor" className="g" />Sign out</Link>
        </div>
      </div>
    </aside>
  );
}
