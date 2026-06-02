"use client";

import { useState } from "react";
import { api } from "@/lib/client";
import { cn } from "@/lib/utils";
import type { MusicDTO } from "@/lib/types";

export default function MusicManager({ initialMusic }: { initialMusic: MusicDTO[] }) {
  const [list, setList] = useState<MusicDTO[]>(initialMusic);
  const [syncing, setSyncing] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

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

  const visibleCount = list.filter((m) => m.visible).length;

  return (
    <div className="space-y-6">
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
          <ul className="space-y-2">
            {list.map((m) => (
              <li key={m.id} className={cn("flex items-center gap-3 kawaii-card p-2", !m.visible && "opacity-50")}>
                <div className="h-12 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-kawaii-gradient">
                  {m.thumbnail && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={m.thumbnail} alt="" className="h-full w-full object-cover" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{m.title}</p>
                  <p className="text-xs text-ink/50">
                    {m.itemCount} titre{m.itemCount > 1 ? "s" : ""}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => toggle(m)}
                  disabled={busy === m.id}
                  className={cn("shrink-0 text-xs", m.visible ? "btn-secondary" : "btn-ghost")}
                >
                  {m.visible ? "👁 Affichée" : "🚫 Masquée"}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
