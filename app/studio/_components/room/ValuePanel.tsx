import Avatar from "@/components/ui/Avatar";
import Badge, { type BadgeTone } from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import Notice from "@/components/ui/Notice";
import { ME_ID, getPerson } from "@/lib/data";
import type { Project } from "@/lib/types";
import { FACILITATION_FEE_RATE, money } from "../../_data";
import { PanelHeading, Quiet, SplitBar } from "./shared";

const PAYMENT_TONE: Record<Project["payments"][number]["status"], { tone: BadgeTone; label: string; note: string }> = {
  paid: { tone: "green", label: "Paid", note: "Released and received" },
  scheduled: { tone: "calm", label: "Scheduled", note: "Held in escrow, released on approved milestones" },
  pending: { tone: "gold", label: "Pending", note: "Waiting on an approval or a sale" },
};

export default function ValuePanel({ project }: { project: Project }) {
  const cur = project.currency;
  const shares = project.charter.revenueShare;
  const budgetTotal = project.budget.reduce((s, b) => s + b.amount, 0);
  const payTotal = project.payments.reduce((s, p) => s + p.amount, 0);
  const fee = Math.round(payTotal * FACILITATION_FEE_RATE);

  // Expense logic: each member should carry expenses in proportion to their share.
  const balances = shares
    .map((s) => {
      const paid = project.budget.filter((b) => b.paidBy === s.personId).reduce((sum, b) => sum + b.amount, 0);
      return { personId: s.personId, paid, fair: Math.round((budgetTotal * s.share) / 100) };
    })
    .map((b) => ({ ...b, balance: b.paid - b.fair }));
  const owed = balances.filter((b) => b.balance > 0);

  return (
    <div className="flex flex-col gap-10">
      <section aria-label="Split instructions" className="flex flex-col gap-3">
        <PanelHeading description="Taken straight from the signed charter. Nobody can change it without everyone agreeing.">Split instructions</PanelHeading>
        <Card className="flex flex-col gap-4 p-5">
          <SplitBar shares={shares} label="Net revenue split" />
          <ol className="flex list-decimal flex-col gap-1.5 pl-5 text-sm text-grey-800">
            <li>Money from a sale, commission or licence arrives in the project&apos;s escrow account.</li>
            <li>Shared expenses are reimbursed to whoever paid them.</li>
            <li>What remains is split {shares.map((s) => `${s.share}% to ${getPerson(s.personId).name.split(" ")[0]}`).join(", ") || "as the charter says"}.</li>
          </ol>
          {project.charter.expenses && <p className="text-sm text-grey-700">Expense rule: {project.charter.expenses}</p>}
        </Card>
      </section>

      <section aria-label="Budget and expenses" className="flex flex-col gap-3">
        <PanelHeading description="Every shared cost, and who put the money in.">Budget & expenses</PanelHeading>
        {project.budget.length ? (
          <>
            <div className="overflow-x-auto rounded-[4px] border border-sand-200 bg-white">
              <table className="w-full min-w-[420px] text-left text-sm">
                <caption className="sr-only">Project expenses and who paid</caption>
                <thead className="bg-sand-100 text-xs uppercase tracking-[0.08em] text-grey-700">
                  <tr>
                    <th scope="col" className="px-4 py-3 font-semibold">Item</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Paid by</th>
                    <th scope="col" className="px-4 py-3 text-right font-semibold">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sand-200">
                  {project.budget.map((b) => (
                    <tr key={b.label}>
                      <td className="px-4 py-3 text-green-950">{b.label}</td>
                      <td className="px-4 py-3 text-grey-800">{b.paidBy === ME_ID ? "You" : getPerson(b.paidBy).name}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-green-950">{money(b.amount, cur)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="border-t border-sand-300">
                  <tr>
                    <th scope="row" colSpan={2} className="px-4 py-3 font-semibold text-green-950">Total shared expenses</th>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums text-green-950">{money(budgetTotal, cur)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
            {owed.length > 0 && (
              <p className="text-sm text-grey-800">
                {owed.map((b) => `${b.personId === ME_ID ? "You are" : `${getPerson(b.personId).name.split(" ")[0]} is`} reimbursed ${money(b.balance, cur)}`).join("; ")} before revenue is split — they paid more than their share of expenses.
              </p>
            )}
          </>
        ) : (
          <Quiet>
            {project.kind === "institutional-commission" ? "Production costs were covered directly by the commissioner, so no shared expenses were logged." : "No shared expenses logged."}
          </Quiet>
        )}
      </section>

      <section aria-label="Payments" className="flex flex-col gap-3">
        <PanelHeading description="Where each member's money is, right now.">Payment status</PanelHeading>
        {project.payments.length ? (
          <ul className="flex flex-col divide-y divide-sand-200 rounded-[4px] border border-sand-200 bg-white">
            {project.payments.map((p) => {
              const person = getPerson(p.personId);
              const t = PAYMENT_TONE[p.status];
              return (
                <li key={p.personId} className="flex flex-wrap items-center gap-3 p-4">
                  <Avatar name={person.name} size="sm" />
                  <div className="min-w-0 flex-1 text-sm">
                    <p className="font-semibold text-green-950">{p.personId === ME_ID ? `${person.name} (you)` : person.name}</p>
                    <p className="text-xs text-grey-700">{t.note}</p>
                  </div>
                  <span className="text-sm font-semibold tabular-nums text-green-950">{money(p.amount, cur)}</span>
                  <Badge tone={t.tone}>{t.label}</Badge>
                </li>
              );
            })}
          </ul>
        ) : (
          <Quiet>No payments yet. Payments appear here once the work earns money — each member&apos;s line shows paid, scheduled or pending.</Quiet>
        )}
      </section>

      <Card tone="sand" className="flex flex-col gap-2 p-5">
          <p className="text-sm font-semibold text-green-950">Artelia&apos;s fee, in the open</p>
          <dl className="flex flex-col gap-1 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-grey-800">Due to members</dt>
              <dd className="tabular-nums text-green-950">{money(payTotal, cur)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-grey-800">Collaboration facilitation fee ({Math.round(FACILITATION_FEE_RATE * 100)}%)</dt>
              <dd className="tabular-nums text-green-950">{payTotal > 0 ? money(fee, cur) : "Nothing charged yet"}</dd>
            </div>
          </dl>
          <p className="text-xs text-grey-700">
            Charged to the buyer or commissioner on top of the project value — never deducted from members&apos; shares or expenses. No fee is charged if the collaboration doesn&apos;t earn.
          </p>
      </Card>

      <Notice tone="trust" title="Project protection: escrow">
        Commissioned and sale funds sit in escrow and are released only when every member approves a milestone. If someone leaves, the charter&apos;s exit terms decide what&apos;s paid — not whoever holds the money.
      </Notice>
    </div>
  );
}
