import type { Metadata } from "next";
import { getAllProjects } from "@/lib/data";
import { PageHeader, EmptyState } from "@/components/ui";
import Reveal from "@/components/Reveal";
import LanguageDonut from "@/components/LanguageDonut";
import { fetchRepoData } from "@/lib/github";
import { toLangStats, averageLangStats, langColor } from "@/lib/languages";
import { parseTags } from "@/lib/utils";

export const metadata: Metadata = { title: "Compétences" };

// ISR: re-fetch the GitHub language data ~hourly.
export const revalidate = 3600;

export default async function CompetencesPage() {
  const projects = await getAllProjects();

  // Same GitHub language data as /projets (deduped at build). Averaged per
  // project so one vendored-heavy repo doesn't dominate the donut.
  const repoData = await Promise.all(projects.map((p) => fetchRepoData(p.githubUrl)));
  const perProject = repoData.map((d) => (d?.languages ? toLangStats(d.languages) : []));
  const skills = averageLangStats(perProject);

  const allTags = Array.from(new Set(projects.flatMap((p) => parseTags(p.tags)))).sort((a, b) =>
    a.localeCompare(b, "fr"),
  );

  return (
    <div>
      <PageHeader emoji="🧠" title="Compétences" subtitle="Les langages et technos de mes projets" />

      {skills.length === 0 ? (
        <EmptyState>Les statistiques arrivent bientôt. 🛠️</EmptyState>
      ) : (
        <Reveal>
          <section className="kawaii-card p-6 md:p-8">
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
                    <span className="font-semibold text-ink dark:text-[#efe6ee]">{s.name}</span>
                    <span className="ml-auto tabular-nums text-ink/55 dark:text-[#efe6ee]/55">
                      {s.pct.toFixed(1)} %
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <p className="mt-5 text-xs text-ink/50 dark:text-[#efe6ee]/50">
              Moyenne par projet (chaque projet compte autant), d’après l’analyse des langages GitHub.
            </p>
          </section>
        </Reveal>
      )}

      {allTags.length > 0 && (
        <Reveal delay={80}>
          <section className="mt-8">
            <h2 className="mb-3 font-display text-xl font-bold text-lavender-deep">
              <span className="mr-1" aria-hidden>
                🛠️
              </span>
              Technologies &amp; sujets
            </h2>
            <div className="flex flex-wrap gap-2">
              {allTags.map((t) => (
                <span key={t} className="chip bg-lavender-soft text-lavender-deep">
                  {t}
                </span>
              ))}
            </div>
          </section>
        </Reveal>
      )}
    </div>
  );
}
