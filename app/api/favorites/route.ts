import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, badRequest, ok } from "@/lib/api";
import { favoriteSchema } from "@/lib/validators";

export async function GET() {
  const favorites = await prisma.favorite.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    include: { category: true },
  });
  return ok(favorites);
}

export async function POST(req: NextRequest) {
  const { error } = await requireAuth();
  if (error) return error;

  const parsed = favoriteSchema.safeParse(await req.json());
  if (!parsed.success) return badRequest("Données invalides", parsed.error.flatten());

  const category = await prisma.category.findUnique({ where: { id: parsed.data.categoryId } });
  if (!category) return badRequest("Catégorie inexistante");

  const max = await prisma.favorite.aggregate({
    where: { categoryId: parsed.data.categoryId },
    _max: { order: true },
  });
  const favorite = await prisma.favorite.create({
    data: { ...parsed.data, order: (max._max.order ?? -1) + 1 },
  });
  return ok(favorite, 201);
}
