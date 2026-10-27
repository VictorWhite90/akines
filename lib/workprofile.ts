"use client";

import type { IconName } from "@/components/ui/Icon";
import type { ProofFile, ProofLink } from "@/lib/collab/types";
import { newId, useLocal } from "@/lib/useLocal";
import { DEMO } from "@/lib/demo/mode";
import { useRemoteWork } from "@/lib/api/work";
import { samplePieces, usePortfolio } from "@/lib/portfolio";

/**
 * A member's work profile: what they do, years of experience, skills, projects, CV and links, and availability,
 * built in a few skippable steps like a freelance profile. The CV carries the detail (jobs, schools), so the
 * profile doesn't ask for it again. (`experience`, `education` and `certificates` stay in the shape for the
 * API and older saved profiles, but the setup no longer asks for them.) It shows on the Work tab of their profile and goes
 * with every application. Projects live in lib/portfolio (shared with My Studio). Saved to the backend
 * (lib/api/work.ts); demo builds keep it in the browser ("ak:workprofile").
 */
export type ExperienceKind = "Job" | "Freelance" | "Own business" | "Volunteer" | "Community" | "Internship";
export type Experience = { id: string; title: string; org: string; kind: ExperienceKind; from: string; to?: string; current?: boolean; place?: string; summary?: string };
export type Education = { id: string; school: string; qualification: string; field?: string; year?: string };
export type Certificate = { id: string; name: string; issuer: string; year?: string; link?: string };
/** Years of experience, the way most job and freelance sites ask it. Older saved profiles used words; see levelLabel. */
export type Level = "0–1 years" | "2–4 years" | "4+ years";
export type RateUnit = "hour" | "day" | "project" | "negotiable" | "unpaid";

export type WorkProfile = {
  field: string;
  headline: string;
  level?: Level;
  about: string;
  skills: string[];
  experience: Experience[];
  noExperience?: boolean;
  education: Education[];
  certificates: Certificate[];
  openTo: string[];
  hours?: string;
  rate?: { amount?: number; unit: RateUnit };
  where?: "In person" | "Remote" | "Both";
  area?: string;
  languages: string[];
  links: ProofLink[];
  cv?: ProofFile;
  /** Set when the member first publishes; until then the setup is a draft they can come back to. */
  publishedAt?: number;
  updatedAt?: number;
};

export const WORK_KEY = "ak:workprofile";

export const WORK_FIELDS: { id: string; icon: IconName; hint: string }[] = [
  { id: "Design", icon: "creative", hint: "Product, brand, graphic, interior" },
  { id: "Tech", icon: "code", hint: "Software, data, IT support" },
  { id: "Media", icon: "video", hint: "Photo, video, audio, podcasts" },
  { id: "Writing", icon: "document", hint: "Copy, journalism, research" },
  { id: "Arts & crafts", icon: "studio", hint: "Painting, textiles, making" },
  { id: "Food", icon: "celebrate", hint: "Cooking, baking, catering" },
  { id: "Health & care", icon: "wellbeing", hint: "Nursing, therapy, fitness" },
  { id: "Teaching", icon: "mentorship", hint: "Tutoring, training, coaching" },
  { id: "Business", icon: "chart", hint: "Sales, marketing, finance, admin" },
  { id: "Trades", icon: "shipping", hint: "Building, repairs, logistics, driving" },
  { id: "Events", icon: "event", hint: "Planning, hosting, production" },
  { id: "Community", icon: "circle", hint: "Organising, volunteering, advocacy" },
];

export const SKILLS: Record<string, string[]> = {
  Design: ["Product design", "User research", "Prototyping", "Figma", "Branding", "Graphic design", "Illustration", "Accessibility", "Design systems", "Mobile design"],
  Tech: ["JavaScript", "TypeScript", "React", "Python", "Django", "Node.js", "SQL", "Mobile apps", "APIs", "Cloud", "Data analysis", "IT support"],
  Media: ["Photography", "Video editing", "Audio editing", "Podcasting", "Lighting", "Colour grading", "Motion graphics", "Social media content"],
  Writing: ["Copywriting", "Editing", "Journalism", "Research", "Report writing", "Grant writing", "Translation", "Scriptwriting"],
  "Arts & crafts": ["Painting", "Murals", "Adire", "Textiles", "Pottery", "Beadwork", "Carving", "Tailoring"],
  Food: ["Catering", "Baking", "Menu planning", "Food safety", "Event catering", "Pastry", "Nigerian cuisine", "Kitchen management"],
  "Health & care": ["Nursing", "First aid", "Counselling", "Elder care", "Nutrition", "Fitness coaching", "Mental health support"],
  Teaching: ["Tutoring", "Curriculum design", "Workshops", "Mentoring", "Public speaking", "Coaching", "Lesson planning"],
  Business: ["Sales", "Marketing", "Bookkeeping", "Project management", "Customer service", "Fundraising", "Operations", "Strategy"],
  Trades: ["Logistics", "Driving", "Carpentry", "Electrical", "Plumbing", "Solar installation", "Tiling", "Welding"],
  Events: ["Event planning", "Hosting", "Stage management", "Sound", "Ticketing", "Vendor management", "Decor"],
  Community: ["Organising", "Volunteering", "Advocacy", "Facilitation", "Outreach", "Mentoring", "Fundraising"],
};

