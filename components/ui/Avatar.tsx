import Image from "next/image";
import { FACE } from "@/lib/data/images";
import type { Person } from "@/lib/data/people";
import { cn } from "@/lib/cn";

const TONES = ["bg-clay-200 text-clay-700", "bg-ochre-200 text-ochre-600", "bg-moss-100 text-moss-700", "bg-ink-100 text-ink-700"];

function tone(name: string) {
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return TONES[h % TONES.length];
}

/** Round portrait, or initials on a cloth tone when a member has no photo. */
export default function Avatar({ person, size = 40, ring = false, className }: { person: Pick<Person, "name" | "face"> & { photo?: string | null }; size?: number; ring?: boolean; className?: string }) {
  const face = person.photo ? { src: person.photo, alt: person.name } : person.face ? FACE[person.face] : null;
  const box = { width: size, height: size };
  const initials = person.name
    .split(/\s+/)
    .slice(0, 2)
    .map((s) => s[0])
    .join("");
  return (
    <span
      className={cn("relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full font-semibold", !face && tone(person.name), ring && "ring-2 ring-paper-50", className)}
      style={{ ...box, fontSize: Math.max(10, size * 0.36) }}
      title={person.name}
    >
      {face ? <Image src={face.src} alt={face.alt} fill sizes={`${Math.ceil(size * 2)}px`} className="object-cover" style={{ objectPosition: "50% 30%" }} /> : initials}
    </span>
  );
}

export function AvatarStack({ people, size = 32, max = 5, ringClass = "ring-paper-50" }: { people: Pick<Person, "name" | "face">[]; size?: number; max?: number; ringClass?: string }) {
  const shown = people.slice(0, max);
  const rest = people.length - shown.length;
  return (
    <span className="inline-flex items-center">
      {shown.map((p, i) => (
        <span key={p.name} className={cn("rounded-full ring-2", ringClass, i > 0 && "-ml-2.5")}>
          <Avatar person={p} size={size} />
        </span>
      ))}
      {rest > 0 && (
        <span className={cn("-ml-2.5 inline-flex items-center justify-center rounded-full bg-ink-900 text-[11px] font-semibold text-paper-50 ring-2", ringClass)} style={{ width: size, height: size }}>
          +{rest}
        </span>
      )}
    </span>
  );
}
