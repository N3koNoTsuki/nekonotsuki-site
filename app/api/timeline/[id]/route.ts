import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, badRequest, ok, notFound } from "@/lib/api";
import { timelineSchema } from "@/lib/validators";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { error } = await requireAuth();
  if (error) return error;

  const parsed = timelineSchema.partial().safeParse(await req.json());
  if (!parsed.success) return badRequest("Données invalides", parsed.error.flatten());

  try {
    const entry = await prisma.timelineEntry.update({ where: { id: params.id }, data: parsed.data });
    return ok(entry);
  } catch {
    return notFound("Entrée introuvable");
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    await prisma.timelineEntry.delete({ where: { id: params.id } });
    return ok({ ok: true });
  } catch {
    return notFound("Entrée introuvable");
  }
}
