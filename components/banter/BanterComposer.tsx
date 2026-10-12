"use client";

import { useEffect, useState } from "react";
import Avatar from "@/components/ui/Avatar";
import Photo from "@/components/ui/Photo";
import {
  BANTER_LIFETIMES,
  BANTER_MOODS,
  BANTER_TYPES,
  PROMPT_SPARKS,
  RECIPIENT_REASON,
  softenWording,
  toneCheck,
  type Banter,
  type BanterLifetime,
  type BanterMood,
  type BanterType,
} from "@/lib/data/banter";
import { CLIQS } from "@/lib/data/cliqs";
import { CIRCLES } from "@/lib/data/community";
import type { PhotoKey } from "@/lib/data/images";
import { allPeople, ME, PEOPLE, type PersonId } from "@/lib/data/people";
import { newId } from "@/lib/useLocal";

type Attach = "photo" | "voice" | "poll" | "music" | "video" | null;
type AudienceKey = `cliq:${string}` | `circle:${string}` | "people" | "suggested" | "community";

const PHOTOS: PhotoKey[] = ["studioEasel", "paintingWoman", "clayBowl", "textileHang", "galleryHall", "talkGroup"];
const others = allPeople.filter((p) => p.id !== ME.id).map((p) => p.id as PersonId);
const SUGGESTED: PersonId[] = ["wanjiru", "efua", "kwame", "thandi"];

/** Who an audience reaches, plus the plain reason Akines gives each of them. */
function recipients(a: AudienceKey, picked: PersonId[]): { list: PersonId[]; label: string; kind: Banter["audience"]; reach: number } {
  if (a.startsWith("cliq:")) {
    const c = CLIQS.find((x) => `cliq:${x.id}` === a)!;
    return { list: c.people, label: c.name, kind: "selected", reach: c.people.length };
  }
  if (a.startsWith("circle:")) {
    const c = CIRCLES.find((x) => `circle:${x.id}` === a)!;
    const list = others.slice(0, 6);
    return { list, label: c.name, kind: "circle", reach: 12 };
  }
  if (a === "people") return { list: picked, label: picked.length === 1 ? PEOPLE[picked[0]].name : `${picked.length} people`, kind: picked.length === 1 ? "one" : "selected", reach: picked.length };
  if (a === "suggested") return { list: SUGGESTED, label: "Suggested people", kind: "selected", reach: SUGGESTED.length };
  return { list: others.slice(0, 5), label: "Wider Akines community", kind: "community", reach: 120 };
}

