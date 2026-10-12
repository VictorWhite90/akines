"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { TickCircle } from "iconsax-reactjs";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import TrustLabel from "@/components/ui/TrustLabel";
import type { Person } from "@/lib/types";

const RHYTHMS = ["One conversation", "Monthly call", "Through one project"];

export default function MentorshipRequest({ suggested, why }: { suggested?: Person; why: string }) {
  const [area, setArea] = useState("");
  const [rhythm, setRhythm] = useState(RHYTHMS[1]);
  const [dismissed, setDismissed] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!area.trim()) return setError("Say what you'd like to grow in — one line is enough.");
    setError("");
    setSent(true);
  }

  const to = suggested && !dismissed ? suggested.name : "the circle's moderators";

  return (
    <Card className="flex flex-col gap-4 p-5">
      <p className="sr-only" aria-live="polite">{sent ? `Mentorship request sent to ${to}.` : ""}</p>

      {suggested && !dismissed && !sent && (
        <div className="flex flex-col gap-2 rounded-[4px] bg-ai-bg/60 p-3">
          <div className="flex flex-wrap items-center gap-2">
            <TrustLabel source="ai" />
            <span className="text-xs text-grey-700">Suggested mentor</span>
          </div>
          <div className="flex items-center gap-2">
            <Avatar name={suggested.name} size="sm" verified={suggested.verified} />
            <Link href={`/people/${suggested.id}`} className="text-sm font-semibold text-green-950 hover:underline">{suggested.name}</Link>
            <span className="text-xs text-grey-700">{suggested.title}</span>
          </div>
          <p className="text-xs text-grey-800"><span className="font-semibold">Why:</span> {why}</p>
          <button type="button" onClick={() => setDismissed(true)} className="cursor-pointer self-start text-xs font-semibold text-green-950 underline underline-offset-4">
            Not right for me — let moderators choose
          </button>
        </div>
      )}

      {sent ? (
        <div className="flex flex-col gap-2">
          <p className="flex items-center gap-2 font-semibold text-green-950">
            <TickCircle size={20} variant="Bulk" color="var(--color-verified)" aria-hidden /> Request sent to {to}
          </p>
          <p className="text-sm text-grey-700">{rhythm}, on “{area}”. Mentors reply within a week or say no kindly — you&apos;ll never be left hanging.</p>
          <Button size="sm" variant="ghost" className="self-start" onClick={() => setSent(false)}>Change request</Button>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="flex flex-col gap-3" noValidate>
          <label htmlFor="mentor-area" className="text-sm font-semibold text-green-950">What would you like to grow in?</label>
          <input
            id="mentor-area"
            value={area}
            onChange={(e) => setArea(e.target.value)}
            placeholder="e.g. Working at large scale alone"
            className="w-full rounded-[2px] border border-sand-300 bg-white px-3 py-2.5 text-sm text-green-950 placeholder:text-grey-700"
          />
          <label htmlFor="mentor-rhythm" className="text-sm font-semibold text-green-950">How often?</label>
          <select id="mentor-rhythm" value={rhythm} onChange={(e) => setRhythm(e.target.value)} className="w-full rounded-[2px] border border-sand-300 bg-white px-3 py-2.5 text-sm text-green-950">
            {RHYTHMS.map((r) => <option key={r}>{r}</option>)}
          </select>
          {error && <p role="alert" className="text-sm font-semibold text-alert">{error}</p>}
          <Button type="submit" size="sm" variant="outline" className="self-start">Ask for a mentor</Button>
        </form>
      )}
    </Card>
  );
}
