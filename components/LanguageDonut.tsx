import { langColor, type LangStat } from "@/lib/languages";

/**
 * SVG donut of language percentages. Pure/presentational (no client JS).
 * Segments are drawn with stroke-dasharray on stacked circles; the count sits
 * in the middle as an HTML overlay (simpler + themable than SVG <text>).
 */
export default function LanguageDonut({
  stats,
  size = 184,
  thickness = 30,
}: {
  stats: LangStat[];
  size?: number;
  thickness?: number;
}) {
  if (stats.length === 0) return null;

  const r = (size - thickness) / 2;
  const circumference = 2 * Math.PI * r;
  const cx = size / 2;
  const cy = size / 2;
  let acc = 0; // accumulated fraction [0, 1)

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label={`Répartition des langages : ${stats.map((s) => `${s.name} ${s.pct.toFixed(1)} %`).join(", ")}`}
      >
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          strokeWidth={thickness}
          className="stroke-lavender-soft/40 dark:stroke-white/10"
        />
        {stats.map((s) => {
          const frac = s.pct / 100;
          const el = (
            <circle
              key={s.name}
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={langColor(s.name)}
              strokeWidth={thickness}
              strokeDasharray={`${frac * circumference} ${circumference - frac * circumference}`}
              strokeDashoffset={-acc * circumference}
              transform={`rotate(-90 ${cx} ${cy})`}
            />
          );
          acc += frac;
          return el;
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-ink dark:text-nightink">{stats.length}</span>
        <span className="text-xs text-ink/55 dark:text-nightink/55">langage{stats.length > 1 ? "s" : ""}</span>
      </div>
    </div>
  );
}
