"use client";

import { useState } from "react";
import TrustLabel from "@/components/ui/TrustLabel";
import type { IntroductionReason } from "@/lib/types";

/** AI match reasons for ME — always labelled, always explained, always dismissible (T2, T3). */
export default function MatchReasons({ reasons, callTitle }: { reasons: IntroductionReason[]; callTitle: string }) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) {
    return (
      <p aria-live="polite" className="rounded-[4px] bg-ai-bg px-3 py-2 text-xs text-ai">
        Hidden. We&apos;ll weigh this kind of match less for you.{" "}
        <button type="button" onClick={() => setDismissed(false)} className="cursor-pointer font-semibold underline underline-offset-2">
          Undo
        </button>
      </p>
    );
  }

  return (
    <div className="rounded-[4px] bg-ai-bg/60 p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold text-ai">Why this may suit you</p>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="cursor-pointer text-xs font-semibold text-ai underline underline-offset-2"
          aria-label={`Not a useful match: ${callTitle}`}
        >
          Not useful
        </button>
      </div>
      <ul className="mt-2 flex flex-col gap-1.5">
        {reasons.map((reason) => (
          <li key={reason.text} className="flex items-start gap-2 text-sm text-grey-800">
            <TrustLabel source={reason.source} compact className="mt-0.5 shrink-0" />
            <span>{reason.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
