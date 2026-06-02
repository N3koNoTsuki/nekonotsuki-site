import type { Metadata } from "next";
import { getAllProjects } from "@/lib/data";
import { ProjectCard } from "@/components/ProjectCard";
import { PageHeader, EmptyState } from "@/components/ui";
import Reveal from "@/components/Reveal";
import ProjectsFilter from "@/components/ProjectsFilter";
import LanguageBar from "@/components/LanguageBar";
import { fetchRepoData, fetchRepoReadme } from "@/lib/github";
import { toLangStats, mergeLangBytes } from "@/lib/languages";

export const metadata: Metadata = { title: "Projets" };

// ISR: re-fetch the GitHub data (stars, last commit, languages, README) ~hourly.
export const revalidate = 3600;

export default async function ProjectsPage() {
  const projects = await getAllProjects();

  // GitHub data (stars, last push, languages, README), fetched at build time
  // and baked into the static HTML. Per-project + aggregate totals.
  const [repoData, readmes] = await Promise.all([
    Promise.all(projects.map((p) => fetchRepoData(p.githubUrl))),
    Promise.all(projects.map((p) => fetchRepoReadme(p.githubUrl))),
  ]);
  const statsByProject = repoData.map((d) => (d?.languages ? toLangStats(d.languages) : []));
  const totalStats = toLangStats(mergeLangBytes(repoData.map((d) => d?.languages)));
  const totalStars = repoData.reduce((sum, d) => sum + (d?.stars ?? 0), 0);
  const repoCount = repoData.filter((d) => d !== null).length;

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
          {repoCount > 0 && (
            <section className="kawaii-card mb-8 p-5">
              <h2 className="font-display text-lg font-bold text-lavender-deep">Mes projets en chiffres</h2>
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                <span className="chip bg-lavender-soft text-lavender-deep">⭐ {totalStars} étoile{totalStars > 1 ? "s" : ""}</span>
                <span className="chip bg-lavender-soft text-lavender-deep">📦 {repoCount} repo{repoCount > 1 ? "s" : ""}</span>
                <span className="chip bg-lavender-soft text-lavender-deep">🎨 {totalStats.length} langage{totalStats.length > 1 ? "s" : ""}</span>
              </div>
              {totalStats.length > 0 && (
                <div className="mt-4">
                  <LanguageBar stats={totalStats} barClassName="h-2.5" />
                </div>
              )}
            </section>
          )}

          <ProjectsFilter searchText={searchText}>
            {projects.map((p, i) => (
              <Reveal key={p.id} delay={i * 60}>
                <ProjectCard
                  project={p}
                  languages={statsByProject[i]}
                  stars={repoData[i]?.stars}
                  lastPush={repoData[i]?.pushedAt}
                  readme={readmes[i]}
                />
              </Reveal>
            ))}
          </ProjectsFilter>
        </>
      )}
    </div>
  );
}
