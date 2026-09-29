"use client";

import Link from "next/link";
import { useJoined } from "./useJoined";

/** Footer of a circle card: open the community if joined, otherwise join. */
export default function CircleJoin({ id }: { id: string }) {
  const { has, toggle } = useJoined();
  return has(id) ? (
    <Link href={`/circles/${id}`} className="rounded-full bg-night px-4 py-2 text-[13px] font-semibold text-white">Open chat</Link>
  ) : (
    <button onClick={() => toggle(id)} className="rounded-full border border-line bg-paper-50 px-4 py-2 text-[13px] font-semibold hover:bg-paper-200">Join</button>
  );
}
