"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Award, Brush2, CloseCircle, Gallery, Global, Home2, LampCharge, Lock1, MessageQuestion, Notification, People, TickCircle, Trash } from "iconsax-reactjs";
import Avatar from "@/components/ui/Avatar";
import Badge, { type BadgeTone } from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import Media from "@/components/ui/Media";
import Tabs from "@/components/ui/Tabs";
import { IMG, JOURNAL, ME, getPerson } from "@/lib/data";
import type { JournalEntry } from "@/lib/types";
import { ALL_STORIES, getAnyStory } from "@/app/stories/_data";
import { cn } from "@/lib/cn";

type Kind = JournalEntry["kind"];
type Visibility = JournalEntry["visibility"];
type TabId = "artists" | "collectors" | "mine";

const KINDS: Record<Kind, { label: string; tone: BadgeTone; Icon: typeof Brush2 }> = {
  sketch: { label: "Sketch", tone: "neutral", Icon: Brush2 },
  failure: { label: "Failure", tone: "ruby", Icon: CloseCircle },
  idea: { label: "New idea", tone: "gold", Icon: LampCharge },
  doubt: { label: "Doubt", tone: "calm", Icon: MessageQuestion },
  win: { label: "Win", tone: "green", Icon: Award },
  collector: { label: "Collector", tone: "gold", Icon: Home2 },
};

const VISIBILITY: Record<Visibility, { label: string; explain: string; Icon: typeof Global }> = {
  public: { label: "Public", explain: "Anyone on Artelia Connect can read it, including collectors discovering your work.", Icon: Global },
  circle: { label: "Circle", explain: "Only members of your circles (Textiles, Diaspora) — people who know your practice.", Icon: People },
  private: { label: "Private", explain: "Only you. Never shown to anyone, never used for matching or ranking.", Icon: Lock1 },
};

function VisibilityMark({ visibility }: { visibility: Visibility }) {
  const { label, Icon } = VISIBILITY[visibility];
  return (
    <span className="inline-flex items-center gap-1 text-xs text-grey-700" title={VISIBILITY[visibility].explain}>
      <Icon size={14} color="currentColor" aria-hidden />
      {label}
    </span>
  );
}

