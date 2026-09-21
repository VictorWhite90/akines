// Covers: W1, W2, W3, W4, T4 (also T2 — verified-professional and AI labels; C7 — link to journals)
import type { Metadata } from "next";
import Link from "next/link";
import { Global, Location, Lovely, Sun1, Wind } from "iconsax-reactjs";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import { PageHeader, SectionHeader } from "@/components/ui/Headers";
import Notice from "@/components/ui/Notice";
import Page from "@/components/ui/Page";
import TrustLabel from "@/components/ui/TrustLabel";
import { ME } from "@/lib/data";
import { MINDFULNESS_PROMPT, THERAPISTS } from "./_data";
import Breathing from "./_components/Breathing";
import BurnoutReflection from "./_components/BurnoutReflection";
import CheckIn from "./_components/CheckIn";
import MoodCanvas from "./_components/MoodCanvas";
import RequestConversation from "./_components/RequestConversation";
import { GlobalSafetyPanel, NeedToTalkButton, PrivacyNotice } from "./_components/SafetyControls";
import { ResetBoundary, WellbeingProvider } from "./_components/WellbeingContext";
import { GratitudeNotes, JournalPrompt, ReflectionPrompts } from "./_components/Writing";

export const metadata: Metadata = { title: "Creative wellbeing" };

const GROUNDING = [
  "5 things you can see — start with a colour in the room.",
  "4 things you can touch — a thread, a table edge, your own sleeve.",
  "3 things you can hear, near and far.",
  "2 things you can smell — dye, coffee, rain.",
  "1 slow breath, longer out than in.",
];

