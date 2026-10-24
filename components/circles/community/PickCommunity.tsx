"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { communities, type Community } from "@/lib/api/community";
import { hasCirclePrefill } from "../kincircleDraft";

/**
 * "Start a small circle": small circles live inside a community, so first pick which one.
 * The start-a-circle form then opens on that community's Circles tab.
 */
export default function PickCommunity() {
  const [mine, setMine] = useState<Community[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fromElsewhere, setFromElsewhere] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- read once: was a circle handed over from a Banter, game or chat?
    setFromElsewhere(hasCirclePrefill());
    void communities.mine().then((r) => (r.ok ? setMine(r.data) : setError(r.message)));
  }, []);

  return (
    <div className="kh cm-choose cm-pick">
      <Link href="/circles/new" className="cm-back">← Back</Link>
      <header>
        <p className="cm-over">Start a small circle</p>
        <h1>Which community is it for?</h1>
        <p>
          Small circles (3 to 8 people) live inside a community, so the people you invite already share something.
          {fromElsewhere && " We'll bring over the name and purpose you started with."}
        </p>
      </header>

      {error && <p className="st-notice bad" role="alert">{error}</p>}
      {mine === null && !error ? (
        <p className="kh-none" aria-busy="true">Loading your communities…</p>
      ) : mine && mine.length === 0 ? (
        <div className="kh-card cm-none">
          <h3>You&apos;re not in a community yet</h3>
          <p>Join one you like, or start your own, then start small circles inside it.</p>
          <div className="st-row">
            <Link href="/circles" className="kh-btn amber">Find a community</Link>
            <Link href="/circles/new?size=community" className="kh-btn outline">Start a community</Link>
          </div>
        </div>
      ) : (
        <ul className="cm-pick-communities">
          {mine?.map((c) => (
            <li key={c.id}>
              <Link href={`/circles/community/${c.id}?tab=circles&start=circle`} className="cm-pick-row">
                <span className={`cm-pick-cover${c.cover_photo ? "" : " no-photo"}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element -- leader-uploaded cover, resized on the server */}
                  {c.cover_photo ? <img src={c.cover_photo} alt="" /> : <b>{c.name.slice(0, 1).toUpperCase()}</b>}
                </span>
                <span className="cm-pick-tx">
                  <b>{c.name}</b>
                  <small>{c.category_label} · {c.member_count.toLocaleString()} {c.member_count === 1 ? "member" : "members"}{c.my_role === "leader" ? " · You lead it" : ""}</small>
                </span>
                <span className="cm-pick-go" aria-hidden>→</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
