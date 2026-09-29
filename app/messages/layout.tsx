"use client";

import { usePathname } from "next/navigation";
import Inbox from "@/components/messages/Inbox";

/**
 * Two-column Messages shell: the thread list (+ Kinnections panel) stays on
 * screen across /messages and /messages/[id], mirroring the Rooms/Circles
 * list-and-space pattern. On narrow screens it collapses to whichever side
 * the route points at.
 */
export default function MessagesLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hasThread = pathname !== "/messages" && pathname.startsWith("/messages/");

  return (
    <div className={`msg-shell${hasThread ? " has-thread" : ""}`}>
      <Inbox />
      <div className="msg-panel">{children}</div>
    </div>
  );
}
