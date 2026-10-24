import Link from "next/link";
import Photo from "@/components/ui/Photo";
import Avatar, { AvatarStack } from "@/components/ui/Avatar";
import Chip from "@/components/ui/Chip";
import { PEOPLE } from "@/lib/data/people";
import { STAGES, type Collab, type OpenCall, type StudioVisit } from "@/lib/data/community";
import type { Story } from "@/lib/data/stories";
import { cn } from "@/lib/cn";
import Icon, { Glyph } from "@/components/ui/Icon";

export function StageTracker({ stage, progress, dark = false }: { stage: number; progress: number; dark?: boolean }) {
  return (
    <div>
      <div className="flex justify-between text-[11px] font-semibold tracking-wide uppercase">
        {STAGES.map((s, i) => (
          <span key={s} className={cn(i === stage ? (dark ? "text-ochre-300" : "text-clay-600") : i < stage ? (dark ? "text-paper-100" : "text-ink-800") : dark ? "text-ink-300" : "text-mute/70")}>{s}</span>
        ))}
      </div>
      <div className={cn("mt-2 h-1.5 overflow-hidden rounded-full", dark ? "bg-paper-50/15" : "bg-ink-900/10")} role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label="Project progress">
        <div className="h-full rounded-full bg-clay-500" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}

export function CollabCard({ c, className }: { c: Collab; className?: string }) {
  return (
    <Link href={`/collaborate/${c.id}`} className={cn("card card-lift group block overflow-hidden", className)}>
      <Photo name={c.photo} ratio="16/9" sizes="(max-width: 768px) 100vw, 420px" className="transition-transform duration-500 [&_img]:group-hover:scale-105">
        <span className="cb-badge absolute top-3 left-3 rounded-full bg-paper-50 px-3 py-1 text-[11px] font-bold tracking-wide text-ink-900 uppercase shadow-soft">Shared creation</span>
        <span className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-ink-950/70 px-3 py-1 text-xs font-medium text-paper-50 backdrop-blur"><span aria-hidden>⌖</span>{c.route}</span>
      </Photo>
      <div className="p-5">
        <p className="eyebrow text-clay-600">{c.medium}</p>
        <h3 className="font-display mt-1 text-2xl leading-tight font-medium">{c.title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-mute">{c.blurb}</p>
        <div className="mt-4"><StageTracker stage={c.stage} progress={c.progress} /></div>
        <div className="mt-4 flex items-center justify-between">
          <AvatarStack people={c.makers.map((m) => PEOPLE[m])} size={30} />
          <span className="text-xs text-mute">{c.next}</span>
        </div>
      </div>
    </Link>
  );
}

export function CallCard({ c, className }: { c: OpenCall; className?: string }) {
  const by = PEOPLE[c.by];
  return (
    <Link href={`/collaborate/calls/${c.id}`} className={cn("card card-lift group flex flex-col overflow-hidden", className)}>
      <Photo name={c.photo} ratio="16/9" sizes="(max-width: 768px) 100vw, 420px" position="center 25%" className="[&_img]:transition-transform [&_img]:duration-500 [&_img]:group-hover:scale-105">
        <span className="absolute top-3 left-3 rounded-full bg-ochre-400 px-3 py-1 text-[11px] font-bold tracking-wide text-ink-950 uppercase">Curator open call</span>
        <span className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-ink-950/70 px-3 py-1 text-xs font-semibold text-paper-50 backdrop-blur"><span aria-hidden><Icon name="time" size={18} /></span>{c.days} days left</span>
      </Photo>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-2xl leading-tight font-medium">{c.title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-mute">{c.blurb}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">{c.tags.map((t) => <Chip key={t} tone="outline">{t}</Chip>)}</div>
        <div className="mt-auto flex items-center gap-3 pt-5">
          <Avatar person={by} size={34} />
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-sm font-semibold">{by.name}</p>
            <p className="truncate text-xs text-mute">Verified curator · {c.city}</p>
          </div>
          <span className="rounded-full bg-ink-900 px-4 py-2 text-xs font-semibold text-paper-50 group-hover:bg-ink-700">View call</span>
        </div>
      </div>
    </Link>
  );
}

export function StoryCard({ s, className }: { s: Story; className?: string }) {
  const by = PEOPLE[s.by];
  return (
    <Link href={`/stories/${s.id}`} className={cn("card card-lift group flex flex-col overflow-hidden", className)}>
      <Photo name={s.photo} ratio="4/3" sizes="(max-width: 768px) 100vw, 400px" className="[&_img]:transition-transform [&_img]:duration-500 [&_img]:group-hover:scale-105">
        <span className="absolute top-3 left-3 rounded-full bg-paper-50 px-3 py-1 text-[11px] font-bold tracking-wide text-ink-900 uppercase">{s.kind}</span>
        {s.voice && (
          <span className="absolute right-3 bottom-3 flex items-center gap-1.5 rounded-full bg-clay-500 py-1 pr-3 pl-2 text-xs font-semibold text-paper-50 shadow-lift">
            <span aria-hidden><Icon name="play-media" size={18} /></span> {s.voice} in their voice
          </span>
        )}
      </Photo>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-2.5 text-[13px] text-mute">
          <Avatar person={by} size={26} />
          <span className="truncate">{by.name} · {by.city}</span>
        </div>
        <h3 className="font-display mt-3 text-[23px] leading-tight font-medium">{s.title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-mute">{s.excerpt}</p>
        <div className="mt-auto flex items-center justify-between border-t border-line pt-3.5 text-xs text-mute" style={{ marginTop: "1.25rem" }}>
          <span>{s.read} read</span>
          <span>{s.reflections} reflections</span>
        </div>
      </div>
    </Link>
  );
}

const MODE_GLYPH = { Live: "live", Virtual: "screen", "360°": "world", VR: "video-play" } as const;

export function StudioTile({ v, className }: { v: StudioVisit; className?: string }) {
  const a = PEOPLE[v.artist];
  return (
    <Link href="/studios" className={cn("group relative block overflow-hidden rounded-[22px]", className)}>
      <Photo name={v.photo} ratio="4/5" sizes="(max-width: 768px) 60vw, 300px" className="[&_img]:transition-transform [&_img]:duration-700 [&_img]:group-hover:scale-105" />
      <div className="absolute inset-0 bg-linear-to-t from-ink-950/90 via-ink-950/25 to-transparent" />
      <span className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-paper-50 px-3 py-1 text-[11px] font-bold tracking-wide text-ink-900 uppercase">
        <Glyph g={MODE_GLYPH[v.mode]} size={13} /> {v.mode}
      </span>
      <div className="absolute inset-x-0 bottom-0 p-4 text-paper-50">
        <p className="text-xs text-ochre-200">{v.when}</p>
        <p className="font-display mt-0.5 text-xl leading-tight">{a.name}</p>
        <p className="text-[13px] text-paper-100/85">{a.role} · {v.place}</p>
      </div>
    </Link>
  );
}
