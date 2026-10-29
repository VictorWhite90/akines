import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Blocks,
  ChevronRight,
  DoorOpen,
  Gamepad2,
  GitCompareArrows,
  Handshake,
  Heart,
  HeartHandshake,
  Lightbulb,
  MessageCircle,
  MessagesSquare,
  NotebookPen,
  Pause,
  Play,
  Quote,
  RefreshCw,
  ScanEye,
  ShieldCheck,
  Sprout,
  Store,
  TrendingUp,
  Users,
  UsersRound,
  X,
  type LucideIcon,
} from 'lucide-react';
import type { IconName } from '@/lib/landing/content';

const NAMED: Record<IconName, LucideIcon> = {
  users: Users,
  'message-circle': MessageCircle,
  lightbulb: Lightbulb,
  'heart-handshake': HeartHandshake,
  'users-round': UsersRound,
  store: Store,
  'messages-square': MessagesSquare,
  blocks: Blocks,
  'gamepad-2': Gamepad2,
  'door-open': DoorOpen,
  'scan-eye': ScanEye,
  handshake: Handshake,
  'notebook-pen': NotebookPen,
  'refresh-cw': RefreshCw,
  'git-compare-arrows': GitCompareArrows,
  'shield-check': ShieldCheck,
  heart: Heart,
  sprout: Sprout,
  quote: Quote,
  'trending-up': TrendingUp,
};

type IconProps = { size?: number; className?: string };

/**
 * Icons follow the Figma set (Lucide geometry). Stroke width 1.5 on the 24 px grid
 * scales to 1 px at 16 px, 1.25 px at 20 px and 1.5 px at 24 px, which is what the
 * design uses at each size.
 */
export function Icon({ name, size = 20, className }: IconProps & { name: IconName }) {
  const Cmp = NAMED[name];
  return <Cmp size={size} strokeWidth={1.5} className={className} aria-hidden="true" focusable="false" />;
}

export const ArrowUpRightIcon = ({ size = 16, className }: IconProps) => (
  <ArrowUpRight size={size} strokeWidth={1.5} className={className} aria-hidden="true" focusable="false" />
);
export const ArrowDownIcon = ({ size = 16, className }: IconProps) => (
  <ArrowDown size={size} strokeWidth={1.5} className={className} aria-hidden="true" focusable="false" />
);
export const ArrowLeftIcon = ({ size = 20, className }: IconProps) => (
  <ArrowLeft size={size} strokeWidth={1.5} className={className} aria-hidden="true" focusable="false" />
);
export const ArrowRightIcon = ({ size = 20, className }: IconProps) => (
  <ArrowRight size={size} strokeWidth={1.5} className={className} aria-hidden="true" focusable="false" />
);
/** Drawn at 18 px with a 2 unit stroke (1.5 px on screen) and laid out as a 16 px box, as in the design. */
export const ChevronRightIcon = ({ size = 18, className }: IconProps) => (
  <ChevronRight size={size} strokeWidth={2} className={className} aria-hidden="true" focusable="false" />
);
export const CloseIcon = ({ size = 20, className }: IconProps) => (
  <X size={size} strokeWidth={1.5} className={className} aria-hidden="true" focusable="false" />
);
export const PauseIcon = ({ size = 16, className }: IconProps) => (
  <Pause size={size} strokeWidth={1.5} className={className} aria-hidden="true" focusable="false" />
);
export const PlayIcon = ({ size = 16, className }: IconProps) => (
  <Play size={size} strokeWidth={1.5} className={className} aria-hidden="true" focusable="false" />
);

/** The two-line menu glyph from the design (16 x 6 inside a 24 px box). */
export const MenuIcon = ({ size = 24, className }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    className={className}
    aria-hidden="true"
    focusable="false"
  >
    <path d="M4 9h16M4 15h16" />
  </svg>
);
