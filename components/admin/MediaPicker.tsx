"use client";

import { useEffect, useState } from "react";
import SortableList, { DragHandle } from "./Sortable";
import { api } from "@/lib/client";
import type { MalPickDTO } from "@/lib/types";

type Kind = "anime" | "manga";

type SearchResult = {
  malId: number;
  title: string;
  imageUrl: string | null;
  url: string;
  type: string | null;
  year: number | null;
};

function subtitle(type: string | null, year: number | null): string {
  return [type, year].filter(Boolean).join(" · ");
}

const PLACEHOLDER: Record<Kind, string> = {
  anime: "Tape un titre… (ex. Frieren, Oshi no Ko)",
  manga: "Tape un titre… (ex. Berserk, One Piece)",
};

/**
 * Search MyAnimeList (via the key-less Jikan API) and pick anime/manga into a
 * curated collection stored in content/{kind}.json. Used by /edit/anime and
 * /edit/manga.
 */
export default function MediaPicker({ kind, initialItems }: { kind: Kind; initialItems: MalPickDTO[] }) {
  const [list, setList] = useState<MalPickDTO[]>(initialItems);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [adding, setAdding] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const inCollection = new Set(list.map((m) => m.malId));

  // Debounced search against Jikan's /anime or /manga endpoint.
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://api.jikan.moe/v4/${kind}?q=${encodeURIComponent(q)}&limit=8&sfw=true&order_by=popularity`,
        );
        const json = await res.json();
        const arr: unknown[] = Array.isArray(json?.data) ? json.data : [];
        setResults(
          arr.map((item) => {
            const m = (item ?? {}) as Record<string, unknown>;
            const jpg = (((m.images ?? {}) as Record<string, unknown>).jpg ?? {}) as Record<string, unknown>;
            const dateField = (m[kind === "anime" ? "aired" : "published"] ?? {}) as Record<string, unknown>;
            const from = ((dateField.prop ?? {}) as Record<string, unknown>).from as Record<string, unknown> | undefined;
            return {
              malId: typeof m.mal_id === "number" ? m.mal_id : 0,
              title: typeof m.title === "string" ? m.title : "Sans titre",
              url: typeof m.url === "string" ? m.url : "#",
              imageUrl: typeof jpg.image_url === "string" ? jpg.image_url : null,
              type: typeof m.type === "string" ? m.type : null,
              year: typeof from?.year === "number" ? from.year : null,
            };
          }),
        );
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 450);
    return () => clearTimeout(timer);
  }, [query, kind]);

  async function add(r: SearchResult) {
    if (inCollection.has(r.malId)) return;
    setError(null);
    setAdding(r.malId);
    try {
      // null → undefined so the optional-URL validators don't reject empty covers.
      const created = await api.post<MalPickDTO>(`/api/${kind}`, {
        malId: r.malId,
        title: r.title,
        url: r.url,
        imageUrl: r.imageUrl ?? undefined,
        type: r.type ?? undefined,
        year: r.year ?? undefined,
      });
      setList((prev) => [...prev, created]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setAdding(null);
    }
  }

  async function remove(id: string) {
    if (!confirm("Retirer de la collection ?")) return;
    await api.del(`/api/${kind}/${id}`);
    setList((prev) => prev.filter((m) => m.id !== id));
  }

  async function reorder(ids: string[]) {
    const prev = list;
    const map = new Map(list.map((m) => [m.id, m]));
    setList(ids.map((id) => map.get(id)).filter((m): m is MalPickDTO => !!m));
    try {
      await api.put(`/api/${kind}/reorder`, { ids });
    } catch {
      setList(prev);
    }
  }

  return (
    <div className="space-y-8">
      {/* Search */}
      <div>
        <label className="label" htmlFor={`${kind}-search`}>
          Chercher un {kind === "anime" ? "anime" : "manga"} à ajouter
        </label>
        <input
          id={`${kind}-search`}
          className="input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={PLACEHOLDER[kind]}
          autoComplete="off"
        />
        {error && <p className="mt-1 text-sm text-rose-deep">{error}</p>}

        {query.trim().length >= 2 && (
          <div className="mt-3">
            {searching && results.length === 0 ? (
              <p className="text-sm text-ink/50">Recherche…</p>
            ) : results.length === 0 ? (
              <p className="text-sm text-ink/50">Aucun résultat.</p>
            ) : (
              <ul className="grid gap-2 sm:grid-cols-2">
                {results.map((r) => {
                  const already = inCollection.has(r.malId);
                  return (
                    <li
                      key={r.malId}
                      className="flex items-center gap-3 rounded-2xl border border-rose-soft/60 p-2 dark:border-white/10"
                    >
                      <div className="h-16 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-kawaii-gradient">
                        {r.imageUrl && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={r.imageUrl} alt="" className="h-full w-full object-cover" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 text-sm font-semibold">{r.title}</p>
                        <p className="text-xs text-ink/50">{subtitle(r.type, r.year)}</p>
                      </div>
                      <button
                        type="button"
                        className="btn-primary shrink-0 text-xs"
                        onClick={() => add(r)}
                        disabled={already || adding === r.malId}
                      >
                        {already ? "✓ Ajouté" : adding === r.malId ? "…" : "+ Ajouter"}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* Current collection */}
      <div>
        <h2 className="mb-3 font-display text-xl font-bold text-lavender-deep">
          Ma sélection <span className="text-sm font-normal text-ink/40">({list.length})</span>
        </h2>
        {list.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-rose-soft/80 p-4 text-sm text-ink/40">
            Rien pour l’instant — cherche {kind === "anime" ? "un anime" : "un manga"} ci-dessus. ✨
          </p>
        ) : (
          <SortableList
            items={list}
            onReorder={reorder}
            grid
            className="grid gap-3 sm:grid-cols-2"
            renderItem={(m, handle) => (
              <div className="flex items-center gap-2 kawaii-card p-2">
                <DragHandle handle={handle} />
                <div className="h-16 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-kawaii-gradient">
                  {m.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={m.imageUrl} alt="" className="h-full w-full object-cover" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-sm font-semibold">{m.title}</p>
                  <p className="text-xs text-ink/50">{subtitle(m.type, m.year)}</p>
                </div>
                <button type="button" className="btn-danger shrink-0 text-xs" onClick={() => remove(m.id)}>
                  Retirer
                </button>
              </div>
            )}
          />
        )}
      </div>
    </div>
  );
}
