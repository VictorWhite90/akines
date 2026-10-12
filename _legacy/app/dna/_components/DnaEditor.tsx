"use client";

import { useState } from "react";
import { DocumentDownload, Refresh, Trash } from "iconsax-reactjs";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Chip from "@/components/ui/Chip";
import { SectionHeader } from "@/components/ui/Headers";
import Notice from "@/components/ui/Notice";
import Spectrum from "@/components/ui/Spectrum";
import { COLLECTOR_TYPES, INTENTS, ME, MY_DNA } from "@/lib/data";
import type { CollectorType, CreativeDna, DnaDimension, IntentId } from "@/lib/types";
import { cn } from "@/lib/cn";
import ConsentToggle from "./ConsentToggle";
import { ONBOARDING_ANSWERS, PRIVACY_OPTIONS } from "../_data";

export default function DnaEditor() {
  const [dimensions, setDimensions] = useState<DnaDimension[]>(MY_DNA.dimensions);
  const [intents, setIntents] = useState<IntentId[]>(MY_DNA.intents);
  const [collectorTypes, setCollectorTypes] = useState<CollectorType[]>(MY_DNA.collectorTypes ?? []);
  const [privacy, setPrivacy] = useState<CreativeDna["privacy"]>(MY_DNA.privacy);
  const [status, setStatus] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleted, setDeleted] = useState(false);

  const aiCount = dimensions.filter((d) => d.source === "ai").length;

  function edit(id: string, value: number) {
    setDimensions((prev) => prev.map((d) => (d.id === id ? { ...d, value, source: "self-declared", why: "You set this yourself. Artelia won't change it without asking." } : d)));
  }

  function resetInferred() {
    setDimensions((prev) =>
      prev.map((d) => (d.source === "ai" ? { ...d, value: ONBOARDING_ANSWERS[d.id] ?? 50, source: "self-declared", why: "Reset to the answer you gave when you joined." } : d)),
    );
    setStatus(`${aiCount} AI-inferred ${aiCount === 1 ? "value was" : "values were"} reset to your own answers.`);
  }

  function toggle<T>(list: T[], item: T, set: (next: T[]) => void) {
    set(list.includes(item) ? list.filter((x) => x !== item) : [...list, item]);
  }

  function download() {
    const data = { member: ME.name, exportedOn: new Date().toISOString(), creativeDna: { intents, dimensions, collectorTypes, privacy } };
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "artelia-creative-dna.json";
    a.click();
    URL.revokeObjectURL(url);
    setStatus("Your Creative DNA was downloaded as a JSON file.");
  }

  if (deleted) {
    return (
      <div className="mt-8 flex flex-col items-start gap-3 rounded-[4px] border border-sand-200 bg-white p-6" role="status">
        <p className="font-playfair text-xl font-semibold text-green-950">Your Creative DNA has been deleted.</p>
        <p className="max-w-xl text-sm text-grey-800">
          Your dimensions, intents and inferred values are gone, and introductions are paused. Your profile, stories and projects are untouched. You can rebuild your Creative DNA
          whenever you like.
        </p>
        <Button href="/onboarding">Start again</Button>
      </div>
    );
  }

  return (
    <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className="flex min-w-0 flex-col gap-10">
        <section aria-labelledby="dims-heading">
          <SectionHeader
            id="dims-heading"
            title="Your dimensions"
            description="Move any slider to make it yours — it'll switch to self-declared and we won't change it without asking."
            action={
              <Button variant="outline" size="sm" onClick={resetInferred} disabled={aiCount === 0} icon={<Refresh size={16} color="currentColor" aria-hidden />}>
                Reset AI-inferred values to my own answers
              </Button>
            }
          />
          <p className={cn("text-sm text-verified", status && "mt-3 rounded-[4px] bg-verified-bg px-3 py-2")} role="status">
            {status}
          </p>
          <ul className="mt-5 grid gap-4 md:grid-cols-2">
            {dimensions.map((d) => (
              <Card as="li" key={d.id} className="flex flex-col gap-3 p-5">
                <Spectrum label={d.label} left={d.left} right={d.right} value={d.value} source={d.source} onChange={(v) => edit(d.id, v)} />
                <p className="text-xs leading-relaxed text-grey-700">
                  <span className="font-semibold text-grey-800">Why: </span>
                  {d.why}
                </p>
              </Card>
            ))}
          </ul>
        </section>

        <section aria-labelledby="intents-heading">
          <SectionHeader id="intents-heading" title="Why you're here" description="Your intents decide which introductions, rooms and calls you see first." />
          <div className="mt-4 flex flex-wrap gap-2">
            {INTENTS.map((i) => (
              <Chip key={i.id} selected={intents.includes(i.id)} onToggle={() => toggle(intents, i.id, setIntents)}>
                {i.label}
              </Chip>
            ))}
          </div>
          {intents.length === 0 && <p className="mt-3 text-sm text-alert">With no intents selected, introductions pause until you choose one.</p>}
        </section>

        <section aria-labelledby="collector-heading">
          <SectionHeader
            id="collector-heading"
            title="Collector motivations"
            description="For when you collect. Optional — most artists collect a little, too. Artists see this when you're introduced as a collector."
          />
          <ul className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {COLLECTOR_TYPES.map((c) => {
              const selected = collectorTypes.includes(c.id);
              return (
                <li key={c.id}>
                  <button
                    type="button"
                    aria-pressed={selected}
                    onClick={() => toggle(collectorTypes, c.id, setCollectorTypes)}
                    className={cn(
                      "h-full w-full cursor-pointer rounded-[4px] border p-3 text-left transition-colors",
                      selected ? "border-green-950 bg-green-50" : "border-sand-200 bg-white hover:border-green-950",
                    )}
                  >
                    <span className="block text-sm font-semibold text-green-950">{c.id}</span>
                    <span className="block text-xs text-grey-700">{c.description}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      </div>

      <div className="flex flex-col gap-6">
        <section aria-labelledby="privacy-heading" className="rounded-[4px] border border-sand-200 bg-white p-5">
          <h2 id="privacy-heading" className="font-playfair text-lg font-semibold text-green-950">
            Privacy & consent
          </h2>
          <div className="mt-4 flex flex-col gap-5">
            {PRIVACY_OPTIONS.map((opt) => (
              <ConsentToggle
                key={opt.key}
                label={opt.label}
                description={privacy[opt.key] ? opt.on : opt.off}
                checked={privacy[opt.key]}
                onChange={(next) => setPrivacy((prev) => ({ ...prev, [opt.key]: next }))}
              />
            ))}
          </div>
        </section>

        <Notice tone="private" title="What your Creative DNA is never used for">
          <ul className="list-disc space-y-1 pl-4">
            <li>Your wellbeing check-ins, moods or private journal entries — they are never part of it.</li>
            <li>Advertising, or being sold to anyone.</li>
            <li>Ranking you for opportunities. Curators judge the work you submit, not your DNA.</li>
          </ul>
        </Notice>

        <section aria-labelledby="data-heading" className="rounded-[4px] border border-sand-200 bg-white p-5">
          <h2 id="data-heading" className="font-playfair text-lg font-semibold text-green-950">
            Your data
          </h2>
          <p className="mt-1 text-sm text-grey-700">It&apos;s yours. Take a copy or delete it any time.</p>
          <div className="mt-4 flex flex-col gap-2">
            <Button variant="outline" size="sm" onClick={download} icon={<DocumentDownload size={16} color="currentColor" aria-hidden />}>
              Download my data
            </Button>
            {!confirmDelete ? (
              <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(true)} icon={<Trash size={16} color="currentColor" aria-hidden />} className="text-alert">
                Delete my Creative DNA
              </Button>
            ) : (
              <div className="mt-2 rounded-[4px] border border-alert/20 bg-alert-bg p-4" role="alertdialog" aria-labelledby="delete-q" aria-describedby="delete-d">
                <p id="delete-q" className="text-sm font-semibold text-alert">
                  Delete your Creative DNA?
                </p>
                <p id="delete-d" className="mt-1 text-sm text-grey-800">
                  This removes every dimension, intent and inferred value, and pauses introductions. It can&apos;t be undone.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button variant="danger" size="sm" onClick={() => setDeleted(true)}>
                    Yes, delete it
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(false)} autoFocus>
                    Keep it
                  </Button>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
