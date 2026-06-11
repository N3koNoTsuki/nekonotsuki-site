"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Markdown from "./Markdown";
import HoverCard from "./HoverCard";
import LanguageBar from "./LanguageBar";
import { parseTags, formatRelativeFromNow, cn } from "@/lib/utils";
import { useFocusTrap } from "@/lib/useFocusTrap";
import type { LangStat } from "@/lib/languages";

type ProjectLike = {
  id: string;
  title: string;
  coverUrl: string | null;
  description: string | null;
  tags: string;
  githubUrl: string | null;
  demoUrl: string | null;
  featured?: boolean;
};

type Props = {
  project: ProjectLike;
  languages?: LangStat[];
  stars?: number;
  lastPush?: string | null;
  readme?: string | null;
};

/**
 * Project card. When a GitHub README is available, the card becomes clickable
 * and opens a lightbox that renders the README (the Code/Démo links keep
 * working — they stop propagation). The dialog is portaled to <body> to escape
 * the transformed ancestors (HoverCard / Reveal) that would trap a fixed overlay.
 */
export function ProjectCard({ project, languages, stars, lastPush, readme }: Props) {
  const tags = parseTags(project.tags);
  const hasReadme = Boolean(readme && readme.trim());
  const [open, setOpen] = useState(false);
  const cardRef = useRef<HTMLElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    cardRef.current?.focus();
  }, []);

  return (
    <>
      <HoverCard>
        <article
          ref={cardRef}
          role={hasReadme ? "button" : undefined}
          tabIndex={hasReadme ? 0 : undefined}
          aria-haspopup={hasReadme ? "dialog" : undefined}
          aria-label={hasReadme ? `Voir le README : ${project.title}` : undefined}
          onClick={hasReadme ? () => setOpen(true) : undefined}
          onKeyDown={
            hasReadme
              ? (e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setOpen(true);
                  }
                }
              : undefined
          }
          className={cn(
            "kawaii-card group flex h-full flex-col overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-rose-deep/60",
            hasReadme && "cursor-pointer",
          )}
        >
          <div className="relative aspect-[16/9] w-full overflow-hidden bg-kawaii-gradient">
            {project.coverUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={project.coverUrl} alt={project.title} className="h-full w-full object-cover" loading="lazy" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-5xl" aria-hidden>
                🌸
              </div>
            )}
            {project.featured && (
              <span className="absolute left-3 top-3 chip bg-white/80 text-rose-deep shadow-soft">★ Coup de cœur</span>
            )}
            {hasReadme && (
              <span className="absolute right-3 top-3 chip bg-white/80 text-lavender-deep shadow-soft transition group-hover:bg-lavender-soft">
                📖 README
              </span>
            )}
          </div>
          <div className="flex flex-1 flex-col p-5">
            <h3 className="font-display text-xl font-bold text-ink dark:text-nightink">{project.title}</h3>
            {(typeof stars === "number" || lastPush) && (
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-ink/50 dark:text-nightink/50">
                {typeof stars === "number" && <span>⭐ {stars}</span>}
                {lastPush && <span>🕒 maj {formatRelativeFromNow(lastPush)}</span>}
              </div>
            )}
            {project.description && (
              <div className="mt-1 text-sm">
                <Markdown>{project.description}</Markdown>
              </div>
            )}
            {languages && languages.length > 0 && (
              <LanguageBar stats={languages} maxLegend={4} barClassName="h-1.5" className="mt-4" />
            )}
            {tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {tags.map((t) => (
                  <span key={t} className="chip bg-lavender-soft text-lavender-deep">
                    {t}
                  </span>
                ))}
              </div>
            )}
            <div className="mt-auto flex gap-2 pt-4">
              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="btn-secondary text-sm"
                >
                  ⌨ Code
                </a>
              )}
              {project.demoUrl && (
                <a
                  href={project.demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="btn-primary text-sm"
                >
                  ✨ Démo
                </a>
              )}
            </div>
          </div>
        </article>
      </HoverCard>

      {hasReadme && (
        <ProjectLightbox
          project={project}
          languages={languages}
          stars={stars}
          lastPush={lastPush}
          readme={readme as string}
          tags={tags}
          open={open}
          onClose={close}
        />
      )}
    </>
  );
}

function ProjectLightbox({
  project,
  languages,
  stars,
  lastPush,
  readme,
  tags,
  open,
  onClose,
}: {
  project: ProjectLike;
  languages?: LangStat[];
  stars?: number;
  lastPush?: string | null;
  readme: string;
  tags: string[];
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

  const titleId = `proj-${project.id}-title`;

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
        className="my-3 w-full max-w-2xl overflow-hidden rounded-3xl border border-white/60 bg-cream shadow-glass dark:border-white/10 dark:bg-nightcard sm:my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative">
          <div className="aspect-[16/9] w-full overflow-hidden bg-kawaii-gradient">
            {project.coverUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={project.coverUrl} alt={project.title} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-6xl" aria-hidden>
                🌸
              </div>
            )}
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-cream/85 text-lg text-ink shadow-soft backdrop-blur-sm transition hover:bg-cream dark:bg-nightcard/85 dark:text-nightink"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4 p-5 sm:p-6">
          <div>
            <h2 id={titleId} className="font-display text-2xl font-bold text-ink dark:text-nightink">
              {project.title}
            </h2>
            {(typeof stars === "number" || lastPush) && (
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-ink/50 dark:text-nightink/50">
                {typeof stars === "number" && <span>⭐ {stars}</span>}
                {lastPush && <span>🕒 maj {formatRelativeFromNow(lastPush)}</span>}
              </div>
            )}
          </div>

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {tags.map((t) => (
                <span key={t} className="chip bg-lavender-soft text-lavender-deep">
                  {t}
                </span>
              ))}
            </div>
          )}

          {project.description && (
            <div className="text-sm">
              <Markdown>{project.description}</Markdown>
            </div>
          )}

          {languages && languages.length > 0 && <LanguageBar stats={languages} barClassName="h-2.5" />}

          {(project.githubUrl || project.demoUrl) && (
            <div className="flex flex-wrap gap-2">
              {project.githubUrl && (
                <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary text-sm">
                  ⌨ Code
                </a>
              )}
              {project.demoUrl && (
                <a href={project.demoUrl} target="_blank" rel="noopener noreferrer" className="btn-primary text-sm">
                  ✨ Démo
                </a>
              )}
            </div>
          )}

          <div className="border-t border-rose-soft/50 pt-4 dark:border-white/10">
            <h3 className="mb-2 font-display text-lg font-bold text-lavender-deep">📖 README</h3>
            <Markdown>{readme}</Markdown>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
