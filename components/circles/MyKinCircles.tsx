"use client";

import Avatar from "@/components/ui/Avatar";
import { allPeople } from "@/lib/data/people";
import { useLocal } from "@/lib/useLocal";
import { CIRCLE_TYPES, type SavedKinCircle } from "./kincircleDraft";
import { Glyph } from "@/components/ui/Icon";

/** The circles a member has created through the wizard. Nothing to show, nothing rendered. */
export default function MyKinCircles() {
  const [saved] = useLocal<SavedKinCircle[]>("ak:kincircles", []);
  if (saved.length === 0) return null;

  return (
    <div id="my-kincircles" className="scroll-mt-24">
      <p className="text-[11px] font-bold tracking-[2px] text-clay-600 uppercase">Your KinCircles</p>
      <h2 className="font-display mt-2 text-[26px] leading-[1.1] font-semibold">Circles you&rsquo;ve started.</h2>
      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {saved.map((c) => {
          const type = CIRCLE_TYPES.find((t) => t.id === c.type);
          const invited = c.invitees.map((id) => allPeople.find((p) => p.id === id)).filter(Boolean);
          return (
            <div key={c.id} className="rounded-2xl border border-line bg-paper-50 p-5">
              <span className="inline-flex items-center gap-2 rounded-full bg-paper-200 px-3 py-1 text-[11px] font-semibold text-ink-950">{type?.glyph && <Glyph g={type.glyph} size={13} />} {type?.label}</span>
              <h3 className="font-display mt-3 text-[18px] font-semibold text-ink-950">{c.name}</h3>
              {c.purpose && <p className="mt-1 text-[13px] leading-relaxed text-mute">{c.purpose}</p>}
              <div className="mt-4 flex items-center justify-between">
                <span className="text-[12px] text-mute">{invited.length > 0 ? `${invited.length} invited` : "No one invited yet"}</span>
                {invited.length > 0 && (
                  <span className="flex -space-x-2">
                    {invited.slice(0, 4).map((p) => p && <Avatar key={p.id} person={p} size={24} className="ring-2 ring-paper-50" />)}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
