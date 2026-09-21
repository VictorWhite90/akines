"use client";

import { useState } from "react";
import { Heart, Trash } from "iconsax-reactjs";
import Button from "@/components/ui/Button";
import Notice from "@/components/ui/Notice";
import SafetyPanel from "./SafetyPanel";
import { useWellbeing } from "./WellbeingContext";

/** Always-visible way to reach the safety panel (W4). */
export function NeedToTalkButton({ className }: { className?: string }) {
  const { openSafety } = useWellbeing();
  return (
    <Button variant="outline" onClick={openSafety} className={className} icon={<Heart size={18} variant="Bulk" color="currentColor" aria-hidden />}>
      Need to talk to someone now?
    </Button>
  );
}

/** The panel opened by "Need to talk to someone now?". */
export function GlobalSafetyPanel() {
  const { safetyOpen, closeSafety } = useWellbeing();
  if (!safetyOpen) return null;
  return <SafetyPanel id="safety-panel" headingLevel={2} triggered={false} onClose={closeSafety} closeLabel="Close this panel" className="mt-6 border-2" />;
}

/** "Private by default" promise with a real delete action (W3, T4). */
export function PrivacyNotice() {
  const { deleteAll, hasHistory } = useWellbeing();
  const [confirming, setConfirming] = useState(false);
  const [message, setMessage] = useState("");

  return (
    <Notice tone="private" title="Private by default" className="mt-8">
      <ul className="flex list-disc flex-col gap-1 pl-4">
        <li>Only you can see anything on this page. Not curators, not collectors, not Artelia staff.</li>
        <li>It is never used for matching, ranking, opportunity access or advertising — and never sold.</li>
        <li>The AI Companion can offer gentle reflections, but it does not diagnose and is not a therapist.</li>
        <li>Delete everything here at any time. Deletion is permanent and immediate.</li>
      </ul>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        {!confirming ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setConfirming(true);
              setMessage("");
            }}
            disabled={!hasHistory && message !== ""}
            icon={<Trash size={16} color="currentColor" aria-hidden />}
            className="border border-calm/40"
          >
            Delete my wellbeing data
          </Button>
        ) : (
          <div className="flex flex-col gap-3 rounded-[4px] bg-white p-3 sm:flex-row sm:items-center">
            <p className="text-sm text-green-950">Delete your mood canvas, check-ins, reflections and notes? This can&apos;t be undone.</p>
            <div className="flex gap-2">
              <Button
                variant="danger"
                size="sm"
                onClick={() => {
                  deleteAll();
                  setConfirming(false);
                  setMessage("Deleted. Your wellbeing space is empty — nothing was kept, and you can start fresh whenever you like.");
                }}
              >
                Delete everything
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setConfirming(false)}>
                Keep it
              </Button>
            </div>
          </div>
        )}
        <p aria-live="polite" className="text-sm font-semibold text-calm">
          {message}
        </p>
      </div>
    </Notice>
  );
}
