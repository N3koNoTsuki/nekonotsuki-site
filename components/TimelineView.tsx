"use client";

import { useMemo, useState } from "react";
import { TimelineItem } from "@/components/cards";
import { tagMeta, cn } from "@/lib/utils";

export type TimelineViewEntry = {
  id: string;
  date: string;
  endDate: string | null;
  title: string;
  description: string | null;
  tag: string;
};

export default function TimelineView({ entries }: { entries: TimelineViewEntry[] }) {
  const [active, setActive] = useState<string | null>(null);

  // Distinct categories in date order of appearance (entries already sorted by date desc).
  const tags = useMemo(() => {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const e of entries) {
      if (!seen.has(e.tag)) {
        seen.add(e.tag);
        out.push(e.tag);
      }
    }
    return out;
  }, [entries]);

  const filtered = active ? entries.filter((e) => e.tag === active) : entries;

  return (
    <div>
      {tags.length > 1 && (
        <div className="mb-8 flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setActive(null)}
            className={cn(
              "chip transition",
              active === null ? "bg-rose-deep text-white" : "bg-white/70 text-ink/70 hover:bg-white dark:bg-white/10 dark:text-[#efe6ee]/70",
            )}
          >
            Tout
          </button>
          {tags.map((tag) => {
            const meta = tagMeta(tag);
            const on = active === tag;
            return (
              <button
                key={tag}
                type="button"
                onClick={() => setActive(on ? null : tag)}
                className={cn("chip transition", on ? "bg-rose-deep text-white" : `${meta.className} hover:opacity-80`)}
              >
                {meta.label}
              </button>
            );
          })}
        </div>
      )}

      <ul className="mx-auto max-w-2xl space-y-6">
        {filtered.map((entry, i) => (
          <TimelineItem key={entry.id} entry={entry} last={i === filtered.length - 1} animate delay={i * 50} />
        ))}
      </ul>
    </div>
  );
}
