"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { Calendar, MessageText1, TickCircle, VideoPlay } from "iconsax-reactjs";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import StageTracker from "@/components/ui/StageTracker";
import TrustLabel from "@/components/ui/TrustLabel";
import { cn } from "@/lib/cn";
import type { Application, OpenCall } from "@/lib/types";
import { NEXT_UP, SLOTS, STAGE_LABEL, STAGE_MEANING, STAGE_STEPS } from "../_data";

export default function ApplicationCard({ application, call }: { application: Application; call: OpenCall }) {
  const id = useId();
  const [slot, setSlot] = useState<string | null>(null);
  const [confirmedSlot, setConfirmedSlot] = useState<string | null>(null);
  const [confirmWithdraw, setConfirmWithdraw] = useState(false);
  const [withdrawn, setWithdrawn] = useState(false);
  const [feedbackAsked, setFeedbackAsked] = useState(false);

  const notSelected = application.stage === "not-selected";
  const steps = notSelected
    ? [...STAGE_STEPS.slice(0, 3), { id: "not-selected" as const, label: "Not selected" }]
    : STAGE_STEPS;
  const current = notSelected ? steps.length : STAGE_STEPS.findIndex((s) => s.id === application.stage);
  const active = !notSelected && application.stage !== "selected";
  const chosen = SLOTS.find((s) => s.id === confirmedSlot);

  return (
    <Card as="li" tone={withdrawn ? "sand" : "white"} className="flex flex-col gap-5 p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-playfair text-xl font-semibold text-green-950">
            <Link href={`/opportunities/${call.id}`} className="hover:underline">{call.title}</Link>
          </h3>
          <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-grey-700">
            {call.organisation}
            {call.organiserVerified && <TrustLabel source="verified" compact />}
            <span aria-hidden>·</span> Submitted {application.submitted}
          </p>
          <p className="mt-1 text-sm text-grey-700">Sent: {application.selectedWorks.join(", ")}</p>
        </div>
        <Badge tone={withdrawn ? "neutral" : notSelected ? "neutral" : application.stage === "shortlist" ? "gold" : "green"}>
          {withdrawn ? "Withdrawn" : STAGE_LABEL[application.stage]}
        </Badge>
      </div>

      {!withdrawn && (
        <>
          <StageTracker steps={steps} current={current} label={`Stages for ${call.title}`} />
          <p className="text-sm text-grey-800">{STAGE_MEANING[application.stage]}</p>
        </>
      )}

      {/* Next action — always one clear thing, or an honest "nothing needed". */}
      {!withdrawn && (
        <div className="rounded-[4px] bg-sand-100 p-4">
          <h4 className="text-sm font-semibold text-green-950">{notSelected ? "Feedback from the jury" : "Next"}</h4>

          {application.stage === "shortlist" && !chosen && (
            <fieldset className="mt-3">
              <legend className="text-sm text-grey-800">
                Pick a 30-minute video conversation with the panel by <span className="font-semibold text-green-950">Oct 30</span>. Bring the sketch; they&apos;ll ask about hanging and shipping.
              </legend>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {SLOTS.map((s) => (
                  <label key={s.id} className={cn("flex cursor-pointer items-start gap-3 rounded-[4px] border bg-white p-3 text-sm", slot === s.id ? "border-green-950" : "border-sand-200")}>
                    <input type="radio" name={`${id}-slot`} checked={slot === s.id} onChange={() => setSlot(s.id)} className="mt-1 accent-green-950" />
                    <span>
                      <span className="block font-semibold text-green-950">{s.day} · {s.time}</span>
                      <span className="block text-xs text-grey-700">{s.with}</span>
                    </span>
                  </label>
                ))}
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <Button size="sm" disabled={!slot} onClick={() => setConfirmedSlot(slot)} icon={<Calendar size={16} color="currentColor" aria-hidden />}>
                  Confirm slot
                </Button>
                <p className="text-xs text-grey-700">None work? <a href={`mailto:calls@artelia.africa?subject=${encodeURIComponent(call.title)}`} className="font-semibold text-green-950 underline underline-offset-2">Ask for another time</a></p>
              </div>
            </fieldset>
          )}

          {application.stage === "shortlist" && chosen && (
            <div aria-live="polite" className="mt-3 flex flex-col gap-3">
              <p className="flex items-start gap-2 text-sm text-verified">
                <TickCircle size={18} variant="Bold" color="currentColor" className="mt-0.5 shrink-0" aria-hidden />
                <span>
                  <span className="font-semibold">Confirmed: {chosen.day} at {chosen.time}</span> with {chosen.with}. The video link appears here 15 minutes before. Final selection is on Nov 14.
                </span>
              </p>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" disabled icon={<VideoPlay size={16} color="currentColor" aria-hidden />}>Join (opens on the day)</Button>
                <Button size="sm" variant="ghost" onClick={() => { setSlot(confirmedSlot); setConfirmedSlot(null); }}>Change slot</Button>
              </div>
            </div>
          )}

          {application.stage === "review" && (
            <p className="mt-2 text-sm text-grey-800">{NEXT_UP[call.id] ?? "Nothing needed from you. We'll tell you as soon as the panel moves."}</p>
          )}

          {notSelected && (
            <div className="mt-2 flex flex-col gap-3">
              <blockquote className="border-l-2 border-gold-400 pl-3 text-sm italic text-grey-800">“{application.feedback}”</blockquote>
              <p className="text-xs text-grey-700">Written by the {call.organisation} jury · {application.history.at(-1)?.date}</p>
              <div className="flex flex-wrap gap-2">
                <Button href="/opportunities" size="sm" variant="outline">See calls open now</Button>
                <Button href="/circles/textiles" size="sm" variant="ghost">Get portfolio feedback in Textiles Circle</Button>
                {feedbackAsked ? (
                  <p aria-live="polite" className="self-center text-xs font-semibold text-verified">Question sent. The jury replies within 10 days.</p>
                ) : (
                  <Button size="sm" variant="ghost" icon={<MessageText1 size={16} color="currentColor" aria-hidden />} onClick={() => setFeedbackAsked(true)}>Ask a follow-up question</Button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      <details className="group" open>
        <summary className="cursor-pointer text-sm font-semibold text-green-950">History ({application.history.length} updates)</summary>
        <ol className="mt-3 flex flex-col gap-3 border-l-2 border-sand-300 pl-4">
          {application.history.map((h) => (
            <li key={h.stage} className="text-sm">
              <p><span className="font-semibold text-green-950">{STAGE_LABEL[h.stage]}</span> <span className="text-grey-700">· {h.date}</span></p>
              {h.note && <p className="text-grey-800">{h.note}</p>}
            </li>
          ))}
          {chosen && <li className="text-sm"><p><span className="font-semibold text-green-950">Conversation booked</span> <span className="text-grey-700">· today</span></p></li>}
          {withdrawn && <li className="text-sm"><p><span className="font-semibold text-green-950">Withdrawn by you</span> <span className="text-grey-700">· today</span></p></li>}
        </ol>
      </details>

      {active && (
        <div className="border-t border-sand-200 pt-4" aria-live="polite">
          {withdrawn ? (
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-sm text-grey-800">You withdrew. {call.organisation} has been told and your works are removed from their review. You can undo this until the next stage date.</p>
              <Button size="sm" variant="ghost" onClick={() => setWithdrawn(false)}>Undo withdrawal</Button>
            </div>
          ) : confirmWithdraw ? (
            <div className="flex flex-col gap-3 rounded-[4px] border border-alert/20 bg-alert-bg p-4">
              <p className="text-sm text-grey-800">
                <span className="font-semibold text-alert">Withdraw from {call.title}?</span> The organiser is told, your works are removed from review, and your place goes to someone else.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="danger" onClick={() => { setWithdrawn(true); setConfirmWithdraw(false); }}>Yes, withdraw</Button>
                <Button size="sm" variant="ghost" onClick={() => setConfirmWithdraw(false)}>Keep my application</Button>
              </div>
            </div>
          ) : (
            <Button size="sm" variant="ghost" onClick={() => setConfirmWithdraw(true)}>Withdraw application</Button>
          )}
        </div>
      )}
    </Card>
  );
}
