import type { IconName } from "@/components/ui/Icon";
import type { LinkKind, ProofFile, ProofLink } from "./types";

/**
 * What "your work" means depends on the work. A developer sends GitHub and live projects, a designer sends
 * pieces, an audio editor sends recordings, a baker or a volunteer lead sends a CV and references. The apply
 * flow asks for the right things first, from the role someone is applying for.
 */
export type ProofKind = "tech" | "visual" | "audio" | "writing" | "people";
export type ProofSection = "pieces" | "links" | "cv" | "samples";

type Profile = {
  kind: ProofKind;
  title: string;
  hint: string;
  /** Sections in the order they're shown; the first is open, the rest a tap away. */
  order: ProofSection[];
  /** Quick-add chips in the links section, with the placeholder each one fills in. */
  suggest: { kind: LinkKind; label: string; placeholder: string }[];
  /** Words for the samples section. */
  samples: { label: string; hint: string; accept: string };
};

const PROFILES: Record<ProofKind, Profile> = {
  tech: {
    kind: "tech",
    title: "Show what you've built",
    hint: "Your code, things people can use, and your CV.",
    order: ["links", "cv", "samples", "pieces"],
    suggest: [
      { kind: "github", label: "GitHub", placeholder: "github.com/you" },
      { kind: "site", label: "Live project", placeholder: "app-you-shipped.com" },
      { kind: "site", label: "Portfolio", placeholder: "yourname.dev" },
      { kind: "linkedin", label: "LinkedIn", placeholder: "linkedin.com/in/you" },
    ],
    samples: { label: "Case studies or docs", hint: "A write-up, an architecture note or a deck (PDF).", accept: ".pdf,.doc,.docx,.md,.txt" },
  },
  visual: {
    kind: "visual",
    title: "Choose your work",
    hint: "Pieces that show you can do this, plus your portfolio.",
    order: ["pieces", "links", "cv", "samples"],
    suggest: [
      { kind: "behance", label: "Behance", placeholder: "behance.net/you" },
      { kind: "dribbble", label: "Dribbble", placeholder: "dribbble.com/you" },
      { kind: "instagram", label: "Instagram", placeholder: "instagram.com/you" },
      { kind: "site", label: "Portfolio", placeholder: "yourname.com" },
    ],
    samples: { label: "A PDF portfolio", hint: "If your best work lives in a deck or a PDF.", accept: ".pdf,image/*" },
  },
  audio: {
    kind: "audio",
    title: "Let them hear your work",
    hint: "Recordings, episodes or mixes you made, and your CV if you have one.",
    order: ["links", "samples", "cv", "pieces"],
    suggest: [
      { kind: "soundcloud", label: "SoundCloud", placeholder: "soundcloud.com/you/track" },
      { kind: "spotify", label: "Spotify", placeholder: "open.spotify.com/episode/…" },
      { kind: "youtube", label: "YouTube", placeholder: "youtube.com/watch?v=…" },
    ],
    samples: { label: "Audio samples", hint: "A short clip or a before-and-after edit (MP3, WAV, M4A).", accept: "audio/*" },
  },
  writing: {
    kind: "writing",
    title: "Share your writing",
    hint: "Pieces you've published or written, and your CV.",
    order: ["links", "samples", "cv", "pieces"],
    suggest: [
      { kind: "medium", label: "Medium", placeholder: "medium.com/@you/story" },
      { kind: "substack", label: "Substack", placeholder: "you.substack.com" },
      { kind: "site", label: "Published piece", placeholder: "publication.com/your-article" },
    ],
    samples: { label: "Writing samples", hint: "Up to three pieces (PDF or Word).", accept: ".pdf,.doc,.docx,.txt" },
  },
  people: {
    kind: "people",
    title: "Show your experience",
    hint: "Your CV, and anything that shows you've done this before: photos, a menu, a certificate, a reference.",
    order: ["cv", "samples", "links", "pieces"],
    suggest: [
      { kind: "linkedin", label: "LinkedIn", placeholder: "linkedin.com/in/you" },
      { kind: "instagram", label: "Instagram", placeholder: "instagram.com/your-business" },
      { kind: "site", label: "Website", placeholder: "yourbusiness.com" },
    ],
    samples: { label: "Proof of past work", hint: "Photos, a menu, a certificate or a reference letter (PDF or images).", accept: ".pdf,.doc,.docx,image/*" },
  },
};

const WORDS: [ProofKind, RegExp][] = [
  ["tech", /develop|engineer|software|programm|frontend|backend|full.?stack|devops|data|mobile|\bapp\b|web|qa|security|machine/i],
  ["audio", /audio|sound|music|producer|podcast|mix|dj|voice|co-?host|host/i],
  ["writing", /writ|editor|copy|journal|research|translat|author|poet|script/i],
  ["visual", /design|photo|video|film|illustrat|paint|mural|artist|art\b|resident|animat|brand|stylist|architect/i],
];

