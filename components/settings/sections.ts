/** Settings sections. A plain module so server pages (route validation) and client components share it. */
export const SECTION_IDS = ["profile", "privacy", "security", "devices", "blocked", "data"] as const;
export type SectionId = (typeof SECTION_IDS)[number];
export const isSectionId = (value: string): value is SectionId => (SECTION_IDS as readonly string[]).includes(value);
