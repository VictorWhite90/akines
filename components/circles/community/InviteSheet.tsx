"use client";

import { useState } from "react";
import type { CommunityCircle } from "@/lib/data/communityCircles";
import QR from "./QR";
import Sheet from "./Sheet";

/** The leader's invite link and QR code, to bring existing members across from WhatsApp and Instagram. */
export default function InviteSheet({ circle, onClose }: { circle: CommunityCircle; onClose: () => void }) {
  const link = typeof window !== "undefined" ? `${window.location.origin}/circles/join/${circle.inviteCode}` : `/circles/join/${circle.inviteCode}`;
  const [copied, setCopied] = useState("");
  const copy = async (text: string, what: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(what);
      setTimeout(() => setCopied(""), 2000);
    } catch {
      setCopied("Select the text to copy it");
    }
  };
  const message = `Join ${circle.name} on Akines: ${link}`;
  return (
    <Sheet title="Invite people" sub={`Share this with your members on WhatsApp, Instagram or at your next event.`} onClose={onClose}>
      <div className="cm-invite">
        <QR value={link} size={180} label={`QR code to join ${circle.name}`} />
        <div className="cm-invite-tx">
          <label className="cm-l" htmlFor="cm-invite-link">Invite link</label>
          <input id="cm-invite-link" readOnly value={link} onFocus={(e) => e.currentTarget.select()} />
          <div className="cm-row">
            <button className="kh-btn amber sm" onClick={() => copy(link, "Link copied")}>Copy link</button>
            <button className="kh-btn outline sm" onClick={() => copy(message, "Message copied")}>Copy WhatsApp message</button>
          </div>
          <p className="cm-small">Invite code <b>{circle.inviteCode}</b>. People can also type it on the join page.</p>
          {copied && <p className="cm-ok" role="status">{copied}</p>}
        </div>
      </div>
    </Sheet>
  );
}
