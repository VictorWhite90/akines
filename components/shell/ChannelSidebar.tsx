"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { Book1, Briefcase, Colorfilter, DocumentText, Home2, InfoCircle, Lock1, Lovely, Microphone2, People, ShieldTick, Crown1, Chart2, Add, Layer, Note1, VideoPlay, TaskSquare, Radar, Edit2 } from "iconsax-reactjs";
import { CIRCLES, getPerson, INTRODUCTIONS, ME_ID, PROJECTS, PROJECT_STAGES } from "@/lib/data";
import { DIRECT_THREADS, LIVE_ROOM_IDS, channelsFor, roomsFor } from "@/lib/data/village";
import { cn } from "@/lib/cn";
import { PresenceAvatar } from "@/components/village/Presence";
import { matchesPath, type SpaceId } from "./nav";
import UserPanel from "./UserPanel";

function Group({ label, children, action }: { label: string; children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mt-5 first:mt-2">
      <div className="flex items-center justify-between px-2">
        <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-night-muted">{label}</p>
        {action}
      </div>
      <ul className="mt-1 flex flex-col gap-0.5">{children}</ul>
    </div>
  );
}

function Row({ href, icon, label, active, hint, dim }: { href: string; icon: ReactNode; label: string; active: boolean; hint?: ReactNode; dim?: boolean }) {
  return (
    <li>
      <Link
        href={href}
        title={label}
        aria-current={active ? "page" : undefined}
        className={cn(
          "flex items-center gap-2 rounded-[6px] px-2 py-1.5 text-[15px] transition-colors",
          active ? "bg-night-600 font-semibold text-white" : cn("hover:bg-night-700 hover:text-white", dim ? "text-night-muted" : "text-night-text"),
        )}
      >
        <span className="flex w-5 shrink-0 justify-center text-night-muted">{icon}</span>
        <span className="min-w-0 flex-1 truncate">{label}</span>
        {hint}
      </Link>
    </li>
  );
}

const hash = <span aria-hidden className="text-lg leading-none">#</span>;

function HomeChannels({ pathname }: { pathname: string }) {
  const pending = INTRODUCTIONS.length;
  return (
    <>
      <Group label="Home">
        <Row href="/" icon={<Home2 size={18} color="currentColor" aria-hidden />} label="Today" active={pathname === "/"} />
        <Row href="/introductions" icon={<People size={18} color="currentColor" aria-hidden />} label="Introductions" active={matchesPath(pathname, "/introductions")} hint={<span className="rounded-full bg-live px-1.5 text-[11px] font-bold text-white">{pending}</span>} />
        <Row href="/rooms" icon={<Microphone2 size={18} color="currentColor" aria-hidden />} label="All palavers" active={pathname === "/rooms"} />
      </Group>
      <Group label="Direct messages">
        {DIRECT_THREADS.map((t) => {
          const person = getPerson(t.personId);
          return (
            <li key={t.personId}>
              <Link
                href={`/dm/${t.personId}`}
                aria-current={matchesPath(pathname, `/dm/${t.personId}`) ? "page" : undefined}
                className={cn(
                  "flex items-center gap-2.5 rounded-[6px] px-2 py-1.5 text-[15px]",
                  matchesPath(pathname, `/dm/${t.personId}`) ? "bg-night-600 font-semibold text-white" : "text-night-text hover:bg-night-700 hover:text-white",
                )}
              >
                <PresenceAvatar personId={t.personId} name={person.name} size="sm" ring="ring-night-800" />
                <span className="min-w-0 flex-1 truncate">{person.name}</span>
              </Link>
            </li>
          );
        })}
      </Group>
      <Group label="You">
        <Row href="/dna" icon={<Colorfilter size={18} color="currentColor" aria-hidden />} label="Creative DNA" active={matchesPath(pathname, "/dna")} />
        <Row href="/wellbeing" icon={<Lovely size={18} color="currentColor" aria-hidden />} label="Wellbeing" active={matchesPath(pathname, "/wellbeing")} hint={<Lock1 size={13} color="currentColor" aria-label="Private" />} />
        <Row href="/trust" icon={<ShieldTick size={18} color="currentColor" aria-hidden />} label="Trust & privacy" active={matchesPath(pathname, "/trust")} />
        <Row href="/membership" icon={<Crown1 size={18} color="currentColor" aria-hidden />} label="Membership" active={matchesPath(pathname, "/membership")} />
      </Group>
      <Group label="About this prototype">
        <Row href="/concept" icon={<DocumentText size={18} color="currentColor" aria-hidden />} label="Concept coverage" active={matchesPath(pathname, "/concept")} dim />
        <Row href="/pilot" icon={<Chart2 size={18} color="currentColor" aria-hidden />} label="Pilot & measures" active={matchesPath(pathname, "/pilot")} dim />
      </Group>
    </>
  );
}

