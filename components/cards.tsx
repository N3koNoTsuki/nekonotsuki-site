import Markdown from "./Markdown";
import { formatDateRange, tagMeta, cn } from "@/lib/utils";

type TimelineLike = {
  id: string;
  date: Date | string;
  endDate?: Date | string | null;
  title: string;
  description: string | null;
  tag: string;
};

export function TimelineItem({
  entry,
  last = false,
  delay = 0,
  animate = false,
}: {
  entry: TimelineLike;
  last?: boolean;
  delay?: number;
  animate?: boolean;
}) {
  const meta = tagMeta(entry.tag);
  return (
    <li
      className={cn("relative pl-10", animate && "animate-fade-up")}
      style={animate && delay ? { animationDelay: `${delay}ms` } : undefined}
    >
      {/* Spine + dot */}
      <span
        className={cn(
          "absolute left-3 top-2 h-3.5 w-3.5 -translate-x-1/2 rounded-full border-2 border-white bg-rose-deep shadow-soft",
        )}
        aria-hidden
      />
      {!last && <span className="absolute left-3 top-2 h-full w-0.5 -translate-x-1/2 bg-rose-soft" aria-hidden />}
      <div className="kawaii-card p-5">
        <div className="flex flex-wrap items-center gap-2">
          <time className="text-sm font-semibold text-lavender-deep">{formatDateRange(entry.date, entry.endDate ?? null)}</time>
          <span className={cn("chip", meta.className)}>{meta.label}</span>
        </div>
        <h3 className="mt-1 font-display text-lg font-bold text-ink dark:text-nightink">{entry.title}</h3>
        {entry.description && (
          <div className="mt-1 text-sm">
            <Markdown>{entry.description}</Markdown>
          </div>
        )}
      </div>
    </li>
  );
}
