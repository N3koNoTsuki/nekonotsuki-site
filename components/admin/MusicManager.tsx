"use client";

import { useEffect, useMemo, useState } from "react";
import Modal from "./Modal";
import SortableList, { DragHandle } from "./Sortable";
import { api } from "@/lib/client";
import { cn } from "@/lib/utils";
import type { MusicDTO, FeaturedTrackDTO } from "@/lib/types";

export type PickableTrack = { videoId: string; title: string; playlist: string };

export default function MusicManager({
  initialMusic,
  initialFeatured,
  allTracks,
}: {
  initialMusic: MusicDTO[];
  initialFeatured: FeaturedTrackDTO[];
  allTracks: PickableTrack[];
}) {
  const [list, setList] = useState<MusicDTO[]>(initialMusic);
  const [featured, setFeatured] = useState<FeaturedTrackDTO[]>(initialFeatured);
  const [syncing, setSyncing] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  // Track picker (for featuring) + playlist-comment modal.
  const [query, setQuery] = useState("");
  const [noteFor, setNoteFor] = useState<MusicDTO | null>(null);

  const featuredIds = useMemo(() => new Set(featured.map((f) => f.videoId)), [featured]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    return allTracks.filter((t) => t.title.toLowerCase().includes(q)).slice(0, 30);
  }, [query, allTracks]);

  async function sync() {
    setSyncing(true);
    setError(null);
    setStatus(null);
    try {
      const synced = await api.post<MusicDTO[]>("/api/music/sync", {});
      setList([...synced].sort((a, b) => a.order - b.order));
      setStatus(`${synced.length} playlist(s) synchronisée(s) ✓`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur de synchronisation");
    } finally {
      setSyncing(false);
    }
  }

  // ---- Playlists ----
  async function toggle(m: MusicDTO) {
    setBusy(m.id);
    setError(null);
    try {
      const updated = await api.patch<MusicDTO>(`/api/music/${m.id}`, { visible: !m.visible });
      setList((prev) => prev.map((x) => (x.id === m.id ? { ...x, visible: updated.visible } : x)));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setBusy(null);
    }
  }

  async function reorder(ids: string[]) {
    const prev = list;
    const map = new Map(list.map((m) => [m.id, m]));
    setList(ids.map((id) => map.get(id)).filter((m): m is MusicDTO => !!m));
    try {
      await api.put("/api/music/reorder", { ids });
    } catch {
      setList(prev);
    }
  }

  async function saveNote(text: string) {
    if (!noteFor) return;
    const id = noteFor.id;
    setError(null);
    try {
      const updated = await api.patch<MusicDTO>(`/api/music/${id}`, { comment: text });
      setList((prev) => prev.map((x) => (x.id === id ? { ...x, comment: updated.comment } : x)));
      setNoteFor(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
      throw e;
    }
  }

  // ---- Featured tracks ----
  async function addFeatured(t: PickableTrack) {
    if (featuredIds.has(t.videoId)) return;
    setError(null);
    try {
      const created = await api.post<FeaturedTrackDTO>("/api/featured-music", {
        videoId: t.videoId,
        title: t.title,
      });
      setFeatured((prev) => [...prev, created]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    }
  }

  async function removeFeatured(id: string) {
    setFeatured((prev) => prev.filter((f) => f.id !== id));
    try {
      await api.del(`/api/featured-music/${id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    }
  }

  async function saveFeaturedComment(id: string, comment: string) {
    try {
      const updated = await api.patch<FeaturedTrackDTO>(`/api/featured-music/${id}`, { comment });
      setFeatured((prev) => prev.map((f) => (f.id === id ? { ...f, comment: updated.comment } : f)));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    }
  }

  async function reorderFeatured(ids: string[]) {
    const prev = featured;
    const map = new Map(featured.map((f) => [f.id, f]));
    setFeatured(ids.map((id) => map.get(id)).filter((f): f is FeaturedTrackDTO => !!f));
    try {
      await api.put("/api/featured-music/reorder", { ids });
    } catch {
      setFeatured(prev);
    }
  }

  const visibleCount = list.filter((m) => m.visible).length;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" className="btn-primary" onClick={sync} disabled={syncing}>
          {syncing ? "Synchronisation…" : "🔄 Synchroniser depuis YouTube"}
        </button>
        {status && <span className="text-sm font-semibold text-mint">{status}</span>}
        {error && <span className="text-sm font-semibold text-rose-deep">{error}</span>}
      </div>
      <p className="text-xs text-ink/50">
        Récupère toutes les playlists de la chaîne et les écrit dans <code>content/music.json</code>. Nécessite{" "}
        <code>YOUTUBE_API_KEY</code> dans <code>.env.local</code>. Choisis ensuite lesquelles afficher.
      </p>

      {/* ---- Featured tracks ---- */}
      <div>
        <h2 className="mb-1 font-display text-xl font-bold text-lavender-deep">
          ⭐ Titres en avant <span className="text-sm font-normal text-ink/40">({featured.length})</span>
        </h2>
        <p className="mb-3 text-xs text-ink/50">
          Quelques morceaux mis en avant tout en haut de la page Musique. Choisis-les parmi tes playlists.
        </p>

        {featured.length > 0 && (
          <SortableList
            items={featured}
            onReorder={reorderFeatured}
            className="mb-3 space-y-2"
            renderItem={(t, handle) => (
              <div className="flex items-center gap-2 kawaii-card p-2">
                <DragHandle handle={handle} />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://i.ytimg.com/vi/${t.videoId}/mqdefault.jpg`}
                  alt=""
                  className="h-12 w-20 flex-shrink-0 rounded-lg object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{t.title}</p>
                  <input
                    className="input mt-1 !py-1 text-xs"
                    defaultValue={t.comment}
                    placeholder="Commentaire (optionnel)…"
                    onBlur={(e) => {
                      if (e.target.value !== t.comment) saveFeaturedComment(t.id, e.target.value);
                    }}
                  />
                </div>
                <button type="button" className="btn-danger shrink-0 text-xs" onClick={() => removeFeatured(t.id)}>
                  Retirer
                </button>
              </div>
            )}
          />
        )}

        <label className="label" htmlFor="track-search">
          Ajouter un titre en avant — recherche dans tes playlists
        </label>
        <input
          id="track-search"
          className="input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tape un titre…"
          autoComplete="off"
        />
        {query.trim().length >= 2 && (
          <div className="mt-2">
            {results.length === 0 ? (
              <p className="text-sm text-ink/50">Aucun titre trouvé.</p>
            ) : (
              <ul className="max-h-72 space-y-1 overflow-y-auto rounded-2xl border border-rose-soft/50 p-2 dark:border-white/10">
                {results.map((t) => {
                  const already = featuredIds.has(t.videoId);
                  return (
                    <li key={t.videoId} className="flex items-center gap-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`https://i.ytimg.com/vi/${t.videoId}/mqdefault.jpg`}
                        alt=""
                        loading="lazy"
                        className="h-9 w-14 flex-shrink-0 rounded object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm">{t.title}</p>
                        <p className="truncate text-xs text-ink/40">{t.playlist}</p>
                      </div>
                      <button
                        type="button"
                        className="btn-primary shrink-0 text-xs"
                        onClick={() => addFeatured(t)}
                        disabled={already}
                      >
                        {already ? "✓" : "+ En avant"}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* ---- Playlists ---- */}
      <div>
        <h2 className="mb-3 font-display text-xl font-bold text-lavender-deep">
          Playlists{" "}
          <span className="text-sm font-normal text-ink/40">
            ({visibleCount}/{list.length} affichées)
          </span>
        </h2>
        {list.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-rose-soft/80 p-4 text-sm text-ink/40">
            Aucune playlist — clique « Synchroniser ». 🎵
          </p>
        ) : (
          <SortableList
            items={list}
            onReorder={reorder}
            className="space-y-2"
            renderItem={(m, handle) => (
              <div className={cn("flex items-center gap-2 kawaii-card p-2", !m.visible && "opacity-50")}>
                <DragHandle handle={handle} />
                <div className="h-12 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-kawaii-gradient">
                  {m.thumbnail && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={m.thumbnail} alt="" className="h-full w-full object-cover" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{m.title}</p>
                  <p className="truncate text-xs text-ink/50">
                    {m.itemCount} titre{m.itemCount > 1 ? "s" : ""}
                    {m.comment ? ` · 💬 ${m.comment}` : ""}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setNoteFor(m)}
                  className="shrink-0 text-xs btn-ghost"
                  title="Commentaire"
                >
                  💬
                </button>
                <button
                  type="button"
                  onClick={() => toggle(m)}
                  disabled={busy === m.id}
                  className={cn("shrink-0 text-xs", m.visible ? "btn-secondary" : "btn-ghost")}
                >
                  {m.visible ? "👁 Affichée" : "🚫 Masquée"}
                </button>
              </div>
            )}
          />
        )}
      </div>

      {/* Playlist comment modal — isolated so typing doesn't re-render the lists */}
      <NoteModal playlist={noteFor} onClose={() => setNoteFor(null)} onSave={saveNote} />
    </div>
  );
}

// Local state lives here so each keystroke only re-renders this tiny component,
// not the whole manager (whose dnd-kit lists would otherwise steal focus).
function NoteModal({
  playlist,
  onClose,
  onSave,
}: {
  playlist: MusicDTO | null;
  onClose: () => void;
  onSave: (text: string) => Promise<void>;
}) {
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (playlist) setText(playlist.comment ?? "");
  }, [playlist]);

  async function submit() {
    setSaving(true);
    try {
      await onSave(text);
    } catch {
      // error surfaced by the parent
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={!!playlist} onClose={onClose} title={`Commentaire — ${playlist?.title ?? ""}`}>
      <div className="space-y-4">
        <textarea
          className="input min-h-[120px]"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Ton mot sur cette playlist…"
        />
        <div className="flex justify-end gap-2">
          <button type="button" className="btn-ghost" onClick={onClose}>
            Annuler
          </button>
          <button type="button" className="btn-primary" onClick={submit} disabled={saving}>
            {saving ? "…" : "Enregistrer"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
