// Covers: C2, C1, T2, T3, T4
import { Eye } from "iconsax-reactjs";
import Button from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/Headers";
import Page from "@/components/ui/Page";
import TrustLabel from "@/components/ui/TrustLabel";
import { ME } from "@/lib/data";
import DnaEditor from "./_components/DnaEditor";

export const metadata = { title: "My Creative DNA" };

export default function DnaPage() {
  return (
    <Page wide>
      <PageHeader
        eyebrow="My Creative DNA"
        title="How Artelia understands you"
        description="A living profile built from what you've told us and — only with your consent — how you take part. Every value says where it came from and why. Change anything."
        actions={
          <Button href={`/people/${ME.id}`} variant="outline" size="sm" icon={<Eye size={16} color="currentColor" aria-hidden />}>
            See my profile as others do
          </Button>
        }
      />
      <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-grey-700">
        <span className="flex items-center gap-1.5">
          <TrustLabel source="self-declared" compact /> you said it
        </span>
        <span className="flex items-center gap-1.5">
          <TrustLabel source="ai" compact /> Artelia inferred it from your activity — you can overwrite it
        </span>
        <span className="flex items-center gap-1.5">
          <TrustLabel source="verified" compact /> checked against records
        </span>
      </div>
      <DnaEditor />
    </Page>
  );
}
