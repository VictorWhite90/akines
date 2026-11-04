"use client";

import Link from "next/link";
import BlockedSection from "./BlockedSection";
import DataSection from "./DataSection";
import DevicesSection from "./DevicesSection";
import PrivacySection from "./PrivacySection";
import PersonalSection from "./PersonalSection";
import SecuritySection from "./SecuritySection";
import { ConnectionSection, ExplanationsSection, RecommendationsSection } from "./ConnectionSections";
import type { SectionId } from "./sections";

/**
 * Settings in the product design's layout (classes in components/kin/community.css): a back link, the section
 * list, and the open section under a title. Our account sections first, then the design's connection settings.
 */
type S = { id: SectionId; label: string; title: string; desc: string; View: () => React.JSX.Element };
const ACCOUNT: S[] = [
  { id: "personal", label: "Personal details", title: "Personal details", desc: "Your mobile number, date of birth and email. Only you can see these.", View: PersonalSection },
  { id: "security", label: "Password and security", title: "Password and security", desc: "Change your password and turn on two-step verification.", View: SecuritySection },
  { id: "devices", label: "Devices", title: "Devices", desc: "Where you are signed in. Sign out of any you do not recognise.", View: DevicesSection },
  { id: "blocked", label: "Blocked members", title: "Blocked members", desc: "People you have blocked cannot message you or see your profile.", View: BlockedSection },
  { id: "data", label: "Your data", title: "Your data", desc: "Download a copy of your data, or delete your account.", View: DataSection },
];
const CONNECTIONS: S[] = [
  { id: "recommendations", label: "Recommendation preferences", title: "Recommendation preferences", desc: "Choose which interests and moments Akines may use to suggest people and activities.", View: RecommendationsSection },
  { id: "explanations", label: "Recommendation explanations", title: "Recommendation explanations", desc: "See why a person or activity was suggested to you, and what information was used.", View: ExplanationsSection },
  { id: "privacy", label: "Privacy settings", title: "Privacy settings", desc: "Control who can see you and what stays private to you.", View: PrivacySection },
  { id: "connection", label: "Connection preferences", title: "Connection preferences", desc: "Tell Akines how you like to spend time with others.", View: ConnectionSection },
];
const ALL = [...ACCOUNT, ...CONNECTIONS];

export default function Settings({ section }: { section?: SectionId }) {
  const current = ALL.find((s) => s.id === section) ?? CONNECTIONS[0];
  const item = (s: S) => <Link key={s.id} href={`/settings/${s.id}`} className={`ch-nav__item${s.id === current.id ? " ch-nav__item--on" : ""}`} aria-current={s.id === current.id ? "page" : undefined}>{s.label}</Link>;
  return (
    <div className="ch-page">
      <div className="ch-set">
        <nav className="ch-nav" aria-label="Settings">
          <Link href="/" className="ch-tlink">Back to Community Home</Link>
          <span className="ch-nav__space" />
          <p className="ch-label">Your connections</p>
          {CONNECTIONS.map(item)}
          <span className="ch-nav__space" />
          <p className="ch-label">Your account</p>
          {ACCOUNT.map(item)}
        </nav>
        <div className="ch-set__main">
          {/* Keyed by title: the reveal splits it into words, so a new section gets a fresh heading. */}
          <h1 className="ch-set__title" data-m="words" key={current.title}>{current.title}</h1>
          <p className="ch-set__desc">{current.desc}</p>
          <current.View />
        </div>
      </div>
    </div>
  );
}
