import Link from "next/link";
import Avatar from "@/components/ui/Avatar";
import Card from "@/components/ui/Card";
import TrustLabel from "@/components/ui/TrustLabel";
import { ME_ID, getPerson } from "@/lib/data";
import type { Project } from "@/lib/types";
import { PROVENANCE } from "../../_data";
import { PanelHeading, Quiet, type LedgerEntry } from "./shared";

export default function PreservePanel({ project, ledger }: { project: Project; ledger: LedgerEntry[] }) {
  const roles = new Map(project.charter.roles.map((r) => [r.personId, r]));
  const shares = new Map(project.charter.revenueShare.map((s) => [s.personId, s.share]));
  const provenance = PROVENANCE[project.id] ?? [];

  return (
    <div className="flex flex-col gap-10">
      <p className="font-playfair text-xl leading-snug text-green-950 sm:text-2xl">Every contributor becomes part of the work&apos;s legacy.</p>

      <section aria-label="Creator credits" className="flex flex-col gap-3">
        <PanelHeading description="These credits travel with the work — on every page, sale and loan.">Creator credits</PanelHeading>
        {project.charter.credit && <p className="text-sm text-grey-800">Credit line: <span className="font-semibold text-green-950">{project.charter.credit}</span></p>}
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {project.memberIds.map((pid) => {
            const person = getPerson(pid);
            const role = roles.get(pid);
            return (
              <Card as="li" key={pid} className="flex items-start gap-3 p-4">
                <Avatar name={person.name} size="md" verified={person.verified} />
                <div className="min-w-0 text-sm">
                  <Link href={`/people/${pid}`} className="font-semibold text-green-950 hover:underline">{person.name}</Link>
                  <p className="text-grey-700">{role?.role ?? person.title}</p>
                  {role && <p className="mt-1 text-xs text-grey-700">{role.contribution}</p>}
                  {shares.has(pid) && <p className="mt-1 text-xs text-grey-700">Co-ownership share: {shares.get(pid)}%</p>}
                </div>
              </Card>
            );
          })}
        </ul>
      </section>

      <section aria-label="Contribution ledger" className="flex flex-col gap-3">
        <PanelHeading description="Recorded by the project room as it happens. Nothing here can be edited after the fact.">Contribution ledger</PanelHeading>
        {ledger.length ? (
          <ol className="relative flex flex-col gap-4 border-l-2 border-sand-300 pl-6">
            {ledger.map((entry, i) => {
              const person = getPerson(entry.personId);
              return (
                <li key={`${entry.date}-${entry.personId}-${i}`} className="relative">
                  <span className="absolute -left-[33px] top-1 h-4 w-4 rounded-full border-2 border-white bg-green-950" aria-hidden />
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-grey-700">{entry.date}</p>
                  <p className="mt-1 text-sm text-green-950">
                    <span className="font-semibold">{entry.personId === ME_ID ? "You" : person.name}</span> — {entry.contribution}
                  </p>
                  <TrustLabel source="verified" compact className="mt-1.5" />
                </li>
              );
            })}
          </ol>
        ) : (
          <Quiet>The ledger starts recording from the first action in the room.</Quiet>
        )}
      </section>

      <section aria-label="Provenance and ownership" className="flex flex-col gap-3">
        <PanelHeading description="Who owns the work, where it has been, and on what terms. Future owners inherit this history.">Provenance & ownership</PanelHeading>
        {project.charter.newIp && (
          <p className="rounded-[4px] bg-sand-100 p-4 text-sm text-grey-800">
            <span className="font-semibold text-green-950">Ownership today: </span>
            {project.charter.newIp}
          </p>
        )}
        {provenance.length ? (
          <ul className="flex flex-col divide-y divide-sand-200 rounded-[4px] border border-sand-200 bg-white">
            {provenance.map((p) => (
              <li key={p.text} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-start sm:gap-4">
                <p className="w-28 shrink-0 text-xs font-semibold uppercase tracking-[0.08em] text-grey-700">{p.date}</p>
                <p className="min-w-0 flex-1 text-sm text-green-950">{p.text}</p>
                <TrustLabel source={p.source} className="self-start" />
              </li>
            ))}
          </ul>
        ) : (
          <Quiet>Ownership history begins when the work is first presented, sold or loaned.</Quiet>
        )}
      </section>
    </div>
  );
}
