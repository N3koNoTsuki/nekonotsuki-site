import Markdown from "./Markdown";
import HoverCard from "./HoverCard";
import LanguageBar from "./LanguageBar";
import { parseTags, formatMonthYear, tagMeta, cn } from "@/lib/utils";
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

export function ProjectCard({ project, languages }: { project: ProjectLike; languages?: LangStat[] }) {
  const tags = parseTags(project.tags);
  return (
    <HoverCard>
      <article className="kawaii-card flex h-full flex-col overflow-hidden">
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
        </div>
        <div className="flex flex-1 flex-col p-5">
          <h3 className="font-display text-xl font-bold text-ink dark:text-[#efe6ee]">{project.title}</h3>
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
        </div>
      </article>
    </HoverCard>
  );
}

type TimelineLike = {
  id: string;
  date: Date | string;
  title: string;
  description: string | null;
  tag: string;
};

export function TimelineItem({
  entry,
  last = false,
  delay = 0,
  animate = false,
}: {
  entry: TimelineLike;
  last?: boolean;
  delay?: number;
  animate?: boolean;
}) {
  const meta = tagMeta(entry.tag);
  return (
    <li
      className={cn("relative pl-10", animate && "animate-fade-up")}
      style={animate && delay ? { animationDelay: `${delay}ms` } : undefined}
    >
      {/* Spine + dot */}
      <span
        className={cn(
          "absolute left-3 top-2 h-3.5 w-3.5 -translate-x-1/2 rounded-full border-2 border-white bg-rose-deep shadow-soft",
        )}
        aria-hidden
      />
      {!last && <span className="absolute left-3 top-2 h-full w-0.5 -translate-x-1/2 bg-rose-soft" aria-hidden />}
      <div className="kawaii-card p-5">
        <div className="flex flex-wrap items-center gap-2">
          <time className="text-sm font-semibold text-lavender-deep">{formatMonthYear(entry.date)}</time>
          <span className={cn("chip", meta.className)}>{meta.label}</span>
        </div>
        <h3 className="mt-1 font-display text-lg font-bold text-ink dark:text-[#efe6ee]">{entry.title}</h3>
        {entry.description && (
          <div className="mt-1 text-sm">
            <Markdown>{entry.description}</Markdown>
          </div>
        )}
      </div>
    </li>
  );
}
