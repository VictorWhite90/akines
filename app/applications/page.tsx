// Covers: S9, U1, U6, T2
// S9 every application shows its stage tracker, dated history with notes, and one clear next action
// U1 artist side of a curator's pipeline (shortlist → pick a conversation slot) · U6 not-selected feedback points to next steps
// T2 organiser verification labels · no dead ends: withdraw with confirm, feedback follow-up, links onward
import type { Metadata } from "next";
import { ArrowRight } from "iconsax-reactjs";
import Button from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/Headers";
import Notice from "@/components/ui/Notice";
import Page from "@/components/ui/Page";
import Stat from "@/components/ui/Stat";
import { MY_APPLICATIONS, getCall } from "@/lib/data";
import ApplicationCard from "./_components/ApplicationCard";

export const metadata: Metadata = { title: "My applications" };

export default function ApplicationsPage() {
  const items = MY_APPLICATIONS.map((application) => ({ application, call: getCall(application.callId)! }));
  const active = items.filter(({ application }) => !["not-selected", "selected"].includes(application.stage));
  const past = items.filter(({ application }) => ["not-selected", "selected"].includes(application.stage));
  const needsYou = items.filter(({ application }) => application.stage === "shortlist").length;

  return (
    <Page>
      <PageHeader
        eyebrow="Opportunities"
        title="My applications"
        description="Where each application stands, what happened when, and what — if anything — you need to do next. Every applicant hears back, whatever the outcome."
        actions={<Button href="/opportunities" variant="outline" icon={<ArrowRight size={18} color="currentColor" aria-hidden />}>Find open calls</Button>}
      />

      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Stat label="Active" value={active.length} />
        <Stat label="Needs you" value={needsYou} hint={needsYou ? "Pick a conversation slot" : "Nothing waiting"} />
        <Stat label="Decided" value={past.length} className="col-span-2 sm:col-span-1" hint="With written feedback" />
      </div>

      <section aria-labelledby="active-heading" className="mt-10">
        <h2 id="active-heading" className="font-playfair text-xl font-semibold text-green-950 md:text-2xl">In progress</h2>
        <ul className="mt-4 flex flex-col gap-4">
          {active.map(({ application, call }) => <ApplicationCard key={application.id} application={application} call={call} />)}
        </ul>
      </section>

      <section aria-labelledby="past-heading" className="mt-10">
        <h2 id="past-heading" className="font-playfair text-xl font-semibold text-green-950 md:text-2xl">Decided</h2>
        <ul className="mt-4 flex flex-col gap-4">
          {past.map(({ application, call }) => <ApplicationCard key={application.id} application={application} call={call} />)}
        </ul>
      </section>

      <Notice tone="trust" title="Your applications, your data" className="mt-10">
        Organisers see only what you sent to their call. They can keep your profile for future opportunities only if you say yes — you&apos;ll be asked each time, and can change your mind on the Trust page.
      </Notice>

      <p className="mt-8 border-t border-sand-200 pt-6 text-center text-sm text-grey-700">That&apos;s every application you&apos;ve made on Artelia.</p>
    </Page>
  );
}