/** The kind of proof that fits a role. Anything else (caterer, logistics, volunteer lead, nurse) leads with a CV. */
export function proofFor(role: string): Profile {
  const hit = WORDS.find(([, re]) => re.test(role));
  return PROFILES[hit ? hit[0] : "people"];
}

const KINDS: [LinkKind, RegExp, string, IconName][] = [
  ["github", /github\.com/i, "GitHub", "code"],
  ["gitlab", /gitlab\.com/i, "GitLab", "code"],
  ["figma", /figma\.com/i, "Figma", "creative"],
  ["behance", /behance\.net/i, "Behance", "creative"],
  ["dribbble", /dribbble\.com/i, "Dribbble", "creative"],
  ["linkedin", /linkedin\.com/i, "LinkedIn", "cv"],
  ["instagram", /instagram\.com/i, "Instagram", "photo"],
  ["youtube", /youtube\.com|youtu\.be/i, "YouTube", "video-play"],
  ["vimeo", /vimeo\.com/i, "Vimeo", "video-play"],
  ["soundcloud", /soundcloud\.com/i, "SoundCloud", "music"],
  ["spotify", /spotify\.com/i, "Spotify", "music"],
  ["medium", /medium\.com/i, "Medium", "document"],
  ["substack", /substack\.com/i, "Substack", "document"],
  ["drive", /drive\.google\.com|docs\.google\.com|dropbox\.com/i, "Shared file", "document"],
];

/** Tidies what someone typed into a URL, or null if it can't be one. */
export function cleanUrl(raw: string): string | null {
  const t = raw.trim();
  if (!t || /\s/.test(t)) return null;
  try {
    const u = new URL(/^https?:\/\//i.test(t) ? t : `https://${t}`);
    return u.hostname.includes(".") ? u.toString().replace(/\/$/, "") : null;
  } catch {
    return null;
  }
}

export function linkKind(url: string): LinkKind {
  return KINDS.find(([, re]) => re.test(url))?.[0] ?? "site";
}

export function linkLook(l: ProofLink): { label: string; icon: IconName; short: string } {
  const k = KINDS.find(([kind]) => kind === l.kind);
  const u = new URL(l.url);
  const short = (u.hostname.replace(/^www\./, "") + u.pathname).replace(/\/$/, "");
  return { label: l.note || (k ? k[2] : u.hostname.replace(/^www\./, "")), icon: k ? k[3] : "link", short };
}

export const fileSize = (n: number) => (n < 1024 * 1024 ? `${Math.max(1, Math.round(n / 1024))} KB` : `${(n / 1024 / 1024).toFixed(1)} MB`);

/** Demo: what a sample applicant sends for a role, so the host sees proof that fits (GitHub for a developer…). */
export function sampleProof(who: string, role: string): { links: ProofLink[]; files: ProofFile[] } {
  const fit = proofFor(role);
  const s = fit.suggest[0];
  const url = cleanUrl(s.placeholder.replace(/you(name)?/, who).replace(/…$/, who))!;
  const links: ProofLink[] = [{ url, kind: s.kind, note: s.kind === "site" ? s.label : undefined }];
  const cv = fit.kind === "tech" || fit.kind === "people" || fit.kind === "writing";
  const name = who.charAt(0).toUpperCase() + who.slice(1);
  return { links, files: cv ? [{ id: `cv-${who}`, name: `${name}-CV.pdf`, size: 210 * 1024, type: "pdf", kind: "cv" }] : [] };
}

/** The work-profile fields, as the fields open calls use. */
const FIELD_TO_CALL: Record<string, string> = {
  Design: "Design", Tech: "Tech", Media: "Media", Writing: "Media", "Arts & crafts": "Arts", Food: "Food",
  "Health & care": "Community", Teaching: "Community", Business: "Business", Trades: "Business", Events: "Community", Community: "Community",
};

/**
 * How well an open call fits the member: a role that matches one of their skills counts most, then their field.
 * Returns a score (0 = not for them) and the reason, in words, to show on the card.
 */
export function callFit(call: { fields: string[]; roles: string[] }, me: { field?: string; skills: string[]; role: string }) {
  const words = (s: string) => s.toLowerCase().split(/[^a-z]+/).filter((w) => w.length > 3);
  const mine = [...me.skills, me.role];
  for (const r of call.roles) {
    const rw = words(r);
    const hit = mine.find((s) => words(s).some((w) => rw.some((x) => x.startsWith(w.slice(0, 5)) || w.startsWith(x.slice(0, 5)))));
    if (hit) return { score: 2, reason: `Needs ${/^[aeiou]/i.test(r) ? "an" : "a"} ${r.toLowerCase()}: fits your ${hit.toLowerCase()} work` };
  }
  const field = me.field ? FIELD_TO_CALL[me.field] : undefined;
  if (field && call.fields.includes(field)) return { score: 1, reason: `Matches your ${me.field!.toLowerCase()} work` };
  return { score: 0, reason: "" };
}
