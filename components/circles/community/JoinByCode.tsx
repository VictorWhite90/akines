"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Photo from "@/components/ui/Photo";
import { isSignedIn } from "@/lib/session";
import { useCommunities } from "../useCommunities";

/** /circles/join/<code>: the page an invite link or QR code opens. */
export default function JoinByCode({ code }: { code: string }) {
  const router = useRouter();
  const cc = useCommunities();
  const [typed, setTyped] = useState("");
  const circle = code !== "code" ? cc.byCode(code) : undefined;

  if (!circle) {
    return (
      <div className="kh cm-empty">
        <h1>Join a community circle</h1>
        <p>{code !== "code" ? "That invite code didn't match a community. " : ""}Type the code your community leader shared.</p>
        <form className="cm-row" onSubmit={(e) => { e.preventDefault(); if (typed.trim()) router.push(`/circles/join/${typed.trim().toUpperCase()}`); }}>
          <input className="cm-search" value={typed} onChange={(e) => setTyped(e.target.value)} placeholder="e.g. CACABJ" aria-label="Invite code" />
          <button className="kh-btn amber sm" type="submit">Find</button>
        </form>
      </div>
    );
  }
  const member = cc.isMember(circle.id);
  return (
    <div className="kh cm-join">
      <Photo name={circle.photo} sizes="600px" className="cm-join-img" />
      <p className="cm-over">You&apos;re invited to</p>
      <h1>{circle.name}</h1>
      <p>{circle.tagline}</p>
      <p className="cm-small">{cc.memberCount(circle).toLocaleString()} members · {circle.area}, Abuja</p>
      {member ? (
        <Link href={`/circles/community/${circle.id}`} className="kh-btn amber cm-submit">Open the community</Link>
      ) : (
        <button className="kh-btn amber cm-submit" onClick={() => {
          if (!isSignedIn()) {
            try { localStorage.setItem("ak:pending-invite", circle.inviteCode); } catch {}
            router.push("/login");
            return;
          }
          cc.join(circle.id);
          router.push(`/circles/community/${circle.id}`);
        }}>Join {circle.name}</button>
      )}
    </div>
  );
}
