// Covers: S3, S9, T1, T2, U1, B2
// S3 pipeline with eligibility screen, tags, compare, private notes, invite material, long/shortlists,
//    status updates to everyone at a stage, consented future-opportunity radar
// S9 status communicated to all applicants · T1 Halima shown as a verified curator
// T2 verified vs self-declared labels on identity and eligibility facts · U1 curator runs "Figure & Ground" end to end
// B2 labelled as a Professional workspace feature, linked to /membership
import type { Metadata } from "next";
import Link from "next/link";
import { Briefcase } from "iconsax-reactjs";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/Headers";
import Page from "@/components/ui/Page";
import TrustLabel from "@/components/ui/TrustLabel";
import { CANDIDATES, getCall, getPerson } from "@/lib/data";
import CuratorDesk from "./_components/CuratorDesk";

export const metadata: Metadata = { title: "Curator Desk" };

export default function CuratorPage() {
  const call = getCall("figure-ground")!;
  const halima = getPerson("halima");
  const candidates = CANDIDATES.filter((c) => c.callId === call.id);

  return (
    <Page wide>
      <div className="flex flex-col gap-4 rounded-[4px] border border-sand-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Avatar name={halima.name} size="md" verified={halima.verified} />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-green-950">
              <Link href={`/people/${halima.id}`} className="hover:underline">{halima.name}</Link>
            </p>
            <p className="flex flex-wrap items-center gap-2 text-xs text-grey-700">
              {halima.title} · {halima.city} <TrustLabel source="verified" compact /> <span>Verified curator since Mar 2026</span>
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="gold" icon={<Briefcase size={12} color="currentColor" aria-hidden />}>Professional workspace</Badge>
          <Link href="/membership" className="text-xs font-semibold text-green-950 underline underline-offset-2">What&apos;s included</Link>
        </div>
      </div>

      <PageHeader
        className="mt-8"
        eyebrow="Curator Desk"
        title={call.title.split(":")[0]}
        description={
          <>
            {call.title.split(":")[1]?.trim()} · {call.budget} · deadline {call.deadline}. Screen, compare and decide — and tell every applicant where they stand.{" "}
            <Link href={`/opportunities/${call.id}`} className="font-semibold text-green-950 underline underline-offset-2">View the public call</Link>
          </>
        }
        actions={<Button href="/opportunities/new" variant="outline">Publish another call</Button>}
      />

      <div className="mt-8">
        <CuratorDesk call={call} initial={candidates} />
      </div>
    </Page>
  );
}
