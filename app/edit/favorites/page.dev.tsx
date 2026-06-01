import FavoritesManager from "@/components/admin/FavoritesManager";
import { readCategories, readFavorites } from "@/lib/content";
import type { CategoryDTO, FavoriteDTO } from "@/lib/types";

export default async function EditFavoritesPage() {
  const [categories, favorites] = await Promise.all([readCategories(), readFavorites()]);

  const initialCategories: CategoryDTO[] = [...categories]
    .sort((a, b) => a.order - b.order)
    .map((c) => ({ id: c.id, name: c.name, slug: c.slug, icon: c.icon, order: c.order }));

  const initialFavorites: FavoriteDTO[] = [...favorites]
    .sort((a, b) => a.order - b.order || b.createdAt.localeCompare(a.createdAt))
    .map((f) => ({
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
