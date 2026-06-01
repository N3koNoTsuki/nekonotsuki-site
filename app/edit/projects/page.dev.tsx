import ProjectsManager from "@/components/admin/ProjectsManager";
import { getAllProjects } from "@/lib/data";
import type { ProjectDTO } from "@/lib/types";

export default async function EditProjectsPage() {
  const projects = await getAllProjects();
  const initial: ProjectDTO[] = projects.map((p) => ({
    id: p.id,
    title: p.title,
    coverUrl: p.coverUrl,
    description: p.description,
    tags: p.tags,
    githubUrl: p.githubUrl,
    demoUrl: p.demoUrl,
    featured: p.featured,
    order: p.order,
  }));

  return <ProjectsManager initial={initial} />;
}
