"use client";

import { Children, useState } from "react";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/ui";

// Lightweight client filter for the static Projects page. The project cards are
// rendered on the server and passed in as `children`; we only choose which ones
// to show (by index, aligned with `itemTags`). This keeps react-markdown out of
// the client bundle — no heavy JS just to filter by tag.
export default function ProjectsFilter({
  allTags,
  itemTags,
  children,
}: {
  allTags: string[];
  itemTags: string[][];
  children: React.ReactNode;
}) {
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const items = Children.toArray(children);
  const filtered = activeTag ? items.filter((_, i) => itemTags[i]?.includes(activeTag)) : items;

  return (
    <div>
      {allTags.length > 0 && (
        <nav className="mb-8 flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTag(null)}
            className={cn(
              "chip transition",
              !activeTag ? "bg-rose-deep text-white shadow-soft" : "bg-lavender-soft text-lavender-deep hover:bg-lavender",
            )}
          >
            Tout
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setActiveTag(tag)}
              className={cn(
                "chip transition",
                activeTag === tag ? "bg-rose-deep text-white shadow-soft" : "bg-lavender-soft text-lavender-deep hover:bg-lavender",
              )}
            >
              {tag}
            </button>
          ))}
        </nav>
      )}

      {filtered.length === 0 ? (
        <EmptyState>
          Aucun projet avec le tag « {activeTag} ».{" "}
          <button type="button" onClick={() => setActiveTag(null)} className="font-semibold text-rose-deep underline">
            Tout voir
          </button>
        </EmptyState>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{filtered}</div>
      )}
    </div>
  );
}
