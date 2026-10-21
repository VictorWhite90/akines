"use client";

import Link from "next/link";
import { Location } from "iconsax-reactjs";
import Photo from "@/components/ui/Photo";
import { eventDate, naira, type CircleEvent, type CommunityCircle } from "@/lib/data/communityCircles";
import { useCommunities } from "../useCommunities";

/** Sample-data event card, kept for when community events move to the backend (FEATURES.communityEvents). */
export function EventCard({ e, circle }: { e: CircleEvent; circle?: CommunityCircle }) {
  const { seatsTaken, ticketFor } = useCommunities();
  const left = Math.max(0, e.capacity - seatsTaken(e));
  const t = ticketFor(e.id);
  return (
    <Link href={`/circles/community/${e.circleId}/events/${e.id}`} className="cm-ev">
      <Photo name={e.photo} sizes="220px" className="cm-ev-img" />
      <div className="cm-ev-tx">
        <small>{eventDate(e)}</small>
        <b>{e.title}</b>
        <span className="cm-ev-meta"><Location size={14} color="currentColor" />{e.area}{circle ? ` · ${circle.name}` : ""}</span>
        <span className="cm-ev-foot">
          <span className="cm-price">{naira(e.price)}</span>
          {t ? <span className="cm-chip ok">{t.status === "going" ? "You're going" : "On the waitlist"}</span> : left === 0 ? <span className="cm-chip">Full · join waitlist</span> : <span className="cm-chip">{left} {left === 1 ? "spot" : "spots"} left</span>}
        </span>
      </div>
    </Link>
  );
}
