"use client";

import { useState } from "react";
import Media from "@/components/ui/Media";
import { IMG } from "@/lib/data";
import Toggle from "./Toggle";

/** Watermark + download protection with a live preview (T5). */
export default function PortfolioProtection() {
  const [watermark, setWatermark] = useState(true);
  const [download, setDownload] = useState(true);
  const [highRes, setHighRes] = useState(false);

  return (
    <div className="grid gap-6 md:grid-cols-[260px_minmax(0,1fr)]">
      <figure>
        <Media src={IMG.textile} alt="Preview of Indigo Crossing as other members will see it" ratio="4/5" sizes="(max-width: 768px) 100vw, 260px" className="rounded-[4px]">
          {watermark && (
            <span aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <span className="-rotate-[24deg] select-none whitespace-nowrap text-lg font-semibold tracking-[0.2em] text-white/70 [text-shadow:0_1px_2px_rgb(0_0_0/0.35)]">
                © ADAEZE NWOSU · ARTELIA
              </span>
            </span>
          )}
        </Media>
        <figcaption className="mt-2 text-xs text-grey-700">
          Preview: <em>Indigo Crossing</em> as others see it {watermark ? "(watermarked)" : "(no watermark)"}.
        </figcaption>
      </figure>
      <div className="flex flex-col gap-5">
        <Toggle
          label="Watermark my images"
          description="A light, diagonal mark with your name on every public image. The original file is never altered."
          checked={watermark}
          onChange={setWatermark}
        />
        <Toggle
          label="Download protection"
          description="Disables right-click saving and serves web-sized images only. It deters casual copying — nothing online is perfectly copy-proof."
          checked={download}
          onChange={setDownload}
        />
        <Toggle
          label="Share full-resolution files with verified curators only"
          description="When a curator requests high-res files for a call, you approve each request individually."
          checked={highRes}
          onChange={setHighRes}
        />
        <p aria-live="polite" className="text-sm text-grey-800">
          {watermark && download
            ? "Your portfolio is protected with a watermark and download protection."
            : !watermark && !download
              ? "Your images are shown without protection. You can turn it back on any time."
              : "Partial protection is on."}
        </p>
      </div>
    </div>
  );
}
