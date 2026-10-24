"use client";

import Link from "next/link";
import Avatar from "@/components/ui/Avatar";
import { PEOPLE, type PersonId } from "@/lib/data/people";
import { useKinnections } from "./useKinnections";
import Icon from "@/components/ui/Icon";

/**
 * Kinnections, not followers: relationships the member has chosen to acknowledge.
 * Used in the Messages sidebar.
 */
export default function KinnectionsList({ compact = false, limit }: { compact?: boolean; limit?: number }) {
  const { ids, remove, ready } = useKinnections();
  const shown = limit ? ids.slice(0, limit) : ids;

  if (!ready) return null;
  if (ids.length === 0) {
    return (
      <p className="kn-empty">
        No Kinnections yet. <Link href="/kindred">Discover people worth knowing →</Link>
      </p>
    );
  }

  return (
    <ul className={`kn-list${compact ? " compact" : ""}`}>
      {shown.map((id: PersonId) => {
        const p = PEOPLE[id];
        return (
          <li key={id}>
            <span className="who">
              <Avatar person={p} size={compact ? 34 : 40} />
              <span>
                <b>{p.name}</b>
                <small>{p.role} · {p.city}</small>
              </span>
            </span>
            <span className="acts">
              <Link href={`/messages/${id}`} aria-label={`Message ${p.name}`}><Icon name="message" size={18} /></Link>
              {!compact && <button onClick={() => remove(id)} aria-label={`Remove ${p.name} from your Kinnections`}>×</button>}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
