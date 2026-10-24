"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AiTag } from "@/components/ui/Chip";
import { cn } from "@/lib/cn";
import Icon from "@/components/ui/Icon";

type Msg = { from: "me" | "ai"; text: string; link?: { href: string; label: string } };

const SUGGESTIONS = ["Help me break the ice with someone new", "Which circle should I join?", "How do I price my service?", "I feel stuck and a bit flat", "Plan a small get-together for me"];

/** Prototype replies. In production these come from the Companion model. */
function reply(input: string): Msg {
  const q = input.toLowerCase();
  if (/(stuck|block|burn|anxious|anxiety|sad|lonely|tired|overwhelm|grief|flat|hopeless)/.test(q))
    return {
      from: "ai",
      text: "That sounds heavy, and it's a very common place to be. I can't diagnose anything, but I can help you reflect. A two-minute breathing pause or a private mood check-in often loosens things. If this has been going on for a while, a licensed professional can help, and I can show you where to find one.",
      link: { href: "/wellbeing", label: "Open Breathing Room" },
    };
  if (/(ice|new|hello|start a conversation|talk to)/.test(q))
    return { from: "ai", text: "Start with something you genuinely want to know, not small talk. Their space says what they're working on, so ask about that, or share one thing you have in common. A Banter or a short voice note often feels less awkward than a long message.", link: { href: "/kindred", label: "See who you might like to meet" } };
  if (/(circle|join|community|group)/.test(q))
    return { from: "ai", text: "Pick the circle that matches what you want right now: New in the City to meet people, Founders or Tech & Code for work, Parents Together or Book Club for life. You can join two and see which one feels like yours.", link: { href: "/circles", label: "Browse circles" } };
  if (/(pric|cost|sell|worth|charge)/.test(q))
    return { from: "ai", text: "A fair first pass: your time at a fair hourly rate, plus materials or costs, then a check against people doing similar work locally. Start a little lower for your first three clients and ask for honest feedback. This is guidance, not financial advice." };
  if (/(event|get-together|party|meet ?up|plan)/.test(q))
    return { from: "ai", text: "Keep it small: six to ten people, one clear reason to come, and a simple first activity so nobody has to perform. A game like Two truths and a story works well for strangers.", link: { href: "/play", label: "Find a game for it" } };
  return { from: "ai", text: "Tell me a little more. I can help you meet the right people, find a circle, plan a get-together, price your work, or think through how you're feeling today." };
}

export default function Companion({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [msgs, setMsgs] = useState<Msg[]>([{ from: "ai", text: "Hello Amara. I'm your Akines Companion. Ask me who to meet, what to join, or about a stuck feeling. I'll say when I'm unsure." }]);
  const [draft, setDraft] = useState("");
  const [thinking, setThinking] = useState(false);
  const end = useRef<HTMLDivElement>(null);

  useEffect(() => {
    end.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [msgs, thinking]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  function send(text: string) {
    const t = text.trim();
    if (!t || thinking) return;
    setMsgs((m) => [...m, { from: "me", text: t }]);
    setDraft("");
    setThinking(true);
    window.setTimeout(() => {
      setMsgs((m) => [...m, reply(t)]);
      setThinking(false);
    }, 750);
  }

  return (
    <>
      <div className={cn("fixed inset-0 z-40 bg-ink-950/40 backdrop-blur-[2px] transition-opacity lg:bg-transparent lg:backdrop-blur-none", open ? "opacity-100" : "pointer-events-none opacity-0")} onClick={onClose} aria-hidden />
      <aside
        aria-label="Akines Companion"
        aria-hidden={!open}
        className={cn("fixed top-0 right-0 z-50 flex h-dvh w-full max-w-[420px] flex-col border-l border-line bg-paper-50 shadow-2xl transition-transform duration-300 ease-out", open ? "translate-x-0" : "translate-x-full")}
      >
        <header className="pattern-adire flex items-start gap-3 bg-ink-900 px-5 py-4 text-paper-50">
          <span className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-full bg-ochre-400 text-ink-950">
            <Icon name="spark" size={20} />
          </span>
          <div className="flex-1">
            <h2 className="font-display text-xl leading-tight">Akines Companion</h2>
            <p className="mt-0.5 text-xs text-ink-200">Trained on African art history, materials, symbolism, exhibition planning and collector education.</p>
          </div>
          <button onClick={onClose} aria-label="Close Companion" className="rounded-full p-1 text-ink-200 hover:text-paper-50">
            <Icon name="close" size={22} />
          </button>
        </header>

        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
          {msgs.map((m, i) => (
            <div key={i} className={cn("flex", m.from === "me" && "justify-end")}>
              <div className={cn("max-w-[88%] rounded-2xl px-4 py-3 text-[14.5px] leading-relaxed", m.from === "me" ? "rounded-br-md bg-ink-900 text-paper-50" : "rounded-bl-md border border-line bg-paper-100")}>
                {m.from === "ai" && <AiTag className="mb-2" />}
                <p>{m.text}</p>
                {m.link && (
                  <Link href={m.link.href} onClick={onClose} className="mt-2.5 inline-block text-sm font-semibold text-clay-600 underline underline-offset-4">
                    {m.link.label} →
                  </Link>
                )}
              </div>
            </div>
          ))}
          {thinking && (
            <div className="flex">
              <div className="flex gap-1 rounded-2xl rounded-bl-md border border-line bg-paper-100 px-4 py-3.5" aria-label="Companion is thinking">
                {[0, 1, 2].map((d) => (
                  <span key={d} className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-300" style={{ animationDelay: `${d * 120}ms` }} />
                ))}
              </div>
            </div>
          )}
          <div ref={end} />
        </div>

        <div className="border-t border-line bg-paper-50 px-5 pt-3 pb-5">
          <div className="scroll-x mb-3 flex gap-2 overflow-x-auto">
            {SUGGESTIONS.map((s) => (
              <button key={s} onClick={() => send(s)} className="shrink-0 rounded-full border border-line bg-paper-100 px-3 py-1.5 text-xs font-medium hover:bg-paper-200">
                {s}
              </button>
            ))}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(draft);
            }}
            className="flex items-center gap-2 rounded-full border border-line bg-paper-100 py-1.5 pr-1.5 pl-4 focus-within:border-ink-500"
          >
            <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Ask about people, plans or how you feel…" aria-label="Message the Companion" className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-mute" />
            <button type="submit" aria-label="Send" className="flex h-9 w-9 items-center justify-center rounded-full bg-ink-900 text-paper-50 hover:bg-ink-700">
              <span aria-hidden className="text-base leading-none">↑</span>
            </button>
          </form>
          <p className="mt-2.5 text-center text-[11px] text-mute">AI, not a person. Not a doctor or therapist, and it doesn't diagnose.</p>
        </div>
      </aside>
    </>
  );
}
