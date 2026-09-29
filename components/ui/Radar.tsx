import { cn } from "@/lib/cn";

type Axis = { label: string; value: number };

/** A small radar of Creative DNA. Pure SVG, no chart library. */
export default function Radar({ axes, dark = false, className }: { axes: readonly Axis[]; dark?: boolean; className?: string }) {
  const W = 480;
  const H = 320;
  const cx = W / 2;
  const cy = H / 2;
  const R = 92;
  const n = axes.length;
  const pt = (i: number, v: number) => {
    const a = (-90 + (360 / n) * i) * (Math.PI / 180);
    return [cx + ((R * v) / 100) * Math.cos(a), cy + ((R * v) / 100) * Math.sin(a)] as const;
  };
  const ring = (v: number) => axes.map((_, i) => pt(i, v).join(",")).join(" ");
  const shape = axes.map((a, i) => pt(i, a.value).join(",")).join(" ");
  const stroke = dark ? "rgb(253 250 243 / 0.18)" : "rgb(19 26 56 / 0.14)";
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={cn("h-auto w-full", className)} role="img" aria-label={"Creative DNA: " + axes.map((a) => `${a.label} ${a.value}`).join(", ")}>
      {[25, 50, 75, 100].map((v) => (
        <polygon key={v} points={ring(v)} fill="none" stroke={stroke} strokeWidth={1} />
      ))}
      {axes.map((_, i) => {
        const [x, y] = pt(i, 100);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke={stroke} strokeWidth={1} />;
      })}
      <polygon points={shape} fill={dark ? "rgb(243 201 95 / 0.28)" : "rgb(196 85 45 / 0.22)"} stroke={dark ? "#f3c95f" : "#c4552d"} strokeWidth={2} strokeLinejoin="round" />
      {axes.map((a, i) => {
        const [x, y] = pt(i, a.value);
        return <circle key={a.label} cx={x} cy={y} r={4} fill={dark ? "#f3c95f" : "#c4552d"} />;
      })}
      {axes.map((a, i) => {
        const [x, y] = pt(i, 128);
        const anchor = Math.abs(x - cx) < 6 ? "middle" : x > cx ? "start" : "end";
        return (
          <text key={a.label} x={x} y={y} textAnchor={anchor} dominantBaseline="middle" className={cn("text-[11px] font-medium", dark ? "fill-ink-100" : "fill-ink-800")}>
            {a.label}
          </text>
        );
      })}
    </svg>
  );
}
