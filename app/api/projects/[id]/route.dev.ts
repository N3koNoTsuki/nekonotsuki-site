import { NextRequest } from "next/server";
import { readProjects, writeProjects } from "@/lib/content";
import { badRequest, ok, notFound } from "@/lib/api";
import { projectSchema } from "@/lib/validators";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const parsed = projectSchema.partial().safeParse(await req.json());
  if (!parsed.success) return badRequest("Données invalides", parsed.error.flatten());

  const projects = await readProjects();
  const idx = projects.findIndex((p) => p.id === params.id);
  if (idx === -1) return notFound("Projet introuvable");

  const d = parsed.data;
  projects[idx] = {
    ...projects[idx],
    ...(d.title !== undefined ? { title: d.title } : {}),
    ...(d.coverUrl !== undefined ? { coverUrl: d.coverUrl ?? null } : {}),
    ...(d.description !== undefined ? { description: d.description ?? null } : {}),
    ...(d.tags !== undefined ? { tags: d.tags } : {}),
    ...(d.githubUrl !== undefined ? { githubUrl: d.githubUrl ?? null } : {}),
    ...(d.demoUrl !== undefined ? { demoUrl: d.demoUrl ?? null } : {}),
    ...(d.featured !== undefined ? { featured: d.featured } : {}),
  };
  await writeProjects(projects);
  return ok(projects[idx]);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const projects = await readProjects();
  const next = projects.filter((p) => p.id !== params.id);
  if (next.length === projects.length) return notFound("Projet introuvable");
  await writeProjects(next);
  return ok({ ok: true });
}
