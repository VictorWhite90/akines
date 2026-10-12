"use client";

import Link from "next/link";
import { useState } from "react";
import { Calendar, Clock, LanguageSquare, Messages2, Notification, People, TickCircle } from "iconsax-reactjs";
import Avatar, { AvatarStack } from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Chip from "@/components/ui/Chip";
import EmptyState from "@/components/ui/EmptyState";
import TrustLabel from "@/components/ui/TrustLabel";
import { ME, getPerson } from "@/lib/data";
import { ALL_ROOMS, FORMAT_LABEL, THEMES, circleName, roleMix, roomPeople } from "../_data";
import SeatDots from "./SeatDots";

export default function RoomsBrowser() {
  const [theme, setTheme] = useState<string | null>(null);
  const [notify, setNotify] = useState<Set<string>>(new Set());
  const rooms = theme ? ALL_ROOMS.filter((room) => room.theme === theme) : ALL_ROOMS;

  function toggleNotify(id: string) {
    setNotify((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter rooms by theme">
        <Chip selected={theme === null} onToggle={() => setTheme(null)}>All themes</Chip>
        {THEMES.map((t) => (
          <Chip key={t} selected={theme === t} onToggle={() => setTheme(theme === t ? null : t)}>
            {t}
          </Chip>
        ))}
      </div>
      <p className="sr-only" aria-live="polite">
        {rooms.length} {rooms.length === 1 ? "room" : "rooms"} shown
      </p>

      {rooms.length === 0 ? (
        <EmptyState title="No rooms on this theme yet" description="Start one — six seats is all it takes." />
      ) : (
        <ul className="flex flex-col gap-4">
          {rooms.map((room) => {
            const people = roomPeople(room);
            const facilitator = getPerson(room.facilitatorId);
            const taken = room.participantIds.length;
            const full = taken >= room.capacity;
            const mine = room.participantIds.includes(ME.id);
            const circle = circleName(room.circleId);
            const wantsNotice = notify.has(room.id);

            return (
              <Card as="li" key={room.id} className="flex flex-col gap-4 p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone="gold">{room.theme}</Badge>
                  {mine && <Badge tone="green" icon={<TickCircle size={12} variant="Bold" color="currentColor" aria-hidden />}>You have a seat</Badge>}
                  {full && !mine && <Badge tone="ruby">Full</Badge>}
                </div>

                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-playfair text-xl font-semibold leading-snug text-green-950">
                      <Link href={`/rooms/${room.id}`} className="hover:underline">{room.title}</Link>
                    </h3>
                    <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-grey-700">
                      <li className="flex items-center gap-1.5"><Calendar size={14} color="currentColor" aria-hidden />{room.when}</li>
                      <li className="flex items-center gap-1.5"><Clock size={14} color="currentColor" aria-hidden />{room.durationMin} min</li>
                      <li className="flex items-center gap-1.5"><Messages2 size={14} color="currentColor" aria-hidden />{FORMAT_LABEL[room.format]}</li>
                      <li className="flex items-center gap-1.5"><LanguageSquare size={14} color="currentColor" aria-hidden />{room.language}</li>
                    </ul>
                    <p className="mt-3 text-sm text-grey-800">Opening prompt: “{room.prompts[0]}”</p>
                  </div>

                  <div className="flex shrink-0 flex-col gap-2 md:items-end">
                    <SeatDots taken={taken} />
                    <span className="flex items-center gap-2 text-xs text-grey-700">
                      <People size={14} color="currentColor" aria-hidden />
                      {roleMix(people)}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-4 border-t border-sand-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 flex-wrap items-center gap-3 text-sm">
                    <Avatar name={facilitator.name} size="sm" verified={facilitator.verified} />
                    <span className="text-grey-700">
                      Facilitated by{" "}
                      <Link href={`/people/${facilitator.id}`} className="font-semibold text-green-950 hover:underline">{facilitator.name}</Link>
                    </span>
                    {facilitator.verified && <TrustLabel source="verified" compact />}
                    {circle && room.circleId && (
                      <span className="text-grey-700">
                        · from the <Link href={`/circles/${room.circleId}`} className="font-semibold text-green-950 underline underline-offset-4">{circle} circle</Link>
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <AvatarStack names={people.map((p) => p.name)} max={6} size="xs" />
                    {full && !mine ? (
                      <Button
                        size="sm"
                        variant={wantsNotice ? "ghost" : "outline"}
                        aria-pressed={wantsNotice}
                        onClick={() => toggleNotify(room.id)}
                        icon={wantsNotice ? <TickCircle size={16} color="currentColor" aria-hidden /> : <Notification size={16} color="currentColor" aria-hidden />}
                      >
                        {wantsNotice ? "We'll tell you if a seat opens" : "Tell me if a seat opens"}
                      </Button>
                    ) : (
                      <Button href={`/rooms/${room.id}`} size="sm" variant={mine ? "outline" : "primary"}>
                        {mine ? "Open your room" : "Take a seat"}
                      </Button>
                    )}
                  </div>
                </div>
                <p className={wantsNotice ? "text-xs text-grey-700" : "sr-only"} aria-live="polite">
                  {wantsNotice ? `Saved. If someone leaves “${room.title}”, you'll get one quiet notification — no reminders after that.` : ""}
                </p>
              </Card>
            );
          })}
        </ul>
      )}
    </div>
  );
}
