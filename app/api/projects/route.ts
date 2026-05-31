import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, badRequest, ok } from "@/lib/api";
import { projectSchema } from "@/lib/validators";

export async function GET() {
  const projects = await prisma.project.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  });
  return ok(projects);
}

export async function POST(req: NextRequest) {
  const { error } = await requireAuth();
  if (error) return error;

  const parsed = projectSchema.safeParse(await req.json());
  if (!parsed.success) return badRequest("Données invalides", parsed.error.flatten());

  const max = await prisma.project.aggregate({ _max: { order: true } });
  const project = await prisma.project.create({
    data: { ...parsed.data, order: (max._max.order ?? -1) + 1 },
  });
  return ok(project, 201);
}
