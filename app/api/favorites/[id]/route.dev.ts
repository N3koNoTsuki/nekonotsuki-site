import { NextRequest } from "next/server";
import { readFavorites, writeFavorites } from "@/lib/content";
import { badRequest, ok, notFound } from "@/lib/api";
import { favoriteSchema } from "@/lib/validators";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const parsed = favoriteSchema.partial().safeParse(await req.json());
  if (!parsed.success) return badRequest("Données invalides", parsed.error.flatten());

  const favorites = await readFavorites();
  const idx = favorites.findIndex((f) => f.id === params.id);
  if (idx === -1) return notFound("Favori introuvable");

  const d = parsed.data;
  favorites[idx] = {
    ...favorites[idx],
    ...(d.title !== undefined ? { title: d.title } : {}),
    ...(d.categoryId !== undefined ? { categoryId: d.categoryId } : {}),
    ...(d.imageUrl !== undefined ? { imageUrl: d.imageUrl ?? null } : {}),
    ...(d.description !== undefined ? { description: d.description ?? null } : {}),
    ...(d.details !== undefined ? { details: d.details ?? null } : {}),
    ...(d.rating !== undefined ? { rating: d.rating ?? null } : {}),
    ...(d.comment !== undefined ? { comment: d.comment ?? null } : {}),
  };
  await writeFavorites(favorites);
  return ok(favorites[idx]);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const favorites = await readFavorites();
  const next = favorites.filter((f) => f.id !== params.id);
  if (next.length === favorites.length) return notFound("Favori introuvable");
  await writeFavorites(next);
  return ok({ ok: true });
}
