"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Avatar from "@/components/ui/Avatar";
import Photo from "@/components/ui/Photo";
import { useBanters } from "./useBanters";
import {
  BANTER_AUDIENCES,
  BANTER_FORMATS,
  BANTER_LIFETIMES,
  BANTER_MOODS,
  BANTER_TYPES,
  toneCheck,
  type Banter,
  type BanterAudience,
  type BanterFormat,
  type BanterLifetime,
  type BanterMood,
  type BanterType,
} from "@/lib/data/banter";
import { CIRCLES } from "@/lib/data/community";
import type { PhotoKey } from "@/lib/data/images";
import { allPeople, ME, type PersonId } from "@/lib/data/people";
import { newId } from "@/lib/useLocal";

const STEPS = ["What", "Who", "Mood", "How long", "Post"];
const PHOTOS: PhotoKey[] = ["studioEasel", "paintingWoman", "clayBowl", "textileHang", "galleryHall", "talkGroup"];
const others = allPeople.filter((p) => p.id !== ME.id);

/** Format suggests a Banter type, so the list filters sensibly without asking another question. */
const TYPE_FOR: Partial<Record<BanterFormat, BanterType>> = { debate: "debate", wip: "creative", honest: "creative", story: "memory", celebrate: "celebration", photo: "everyday" };

