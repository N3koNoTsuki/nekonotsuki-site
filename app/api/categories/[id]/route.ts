import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, badRequest, ok, notFound } from "@/lib/api";
import { categorySchema } from "@/lib/validators";
import { slugify } from "@/lib/utils";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { error } = await requireAuth();
  if (error) return error;

  const parsed = categorySchema.partial().safeParse(await req.json());
  if (!parsed.success) return badRequest("Données invalides", parsed.error.flatten());

  const data: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.slug) {
    data.slug = slugify(parsed.data.slug);
  }

  try {
    const category = await prisma.category.update({ where: { id: params.id }, data });
    return ok(category);
  } catch {
    return notFound("Catégorie introuvable");
  }
}

// Cascade deletes the favorites in this category (see schema onDelete: Cascade)
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    await prisma.category.delete({ where: { id: params.id } });
    return ok({ ok: true });
  } catch {
    return notFound("Catégorie introuvable");
  }
}
