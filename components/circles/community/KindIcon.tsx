import Icon, { type IconName } from "@/components/ui/Icon";
import { CIRCLE_KINDS } from "@/lib/api/community";

/** The icon for a kind of small circle (the kinds share names with the icon set). */
export default function KindIcon({ kind, size = 16 }: { kind: string; size?: number }) {
  return <Icon name={(CIRCLE_KINDS.some((k) => k.value === kind) ? kind : "circle") as IconName} size={size} />;
}
