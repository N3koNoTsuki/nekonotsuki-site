import type { Metadata } from "next";
import { getAllProjects } from "@/lib/data";
import { ProjectCard } from "@/components/cards";
import { PageHeader, EmptyState } from "@/components/ui";
import Reveal from "@/components/Reveal";
import ProjectsFilter from "@/components/ProjectsFilter";
import LanguageBar from "@/components/LanguageBar";
import { fetchRepoLanguages } from "@/lib/github";
import { toLangStats, mergeLangBytes } from "@/lib/languages";

export const metadata: Metadata = { title: "Projets" };

export default async function ProjectsPage() {
  const projects = await getAllProjects();

  // Language stats from GitHub, fetched at build time (one request per repo)
  // and baked into the static HTML. Per-project + an aggregate total.
  const bytesByProject = await Promise.all(projects.map((p) => fetchRepoLanguages(p.githubUrl)));
  const statsByProject = bytesByProject.map((bytes) => (bytes ? toLangStats(bytes) : []));
  const totalStats = toLangStats(mergeLangBytes(bytesByProject));

  // Per-item search haystack (title + tags + description + detected languages),
  // aligned by index — so searching "vhdl" or "assembly" matches too.
  const searchText = projects.map((p, i) =>
    [p.title, p.tags, p.description ?? "", statsByProject[i].map((s) => s.name).join(" ")]
      .join(" ")
      .toLowerCase(),
  );

  return (
    <div>
      <PageHeader emoji="✨" title="Mes projets" subtitle="Quelques créations dont je suis fière" />

      {projects.length === 0 ? (
        <EmptyState>Aucun projet pour l’instant. Bientôt ! 🚧</EmptyState>
      ) : (
        <>
          {totalStats.length > 0 && (
            <section className="kawaii-card mb-8 p-5">
              <div className="mb-3 flex items-center justify-between gap-2">
                <h2 className="font-display text-lg font-bold text-lavender-deep">Langages — tous projets</h2>
                <span className="text-xs text-ink/50 dark:text-[#efe6ee]/50">
                  {totalStats.length} langage{totalStats.length > 1 ? "s" : ""}
                </span>
              </div>
              <LanguageBar stats={totalStats} barClassName="h-2.5" />
            </section>
          )}

          <ProjectsFilter searchText={searchText}>
            {projects.map((p, i) => (
              <Reveal key={p.id} delay={i * 60}>
                <ProjectCard project={p} languages={statsByProject[i]} />
              </Reveal>
            ))}
          </ProjectsFilter>
        </>
      )}
    </div>
  );
}
