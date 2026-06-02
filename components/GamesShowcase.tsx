"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Markdown from "./Markdown";
import { StarRating } from "./ui";
import { cn } from "@/lib/utils";
import type { GameDTO } from "@/lib/types";

// ---- helpers ----

/** Steam playtime (minutes) → "1 713 h". Empty string when unknown / zero. */
function hours(min: number | null): string {
  if (!min || min <= 0) return "";
  return `${Math.round(min / 60).toLocaleString("fr-FR")} h`;
}

/** Release year · platforms — shown for non-Steam games alongside the hours. */
function releaseInfo(game: GameDTO): string {
  return [game.released?.slice(0, 4), game.platforms].filter(Boolean).join(" · ");
}

/** Card meta: playtime hours (any source, manual for non-Steam) then release info for RAWG games. */
function metaLine(game: GameDTO): string {
  return [hours(game.playtimeMinutes), game.source === "rawg" ? releaseInfo(game) : ""]
    .filter(Boolean)
    .join(" · ");
}

type ParsedClip =
  | { kind: "youtube"; embed: string }
  | { kind: "video"; src: string }
  | { kind: "link"; href: string };

/**
 * Turns a clip URL into something playable. YouTube watch / youtu.be / embed /
 * shorts links become an embed; uploaded video files (cf. the video regex in
 * Markdown.tsx) become a <video>; anything else stays a plain link.
 */
function parseClip(url: string): ParsedClip {
  const u = url.trim();
  const yt = u.match(
    /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/,
  );
  if (yt) return { kind: "youtube", embed: `https://www.youtube.com/embed/${yt[1]}` };
  if (/\.(mp4|webm|ogv|mov|m4v)(\?.*)?$/i.test(u)) return { kind: "video", src: u };
  return { kind: "link", href: u };
}

// ---- showcase ----

export default function GamesShowcase({ games }: { games: GameDTO[] }) {
  const [open, setOpen] = useState<GameDTO | null>(null);
  const highlights = games.filter((g) => g.highlight);

  return (
    <div className="space-y-12">
      {highlights.length > 0 && (
        <section>
          <h2 className="mb-4 font-display text-2xl font-bold text-lavender-deep">
            <span className="mr-1" aria-hidden>
              🏆
            </span>
            Coups de cœur
          </h2>
          <div className="grid gap-5 sm:grid-cols-2">
            {highlights.map((g) => (
              <GameCard key={g.id} game={g} large onOpen={() => setOpen(g)} />
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-4 font-display text-2xl font-bold text-lavender-deep">
          <span className="mr-1" aria-hidden>
            🎮
          </span>
          Ma collection
          <span className="ml-2 text-sm font-normal text-ink/40 dark:text-[#efe6ee]/40">({games.length})</span>
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {games.map((g) => (
            <GameCard key={g.id} game={g} onOpen={() => setOpen(g)} />
          ))}
        </div>
      </section>

      {open && <GameLightbox game={open} onClose={() => setOpen(null)} />}
    </div>
  );
}

function GameCard({ game, large = false, onOpen }: { game: GameDTO; large?: boolean; onOpen: () => void }) {
  const meta = metaLine(game);
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-haspopup="dialog"
      aria-label={`Voir ${game.name}`}
      className="kawaii-card group block overflow-hidden text-left outline-none transition hover:-translate-y-1 focus-visible:ring-2 focus-visible:ring-rose-deep/60"
    >
      <div className="relative aspect-video w-full overflow-hidden bg-kawaii-gradient">
        {game.cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={game.cover}
            alt={game.name}
            loading="lazy"
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-4xl" aria-hidden>
            🎮
          </div>
        )}
        {game.highlight && (
          <span className="absolute left-2 top-2 rounded-full bg-rose-deep/90 px-2 py-0.5 text-xs font-semibold text-white shadow-soft">
            🏆
          </span>
        )}
        <span className="absolute inset-0 flex items-center justify-center bg-ink/25 text-4xl text-white opacity-0 transition group-hover:opacity-100">
          ▶
        </span>
      </div>
      <div className={cn("p-3", large && "p-4")}>
        <h3 className={cn("line-clamp-1 font-bold text-ink dark:text-[#efe6ee]", large ? "text-base" : "text-sm")}>
          {game.name}
        </h3>
        <div className="mt-0.5 flex items-center justify-between gap-2">
          {meta ? <p className="line-clamp-1 text-xs text-ink/50 dark:text-[#efe6ee]/50">{meta}</p> : <span />}
          {game.rating ? <StarRating value={game.rating} className="shrink-0 text-sm" /> : null}
        </div>
      </div>
    </button>
  );
}

function GameLightbox({ game, onClose }: { game: GameDTO; onClose: () => void }) {
  const [mounted, setMounted] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => setMounted(true), []);

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

  const playtimeStr = hours(game.playtimeMinutes);
  const releaseStr = game.source === "rawg" ? releaseInfo(game) : "";
  const clips = game.clips.filter((c) => c.trim()).map(parseClip);
  const titleId = `game-${game.id}-title`;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/50 p-3 backdrop-blur-sm sm:p-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div
        className="my-3 w-full max-w-2xl overflow-hidden rounded-3xl border border-white/60 bg-cream shadow-glass dark:border-white/10 dark:bg-[#2c2533] sm:my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative">
          <div className="aspect-video w-full overflow-hidden bg-kawaii-gradient">
            {game.cover ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={game.cover} alt={game.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-6xl" aria-hidden>
                🎮
              </div>
            )}
          </div>
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

        <div className="space-y-4 p-5">
          <div className="flex items-start justify-between gap-3">
            <h2 id={titleId} className="font-display text-2xl font-bold text-ink dark:text-[#efe6ee]">
              {game.name}
            </h2>
            {game.rating ? <StarRating value={game.rating} className="mt-1 shrink-0" /> : null}
          </div>

          {(playtimeStr || releaseStr) && (
            <p className="text-sm font-semibold text-lavender-deep">
              {[playtimeStr && `⏱ ${playtimeStr} de jeu`, releaseStr].filter(Boolean).join(" · ")}
            </p>
          )}

          {game.review.trim() && <Markdown>{game.review}</Markdown>}

          {clips.length > 0 && (
            <div className="space-y-3 border-t border-rose-soft/50 pt-4 dark:border-white/10">
              {clips.map((clip, i) => (
                <ClipPlayer key={i} clip={clip} title={`${game.name} — clip ${i + 1}`} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}

function ClipPlayer({ clip, title }: { clip: ParsedClip; title: string }) {
  if (clip.kind === "youtube") {
    return (
      <iframe
        src={clip.embed}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="aspect-video w-full overflow-hidden rounded-2xl border-0"
      />
    );
  }
  if (clip.kind === "video") {
    return (
      <video src={clip.src} controls preload="metadata" playsInline className="aspect-video w-full rounded-2xl bg-ink/80" />
    );
  }
  return (
    <a
      href={clip.href}
      target="_blank"
      rel="noopener noreferrer"
      className="block break-all text-sm font-semibold text-rose-deep hover:underline"
    >
      ▶ {clip.href}
    </a>
  );
}
