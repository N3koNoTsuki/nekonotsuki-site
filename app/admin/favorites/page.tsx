import { prisma } from "@/lib/prisma";
import FavoritesManager from "@/components/admin/FavoritesManager";
import type { CategoryDTO, FavoriteDTO } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminFavoritesPage() {
  const [categories, favorites] = await Promise.all([
    prisma.category.findMany({ orderBy: { order: "asc" } }),
    prisma.favorite.findMany({ orderBy: [{ order: "asc" }, { createdAt: "desc" }] }),
  ]);

  const initialCategories: CategoryDTO[] = categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    icon: c.icon,
    order: c.order,
  }));

  const initialFavorites: FavoriteDTO[] = favorites.map((f) => ({
    id: f.id,
    title: f.title,
    imageUrl: f.imageUrl,
    description: f.description,
    rating: f.rating,
    comment: f.comment,
    order: f.order,
    categoryId: f.categoryId,
  }));

  return <FavoritesManager initialCategories={initialCategories} initialFavorites={initialFavorites} />;
}
