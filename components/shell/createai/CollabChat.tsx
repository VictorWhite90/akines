"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { ArrowUp } from "lucide-react";
import Button, { IconButton } from "@/components/kin/Button";
import { useCollab } from "@/lib/collab/useCollab";
import { isMine, workspaceHref } from "@/lib/collab/workspace";
import { NEEDS } from "@/components/collaborate/start/data";
import "../collab-chat.css";

/*
 * Create AI explores collaborators and opens a project inside the thread, mirrored from the product design (Figma
 * section 16, journeys 16.4 and 16.5, their collab-chat.tsx). Two step machines in the style of 16.3: the person's
 * last answer and the assistant's current message, nothing older. The needs are those of Start a project; the
 * projects are the member's own (useCollab().projects, isMine), the first three as the design shows. The state lives
 * in `useCollabChat`, called by Companion, so closing and reopening the panel keeps the conversation.
 */

export type CollabJourney = "explore" | "open";
type CollabStep = "ask" | "ready";
type View = { step: CollabStep; you: string; pick: string | null };

/** The buttons "Explore collaborators" and "Open a project" of the Ask anything answer open these journeys. */
export const EXPLORE_PATH = "/collaborate/collaborators";
export const OPEN_PATH = "/collaborate/my-projects";
const MATCHING = "/collaborate/collaborators/matching";

const ENTRY: Record<CollabJourney, string> = { explore: "Explore collaborators", open: "Open a project" };

/** "Got it. I found people who could offer mentorship and fit your project.", with each need's own words. */
const OFFER: Record<string, string> = {
  collaborators: "could work with you",
  mentorship: "could offer mentorship",
  technical: "could offer technical expertise",
  research: "could offer research support",
  funding: "could offer funding",
  distribution: "could help with distribution",
  customers: "could be customers or users",
};

export type CollabChat = ReturnType<typeof useCollabChat>;

export function useCollabChat() {
  const [journey, setJourney] = useState<CollabJourney | null>(null);
  const [view, setView] = useState<View>({ step: "ask", you: ENTRY.explore, pick: null });
  const [draft, setDraft] = useState("");

  const begin = useCallback((j: CollabJourney) => { setView({ step: "ask", you: ENTRY[j], pick: null }); setDraft(""); setJourney(j); }, []);
  const stop = useCallback(() => setJourney(null), []);
  const choose = useCallback((id: string, title: string) => setView({ step: "ready", you: title, pick: id }), []);

  return { active: journey !== null, journey, view, begin, stop, choose, draft, setDraft };
}

/** Figma "Create AI / Option chips": plain pills, 44 high, one tap picks the answer. */
function Pills({ label, items, onPick }: { label: string; items: { id: string; title: string }[]; onPick: (id: string, title: string) => void }) {
  return (
    <div className="cai-cpills" role="group" aria-label={label}>
      {items.map((it) => <button key={it.id} type="button" className="cai-cpill" onClick={() => onPick(it.id, it.title)}>{it.title}</button>)}
    </div>
  );
}

type ViewProps = {
  chat: CollabChat;
  /** closes the panel and goes to a page (sign up first for a visitor) */
  leave: (path: string) => void;
  /** a free question typed in the field: the thread goes back to the open chat and answers it */
  onAsk: (text: string) => void;
  /** no project yet: start one in the thread */
  onStart: () => void;
};

export function CollabChatView({ chat, leave, onAsk, onStart }: ViewProps) {
  const { projects } = useCollab();
  const { journey, view, choose, draft, setDraft } = chat;
  const { step, you, pick } = view;
  const bodyRef = useRef<HTMLDivElement>(null);
  const offered = projects.filter(isMine).slice(0, 3);

  // every step is a fresh view: back to the top
  useEffect(() => { bodyRef.current?.scrollTo({ top: 0, behavior: "auto" }); }, [journey, step]);

  const canSend = draft.trim().length > 0;
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setDraft("");
    onAsk(text);
  };

  let assistant: ReactNode = null;
  if (journey === "explore") {
    if (step === "ask") {
      assistant = (
        <>
          <p className="cai-ctext">Sure. What kind of help are you looking for?</p>
          <Pills label="What kind of help are you looking for?" items={NEEDS} onPick={choose} />
        </>
      );
    } else {
      const need = NEEDS.find((n) => n.id === pick);
      const offer = (pick && OFFER[pick]) || `could help with ${(need?.title ?? "this").toLowerCase()}`;
      assistant = (
        <>
          <p className="cai-ctext">Got it. I found people who {offer} and fit your project.</p>
          <div className="cai-cgo">
            <Button size="sm" arrow="right" onClick={() => leave(pick ? `${MATCHING}?need=${encodeURIComponent(pick)}` : MATCHING)}>See my matches</Button>
          </div>
        </>
      );
    }
  } else if (journey === "open") {
    if (step === "ask") {
      assistant = offered.length ? (
        <>
          <p className="cai-ctext">Which project would you like to open?</p>
          <Pills label="Which project would you like to open?" items={offered.map((p) => ({ id: p.id, title: p.title }))} onPick={choose} />
        </>
      ) : (
        <>
          <p className="cai-ctext">You don’t have a project yet. Would you like to start one?</p>
          <div className="cai-cgo"><Button size="sm" arrow="right" onClick={onStart}>Start a project</Button></div>
        </>
      );
    } else {
      assistant = (
        <>
          <p className="cai-ctext">Here it is. Tap to open it.</p>
          <div className="cai-cgo">
            <Button size="sm" arrow="up-right" onClick={() => leave(pick ? workspaceHref(pick) : OPEN_PATH)}>Open project</Button>
          </div>
        </>
      );
    }
  }

  return (
    <>
      <div className="cai-body" ref={bodyRef} aria-live="polite">
        <div className="cai-cmsg cai-cmsg--you" key={`you-${journey}-${step}`}><p className="cai-cbubble">{you}</p></div>
        <div className="cai-cmsg" key={`bot-${journey}-${step}`}>{assistant}</div>
      </div>
      <form className="cai-form" onSubmit={submit}>
        <label className="cai-field">
          <span className="sr-only">Message Create AI</span>
          <input className="cai-input" type="text" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Ask Create AI anything" autoComplete="off" enterKeyHint="send" maxLength={600} />
          <IconButton label="Send" size="sm" variant="primary" type="submit" disabled={!canSend}><ArrowUp strokeWidth={1.6} /></IconButton>
        </label>
        <p className="cai-foot">Create AI can get things wrong. Please check anything important.</p>
      </form>
    </>
  );
}
