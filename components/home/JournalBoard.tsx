"use client";

import { useState } from "react";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import Photo from "@/components/ui/Photo";
import { JOURNAL, type JournalEntry } from "@/lib/data/journals";
import { PEOPLE, ME } from "@/lib/data/people";
import { MOODS } from "@/lib/data/community";
import { cn } from "@/lib/cn";

const TABS = [
  { id: "all", label: "All" },
  { id: "work", label: "Work" },
  { id: "life", label: "Life" },
] as const;

type Tab = (typeof TABS)[number]["id"];

export default function JournalBoard({ initialTab = "all" }: { initialTab?: Tab }) {
  const [tab, setTab] = useState<Tab>(initialTab);
  const [entries, setEntries] = useState<JournalEntry[]>(JOURNAL);
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [mood, setMood] = useState<string>("open");
  const [kind, setKind] = useState<"work" | "life">("life");
  const [visibility, setVisibility] = useState<"private" | "circle">("private");

  const shown = entries.filter((e) => tab === "all" || e.kind === tab);

  function publish(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !text.trim()) return;
    const m = MOODS.find((x) => x.id === mood)?.word;
    setEntries((list) => [{ id: `me-${list.length}`, kind, by: "amara", title: title.trim(), text: text.trim(), date: visibility === "private" ? "Just now · private" : "Just now", mood: m }, ...list]);
    setTitle("");
    setText("");
  }

  return (
    <div className="grid gap-8 lg:grid-cols-12">
      <div className="space-y-6 lg:col-span-8">
        <div role="tablist" className="flex flex-wrap gap-2">
          {TABS.map((t) => (
            <button key={t.id} role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)} className={cn("rounded-full border px-4 py-2 text-sm font-semibold transition-colors", tab === t.id ? "border-ink-900 bg-ink-900 text-paper-50" : "border-line bg-paper-50 hover:bg-paper-200")}>{t.label}</button>
          ))}
        </div>
        <ul className="space-y-5">
          {shown.map((j) => {
            const who = PEOPLE[j.by];
            return (
              <li key={j.id} className="card animate-rise overflow-hidden">
                <div className={cn("grid", j.photo && "md:grid-cols-[220px_minmax(0,1fr)]")}>
                  {j.photo && <Photo name={j.photo} sizes="220px" className="min-h-[180px] md:h-full" />}
                  <div className="p-6">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="eyebrow text-[10px] text-clay-600">{j.kind === "work" ? "Work journal" : "Life journal"}</span>
                      <span className="text-mute">· {j.date}</span>
                      {j.mood && <span className="rounded-full bg-paper-200 px-2.5 py-0.5 font-medium">{j.mood}</span>}
                    </div>
                    <h3 className="font-display mt-2 text-[24px] leading-tight font-medium">{j.title}</h3>
                    <p className="mt-2 text-[15.5px] leading-relaxed text-ink-800">{j.text}</p>
                    <div className="mt-4 flex items-center gap-2.5 text-sm text-mute"><Avatar person={who} size={28} />{who.name} · {who.city}</div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <form onSubmit={publish} className="card h-fit space-y-4 p-6 lg:sticky lg:top-28 lg:col-span-4" aria-label="Write a journal entry">
        <div className="flex items-center gap-3"><Avatar person={ME} size={40} /><div><p className="font-display text-xl leading-tight font-medium">Write in your journal</p><p className="text-xs text-mute">Private by default</p></div></div>
        <div className="flex gap-2" role="radiogroup" aria-label="Journal type">
          {(["life", "work"] as const).map((k) => (
            <button key={k} type="button" role="radio" aria-checked={kind === k} onClick={() => setKind(k)} className={cn("flex-1 rounded-full border py-2 text-[13px] font-semibold", kind === k ? "border-ink-900 bg-ink-900 text-paper-50" : "border-line hover:bg-paper-100")}>{k === "life" ? "Life" : "Work"}</button>
          ))}
        </div>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="A title, or a first line" aria-label="Title" className="w-full rounded-xl border border-line bg-paper-100 px-4 py-3 text-[15px] outline-none focus:border-ink-500" />
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={5} placeholder={kind === "life" ? "What happened. Who was there. How it made you feel." : "What you tried. What failed. What you might try next."} aria-label="Entry" className="w-full resize-none rounded-xl border border-line bg-paper-100 px-4 py-3 text-[15px] outline-none focus:border-ink-500" />
        <div>
          <p className="mb-2 text-xs font-semibold text-mute">Today's colour</p>
          <div className="flex flex-wrap gap-2">{MOODS.map((m) => <button type="button" key={m.id} onClick={() => setMood(m.id)} aria-label={m.word} aria-pressed={mood === m.id} className={cn("h-7 w-7 rounded-full ring-offset-2 ring-offset-paper-50", m.hue, mood === m.id && "ring-2 ring-ink-900")} />)}</div>
        </div>
        <div className="flex items-center justify-between rounded-xl bg-paper-100 px-4 py-2.5 text-sm">
          <span className="font-medium">Who can read this</span>
          <select value={visibility} onChange={(e) => setVisibility(e.target.value as "private" | "circle")} className="rounded-lg bg-transparent font-semibold outline-none" aria-label="Visibility">
            <option value="private">Only me</option>
            <option value="circle">My circles</option>
          </select>
        </div>
        <Button type="submit" className="w-full" disabled={!title.trim() || !text.trim()}>Add to journal</Button>
      </form>
    </div>
  );
}
