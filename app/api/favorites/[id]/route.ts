import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, badRequest, ok, notFound } from "@/lib/api";
import { favoriteSchema } from "@/lib/validators";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { error } = await requireAuth();
  if (error) return error;

  const parsed = favoriteSchema.partial().safeParse(await req.json());
  if (!parsed.success) return badRequest("Données invalides", parsed.error.flatten());

  try {
    const favorite = await prisma.favorite.update({ where: { id: params.id }, data: parsed.data });
    return ok(favorite);
  } catch {
    return notFound("Favori introuvable");
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    await prisma.favorite.delete({ where: { id: params.id } });
    return ok({ ok: true });
  } catch {
    return notFound("Favori introuvable");
  }
}
