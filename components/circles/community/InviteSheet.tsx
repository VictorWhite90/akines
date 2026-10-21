"use client";

import { useState } from "react";
import QR from "./QR";
import Sheet from "./Sheet";

/** The invite link and QR code, to bring existing members across from WhatsApp and Instagram. */
export default function InviteSheet({ name, inviteCode, leader, onRotate, onClose }: { name: string; inviteCode: string; leader: boolean; onRotate: () => Promise<boolean>; onClose: () => void }) {
  const link = typeof window !== "undefined" ? `${window.location.origin}/circles/join/${inviteCode}` : `/circles/join/${inviteCode}`;
  const [copied, setCopied] = useState("");
  const [rotating, setRotating] = useState(false);
  const copy = async (text: string, what: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(what);
      setTimeout(() => setCopied(""), 2000);
    } catch {
      setCopied("Select the text to copy it");
    }
  };
  const rotate = async () => {
    if (!window.confirm("Make a new invite link? The current link and code will stop working.")) return;
    setRotating(true);
    const ok = await onRotate();
    setRotating(false);
    setCopied(ok ? "New link ready. The old one no longer works." : "Couldn't make a new link. Try again.");
  };
  const message = `Join ${name} on Akines: ${link}`;
  return (
    <Sheet title="Invite people" sub="Share this with your members on WhatsApp, Instagram or at your next meet-up." onClose={onClose}>
      <div className="cm-invite">
        <QR value={link} size={180} label={`QR code to join ${name}`} />
        <div className="cm-invite-tx">
          <label className="cm-l" htmlFor="cm-invite-link">Invite link</label>
          <input id="cm-invite-link" readOnly value={link} onFocus={(e) => e.currentTarget.select()} />
          <div className="cm-row">
            <button className="kh-btn amber sm" onClick={() => copy(link, "Link copied")}>Copy link</button>
            <button className="kh-btn outline sm" onClick={() => copy(message, "Message copied")}>Copy WhatsApp message</button>
            <a className="kh-btn outline sm" href={`https://wa.me/?text=${encodeURIComponent(message)}`} target="_blank" rel="noopener noreferrer">Share on WhatsApp</a>
          </div>
          <p className="cm-small">Invite code <b>{inviteCode}</b>. People can also type it on the join page.</p>
          {leader && <button className="cm-leave" onClick={rotate} disabled={rotating}>{rotating ? "Making a new link…" : "Link shared too widely? Make a new one"}</button>}
          {copied && <p className="cm-ok" role="status">{copied}</p>}
        </div>
      </div>
    </Sheet>
  );
}
