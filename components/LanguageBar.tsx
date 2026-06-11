import { langColor, type LangStat } from "@/lib/languages";
import { cn } from "@/lib/utils";

/**
 * GitHub-style stacked language bar + legend. Pure/presentational (no client
 * JS), so it renders inside Server Components. `maxLegend` caps how many
 * languages are listed under the bar (the bar itself always shows them all).
 */
export default function LanguageBar({
  stats,
  maxLegend,
  showLegend = true,
  barClassName,
  className,
}: {
  stats: LangStat[];
  maxLegend?: number;
  showLegend?: boolean;
  barClassName?: string;
  className?: string;
}) {
  if (stats.length === 0) return null;

  const legend = maxLegend ? stats.slice(0, maxLegend) : stats;
  const hidden = stats.length - legend.length;

  return (
    <div className={className}>
      <div
        className={cn(
          "flex w-full overflow-hidden rounded-full bg-lavender-soft/40 dark:bg-white/10",
          barClassName ?? "h-2",
        )}
        role="img"
        aria-label={`Langages : ${stats.map((s) => `${s.name} ${s.pct.toFixed(1)} %`).join(", ")}`}
      >
        {stats.map((s) => (
          <span key={s.name} className="h-full" style={{ width: `${s.pct}%`, backgroundColor: langColor(s.name) }} />
        ))}
      </div>

      {showLegend && (
        <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs">
          {legend.map((s) => (
            <li key={s.name} className="inline-flex items-center gap-1.5 text-ink/70 dark:text-nightink/70">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: langColor(s.name) }} aria-hidden />
              <span className="font-semibold text-ink dark:text-nightink">{s.name}</span>
              <span>{s.pct.toFixed(1)} %</span>
            </li>
          ))}
          {hidden > 0 && (
            <li className="inline-flex items-center text-ink/50 dark:text-nightink/50">+{hidden}</li>
          )}
        </ul>
      )}
    </div>
  );
}
