"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { People, ShieldTick } from "iconsax-reactjs";
import { communities, type InvitePreview } from "@/lib/api/community";
import { isSignedIn } from "@/lib/session";

/** /circles/join/<code>: the page an invite link or QR code opens. Works signed out (then sign up and come back). */
export default function JoinByCode({ code }: { code: string }) {
  const router = useRouter();
  const [typed, setTyped] = useState("");
  const [preview, setPreview] = useState<InvitePreview | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "missing">(code === "code" ? "missing" : "loading");
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);

  useEffect(() => {
    if (code === "code") return;
    void communities.invite(code).then((r) => {
      if (r.ok) {
        setPreview(r.data);
        setState("ready");
      } else setState("missing");
    });
  }, [code]);

  if (state === "loading") return <div className="kh cm-join" aria-busy="true"><span className="cm-join-ph" /></div>;

  if (state === "missing" || !preview) {
    return (
      <div className="kh cm-empty">
        <h1>Join a community circle</h1>
        <p>{code !== "code" ? "That invite link isn't valid any more. " : ""}Type the code your community leader shared.</p>
        <form className="cm-row" onSubmit={(e) => { e.preventDefault(); if (typed.trim()) router.push(`/circles/join/${typed.trim().toUpperCase()}`); }}>
          <input className="cm-search" value={typed} onChange={(e) => setTyped(e.target.value)} placeholder="e.g. K7MPQ2" aria-label="Invite code" autoCapitalize="characters" />
          <button className="kh-btn amber sm" type="submit">Find</button>
        </form>
      </div>
    );
  }

  const join = async () => {
    if (!isSignedIn()) {
      // Sign up or log in first; AppShell brings them back here afterwards.
      try { localStorage.setItem("ak:pending-invite", code); } catch {}
      router.push("/signup");
      return;
    }
    setBusy(true);
    const r = await communities.joinByCode(code);
    setBusy(false);
    if (!r.ok) return setFailure(r.message);
    router.push(`/circles/community/${r.data.id}`);
  };

  return (
    <div className="kh cm-join">
      <div className={`cm-join-cover${preview.cover_photo ? "" : " no-photo"}`}>
        {/* eslint-disable-next-line @next/next/no-img-element -- leader-uploaded cover */}
        {preview.cover_photo && <img src={preview.cover_photo} alt="" />}
      </div>
      <p className="cm-over">You&apos;re invited to</p>
      <h1>{preview.name}{preview.is_verified && <ShieldTick size={24} color="#f4a63a" variant="Bold" aria-label="Verified by Akines" />}</h1>
      {preview.tagline && <p>{preview.tagline}</p>}
      <p className="cm-small"><People size={14} color="currentColor" /> {preview.member_count.toLocaleString()} {preview.member_count === 1 ? "member" : "members"} · {preview.visibility === "private" ? "Private" : "Public"} · {preview.category_label} · {preview.area}, {preview.city}</p>
      {failure && <p className="st-notice bad" role="alert">{failure}</p>}
      <button className="kh-btn amber cm-submit" onClick={join} disabled={busy}>{busy ? "Joining…" : isSignedIn() ? `Join ${preview.name}` : "Sign up to join"}</button>
      {!isSignedIn() && <p className="cm-small">Already on Akines? <Link href="/login" onClick={() => { try { localStorage.setItem("ak:pending-invite", code); } catch {} }}>Log in</Link></p>}
    </div>
  );
}
