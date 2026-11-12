"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, CircleCheck, ShieldCheck } from "lucide-react";
import Button from "@/components/kin/Button";
import { Chip, Tag } from "@/components/kin/Chip";
import { Toggle } from "@/components/kin/Choice";
import { Drawer } from "@/components/kin/Overlay";
import { faceSrc } from "@/components/kin/home/parts";
import { PEOPLE, type PersonId } from "@/lib/data/people";
import { toggleIn, useConnectionPrefs } from "./prefs";
import Img from "@/components/kin/Img";

/* The design's four connection settings (classes in components/kin/community.css). */

export function Row({ title, text, checked, onChange, children }: { title: string; text: string; checked?: boolean; onChange?: (v: boolean) => void; children?: React.ReactNode }) {
  return (
    <div className="ch-set__row">
      <div className="ch-set__rowtext"><span className="ch-set__rowtitle">{title}</span><span className="ch-set__rowdesc">{text}</span></div>
      {children ?? <Toggle checked={!!checked} onChange={(v) => onChange?.(v)} aria-label={title} />}
    </div>
  );
}

function Save({ id, label }: { id: string; label: string }) {
  const { saved, save } = useConnectionPrefs();
  return (
    <div className="ch-set__save">
      <Button iconRight={<ArrowRight strokeWidth={1.5} aria-hidden />} onClick={() => save(id)}>{label}</Button>
      {saved === id ? <p className="ch-confirm" aria-live="polite"><CircleCheck size={20} strokeWidth={1.5} aria-hidden /><span>Saved. Your choices apply from now on.</span></p> : null}
    </div>
  );
}

function Choices({ label, items, value, onPick, single }: { label: string; items: string[]; value: string[] | number; onPick: (v: string, i: number) => void; single?: boolean }) {
  return (
    <div className="ch-set__group">
      <p className="ch-label">{label}</p>
      <div className="ch-chips" role={single ? "radiogroup" : "group"} aria-label={label}>
        {items.map((a, i) => <Chip key={a} variant="choice" selected={Array.isArray(value) ? value.includes(a) : value === i + 1} onClick={() => onPick(a, i)}>{a}</Chip>)}
      </div>
    </div>
  );
}

export function RecommendationsSection() {
  const { prefs: e, set } = useConnectionPrefs();
  return (
    <>
      <Choices label="Interests Akines may use" items={["Community health", "Making and craft", "Storytelling", "Food systems", "Small business", "Music"]} value={e.interests} onPick={(a) => set({ interests: toggleIn(e.interests, a) })} />
      <div className="ch-set__list">
        <Row title="Suggest people from my Cliqs and KinCircles" text="Start with people you may already share a space with." checked={e.suggestCircles} onChange={(v) => set({ suggestCircles: v })} />
        <Row title="Use the times I have shared" text="Suggest moments that fit when you are usually free." checked={e.useTimes} onChange={(v) => set({ useTimes: v })} />
        <Row title="Use my intention for the day" text="Let what you chose on Community Home shape what you see first." checked={e.useIntention} onChange={(v) => set({ useIntention: v })} />
      </div>
      <Save id="recommendations" label="Save preferences" />
    </>
  );
}

/** The design's three explanations (Tunde, Ngozi, Chuka) and the "Why we matched" drawer each opens, word for word. */
type Why = { id: PersonId; text: string; image: string; tags: string[]; why: string; now: string; together: string; used: string };
const WHY: Why[] = [
  { id: "tunde-bakare", text: "You both develop community-health initiatives and prefer practical, small-group work.", image: "/kin/design/home/community/tunde.jpg", tags: ["Community health", "Small-group work"], why: "You and Tunde are both developing community-health initiatives and prefer practical, small-group collaboration.", now: "You both chose collaboration this week, and Tunde has room for a new Create Call on Thursday.", together: "Compare how you each plan outreach in a 30-minute Create Call, then decide whether to keep working together.", used: "Interests you both chose: community health and small groups. Your collaboration intention. Times you both shared." },
  { id: "ngozi", text: "You both write to remember the people in your lives and prefer quiet, one-to-one conversation.", image: "/kin/design/home/community/ngozi.jpg", tags: ["Storytelling", "Zine-making"], why: "You and Ngozi both write to remember the people in your lives, and you both prefer a quiet, one-to-one conversation.", now: "You both chose evenings as a good time to talk this week.", together: "Start with a Quick Catch-up and see whether you would like to write together.", used: "Interests you both chose: storytelling and zine-making. Conversation style: slow and one to one. Times you both shared." },
  { id: "chuka", text: "You are both starting something of your own and like talking ideas through one person at a time.", image: "/kin/design/home/community/chuka.jpg", tags: ["Small business", "Thinking out loud"], why: "You and Chuka are both starting something of your own and like talking ideas through with one person at a time.", now: "Chuka has joined the KinCircle on starting a purpose-driven business, the one you were invited to.", together: "Talk Something Through for about 20 minutes, with no pressure to continue.", used: "Interests you both chose: small business and thinking out loud. Your KinCircle invitations. Times you both shared." },
];
const firstOf = (id: PersonId) => PEOPLE[id]?.name.split(" ")[0] ?? "them";

