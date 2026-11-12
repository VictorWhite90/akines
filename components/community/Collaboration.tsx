"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Circle, CircleCheck, Clock } from "lucide-react";
import Button from "@/components/kin/Button";
import { photoSrc } from "@/components/kin/home/parts";
import PlanCall, { type Plan } from "@/components/community/PlanCall";
import { ME } from "@/lib/collab/me";
import { useCollab } from "@/lib/collab/useCollab";
import { isMine, workspaceHref } from "@/lib/collab/workspace";
import type { Project } from "@/lib/collab/types";
import { PEOPLE, type PersonId } from "@/lib/data/people";
import { DEMO } from "@/lib/demo/mode";
import { useLocal } from "@/lib/useLocal";
import Img from "@/components/kin/Img";

/*
 * A collaboration you share with someone, as Community Home shows it in the product design (classes ch-split,
 * ch-steps in components/kin/community.css): who it's with, what is done, what is in progress and what comes next,
 * when it last moved, and ways to pick it up together. Read from the project in useCollab.
 */

const WORDS = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];
function ago(at: number) {
  const days = Math.floor((Date.now() - at) / 86400000);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  return `${WORDS[days] ?? days} days ago`;
}
const first = (id: string) => PEOPLE[id as keyof typeof PEOPLE]?.name.split(" ")[0] ?? "A member";
const list = (n: string[]) => (n.length > 1 ? `${n.slice(0, -1).join(", ")} and ${n[n.length - 1]}` : n[0] ?? "");

/** Up to three milestones: the latest done, the one in progress, and the next. Projects without milestones track deliverables. */
function steps(p: Project) {
  const items = p.milestones.length ? p.milestones : (p.deliverables ?? []).map((d) => ({ title: d.title, due: d.due, done: d.status === "approved" }));
  const at = items.findIndex((m) => !m.done);
  const from = at < 0 ? Math.max(0, items.length - 3) : Math.max(0, at - 1);
  return items.slice(from, from + 3).map((m, i) => {
    const idx = from + i;
    const status = m.done ? `Done · ${m.due}` : idx === at ? `In progress · ${m.due}` : `Next · ${m.due || "Not yet planned"}`;
    return { text: m.title, status, done: m.done };
  });
}

/* ---- the product design's two collaborations, shown in preview (its /community/collaborations and /lagos-makers-zine) ---- */
type Step = { text: string; status: string; done?: boolean };
type DesignCollab = {
  id: string; label: string; title: string; desc: string; steps: Step[]; last: string; photo: string;
  message?: { label: string; href: string };
  contribute?: { label: string; done: string };
  plan: Plan;
};
const DESIGN: Record<string, DesignCollab> = {
  "community-health-initiative": {
    id: "community-health-initiative",
    label: "Collaboration · With Amara",
    title: "Community Health Initiative",
    desc: "You and Amara are developing a community-health project.",
    steps: [
      { text: "Agreed the three clinics to visit first", status: "Done · Thursday", done: true },
      { text: "Drafting the outreach plan, which you will send", status: "In progress · This week" },
      { text: "Plan the first clinic visit together", status: "Next · Not yet planned" },
    ],
    last: "Last activity six days ago",
    photo: "/kin/design/home/community/health-tall.jpg",
    message: { label: "Message Amara", href: "/messages/amara" },
    plan: { eyebrow: "Create Call", title: "Arrange a Create Call with Amara", lead: "Pick a time to work on the Community Health Initiative together.", people: ["amara-okafor"], peopleText: "Amara", convo: "amara", note: "Let us draft the outreach plan and agree the first clinic visit.", placeholder: "Add what you would like to work on (optional)", image: "/kin/design/home/community/amara.jpg" },
  },
  "lagos-makers-zine": {
    id: "lagos-makers-zine",
    label: "Collaboration · With Folake and Chuka",
    title: "Lagos Makers Zine",
    desc: "You, Folake and Chuka are putting together the second issue.",
    steps: [
      { text: "Agreed the theme for the second issue", status: "Done · Last month", done: true },
      { text: "Collecting contributions from makers", status: "In progress · This week" },
      { text: "Lay out the pages and print", status: "Next · Not yet planned" },
    ],
    last: "Last activity two days ago",
    photo: "/kin/design/home/community/zine-tall.jpg",
    contribute: { label: "Add a contribution", done: "Contribution noted. Folake and Chuka will see it." },
    plan: { eyebrow: "Create Call", title: "Arrange a Create Call for the zine", lead: "Gather the Lagos Makers Zine team for a working session.", people: ["folake", "chuka"] as PersonId[], peopleText: "Folake and Chuka", note: "Let us go through the contributions so far and plan the layout.", image: "/kin/design/home/community/zine.jpg" },
  },
};

export default function Collaboration({ id }: { id?: string }) {
  const design = DEMO ? DESIGN[id ?? "community-health-initiative"] : undefined;
  return design ? <DesignCollaboration c={design} /> : <ProjectCollaboration id={id} />;
}

