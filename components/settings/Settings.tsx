"use client";

import Link from "next/link";
import { ArrowLeft2, ArrowRight2, Devices, DocumentDownload, Lock1, Profile, ShieldSecurity, UserMinus } from "iconsax-reactjs";
import BlockedSection from "./BlockedSection";
import DataSection from "./DataSection";
import DevicesSection from "./DevicesSection";
import PrivacySection from "./PrivacySection";
import PersonalSection from "./PersonalSection";
import SecuritySection from "./SecuritySection";
import type { SectionId } from "./sections";

const SECTIONS: { id: SectionId; label: string; hint: string; Icon: typeof Profile; View: () => React.JSX.Element }[] = [
  { id: "personal", label: "Personal details", hint: "Mobile number, date of birth, email", Icon: Profile, View: PersonalSection },
  { id: "privacy", label: "Privacy", hint: "Who can message you, search", Icon: Lock1, View: PrivacySection },
  { id: "security", label: "Password and security", hint: "Password, two-step verification", Icon: ShieldSecurity, View: SecuritySection },
  { id: "devices", label: "Devices", hint: "Where you're signed in", Icon: Devices, View: DevicesSection },
  { id: "blocked", label: "Blocked members", hint: "People you've blocked", Icon: UserMinus, View: BlockedSection },
  { id: "data", label: "Your data", hint: "Download or delete your account", Icon: DocumentDownload, View: DataSection },
];

/** Settings: a list of sections on phones; a side menu with the section beside it on wider screens. */
export default function Settings({ section }: { section?: SectionId }) {
  const current = SECTIONS.find((s) => s.id === section);

  return (
    <div className={`kh st${current ? " st-open" : ""}`}>
      <nav className="st-nav" aria-label="Settings">
        <h1>Settings</h1>
        <ul>
          {SECTIONS.map(({ id, label, hint, Icon }) => (
            <li key={id}>
              <Link href={`/settings/${id}`} className={id === current?.id ? "on" : undefined} aria-current={id === current?.id ? "page" : undefined}>
                <Icon size={20} color="currentColor" />
                <span><b>{label}</b><small>{hint}</small></span>
                <ArrowRight2 size={16} color="currentColor" className="st-chev" />
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <section className="st-body">
        {current ? (
          <>
            <Link href="/settings" className="st-back"><ArrowLeft2 size={18} color="currentColor" />Settings</Link>
            <header className="st-head">
              <h2>{current.label}</h2>
              <p>{current.hint}</p>
            </header>
            <current.View />
          </>
        ) : (
          <p className="kh-none st-pick">Choose a section.</p>
        )}
      </section>
    </div>
  );
}
