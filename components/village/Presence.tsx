import Avatar from "@/components/ui/Avatar";
import { PRESENCE, PRESENCE_LABEL, type PresenceState } from "@/lib/data/village";
import { cn } from "@/lib/cn";

const DOT: Record<PresenceState, string> = {
  room: "bg-presence-room",
  studio: "bg-presence-studio",
  around: "bg-presence-around",
  quiet: "bg-presence-quiet",
  away: "bg-transparent border-2 border-presence-quiet",
};

export function presenceOf(personId: string) {
  return PRESENCE[personId] ?? { state: "away" as PresenceState };
}

/** Avatar with a creative-presence dot: in a room, in the studio, around, quiet. */
export function PresenceAvatar({
  personId,
  name,
  size = "md",
  ring = "ring-white",
  state,
}: {
  personId: string;
  name: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  ring?: string;
  state?: PresenceState;
}) {
  const s = state ?? presenceOf(personId).state;
  const dot = size === "xl" ? "h-5 w-5" : size === "lg" ? "h-3.5 w-3.5" : "h-3 w-3";
  return (
    <span className="relative inline-flex shrink-0">
      <Avatar name={name} size={size} />
      <span title={PRESENCE_LABEL[s]} className={cn("absolute -bottom-0.5 -right-0.5 rounded-full ring-2", dot, DOT[s], ring)} />
      <span className="sr-only">{PRESENCE_LABEL[s]}</span>
    </span>
  );
}

export function presenceDotClass(state: PresenceState) {
  return DOT[state];
}
