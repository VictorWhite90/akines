import Image from "next/image";
import { PHOTO, type PhotoKey } from "@/lib/data/images";

/** Fills its (relatively positioned) parent with a catalogue photo. */
export default function Pic({ name, sizes = "(max-width: 768px) 100vw, 480px", priority = false, position }: { name: PhotoKey; sizes?: string; priority?: boolean; position?: string }) {
  const p = PHOTO[name];
  return <Image src={p.src} alt={p.alt} fill sizes={sizes} priority={priority} style={{ objectFit: "cover", objectPosition: position }} />;
}