export default function JournalBoard() {
  const [tab, setTab] = useState<TabId>("artists");
  const [mine, setMine] = useState<JournalEntry[]>([]);
  const [posted, setPosted] = useState<string[]>(["moussa"]);
  const [announce, setAnnounce] = useState("");

  const entries = [...mine, ...JOURNAL];
  // Private entries are only ever visible to their author, in "My journal".
  const shared = entries.filter((e) => e.visibility !== "private");
  const lists: Record<TabId, JournalEntry[]> = {
    artists: shared.filter((e) => e.kind !== "collector" && getPerson(e.authorId).role !== "collector"),
    collectors: shared.filter((e) => e.kind === "collector"),
    mine: entries.filter((e) => e.authorId === ME.id),
  };
  const list = lists[tab];

  function togglePosted(id: string) {
    const name = getPerson(id).name;
    const on = posted.includes(id);
    setPosted(on ? posted.filter((p) => p !== id) : [...posted, id]);
    setAnnounce(on ? `You'll no longer be kept posted on ${name}'s journal.` : `You'll be kept posted on ${name}'s journal. Only you know this.`);
  }

  function addEntry(entry: JournalEntry) {
    setMine((prev) => [entry, ...prev]);
    setTab("mine");
    setAnnounce(`Added to your journal as ${VISIBILITY[entry.visibility].label.toLowerCase()}.`);
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div className="min-w-0">
        <Tabs
          idPrefix="journals"
          label="Journals"
          value={tab}
          onChange={setTab}
          items={[
            { id: "artists", label: "Artist journals" },
            { id: "collectors", label: "Collector journals" },
            { id: "mine", label: "My journal" },
          ]}
        />
        <div role="tabpanel" id={`journals-panel-${tab}`} aria-labelledby={`journals-tab-${tab}`} className="pt-6">
          <p className="mb-4 text-sm text-grey-700">
            {tab === "artists" && "Today's sketch, the painting that failed, the doubt at 2am. Process, not polish."}
            {tab === "collectors" && "Why they bought it, where it lives, what changed. These entries become part of each work's legacy."}
            {tab === "mine" && "Everything you've written, including private entries only you can see."}
          </p>

          {tab === "mine" && <Composer onAdd={addEntry} />}

          {list.length === 0 ? (
            <EmptyState title="Nothing here yet" description="Your first entry doesn't need to be good. It needs to be true." />
          ) : (
            <ul className={cn("flex flex-col gap-4", tab === "mine" && "mt-6")}>
              {list.map((entry) => (
                <EntryCard
                  key={entry.id}
                  entry={entry}
                  posted={posted.includes(entry.authorId)}
                  onTogglePosted={tab === "artists" && entry.authorId !== ME.id ? () => togglePosted(entry.authorId) : undefined}
                />
              ))}
            </ul>
          )}
          <p className="mt-8 border-t border-sand-200 pt-6 text-center text-sm text-grey-700">
            That&apos;s everything from the last two weeks. Journals don&apos;t scroll forever — come back when there&apos;s more.
          </p>
        </div>
      </div>

      <aside className="flex flex-col gap-4" aria-label="Journal settings">
        <Card className="p-5">
          <p className="flex items-center gap-2 text-sm font-semibold text-green-950">
            <Notification size={18} color="currentColor" aria-hidden /> Journals you keep up with
          </p>
          <p className="mt-2 text-xs text-grey-700">
            Private to you. Artists aren&apos;t notified and there is no follower count — anywhere.
          </p>
          {posted.length === 0 ? (
            <p className="mt-3 text-sm text-grey-700">None yet. Use &ldquo;Keep me posted&rdquo; on an artist&apos;s entry.</p>
          ) : (
            <ul className="mt-3 flex flex-col gap-2">
              {posted.map((id) => {
                const p = getPerson(id);
                return (
                  <li key={id} className="flex items-center justify-between gap-2 text-sm">
                    <Link href={`/people/${id}`} className="flex min-w-0 items-center gap-2 font-semibold text-green-950 hover:underline">
                      <Avatar name={p.name} size="xs" verified={p.verified} /> <span className="truncate">{p.name}</span>
                    </Link>
                    <button type="button" onClick={() => togglePosted(id)} className="cursor-pointer text-xs text-grey-700 underline underline-offset-2 hover:text-green-950">
                      Stop<span className="sr-only"> keeping posted on {p.name}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
        <Card tone="sand" className="p-5">
          <p className="text-sm font-semibold text-calm">Something you&apos;d rather not share?</p>
          <p className="mt-2 text-sm text-grey-800">
            Wellbeing has a private expressive journal — mood canvas, prompts, nothing ever shared or used for ranking.
          </p>
          <Link href="/wellbeing" className="mt-3 inline-block text-sm font-semibold text-green-950 underline underline-offset-4">Journal privately in Wellbeing</Link>
        </Card>
        <Card className="p-5 text-sm">
          <p className="font-semibold text-green-950">From journal to studio</p>
          <p className="mt-2 text-grey-700">Many collectors first meet an artist here, then sit with them in a Presence Room or visit the studio.</p>
          <div className="mt-3 flex flex-col gap-1.5">
            <Link href="/rooms" className="font-semibold text-green-950 underline underline-offset-4">Presence Rooms</Link>
            <Link href="/studio-visits" className="font-semibold text-green-950 underline underline-offset-4">Studio visits</Link>
          </div>
        </Card>
      </aside>
      <p className="sr-only" aria-live="polite">{announce}</p>
    </div>
  );
}

function EntryCard({ entry, posted, onTogglePosted }: { entry: JournalEntry; posted: boolean; onTogglePosted?: () => void }) {
  const author = getPerson(entry.authorId);
  const kind = KINDS[entry.kind];
  const story = entry.storyId ? getAnyStory(entry.storyId) : undefined;
  return (
    <Card as="li" className={cn("overflow-hidden", entry.visibility === "private" && "border-calm/40")}>
      <div className="flex flex-col gap-3 p-5">
        <div className="flex flex-wrap items-center gap-3">
          <Avatar name={author.name} size="sm" verified={author.verified} />
          <div className="min-w-0 flex-1">
            <Link href={`/people/${author.id}`} className="text-sm font-semibold text-green-950 hover:underline">
              {author.id === ME.id ? `${author.name} (you)` : author.name}
            </Link>
            <p className="text-xs text-grey-700">{author.title} · {author.city} · {entry.date}</p>
          </div>
          <Badge tone={kind.tone} icon={<kind.Icon size={12} color="currentColor" aria-hidden />}>{kind.label}</Badge>
        </div>
        <p className="text-sm leading-relaxed text-green-950 md:text-base">{entry.text}</p>
      </div>
      {entry.image && <Media src={entry.image} alt="" ratio="16/9" sizes="(max-width: 1024px) 100vw, 640px" />}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-sand-200 px-5 py-3">
        <VisibilityMark visibility={entry.visibility} />
        {story && (
          <Link href={`/stories/${story.id}`} className="text-xs font-semibold text-green-950 underline underline-offset-4">
            Story: {story.title}
          </Link>
        )}
        {onTogglePosted && (
          <button
            type="button"
            onClick={onTogglePosted}
            aria-pressed={posted}
            className={cn(
              "ml-auto inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold",
              posted ? "border-green-950 bg-green-950 text-white" : "border-sand-300 text-green-950 hover:border-green-950",
            )}
          >
            {posted ? <TickCircle size={14} color="currentColor" aria-hidden /> : <Lock1 size={14} color="currentColor" aria-hidden />}
            {posted ? "Keeping you posted" : "Keep me posted on this artist's journal"}
            <span className="sr-only"> ({author.name}, private)</span>
          </button>
        )}
      </div>
    </Card>
  );
}

const COMPOSER_KINDS: Kind[] = ["sketch", "failure", "idea", "doubt", "win", "collector"];

function Composer({ onAdd }: { onAdd: (entry: JournalEntry) => void }) {
  const [kind, setKind] = useState<Kind>("sketch");
  const [text, setText] = useState("");
  const [visibility, setVisibility] = useState<Visibility>("circle");
  const [image, setImage] = useState(false);
  const [storyId, setStoryId] = useState("");
  const [error, setError] = useState("");

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!text.trim()) {
      setError("Write something first — a sentence is plenty.");
      return;
    }
    onAdd({
      id: `mine-${Date.now()}`,
      authorId: ME.id,
      kind,
      date: "Just now",
      text: text.trim(),
      visibility,
      image: image ? IMG.drawing : undefined,
      storyId: storyId || undefined,
    });
    setText("");
    setImage(false);
    setStoryId("");
    setError("");
  }

  return (
    <form onSubmit={submit} className="rounded-[4px] border border-sand-200 bg-white p-5" aria-labelledby="composer-heading">
      <h2 id="composer-heading" className="font-playfair text-lg font-semibold text-green-950">Write in your journal</h2>

      <fieldset className="mt-4">
        <legend className="text-sm font-semibold text-green-950">What kind of entry?</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {COMPOSER_KINDS.map((k) => {
            const { label, Icon } = KINDS[k];
            return (
              <label key={k} className={cn("inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-green-950", kind === k ? "border-green-950 bg-green-950 text-white" : "border-sand-300 text-green-950 hover:border-green-950")}>
                <input type="radio" name="kind" value={k} checked={kind === k} onChange={() => setKind(k)} className="sr-only" />
                <Icon size={14} color="currentColor" aria-hidden /> {label}
              </label>
            );
          })}
        </div>
      </fieldset>

      <label htmlFor="journal-text" className="mt-4 block text-sm font-semibold text-green-950">Entry</label>
      <textarea
        id="journal-text"
        rows={4}
        value={text}
        onChange={(e) => setText(e.target.value)}
        aria-invalid={!!error}
        aria-describedby={error ? "journal-error" : undefined}
        placeholder="What happened in the studio today?"
        className="mt-2 w-full rounded-[2px] border border-sand-300 p-3 text-sm text-green-950 placeholder:text-grey-700"
      />
      {error && <p id="journal-error" className="mt-1 text-sm text-alert">{error}</p>}

      <fieldset className="mt-4">
        <legend className="text-sm font-semibold text-green-950">Who can see it?</legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-3">
          {(Object.keys(VISIBILITY) as Visibility[]).map((v) => {
            const { label, explain, Icon } = VISIBILITY[v];
            return (
              <label key={v} className={cn("flex cursor-pointer flex-col gap-1 rounded-[4px] border p-3 text-sm has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-green-950", visibility === v ? "border-green-950 bg-sand-100" : "border-sand-200 hover:border-green-950")}>
                <span className="flex items-center gap-2 font-semibold text-green-950">
                  <input type="radio" name="visibility" value={v} checked={visibility === v} onChange={() => setVisibility(v)} className="accent-green-950" />
                  <Icon size={16} color="currentColor" aria-hidden /> {label}{v === "circle" && <span className="text-xs font-normal text-grey-700">(default)</span>}
                </span>
                <span className="text-xs text-grey-700">{explain}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-sm font-semibold text-green-950">Image <span className="font-normal text-grey-700">(optional)</span></p>
          {image ? (
            <div className="mt-2 flex items-center gap-3">
              <Media src={IMG.drawing} alt="" ratio="1/1" sizes="64px" className="w-16 rounded-[2px]" />
              <span className="text-xs text-grey-700">studio-photo.jpg (placeholder)</span>
              <Button variant="ghost" size="sm" onClick={() => setImage(false)} icon={<Trash size={14} color="currentColor" aria-hidden />}>Remove</Button>
            </div>
          ) : (
            <Button variant="outline" size="sm" className="mt-2" onClick={() => setImage(true)} icon={<Gallery size={16} color="currentColor" aria-hidden />}>Add a photo</Button>
          )}
        </div>
        <div>
          <label htmlFor="journal-story" className="text-sm font-semibold text-green-950">Related story <span className="font-normal text-grey-700">(optional)</span></label>
          <select id="journal-story" value={storyId} onChange={(e) => setStoryId(e.target.value)} className="mt-2 h-9 w-full rounded-[2px] border border-sand-300 bg-white px-2 text-sm text-green-950">
            <option value="">None</option>
            {ALL_STORIES.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
          </select>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Button type="submit">Add entry</Button>
        <span className="text-xs text-grey-700">Will be shared as: <strong className="text-green-950">{VISIBILITY[visibility].label}</strong></span>
      </div>
    </form>
  );
}