export default function StartBanter() {
  const router = useRouter();
  const { add } = useBanters();
  const [step, setStep] = useState(0);
  const [format, setFormat] = useState<BanterFormat>("ask");
  const [prompt, setPrompt] = useState("");
  const [photo, setPhoto] = useState<PhotoKey | undefined>();
  const [audience, setAudience] = useState<BanterAudience>("circle");
  const [circle, setCircle] = useState(CIRCLES[0].id);
  const [people, setPeople] = useState<PersonId[]>([]);
  const [mood, setMood] = useState<BanterMood>("fun");
  const [lifetime, setLifetime] = useState<BanterLifetime>("24h");
  const [type, setType] = useState<BanterType>("everyday");
  const [softened, setSoftened] = useState(false);

  const needsPeople = audience === "one" || audience === "selected";
  const flagged = toneCheck(prompt) && !softened;
  const canNext = step === 0 ? prompt.trim().length > 4 : step === 1 ? (!needsPeople || people.length > 0) : true;

  const togglePerson = (id: PersonId) =>
    setPeople((cur) => (audience === "one" ? [id] : cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));

  const audienceLabel = () => {
    if (audience === "one") return people[0] ? allPeople.find((p) => p.id === people[0])!.name : "One person";
    if (audience === "selected") return `${people.length} people`;
    if (audience === "circle") return CIRCLES.find((c) => c.id === circle)!.name;
    if (audience === "circles") return "Related KinCircles";
    return "Wider Akines community";
  };

  const post = () => {
    const b: Banter = {
      id: newId("banter"),
      by: ME.id as PersonId,
      format,
      type,
      mood,
      audience,
      audienceLabel: audienceLabel(),
      lifetime,
      prompt: prompt.trim(),
      photo,
      ago: "now",
      reactions: {},
      replies: [],
      mine: true,
    };
    add(b);
    router.push(`/banter/${b.id}`);
  };

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <div className="flex items-center justify-between">
        <Link href="/banter" className="text-[13px] text-mute hover:text-ink-900">← Banter</Link>
        <p className="text-[12px] text-mute">Step {step + 1} of {STEPS.length}</p>
      </div>
      <div>
        <p className="eyebrow text-clay-600">Start a Banter</p>
        <h1 className="font-display mt-1 text-[34px] leading-tight">{["What would you like to say?", "Who should hear it?", "Set the mood", "Let it live, or let it go", "Ready to post"][step]}</h1>
      </div>

      <ol className="flex gap-1.5" aria-label="Progress">
        {STEPS.map((s, i) => <li key={s} className={`h-1.5 flex-1 rounded-full ${i <= step ? "bg-night" : "bg-paper-300"}`} aria-label={s} />)}
      </ol>

      <section className="rounded-[22px] border border-line bg-paper-50 p-5 sm:p-6">
        {step === 0 && (
          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
              {BANTER_FORMATS.map((f) => (
                <button key={f.id} onClick={() => { setFormat(f.id); if (TYPE_FOR[f.id]) setType(TYPE_FOR[f.id]!); }} className={`flex flex-col items-start gap-1.5 rounded-xl border p-3 text-left text-[12.5px] leading-tight ${format === f.id ? "border-ink-900 bg-ink-900 text-white" : "border-line bg-white hover:border-ink-400"}`}>
                  <span className="text-[16px]" aria-hidden>{f.glyph}</span>
                  {f.label}
                </button>
              ))}
            </div>
            <label className="flex flex-col gap-1.5 text-[13px] font-semibold">
              Your Banter
              <textarea value={prompt} onChange={(e) => { setPrompt(e.target.value); setSoftened(false); }} rows={3} placeholder="Be honest: should I keep this painting unfinished, or am I simply tired?" className="resize-none rounded-xl border border-line bg-white px-4 py-3 text-[16px] font-normal outline-none focus:border-ink-900" />
            </label>
            {(format === "photo" || format === "wip") && (
              <div>
                <p className="text-[13px] font-semibold">Add a photograph</p>
                <div className="mt-2 grid grid-cols-6 gap-2">
                  {PHOTOS.map((k) => (
                    <button key={k} onClick={() => setPhoto(photo === k ? undefined : k)} className={`overflow-hidden rounded-lg ring-2 ${photo === k ? "ring-ink-900" : "ring-transparent"}`} aria-pressed={photo === k}>
                      <Photo name={k} ratio="1" sizes="100px" />
                    </button>
                  ))}
                </div>
              </div>
            )}
            {format === "voice" && <p className="rounded-xl bg-paper-200 px-4 py-3 text-[13px] text-mute">◉ You can record your voice note after posting. Write a one-line prompt so people know what it&apos;s about.</p>}
          </div>
        )}

        {step === 1 && (
          <div className="flex flex-col gap-4">
            <div className="grid gap-2 sm:grid-cols-2">
              {BANTER_AUDIENCES.map((a) => (
                <button key={a.id} onClick={() => { setAudience(a.id); setPeople([]); }} className={`rounded-xl border p-3.5 text-left ${audience === a.id ? "border-ink-900 bg-ink-900 text-white" : "border-line bg-white hover:border-ink-400"}`}>
                  <p className="text-[14px] font-semibold">{a.label}</p>
                  <p className={`mt-0.5 text-[12px] ${audience === a.id ? "text-white/70" : "text-mute"}`}>{a.body}</p>
                </button>
              ))}
            </div>
            {needsPeople && (
              <div className="flex flex-wrap gap-2">
                {others.map((p) => (
                  <button key={p.id} onClick={() => togglePerson(p.id as PersonId)} className={`flex items-center gap-2 rounded-full border py-1 pr-3 pl-1 text-[12.5px] ${people.includes(p.id as PersonId) ? "border-ink-900 bg-ink-900 text-white" : "border-line bg-white"}`}>
                    <Avatar person={p} size={24} />{p.name}
                  </button>
                ))}
              </div>
            )}
            {audience === "circle" && (
              <select value={circle} onChange={(e) => setCircle(e.target.value)} className="rounded-xl border border-line bg-white px-4 py-3 text-[14px]">
                {CIRCLES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            )}
            {audience === "community" && <p className="rounded-xl bg-paper-200 px-4 py-3 text-[12.5px] text-mute">Wider-community Banter works best for safe, constructive subjects. Keep personal or sensitive things within trusted circles.</p>}
          </div>
        )}

        {step === 2 && (
          <div className="grid gap-2 sm:grid-cols-2">
            {BANTER_MOODS.map((m) => (
              <button key={m.id} onClick={() => setMood(m.id)} className={`flex items-center justify-between gap-3 rounded-xl border p-3.5 text-left ${mood === m.id ? "border-ink-900 ring-1 ring-ink-900" : "border-line bg-white hover:border-ink-400"}`}>
                <span>
                  <span className={`inline-block rounded-full px-2.5 py-1 text-[12px] font-semibold ${m.tone}`}>{m.label}</span>
                  <span className="mt-1.5 block text-[12px] text-mute">{m.hint}</span>
                </span>
                {mood === m.id && <span aria-hidden>✓</span>}
              </button>
            ))}
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              {BANTER_LIFETIMES.map((l) => (
                <label key={l.id} className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3.5 ${lifetime === l.id ? "border-ink-900" : "border-line bg-white"}`}>
                  <input type="radio" name="life" checked={lifetime === l.id} onChange={() => setLifetime(l.id)} className="accent-ink-900" />
                  <span className="text-[14px]">{l.label}</span>
                </label>
              ))}
            </div>
            <p className="text-[12.5px] text-mute">Most casual Banter should naturally expire. Anything important can be saved as an insight before it ends.</p>
            <div>
              <p className="text-[13px] font-semibold">What kind of Banter is it?</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {BANTER_TYPES.map((t) => (
                  <button key={t.id} onClick={() => setType(t.id)} className={`rounded-full border px-3 py-1.5 text-[12.5px] ${type === t.id ? "border-ink-900 bg-ink-900 text-white" : "border-line bg-white"}`}>{t.label}</button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="flex flex-col gap-4">
            <div className="rounded-xl border border-line bg-white p-4">
              <p className="text-[12px] text-mute">{BANTER_FORMATS.find((f) => f.id === format)!.label} · {audienceLabel()}</p>
              <p className="mt-2 text-[17px] font-semibold">{prompt}</p>
              <div className="mt-3 flex flex-wrap gap-2 text-[11.5px]">
                <span className={`rounded-full px-2.5 py-1 font-semibold ${BANTER_MOODS.find((m) => m.id === mood)!.tone}`}>{BANTER_MOODS.find((m) => m.id === mood)!.label}</span>
                <span className="rounded-full border border-line px-2.5 py-1 text-mute">{BANTER_LIFETIMES.find((l) => l.id === lifetime)!.short}</span>
              </div>
            </div>
            {flagged ? (
              <div className="rounded-xl border border-ochre-400 bg-ochre-200/50 p-4">
                <p className="text-[13.5px] font-semibold">This could sound personal rather than playful.</p>
                <p className="mt-1 text-[12.5px] text-ink-700">Would you like to soften the wording? Humour lands differently across ages, countries and languages.</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button onClick={() => setStep(0)} className="rounded-full bg-night px-4 py-2 text-[12.5px] font-semibold text-white">Edit the wording</button>
                  <button onClick={() => setSoftened(true)} className="rounded-full border border-ink-900/30 px-4 py-2 text-[12.5px] font-semibold">It&apos;s fine, post anyway</button>
                </div>
              </div>
            ) : (
              <p className="flex items-center gap-2 text-[12.5px] text-mute"><span aria-hidden>✦</span> Akines read it for tone. It reads as warm and clear.</p>
            )}
          </div>
        )}
      </section>

      <div className="flex justify-between">
        <button onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0} className="rounded-full px-5 py-3 text-[14px] font-semibold text-mute hover:text-ink-900 disabled:opacity-0">Back</button>
        {step < STEPS.length - 1 ? (
          <button onClick={() => setStep((s) => s + 1)} disabled={!canNext} className="rounded-full bg-night px-7 py-3 text-[14px] font-semibold text-white disabled:opacity-40">Continue</button>
        ) : (
          <button onClick={post} disabled={flagged} className="rounded-full bg-ochre-400 px-7 py-3 text-[14px] font-semibold text-ink-950 hover:bg-ochre-300 disabled:opacity-40">Post Banter</button>
        )}
      </div>
    </div>
  );
}
