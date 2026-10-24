"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { KINCIRCLE_PREFILL } from "@/components/circles/kincircleDraft";
import { BANTER_NOW, type BanterNow } from "@/lib/data/banter";
import { ME, type PersonId } from "@/lib/data/people";
import { useLocal } from "@/lib/useLocal";
import LiveStage from "./LiveStage";
import Icon from "@/components/ui/Icon";

export default function BanterNowRoom({ id }: { id: string }) {
  const router = useRouter();
  const [mine] = useLocal<BanterNow[]>("ak:banter-now", []);
  const [insights, setInsights] = useLocal<string[]>("ak:banter-insights", []);
  const session = [...mine, ...BANTER_NOW].find((s) => s.id === id);
  const [elapsed, setElapsed] = useState(0);
  const [endedEarly, setEnded] = useState(false);
  const [insight, setInsight] = useState("");
  const [saved, setSaved] = useState(false);

  const people: PersonId[] = session ? (session.people.includes(ME.id as PersonId) ? session.people : [...session.people, ME.id as PersonId]) : [];

  const total = (session?.minutes ?? 0) * 60;
  const left = Math.max(total - elapsed, 0);
  const ended = endedEarly || (total > 0 && left === 0);

  useEffect(() => {
    if (ended) return;
    const t = setTimeout(() => setElapsed((e) => e + 1), 1000);
    return () => clearTimeout(t);
  }, [elapsed, ended]);


  if (!session) {
    return (
      <div className="mx-auto max-w-xl py-16 text-center">
        <p className="font-display text-[26px]">This Banter Now has finished.</p>
        <Link href="/banter" className="mt-6 inline-block rounded-full bg-night px-6 py-3 text-[14px] font-semibold text-white">Back to Banter</Link>
      </div>
    );
  }

  const mm = Math.floor(left / 60);
  const ss = left % 60;

  if (ended) {
    return (
      <div className="ap-calm mx-auto flex w-full max-w-2xl flex-col gap-6 py-6">
        <div className="text-center">
          <p className="eyebrow text-clay-600">Banter Now · ended</p>
          <h1 className="font-display mt-2 text-[34px] leading-tight">Did this conversation produce an idea worth continuing?</h1>
          <p className="mt-2 text-[14px] text-mute">“{session.topic}”. Nothing was recorded. Only what you choose to save is kept.</p>
        </div>
        <section className="rounded-[22px] border border-line bg-paper-50 p-5">
          <label className="flex flex-col gap-2 text-[13px] font-semibold">
            Save one insight
            <input value={insight} onChange={(e) => setInsight(e.target.value)} placeholder="AI should help the archive, never sign the painting." className="rounded-xl border border-line bg-white px-4 py-3 text-[15px] font-normal outline-none focus:border-ink-900" />
          </label>
          <button
            disabled={!insight.trim() || saved}
            onClick={() => { setInsights([insight.trim(), ...insights]); setSaved(true); }}
            className="mt-3 rounded-full bg-night px-5 py-2.5 text-[13px] font-semibold text-white disabled:opacity-40"
          >
            {saved ? "Insight saved ✓" : "Save insight"}
          </button>
        </section>
        <div className="grid gap-3 sm:grid-cols-3">
          <Link href="/collaborate" className="rounded-[18px] border border-line bg-paper-50 p-4 hover:border-ink-400">
            <p className="text-[18px]" aria-hidden><Icon name="collaborate" size={18} /></p>
            <p className="mt-1 text-[14px] font-semibold">Create a project</p>
            <p className="mt-0.5 text-[12px] text-mute">Open a Collaboration Studio.</p>
          </Link>
          <button
            onClick={() => {
              localStorage.setItem(KINCIRCLE_PREFILL, JSON.stringify({ name: session.topic.slice(0, 40), purpose: `Started from Banter Now: “${session.topic}”`, invitees: people }));
              router.push("/circles/new?size=small");
            }}
            className="rounded-[18px] border border-line bg-paper-50 p-4 text-left hover:border-ink-400"
          >
            <p className="text-[18px]" aria-hidden><Icon name="circle" size={18} /></p>
            <p className="mt-1 text-[14px] font-semibold">Turn into a KinCircle</p>
            <p className="mt-0.5 text-[12px] text-mute">Keep meeting with purpose.</p>
          </button>
          <Link href="/banter" className="rounded-[18px] border border-line bg-paper-50 p-4 hover:border-ink-400">
            <p className="text-[18px]" aria-hidden>○</p>
            <p className="mt-1 text-[14px] font-semibold">Let it end</p>
            <p className="mt-0.5 text-[12px] text-mute">A good conversation is enough.</p>
          </Link>
        </div>
      </div>
    );
  }

  return <LiveStage session={session} mm={mm} ss={ss} onEnd={() => setEnded(true)} />;
}
