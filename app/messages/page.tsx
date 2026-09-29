import type { Metadata } from "next";

export const metadata: Metadata = { title: "Messages · Kinnect" };

/** Right-hand prompt shown until a conversation is picked from the sidebar (see app/messages/layout.tsx). */
export default function MessagesPage() {
  return (
    <div className="msg-empty">
      <span className="glyph" aria-hidden>✉</span>
      <h2>Choose a conversation</h2>
      <p>Pick a thread on the left, or say hello to a Kinnection who hasn&apos;t heard from you yet.</p>
    </div>
  );
}
