"use client";

import Link from "next/link";
import { useId, useMemo, useRef, useState, type RefObject } from "react";
import { Add, CloseCircle, CloseSquare, Lock1, Radar, Send2, TickCircle } from "iconsax-reactjs";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Chip from "@/components/ui/Chip";
import EmptyState from "@/components/ui/EmptyState";
import Media from "@/components/ui/Media";
import Notice from "@/components/ui/Notice";
import Stat from "@/components/ui/Stat";
import Tabs from "@/components/ui/Tabs";
import TrustLabel from "@/components/ui/TrustLabel";
import { getPerson } from "@/lib/data";
import { cn } from "@/lib/cn";
import type { Candidate, CandidateStage, OpenCall } from "@/lib/types";
import { CONSENT_LABEL, PAST_RADAR, PIPELINE, RADAR_CONSENT, TEMPLATES, type Consent } from "../_data";

type Tab = "pipeline" | "radar";

const allPass = (c: Candidate) => c.eligibility.every((e) => e.pass);
const passCount = (c: Candidate) => c.eligibility.filter((e) => e.pass).length;
const stageLabel = (s: CandidateStage) => PIPELINE.find((p) => p.id === s)!.label;
const CONSENT_TONE: Record<Consent, "green" | "gold" | "neutral" | "alert"> = { granted: "green", requested: "gold", "not-asked": "neutral", declined: "alert" };

const inputCls = "w-full rounded-[2px] border border-sand-300 bg-white px-3 py-2 text-sm text-green-950";

