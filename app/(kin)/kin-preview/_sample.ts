import type { PhotoKey } from "@/lib/data/images";
import type { PersonId } from "@/lib/data/people";

/** Sample content for the preview page only. Real pages read the hooks and the API layer. */
export type SampleCall = { id: string; title: string; org: string; host: PersonId; city: string; photo: PhotoKey; summary: string; roles: string[]; fee: string; feeNote: string; closes: number; field: string; fit?: string };

export const CALLS: SampleCall[] = [
  { id: "jabi-mural", title: "Jabi Lake Arts Week: a 20-metre mural", org: "Jabi Lake Arts Week", host: "zuri", city: "Abuja", photo: "textileHang", summary: "Three people to design and paint the festival's lakeside wall, start to finish, in four weeks.", roles: ["Lead muralist", "Assistant painter", "Graphic designer"], fee: "₦600,000", feeNote: "lead", closes: 14, field: "Arts", fit: "Needs a graphic designer: fits your product design work" },
  { id: "garki-booking", title: "Booking app for Garki Family Clinic, version 1", org: "Garki Family Clinic", host: "kwame", city: "Abuja", photo: "studioEasel", summary: "Patients book and see their queue on their phones, so nobody waits outside from 6am.", roles: ["Product designer", "Developer"], fee: "₦1.2m", feeNote: "paid at three milestones", closes: 17, field: "Tech" },
];
