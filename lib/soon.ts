/**
 * The Coming soon pages (sections the product design has not designed yet; see app/(kin)/pages/_list.ts). A card, row or
 * button whose own page is not built opens the Coming soon page of its section, never another built page as a stand-in.
 * `soon(SOON.rooms, "Evening Studio Hour")` names the thing that was clicked: the page shows it as its title (?item=).
 */
export const SOON = {
  kincircle: "/connect/kincircle",
  rooms: "/connect/rooms",
  banter: "/connect/banter",
  activities: "/connect/activities",
  studio: "/make-sell",
  journal: "/make-sell/journal",
  store: "/make-sell/store",
  shop: "/explore",
  studioVisits: "/explore/studio-visits",
  stories: "/explore/stories",
  care: "/care",
  dna: "/care/creative-dna",
  profile: "/profile",
  completeProfile: "/profile/complete",
  help: "/help",
} as const;

export const soon = (path: string, item?: string) => (item ? `${path}?item=${encodeURIComponent(item)}` : path);
