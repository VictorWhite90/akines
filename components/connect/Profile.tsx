"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { Check, Eye } from "lucide-react";
import Button from "@/components/kin/Button";
import { faceSrc } from "@/components/kin/home/parts";
import { profileOf, profilePath, type Profile } from "@/lib/connect/profiles";
import { MATCHES } from "@/lib/data/matches";
import type { PersonId } from "@/lib/data/people";
import { first } from "./data";
import { BackLink } from "./parts";
import { useDiscoverState } from "./state";
import "./profile.css";

/**
 * Connect, People: a member's public profile, mirrored from the product design (connect/discover/profile.tsx, 11.73),
 * plus its Loading and Could not load frames. Connect becomes "Requested" (the person's Discover card reads the same) and
 * Say hello "Hello sent" (their suggestion, if they are one, reads sent too).
 */

const LOADING_MS = 1500;
/** Where Loading ends, and Try again after it: the first suggestion's profile (the design goes to its first person). */
const FALLBACK = MATCHES[0]?.id ?? "ayo";

function Done({ label }: { label: string }) {
  return <div className="dxl-pill"><Check size={16} strokeWidth={1.5} absoluteStrokeWidth aria-hidden focusable={false} /><span>{label}</span></div>;
}

function ProfileView({ profile }: { profile: Profile }) {
  const d = useDiscoverState();
  const name = first(profile.id) || profile.name.split(" ")[0];
  const nameId = `dxp-name-${profile.id}`;
  const photo = faceSrc(profile.id as PersonId, 720) ?? profile.photo ?? undefined;
  return (
    <div className="dxp-body">
      <article className="dxp-main" aria-labelledby={nameId}>
        <BackLink href="/connect">Back to Discover</BackLink>
        <div className="dxp-header">
          <div className="fd-photo dxp-portrait" data-m="frame">
            {/* eslint-disable-next-line @next/next/no-img-element -- the member's portrait */}
            {photo ? <img className="cover" src={photo} alt="" decoding="async" draggable={false} /> : null}
          </div>
          <div className="dxp-info">
            <h1 className="dxp-name" id={nameId}>{profile.name}</h1>
            <p className="dxp-role">{[profile.role, profile.city].filter(Boolean).join(" · ")}</p>
            {profile.intro ? <p className="dxp-intro">{profile.intro}</p> : null}
            {profile.tags.length ? <ul className="dxl-tags">{profile.tags.map((t) => <li className="dxl-tag" key={t}>{t}</li>)}</ul> : null}
          </div>
        </div>
        {profile.about ? (
          <section className="dxl-block" aria-labelledby={`${nameId}-about`}>
            <h2 className="dxl-eyebrow" id={`${nameId}-about`}>ABOUT</h2>
            <p className="dxl-body">{profile.about}</p>
          </section>
        ) : null}
        {profile.interests.length ? (
          <section className="dxl-block" aria-labelledby={`${nameId}-interests`}>
            <h2 className="dxl-eyebrow" id={`${nameId}-interests`}>INTERESTS</h2>
            <ul className="dxl-tags">{profile.interests.map((t) => <li className="dxl-tag" key={t}>{t}</li>)}</ul>
          </section>
        ) : null}
      </article>

      <aside className="dxp-side" aria-label={`Connect with ${name}`}>
        <section className="dxl-panel" aria-labelledby={`${nameId}-connect`}>
          <h2 className="dxl-eyebrow" id={`${nameId}-connect`}>{`CONNECT WITH ${name.toUpperCase()}`}</h2>
          <div aria-live="polite" aria-atomic="true">
            {d.isRequested(profile.id) ? <Done label="Requested" /> : <Button full onClick={() => d.connect(profile.id)}>Connect</Button>}
          </div>
          <div aria-live="polite" aria-atomic="true">
            {d.helloSent(profile.id) ? <Done label="Hello sent" /> : <Button variant="secondary" full onClick={() => d.sayHello(profile.id)}>Say hello</Button>}
          </div>
        </section>
        <section className="dxl-panel dxl-panel--tight" aria-labelledby={`${nameId}-seeing`}>
          <div className="dxl-panel__head">
            <Eye size={16} strokeWidth={1.25} absoluteStrokeWidth aria-hidden focusable={false} />
            <h2 className="dxl-eyebrow" id={`${nameId}-seeing`}>WHAT YOU’RE SEEING</h2>
          </div>
          <p className="dxl-note dxl-note--plain">{`${name}’s public profile on Akines. Private information stays private.`}</p>
        </section>
      </aside>
    </div>
  );
}

