import { NextRequest } from "next/server";
import { readProjects, writeProjects, newId, type Project } from "@/lib/content";
import { badRequest, ok } from "@/lib/api";
import { projectSchema } from "@/lib/validators";

export async function GET() {
  const projects = (await readProjects()).sort((a, b) => a.order - b.order);
  return ok(projects);
}

export async function POST(req: NextRequest) {
  const parsed = projectSchema.safeParse(await req.json());
  if (!parsed.success) return badRequest("Données invalides", parsed.error.flatten());

  const projects = await readProjects();
  const maxOrder = projects.reduce((m, p) => Math.max(m, p.order), -1);
  const d = parsed.data;
  const project: Project = {
    id: newId(),
    title: d.title,
    coverUrl: d.coverUrl ?? null,
    description: d.description ?? null,
    tags: d.tags ?? "",
    githubUrl: d.githubUrl ?? null,
    demoUrl: d.demoUrl ?? null,
    featured: d.featured ?? false,
    order: maxOrder + 1,
    createdAt: new Date().toISOString(),
  };
  projects.push(project);
  await writeProjects(projects);
  return ok(project, 201);
}
