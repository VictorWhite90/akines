import {
  Book1, Briefcase, Brush2, Calendar, Chart2, Clock, Discover, EmojiHappy, Gallery, Game, Global, Heart, Hierarchy,
  Home2, Key, Lifebuoy, Like1, Location, Lock, MagicStar, Message, MessageQuestion, MessageText1, Microphone2,
  Notepad2, People, Profile2User, QuoteUp, Radar2, SearchNormal1, Send2, Shop, Sms, TaskSquare, Teacher, Ticket,
  Trash, UserAdd, Video,
} from "iconsax-reactjs";
import type { ComponentType } from "react";

type IconProps = { size?: number | string; color?: string; variant?: "Linear" | "Outline" | "Bold" | "Bulk" | "Broken" | "TwoTone"; className?: string };

/** Reply arrow (iconsax has none). */
function ReplyArrow({ size = 18, color = "currentColor", className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M9 14 4 9l5-5" /><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11" />
    </svg>
  );
}

/**
 * Every icon in the app, by meaning. Screens use these names instead of text symbols (◎ ✦ ⌘…) or emoji,
 * so the whole platform shares one line style that works in light and dark mode.
 */
const ICONS = {
  // Places
  home: Home2, discover: Discover, people: Profile2User, banter: MessageText1, circle: People, cliq: Heart,
  live: Radar2, play: Game, collaborate: Hierarchy, message: Sms, studio: MagicStar, journal: Notepad2,
  store: Shop, "open-doors": Key, wellbeing: Heart, world: Global,
  // Circle kinds
  friendship: Heart, creative: Brush2, project: Briefcase, study: Book1, mentorship: Teacher, support: Lifebuoy,
  family: Home2,
  // Actions
  share: MagicStar, ask: MessageQuestion, discuss: Message, invite: UserAdd, help: Lifebuoy, photo: Gallery,
  reply: ReplyArrow, poll: TaskSquare, time: Clock, quote: QuoteUp, emoji: EmojiHappy, voice: Microphone2,
  video: Video, send: Send2, search: SearchNormal1, remove: Trash, like: Like1, chart: Chart2,
  // Things
  event: Calendar, ticket: Ticket, place: Location, private: Lock, spark: MagicStar,
} satisfies Record<string, ComponentType<IconProps>>;

export type IconName = keyof typeof ICONS;

export default function Icon({ name, size = 18, variant = "Linear", className }: { name: IconName; size?: number; variant?: IconProps["variant"]; className?: string }) {
  const C = ICONS[name] as ComponentType<IconProps>;
  return <C size={size} color="currentColor" variant={variant} className={className} aria-hidden />;
}

/** The old text symbols, for data lists that still carry them: <Glyph g="◎" /> draws the matching icon. */
const GLYPHS: Record<string, IconName> = {
  "⌂": "home", "◇": "discover", "❝": "banter", "◎": "circle", "◌": "cliq", "◉": "live", "☺": "play",
  "⌘": "collaborate", "✉": "message", "✦": "spark", "▤": "journal", "▣": "store", "◈": "open-doors", "♡": "wellbeing",
  "≡": "poll", "◷": "time", "⌕": "search", "↩": "reply", "💬": "discuss", "🖼": "photo", "🙌": "help", "?": "ask",
};
export function glyphIcon(g: string | undefined): IconName | null {
  return g ? GLYPHS[g.trim()] ?? null : null;
}

export function Glyph({ g, size = 18, className }: { g: string; size?: number; className?: string }) {
  const name = glyphIcon(g);
  return name ? <Icon name={name} size={size} className={className} /> : <span className={className} aria-hidden>{g}</span>;
}