function DesignCollaboration({ c }: { c: DesignCollab }) {
  const [planning, setPlanning] = useState(false);
  const [added, setAdded] = useLocal<string[]>("ak:collab-contributed", []);
  const done = added.includes(c.id);
  return (
    <div className="ch-page">
      <div className="ch-split">
        <div className="ch-split__main">
          <Link href="/" className="ch-tlink">Back to Community Home</Link>
          <p className="ch-label">{c.label}</p>
          <h1 className="ch-split__title" data-m="words">{c.title}</h1>
          <p className="ch-split__desc">{c.desc}</p>
          <div className="ch-steps" data-m="stagger">
            {c.steps.map((s) => (
              <div key={s.text} className={`ch-step ${s.done ? "ch-step--done" : "ch-step--todo"}`}>
                {s.done ? <CircleCheck size={20} strokeWidth={1.25} absoluteStrokeWidth aria-hidden /> : <Circle size={20} strokeWidth={1.25} absoluteStrokeWidth aria-hidden />}
                <span className="ch-step__text">{s.text}</span>
                <span className="ch-step__status">{s.status}</span>
              </div>
            ))}
          </div>
          <p className="ch-line"><Clock size={16} strokeWidth={1.25} absoluteStrokeWidth aria-hidden /><span>{c.last}</span></p>
          <div className="ch-acts">
            {c.message ? <Button href={c.message.href} iconRight={<ArrowRight strokeWidth={1.5} aria-hidden />}>{c.message.label}</Button> : null}
            {c.contribute ? (
              done
                ? <p className="ch-confirm" aria-live="polite"><CircleCheck size={20} strokeWidth={1.5} aria-hidden /><span>{c.contribute.done}</span></p>
                : <Button iconRight={<ArrowRight strokeWidth={1.5} aria-hidden />} onClick={() => setAdded([...added, c.id])}>{c.contribute.label}</Button>
            ) : null}
            <Button variant="secondary" onClick={() => setPlanning(true)}>Arrange a Create Call</Button>
          </div>
        </div>
        <div className="ch-split__photo">
          <div className="ch-photo ch-photo--fill" data-m="frame">
            <Img className="cover" src={c.photo} sizes="(max-width: 899px) 100vw, 40vw" priority />
          </div>
        </div>
      </div>
      <PlanCall open={planning} onClose={() => setPlanning(false)} plan={c.plan} />
    </div>
  );
}

function ProjectCollaboration({ id }: { id?: string }) {
  const { projects, ready } = useCollab();
  const mine = projects.filter(isMine);
  const p = id ? mine.find((x) => x.id === id) : mine[0];
  const [planning, setPlanning] = useState(false);
  if (!ready) return <div className="ch-page" aria-busy="true" />;
  if (!p) {
    return (
      <div className="ch-page">
        <div className="ch-split">
          <div className="ch-split__main">
            <Link href="/" className="ch-tlink">Back to Community Home</Link>
            <h1 className="ch-split__title">No collaboration here yet</h1>
            <p className="ch-split__desc">When you start or join a project, you can pick it up together from here.</p>
            <div className="ch-acts"><Button href="/collaborate/discover" iconRight={<ArrowRight strokeWidth={1.5} aria-hidden />}>Discover projects</Button></div>
          </div>
        </div>
      </div>
    );
  }
  const others = p.members.map((m) => m.id).filter((m) => m !== ME);
  const withNames = list(others.map(first));
  const last = p.ledger.reduce((t, e) => Math.max(t, e.at), p.createdAt);
  const one = others.length === 1;
  return (
    <div className="ch-page">
      <div className="ch-split">
        <div className="ch-split__main">
          <Link href="/" className="ch-tlink">Back to Community Home</Link>
          <p className="ch-label">Collaboration · With {withNames}</p>
          <h1 className="ch-split__title" data-m="words">{p.title}</h1>
          <p className="ch-split__desc">{p.summary}</p>
          <div className="ch-steps" data-m="stagger">
            {steps(p).map((s) => (
              <div key={s.text} className={`ch-step ${s.done ? "ch-step--done" : "ch-step--todo"}`}>
                {s.done ? <CircleCheck size={20} strokeWidth={1.25} absoluteStrokeWidth aria-hidden /> : <Circle size={20} strokeWidth={1.25} absoluteStrokeWidth aria-hidden />}
                <span className="ch-step__text">{s.text}</span>
                <span className="ch-step__status">{s.status}</span>
              </div>
            ))}
          </div>
          <p className="ch-line"><Clock size={16} strokeWidth={1.25} absoluteStrokeWidth aria-hidden /><span>Last activity {ago(last)}</span></p>
          <div className="ch-acts">
            <Button href={one ? `/messages/${others[0]}` : `/messages/${p.convoId}`} iconRight={<ArrowRight strokeWidth={1.5} aria-hidden />}>{one ? `Message ${first(others[0])}` : "Message the team"}</Button>
            <Button variant="secondary" onClick={() => setPlanning(true)}>Arrange a Create Call</Button>
          </div>
        </div>
        <div className="ch-split__photo">
          <div className="ch-photo ch-photo--fill" data-m="frame">
            <Img className="cover" src={photoSrc(p.photo)} sizes="(max-width: 899px) 100vw, 40vw" priority />
          </div>
        </div>
      </div>
      <PlanCall
        open={planning}
        onClose={() => setPlanning(false)}
        plan={{
          eyebrow: "Create Call",
          title: one ? `Arrange a Create Call with ${first(others[0])}` : `Arrange a Create Call for ${p.title}`,
          lead: `Pick a time to work on ${p.title} together.`,
          people: others.slice(0, 3),
          convo: one ? undefined : p.convoId,
          note: steps(p).find((s) => !s.done) ? `Shall we work on this together: ${steps(p).find((s) => !s.done)!.text.replace(/\.$/, "").toLowerCase()}?` : "Shall we pick this up together?",
          placeholder: "Add what you would like to work on (optional)",
          image: photoSrc(p.photo),
          href: `${workspaceHref(p.id)}/meet`,
        }}
      />
    </div>
  );
}