function CircleChannels({ circleId, pathname }: { circleId: string; pathname: string }) {
  const circle = CIRCLES.find((c) => c.id === circleId)!;
  const rooms = roomsFor(circleId);
  return (
    <>
      <Group label="Palavers · 6 seats" action={<Link href="/rooms" aria-label="Start a palaver" className="text-night-muted hover:text-white"><Add size={16} color="currentColor" aria-hidden /></Link>}>
        {rooms.length === 0 && <li className="px-2 py-1.5 text-sm text-night-muted">No palaver scheduled yet.</li>}
        {rooms.map((room) => {
          const live = LIVE_ROOM_IDS.includes(room.id);
          const active = matchesPath(pathname, `/rooms/${room.id}`);
          return (
            <li key={room.id}>
              <Link href={`/rooms/${room.id}`} title={`${room.title} · ${live ? "live now" : room.when}`} aria-current={active ? "page" : undefined} className={cn("block rounded-[6px] px-2 py-1.5", active ? "bg-night-600 text-white" : "text-night-text hover:bg-night-700 hover:text-white")}>
                <span className="flex items-center gap-2 text-[15px]">
                  <span className="flex w-5 justify-center text-night-muted"><Microphone2 size={17} color="currentColor" aria-hidden /></span>
                  <span className="min-w-0 flex-1 truncate">{room.title}</span>
                  <span className={cn("text-[11px]", live ? "font-bold text-fire" : "text-night-muted")}>{live ? "LIVE" : `${room.participantIds.length}/6`}</span>
                </span>
                {live && (
                  <span className="ml-7 mt-1 flex flex-col gap-1">
                    {room.participantIds.map((id) => (
                      <span key={id} className="flex items-center gap-2 text-xs text-night-muted">
                        <PresenceAvatar personId={id} name={getPerson(id).name} size="xs" ring="ring-night-800" />
                        {getPerson(id).name.split(" ")[0]}
                      </span>
                    ))}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </Group>
      <Group label="Channels">
        {channelsFor(circleId).map((ch) => (
          <Row key={ch.id} href={`/c/${circleId}/${ch.id}`} icon={ch.kind === "announce" ? <InfoCircle size={17} color="currentColor" aria-hidden /> : ch.kind === "feedback" ? <Edit2 size={16} color="currentColor" aria-hidden /> : ch.kind === "calls" ? <Briefcase size={16} color="currentColor" aria-hidden /> : hash} label={ch.name} active={pathname === `/c/${circleId}/${ch.id}`} />
        ))}
      </Group>
      <Group label="About">
        <Row href={`/circles/${circle.id}`} icon={<InfoCircle size={17} color="currentColor" aria-hidden />} label="Guidelines & moderators" active={matchesPath(pathname, `/circles/${circle.id}`)} />
      </Group>
    </>
  );
}

function StudioChannels({ pathname }: { pathname: string }) {
  const mine = PROJECTS.filter((p) => p.memberIds.includes(ME_ID));
  const shown = PROJECTS.filter((p) => !p.memberIds.includes(ME_ID) && (p.stage === "present" || p.stage === "preserve"));
  const stageLabel = (id: string) => PROJECT_STAGES.find((s) => s.id === id)?.label;
  return (
    <>
      <Group label="Studio">
        <Row href="/studio" icon={<Layer size={18} color="currentColor" aria-hidden />} label="Overview & matching" active={pathname === "/studio"} />
      </Group>
      <Group label="Your private spaces">
        {mine.map((p) => (
          <Row key={p.id} href={`/studio/${p.id}`} icon={<Lock1 size={16} color="currentColor" aria-hidden />} label={p.title} active={matchesPath(pathname, `/studio/${p.id}`)} hint={<span className="text-[11px] text-night-muted">{stageLabel(p.stage)}</span>} />
        ))}
      </Group>
      <Group label="Made on Artelia">
        {shown.map((p) => (
          <Row key={p.id} href={`/studio/${p.id}`} icon={hash} label={p.title} active={matchesPath(pathname, `/studio/${p.id}`)} dim />
        ))}
      </Group>
    </>
  );
}

function OpportunityChannels({ pathname }: { pathname: string }) {
  return (
    <Group label="Opportunities">
      <Row href="/opportunities" icon={<Briefcase size={18} color="currentColor" aria-hidden />} label="Open calls" active={pathname === "/opportunities" || /^\/opportunities\/(?!new)/.test(pathname)} />
      <Row href="/applications" icon={<TaskSquare size={18} color="currentColor" aria-hidden />} label="My applications" active={matchesPath(pathname, "/applications")} />
      <Row href="/opportunities/new" icon={<Add size={18} color="currentColor" aria-hidden />} label="Publish a call" active={pathname === "/opportunities/new"} />
      <Row href="/curator" icon={<Radar size={18} color="currentColor" aria-hidden />} label="Curator desk" active={matchesPath(pathname, "/curator")} dim />
    </Group>
  );
}

function GalleryChannels({ pathname }: { pathname: string }) {
  return (
    <Group label="Gallery">
      <Row href="/stories" icon={<Book1 size={18} color="currentColor" aria-hidden />} label="Stories" active={matchesPath(pathname, "/stories")} />
      <Row href="/journals" icon={<Note1 size={18} color="currentColor" aria-hidden />} label="Journals" active={matchesPath(pathname, "/journals")} />
      <Row href="/studio-visits" icon={<VideoPlay size={18} color="currentColor" aria-hidden />} label="Studio visits" active={matchesPath(pathname, "/studio-visits")} />
    </Group>
  );
}

const TITLES: Record<string, string> = { home: "Home", studio: "Collaboration Studio", opportunities: "Opportunities", gallery: "Gallery" };

export default function ChannelSidebar({ space, pathname }: { space: SpaceId; pathname: string }) {
  const circleId = space.startsWith("circle:") ? space.slice(7) : null;
  const circle = circleId ? CIRCLES.find((c) => c.id === circleId) : null;

  return (
    <div className="flex h-full w-[260px] shrink-0 flex-col bg-night-800">
      {circle ? (
        <div className="relative h-28 shrink-0 overflow-hidden">
          <Image src={circle.image} alt="" fill sizes="260px" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-night-800 via-night-800/60 to-transparent" />
          <div className="absolute bottom-3 left-4 right-4">
            <p className="font-playfair text-xl font-bold text-white">{circle.name}</p>
            <p className="text-xs text-night-muted">Moderated circle</p>
          </div>
        </div>
      ) : (
        <div className="flex h-14 shrink-0 items-center border-b border-night-950/60 px-4">
          <p className="font-playfair text-lg font-bold text-white">{TITLES[space] ?? "Home"}</p>
        </div>
      )}
      <nav aria-label="Channels" className="scrollbar-hide min-h-0 flex-1 overflow-y-auto px-2 pb-4">
        {space === "home" && <HomeChannels pathname={pathname} />}
        {circleId && <CircleChannels circleId={circleId} pathname={pathname} />}
        {space === "studio" && <StudioChannels pathname={pathname} />}
        {space === "opportunities" && <OpportunityChannels pathname={pathname} />}
        {space === "gallery" && <GalleryChannels pathname={pathname} />}
      </nav>
      <UserPanel />
    </div>
  );
}
