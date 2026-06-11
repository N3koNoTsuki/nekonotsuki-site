"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useFocusTrap } from "@/lib/useFocusTrap";

export type GalleryTrack = { videoId: string; title: string };
export type FeaturedTrack = { id: string; videoId: string; title: string; comment: string };
export type GalleryPlaylist = {
  id: string;
  playlistId: string;
  title: string;
  description: string;
  comment: string;
  thumbnail: string | null;
  itemCount: number;
  url: string;
};

export default function MusicGallery({
  playlists,
  featured = [],
}: {
  playlists: GalleryPlaylist[];
  featured?: FeaturedTrack[];
}) {
  const [open, setOpen] = useState<GalleryPlaylist | null>(null);

  return (
    <>
      {featured.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-4 font-display text-xl font-bold text-rose-deep">⭐ Mes coups de cœur</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((t) => (
              <a
                key={t.id}
                href={`https://www.youtube.com/watch?v=${t.videoId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="kawaii-card group flex items-center gap-3 overflow-hidden p-2 transition hover:-translate-y-0.5"
              >
                <div className="relative h-14 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-kawaii-gradient">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://i.ytimg.com/vi/${t.videoId}/mqdefault.jpg`}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                  <span className="absolute inset-0 flex items-center justify-center bg-ink/25 text-2xl text-white opacity-0 transition group-hover:opacity-100">
                    ▶
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="line-clamp-1 text-sm font-bold text-ink dark:text-[#efe6ee]">{t.title}</h3>
                  {t.comment.trim() && (
                    <p className="line-clamp-2 text-xs italic text-rose-deep">“{t.comment}”</p>
                  )}
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {playlists.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setOpen(p)}
            aria-haspopup="dialog"
            className="kawaii-card group block overflow-hidden text-left outline-none transition hover:-translate-y-1 focus-visible:ring-2 focus-visible:ring-rose-deep/60"
          >
            <div className="relative aspect-video w-full overflow-hidden bg-kawaii-gradient">
              {p.thumbnail ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={p.thumbnail}
                  alt={p.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-4xl" aria-hidden>
                  🎵
                </div>
              )}
              <span className="absolute inset-0 flex items-center justify-center bg-ink/25 text-4xl text-white opacity-0 transition group-hover:opacity-100">
                ▶
              </span>
            </div>
            <div className="p-3">
              <h3 className="line-clamp-1 text-sm font-bold text-ink dark:text-[#efe6ee]">{p.title}</h3>
              <p className="text-xs text-ink/50 dark:text-[#efe6ee]/50">
                {p.itemCount} titre{p.itemCount > 1 ? "s" : ""}
              </p>
            </div>
          </button>
        ))}
      </div>

      {open && <MusicLightbox playlist={open} onClose={() => setOpen(null)} />}
    </>
  );
}

// Tracklists are fetched per playlist when a popup opens (static JSON served by
// /music-tracks/[playlistId]) and kept here so reopening a playlist is instant.
const trackCache = new Map<string, GalleryTrack[]>();

