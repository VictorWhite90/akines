"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Brush2, Calendar, More, Send2, TickCircle } from "iconsax-reactjs";
import Button from "@/components/ui/Button";

const REPORT_REASONS = ["Harassment", "Exploitation or a suspicious request", "Plagiarism of my work", "Cultural appropriation", "Misrepresentation or impersonation"];

/** Request / invite / book, plus a quiet overflow menu for Report and Block (T7). */
export default function ProfileActions({ personId, firstName, hasStudioVisit }: { personId: string; firstName: string; hasStudioVisit: boolean }) {
  const [requested, setRequested] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [panel, setPanel] = useState<"none" | "report" | "block">("none");
  const [reason, setReason] = useState<string | null>(null);
  const [outcome, setOutcome] = useState<"none" | "reported" | "blocked">("none");
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const first = menuRef.current?.querySelector<HTMLButtonElement>("[role=menuitem]");
    first?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setMenuOpen(false);
        triggerRef.current?.focus();
      }
    }
    function onClick(e: MouseEvent) {
      if (!menuRef.current?.contains(e.target as Node) && !triggerRef.current?.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [menuOpen]);

  function choose(next: "report" | "block") {
    setMenuOpen(false);
    setPanel(next);
    setOutcome("none");
  }

  if (outcome === "blocked") {
    return (
      <div className="rounded-[4px] border border-sand-200 bg-sand-100 p-4 text-sm text-grey-800" role="status">
        <p>
          <span className="font-semibold text-green-950">You&apos;ve blocked {firstName}.</span> They can&apos;t see your profile, request an introduction or join rooms with you.
          They aren&apos;t notified.
        </p>
        <Button variant="ghost" size="sm" className="mt-2" onClick={() => setOutcome("none")}>
          Unblock
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          {requested ? (
            <p className="flex items-center gap-2 rounded-[2px] bg-verified-bg px-3 py-2 text-sm text-verified" role="status">
              <TickCircle size={18} variant="Bulk" color="currentColor" aria-hidden /> Request sent — a private thread opens when {firstName} accepts.
            </p>
          ) : (
            <Button onClick={() => setRequested(true)} icon={<Send2 size={16} color="currentColor" aria-hidden />}>
              Request introduction
            </Button>
          )}
          <Button href={`/studio?invite=${personId}`} variant="outline" icon={<Brush2 size={16} color="currentColor" aria-hidden />}>
            Invite to an idea canvas
          </Button>
          {hasStudioVisit && (
            <Button href="/studio-visits" variant="ghost" icon={<Calendar size={16} color="currentColor" aria-hidden />}>
              Book a studio visit
            </Button>
          )}
        </div>
        <div className="relative">
          <button
            ref={triggerRef}
            type="button"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-label={`More options for ${firstName}`}
            onClick={() => setMenuOpen((o) => !o)}
            className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-[2px] text-green-950 hover:bg-sand-100"
          >
            <More size={20} color="currentColor" aria-hidden />
          </button>
          {menuOpen && (
            <div
              ref={menuRef}
              role="menu"
              aria-label={`Options for ${firstName}`}
              className="absolute right-0 z-20 mt-1 w-48 rounded-[4px] border border-sand-200 bg-white py-1 shadow-lg"
            >
              <button
                type="button"
                role="menuitem"
                onClick={() => choose("report")}
                className="block w-full cursor-pointer px-4 py-2 text-left text-sm text-green-950 hover:bg-sand-100 focus:bg-sand-100"
              >
                Report {firstName}
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => choose("block")}
                className="block w-full cursor-pointer px-4 py-2 text-left text-sm text-alert hover:bg-sand-100 focus:bg-sand-100"
              >
                Block {firstName}
              </button>
            </div>
          )}
        </div>
      </div>

      {panel === "report" && outcome === "none" && (
        <fieldset className="rounded-[4px] border border-sand-200 bg-white p-4">
          <legend className="px-1 text-sm font-semibold text-green-950">What&apos;s happening?</legend>
          <p className="text-xs text-grey-700">Reports go to a human moderator, never to {firstName}. We preserve messages and images as evidence.</p>
          <div className="mt-3 flex flex-col gap-2">
            {REPORT_REASONS.map((r) => (
              <label key={r} className="flex cursor-pointer items-center gap-2 text-sm text-green-950">
                <input type="radio" name="report-reason" checked={reason === r} onChange={() => setReason(r)} className="accent-green-950" />
                {r}
              </label>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button size="sm" disabled={!reason} onClick={() => setOutcome("reported")}>
              Send report
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setPanel("none")}>
              Cancel
            </Button>
          </div>
        </fieldset>
      )}
      {panel === "report" && outcome === "reported" && (
        <p className="rounded-[4px] bg-sand-100 p-4 text-sm text-grey-800" role="status">
          <span className="font-semibold text-green-950">Thank you — report received ({reason}).</span> A moderator will review it within 48 hours against our community standards,
          and you can appeal any decision.{" "}
          <Link href="/trust" className="font-semibold text-green-950 underline underline-offset-4">
            How moderation works
          </Link>
        </p>
      )}
      {panel === "block" && (
        <div className="rounded-[4px] border border-alert/20 bg-alert-bg p-4" role="alertdialog" aria-labelledby="block-q">
          <p id="block-q" className="text-sm font-semibold text-alert">
            Block {firstName}?
          </p>
          <p className="mt-1 text-sm text-grey-800">They won&apos;t be able to see your profile, request introductions or join rooms you&apos;re in. You can unblock later.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                setOutcome("blocked");
                setPanel("none");
              }}
            >
              Block
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setPanel("none")} autoFocus>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
