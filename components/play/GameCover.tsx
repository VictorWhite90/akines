import Photo from "@/components/ui/Photo";
import type { Game, GameCategory } from "@/lib/data/games";
import { Glyph } from "@/components/ui/Icon";

/** One colour pair and wax-print pattern per game category. */
const LOOK: Record<GameCategory, { bg: string; ink: string; pattern: "dots" | "rings" | "chevron" | "waves" | "diamonds" | "stripes"; glyph: string }> = {
  icebreakers: { bg: "#ffb000", ink: "#3b2600", pattern: "dots", glyph: "spark" },
  reconnection: { bg: "#e5007e", ink: "#ffffff", pattern: "rings", glyph: "↺" },
  know: { bg: "#7b2ff7", ink: "#ffffff", pattern: "waves", glyph: "people" },
  creative: { bg: "#ff6b1a", ink: "#ffffff", pattern: "chevron", glyph: "edit" },
  art: { bg: "#14121a", ink: "#ffd27a", pattern: "diamonds", glyph: "creative" },
  collab: { bg: "#2547d0", ink: "#ffffff", pattern: "stripes", glyph: "collaborate" },
  family: { bg: "#c2603f", ink: "#ffffff", pattern: "rings", glyph: "family" },
  friendship: { bg: "#00a86b", ink: "#ffffff", pattern: "dots", glyph: "play" },
  couples: { bg: "#ff4f7b", ink: "#ffffff", pattern: "waves", glyph: "wellbeing" },
  team: { bg: "#0f8b8d", ink: "#ffffff", pattern: "chevron", glyph: "team" },
  wellbeing: { bg: "#8fb8a0", ink: "#14121a", pattern: "waves", glyph: "calm" },
  exchange: { bg: "#d4a020", ink: "#2a1e00", pattern: "diamonds", glyph: "⇄" },
};

/**
 * A game's cover: its photo, washed in the category colour, with the game's real first
 * prompt printed on a tilted white card. Unique per game.
 */
export default function GameCover({ game, className = "", compact = false }: { game: Game; className?: string; compact?: boolean }) {
  const look = LOOK[game.category];
  return (
    <div className={`gp ${compact ? "compact" : ""} ${className}`} style={{ ["--gc-bg" as string]: look.bg } as React.CSSProperties} aria-hidden>
      <Photo name={game.photo} sizes="(max-width: 760px) 90vw, 420px" className="gp-img" />
      <span className="gp-wash" />
      <span className="gp-card">
        <small><Glyph g={look.glyph} size={12} className="ic-inline" /> Card 1 of {game.cards.length}</small>
        <em>{game.cards[0]}</em>
      </span>
    </div>
  );
}
