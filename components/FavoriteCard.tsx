"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Markdown from "./Markdown";
import HoverCard from "./HoverCard";
import { StarRating } from "./ui";
import { useFocusTrap } from "@/lib/useFocusTrap";

type FavoriteLike = {
  id: string;
  title: string;
  imageUrl: string | null;
  description: string | null;
  details?: string | null;
  rating: number | null;
  comment: string | null;
  category?: { name: string; icon: string | null } | null;
};

/**
 * Favorite vignette. The card itself is a compact teaser; clicking it opens a
 * centered lightbox with the full description plus the long-form `details`
 * field (edited from /edit). The dialog is portaled to <body> so it escapes
 * the transformed ancestors (HoverCard's motion transform, Reveal's keyframe)
 * that would otherwise trap a `position: fixed` overlay.
 */
export function FavoriteCard({ favorite, showCategory = false }: { favorite: FavoriteLike; showCategory?: boolean }) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    // Return focus to the card that opened the dialog.
    triggerRef.current?.focus();
  }, []);

  return (
    <>
      <HoverCard>
        <article className="kawaii-card group relative flex h-full gap-4 p-4">
          {/* Stretched, transparent click target. Rendered as a real <button>
              for keyboard + screen-reader support; sits above the (non-
              interactive) content so a tap anywhere opens the lightbox. */}
          <button
            ref={triggerRef}
            type="button"
            onClick={() => setOpen(true)}
            aria-haspopup="dialog"
            aria-label={`Voir les détails : ${favorite.title}`}
            className="absolute inset-0 z-10 rounded-3xl outline-none ring-rose-deep/60 transition focus-visible:ring-2"
          />

          <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-2xl bg-kawaii-gradient">
            {favorite.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={favorite.imageUrl} alt={favorite.title} className="h-full w-full object-cover" loading="lazy" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-3xl" aria-hidden>
                {favorite.category?.icon ?? "♡"}
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <h3 className="min-w-0 break-words font-display text-lg font-bold leading-snug text-ink dark:text-[#efe6ee]">
                {favorite.title}
              </h3>
              {favorite.rating ? <StarRating value={favorite.rating} className="mt-0.5 shrink-0" /> : null}
            </div>
            {showCategory && favorite.category && (
              <span className="text-xs text-ink/50 dark:text-[#efe6ee]/50">
                {favorite.category.icon} {favorite.category.name}
              </span>
            )}
            {favorite.comment && <p className="mt-0.5 text-sm italic text-rose-deep">“{favorite.comment}”</p>}
            {favorite.description && (
              <div className="mt-1">
                <Markdown className="line-clamp-3 text-sm">{favorite.description}</Markdown>
              </div>
            )}
          </div>

          {/* Always-visible "expand" affordance (no hover on touch screens). */}
          <span
            aria-hidden
            className="pointer-events-none absolute bottom-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-white/70 text-ink/50 shadow-soft transition group-hover:bg-rose-soft group-hover:text-rose-deep dark:bg-white/10 dark:text-[#efe6ee]/50"
          >
            <ExpandIcon className="h-3.5 w-3.5" />
          </span>
        </article>
      </HoverCard>

      <FavoriteLightbox favorite={favorite} open={open} onClose={close} />
    </>
  );
}

function FavoriteLightbox({
  favorite,
  open,
  onClose,
}: {
  favorite: FavoriteLike;
  open: boolean;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  useFocusTrap(boxRef, open);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
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
  }, [open, onClose]);

  if (!mounted || !open) return null;

  const titleId = `fav-${favorite.id}-title`;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/40 p-3 backdrop-blur-sm sm:p-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div
        ref={boxRef}
        className="my-3 w-full max-w-lg overflow-hidden rounded-3xl border border-white/60 bg-cream shadow-glass dark:border-white/10 dark:bg-[#2c2533] sm:my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative">
          <div className="aspect-[16/10] w-full overflow-hidden bg-kawaii-gradient">
            {favorite.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={favorite.imageUrl} alt={favorite.title} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-6xl" aria-hidden>
                {favorite.category?.icon ?? "♡"}
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

        <div className="space-y-3 p-5">
          <div className="flex items-start justify-between gap-3">
            <h2 id={titleId} className="font-display text-2xl font-bold text-ink dark:text-[#efe6ee]">
              {favorite.title}
            </h2>
            {favorite.rating ? <StarRating value={favorite.rating} className="mt-1 shrink-0" /> : null}
          </div>

          {favorite.category && (
            <p className="text-sm font-semibold text-lavender-deep">
              {favorite.category.icon} {favorite.category.name}
            </p>
          )}

          {favorite.comment && <p className="text-base italic text-rose-deep">“{favorite.comment}”</p>}

          {favorite.description && <Markdown>{favorite.description}</Markdown>}

          {favorite.details && (
            <div className="mt-1 border-t border-rose-soft/50 pt-3 dark:border-white/10">
              <Markdown>{favorite.details}</Markdown>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}

function ExpandIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M8 21H5a2 2 0 0 1-2-2v-3M16 21h3a2 2 0 0 0 2-2v-3" />
    </svg>
  );
}
