import type { Metadata } from "next";
import { getAllProjects } from "@/lib/data";
import { ProjectCard } from "@/components/ProjectCard";
import { PageHeader, EmptyState } from "@/components/ui";
import Reveal from "@/components/Reveal";
import ProjectsFilter from "@/components/ProjectsFilter";
import LanguageDonut from "@/components/LanguageDonut";
import { fetchRepoData, fetchRepoReadme } from "@/lib/github";
import { toLangStats, mergeLangBytes, averageLangStats, langColor } from "@/lib/languages";
import { parseTags } from "@/lib/utils";

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

  // Merged-in /competences data: per-language average (one project = one vote)
  // and the tag cloud across all projects.
  const skills = averageLangStats(statsByProject);
  const allTags = Array.from(new Set(projects.flatMap((p) => parseTags(p.tags)))).sort((a, b) =>
    a.localeCompare(b, "fr"),
  );

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
              {/* La répartition détaillée des langages vit dans la section
                  Compétences (donut) juste en dessous — pas de double barre ici. */}
            </section>
          )}

          {/* Compétences en tête de page — synthèse avant la grille (fusion de
              l'ancienne /competences ; l'ancre sert au redirect de next.config.mjs). */}
          {skills.length > 0 && (
            <section id="competences" className="mb-10 scroll-mt-24">
              <Reveal>
                <h2 className="mb-4 font-display text-2xl font-bold text-lavender-deep">
                  <span className="mr-1" aria-hidden>
                    🧠
                  </span>
                  Compétences
                </h2>
                <div className="kawaii-card p-6 md:p-8">
                  <div className="flex flex-col items-center gap-8 md:flex-row md:gap-10">
                    <LanguageDonut stats={skills} />
                    <ul className="w-full flex-1 space-y-2">
                      {skills.map((s) => (
                        <li key={s.name} className="flex items-center gap-2 text-sm">
                          <span
                            className="h-3 w-3 shrink-0 rounded-full"
                            style={{ backgroundColor: langColor(s.name) }}
                            aria-hidden
                          />
                          <span className="font-semibold text-ink dark:text-nightink">{s.name}</span>
                          <span className="ml-auto tabular-nums text-ink/55 dark:text-nightink/55">
                            {s.pct.toFixed(1)} %
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <p className="mt-5 text-xs text-ink/50 dark:text-nightink/50">
                    Moyenne par projet (chaque projet compte autant), d’après l’analyse des langages GitHub.
                  </p>
                </div>
              </Reveal>

              {allTags.length > 0 && (
                <Reveal delay={80}>
                  <div className="mt-8">
                    <h3 className="mb-3 font-display text-xl font-bold text-lavender-deep">
                      <span className="mr-1" aria-hidden>
                        🛠️
                      </span>
                      Technologies &amp; sujets
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {allTags.map((t) => (
                        <span key={t} className="chip bg-lavender-soft text-lavender-deep">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </Reveal>
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
