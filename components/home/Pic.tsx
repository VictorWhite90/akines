import Image from "next/image";
import { PHOTO, type PhotoKey } from "@/lib/data/images";

/** Fills its (relatively positioned) parent with a catalogue photo, or an uploaded one by URL. */
export default function Pic({ name, sizes = "(max-width: 768px) 100vw, 480px", priority = false, position }: { name: PhotoKey; sizes?: string; priority?: boolean; position?: string }) {
  const p = PHOTO[name];
  // A real member's upload arrives as a URL in place of a catalogue name (lib/api/collab.ts).
  if (!p) return <Image src={name} alt="" fill unoptimized sizes={sizes} priority={priority} style={{ objectFit: "cover", objectPosition: position }} />;
  return <Image src={p.src} alt={p.alt} fill sizes={sizes} priority={priority} style={{ objectFit: "cover", objectPosition: position }} />;
}