function MusicLightbox({ playlist, onClose }: { playlist: GalleryPlaylist; onClose: () => void }) {
  const [mounted, setMounted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [tracks, setTracks] = useState<GalleryTrack[] | null>(
    () => trackCache.get(playlist.playlistId) ?? null,
  );
  const [failed, setFailed] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  useFocusTrap(boxRef, mounted);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (trackCache.has(playlist.playlistId)) return;
    let cancelled = false;
    fetch(`/music-tracks/${playlist.playlistId}`)
      .then((res) =>
        res.ok ? (res.json() as Promise<{ tracks: GalleryTrack[] }>) : Promise.reject(new Error(`${res.status}`)),
      )
      .then((data) => {
        if (cancelled) return;
        trackCache.set(playlist.playlistId, data.tracks);
        setTracks(data.tracks);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [playlist.playlistId]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/50 p-3 backdrop-blur-sm sm:p-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={playlist.title}
    >
      <div
        ref={boxRef}
        className="my-3 w-full max-w-2xl overflow-hidden rounded-3xl border border-white/60 bg-cream shadow-glass dark:border-white/10 dark:bg-[#2c2533] sm:my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cover → click to play the playlist */}
        <div className="relative">
          {playing ? (
            <iframe
              src={`https://www.youtube.com/embed/videoseries?list=${playlist.playlistId}&autoplay=1`}
              title={playlist.title}
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
              className="aspect-video w-full border-0"
            />
          ) : (
            <button
              type="button"
              onClick={() => setPlaying(true)}
              aria-label="Lire la playlist"
              className="group relative block aspect-video w-full overflow-hidden bg-kawaii-gradient"
            >
              {playlist.thumbnail ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={playlist.thumbnail} alt={playlist.title} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-6xl" aria-hidden>
                  🎵
                </div>
              )}
              <span className="absolute inset-0 flex items-center justify-center bg-ink/30 text-6xl text-white transition group-hover:bg-ink/40">
                ▶
              </span>
            </button>
          )}
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-cream/85 text-lg text-ink shadow-soft backdrop-blur-sm transition hover:bg-cream dark:bg-[#2c2533]/85 dark:text-[#efe6ee]"
          >
            ✕
          </button>
        </div>

        <div className="p-5">
          <h2 className="font-display text-2xl font-bold text-ink dark:text-[#efe6ee]">{playlist.title}</h2>
          <p className="text-xs text-ink/50 dark:text-[#efe6ee]/50">
            {playlist.itemCount} titre{playlist.itemCount > 1 ? "s" : ""}
          </p>
          {playlist.comment.trim() && (
            <p className="mt-2 rounded-2xl bg-rose-soft/40 px-3 py-2 text-sm italic text-rose-deep dark:bg-white/5">
              “{playlist.comment}”
            </p>
          )}
          {playlist.description.trim() && (
            <p className="mt-2 whitespace-pre-line text-sm text-ink/70 dark:text-[#efe6ee]/70">{playlist.description}</p>
          )}

          {/* Spotify-style tracklist — fetched on open, cached per playlist */}
          {failed ? (
            <p className="mt-4 rounded-2xl bg-rose-soft/30 px-3 py-3 text-sm text-ink/60 dark:bg-white/5 dark:text-[#efe6ee]/60">
              Impossible de charger la tracklist…{" "}
              <a
                href={playlist.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-rose-deep underline"
              >
                l’ouvrir sur YouTube ↗
              </a>
            </p>
          ) : !tracks ? (
            <div className="mt-4 space-y-2" aria-busy="true" aria-label="Chargement de la tracklist">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex animate-pulse items-center gap-3 px-2 py-1.5">
                  <span className="h-3 w-5 rounded bg-rose-soft/50 dark:bg-white/10" />
                  <span className="h-9 w-14 rounded-lg bg-rose-soft/50 dark:bg-white/10" />
                  <span className="h-3 flex-1 rounded bg-rose-soft/40 dark:bg-white/10" />
                </div>
              ))}
            </div>
          ) : (
          <ol className="mt-4 max-h-[42vh] divide-y divide-rose-soft/30 overflow-y-auto rounded-2xl dark:divide-white/10">
            {tracks.map((t, i) => (
              <li key={`${t.videoId}-${i}`}>
                <a
                  href={`https://www.youtube.com/watch?v=${t.videoId}&list=${playlist.playlistId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-2 py-2 transition hover:bg-rose-soft/20 dark:hover:bg-white/5"
                >
                  <span className="w-5 shrink-0 text-right text-xs text-ink/40 dark:text-[#efe6ee]/40">{i + 1}</span>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://i.ytimg.com/vi/${t.videoId}/mqdefault.jpg`}
                    alt=""
                    loading="lazy"
                    className="h-9 w-14 shrink-0 rounded object-cover"
                  />
                  <span className="line-clamp-2 text-sm text-ink dark:text-[#efe6ee]">{t.title}</span>
                  <span className="ml-auto shrink-0 text-xs text-rose-deep opacity-0 transition group-hover:opacity-100">
                    ▶
                  </span>
                </a>
              </li>
            ))}
          </ol>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
