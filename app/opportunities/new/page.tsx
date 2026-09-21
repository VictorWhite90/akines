// Covers: S2, T1, T6, T8, B2, U1, U3
// S2 every standard field required (budget included) · T1 organiser verification status shown and gated
// T6 no-entry-fee confirmation, rights templates · T8 "Sent for review" explains human review and appeal
// B2 professional open-call pricing · U1/U3 curator or institution publishes a call
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "iconsax-reactjs";
import { PageHeader } from "@/components/ui/Headers";
import Page from "@/components/ui/Page";
import PublishCallForm from "../_components/PublishCallForm";

export const metadata: Metadata = { title: "Publish a call" };

export default function NewCallPage() {
  return (
    <Page>
      <Link href="/opportunities" className="inline-flex items-center gap-1.5 text-sm font-semibold text-green-950 hover:underline">
        <ArrowLeft size={16} color="currentColor" aria-hidden /> All open calls
      </Link>
      <PageHeader
        className="mt-6"
        eyebrow="For curators, galleries & institutions"
        title="Publish a structured call"
        description="Artists deserve to know who is asking, what it pays, which rights you want and how you'll decide — before they spend a weekend applying. Every field below is required."
      />
      <div className="mt-8">
        <PublishCallForm />
      </div>
    </Page>
  );
}
