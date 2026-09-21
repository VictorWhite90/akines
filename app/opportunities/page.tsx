// Covers: S2, T1, T2, T3, T6, U1, P2, P3
// S2 structured fields on every card · T1 verified organiser labels · T6 flagged call shown with warnings + report
// T2/T3 AI match reasons labelled and dismissible · P2/P3 finite list ordered by deadline, not popularity
import type { Metadata } from "next";
import { Add, ShieldTick } from "iconsax-reactjs";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/Headers";
import Notice from "@/components/ui/Notice";
import Page from "@/components/ui/Page";
import { MY_APPLICATIONS, OPEN_CALLS } from "@/lib/data";
import CallsBrowser from "./_components/CallsBrowser";

export const metadata: Metadata = { title: "Open calls" };

export default function OpportunitiesPage() {
  const active = MY_APPLICATIONS.filter((a) => a.stage !== "not-selected").length;

  return (
    <Page>
      <PageHeader
        eyebrow="Opportunity engine"
        title="Open calls"
        description="Every call here shows the same things up front — who is asking, what they'll pay, which rights they want and how they'll choose. No links in comments, no guessing."
        actions={
          <>
            <Button href="/applications" variant="outline">My applications ({active} active)</Button>
            <Button href="/opportunities/new" icon={<Add size={18} color="currentColor" aria-hidden />}>Publish a call</Button>
          </>
        }
      />

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0">
          <CallsBrowser calls={OPEN_CALLS} />
        </div>

        <aside className="flex flex-col gap-4" aria-label="How calls are checked">
          <Card tone="sand" className="p-5">
            <div className="flex items-center gap-2 text-verified">
              <ShieldTick size={20} variant="Bulk" color="currentColor" aria-hidden />
              <h2 className="text-sm font-semibold">What we check before a call goes live</h2>
            </div>
            <ul className="mt-3 flex flex-col gap-2 text-sm text-grey-800">
              <li>The organiser&apos;s identity and, for galleries and institutions, their registration.</li>
              <li>A disclosed budget or fee. Calls without one are not published.</li>
              <li>Rights requested, in plain language.</li>
              <li>No payment asked of artists before selection.</li>
            </ul>
            <Button href="/trust" variant="ghost" size="sm" className="mt-3 -ml-3">How trust works on Artelia</Button>
          </Card>
          <Notice tone="safety" title="Got a call by DM or email?">
            Check it&apos;s listed here before you send anything. Real organisers on Artelia never ask for fees, bank details or ID over chat.
          </Notice>
          <Card className="p-5">
            <h2 className="text-sm font-semibold text-green-950">Running a call?</h2>
            <p className="mt-2 text-sm text-grey-700">Publish a structured call and review every application in the Curator Desk — tagging, shortlists and status updates in one place.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button href="/opportunities/new" size="sm">Publish a call</Button>
              <Button href="/curator" variant="ghost" size="sm">Curator Desk</Button>
            </div>
          </Card>
        </aside>
      </div>
    </Page>
  );
}
