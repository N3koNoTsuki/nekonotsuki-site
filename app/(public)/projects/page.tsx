import type { Metadata } from "next";
import Link from "next/link";
import { getAllProjects } from "@/lib/data";
import { ProjectCard } from "@/components/cards";
import { PageHeader, EmptyState } from "@/components/ui";
import Reveal from "@/components/Reveal";
import { parseTags, cn } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Projets" };

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: { tag?: string };
}) {
  const projects = await getAllProjects();
  const activeTag = searchParams.tag;

  // Collect the set of all tags for the filter bar
  const allTags = Array.from(new Set(projects.flatMap((p) => parseTags(p.tags)))).sort((a, b) =>
    a.localeCompare(b, "fr"),
  );

  const filtered = activeTag
    ? projects.filter((p) => parseTags(p.tags).includes(activeTag))
    : projects;

  return (
    <div>
      <PageHeader emoji="✨" title="Mes projets" subtitle="Quelques créations dont je suis fière" />

      {/* Tag filter — plain links, works without JS via ?tag= */}
      {allTags.length > 0 && (
        <nav className="mb-8 flex flex-wrap justify-center gap-2">
          <Link
            href="/projects"
            className={cn("chip transition", !activeTag ? "bg-rose-deep text-white shadow-soft" : "bg-lavender-soft text-lavender-deep hover:bg-lavender")}
          >
            Tout
          </Link>
          {allTags.map((tag) => (
            <Link
              key={tag}
              href={`/projects?tag=${encodeURIComponent(tag)}`}
              className={cn(
                "chip transition",
                activeTag === tag ? "bg-rose-deep text-white shadow-soft" : "bg-lavender-soft text-lavender-deep hover:bg-lavender",
              )}
            >
              {tag}
            </Link>
          ))}
        </nav>
      )}

      {filtered.length === 0 ? (
        <EmptyState>
          {activeTag ? (
            <>
              Aucun projet avec le tag « {activeTag} ».{" "}
              <Link href="/projects" className="font-semibold text-rose-deep underline">
                Tout voir
              </Link>
            </>
          ) : (
            "Aucun projet pour l’instant. Bientôt ! 🚧"
          )}
        </EmptyState>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p, i) => (
            <Reveal key={p.id} delay={i * 60}>
              <ProjectCard project={p} />
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}
