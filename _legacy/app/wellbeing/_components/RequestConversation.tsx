"use client";

import { useState } from "react";
import { TickCircle } from "iconsax-reactjs";
import Button from "@/components/ui/Button";

/** Private referral request (W2). Nothing is added to the member's public profile. */
export default function RequestConversation({ name }: { name: string }) {
  const [sent, setSent] = useState(false);
  return (
    <div aria-live="polite" className="mt-auto">
      {sent ? (
        <div className="flex flex-col gap-2">
          <p className="flex items-start gap-2 text-sm text-calm">
            <TickCircle size={18} variant="Bulk" color="currentColor" className="mt-px shrink-0" aria-hidden />
            <span>
              Request sent privately. {name.split(" ").slice(-2).join(" ")} usually replies within two working days, by email only. Nothing appears on your Artelia profile.
            </span>
          </p>
          <button type="button" onClick={() => setSent(false)} className="cursor-pointer self-start text-xs font-semibold text-green-950 underline underline-offset-4">
            Withdraw request
          </button>
        </div>
      ) : (
        <Button variant="outline" size="sm" onClick={() => setSent(true)}>
          Request a first conversation<span className="sr-only"> with {name}</span>
        </Button>
      )}
    </div>
  );
}
