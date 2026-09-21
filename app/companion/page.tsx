// Covers: C11 (specialised AI Creative Companion — history, materials, symbolism, exhibitions, pricing, collector education, wellbeing), T2 (AI label on every answer; curated-verified vs general-AI sources), W3 (does not diagnose; private; never used for ranking), W4 (crisis language → safety flow with local emergency numbers)
import { PageHeader } from "@/components/ui/Headers";
import Notice from "@/components/ui/Notice";
import Page from "@/components/ui/Page";
import Companion from "./_components/Companion";

export default function CompanionPage() {
  return (
    <Page>
      <PageHeader
        eyebrow="AI Creative Companion"
        title="Ask about the craft, the history, the market."
        description="A specialised AI for African art — not a generic chatbot. It answers from Artelia's curated knowledge where it can, tells you when it can't, and hands you to a human curator when you need one."
      />
      <div className="mt-6 grid gap-3 md:grid-cols-2">
        <Notice tone="info" title="What the Companion can't do">
          It is an AI and can be wrong. It does not diagnose anything — for your health, talk to a professional. Pricing answers are guidance, not a valuation of any specific work.
        </Notice>
        <Notice tone="private" title="Your questions stay yours">
          Conversations are private. They are never used to target sales, rank you for opportunities or infer anything about your health.
        </Notice>
      </div>
      <div className="mt-8">
        <Companion />
      </div>
    </Page>
  );
}