export default function WellbeingPage() {
  return (
    <Page>
      <WellbeingProvider>
        <PageHeader
          eyebrow="Creative wellbeing · private"
          title="A quiet corner, just for you"
          description={`Making art can be lonely and heavy, ${ME.name.split(" ")[0]}. These are small tools for noticing how you are — no scores, no streaks, no one watching.`}
          actions={<NeedToTalkButton />}
        />

        <GlobalSafetyPanel />
        <PrivacyNotice />

        <ResetBoundary>
          <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
            <div className="flex min-w-0 flex-col gap-10">
              <section aria-labelledby="canvas-heading">
                <SectionHeader
                  id="canvas-heading"
                  title="Daily mood canvas"
                  description="A colour, a shape and one word. Not an assessment — just a mark for today."
                />
                <Card className="mt-4 p-5 sm:p-6">
                  <MoodCanvas />
                </Card>
              </section>

              <section aria-labelledby="burnout-heading">
                <SectionHeader
                  id="burnout-heading"
                  title="Creative burnout reflection"
                  description="Five honest questions about how your practice has felt lately. You'll get a reflection and a few suggestions — never a score or a label."
                />
                <Card className="mt-4 p-5 sm:p-6">
                  <BurnoutReflection />
                </Card>
              </section>

              <section aria-labelledby="prompts-heading">
                <SectionHeader
                  id="prompts-heading"
                  title="Reflection prompts"
                  description="For the doubt that follows artists around, and for collectors thinking about what art is doing in their lives."
                />
                <Card className="mt-4 p-5 sm:p-6">
                  <ReflectionPrompts />
                </Card>
              </section>

              <section aria-labelledby="journal-heading">
                <SectionHeader
                  id="journal-heading"
                  title="Expressive art journaling"
                  description="Make first, think later. Keep it private, or save it as a draft for your Artist Journal."
                  action={
                    <Link href="/journals" className="text-sm font-semibold text-green-950 underline underline-offset-4">
                      Artist Journals
                    </Link>
                  }
                />
                <Card className="mt-4 p-5 sm:p-6">
                  <JournalPrompt />
                </Card>
              </section>
            </div>

            <aside className="flex flex-col gap-6" aria-label="Quick tools">
              <Card as="section" className="p-5" tone="sand">
                <h2 className="flex items-center gap-2 font-playfair text-xl font-semibold text-green-950">
                  <Lovely size={20} variant="Bulk" color="var(--color-calm)" aria-hidden /> Quick check-in
                </h2>
                <p className="mt-1 mb-4 text-sm text-grey-700">Thirty seconds. Only you see it.</p>
                <CheckIn />
              </Card>

              <Card as="section" className="p-5">
                <h2 id="breathe" className="flex scroll-mt-24 items-center gap-2 font-playfair text-xl font-semibold text-green-950">
                  <Wind size={20} variant="Bulk" color="var(--color-calm)" aria-hidden /> Breathe & ground
                </h2>
                <p className="mt-1 mb-5 text-sm text-grey-700">Four slow rounds, about a minute.</p>
                <Breathing />
                <div className="mt-6 border-t border-sand-200 pt-4">
                  <h3 className="text-sm font-semibold text-green-950">5-4-3-2-1 grounding</h3>
                  <ol className="mt-2 flex flex-col gap-1.5 text-sm text-grey-800">
                    {GROUNDING.map((g) => (
                      <li key={g}>{g}</li>
                    ))}
                  </ol>
                </div>
              </Card>

              <Card as="section" className="p-5">
                <h2 className="flex items-center gap-2 font-playfair text-xl font-semibold text-green-950">
                  <Sun1 size={20} variant="Bulk" color="var(--color-gold-500)" aria-hidden /> Mindfulness & gratitude
                </h2>
                <p className="mt-3 rounded-[4px] bg-calm-bg p-4 font-playfair text-base leading-relaxed text-green-950">{MINDFULNESS_PROMPT}</p>
                <div className="mt-5">
                  <GratitudeNotes />
                </div>
              </Card>
            </aside>
          </div>
        </ResetBoundary>

        <section aria-labelledby="therapists" className="mt-14">
          <SectionHeader
            id="therapists"
            className="scroll-mt-24"
            eyebrow="Referral pathways"
            title="Talk with a licensed professional"
            description="Therapists and art therapists we have verified — licence, registration body and identity. They are independent: Artelia doesn't provide therapy, takes no referral fee, and never learns what you discuss."
          />
          <Notice tone="info" className="mt-4">
            <strong className="font-semibold text-green-950">Example listings.</strong> These are fictional placeholders for the prototype. Pilot partners will be real,
            licensed professionals in each hub.
          </Notice>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {THERAPISTS.map((t) => (
              <Card as="li" key={t.id} className="flex flex-col gap-3 p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <TrustLabel source="verified" />
                  <Badge tone="calm">Verified professional</Badge>
                  <Badge>Example listing</Badge>
                </div>
                <div>
                  <h3 className="font-playfair text-lg font-semibold text-green-950">{t.name}</h3>
                  <p className="text-sm text-grey-700">{t.profession}</p>
                </div>
                <p className="text-sm text-grey-800">{t.focus}</p>
                <dl className="grid gap-1.5 text-sm">
                  <div className="flex gap-2">
                    <dt className="sr-only">Location</dt>
                    <Location size={16} color="currentColor" className="mt-0.5 shrink-0 text-grey-700" aria-hidden />
                    <dd className="text-grey-800">
                      {t.city} · {t.formats.join(" & ")}
                    </dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="sr-only">Languages</dt>
                    <Global size={16} color="currentColor" className="mt-0.5 shrink-0 text-grey-700" aria-hidden />
                    <dd className="text-grey-800">{t.languages.join(", ")}</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="font-semibold text-green-950">Fees</dt>
                    <dd className="text-grey-800">{t.fee}</dd>
                  </div>
                </dl>
                <RequestConversation name={t.name} />
              </Card>
            ))}
          </ul>
          <p className="mt-4 text-sm text-grey-700">That&apos;s everyone in the pilot directory for now. More professionals join as each hub opens.</p>
        </section>

        <div className="mt-12 grid gap-4 md:grid-cols-2">
          <Notice tone="private" title="What the AI Companion will and won't do here">
            It can offer a gentle reflection or a prompt, labelled as an AI suggestion. It won&apos;t diagnose, label a condition, or guess at your health — and
            nothing you share here shapes your introductions, opportunities or what anyone sees about you.{" "}
            <Link href="/trust#data" className="font-semibold text-green-950 underline underline-offset-4">
              Our data promises
            </Link>
          </Notice>
          <Notice tone="safety" title="Artelia Connect is not an emergency service">
            If you or someone near you is in immediate danger, call your local emergency number — Nigeria or Ghana 112, Kenya 999 or 112, South Africa 10111
            (112 from a mobile), UK 999.
          </Notice>
        </div>
      </WellbeingProvider>
    </Page>
  );
}
