// Covers: C1, C2, T3, P2, P4
import { PageHeader } from "@/components/ui/Headers";
import Page from "@/components/ui/Page";
import OnboardingFlow from "./_components/OnboardingFlow";

export const metadata = { title: "Welcome" };

export default function OnboardingPage() {
  return (
    <Page>
      <PageHeader
        eyebrow="Welcome to Artelia Connect"
        title="Belong to African creativity"
        description="Artelia is where you buy African art. Connect is where you find your people — collaborators, collectors, curators and peers. We start with why you're here, not what you like."
      />
      <OnboardingFlow />
    </Page>
  );
}
