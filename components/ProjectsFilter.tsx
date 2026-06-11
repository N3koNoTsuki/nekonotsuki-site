"use client";

import { Children, useState } from "react";
import { EmptyState } from "@/components/ui";

// Lightweight client search for the static Projects page. The project cards are
// rendered on the server and passed in as `children`; we only choose which ones
// to show (by index, aligned with `searchText`). Keeping react-markdown out of
// the client bundle — no heavy JS just to filter.
export default function ProjectsFilter({
  searchText,
  children,
}: {
  /** Per-item lowercase haystack (title + tags + description), aligned by index. */
  searchText: string[];
  children: React.ReactNode;
}) {
  const [query, setQuery] = useState("");
  const items = Children.toArray(children);
  const q = query.trim().toLowerCase();
  const filtered = q ? items.filter((_, i) => searchText[i]?.includes(q)) : items;

  return (
    <div>
      <div className="mb-8 flex justify-center">
        <div className="relative w-full max-w-md">
          <span
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink/40 dark:text-nightink/40"
            aria-hidden
          >
            🔍
          </span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un projet, un langage, un tag…"
            aria-label="Rechercher un projet"
            className="input !pl-11"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Effacer la recherche"
              className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-ink/40 transition hover:bg-rose-soft/40 hover:text-rose-deep dark:text-nightink/40"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState>
          Aucun projet ne correspond à « {query} ».{" "}
          <button type="button" onClick={() => setQuery("")} className="font-semibold text-rose-deep underline">
            Réinitialiser
          </button>
        </EmptyState>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{filtered}</div>
      )}
    </div>
  );
}
