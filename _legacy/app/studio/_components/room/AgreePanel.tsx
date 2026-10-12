import Link from "next/link";
import { useState } from "react";
import { Clock, DocumentText, TickCircle } from "iconsax-reactjs";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Notice from "@/components/ui/Notice";
import { ME_ID, getPerson } from "@/lib/data";
import type { Project } from "@/lib/types";
import { PanelHeading, SplitBar, Term } from "./shared";

export type Signature = Project["charter"]["signed"][number];

export default function AgreePanel({
  project,
  signed,
  canAct,
  onSign,
}: {
  project: Project;
  signed: Signature[];
  canAct: boolean;
  onSign: () => void;
}) {
  const [readIt, setReadIt] = useState(false);
  const c = project.charter;
  const mySignature = signed.find((s) => s.personId === ME_ID);
  const signedCount = signed.filter((s) => s.date).length;
  const templateName =
    project.kind === "institutional-commission" ? "Commission template" : c.revenueShare.length === 2 && c.revenueShare.every((s) => s.share === 50) ? "Two-artist co-creation (50:50)" : "Multi-role collaboration";

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PanelHeading description="Agreed before production, in plain language. Every member can see and propose changes to every line.">
          Collaboration charter
        </PanelHeading>
        <Badge icon={<DocumentText size={12} color="currentColor" aria-hidden />}>Template: {templateName} · editable</Badge>
      </div>

      <section aria-label="Roles and contributions" className="flex flex-col gap-3">
        <p className="text-sm font-semibold text-green-950">Roles & contributions</p>
        {c.roles.length ? (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {c.roles.map((r) => {
              const person = getPerson(r.personId);
              return (
                <Card as="li" key={r.personId} className="flex items-start gap-3 p-4">
                  <Avatar name={person.name} size="md" verified={person.verified} />
                  <div className="min-w-0 text-sm">
                    <Link href={`/people/${person.id}`} className="font-semibold text-green-950 hover:underline">{person.name}</Link>
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-ruby-600">{r.role}</p>
                    <p className="mt-1 text-grey-800">{r.contribution}</p>
                  </div>
                </Card>
              );
            })}
          </ul>
        ) : (
          <p className="text-sm italic text-grey-600">Roles haven&apos;t been written down yet.</p>
        )}
      </section>

      <Card className="px-5 py-2">
        <dl>
          <Term label="What each of you brings (background IP)">{c.backgroundIp}</Term>
          <Term label="What you make together (new IP)">{c.newIp}</Term>
          <Term label="How you're credited">{c.credit}</Term>
          <Term label="Who decides what">{c.decisionRights}</Term>
          <Term label="Expenses">{c.expenses}</Term>
          <Term label="Where the work may be used">
            {c.permittedUses.length ? (
              <span className="flex flex-wrap gap-2">
                {c.permittedUses.map((u) => (
                  <Badge key={u} tone="green">{u}</Badge>
                ))}
              </span>
            ) : undefined}
          </Term>
          <Term label="If someone leaves">{c.exit}</Term>
        </dl>
      </Card>

      <section aria-label="Revenue share" className="flex flex-col gap-3">
        <p className="text-sm font-semibold text-green-950">Revenue share, after expenses are reimbursed</p>
        <SplitBar shares={c.revenueShare} label="Revenue share" />
      </section>

      <section aria-label="Signatures" className="flex flex-col gap-3">
        <p className="text-sm font-semibold text-green-950">
          Signatures · {signedCount} of {signed.length || project.memberIds.length} signed
        </p>
        {signed.length ? (
          <ul className="flex flex-col divide-y divide-sand-200 rounded-[4px] border border-sand-200 bg-white">
            {signed.map((s) => {
              const person = getPerson(s.personId);
              return (
                <li key={s.personId} className="flex flex-wrap items-center gap-3 p-4">
                  <Avatar name={person.name} size="sm" />
                  <span className="min-w-0 flex-1 text-sm font-semibold text-green-950">{s.personId === ME_ID ? `${person.name} (you)` : person.name}</span>
                  {s.date ? (
                    <Badge tone="green" icon={<TickCircle size={12} color="currentColor" aria-hidden />}>Signed {s.date}</Badge>
                  ) : (
                    <Badge tone="gold" icon={<Clock size={12} color="currentColor" aria-hidden />}>Not signed yet</Badge>
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-sm italic text-grey-600">This project was recorded without individual signatures.</p>
        )}

        {canAct && mySignature && !mySignature.date && (
          <Card tone="sand" className="flex flex-col gap-3 p-5">
            <p className="font-semibold text-green-950">Your signature</p>
            <label className="flex items-start gap-3 text-sm text-grey-800">
              <input type="checkbox" checked={readIt} onChange={(e) => setReadIt(e.target.checked)} className="mt-1 h-4 w-4 accent-green-950" />
              I&apos;ve read every line of this charter, and I understand what I keep, what we share and how I can leave.
            </label>
            <Button className="self-start" disabled={!readIt} onClick={onSign}>
              Sign the charter
            </Button>
          </Card>
        )}
      </section>

      <Notice tone="info" title="A template, not legal advice">
        Charters start from plain-language templates that you can change line by line. For complex or high-value projects — large commissions, licensing, work across several countries — we recommend each member takes independent professional advice before signing.
      </Notice>
    </div>
  );
}
