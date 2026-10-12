"use client";

import { useState, type FormEvent } from "react";
import { Lock1, TickCircle } from "iconsax-reactjs";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import SeatDots from "./SeatDots";
import { THEMES } from "../_data";

const FORMATS = [
  { id: "video", label: "Video, camera optional" },
  { id: "voice", label: "Voice only" },
  { id: "text", label: "Text only" },
] as const;

const field = "w-full rounded-[2px] border border-sand-300 bg-white px-3 py-2.5 text-sm text-green-950 placeholder:text-grey-700";
const labelCls = "text-sm font-semibold text-green-950";

export default function StartRoomForm() {
  const [title, setTitle] = useState("");
  const [theme, setTheme] = useState(THEMES[0]);
  const [prompts, setPrompts] = useState(["", "", ""]);
  const [format, setFormat] = useState<(typeof FORMATS)[number]["id"]>("video");
  const [time, setTime] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!title.trim() || prompts.some((p) => !p.trim()) || !time) {
      setError("Add a title, all three prompts and a time so people know what they're saying yes to.");
      return;
    }
    if (!agreed) {
      setError("Please agree to the facilitation guidelines before opening the room.");
      return;
    }
    setError("");
    setSubmitted(true);
  }

  const when = time ? new Date(time).toLocaleString("en-GB", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "";

  return (
    <Card className="p-5 sm:p-6">
      <p className="sr-only" aria-live="polite">{submitted ? `Your room “${title}” is open. Five seats are free.` : ""}</p>
      <div>
        {submitted ? (
          <div className="flex flex-col gap-3">
            <p className="flex items-center gap-2 font-playfair text-xl font-semibold text-green-950">
              <TickCircle size={22} variant="Bulk" color="var(--color-verified)" aria-hidden /> Your room is open
            </p>
            <p className="text-sm text-grey-800">
              “{title}” · {theme} · {FORMATS.find((f) => f.id === format)?.label} · {when}. You hold the first seat as facilitator; five are open.
            </p>
            <SeatDots taken={1} />
            <p className="text-sm text-grey-700">
              We&apos;ll suggest it quietly to people whose Creative DNA complements the theme — artists, collectors,
              students and curators, not just people like you. No announcement feed, no audience.
            </p>
            <Button variant="outline" size="sm" className="self-start" onClick={() => { setSubmitted(false); setTitle(""); setPrompts(["", "", ""]); setTime(""); setAgreed(false); }}>
              Start another room
            </Button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="room-title" className={labelCls}>Title</label>
              <input id="room-title" className={field} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Indigo, salt and the Atlantic" />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="room-theme" className={labelCls}>Theme</label>
              <select id="room-theme" className={field} value={theme} onChange={(e) => setTheme(e.target.value)}>
                {THEMES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>

            <fieldset className="min-w-0 flex flex-col gap-2">
              <legend className={labelCls}>Three conversation prompts</legend>
              <p className="text-xs text-grey-700">Good prompts invite stories, not opinions about each other.</p>
              {prompts.map((prompt, i) => (
                <div key={i} className="flex flex-col gap-1">
                  <label htmlFor={`room-prompt-${i}`} className="text-xs text-grey-700">Prompt {i + 1}</label>
                  <input
                    id={`room-prompt-${i}`}
                    className={field}
                    value={prompt}
                    onChange={(e) => setPrompts((prev) => prev.map((p, j) => (j === i ? e.target.value : p)))}
                    placeholder={["Bring a colour that means something to you.", "Where did you first see it used?", "What would you never sell?"][i]}
                  />
                </div>
              ))}
            </fieldset>

            <fieldset className="min-w-0 flex flex-col gap-2">
              <legend className={labelCls}>Format</legend>
              <div className="flex flex-wrap gap-x-5 gap-y-2">
                {FORMATS.map((f) => (
                  <label key={f.id} className="flex items-center gap-2 text-sm text-green-950">
                    <input type="radio" name="room-format" value={f.id} checked={format === f.id} onChange={() => setFormat(f.id)} className="h-4 w-4 accent-green-950" />
                    {f.label}
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="room-time" className={labelCls}>When</label>
              <input id="room-time" type="datetime-local" className={field} value={time} onChange={(e) => setTime(e.target.value)} />
            </div>

            <div className="flex flex-col gap-2 rounded-[4px] bg-sand-100 p-4">
              <p className="flex items-center gap-2 text-sm font-semibold text-green-950">
                <Lock1 size={16} color="currentColor" aria-hidden /> Capacity: 6 seats, fixed
              </p>
              <p className="text-xs text-grey-700">Including you. Rooms can&apos;t be enlarged, streamed or recorded — that&apos;s what keeps them honest.</p>
            </div>

            <label className="flex items-start gap-3 text-sm text-grey-800">
              <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-green-950" />
              <span>
                I&apos;ll follow the facilitation guidelines: give every seat time to speak, keep critique on the work,
                ask before anything is shared, and call a moderator if someone is harassed or a culture is misrepresented.
              </span>
            </label>

            {error && <p className="text-sm font-semibold text-alert" role="alert">{error}</p>}

            <Button type="submit" className="self-start">Open the room</Button>
          </form>
        )}
      </div>
    </Card>
  );
}
