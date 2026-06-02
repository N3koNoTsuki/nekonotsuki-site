import Link from "next/link";
import {
  getHomeBlocks,
  getLatestProjects,
  getLatestFavorites,
  getLatestTimeline,
} from "@/lib/data";
import Markdown from "@/components/Markdown";
import Reveal from "@/components/Reveal";
import { TimelineItem } from "@/components/cards";
import { ProjectCard } from "@/components/ProjectCard";
import { FavoriteCard } from "@/components/FavoriteCard";
import { EmptyState } from "@/components/ui";

function blockCount(config: string | null, fallback: number): number {
  if (!config) return fallback;
  try {
    const parsed = JSON.parse(config);
    return typeof parsed.count === "number" ? parsed.count : fallback;
  } catch {
    return fallback;
  }
}

function SectionHeading({ title, href, cta }: { title?: string | null; href?: string; cta?: string }) {
  if (!title) return null;
  return (
    <div className="mb-4 flex items-end justify-between">
      <h2 className="font-display text-2xl font-bold text-lavender-deep">{title}</h2>
      {href && (
        <Link href={href} className="text-sm font-semibold text-rose-deep hover:underline">
          {cta ?? "Voir tout"} →
        </Link>
      )}
    </div>
  );
}

function IntroBlock({ title, content }: { title?: string | null; content?: string | null }) {
  return (
    <section className="glass overflow-hidden p-8 text-center md:p-12">
      <div className="mb-2 animate-float text-5xl" aria-hidden>
        🐱
      </div>
      {title && <h1 className="font-display text-4xl font-bold text-rose-deep md:text-5xl">{title}</h1>}
      {content && (
        <div className="mx-auto mt-4 max-w-2xl text-center">
          <Markdown>{content}</Markdown>
        </div>
      )}
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link href="/projects" className="btn-primary">
          Voir mes projets ✨
        </Link>
        <Link href="/about" className="btn-secondary">
          En savoir plus
        </Link>
      </div>
    </section>
  );
}

function CustomBlock({ title, content }: { title?: string | null; content?: string | null }) {
  return (
    <section className="kawaii-card p-6 md:p-8">
      {title && <h2 className="mb-3 font-display text-2xl font-bold text-lavender-deep">{title}</h2>}
      {content && <Markdown>{content}</Markdown>}
    </section>
  );
}

export default async function HomePage() {
  const blocks = await getHomeBlocks();

  if (blocks.length === 0) {
    return <EmptyState>Aucun bloc configuré pour l’instant. Ajoute-en depuis l’admin ! ♡</EmptyState>;
  }

  // Resolve every block's data first, then render synchronously.
  const rendered = await Promise.all(
    blocks.map(async (block) => {
      switch (block.type) {
        case "intro":
          return <IntroBlock title={block.title} content={block.content} />;

        case "latest-projects": {
          const projects = await getLatestProjects(blockCount(block.config, 3));
          if (projects.length === 0) return null;
          return (
            <section>
              <SectionHeading title={block.title} href="/projects" />
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {projects.map((p) => (
                  <ProjectCard key={p.id} project={p} />
                ))}
              </div>
            </section>
          );
        }

        case "latest-favorites": {
          const favorites = await getLatestFavorites(blockCount(block.config, 4));
          if (favorites.length === 0) return null;
          return (
            <section>
              <SectionHeading title={block.title} href="/favorites" />
              <div className="grid gap-4 sm:grid-cols-2">
                {favorites.map((f) => (
                  <FavoriteCard key={f.id} favorite={f} showCategory />
                ))}
              </div>
            </section>
          );
        }

        case "latest-timeline": {
          const entries = await getLatestTimeline(blockCount(block.config, 1));
          if (entries.length === 0) return null;
          return (
            <section>
              <SectionHeading title={block.title} href="/timeline" cta="Tout le parcours" />
              <ul className="space-y-6">
                {entries.map((e, i) => (
                  <TimelineItem key={e.id} entry={e} last={i === entries.length - 1} />
                ))}
              </ul>
            </section>
          );
        }

        case "custom":
          return <CustomBlock title={block.title} content={block.content} />;

        default:
          return null;
      }
    }),
  );

  return (
    <div className="space-y-12">
      {blocks.map((block, i) =>
        rendered[i] ? (
          <Reveal key={block.id} delay={i * 80}>
            {rendered[i]}
          </Reveal>
        ) : null,
      )}
    </div>
  );
}
