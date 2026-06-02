import { NextRequest } from "next/server";
import { readFavorites, writeFavorites, readCategories, newId, type Favorite } from "@/lib/content";
import { badRequest, ok } from "@/lib/api";
import { favoriteSchema } from "@/lib/validators";

export async function GET() {
  const [favorites, categories] = await Promise.all([readFavorites(), readCategories()]);
  const byId = new Map(categories.map((c) => [c.id, c]));
  const withCategory = [...favorites]
    .sort((a, b) => a.order - b.order || b.createdAt.localeCompare(a.createdAt))
    .map((f) => ({ ...f, category: byId.get(f.categoryId) ?? null }));
  return ok(withCategory);
}

export async function POST(req: NextRequest) {
  const parsed = favoriteSchema.safeParse(await req.json());
  if (!parsed.success) return badRequest("Données invalides", parsed.error.flatten());

  const categories = await readCategories();
  if (!categories.some((c) => c.id === parsed.data.categoryId)) {
    return badRequest("Catégorie inexistante");
  }

  const favorites = await readFavorites();
  const maxOrder = favorites
    .filter((f) => f.categoryId === parsed.data.categoryId)
    .reduce((m, f) => Math.max(m, f.order), -1);
  const d = parsed.data;
  const favorite: Favorite = {
    id: newId(),
    title: d.title,
    imageUrl: d.imageUrl ?? null,
    description: d.description ?? null,
    details: d.details ?? null,
    rating: d.rating ?? null,
    comment: d.comment ?? null,
    order: maxOrder + 1,
    categoryId: d.categoryId,
    createdAt: new Date().toISOString(),
  };
  favorites.push(favorite);
  await writeFavorites(favorites);
  return ok(favorite, 201);
}
