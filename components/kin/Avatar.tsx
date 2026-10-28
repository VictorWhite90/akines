"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { FACE } from "@/lib/data/images";
import type { Person } from "@/lib/data/people";
import { cn } from "@/lib/cn";
import { ease, spring } from "./motion";

export type AvatarPerson = Pick<Person, "name" | "face"> & { photo?: string | null };

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((s) => s[0]!.toUpperCase()).join("");
}

/** A round portrait, or initials on the surface tone. `live` adds the breathing amber ring. */
export default function Avatar({ person, size = 40, live = false, className }: { person: AvatarPerson; size?: number; live?: boolean; className?: string }) {
  const face = person.photo ? { src: person.photo, alt: person.name } : person.face ? FACE[person.face] : null;
  return (
    <span className={cn("k-ava-wrap", live && "live", className)} title={person.name}>
      <span className="k-ava" style={{ width: size, height: size, fontSize: Math.max(10, Math.round(size * 0.36)) }}>
        {face ? <Image src={face.src} alt={face.alt} width={size} height={size} sizes={`${size * 2}px`} unoptimized={!!person.photo} /> : initials(person.name)}
      </span>
    </span>
  );
}

/** The tie between two avatars: a short amber line with a knot. Dotted until both have said yes; `draw` animates it in. */
export function TieLine({ width = 28, dotted = false, draw = false }: { width?: number; dotted?: boolean; draw?: boolean }) {
  const reduced = useReducedMotion();
  const animate = draw && !reduced;
  return (
    <svg className="k-tie-line" width={width} height={10} viewBox={`0 0 ${width} 10`} aria-hidden>
      <motion.line x1={1} y1={5} x2={width - 1} y2={5} stroke="var(--brand-text)" strokeWidth={2} strokeLinecap="round" strokeDasharray={dotted ? "1 5" : undefined} initial={animate ? { pathLength: 0 } : false} animate={{ pathLength: 1 }} transition={{ duration: 0.32, ease: ease.enter }} />
      <motion.circle cx={width / 2} cy={5} r={3.5} fill="var(--brand)" stroke="var(--canvas)" strokeWidth={1.5} initial={animate ? { scale: 0 } : false} animate={{ scale: 1 }} transition={{ ...spring.settle, delay: animate ? 0.22 : 0 }} style={{ originX: "50%", originY: "50%", transformBox: "fill-box" }} />
    </svg>
  );
}

/** Two people, tied. */
export function Tie({ a, b, size = 36, dotted = false, draw = false, live }: { a: AvatarPerson; b: AvatarPerson; size?: number; dotted?: boolean; draw?: boolean; live?: "a" | "b" }) {
  return (
    <span className="k-tie" aria-label={`${a.name} and ${b.name}`}>
      <Avatar person={a} size={size} live={live === "a"} />
      <TieLine width={Math.round(size * 0.8)} dotted={dotted} draw={draw} />
      <Avatar person={b} size={size} live={live === "b"} />
    </span>
  );
}

/** A team: faces in a row, each tied to the next. */
export function Faces({ people, size = 28, max = 4 }: { people: AvatarPerson[]; size?: number; max?: number }) {
  const shown = people.slice(0, max);
  const rest = people.length - shown.length;
  return (
    <span className="k-faces" aria-label={people.map((p) => p.name).join(", ")}>
      {shown.map((p, i) => (
        <span key={p.name + i} className="k-tie">
          {i > 0 && <TieLine width={Math.round(size * 0.5)} />}
          <Avatar person={p} size={size} />
        </span>
      ))}
      {rest > 0 && <span className="t-micro c-3" style={{ marginLeft: 6 }}>+{rest}</span>}
    </span>
  );
}