const Bar = ({ w, h, className = "" }: { w: number | string; h: number; className?: string }) => <span className={`dxp-bar ${className}`.trim()} style={{ width: w, height: h }} />;

function ProfileLoading() {
  const router = useRouter();
  const go = useRef(router);
  useEffect(() => { go.current = router; }, [router]);
  // Replace, so Back does not return to the skeleton
  useEffect(() => {
    const t = window.setTimeout(() => go.current.replace(profilePath(FALLBACK)), LOADING_MS);
    return () => window.clearTimeout(t);
  }, []);
  return (
    <div className="dxp-body" role="status" aria-busy="true">
      <p className="sr-only">Getting things ready</p>
      <div className="dxp-main" aria-hidden>
        <Bar w={190} h={14} />
        <div className="dxp-header">
          <Bar w={280} h={352} />
          <div className="dxp-info dxp-sk-info">
            <Bar w={140} h={12} /><Bar w={320} h={56} /><Bar w={190} h={16} /><Bar w={540} h={18} /><Bar w={500} h={18} /><Bar w={360} h={18} />
            <div className="dxp-sk-chips"><Bar w={120} h={36} /><Bar w={120} h={36} /><Bar w={120} h={36} /></div>
          </div>
        </div>
        <div className="dxp-sk-block"><Bar w={140} h={12} /><Bar w="100%" h={16} /><Bar w={700} h={16} /></div>
        <div className="dxp-sk-block">
          <Bar w={140} h={12} />
          <div className="dxp-sk-items">{[0, 1, 2].map((i) => <div className="dxp-sk-item" key={i}><Bar w={340} h={22} /><Bar w={420} h={14} /></div>)}</div>
        </div>
        <div className="dxp-sk-block">
          <Bar w={140} h={12} />
          <div className="dxp-sk-chips">{[0, 1, 2, 3].map((i) => <Bar w={120} h={36} key={i} />)}</div>
        </div>
        <div className="dxp-sk-block">
          <Bar w={140} h={12} />
          <div className="dxp-sk-items">{[0, 1, 2, 3].map((i) => <div className="dxp-sk-row" key={i}><Bar w={208} h={14} /><Bar w={400} h={16} /></div>)}</div>
        </div>
      </div>
      <div className="dxp-side" aria-hidden>
        <div className="dxl-panel"><Bar w={200} h={12} /><Bar w="100%" h={48} /><Bar w="100%" h={48} /></div>
        <div className="dxl-panel"><Bar w={160} h={12} /><Bar w="100%" h={14} /><Bar w={300} h={14} /></div>
      </div>
    </div>
  );
}

function ProfileError() {
  const router = useRouter();
  return (
    <div className="dxp-wide">
      <BackLink href="/connect">Back to Discover</BackLink>
      <div className="dxp-error" role="alert">
        <span className="dxp-error__rule" aria-hidden />
        <h1 className="dxp-error__title">We could not load this profile.</h1>
        <p className="dxp-error__text">Check your connection and try again. Your Kin connections are safe.</p>
        <div className="dxp-error__actions">
          <Button onClick={() => router.replace("/connect/people/state-loading")}>Try again</Button>
          <Button variant="secondary" href="/connect">Back to Discover</Button>
        </div>
      </div>
    </div>
  );
}

/** A profile by member id; `state` is the Loading or Could not load route. A member we know nothing about gets Could not load. */
export default function ProfilePage({ id, state }: { id?: string; state?: "loading" | "error" }) {
  const profile = id ? profileOf(id) : undefined;
  const shown = state ?? (profile ? undefined : "error");
  return (
    <div className="fd-page dxp-page" data-profile-state={shown}>
      {shown === "loading" ? <ProfileLoading /> : shown === "error" || !profile ? <ProfileError /> : <ProfileView profile={profile} />}
    </div>
  );
}
