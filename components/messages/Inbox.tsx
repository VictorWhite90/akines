"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import Avatar from "@/components/ui/Avatar";
import KinnectionsList from "@/components/relationships/KinnectionsList";
import { useKinnections } from "@/components/relationships/useKinnections";
import { DM_THREADS } from "@/lib/data/dms";
import { PEOPLE, type PersonId } from "@/lib/data/people";
import type { Msg } from "@/lib/data/roomChat";
import Icon from "@/components/ui/Icon";

function preview(msg?: Msg) {
  if (!msg) return "Say hello →";
  if (msg.kind === "image") return msg.text ? `${msg.text}` : "Photo";
  if (msg.kind === "voice") return "Voice note";
  return msg.text ?? "";
}

/**
 * The Messages sidebar: existing 1:1 threads, plus Kinnections you haven't
 * written to yet, plus a collapsible panel of every Kinnection (the
 * relationships hub the brief asks Messages to double as). Lives in
 * app/messages/layout.tsx so it persists across /messages and /messages/[id].
 */
export default function Inbox() {
  const pathname = usePathname();
  const activeId = pathname.startsWith("/messages/") ? (pathname.split("/")[2] as PersonId | undefined) : undefined;
  const { ids, ready } = useKinnections();
  const [showKn, setShowKn] = useState(false);

  const threads = [...DM_THREADS].sort((a, b) => Number(!!b.pinned) - Number(!!a.pinned));
  const threadedIds = new Set(DM_THREADS.flatMap((t) => t.with));
  const starters = ready ? ids.filter((id) => !threadedIds.has(id)) : [];

  return (
    <aside className="msg-list-col" aria-label="Conversations">
      <div className="msg-list-head">
        <h1>Messages</h1>
        <p>Private conversations with your Kinnections.</p>
      </div>

      <button className="msg-kn-toggle" onClick={() => setShowKn((v) => !v)} aria-expanded={showKn}>
        <span>Your Kinnections <small>{ids.length}</small></span>
        <i aria-hidden><Icon name={showKn ? "expand" : "more"} size={12} /></i>
      </button>
      {showKn && (
        <div className="msg-kn-panel">
          <KinnectionsList compact limit={6} />
        </div>
      )}

      <nav className="msg-threads">
        {threads.map((t) => {
          const pid = t.with[0];
          const p = PEOPLE[pid];
          const last = t.msgs[t.msgs.length - 1];
          return (
            <Link key={t.id} href={`/messages/${pid}`} className={`msg-row${activeId === pid ? " active" : ""}`}>
              <Avatar person={p} size={44} />
              <span className="tx">
                <b>{p.name}{t.pinned && <i aria-hidden><Icon name="pin" size={18} /></i>}</b>
                <small>{preview(last)}</small>
              </span>
              {last && <em className="when">{last.at}</em>}
            </Link>
          );
        })}
      </nav>

      {starters.length > 0 && (
        <div className="msg-starters">
          <h2>Start a conversation</h2>
          <ul>
            {starters.slice(0, 6).map((id) => {
              const p = PEOPLE[id];
              return (
                <li key={id}>
                  <Link href={`/messages/${id}`} className={`msg-row${activeId === id ? " active" : ""}`}>
                    <Avatar person={p} size={44} />
                    <span className="tx">
                      <b>{p.name}</b>
                      <small>{p.role} · {p.city}</small>
                    </span>
                    <em className="say">Say hello →</em>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {ready && threads.length === 0 && starters.length === 0 && (
        <p className="msg-nokn">
          No Kinnections yet. <Link href="/kindred">Discover people worth knowing →</Link>
        </p>
      )}
    </aside>
  );
}
