"use client";

import { useId, useState, type FormEvent } from "react";
import { DocumentDownload, TickCircle } from "iconsax-reactjs";
import Button from "@/components/ui/Button";

const inputCls = "mt-2 w-full rounded-[2px] border border-sand-300 bg-white px-3 text-sm text-green-950 placeholder:text-grey-600";

function Confirmation({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[4px] border border-verified/20 bg-verified-bg p-4">
      <p className="flex items-center gap-2 font-semibold text-verified">
        <TickCircle size={18} variant="Bold" color="currentColor" aria-hidden /> {title}
      </p>
      <div className="mt-1 text-sm leading-relaxed text-grey-800">{children}</div>
    </div>
  );
}

/** Evidence pack download (T5), simulated. */
export function EvidencePackButton() {
  const [done, setDone] = useState(false);
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button variant="outline" size="sm" onClick={() => setDone(true)} icon={<DocumentDownload size={16} color="currentColor" aria-hidden />}>
        Download evidence pack
      </Button>
      <p aria-live="polite" className="text-sm text-verified">
        {done ? "Prepared: a signed PDF of your timestamps and fingerprints, ready to share with a lawyer or platform." : ""}
      </p>
    </div>
  );
}

/** Report a scam, impersonation or suspicious request (T6). */
export function ReportForm() {
  const [kind, setKind] = useState("open-call");
  const [where, setWhere] = useState("");
  const [details, setDetails] = useState("");
  const [sent, setSent] = useState<string | null>(null);
  const id = useId();

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!details.trim()) return;
    setSent(`TS-${2400 + details.length}`);
  }

  if (sent)
    return (
      <div aria-live="polite">
        <Confirmation title={`Report received · reference ${sent}`}>
          A trust & safety reviewer will look at this within 24 hours. If it&apos;s an open call, it&apos;s hidden from new applicants while we check. Don&apos;t send any
          money or files in the meantime.
          <button
            type="button"
            onClick={() => {
              setSent(null);
              setDetails("");
              setWhere("");
            }}
            className="mt-2 block cursor-pointer font-semibold text-green-950 underline underline-offset-4"
          >
            Report something else
          </button>
        </Confirmation>
      </div>
    );

  return (
    <form onSubmit={submit} className="flex flex-col gap-4" aria-live="polite">
      <div>
        <label htmlFor={`${id}-kind`} className="text-sm font-semibold text-green-950">
          What are you reporting?
        </label>
        <select id={`${id}-kind`} value={kind} onChange={(e) => setKind(e.target.value)} className={`${inputCls} h-11`}>
          <option value="open-call">A suspicious open call</option>
          <option value="payment">A payment request</option>
          <option value="impersonation">Someone impersonating an artist, curator or institution</option>
          <option value="unsolicited">An unsolicited &quot;opportunity&quot; in my messages</option>
          <option value="plagiarism">My work used without permission</option>
        </select>
      </div>
      <div>
        <label htmlFor={`${id}-where`} className="text-sm font-semibold text-green-950">
          Link, name or profile <span className="font-normal text-grey-700">(optional)</span>
        </label>
        <input id={`${id}-where`} value={where} onChange={(e) => setWhere(e.target.value)} placeholder="e.g. Global Emerging Art Prize 2026" className={`${inputCls} h-11`} />
      </div>
      <div>
        <label htmlFor={`${id}-details`} className="text-sm font-semibold text-green-950">
          What happened?
        </label>
        <textarea
          id={`${id}-details`}
          required
          rows={3}
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          placeholder="They asked for a US$50 entry fee by mobile money before any selection…"
          className={`${inputCls} py-3`}
        />
      </div>
      <p className="text-xs text-grey-700">Your report is confidential. The person you report is never told who reported them.</p>
      <Button type="submit" className="self-start" disabled={!details.trim()}>
        Send report
      </Button>
    </form>
  );
}

/** Open an appeal against a consequential decision (T8). */
export function AppealForm() {
  const [decision, setDecision] = useState("removed-call");
  const [reason, setReason] = useState("");
  const [context, setContext] = useState("");
  const [sent, setSent] = useState(false);
  const id = useId();

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!reason.trim()) return;
    setSent(true);
  }

  if (sent)
    return (
      <div aria-live="polite">
        <Confirmation title="Appeal opened · case AP-0192">
          A senior reviewer who was not involved in the original decision will read it, with a regional advisor where cultural context matters. You&apos;ll hear
          back within 7 days, with reasons in plain language.
          <button type="button" onClick={() => { setSent(false); setReason(""); setContext(""); }} className="mt-2 block cursor-pointer font-semibold text-green-950 underline underline-offset-4">
            Withdraw appeal
          </button>
        </Confirmation>
      </div>
    );

  return (
    <form onSubmit={submit} className="flex flex-col gap-4" aria-live="polite">
      <div>
        <label htmlFor={`${id}-decision`} className="text-sm font-semibold text-green-950">
          Which decision?
        </label>
        <select id={`${id}-decision`} value={decision} onChange={(e) => setDecision(e.target.value)} className={`${inputCls} h-11`}>
          <option value="removed-call">A post, journal entry or call was removed</option>
          <option value="restricted">My account or messaging was restricted</option>
          <option value="verification">My verification was declined</option>
          <option value="circle">I was removed from a circle or room</option>
          <option value="report">A report I made was closed without action</option>
        </select>
      </div>
      <div>
        <label htmlFor={`${id}-reason`} className="text-sm font-semibold text-green-950">
          Why do you think it was wrong?
        </label>
        <textarea id={`${id}-reason`} required rows={3} value={reason} onChange={(e) => setReason(e.target.value)} className={`${inputCls} py-3`} />
      </div>
      <div>
        <label htmlFor={`${id}-context`} className="text-sm font-semibold text-green-950">
          Context a reviewer should know <span className="font-normal text-grey-700">(optional)</span>
        </label>
        <textarea
          id={`${id}-context`}
          rows={2}
          value={context}
          onChange={(e) => setContext(e.target.value)}
          placeholder="e.g. the motif is from my own family's adire tradition"
          className={`${inputCls} py-3`}
        />
      </div>
      <Button type="submit" className="self-start" disabled={!reason.trim()}>
        Open an appeal
      </Button>
    </form>
  );
}
