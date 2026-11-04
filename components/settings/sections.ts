/** Settings sections. A plain module so server pages (route validation) and client components share it. */
export const SECTION_IDS = ["personal", "security", "devices", "blocked", "data", "recommendations", "explanations", "privacy", "connection"] as const;
export type SectionId = (typeof SECTION_IDS)[number];
export const isSectionId = (value: string): value is SectionId => (SECTION_IDS as readonly string[]).includes(value);
