import Image from "next/image";
import { PHOTO, type PhotoKey } from "@/lib/data/images";
import { cn } from "@/lib/cn";

/**
 * A stock photo on a warm placeholder. Give it a ratio, or size the parent and
 * let it fill. Always pass `sizes` matching the rendered width.
 */
export default function Photo({
  name,
  ratio,
  sizes = "(max-width: 768px) 100vw, 480px",
  priority = false,
  position = "center",
  className,
  children,
}: {
  name: PhotoKey;
  ratio?: string;
  sizes?: string;
  priority?: boolean;
  position?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  const photo = PHOTO[name];
  return (
    <div className={cn(!className?.includes("absolute") && "relative", "ph-load overflow-hidden bg-paper-200", className)} style={ratio ? { aspectRatio: ratio } : undefined}>
      <Image src={photo.src} alt={photo.alt} fill sizes={sizes} priority={priority} className="object-cover" style={{ objectPosition: position }} />
      {children}
    </div>
  );
}
