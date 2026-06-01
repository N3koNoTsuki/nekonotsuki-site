import type { Metadata } from "next";
import { getAllProjects } from "@/lib/data";
import { ProjectCard } from "@/components/cards";
import { PageHeader, EmptyState } from "@/components/ui";
import Reveal from "@/components/Reveal";
import ProjectsFilter from "@/components/ProjectsFilter";
import { parseTags } from "@/lib/utils";

export const metadata: Metadata = { title: "Projets" };

export default async function ProjectsPage() {
  const projects = await getAllProjects();
  const allTags = Array.from(new Set(projects.flatMap((p) => parseTags(p.tags)))).sort((a, b) =>
    a.localeCompare(b, "fr"),
  );

  return (
    <div>
      <PageHeader emoji="✨" title="Mes projets" subtitle="Quelques créations dont je suis fière" />

      {projects.length === 0 ? (
        <EmptyState>Aucun projet pour l’instant. Bientôt ! 🚧</EmptyState>
      ) : (
        <ProjectsFilter allTags={allTags} itemTags={projects.map((p) => parseTags(p.tags))}>
          {projects.map((p, i) => (
            <Reveal key={p.id} delay={i * 60}>
              <ProjectCard project={p} />
            </Reveal>
          ))}
        </ProjectsFilter>
      )}
    </div>
  );
}