export default function BanterComposer({ onPost }: { onPost: (b: Banter) => void }) {
  const [prompt, setPrompt] = useState("");
  const [type, setType] = useState<BanterType>("creative");
  const [sparks, setSparks] = useState(false);
  const [mood, setMood] = useState<BanterMood>("honest");
  const [audience, setAudience] = useState<AudienceKey>(`cliq:${CLIQS[0].id}`);
  const [picked, setPicked] = useState<PersonId[]>([]);
  const [lifetime, setLifetime] = useState<BanterLifetime>("3d");
  const [attach, setAttach] = useState<Attach>(null);
  const [photo, setPhoto] = useState<PhotoKey | undefined>();
  const [poll, setPoll] = useState(["", ""]);
  const [media, setMedia] = useState("");
  const [voice, setVoice] = useState<string | null>(null);
  const [recording, setRecording] = useState(0);
  const [keepTone, setKeepTone] = useState(false);
  const [showWhy, setShowWhy] = useState(false);

  useEffect(() => {
    if (!recording) return;
    const t = setInterval(() => setRecording((r) => r + 1), 1000);
    return () => clearInterval(t);
  }, [recording]);

  const r = recipients(audience, picked);
  const flagged = toneCheck(prompt) && !keepTone;
  const pollOptions = poll.map((o) => o.trim()).filter(Boolean);
  const mood0 = BANTER_MOODS.find((m) => m.id === mood)!;
  const ready = prompt.trim().length > 4 && r.list.length > 0 && !flagged && (attach !== "poll" || pollOptions.length >= 2);

  const toggleAttach = (a: Attach) => setAttach((cur) => (cur === a ? null : a));
  const togglePick = (id: PersonId) => setPicked((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));

  const post = () => {
    onPost({
      id: newId("banter"),
      by: ME.id as PersonId,
      format: attach === "poll" ? "ask" : attach === "photo" ? "photo" : attach === "voice" ? "voice" : "ask",
      type,
      mood,
      audience: r.kind,
      audienceLabel: r.label,
      lifetime,
      prompt: prompt.trim(),
      photo: attach === "photo" ? photo : undefined,
      poll: attach === "poll" ? { options: pollOptions, votes: pollOptions.map(() => 0) } : undefined,
      media: (attach === "music" || attach === "video") && media.trim() ? { kind: attach, label: media.trim() } : undefined,
      replies: voice ? [{ id: newId("r"), by: ME.id as PersonId, kind: "voice", length: voice, text: "My voice note on this.", ago: "now" }] : [],
      reactions: {},
      resonance: [],
      reach: r.reach,
      ago: "now",
      mine: true,
    });
    setPrompt("");
    setAttach(null);
    setPhoto(undefined);
    setPoll(["", ""]);
    setMedia("");
    setVoice(null);
    setKeepTone(false);
  };

  const chip = (on: boolean) => `rounded-full border px-3.5 py-1.5 text-[12.5px] transition-colors ${on ? "border-ink-950 bg-ink-950 text-white" : "border-line bg-white text-ink-800 hover:border-ink-400"}`;

  return (
    <div id="compose" className="grid scroll-mt-24 gap-4 lg:grid-cols-[1fr_340px]">
      <section className="rounded-[22px] border border-line bg-paper-50 p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-[21px]">What is genuinely on your mind?</h2>
          <span className="text-[10.5px] font-bold tracking-[0.14em] text-clay-600 uppercase">Intentional sharing</span>
        </div>

        <div className="mt-3 rounded-2xl border border-line bg-white focus-within:border-ink-900">
          <textarea value={prompt} onChange={(e) => { setPrompt(e.target.value); setKeepTone(false); }} rows={3} placeholder="Can an unfinished artwork still be honest?" className="w-full resize-none rounded-2xl bg-transparent px-4 pt-3.5 text-[17px] outline-none" aria-label="Your Banter" />
          <div className="flex flex-wrap items-center gap-1 border-t border-line px-2 py-1.5">
            {([
              ["photo", "▣", "Photo"],
              ["voice", "◉", "Voice note"],
              ["poll", "≡", "Poll"],
              ["music", "♪", "Song"],
              ["video", "▶", "Short video"],
            ] as const).map(([k, g, label]) => (
              <button key={k} onClick={() => toggleAttach(k)} aria-pressed={attach === k} className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] ${attach === k ? "bg-ink-950 text-white" : "text-ink-700 hover:bg-paper-200"}`}>
                <span aria-hidden>{g}</span>{label}
              </button>
            ))}
            <button onClick={() => setSparks((s) => !s)} className="ml-auto flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold text-ink-900 hover:bg-paper-200"><span aria-hidden>✦</span> Spark an idea</button>
          </div>
        </div>

        {/* Attachments */}
        {attach === "photo" && (
          <div className="mt-3 grid grid-cols-6 gap-2">
            {PHOTOS.map((k) => (
              <button key={k} onClick={() => setPhoto(photo === k ? undefined : k)} aria-pressed={photo === k} className={`overflow-hidden rounded-lg ring-2 ${photo === k ? "ring-ink-950" : "ring-transparent"}`}><Photo name={k} ratio="1" sizes="90px" /></button>
            ))}
          </div>
        )}
        {attach === "voice" && (
          <div className="mt-3 flex items-center gap-3 rounded-xl bg-paper-200 px-4 py-2.5 text-[13px]">
            {recording ? (
              <>
                <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-clay-500" />
                <span className="flex-1">Recording… 0:{String(recording - 1).padStart(2, "0")}</span>
                <button onClick={() => { setVoice(`0:${String(Math.max(recording - 1, 1)).padStart(2, "0")}`); setRecording(0); }} className="rounded-full bg-ink-950 px-3.5 py-1.5 font-semibold text-white">Done</button>
              </>
            ) : voice ? (
              <>
                <span className="flex-1">◉ Voice note ready · {voice}</span>
                <button onClick={() => setVoice(null)} className="text-mute hover:text-ink-900">Remove</button>
              </>
            ) : (
              <>
                <span className="flex-1 text-mute">Say it out loud. It's attached as the first response.</span>
                <button onClick={() => setRecording(1)} className="rounded-full bg-ink-950 px-3.5 py-1.5 font-semibold text-white">Record</button>
              </>
            )}
          </div>
        )}
        {attach === "poll" && (
          <div className="mt-3 flex flex-col gap-2">
            {poll.map((o, i) => (
              <input key={i} value={o} onChange={(e) => setPoll((p) => p.map((x, j) => (j === i ? e.target.value : x)))} placeholder={`Option ${i + 1}`} className="rounded-xl border border-line bg-white px-4 py-2 text-[14px] outline-none focus:border-ink-900" />
            ))}
            {poll.length < 4 && <button onClick={() => setPoll((p) => [...p, ""])} className="self-start text-[12.5px] font-semibold text-ink-700">＋ Add option</button>}
          </div>
        )}
        {(attach === "music" || attach === "video") && (
          <input value={media} onChange={(e) => setMedia(e.target.value)} placeholder={attach === "music" ? "Song and artist, e.g. Angélique Kidjo · Agolo" : "Describe your short clip, e.g. 20s of the dye vat"} className="mt-3 w-full rounded-xl border border-line bg-white px-4 py-2.5 text-[14px] outline-none focus:border-ink-900" />
        )}

        {sparks && (
          <div className="mt-3 rounded-2xl bg-paper-200 p-3">
            <div className="flex flex-wrap gap-1.5">
              {BANTER_TYPES.map((t) => <button key={t.id} onClick={() => setType(t.id)} className={chip(type === t.id)}>{t.label}</button>)}
            </div>
            <ul className="mt-2.5 flex flex-col gap-1">
              {PROMPT_SPARKS[type].map((s) => (
                <li key={s}><button onClick={() => { setPrompt(s); setSparks(false); }} className="w-full rounded-lg px-2.5 py-1.5 text-left text-[13.5px] hover:bg-paper-50">“{s}”</button></li>
              ))}
            </ul>
          </div>
        )}

        {/* Tone check, live */}
        {flagged && (
          <div className="mt-3 rounded-xl border border-ochre-400 bg-ochre-200/50 p-3.5 text-[13px]">
            <p className="font-semibold">This could sound personal rather than playful.</p>
            <p className="mt-0.5 text-ink-700">Suggested: “{softenWording(prompt)}”</p>
            <div className="mt-2.5 flex gap-2">
              <button onClick={() => setPrompt(softenWording(prompt))} className="rounded-full bg-ink-950 px-3.5 py-1.5 text-[12.5px] font-semibold text-white">Use calmer wording</button>
              <button onClick={() => setKeepTone(true)} className="rounded-full border border-ink-900/30 px-3.5 py-1.5 text-[12.5px] font-semibold">Keep mine</button>
            </div>
          </div>
        )}

        {/* Mood */}
        <p className="mt-5 text-[12px] font-semibold text-mute">Set the mood</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {BANTER_MOODS.map((m) => <button key={m.id} onClick={() => setMood(m.id)} className={chip(mood === m.id)}>{m.label}</button>)}
        </div>

        {/* Audience */}
        <p className="mt-4 text-[12px] font-semibold text-mute">Share with</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {CLIQS.map((c) => <button key={c.id} onClick={() => setAudience(`cliq:${c.id}`)} className={chip(audience === `cliq:${c.id}`)}>{c.name}</button>)}
          {CIRCLES.slice(0, 2).map((c) => <button key={c.id} onClick={() => setAudience(`circle:${c.id}`)} className={chip(audience === `circle:${c.id}`)}>{c.name}</button>)}
          <button onClick={() => setAudience("suggested")} className={chip(audience === "suggested")}>✦ Suggested people</button>
          <button onClick={() => setAudience("people")} className={chip(audience === "people")}>Choose people</button>
          <button onClick={() => setAudience("community")} className={chip(audience === "community")}>Wider community</button>
        </div>
        {audience === "people" && (
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {others.map((id) => (
              <button key={id} onClick={() => togglePick(id)} className={`flex items-center gap-1.5 rounded-full border py-0.5 pr-3 pl-0.5 text-[12px] ${picked.includes(id) ? "border-ink-950 bg-ink-950 text-white" : "border-line bg-white"}`}>
                <Avatar person={PEOPLE[id]} size={22} />{PEOPLE[id].name.split(" ")[0]}
              </button>
            ))}
          </div>
        )}
        {audience === "community" && <p className="mt-2 text-[12px] text-mute">Wider-community Banter works best for safe, constructive subjects. Personal things belong with trusted circles.</p>}

        {/* Lifetime */}
        <p className="mt-4 text-[12px] font-semibold text-mute">Let it live, or let it go</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {BANTER_LIFETIMES.map((l) => <button key={l.id} onClick={() => setLifetime(l.id)} className={chip(lifetime === l.id)}>{l.id === "24h" ? "Ends tonight" : l.label}</button>)}
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
          <p className="max-w-md text-[12px] leading-relaxed text-mute">Akines shows each person why they&apos;re receiving this. You&apos;ll see thoughtful responses, not likes.</p>
          <button onClick={post} disabled={!ready} className="rounded-full bg-ochre-400 px-6 py-3 text-[14px] font-semibold text-ink-950 hover:bg-ochre-300 disabled:opacity-40">Start Banter</button>
        </div>
      </section>

      {/* Live preview and recipients */}
      <aside className="flex flex-col gap-4">
        <section className="rounded-[22px] border border-line bg-paper-50 p-4">
          <p className="text-[10.5px] font-bold tracking-[0.14em] text-mute uppercase">How it will arrive</p>
          <div className="mt-2.5 rounded-2xl bg-white p-3.5">
            <p className="flex items-center gap-2 text-[11.5px] text-mute"><Avatar person={ME} size={22} />You · {r.label}</p>
            <p className="mt-2 text-[15px] leading-snug font-semibold">{prompt.trim() || "Your question appears here."}</p>
            {attach === "photo" && photo && <Photo name={photo} sizes="300px" className="mt-2 h-28 rounded-xl" />}
            {attach === "poll" && pollOptions.length > 0 && <ul className="mt-2 flex flex-col gap-1">{pollOptions.map((o) => <li key={o} className="rounded-lg border border-line px-3 py-1.5 text-[12.5px]">{o}</li>)}</ul>}
            {media.trim() && (attach === "music" || attach === "video") && <p className="mt-2 rounded-lg bg-paper-200 px-3 py-1.5 text-[12px]">{attach === "music" ? "♪" : "▶"} {media}</p>}
            {voice && <p className="mt-2 rounded-lg bg-paper-200 px-3 py-1.5 text-[12px]">◉ Voice note · {voice}</p>}
            <div className="mt-2.5 flex flex-wrap gap-1.5 text-[11px]">
              <span className={`rounded-full px-2.5 py-0.5 font-semibold ${mood0.tone}`}>{mood0.label}</span>
              <span className="rounded-full border border-line px-2.5 py-0.5 text-mute">{BANTER_LIFETIMES.find((l) => l.id === lifetime)!.short}</span>
            </div>
          </div>
          <p className="mt-2 text-[11.5px] text-mute">{mood0.hint}</p>
        </section>

        <section className="rounded-[22px] border border-line bg-paper-50 p-4">
          <div className="flex items-center justify-between">
            <p className="text-[13px] font-semibold">Who receives this, and why</p>
            <span className="text-[11.5px] text-mute">{r.reach} {r.reach === 1 ? "person" : "people"}</span>
          </div>
          {r.list.length === 0 ? (
            <p className="mt-2 text-[12.5px] text-mute">Pick at least one person.</p>
          ) : (
            <ul className="mt-2.5 flex flex-col gap-2">
              {(showWhy ? r.list : r.list.slice(0, 3)).map((id) => (
                <li key={id} className="flex items-center gap-2.5">
                  <Avatar person={PEOPLE[id]} size={28} />
                  <span className="min-w-0 flex-1 leading-tight">
                    <span className="block text-[12.5px] font-semibold">{PEOPLE[id].name}</span>
                    <span className="block truncate text-[11.5px] text-mute">{RECIPIENT_REASON[id] ?? PEOPLE[id].role}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
          {r.list.length > 3 && <button onClick={() => setShowWhy((s) => !s)} className="mt-2 text-[12px] font-semibold text-ink-700">{showWhy ? "Show fewer" : `See all ${r.list.length}`}</button>}
        </section>
      </aside>
    </div>
  );
}
