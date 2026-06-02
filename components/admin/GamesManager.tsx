"use client";

import { useEffect, useState } from "react";
import Modal from "./Modal";
import MarkdownEditor from "./MarkdownEditor";
import SortableList, { DragHandle } from "./Sortable";
import { api } from "@/lib/client";
import { cn } from "@/lib/utils";
import type { GameDTO } from "@/lib/types";

type RawgResult = {
  rawgId: number;
  slug: string;
  name: string;
  cover: string | null;
  released: string | null;
  platforms: string;
};

type GameDraft = {
  id: string;
  name: string;
  cover: string | null;
  source: GameDTO["source"];
  highlight: boolean;
  rating: number;
  playtime: number; // hours (stored as playtimeMinutes)
  review: string;
  clips: [string, string, string];
  visible: boolean;
};

function hours(min: number | null): string {
  return min && min > 0 ? `${Math.round(min / 60)} h` : "";
}

/** Hidden games sink to the bottom; order within each group is preserved (stable sort). */
function sortGames(list: GameDTO[]): GameDTO[] {
  return [...list].sort((a, b) => Number(b.visible) - Number(a.visible));
}

export default function GamesManager({ initialGames }: { initialGames: GameDTO[] }) {
  const [games, setGames] = useState<GameDTO[]>(() => sortGames(initialGames));
  const [syncing, setSyncing] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<RawgResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [adding, setAdding] = useState<number | null>(null);

  const [draft, setDraft] = useState<GameDraft | null>(null);
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  const ownedRawg = new Set(games.map((g) => g.rawgId).filter((x): x is number => x != null));

  async function syncSteam() {
    setSyncing(true);
    setStatus(null);
    setError(null);
    try {
      await api.post("/api/games/sync-steam", {});
      const fresh = (await (await fetch("/api/games")).json()) as GameDTO[];
      setGames(sortGames(fresh));
      setStatus(`Bibliothèque Steam synchronisée ✓ (${fresh.filter((g) => g.source === "steam").length} jeux joués)`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur Steam");
    } finally {
      setSyncing(false);
    }
  }

  // Debounced RAWG search (for non-Steam games).
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
        const res = await fetch(`/api/games/search?q=${encodeURIComponent(q)}`);
        const data: unknown = await res.json();
        setResults(res.ok && Array.isArray(data) ? (data as RawgResult[]) : []);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 450);
    return () => clearTimeout(timer);
  }, [query]);

  async function addRawg(r: RawgResult) {
    if (ownedRawg.has(r.rawgId)) return;
    setError(null);
    setAdding(r.rawgId);
    try {
      const created = await api.post<GameDTO>("/api/games", {
        rawgId: r.rawgId,
        slug: r.slug || undefined,
        name: r.name,
        cover: r.cover ?? undefined,
        released: r.released ?? undefined,
        platforms: r.platforms || undefined,
      });
      setGames((prev) => sortGames([...prev, created]));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setAdding(null);
    }
  }

  function openEdit(g: GameDTO) {
    setDraft({
      id: g.id,
      name: g.name,
      cover: g.cover,
      highlight: g.highlight,
      source: g.source,
      rating: g.rating ?? 0,
      playtime: g.playtimeMinutes ? Math.round(g.playtimeMinutes / 60) : 0,
      review: g.review,
      clips: [g.clips[0] ?? "", g.clips[1] ?? "", g.clips[2] ?? ""],
      visible: g.visible,
    });
  }

  async function saveDraft() {
    if (!draft) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await api.patch<GameDTO>(`/api/games/${draft.id}`, {
        highlight: draft.highlight,
        rating: draft.rating,
        playtimeMinutes: draft.playtime > 0 ? draft.playtime * 60 : null,
        review: draft.review,
        clips: draft.clips.map((c) => c.trim()).filter(Boolean),
        visible: draft.visible,
      });
      setGames((prev) => sortGames(prev.map((g) => (g.id === updated.id ? updated : g))));
      setDraft(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setSaving(false);
    }
  }

  async function toggleVisible(g: GameDTO) {
    setBusy(g.id);
    setError(null);
    try {
      const updated = await api.patch<GameDTO>(`/api/games/${g.id}`, { visible: !g.visible });
      setGames((prev) => sortGames(prev.map((x) => (x.id === g.id ? { ...x, visible: updated.visible } : x))));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setBusy(null);
    }
  }

  async function remove(id: string) {
    if (!confirm("Retirer ce jeu ?")) return;
    await api.del(`/api/games/${id}`);
    setGames((prev) => prev.filter((g) => g.id !== id));
  }

  async function reorder(ids: string[]) {
    const prev = games;
    const map = new Map(games.map((g) => [g.id, g]));
    const next = sortGames(ids.map((id) => map.get(id)).filter((g): g is GameDTO => !!g));
    setGames(next);
    try {
      await api.put("/api/games/reorder", { ids: next.map((g) => g.id) });
    } catch {
      setGames(prev);
    }
  }

  return (
    <div className="space-y-8">
      {/* Steam sync */}
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" className="btn-primary" onClick={syncSteam} disabled={syncing}>
          {syncing ? "Synchronisation…" : "🎮 Synchroniser Steam"}
        </button>
        {status && <span className="text-sm font-semibold text-mint">{status}</span>}
        {error && <span className="text-sm font-semibold text-rose-deep">{error}</span>}
      </div>

      {/* RAWG search for non-Steam games */}
      <div>
        <label className="label" htmlFor="game-search">
          Ajouter un jeu hors Steam (console…) — recherche RAWG
        </label>
        <input
          id="game-search"
          className="input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tape un titre… (ex. Zelda, Mario)"
          autoComplete="off"
        />
        {query.trim().length >= 2 && (
          <div className="mt-3">
            {searching && results.length === 0 ? (
              <p className="text-sm text-ink/50">Recherche…</p>
            ) : results.length === 0 ? (
              <p className="text-sm text-ink/50">Aucun résultat.</p>
            ) : (
              <ul className="grid gap-2 sm:grid-cols-2">
                {results.map((r) => {
                  const already = ownedRawg.has(r.rawgId);
                  return (
                    <li key={r.rawgId} className="flex items-center gap-3 rounded-2xl border border-rose-soft/60 p-2 dark:border-white/10">
                      <div className="h-12 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-kawaii-gradient">
                        {r.cover && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={r.cover} alt="" className="h-full w-full object-cover" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-1 text-sm font-semibold">{r.name}</p>
                        <p className="truncate text-xs text-ink/50">
                          {[r.released?.slice(0, 4), r.platforms].filter(Boolean).join(" · ")}
                        </p>
                      </div>
                      <button
                        type="button"
                        className="btn-primary shrink-0 text-xs"
                        onClick={() => addRawg(r)}
                        disabled={already || adding === r.rawgId}
                      >
                        {already ? "✓" : adding === r.rawgId ? "…" : "+ Ajouter"}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* Collection */}
      <div>
        <h2 className="mb-3 font-display text-xl font-bold text-lavender-deep">
          Mes jeux <span className="text-sm font-normal text-ink/40">({games.length})</span>
        </h2>
        {games.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-rose-soft/80 p-4 text-sm text-ink/40">
            Synchronise Steam ou ajoute un jeu ci-dessus. 🎮
          </p>
        ) : (
          <SortableList
            items={games}
            onReorder={reorder}
            grid
            className="grid gap-3 sm:grid-cols-2"
            renderItem={(g, handle) => (
              <div className={cn("flex items-center gap-2 kawaii-card p-2", !g.visible && "opacity-50")}>
                <DragHandle handle={handle} />
                <div className="h-12 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-kawaii-gradient">
                  {g.cover && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={g.cover} alt="" className="h-full w-full object-cover" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 text-sm font-semibold">
                    {g.highlight && <span title="Highlight">⭐ </span>}
                    {g.name}
                  </p>
                  <p className="truncate text-xs text-ink/50">
                    {[hours(g.playtimeMinutes), g.source === "rawg" ? [g.released?.slice(0, 4), g.platforms].filter(Boolean).join(" · ") : ""]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleVisible(g)}
                  disabled={busy === g.id}
                  className={cn("shrink-0 text-xs", g.visible ? "btn-secondary" : "btn-ghost")}
                  title={g.visible ? "Masquer (envoie le jeu en bas)" : "Afficher"}
                >
                  {g.visible ? "👁 Affiché" : "🚫 Masqué"}
                </button>
                <button type="button" className="btn-secondary shrink-0 text-xs" onClick={() => openEdit(g)}>
                  Éditer
                </button>
                {g.source === "rawg" && (
                  <button type="button" className="btn-danger shrink-0 text-xs" onClick={() => remove(g.id)}>
                    Suppr
                  </button>
                )}
              </div>
            )}
          />
        )}
      </div>

      {/* Edit modal */}
      <Modal open={!!draft} onClose={() => setDraft(null)} title={draft?.name ?? "Jeu"}>
        {draft && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-4">
              <label className="flex items-center gap-2 text-sm font-semibold">
                <input
                  type="checkbox"
                  className="accent-rose-deep"
                  checked={draft.highlight}
                  onChange={(e) => setDraft({ ...draft, highlight: e.target.checked })}
                />
                ⭐ Highlight
              </label>
              <label className="flex items-center gap-2 text-sm font-semibold">
                <input
                  type="checkbox"
                  className="accent-rose-deep"
                  checked={draft.visible}
                  onChange={(e) => setDraft({ ...draft, visible: e.target.checked })}
                />
                👁 Affiché
              </label>
              <div className="flex items-center gap-2">
                <span className="label !mb-0">Note</span>
                <select
                  className="input !w-auto"
                  value={draft.rating}
                  onChange={(e) => setDraft({ ...draft, rating: Number(e.target.value) })}
                >
                  <option value={0}>Aucune</option>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>
                      {"★".repeat(n)} ({n})
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label className="label !mb-0" htmlFor="game-hours">
                  Heures de jeu
                </label>
                <input
                  id="game-hours"
                  type="number"
                  min={0}
                  className="input !w-24"
                  value={draft.playtime || ""}
                  onChange={(e) =>
                    setDraft({ ...draft, playtime: Math.max(0, Math.floor(Number(e.target.value) || 0)) })
                  }
                />
              </div>
            </div>

            {draft.source === "steam" && (
              <p className="-mt-2 text-xs text-ink/50">
                ⚠️ Jeu Steam : les heures seront écrasées à la prochaine synchro.
              </p>
            )}

            <MarkdownEditor
              label="Mon avis (Markdown)"
              value={draft.review}
              onChange={(review) => setDraft({ ...draft, review })}
              minRows={6}
            />

            <div>
              <span className="label">Clips (liens YouTube ou /uploads/…, jusqu’à 3)</span>
              <div className="space-y-2">
                {[0, 1, 2].map((i) => (
                  <input
                    key={i}
                    className="input"
                    value={draft.clips[i]}
                    onChange={(e) => {
                      const clips = [...draft.clips] as [string, string, string];
                      clips[i] = e.target.value;
                      setDraft({ ...draft, clips });
                    }}
                    placeholder={`Clip ${i + 1} — https://youtube.com/watch?v=…`}
                  />
                ))}
              </div>
            </div>

            {error && <p className="text-sm text-rose-deep">{error}</p>}
            <div className="flex justify-end gap-2">
              <button type="button" className="btn-ghost" onClick={() => setDraft(null)}>
                Annuler
              </button>
              <button type="button" className="btn-primary" onClick={saveDraft} disabled={saving}>
                {saving ? "Enregistrement…" : "Enregistrer"}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
