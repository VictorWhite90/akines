"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { Clock, CloseCircle, Send2, TickCircle } from "iconsax-reactjs";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import TrustLabel from "@/components/ui/TrustLabel";
import type { Introduction, Person } from "@/lib/types";

const KIND_LABEL: Record<Introduction["kind"], string> = {
  collaborator: "Possible collaborator",
  collector: "Collector",
  curator: "Curator",
  peer: "Peer",
  mentor: "Someone you could mentor",
};

const DECLINE_REASONS = [
  { id: "discipline", label: "Wrong discipline", adjust: "fewer introductions outside your declared practices" },
  { id: "theme", label: "Theme doesn't interest me", adjust: "less weight on the themes this match was built on" },
  { id: "distance", label: "Too far", adjust: "a stronger preference for people nearer you or in your time zone" },
  { id: "ready", label: "Not ready", adjust: "fewer introductions of this kind until you say otherwise" },
];

type Status = "open" | "sent" | "later" | "declining" | "declined";

export default function IntroductionCard({ intro, person, hidden = false }: { intro: Introduction; person: Person; hidden?: boolean }) {
  const uid = useId();
  const [status, setStatus] = useState<Status>("open");
  const [opener, setOpener] = useState(intro.suggestedOpener);
  const [reason, setReason] = useState<string | null>(null);
  const firstName = person.name.split(" ")[0];
  const chosen = DECLINE_REASONS.find((r) => r.id === reason);

  if (hidden) return <li hidden />;

  if (status === "later" || status === "declined") {
    return (
      <Card as="li" tone="sand" className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3" aria-live="polite">
          <Avatar name={person.name} size="sm" />
          <p className="text-sm text-grey-800">
            {status === "later" ? (
              <>
                <span className="font-semibold text-green-950">Saved for later.</span> We won&apos;t mention {firstName} again this week, and {firstName} won&apos;t be told.
              </>
            ) : (
              <>
                <span className="font-semibold text-green-950">Thanks — noted: “{chosen?.label}”.</span> Future matching adjusts: {chosen?.adjust}. {firstName} is never told why.
              </>
            )}
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setStatus("open")}>
          Undo
        </Button>
      </Card>
    );
  }

  return (
    <Card as="li" className="flex flex-col gap-5 p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar name={person.name} size="lg" verified={person.verified} />
          <div className="min-w-0">
            <h3 className="font-semibold text-green-950">
              <Link href={`/people/${person.id}`} className="hover:underline">
                {person.name}
              </Link>
            </h3>
            <p className="text-sm text-grey-700">
              {person.title} · {person.city}, {person.country}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge tone="neutral">{KIND_LABEL[intro.kind]}</Badge>
          {intro.complementarity === "similar" ? <Badge tone="green">Similar practice</Badge> : <Badge tone="gold">Productive difference</Badge>}
        </div>
      </div>

      <p className="font-playfair text-xl leading-snug text-green-950">{intro.headline}</p>

      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-grey-700">Why we&apos;re introducing you</p>
        <ul className="mt-2 flex flex-col gap-2">
          {intro.reasons.map((r) => (
            <li key={r.text} className="flex items-start gap-2 text-sm text-grey-800">
              <TrustLabel source={r.source} compact className="mt-0.5 shrink-0" />
              <span>{r.text}</span>
            </li>
          ))}
        </ul>
      </div>

      <dl className="grid grid-cols-2 gap-3 rounded-[4px] bg-sand-100 p-4 text-sm lg:grid-cols-4">
        {(
          [
            ["Availability", intro.fit.availability],
            ["Geography", intro.fit.geography],
            ["Language", intro.fit.language],
            ["Readiness", intro.fit.readiness],
          ] as const
        ).map(([k, v]) => (
          <div key={k} className="min-w-0">
            <dt className="text-xs text-grey-700">{k}</dt>
            <dd className="mt-0.5 font-semibold text-green-950">{v}</dd>
          </div>
        ))}
      </dl>

      {status === "sent" ? (
        <div className="flex flex-col gap-3 rounded-[4px] border border-verified/20 bg-verified-bg p-4 sm:flex-row sm:items-center sm:justify-between" aria-live="polite">
          <div className="flex items-start gap-2 text-sm text-grey-800">
            <TickCircle size={20} variant="Bulk" color="var(--color-verified)" className="shrink-0" aria-hidden />
            <p>
              <span className="font-semibold text-verified">Request sent to {firstName}.</span> They&apos;ll see your opener and the reasons above. A private thread opens when they
              accept — nothing is public.
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setStatus("open")}>
            Withdraw
          </Button>
        </div>
      ) : (
        <>
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label htmlFor={`${uid}-opener`} className="text-sm font-semibold text-green-950">
                Your opening line
              </label>
              <span className="flex items-center gap-2 text-xs text-grey-700">
                <TrustLabel source="ai" compact /> Drafted from your shared themes — make it yours
              </span>
            </div>
            <textarea
              id={`${uid}-opener`}
              value={opener}
              onChange={(e) => setOpener(e.target.value)}
              rows={3}
              className="mt-2 w-full rounded-[4px] border border-sand-300 bg-white p-3 text-sm text-green-950"
            />
          </div>

          {status === "declining" ? (
            <fieldset className="rounded-[4px] border border-sand-200 p-4">
              <legend className="px-1 text-sm font-semibold text-green-950">What made this a poor match?</legend>
              <p className="text-xs text-grey-700">Only used to improve your future introductions. {firstName} is never told.</p>
              <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                {DECLINE_REASONS.map((r) => (
                  <label
                    key={r.id}
                    className="flex cursor-pointer items-center gap-2 rounded-full border border-sand-300 px-3 py-2 text-sm text-green-950 has-[:checked]:border-green-950 has-[:checked]:bg-green-50"
                  >
                    <input type="radio" name={`${uid}-reason`} value={r.id} checked={reason === r.id} onChange={() => setReason(r.id)} className="accent-green-950" />
                    {r.label}
                  </label>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button size="sm" disabled={!reason} onClick={() => setStatus("declined")}>
                  Tell Artelia
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setStatus("open")}>
                  Cancel
                </Button>
              </div>
            </fieldset>
          ) : (
            <div className="flex flex-wrap gap-2">
              <Button size="sm" disabled={!opener.trim()} onClick={() => setStatus("sent")} icon={<Send2 size={16} color="currentColor" aria-hidden />}>
                Request introduction
              </Button>
              <Button size="sm" variant="outline" onClick={() => setStatus("later")} icon={<Clock size={16} color="currentColor" aria-hidden />}>
                Not now
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setStatus("declining")} icon={<CloseCircle size={16} color="currentColor" aria-hidden />}>
                Not a good match
              </Button>
            </div>
          )}
        </>
      )}
    </Card>
  );
}