export default function CuratorDesk({ call, initial }: { call: OpenCall; initial: Candidate[] }) {
  const id = useId();
  const [tab, setTab] = useState<Tab>("pipeline");
  const [cands, setCands] = useState<Candidate[]>(initial);
  const [consent, setConsent] = useState<Record<string, Consent>>(() =>
    Object.fromEntries(Object.entries(RADAR_CONSENT).map(([k, v]) => [k, v.state])),
  );
  const [eligibleOnly, setEligibleOnly] = useState(false);
  const [tagFilter, setTagFilter] = useState<string[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [showCompare, setShowCompare] = useState(false);
  const [composerOpen, setComposerOpen] = useState(false);
  const [pastRadar, setPastRadar] = useState(PAST_RADAR);
  const [radarNote, setRadarNote] = useState<string | null>(null);
  const detailRef = useRef<HTMLHeadingElement>(null);
  const compareRef = useRef<HTMLHeadingElement>(null);

  const update = (cid: string, patch: Partial<Candidate>) => setCands((prev) => prev.map((c) => (c.id === cid ? { ...c, ...patch } : c)));

  const allTags = useMemo(() => Array.from(new Set(cands.flatMap((c) => c.tags))).sort(), [cands]);
  const visible = cands.filter((c) => (!eligibleOnly || allPass(c)) && (tagFilter.length === 0 || tagFilter.every((t) => c.tags.includes(t))));
  const selected = cands.find((c) => c.id === selectedId) ?? null;
  const radar = [
    ...cands.filter((c) => c.keepOnRadar && consent[c.personId] === "granted").map((c) => ({ personId: c.personId, from: call.title.split(":")[0], since: RADAR_CONSENT[c.personId]?.date ?? "", why: c.notes[0] ?? c.statement })),
    ...pastRadar,
  ];

  // Live stats — change as the curator works.
  const eligiblePct = Math.round((cands.filter(allPass).length / cands.length) * 100);
  const undecided = cands.filter((c) => c.stage !== "selected" && c.stage !== "declined").length;

  const open = (cid: string) => {
    setSelectedId(cid);
    requestAnimationFrame(() => {
      detailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      detailRef.current?.focus({ preventScroll: true });
    });
  };

  const toggleCompare = (cid: string) =>
    setCompareIds((prev) => (prev.includes(cid) ? prev.filter((x) => x !== cid) : prev.length >= 3 ? prev : [...prev, cid]));

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Applications" value={cands.length} hint={`Since the call opened on Sep 1`} />
        <Stat label="Eligible" value={`${eligiblePct}%`} hint="Pass every rule" />
        <Stat label="Days to shortlist" value={9} hint="First shortlist on Sep 10" />
        <Stat label="Awaiting a decision" value={undecided} hint="Everyone hears back by Nov 24" />
      </div>

      <Tabs<Tab>
        idPrefix={id}
        label="Curator Desk views"
        value={tab}
        onChange={setTab}
        items={[
          { id: "pipeline", label: "Pipeline", hint: String(cands.length) },
          { id: "radar", label: "Talent radar", hint: String(radar.length) },
        ]}
      />

      {tab === "pipeline" && (
        <div role="tabpanel" id={`${id}-panel-pipeline`} aria-labelledby={`${id}-tab-pipeline`} className="flex flex-col gap-6">
          <div className="flex flex-col gap-4 rounded-[4px] border border-sand-200 bg-white p-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter candidates">
              <Chip selected={eligibleOnly} onToggle={() => setEligibleOnly((v) => !v)}>Eligibility passed</Chip>
              {allTags.map((t) => (
                <Chip key={t} selected={tagFilter.includes(t)} onToggle={() => setTagFilter((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]))}>
                  #{t}
                </Chip>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={compareIds.length < 2}
                onClick={() => {
                  setShowCompare(true);
                  requestAnimationFrame(() => {
                    compareRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                    compareRef.current?.focus({ preventScroll: true });
                  });
                }}
              >
                Compare ({compareIds.length}/3)
              </Button>
              <Button size="sm" icon={<Send2 size={16} color="currentColor" aria-hidden />} onClick={() => setComposerOpen((v) => !v)} aria-expanded={composerOpen}>
                Send status update
              </Button>
            </div>
          </div>
          <p className="-mt-3 text-xs text-grey-700" aria-live="polite">
            Showing {visible.length} of {cands.length}. Tick “Compare” on 2–3 cards to see them side by side.
          </p>

          {composerOpen && <StatusComposer call={call} cands={cands} onClose={() => setComposerOpen(false)} />}

          <h2 className="sr-only">Pipeline</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {PIPELINE.map((col) => {
              const items = visible.filter((c) => c.stage === col.id);
              return (
                <section key={col.id} aria-labelledby={`${id}-col-${col.id}`} className="flex flex-col gap-2 rounded-[4px] bg-sand-100 p-2.5">
                  <div className="flex items-center justify-between gap-2 px-1">
                    <h3 id={`${id}-col-${col.id}`} className="text-sm font-semibold text-green-950">{col.label}</h3>
                    <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-green-950" aria-label={`${items.length} candidates`}>{items.length}</span>
                  </div>
                  <p className="px-1 text-[11px] leading-snug text-grey-700">{col.hint}</p>
                  {items.length === 0 ? (
                    <p className="rounded-[4px] border border-dashed border-sand-300 p-3 text-center text-xs text-grey-600">None here</p>
                  ) : (
                    <ul className="flex flex-col gap-2">
                      {items.map((c) => {
                        const p = getPerson(c.personId);
                        const inCompare = compareIds.includes(c.id);
                        return (
                          <li key={c.id} className={cn("rounded-[4px] border bg-white p-3", selectedId === c.id ? "border-green-950" : "border-sand-200")}>
                            <div className="flex items-center gap-2">
                              <Avatar name={p.name} size="sm" verified={p.verified} />
                              <div className="min-w-0">
                                <p className="text-sm font-semibold leading-tight text-green-950">{p.name}</p>
                                <p className="text-[11px] text-grey-700">{p.city}, {p.country}</p>
                              </div>
                            </div>
                            <p className={cn("mt-2 flex items-center gap-1 text-xs font-semibold", allPass(c) ? "text-verified" : "text-alert")}>
                              {allPass(c) ? <TickCircle size={14} variant="Bold" color="currentColor" aria-hidden /> : <CloseCircle size={14} variant="Bold" color="currentColor" aria-hidden />}
                              {passCount(c)}/{c.eligibility.length} eligibility checks
                            </p>
                            {c.tags.length > 0 && (
                              <p className="mt-1.5 flex flex-wrap gap-1">
                                {c.tags.map((t) => <span key={t} className="rounded-full bg-sand-100 px-2 py-0.5 text-[11px] text-grey-800">#{t}</span>)}
                              </p>
                            )}
                            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                              <button type="button" onClick={() => open(c.id)} className="cursor-pointer text-xs font-semibold text-green-950 underline underline-offset-2" aria-label={`Review ${p.name}`}>
                                Review
                              </button>
                              <label className={cn("flex items-center gap-1.5 text-xs text-grey-800", !inCompare && compareIds.length >= 3 && "opacity-50")}>
                                <input type="checkbox" checked={inCompare} disabled={!inCompare && compareIds.length >= 3} onChange={() => toggleCompare(c.id)} className="accent-green-950" />
                                Compare<span className="sr-only"> {p.name}</span>
                              </label>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </section>
              );
            })}
          </div>

          {selected && (
            <CandidateDetail
              key={selected.id}
              cand={selected}
              headingRef={detailRef}
              consent={consent[selected.personId] ?? "not-asked"}
              onConsent={(state) => setConsent((prev) => ({ ...prev, [selected.personId]: state }))}
              onUpdate={(patch) => update(selected.id, patch)}
              onClose={() => setSelectedId(null)}
            />
          )}

          {showCompare && compareIds.length >= 2 && (
            <Card as="section" className="p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 ref={compareRef} tabIndex={-1} className="font-playfair text-xl font-semibold text-green-950 outline-none">Side by side</h2>
                <Button variant="ghost" size="sm" onClick={() => setShowCompare(false)}>Close comparison</Button>
              </div>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[560px] border-collapse text-left text-sm">
                  <caption className="sr-only">Comparing {compareIds.length} candidates</caption>
                  <thead>
                    <tr>
                      <td className="w-32" />
                      {compareIds.map((cid) => {
                        const p = getPerson(cands.find((c) => c.id === cid)!.personId);
                        return (
                          <th key={cid} scope="col" className="p-2 align-top">
                            <span className="flex items-center gap-2">
                              <Avatar name={p.name} size="sm" verified={p.verified} />
                              <span className="font-semibold text-green-950">{p.name}</span>
                            </span>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sand-200">
                    {[
                      { label: "Works", render: (c: Candidate) => (
                        <span className="grid max-w-[220px] grid-cols-2 gap-1.5">
                          {c.works.map((w) => <Media key={w.title} src={w.image} alt={`${w.title}, ${w.medium}`} ratio="1/1" sizes="110px" className="rounded-[2px]" />)}
                        </span>
                      ) },
                      { label: "Stage", render: (c: Candidate) => stageLabel(c.stage) },
                      { label: "Based in", render: (c: Candidate) => { const p = getPerson(c.personId); return `${p.city}, ${p.country}`; } },
                      { label: "Eligibility", render: (c: Candidate) => <span className={allPass(c) ? "text-verified" : "font-semibold text-alert"}>{passCount(c)}/{c.eligibility.length} rules met</span> },
                      { label: "Statement", render: (c: Candidate) => <span className="italic">“{c.statement}”</span> },
                      { label: "Tags", render: (c: Candidate) => (c.tags.length ? c.tags.map((t) => `#${t}`).join(" ") : "—") },
                      { label: "Your notes", render: (c: Candidate) => (c.notes.length ? c.notes.join(" · ") : "—") },
                      { label: "Radar", render: (c: Candidate) => CONSENT_LABEL[consent[c.personId] ?? "not-asked"] },
                    ].map((row) => (
                      <tr key={row.label}>
                        <th scope="row" className="p-2 align-top text-xs font-semibold uppercase tracking-[0.06em] text-grey-700">{row.label}</th>
                        {compareIds.map((cid) => {
                          const c = cands.find((x) => x.id === cid)!;
                          return <td key={cid} className="p-2 align-top text-grey-800">{row.render(c)}</td>;
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      )}

      {tab === "radar" && (
        <div role="tabpanel" id={`${id}-panel-radar`} aria-labelledby={`${id}-tab-radar`} className="flex flex-col gap-4">
          <Notice tone="private" title="Only artists who said yes">
            The radar holds profiles of artists who consented to be kept for future opportunities. They can withdraw at any time and will disappear from this list. They never see that they&apos;re on it ranked or scored — because they aren&apos;t.
          </Notice>
          {radarNote && <p aria-live="polite" className="text-sm font-semibold text-verified">{radarNote}</p>}
          {radar.length === 0 ? (
            <EmptyState title="No one on your radar yet" description="Ask applicants for consent from their candidate panel." />
          ) : (
            <ul className="grid gap-4 md:grid-cols-2">
              {radar.map((r) => {
                const p = getPerson(r.personId);
                const fromPast = pastRadar.some((x) => x.personId === r.personId);
                return (
                  <Card as="li" key={r.personId} className="flex flex-col gap-3 p-5">
                    <div className="flex items-center gap-3">
                      <Avatar name={p.name} size="md" verified={p.verified} />
                      <div className="min-w-0">
                        <Link href={`/people/${p.id}`} className="font-semibold text-green-950 hover:underline">{p.name}</Link>
                        <p className="text-xs text-grey-700">{p.title} · {p.city}, {p.country}</p>
                      </div>
                    </div>
                    <p className="text-sm text-grey-800">{r.why}</p>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-grey-700">
                      <Badge tone="green">Consented {r.since}</Badge>
                      <span>From: {r.from}</span>
                    </div>
                    <div className="mt-auto flex flex-wrap gap-2">
                      <Button size="sm" variant="outline" onClick={() => setRadarNote(`${p.name.split(" ")[0]} will be invited when your next call opens — they'll see it as a personal invitation, not a feed post.`)}>
                        Invite to next call
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          if (fromPast) setPastRadar((prev) => prev.filter((x) => x.personId !== r.personId));
                          else setCands((prev) => prev.map((c) => (c.personId === r.personId ? { ...c, keepOnRadar: false } : c)));
                          setRadarNote(`${p.name} removed from your radar.`);
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </ul>
          )}
          <p className="text-center text-sm text-grey-700">That&apos;s everyone on your radar.</p>
        </div>
      )}
    </div>
  );
}

/* ---------- Candidate detail ---------- */

function CandidateDetail({
  cand,
  headingRef,
  consent,
  onConsent,
  onUpdate,
  onClose,
}: {
  cand: Candidate;
  headingRef: RefObject<HTMLHeadingElement | null>;
  consent: Consent;
  onConsent: (state: Consent) => void;
  onUpdate: (patch: Partial<Candidate>) => void;
  onClose: () => void;
}) {
  const id = useId();
  const p = getPerson(cand.personId);
  const first = p.name.split(" ")[0];
  const [tag, setTag] = useState("");
  const [note, setNote] = useState("");
  const [stage, setStage] = useState<CandidateStage>(cand.stage);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteItems, setInviteItems] = useState<string[]>([]);

  const say = (text: string) => setFeedback(text);

  return (
    <Card as="section" className="p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Avatar name={p.name} size="lg" verified={p.verified} />
          <div className="min-w-0">
            <h2 ref={headingRef} tabIndex={-1} className="scroll-mt-24 font-playfair text-2xl font-semibold text-green-950 outline-none">{p.name}</h2>
            <p className="text-sm text-grey-700">{p.title} · {p.city}, {p.country}</p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <TrustLabel source={p.verified ? "verified" : "self-declared"} compact />
              <span className="text-xs text-grey-700">{p.verified ? "Identity verified" : "Identity self-declared"}</span>
              <Link href={`/people/${p.id}`} className="text-xs font-semibold text-green-950 underline underline-offset-2">Full profile</Link>
            </div>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose} icon={<CloseSquare size={16} color="currentColor" aria-hidden />}>Close</Button>
      </div>

      {feedback && (
        <p aria-live="polite" className="mt-4 flex items-start gap-2 rounded-[4px] bg-verified-bg p-3 text-sm text-verified">
          <TickCircle size={18} variant="Bold" color="currentColor" className="mt-0.5 shrink-0" aria-hidden /> {feedback}
        </p>
      )}

      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex min-w-0 flex-col gap-6">
          <section aria-labelledby={`${id}-works`}>
            <h3 id={`${id}-works`} className="font-playfair text-lg font-semibold text-green-950">Works submitted</h3>
            <ul className="mt-3 grid grid-cols-2 gap-3">
              {cand.works.map((w) => (
                <li key={w.title}>
                  <Media src={w.image} alt={`${w.title} by ${p.name}, ${w.medium}`} ratio="4/5" sizes="(max-width: 1024px) 50vw, 300px" className="rounded-[4px]" />
                  <p className="mt-1.5 text-sm font-semibold text-green-950">{w.title}</p>
                  <p className="text-xs text-grey-700">{w.medium}</p>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby={`${id}-statement`}>
            <h3 id={`${id}-statement`} className="font-playfair text-lg font-semibold text-green-950">Statement</h3>
            <blockquote className="mt-2 border-l-2 border-gold-400 pl-3 font-playfair text-lg italic text-green-950">“{cand.statement}”</blockquote>
          </section>

          <section aria-labelledby={`${id}-elig`}>
            <h3 id={`${id}-elig`} className="font-playfair text-lg font-semibold text-green-950">Eligibility checks</h3>
            <ul className="mt-2 flex flex-col gap-2">
              {cand.eligibility.map((e) => (
                <li key={e.rule} className="flex flex-wrap items-center gap-2 text-sm">
                  {e.pass ? <TickCircle size={18} variant="Bold" color="var(--color-verified)" aria-hidden /> : <CloseCircle size={18} variant="Bold" color="var(--color-alert)" aria-hidden />}
                  <span className={e.pass ? "text-grey-800" : "font-semibold text-alert"}>
                    <span className="sr-only">{e.pass ? "Pass: " : "Fail: "}</span>{e.rule}
                  </span>
                  <TrustLabel source={e.rule.includes("resident") && p.verified ? "verified" : "self-declared"} compact />
                </li>
              ))}
            </ul>
            {!allPass(cand) && <p className="mt-2 text-xs text-grey-700">A failed check is a prompt to look, not an automatic decline. You decide.</p>}
          </section>
        </div>

        <div className="flex flex-col gap-6">
          <section aria-labelledby={`${id}-actions`} className="flex flex-col gap-3">
            <h3 id={`${id}-actions`} className="font-playfair text-lg font-semibold text-green-950">Decide</h3>
            <div className="flex gap-2">
              <label htmlFor={`${id}-stage`} className="sr-only">Move to stage</label>
              <select id={`${id}-stage`} value={stage} onChange={(e) => setStage(e.target.value as CandidateStage)} className={inputCls}>
                {PIPELINE.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
              <Button
                size="sm"
                className="h-auto"
                disabled={stage === cand.stage}
                onClick={() => {
                  onUpdate({ stage });
                  say(`Moved to ${stageLabel(stage)}. ${first} will see the new stage on their Applications page — send a status update to add a personal note.`);
                }}
              >
                Move
              </Button>
            </div>

            {inviteOpen ? (
              <fieldset className="flex flex-col gap-2 rounded-[4px] border border-sand-200 p-3">
                <legend className="px-1 text-sm font-semibold text-green-950">Ask {first} for…</legend>
                {["Process images or sketches", "A short studio video", "Dimensions and framing", "Availability for a studio conversation"].map((item) => (
                  <label key={item} className="flex items-center gap-2 text-sm text-grey-800">
                    <input type="checkbox" checked={inviteItems.includes(item)} onChange={() => setInviteItems((prev) => (prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item]))} className="accent-green-950" />
                    {item}
                  </label>
                ))}
                <div className="flex gap-2">
                  <Button size="sm" disabled={inviteItems.length === 0} onClick={() => { setInviteOpen(false); say(`Invitation sent. ${first} is asked for: ${inviteItems.join(", ").toLowerCase()}. They have 7 days and can reply from their Applications page.`); setInviteItems([]); }}>Send request</Button>
                  <Button size="sm" variant="ghost" onClick={() => setInviteOpen(false)}>Cancel</Button>
                </div>
              </fieldset>
            ) : (
              <Button variant="outline" size="sm" onClick={() => setInviteOpen(true)}>Invite additional material</Button>
            )}
          </section>

          <section aria-labelledby={`${id}-radar`} className="rounded-[4px] bg-sand-100 p-4">
            <div className="flex items-center gap-2">
              <Radar size={18} color="currentColor" className="text-green-950" aria-hidden />
              <h3 id={`${id}-radar`} className="text-sm font-semibold text-green-950">Future-opportunity radar</h3>
            </div>
            <p className="mt-2 flex flex-wrap items-center gap-2 text-sm">
              <Badge tone={CONSENT_TONE[consent]}>{CONSENT_LABEL[consent]}</Badge>
              {RADAR_CONSENT[p.id]?.date && consent !== "requested" && <span className="text-xs text-grey-700">on {RADAR_CONSENT[p.id]!.date}</span>}
            </p>
            {consent === "granted" && (
              <label className="mt-3 flex items-start gap-2 text-sm text-grey-800">
                <input type="checkbox" checked={cand.keepOnRadar} onChange={(e) => { onUpdate({ keepOnRadar: e.target.checked }); say(e.target.checked ? `${first} kept on your radar for future calls.` : `${first} removed from your radar.`); }} className="mt-1 accent-green-950" />
                Keep {first} on my radar for future calls
              </label>
            )}
            {consent === "not-asked" && (
              <div className="mt-3 flex flex-col gap-2">
                <p className="text-xs text-grey-700">You can only keep a profile if {first} agrees. Nothing is saved until then.</p>
                <Button size="sm" variant="outline" className="self-start" onClick={() => { onConsent("requested"); say(`Consent request sent to ${first}. They'll decide from their Trust settings; you'll see the answer here.`); }}>Ask for consent</Button>
              </div>
            )}
            {consent === "requested" && <p className="mt-2 text-xs text-grey-700">Waiting for {first}&apos;s answer. You can&apos;t keep the profile until they say yes.</p>}
            {consent === "declined" && <p className="mt-2 text-xs text-grey-700">{first} chose not to be kept for future opportunities. Their data leaves your desk when this call closes.</p>}
          </section>

          <section aria-labelledby={`${id}-tags`}>
            <h3 id={`${id}-tags`} className="text-sm font-semibold text-green-950">Tags</h3>
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {cand.tags.length === 0 && <li className="text-xs text-grey-700">No tags yet.</li>}
              {cand.tags.map((t) => (
                <li key={t} className="inline-flex items-center gap-1 rounded-full bg-sand-100 py-1 pl-2.5 pr-1 text-xs text-green-950">
                  #{t}
                  <button type="button" onClick={() => onUpdate({ tags: cand.tags.filter((x) => x !== t) })} className="cursor-pointer rounded-full p-0.5 hover:bg-sand-200" aria-label={`Remove tag ${t}`}>
                    <CloseCircle size={14} color="currentColor" aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
            <form
              className="mt-2 flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                const t = tag.trim().toLowerCase().replace(/^#/, "");
                if (t && !cand.tags.includes(t)) onUpdate({ tags: [...cand.tags, t] });
                setTag("");
              }}
            >
              <label htmlFor={`${id}-tag`} className="sr-only">New tag</label>
              <input id={`${id}-tag`} value={tag} onChange={(e) => setTag(e.target.value)} placeholder="e.g. strong colour" className={inputCls} />
              <Button type="submit" size="sm" variant="outline" className="h-auto" icon={<Add size={16} color="currentColor" aria-hidden />}>Add</Button>
            </form>
          </section>

          <section aria-labelledby={`${id}-notes`}>
            <div className="flex items-center gap-1.5">
              <Lock1 size={14} color="currentColor" className="text-calm" aria-hidden />
              <h3 id={`${id}-notes`} className="text-sm font-semibold text-green-950">Private notes</h3>
            </div>
            <p className="text-xs text-grey-700">Only you and co-reviewers see these. Never shared with {first}.</p>
            <ul className="mt-2 flex flex-col gap-1.5">
              {cand.notes.length === 0 && <li className="text-xs text-grey-700">No notes yet.</li>}
              {cand.notes.map((n, i) => <li key={`${i}-${n}`} className="rounded-[4px] bg-calm-bg p-2 text-sm text-grey-800">{n}</li>)}
            </ul>
            <form
              className="mt-2 flex flex-col gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (!note.trim()) return;
                onUpdate({ notes: [...cand.notes, note.trim()] });
                setNote("");
              }}
            >
              <label htmlFor={`${id}-note`} className="sr-only">Add a private note</label>
              <textarea id={`${id}-note`} rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a private note…" className={inputCls} />
              <Button type="submit" size="sm" variant="outline" className="self-start">Save note</Button>
            </form>
          </section>
        </div>
      </div>
    </Card>
  );
}

/* ---------- Status update composer ---------- */

function StatusComposer({ call, cands, onClose }: { call: OpenCall; cands: Candidate[]; onClose: () => void }) {
  const id = useId();
  const [stage, setStage] = useState<CandidateStage>("longlist");
  const [body, setBody] = useState(TEMPLATES.longlist);
  const [sent, setSent] = useState<string | null>(null);
  const recipients = cands.filter((c) => c.stage === stage).map((c) => getPerson(c.personId));
  const callName = call.title.split(":")[0];

  return (
    <Card as="section" tone="sand" className="p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-playfair text-lg font-semibold text-green-950">Send a status update</h2>
        <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>
      </div>
      <p className="mt-1 text-sm text-grey-700">Everyone at a stage gets a personal copy. Nobody sees who else received it.</p>
      <div className="mt-4 grid gap-4 md:grid-cols-[220px_minmax(0,1fr)]">
        <div className="flex flex-col gap-3">
          <div>
            <label htmlFor={`${id}-stage`} className="text-sm font-semibold text-green-950">Stage</label>
            <select
              id={`${id}-stage`}
              value={stage}
              onChange={(e) => {
                const s = e.target.value as CandidateStage;
                setStage(s);
                setBody(TEMPLATES[s]);
                setSent(null);
              }}
              className={cn(inputCls, "mt-1.5")}
            >
              {PIPELINE.map((s) => <option key={s.id} value={s.id}>{s.label} ({cands.filter((c) => c.stage === s.id).length})</option>)}
            </select>
          </div>
          <div>
            <p className="text-sm font-semibold text-green-950">To</p>
            {recipients.length === 0 ? (
              <p className="mt-1 text-xs text-grey-700">No one is at this stage.</p>
            ) : (
              <ul className="mt-1.5 flex flex-col gap-1.5">
                {recipients.map((r) => (
                  <li key={r.id} className="flex items-center gap-2 text-sm text-grey-800"><Avatar name={r.name} size="xs" /> {r.name}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <div>
          <label htmlFor={`${id}-body`} className="text-sm font-semibold text-green-950">Message</label>
          <textarea id={`${id}-body`} rows={7} value={body} onChange={(e) => setBody(e.target.value)} className={cn(inputCls, "mt-1.5")} />
          <p className="mt-1 text-xs text-grey-700">
            <code>{"{first_name}"}</code> and <code>{"{call}"}</code> are filled in for each person — e.g. “{body.replace("{first_name}", recipients[0]?.name.split(" ")[0] ?? "Kwame").replace("{call}", callName).split("\n")[0]}”
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <Button
              size="sm"
              disabled={recipients.length === 0 || !body.trim()}
              icon={<Send2 size={16} color="currentColor" aria-hidden />}
              onClick={() => setSent(`Sent to ${recipients.length} ${recipients.length === 1 ? "applicant" : "applicants"} at ${stageLabel(stage)}: ${recipients.map((r) => r.name).join(", ")}. It appears in their Applications history today.`)}
            >
              Send to {recipients.length} {recipients.length === 1 ? "person" : "people"}
            </Button>
          </div>
          {sent && <p aria-live="polite" className="mt-3 text-sm font-semibold text-verified">{sent}</p>}
        </div>
      </div>
    </Card>
  );
}
