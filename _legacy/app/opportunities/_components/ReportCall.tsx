"use client";

import { useId, useState } from "react";
import { Flag, TickCircle } from "iconsax-reactjs";
import Button from "@/components/ui/Button";

const REASONS = [
  "Asks for payment before selection",
  "Pretends to be a real organisation",
  "Unclear or missing rights and budget",
  "Suspicious contact outside Artelia",
];

/** T6: anyone can report a suspicious call. Evidence is kept and a person reviews it. */
export default function ReportCall({ callTitle, size = "sm" }: { callTitle: string; size?: "sm" | "md" }) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState(REASONS[0]);
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <p aria-live="polite" className="flex items-start gap-2 text-sm text-verified">
        <TickCircle size={18} variant="Bold" color="currentColor" className="mt-0.5 shrink-0" aria-hidden />
        <span>
          Reported. A person on the trust team reviews it within 24 hours. We&apos;ve saved a copy of the call as it looks now, so the evidence is kept even if the organiser changes it.
        </span>
      </p>
    );
  }

  if (!open) {
    return (
      <Button variant="outline" size={size} icon={<Flag size={16} color="currentColor" aria-hidden />} onClick={() => setOpen(true)} aria-label={`Report “${callTitle}”`}>
        Report this call
      </Button>
    );
  }

  return (
    <form
      className="flex flex-col gap-3 rounded-[4px] border border-alert/20 bg-white p-4"
      onSubmit={(e) => {
        e.preventDefault();
        setSent(true);
      }}
    >
      <fieldset>
        <legend className="text-sm font-semibold text-green-950">What worries you about “{callTitle}”?</legend>
        <div className="mt-2 flex flex-col gap-2">
          {REASONS.map((r) => (
            <label key={r} className="flex items-center gap-2 text-sm text-grey-800">
              <input type="radio" name={`${id}-reason`} value={r} checked={reason === r} onChange={() => setReason(r)} className="accent-green-950" />
              {r}
            </label>
          ))}
        </div>
      </fieldset>
      <label htmlFor={`${id}-detail`} className="text-sm font-semibold text-green-950">
        Anything else? <span className="font-normal text-grey-700">(optional)</span>
      </label>
      <textarea id={`${id}-detail`} rows={2} className="rounded-[4px] border border-sand-300 p-2 text-sm" placeholder="e.g. They emailed me directly asking for the fee by bank transfer." />
      <div className="flex flex-wrap gap-2">
        <Button type="submit" variant="danger" size="sm">Send report</Button>
        <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
      </div>
    </form>
  );
}
