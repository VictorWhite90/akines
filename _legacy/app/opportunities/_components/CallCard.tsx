import Link from "next/link";
import { ArrowRight, Warning2 } from "iconsax-reactjs";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Media from "@/components/ui/Media";
import TrustLabel from "@/components/ui/TrustLabel";
import { cn } from "@/lib/cn";
import type { OpenCall } from "@/lib/types";
import { ORGANISER_TYPE, STATUS } from "../_data";
import MatchReasons from "./MatchReasons";
import ReportCall from "./ReportCall";

/** A structured open call at a glance: the same standard fields on every card (S2). */
export default function CallCard({ call }: { call: OpenCall }) {
  const status = STATUS[call.status];
  const flagged = Boolean(call.flags?.length);

  const fields: { label: string; value: string; missing?: boolean }[] = [
    { label: "Eligible media", value: call.eligibleMedia.join(", ") },
    { label: "Geography", value: call.geography },
    { label: "Experience", value: call.experienceLevel },
    { label: "Budget / fee", value: call.budget ?? "Not disclosed", missing: !call.budget },
    { label: "Rights requested", value: call.rightsRequested, missing: call.rightsRequested === "Not stated" },
    { label: "Deadline", value: call.deadline, missing: call.deadline === "Not stated" },
  ];

  return (
    <Card as="li" className={cn("flex flex-col overflow-hidden", flagged && "border-alert/40")}>
      {flagged ? (
        <div className="flex items-start gap-3 border-b border-alert/20 bg-alert-bg p-4 text-alert">
          <Warning2 size={22} variant="Bold" color="currentColor" className="mt-0.5 shrink-0" aria-hidden />
          <div className="min-w-0">
            <p className="text-sm font-semibold">Caution: this call has not passed our checks</p>
            <p className="mt-1 text-xs text-grey-800">We show it so you recognise it if it reaches you elsewhere. You can&apos;t apply through Artelia.</p>
            <ul className="mt-2 flex flex-col gap-1 text-xs font-semibold text-alert">
              {call.flags!.map((flag) => (
                <li key={flag} className="flex items-start gap-1.5">
                  <span aria-hidden>•</span> {flag}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <Media src={call.image} alt="" ratio="16/7" sizes="(max-width: 768px) 100vw, 560px" />
      )}

      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={flagged ? "alert" : status.tone}>{flagged ? "Flagged" : status.label}</Badge>
          <span className="text-xs text-grey-700">{ORGANISER_TYPE[call.organiserType]}</span>
        </div>

        <div>
          <h3 className="font-playfair text-xl font-semibold leading-snug text-green-950">
            <Link href={`/opportunities/${call.id}`} className="hover:underline">
              {call.title}
            </Link>
          </h3>
          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-sm text-grey-800">
            <span>{call.organisation}</span>
            {call.organiserVerified ? (
              <TrustLabel source="verified" compact />
            ) : (
              <Badge tone="alert">Not verified</Badge>
            )}
          </div>
          <p className="mt-2 text-sm text-grey-700">{call.theme}</p>
        </div>

        <dl className="grid grid-cols-1 gap-x-4 gap-y-2.5 text-sm sm:grid-cols-2">
          {fields.map((field) => (
            <div key={field.label} className="min-w-0">
              <dt className="text-[11px] font-semibold uppercase tracking-[0.08em] text-grey-700">{field.label}</dt>
              <dd className={cn("mt-0.5 line-clamp-2", field.missing ? "font-semibold text-alert" : "text-green-950")}>{field.value}</dd>
            </div>
          ))}
        </dl>

        {call.matchReasons && <MatchReasons reasons={call.matchReasons} callTitle={call.title} />}

        <div className="mt-auto flex flex-wrap items-center gap-2 pt-1">
          {flagged ? (
            <>
              <ReportCall callTitle={call.title} />
              <Button href={`/opportunities/${call.id}`} variant="ghost" size="sm">Why it&apos;s flagged</Button>
            </>
          ) : (
            <Button href={`/opportunities/${call.id}`} variant={call.status === "closed" ? "ghost" : "outline"} size="sm" icon={<ArrowRight size={16} color="currentColor" aria-hidden />}>
              {call.status === "closed" ? "See the call" : "Details & apply"}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
