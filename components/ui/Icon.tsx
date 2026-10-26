import {
  ArchiveAdd, ShieldTick, ArrowDown2, ArrowSwapHorizontal, Cake, Lovely, Repeat, TrendUp, ArrowRight2, Book1, Briefcase, Brush2, Calendar, Chart2, Clock, CloseCircle, ColorSwatch,
  Discover, Edit2, EmojiHappy, Flag, Gallery, Game, Global, Heart, Hierarchy, Home2, InfoCircle, Key, Lifebuoy, Like1,
  Location, Lock, MagicStar, Message, MessageQuestion, MessageText1, Microphone2, Monitor, Music, Notepad2, Notification,
  Pause, People, Play, Profile2User, QuoteUp, Radar2, Scissor, SearchNormal1, Send2, Shop, Sms, TaskSquare, Teacher,
  Ticket, Trash, TruckFast, UserAdd, Video, VideoPlay, Link21, DocumentText, DocumentUpload, Code, Personalcard,
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

/** Push pin (iconsax has none). */
function PinIcon({ size = 18, color = "currentColor", className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M9 3h6l-1 6 3 3v2H7v-2l3-3-1-6Z" /><path d="M12 14v7" />
    </svg>
  );
}

/**
 * Every icon in the app, by meaning. Screens use these names instead of text symbols (◎ ✦ ⌘…) or emoji,
 * so the whole platform shares one line style that works in light and dark mode.
 * Emoji that people choose (moods, reactions, words in a message) are content, not icons, and stay as they are.
 */
const ICONS = {
  // Places
  home: Home2, discover: Discover, people: Profile2User, banter: MessageText1, circle: People, cliq: Heart,
  live: Radar2, play: Game, collaborate: Hierarchy, message: Sms, studio: MagicStar, journal: Notepad2,
  store: Shop, "open-doors": Key, wellbeing: Heart, world: Global, stories: Book1, dna: ColorSwatch, about: InfoCircle,
  // Circle kinds
  friendship: Heart, creative: Brush2, project: Briefcase, study: Book1, mentorship: Teacher, support: Lifebuoy,
  family: Home2,
  // Actions
  share: MagicStar, ask: MessageQuestion, discuss: Message, invite: UserAdd, help: Lifebuoy, photo: Gallery,
  reply: ReplyArrow, poll: TaskSquare, time: Clock, quote: QuoteUp, emoji: EmojiHappy, voice: Microphone2,
  video: Video, send: Send2, search: SearchNormal1, remove: Trash, like: Like1, chart: Chart2, save: ArchiveAdd,
  edit: Edit2, clip: Scissor, close: CloseCircle, "play-media": Play, pause: Pause, music: Music, "video-play": VideoPlay,
  pin: PinIcon, expand: ArrowDown2, more: ArrowRight2, notify: Notification, link: Link21, upload: DocumentUpload,
  // Things
  event: Calendar, ticket: Ticket, place: Location, private: Lock, spark: MagicStar, shipping: TruckFast, team: Flag,
  screen: Monitor, verified: ShieldTick, celebrate: Cake, again: Repeat, debate: ArrowSwapHorizontal, predict: TrendUp, calm: Lovely,
  document: DocumentText, code: Code, cv: Personalcard,
} satisfies Record<string, ComponentType<IconProps>>;

export type IconName = keyof typeof ICONS;

export default function Icon({ name, size = 18, variant = "Linear", className }: { name: IconName; size?: number; variant?: IconProps["variant"]; className?: string }) {
  const C = ICONS[name] as ComponentType<IconProps>;
  return <C size={size} color="currentColor" variant={variant} className={className} aria-hidden />;
}

export const isIconName = (g: string): g is IconName => g in ICONS;

/** The old text symbols, for data lists that still carry them: <Glyph g="◎" /> draws the matching icon. */
const GLYPHS: Record<string, IconName> = {
  "⌂": "home", "◇": "discover", "❝": "banter", "◎": "circle", "◌": "cliq", "◉": "live", "☺": "play",
  "⌘": "collaborate", "✉": "message", "✦": "spark", "▤": "journal", "▣": "photo", "◈": "open-doors", "♡": "wellbeing",
  "≡": "poll", "◷": "time", "⌕": "search", "↩": "reply", "💬": "discuss", "🖼": "photo", "🙌": "help", "?": "ask", "❔": "ask",
  "❖": "save", "◐": "dna", "ⓘ": "about", "♪": "music", "▶": "play-media", "✎": "edit", "⚑": "team", "✈": "shipping", "📌": "pin", "✺": "celebrate", "✋": "invite", "↺": "again", "≈": "calm", "⇄": "debate", "↗": "predict", "✓": "verified",
};

/** An icon name, or one of the old symbols, to an icon name (null if it isn't one). */
export function glyphIcon(g: string | undefined): IconName | null {
  if (!g) return null;
  const t = g.trim().replace(/︎|️/g, "");
  return isIconName(t) ? t : GLYPHS[t] ?? null;
}

/** Draws an icon from a name or an old symbol; anything else (an emoji someone chose) is shown as it is. */
export function Glyph({ g, size = 18, className }: { g: string; size?: number; className?: string }) {
  const name = glyphIcon(g);
  return name ? <Icon name={name} size={size} className={className} /> : <span className={className} aria-hidden>{g}</span>;
}