export function ExplanationsSection() {
  const { prefs: e, set } = useConnectionPrefs();
  const [why, setWhy] = useState<PersonId | null>(null);
  const [shown, setShown] = useState<PersonId | null>(null);
  if (why && why !== shown) setShown(why);
  return (
    <>
      <div className="ch-set__list" data-m="stagger">
        {WHY.map((m) => {
          const src = faceSrc(m.id);
          return (
            <div key={m.id} className="ch-why">
              <span className="ch-av" style={{ width: 48, height: 48 }}>{src ? <Img src={src} sizes="48px" /> : null}</span>
              <div className="ch-why__text"><span className="ch-why__title">Why {firstOf(m.id)} was suggested</span><span className="ch-why__desc">{m.text}</span></div>
              <button type="button" className="ch-tlink" onClick={() => setWhy(m.id)}>See the full reason</button>
            </div>
          );
        })}
      </div>
      <p className="ch-ov__privacy"><ShieldCheck size={20} strokeWidth={1.25} aria-hidden /><span>Not used: popularity, follower counts or relationship scores. Akines does not show them.</span></p>
      <div className="ch-set__list"><Row title="Show a reason with every suggestion" text="Each person or activity comes with a short explanation." checked={e.showReason} onChange={(v) => set({ showReason: v })} /></div>
      <Save id="explanations" label="Save explanation settings" />
      {shown ? <WhyDrawer id={shown} open={why !== null} onClose={() => setWhy(null)} /> : null}
    </>
  );
}

/** The design's "Why we matched" drawer (520 wide). */
function WhyDrawer({ id, open, onClose }: { id: PersonId; open: boolean; onClose: () => void }) {
  const router = useRouter();
  const m = WHY.find((x) => x.id === id);
  if (!m) return null;
  const qa: [string, string][] = [["Why this person?", m.why], ["Why now?", m.now], ["What could we do together?", m.together], ["What information was used?", m.used]];
  return (
    <Drawer open={open} onClose={onClose} width={520} image={m.image} eyebrow="Why we matched" title={`You and ${firstOf(id)}`} className="ch-ov ch-ov--drawer ch-ov--why">
      <div className="ch-dbody ch-dbody--why">
        <div className="ch-tags">{m.tags.map((t) => <Tag key={t}>{t}</Tag>)}</div>
        <hr className="ch-rule" />
        {qa.map(([q, a]) => (
          <div className="ch-qa" key={q}>
            <p className="ch-ov__label">{q}</p>
            <p className="ch-qa__a">{a}</p>
          </div>
        ))}
        <p className="ch-ov__privacy ch-ov__privacy--shield"><ShieldCheck size={16} strokeWidth={1.25} absoluteStrokeWidth aria-hidden /><span>Not used: popularity, follower counts or relationship scores. Akines does not show them.</span></p>
        <div className="ch-ov__actions ch-ov__actions--wrap ch-dbody__end">
          <Button iconRight={<ArrowRight strokeWidth={1.5} aria-hidden />} onClick={() => { onClose(); router.push(`/messages/${id}`); }}>Introduce us</Button>
          <button type="button" className="ch-tlink" onClick={onClose}>Not now</button>
          <button type="button" className="ch-tlink" onClick={() => { onClose(); router.push("/settings"); }}>Recommendation preferences</button>
        </div>
      </div>
    </Drawer>
  );
}

/** The design's privacy rows, shown under our account privacy settings. */
export function PrivacyExtras() {
  const { prefs: e, set } = useConnectionPrefs();
  return (
    <>
      <div className="ch-set__list">
        <Row title="Show my profile to people in my Cliqs and KinCircles" text="Others in your spaces can see your name, interests and areas of experience." checked={e.showProfile} onChange={(v) => set({ showProfile: v })} />
        <Row title="Show my collaborations on my profile" text="People can see the projects you are building together." checked={e.showCollabs} onChange={(v) => set({ showCollabs: v })} />
        <Row title="Let people see when I was last active" text="Off keeps your activity to yourself." checked={e.showActive} onChange={(v) => set({ showActive: v })} />
        <Row title="Mood check-ins and private notes" text="Always private. They are never shared, sent or shown to anyone."><Tag>Always private</Tag></Row>
      </div>
      <Choices single label="Who can invite me to a conversation" items={["People in my Cliqs and KinCircles", "People I have messaged", "No one for now"]} value={e.invitePolicy} onPick={(_, i) => set({ invitePolicy: i + 1 })} />
      <Save id="privacy" label="Save privacy settings" />
    </>
  );
}

export function ConnectionSection() {
  const { prefs: e, set } = useConnectionPrefs();
  return (
    <>
      <Choices label="Ways I like to connect" items={["Short catch-ups", "Longer conversations", "Making something together", "Quiet company"]} value={e.ways} onPick={(a) => set({ ways: toggleIn(e.ways, a) })} />
      <Choices label="When I am usually free" items={["Mornings", "Afternoons", "Evenings", "Weekends"]} value={e.free} onPick={(a) => set({ free: toggleIn(e.free, a) })} />
      <div className="ch-set__list">
        <Row title="Remind me before a moment starts" text="A gentle reminder, 15 minutes before." checked={e.remind} onChange={(v) => set({ remind: v })} />
        <Row title="Suggest quiet company when my week looks busy" text="A calmer option, never an obligation." checked={e.quietWhenBusy} onChange={(v) => set({ quietWhenBusy: v })} />
      </div>
      <Save id="connection" label="Save connection preferences" />
    </>
  );
}
