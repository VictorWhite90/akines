import Link from "next/link";
import { ShieldTick } from "iconsax-reactjs";
import { getPerson } from "@/lib/data/people";
import { PRESENCE_LABEL, type PresenceState } from "@/lib/data/village";
import { PresenceAvatar, presenceOf } from "./Presence";

const ORDER: PresenceState[] = ["room", "studio", "around", "quiet", "away"];

/** Who's here, grouped by what they're doing — never by how popular they are. */
export default function MembersList({ personIds, roleTags = {} }: { personIds: string[]; roleTags?: Record<string, string> }) {
  const unique = [...new Set(personIds)];
  return (
    <div className="px-3 py-5">
      {ORDER.map((state) => {
        const people = unique.filter((id) => presenceOf(id).state === state);
        if (!people.length) return null;
        return (
          <section key={state} className="mb-5">
            <h2 className="px-2 text-[11px] font-bold uppercase tracking-[0.1em] text-grey-600">{PRESENCE_LABEL[state]}</h2>
            <ul className="mt-2">
              {people.map((id) => {
                const person = getPerson(id);
                const presence = presenceOf(id);
                return (
                  <li key={id}>
                    <Link href={`/people/${id}`} className={`flex items-center gap-3 rounded-[6px] px-2 py-1.5 hover:bg-sand-100 ${state === "away" ? "opacity-60" : ""}`}>
                      <PresenceAvatar personId={id} name={person.name} size="sm" ring="ring-sand-50" />
                      <span className="min-w-0">
                        <span className="flex items-center gap-1 truncate text-sm font-semibold text-green-950">
                          {person.name.split(" ")[0]}
                          {person.verified && <ShieldTick size={12} variant="Bold" color="var(--color-verified)" aria-label="Verified" />}
                          {roleTags[id] && <span className="ml-1 text-[10px] font-normal text-grey-600">{roleTags[id]}</span>}
                        </span>
                        <span className="block truncate text-xs text-grey-700">{presence.activity ?? person.title}</span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
