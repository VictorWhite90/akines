import Image from "next/image";
import { cn } from "@/lib/cn";

/**
 * Fixed-ratio image with a warm placeholder behind it. Always pass `sizes`
 * that match the rendered width — the default assumes a card in a grid.
 */
export default function Media({
  src,
  alt,
  ratio = "4/3",
  sizes = "(max-width: 768px) 100vw, 400px",
  priority = false,
  className,
  children,
}: {
  src: string;
  alt: string;
  ratio?: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={cn("relative w-full overflow-hidden bg-sand-200", className)} style={{ aspectRatio: ratio }}>
      <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="object-cover" />
      {children}
    </div>
  );
}