export const OPEN_TO = ["Collaborations", "Paid projects", "Part-time work", "Full-time work", "Volunteering", "Mentoring others", "Being mentored"];
export const EXPERIENCE_KINDS: ExperienceKind[] = ["Job", "Freelance", "Own business", "Volunteer", "Community", "Internship"];
export const LEVELS: { id: Level; label: string; hint: string }[] = [
  { id: "0–1 years", label: "0–1 years", hint: "Starting out" },
  { id: "2–4 years", label: "2–4 years", hint: "Some experience" },
  { id: "4+ years", label: "More than 4 years", hint: "Experienced" },
];
const OLD_LEVELS: Record<string, Level> = { "Just starting": "0–1 years", "Some experience": "2–4 years", Experienced: "4+ years", Expert: "4+ years" };
/** "4+ years of experience", reading older saved words too. */
export const levelLabel = (l?: string) => {
  const y = l ? OLD_LEVELS[l] ?? l : "";
  return y ? `${y} experience` : "";
};

const empty = (): WorkProfile => ({ field: "", headline: "", about: "", skills: [], experience: [], education: [], certificates: [], openTo: [], languages: ["English"], links: [] });

/** The demo's "Fill with an example": Amara, a product designer in Abuja. */
const example = (): WorkProfile => ({
  field: "Design",
  headline: "Product designer for clinics, markets and the people who run them",
  level: "4+ years",
  about: "I design simple tools for busy places: clinic waiting rooms, market stalls, night shifts. I start by spending time where the work happens, then design with the people who'll use it.\n\nSix years in product design, the last three freelance in Abuja.",
  skills: ["Product design", "User research", "Prototyping", "Figma", "Accessibility", "Mentoring"],
  experience: [],
  education: [],
  certificates: [],
  openTo: ["Collaborations", "Paid projects", "Mentoring others"],
  hours: "10–20 hours a week",
  rate: { amount: 15000, unit: "hour" },
  where: "Both",
  area: "Wuse, Abuja",
  languages: ["English", "Igbo", "Pidgin"],
  links: [{ url: "https://linkedin.com/in/amara-okafor", kind: "linkedin" }, { url: "https://behance.net/amaraokafor", kind: "behance" }, { url: "https://amara.design", kind: "site", note: "Portfolio" }],
  cv: { id: "cv-amara", name: "Amara-Okafor-CV.pdf", size: 214 * 1024, type: "pdf", kind: "cv" },
});

function useLocalWorkProfile() {
  const [wp, setWp, ready] = useLocal<WorkProfile>(WORK_KEY, empty());
  const pf = usePortfolio();
  const patch = (p: Partial<WorkProfile>) => setWp((w) => ({ ...w, ...p, updatedAt: Date.now() }));
  const list = <K extends "experience" | "education" | "certificates">(key: K) => ({
    add: (item: Omit<WorkProfile[K][number], "id">) => setWp((w) => ({ ...w, [key]: [...w[key], { ...item, id: newId(key.slice(0, 2)) }], updatedAt: Date.now() })),
    edit: (id: string, item: Partial<WorkProfile[K][number]>) => setWp((w) => ({ ...w, [key]: (w[key] as { id: string }[]).map((x) => (x.id === id ? { ...x, ...item } : x)), updatedAt: Date.now() })),
    remove: (id: string) => setWp((w) => ({ ...w, [key]: (w[key] as { id: string }[]).filter((x) => x.id !== id), updatedAt: Date.now() })),
  });
  return {
    wp,
    ready: ready && pf.ready,
    patch,
    experience: list("experience"),
    education: list("education"),
    certificates: list("certificates"),
    publish: () => patch({ publishedAt: wp.publishedAt ?? Date.now() }),
    fillExample: () => {
      setWp({ ...example(), updatedAt: Date.now() });
      pf.replace([...samplePieces(), ...pf.pieces.filter((p) => !samplePieces().some((s) => s.id === p.id))]);
    },
    reset: () => setWp(empty()),
  };
}

/** Which parts are done, for the "how complete" meter and the Work tab's nudges. */
export function completeness(wp: WorkProfile, projects: number) {
  const parts = [
    { id: "work", label: "What you do", done: !!wp.field && wp.headline.trim().length >= 5 },
    { id: "skills", label: "Skills", done: wp.skills.length >= 3 },
    { id: "projects", label: "Projects", done: projects > 0 },
    { id: "cv", label: "Your CV or links", done: wp.links.length > 0 || !!wp.cv },
    { id: "availability", label: "Availability", done: wp.openTo.length > 0 },
  ];
  return { parts, pct: Math.round((parts.filter((p) => p.done).length / parts.length) * 100) };
}

export const monthLabel = (ym?: string) => (ym ? new Date(`${ym}-01T00:00:00Z`).toLocaleDateString("en-GB", { month: "short", year: "numeric", timeZone: "UTC" }) : "");
export const rateLabel = (r?: WorkProfile["rate"]) => {
  if (!r) return "";
  if (r.unit === "negotiable") return "Rate on request";
  if (r.unit === "unpaid") return "Happy to work unpaid";
  return r.amount ? `₦${r.amount.toLocaleString("en-NG")} per ${r.unit}` : "";
};

/** The real app: the profile loads from and saves to the backend; the setup's optional lists stay on screen only. */
function useRemoteWorkProfile(): ReturnType<typeof useLocalWorkProfile> & { save: "idle" | "saving" | "error"; message?: string } {
  const w = useRemoteWork();
  const none = { add: () => {}, edit: () => {}, remove: () => {} };
  return {
    wp: w.wp, ready: w.ready, patch: w.patch, save: w.save, message: w.message,
    experience: none, education: none, certificates: none,
    publish: () => { void w.publish(); },
    fillExample: () => {},
    reset: () => {},
  };
}

/** Demo builds keep the work profile in the browser; the real app saves it to the backend. */
export const useWorkProfile: () => ReturnType<typeof useLocalWorkProfile> & { save?: "idle" | "saving" | "error"; message?: string } = DEMO ? useLocalWorkProfile : useRemoteWorkProfile;
